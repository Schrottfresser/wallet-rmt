import crypto from 'crypto';
import env, { APP_URL } from '@server/env.js';
import BadRequestError from '@server/error/badRequestError.js';
import InternalServerError from '@server/error/internalServerError.js';
import User from '@server/model/user.js';
import WebAuthnChallenge from '@server/model/webAuthnChallenge.js';
import WebAuthnCredential, { IWebAuthnCredential } from '@server/model/webAuthnCredential.js';
import {
    RegistrationResponseJSON,
    AuthenticationResponseJSON,
    generateRegistrationOptions as generateRegistrationOptionsWebAuthn,
    verifyRegistrationResponse as verifyRegistrationResponseWebAuthn,
    generateAuthenticationOptions as generateAuthenticationOptionsWebAuthn,
    verifyAuthenticationResponse as verifyAuthenticationResponseWebAuthn,
} from '@simplewebauthn/server';
import { isoBase64URL } from '@simplewebauthn/server/helpers';

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

    updateUserChallenge(username, options.challenge);

    return options;
}

export async function verifyRegistrationResponse(username: string, response: RegistrationResponseJSON) {
    const challenge = await WebAuthnChallenge.findOne({ username });
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

    deleteUserChallenge(username);

    return registrationInfo;
}

export async function register(username: string, webAuthnCredential: IWebAuthnCredential) {
    const passkey = await WebAuthnCredential.create({
        id: webAuthnCredential.id,
        publicKey: Buffer.from(webAuthnCredential.publicKey),
        counter: webAuthnCredential.counter,
    });

    const user = await User.create({
        username,
        passkeys: [passkey],
    });

    return user;
}

export async function generateAuthenticationOptions(username: string) {
    const user = await User.findOne({ username });
    if (!user) {
        throw new BadRequestError('User not found');
    }

    const optionsWebAuthn = await generateAuthenticationOptionsWebAuthn({
        rpID: APP_URL,
        allowCredentials: user.passkeys.map((passkey) => ({
            id: passkey.id,
        })),
        userVerification: 'preferred',
    });

    if (!user.prfSalt) {
        user.prfSalt = Buffer.from(crypto.randomBytes(32));
        await user.save();
    }

    const prfSaltBase64URL = isoBase64URL.fromBuffer(user.prfSalt);
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

    updateUserChallenge(username, options.challenge);

    return options;
}

export async function verifyAuthenticationResponse(username: string, response: AuthenticationResponseJSON) {
    const user = await User.findOne({ username });
    if (!user) {
        throw new BadRequestError('User not found');
    }

    const challenge = await WebAuthnChallenge.findOne({ username });
    if (!challenge) {
        throw new InternalServerError('No challenge found');
    }

    const passkey = await WebAuthnCredential.findOne({
        id: response.id,
    });
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
    await passkey.save();

    if (!verified) {
        throw new BadRequestError('Verification failed');
    }

    deleteUserChallenge(username);

    return authenticationInfo;
}

export async function login(username: string, prf?: ArrayBuffer) {
    const user = await User.findOne({ username });
    if (!user) {
        throw new BadRequestError('User not found');
    }

    console.log(prf);

    return user;
}

async function updateUserChallenge(username: string, challenge: string) {
    await WebAuthnChallenge.findOneAndUpdate({ username }, { challenge }, { upsert: true });
}

async function deleteUserChallenge(username: string) {
    await WebAuthnChallenge.deleteOne({ username });
}
