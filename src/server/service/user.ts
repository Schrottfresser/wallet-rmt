import env, { appUrl } from '@server/env.js';
import BadRequestError from '@server/error/badRequestError.js';
import InternalServerError from '@server/error/internalServerError.js';
import User from '@server/model/user.js';
import WebAuthnChallenge from '@server/model/webauthnChallenge.js';
import WebAuthnCredential, { IWebAuthnCredential } from '@server/model/webAuthnCredential.js';
import {
    RegistrationResponseJSON,
    AuthenticationResponseJSON,
    generateRegistrationOptions as generateRegistrationOptionsWebauthn,
    verifyRegistrationResponse as verifyRegistrationResponseWebauthn,
    generateAuthenticationOptions as generateAuthenticationOptionsWebauthn,
    verifyAuthenticationResponse as verifyAuthenticationResponseWebauthn,
} from '@simplewebauthn/server';

export async function isUsernameAvailable(username: string) {
    const user = await User.find({ username });

    return !!user;
}

export async function generateRegistrationOptions(username: string) {
    const options = await generateRegistrationOptionsWebauthn({
        rpName: env.appName,
        rpID: appUrl,
        userName: username,
        attestationType: 'none',
        authenticatorSelection: {
            residentKey: 'preferred',
            userVerification: 'preferred',
        },
    });

    updateUserChallenge(username, options.challenge);

    return options;
}

export async function verifyRegistrationResponse(username: string, response: RegistrationResponseJSON) {
    const challenge = await WebAuthnChallenge.findOne({ username });
    if (!challenge) {
        throw new InternalServerError('No challenge found');
    }

    const { verified, registrationInfo } = await verifyRegistrationResponseWebauthn({
        response,
        expectedChallenge: challenge.challenge,
        expectedOrigin: `${env.protocol}://${env.host}`,
        expectedRPID: appUrl,
    });

    if (!verified) {
        throw new BadRequestError('Verification failed');
    }

    deleteUserChallenge(username);

    return registrationInfo;
}

export async function register(username: string, webauthnCredential: IWebAuthnCredential) {
    const passkey = await WebAuthnCredential.create({
        id: webauthnCredential.id,
        publicKey: Buffer.from(webauthnCredential.publicKey),
        counter: webauthnCredential.counter,
    });

    const user = await User.create({
        username: username,
        passkeys: [passkey],
    });

    return user;
}

export async function generateAuthenticationOptions(username: string) {
    const user = await User.findOne({ username: username });
    if (!user) {
        throw new BadRequestError('User not found');
    }

    const options = await generateAuthenticationOptionsWebauthn({
        rpID: appUrl,
        allowCredentials: user.passkeys.map((passkey) => ({
            id: passkey.id,
        })),
        userVerification: 'preferred',
    });

    updateUserChallenge(username, options.challenge);

    return options;
}

export async function verifyAuthenticationResponse(username: string, response: AuthenticationResponseJSON) {
    const user = await User.findOne({ username: username });
    if (!user) {
        throw new BadRequestError('User not found');
    }

    const challenge = await WebAuthnChallenge.findOne({ username: username });
    if (!challenge) {
        throw new InternalServerError('No challenge found');
    }

    const passkey = await WebAuthnCredential.findOne({
        id: response.id,
    });
    if (!passkey) {
        throw new InternalServerError('No credential found');
    }

    const { verified, authenticationInfo } = await verifyAuthenticationResponseWebauthn({
        response,
        expectedChallenge: challenge.challenge,
        expectedOrigin: `${env.protocol}://${env.host}`,
        expectedRPID: appUrl,
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

    return user;
}

async function updateUserChallenge(username: string, challenge: string) {
    await WebAuthnChallenge.findOneAndUpdate({ username }, { challenge }, { upsert: true });
}

async function deleteUserChallenge(username: string) {
    await WebAuthnChallenge.deleteOne({ username });
}
