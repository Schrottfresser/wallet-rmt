import crypto from 'crypto';
import env, { APP_URL } from '@server/env.js';
import BadRequestError from '@server/error/badRequestError.js';
import InternalServerError from '@server/error/internalServerError.js';
import User, { UserDoc } from '@server/model/mongoose/user.js';
import WebAuthnChallenge, { WebAuthnChallengePurpose } from '@server/model/mongoose/webAuthnChallenge.js';
import {
    RegistrationResponseJSON,
    AuthenticationResponseJSON,
    generateRegistrationOptions as generateRegistrationOptionsWebAuthn,
    verifyRegistrationResponse as verifyRegistrationResponseWebAuthn,
    generateAuthenticationOptions as generateAuthenticationOptionsWebAuthn,
    verifyAuthenticationResponse as verifyAuthenticationResponseWebAuthn,
    WebAuthnCredential,
} from '@simplewebauthn/server';
import { isoBase64URL } from '@simplewebauthn/server/helpers';
import { generateMnemonic } from 'bip39';
import {
    deriveAESKeyFromMnemonic,
    deriveAESKeyFromPRF,
    exportMasterKeyData,
    unwrapMasterKey,
    wrapMasterKey,
} from '@server/util/crypto.js';
import { isUserData } from '@server/util/userData.js';
import UnauthorizedError from '@server/error/unauthorizedError.js';

export async function isUsernameAvailable(username: string) {
    const user = await User.find({ username });

    return !!user;
}

export async function generateRegistrationOptions(username: string) {
    const optionsWebAuthn = await generateRegistrationOptionsWebAuthn({
        rpName: env.appName,
        rpID: APP_URL,
        userName: username,
        attestationType: 'none',
        authenticatorSelection: {
            residentKey: 'preferred',
            userVerification: 'preferred',
        },
    });

    const options = {
        ...optionsWebAuthn,
        extensions: {
            prf: {},
        },
    };

    await WebAuthnChallenge.findOneAndUpdate(
        { username, purpose: 'registration' },
        { challenge: options.challenge },
        { upsert: true },
    );

    return options;
}

export async function verifyRegistrationResponse(username: string, response: RegistrationResponseJSON) {
    const challenge = await WebAuthnChallenge.findOne({ username, purpose: 'registration' });
    if (!challenge) {
        throw new InternalServerError('No challenge found');
    }

    const { verified, registrationInfo } = await verifyRegistrationResponseWebAuthn({
        response,
        expectedChallenge: challenge.challenge,
        expectedOrigin: `${env.protocol}://${env.host}`,
        expectedRPID: APP_URL,
    });

    if (!verified) {
        throw new BadRequestError('Verification failed');
    }

    await challenge.deleteOne();

    return registrationInfo;
}

export async function register(username: string, credential: WebAuthnCredential, addPasskey?: boolean) {
    let user: UserDoc | null;
    if (addPasskey) {
        user = await User.findOne({ username });
        if (!user) {
            throw new BadRequestError('User not found');
        }
    } else {
        user = await User.create({
            username,
        });
    }

    user.keySlots.set(credential.id, {
        type: 'webauthn',
        data: {
            id: credential.id,
            publicKey: Buffer.from(credential.publicKey),
            counter: credential.counter,
        },
    });
    await user.save();

    return user;
}

export async function generateAuthenticationOptions(
    username: string,
    challengePurpose: WebAuthnChallengePurpose,
    allowCredentialId?: string,
) {
    const user = await User.findOne({ username });
    if (!user) {
        throw new BadRequestError('User not found');
    }

    let allowCredentials = Array.from(
        user.keySlots
            .values()
            .filter((keySlot) => keySlot.type === 'webauthn' && keySlot.data)
            .map((keySlot) => ({
                id: keySlot.data!.id,
            })),
    );

    if (allowCredentialId) {
        allowCredentials = allowCredentials.filter((credential) => credential.id === allowCredentialId);
    }

    if (!allowCredentials.length) {
        throw new InternalServerError('No valid credential found');
    }

    const optionsWebAuthn = await generateAuthenticationOptionsWebAuthn({
        rpID: APP_URL,
        allowCredentials,
        userVerification: 'preferred',
    });

    if (!user.prfSalt) {
        user.prfSalt = Buffer.from(crypto.randomBytes(32));
        await user.save();
    }

    const prfSaltBase64URL = isoBase64URL.fromBuffer(new Uint8Array(user.prfSalt));
    const options = {
        ...optionsWebAuthn,
        extensions: {
            prf: {
                eval: {
                    first: prfSaltBase64URL,
                },
            },
        },
    };

    await WebAuthnChallenge.findOneAndUpdate(
        { username, purpose: challengePurpose },
        { challenge: options.challenge },
        { upsert: true },
    );

    return options;
}

