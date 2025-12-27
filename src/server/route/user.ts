import { Router } from 'express';
import { validatedHandler } from './validation/index.js';
import { webAuthnOptionsSchema, webAuthnVerifySchema } from './validation/user.js';
import env, { appUrl } from '@server/env.js';
import WebAuthnChallenge from '@server/model/webauthnChallenge.js';
import User from '@server/model/user.js';
import InternalServerError from '@server/error/internalServerError.js';
import BadRequestError from '@server/error/badRequestError.js';
import WebAuthnCredential from '@server/model/webAuthnCredential.js';
import { createSessionToken } from '@server/util/crypto.js';
import { SESSION_COOKIE } from '@server/constant/cookie.js';
import {
    generateAuthenticationOptions,
    generateRegistrationOptions,
    isUsernameAvailable,
    register,
    verifyAuthenticationResponse,
    verifyRegistrationResponse,
} from '@server/service/user.js';

const userRouter = Router();

userRouter.post(
    '/webauthn/register/options',
    validatedHandler(webAuthnOptionsSchema, async (data, _req, res) => {
        if (!isUsernameAvailable(data.body.username)) {
            throw new BadRequestError('Username not available');
        }

        const options = await generateRegistrationOptions(data.body.username);

        res.status(200).json(options);
    }),
);

userRouter.post(
    '/webauthn/register/verify',
    validatedHandler(webAuthnVerifySchema, async (data, _req, res) => {
        const { credential } = await verifyRegistrationResponse(data.body.username, data.body.attestationResponse);

        const user = await register(data.body.username, {
            id: credential.id,
            publicKey: Buffer.from(credential.publicKey),
            counter: credential.counter,
        });

        res.status(200).json({
            username: user.username,
        });
    }),
);

userRouter.post(
    '/webauthn/login/options',
    validatedHandler(webAuthnOptionsSchema, async (data, _req, res) => {
        const options = await generateAuthenticationOptions(data.body.username);

        res.status(200).json(options);
    }),
);

userRouter.post(
    '/webauthn/login/verify',
    validatedHandler(webAuthnVerifySchema, async (data, _req, res) => {
        const user = await verifyAuthenticationResponse(data.body.username, data.body.attestationResponse);

        const token = await createSessionToken({
            username: data.body.username,
        });

        res.cookie(SESSION_COOKIE, token, {
            httpOnly: true,
            secure: true,
            sameSite: 'strict',
            maxAge: 8 * 60 * 60 * 1000,
        });

        res.status(200).json({
            username: user.username,
        });
    }),
);

export default userRouter;
