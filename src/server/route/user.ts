import { Router } from 'express';
import { validatedHandler } from './validation/index.js';
import { webAuthnOptionsSchema, webAuthnVerifySchema } from './validation/user.js';
import {
    generateAuthenticationOptions,
    generateRegistrationOptions,
    verifyAuthenticationResponse,
    verifyRegistrationResponse,
} from '@simplewebauthn/server';
import env, { appUrl } from '@server/env.js';
import WebAuthnChallenge from '@server/model/webauthnChallenge.js';
import User from '@server/model/user.js';
import InternalServerError from '@server/error/internalServerError.js';
import BadRequestError from '@server/error/badRequestError.js';
import WebAuthnCredential from '@server/model/webAuthnCredential.js';
import { createSessionToken } from '@server/util/crypto.js';
import { SESSION_COOKIE } from '@server/constant/cookie.js';

const userRouter = Router();

userRouter.post(
    '/webauthn/register/options',
    validatedHandler(webAuthnOptionsSchema, async (data, _req, res) => {
        const options = await generateRegistrationOptions({
            rpName: env.appName,
            rpID: appUrl,
            userName: data.body.username,
            attestationType: 'none',
            authenticatorSelection: {
                residentKey: 'preferred',
                userVerification: 'preferred',
            },
        });

        await WebAuthnChallenge.findOneAndUpdate(
            { username: data.body.username },
            { challenge: options.challenge },
            { upsert: true },
        );

        res.status(200).json(options);
    }),
);

userRouter.post(
    'webauthn/register/verify',
    validatedHandler(webAuthnVerifySchema, async (data, _req, res) => {
        const challenge = await WebAuthnChallenge.findOne({ username: data.body.username });
        if (!challenge) {
            throw new InternalServerError('No challenge found');
        }

        const { verified, registrationInfo } = await verifyRegistrationResponse({
            response: data.body.attestationResponse,
            expectedChallenge: challenge.challenge,
            expectedOrigin: `${env.protocol}://${env.host}`,
            expectedRPID: appUrl,
        });

        if (!verified) {
            throw new BadRequestError('Verification failed');
        }

        await WebAuthnChallenge.deleteOne({ username: data.body.username });

        const passkey = await WebAuthnChallenge.create(registrationInfo.credential);
        const user = await User.create({
            username: data.body.username,
            passkeys: [passkey],
        });

        res.status(200).json(user);
    }),
);

userRouter.post(
    'webauthn/login/options',
    validatedHandler(webAuthnOptionsSchema, async (data, _req, res) => {
        const user = await User.findOne({ username: data.body.username });
        if (!user) {
            throw new BadRequestError('User not found');
        }

        const options = await generateAuthenticationOptions({
            rpID: appUrl,
            allowCredentials: user.passkeys,
            userVerification: 'preferred',
        });

        await WebAuthnChallenge.findOneAndUpdate(
            { username: data.body.username },
            { challenge: options.challenge },
            { upsert: true },
        );

        res.status(200).json(options);
    }),
);

userRouter.post(
    'webauthn/login/verify',
    validatedHandler(webAuthnVerifySchema, async (data, _req, res) => {
        const user = await User.findOne({ username: data.body.username });
        if (!user) {
            throw new BadRequestError('User not found');
        }

        const challenge = await WebAuthnChallenge.findOne({ username: data.body.username });
        if (!challenge) {
            throw new InternalServerError('No challenge found');
        }

        const passkey = await WebAuthnCredential.findOne({
            credentialID: Buffer.from(data.body.attestationResponse.id, 'base64url'),
        });
        if (!passkey) {
            throw new InternalServerError('No credential found');
        }

        const { verified, authenticationInfo } = await verifyAuthenticationResponse({
            response: data.body.attestationResponse,
            expectedChallenge: challenge.challenge,
            expectedOrigin: `${env.protocol}://${env.host}`,
            expectedRPID: appUrl,
            credential: {
                id: passkey.id,
                publicKey: passkey.publicKey,
                counter: passkey.counter,
            },
        });

        passkey.counter = authenticationInfo.newCounter;
        await passkey.save();

        if (!verified) {
            throw new BadRequestError('Verification failed');
        }

        await WebAuthnChallenge.deleteOne({ username: data.body.username });

        const token = await createSessionToken({
            username: data.body.username,
        });

        res.cookie(SESSION_COOKIE, token, {
            httpOnly: true,
            secure: true,
            sameSite: 'strict',
            maxAge: 8 * 60 * 60 * 1000,
        });

        res.status(200).json(user);
    }),
);

export default userRouter;