export async function verifyAuthenticationResponse(
    username: string,
    response: AuthenticationResponseJSON,
    challengePurpose: WebAuthnChallengePurpose,
) {
    const user = await User.findOne({ username });
    if (!user) {
        throw new BadRequestError('User not found');
    }

    const challenge = await WebAuthnChallenge.findOne({ username, purpose: challengePurpose });
    if (!challenge) {
        throw new InternalServerError('No challenge found');
    }

    const passkey = user.keySlots.values().find((keySlot) => keySlot.data?.id === response.id)?.data;
    if (!passkey) {
        throw new InternalServerError('No credential found');
    }

    const { verified, authenticationInfo } = await verifyAuthenticationResponseWebAuthn({
        response,
        expectedChallenge: challenge.challenge,
        expectedOrigin: `${env.protocol}://${env.host}`,
        expectedRPID: APP_URL,
        credential: {
            id: passkey.id,
            publicKey: new Uint8Array(passkey.publicKey),
            counter: passkey.counter,
        },
    });

    passkey.counter = authenticationInfo.newCounter;
    await user.save();

    if (!verified) {
        throw new BadRequestError('Verification failed');
    }

    await challenge.deleteOne();

    return authenticationInfo;
}

export async function login(username: string, credentialId: string, prf: Uint8Array) {
    const user = await User.findOne({ username });
    if (!user) {
        throw new BadRequestError('User not found');
    }

    let mnemonic: string | undefined;
    const firstLogin = !(await isUserData(username));
    if (firstLogin) {
        const masterKey = crypto.randomBytes(32);

        mnemonic = await setupMnemonicBackupWrappedMasterKey(username, masterKey);
        await addPrfWrappedMasterKey(username, credentialId, prf, masterKey);
    }

    return { user, mnemonic };
}

export async function addPassphrase(
    username: string,
    credentialId: string,
    prf: Uint8Array,
    addCredentialId: string,
    addPrf: Uint8Array,
) {
    const user = await User.findOne({ username });
    if (!user) {
        throw new BadRequestError('User not found');
    }

    const keySlot = user.keySlots.get(credentialId);
    if (!keySlot || !keySlot.salt || !keySlot.ciphertext || !keySlot.iv) {
        throw new UnauthorizedError('Invalid credential');
    }

    const prfKey = await deriveAESKeyFromPRF(prf, keySlot.salt);
    const masterKey = await unwrapMasterKey({ ciphertext: keySlot.ciphertext, iv: keySlot.iv }, prfKey);
    const masterKeyData = await exportMasterKeyData(masterKey);

    await addPrfWrappedMasterKey(username, addCredentialId, addPrf, masterKeyData);

    return user;
}

async function setupMnemonicBackupWrappedMasterKey(username: string, masterKey: Uint8Array) {
    const user = await User.findOne({ username });
    if (!user) {
        throw new BadRequestError('User not found');
    }

    const mnemonic = generateMnemonic(256);
    const backupKey = await deriveAESKeyFromMnemonic(mnemonic);
    const backupWrappedMasterKey = await wrapMasterKey(masterKey, backupKey);

    user.keySlots.set('backup', {
        type: 'mnemonic',
        ciphertext: Buffer.from(backupWrappedMasterKey.ciphertext),
        iv: Buffer.from(backupWrappedMasterKey.iv),
    });
    await user.save();

    return mnemonic;
}

async function addPrfWrappedMasterKey(username: string, credentialId: string, prf: Uint8Array, masterKey: Uint8Array) {
    const user = await User.findOne({ username });
    if (!user) {
        throw new BadRequestError('User not found');
    }

    const salt = crypto.randomBytes(32);
    const prfKey = await deriveAESKeyFromPRF(prf, salt);
    const prfWrappedMasterKey = await wrapMasterKey(masterKey, prfKey);

    const keySlot = user.keySlots.get(credentialId);
    if (!keySlot) {
        throw new InternalServerError('Key slot not found');
    }

    keySlot.ciphertext = Buffer.from(prfWrappedMasterKey.ciphertext);
    keySlot.iv = Buffer.from(prfWrappedMasterKey.iv);
    keySlot.salt = Buffer.from(salt);
    await user.save();
}
