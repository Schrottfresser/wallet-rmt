import { Router } from 'express';
import { validatedHandler } from './validation/index.js';
import { webAuthnOptionsSchema, webAuthnVerifySchema } from './validation/user.js';
import BadRequestError from '@server/error/badRequestError.js';
import { createSessionToken } from '@server/util/crypto.js';
import { SESSION_COOKIE } from '@server/constant/cookie.js';
import {
    generateAuthenticationOptions,
    generateRegistrationOptions,
    isUsernameAvailable,
    login,
    register,
    verifyAuthenticationResponse,
    verifyRegistrationResponse,
} from '@server/service/user.js';
import { base64URLStringToBuffer } from '@simplewebauthn/browser';

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
        await verifyAuthenticationResponse(data.body.username, data.body.attestationResponse);

        const prf = base64URLStringToBuffer(data.body.attestationResponse.clientExtensionResults.prf.results.first);
        const user = await login(data.body.username, prf);

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
