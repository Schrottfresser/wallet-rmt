import { Router } from 'express';
import { validatedHandler } from './validation/index.js';
import {
    registerOptionsSchema,
    registerSchema,
    loginOptionsSchema,
    loginSchema,
    addPassphraseSchema,
} from './validation/user.js';
import BadRequestError from '@server/error/badRequestError.js';
import { SESSION_COOKIE } from '@server/constant/cookie.js';
import {
    addPassphrase,
    generateAuthenticationOptions,
    generateRegistrationOptions,
    isUsernameAvailable,
    login,
    register,
    verifyAuthenticationResponse,
    verifyRegistrationResponse,
} from '@server/service/user.js';
import { base64URLStringToBuffer } from '@simplewebauthn/browser';
import { useSession } from './hook/auth.js';
import UnauthorizedError from '@server/error/unauthorizedError.js';
import { WebAuthnChallengePurpose } from '@server/model/mongoose/webAuthnChallenge.js';
import env from '@server/env.js';

const userRouter = Router();

userRouter.post(
    '/register/options',
    validatedHandler(registerOptionsSchema, async (data, _req, res) => {
        if (!isUsernameAvailable(data.body.username)) {
            throw new BadRequestError('Username not available');
        }

        const options = await generateRegistrationOptions(data.body.username);

        res.status(200).json(options);
    }),
);

userRouter.post(
    '/register',
    validatedHandler(registerSchema, async (data, req, res) => {
        const session = await useSession(req);
        if (session && session.username !== data.body.username) {
            throw new UnauthorizedError('Not logged in as this user');
        }

        const { credential } = await verifyRegistrationResponse(data.body.username, data.body.attestationResponse);
        const user = await register(
            data.body.username,
            {
                id: credential.id,
                publicKey: Buffer.from(credential.publicKey),
                counter: credential.counter,
            },
            !!session,
        );

        res.status(200).json({
            username: user.username,
        });
    }),
);

userRouter.post(
    '/login/options',
    validatedHandler(loginOptionsSchema, async (data, _req, res) => {
        const challengePurpose: WebAuthnChallengePurpose = data.body.newCredentialId ? 'auth-new' : 'auth-existing';
        const options = await generateAuthenticationOptions(
            data.body.username,
            challengePurpose,
            data.body.newCredentialId,
        );

        res.status(200).json(options);
    }),
);

userRouter.post(
    '/login',
    validatedHandler(loginSchema, async (data, _req, res) => {
        await verifyAuthenticationResponse(data.body.username, data.body.attestationResponse, 'auth-existing');

        const credentialId = data.body.attestationResponse.id;
        const prf = Buffer.from(
            base64URLStringToBuffer(data.body.attestationResponse.clientExtensionResults.prf.results.first),
        );
        const { user, token, mnemonic } = await login(data.body.username, credentialId, prf);

        res.cookie(SESSION_COOKIE, token, {
            httpOnly: true,
            secure: true,
            sameSite: 'strict',
            maxAge: env.sessionExpirationMins * 60 * 1000,
        });

        res.status(200).json({
            username: user.username,
            mnemonic,
        });
    }),
);

userRouter.post(
    '/passphrase',
    validatedHandler(addPassphraseSchema, async (data, req, res) => {
        const session = await useSession(req, true);

        await verifyAuthenticationResponse(session.username, data.body.newAttestationResponse, 'auth-new');
        await verifyAuthenticationResponse(session.username, data.body.attestationResponse, 'auth-existing');

        const credentialId = data.body.attestationResponse.id;
        const prf = Buffer.from(
            base64URLStringToBuffer(data.body.attestationResponse.clientExtensionResults.prf.results.first),
        );
        const addCredentialId = data.body.newAttestationResponse.id;
        const addPrf = Buffer.from(
            base64URLStringToBuffer(data.body.newAttestationResponse.clientExtensionResults.prf.results.first),
        );
        const user = await addPassphrase(session.username, credentialId, prf, addCredentialId, addPrf);

        res.status(200).json({
            username: user.username,
        });
    }),
);

export default userRouter;
