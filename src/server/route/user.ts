import { Router } from 'express';
import { validatedHandler } from './validation/index.js';
import { webauthRegisterOptionsSchema, webauthRegisterVerifySchema } from './validation/user.js';
import { generateRegistrationOptions, verifyRegistrationResponse } from '@simplewebauthn/server';
import env, { appUrl } from '@server/env.js';
import WebauthnChallenge from '@server/model/webauthnChallenge.js';
import User from '@server/model/user.js';
import InternalServerError from '@server/error/internalServerError.js';

const userRouter = Router();

userRouter.post(
    '/webauthn/register/options',
    validatedHandler(webauthRegisterOptionsSchema, async (data, _req, res) => {
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

        await WebauthnChallenge.findOneAndUpdate(
            { username: data.body.username },
            { challenge: options.challenge },
            { upsert: true },
        );

        res.status(200).json(options);
    }),
);

userRouter.post(
    'webauthn/register/verify',
    validatedHandler(webauthRegisterVerifySchema, async (data, _req, res) => {
        const challenge = await WebauthnChallenge.findOne({ username: data.body.username });
        if (!challenge) {
            throw new InternalServerError('No challenge found');
        }

        const verification = await verifyRegistrationResponse({
            response: data.body.attestationResponse,
            expectedChallenge: challenge.challenge,
            expectedOrigin: `${env.protocol}://${env.host}`,
            expectedRPID: appUrl,
        });

        if (!verification.verified) {
            throw new Error('Verification failed');
        }

        res.status(200).send();
    }),
);

export default userRouter;
