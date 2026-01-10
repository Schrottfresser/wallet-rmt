import { SESSION_COOKIE, WALLET_AUTH_COOKIE } from '@server/constant/cookie.js';
import { decryptWalletAuthToken, verifySessionToken } from '@server/util/crypto.js';
import { Request } from 'express';
import { ObjectId } from '../validation/index.js';
import UnauthorizedError from '@server/error/unauthorizedError.js';
import { JWTSessionPayload, SessionData } from '@server/model/sessionData.js';
import { readSessionData } from '@server/util/userData.js';
import env from '@server/env.js';

export async function useWalletPassword(req: Request, walletId: ObjectId): Promise<string | undefined> {
    const token = req.cookies[WALLET_AUTH_COOKIE];

    try {
        const payload = await decryptWalletAuthToken(token);
        const password = payload.passwords[walletId.toString()];

        return password;
    } catch {
        return undefined;
    }
}

export async function useSession(req: Request, throwOnUnauthorized: true): Promise<SessionData>;
export async function useSession(req: Request, throwOnUnauthorized?: false): Promise<SessionData | undefined>;
export async function useSession(req: Request, throwOnUnauthorized?: boolean): Promise<SessionData | undefined> {
    const token = req.cookies[SESSION_COOKIE];

    try {
        const { sid, username } = await verifySessionToken(token);
        const sessionData = await readSessionData(username);
        if (sessionData.sid !== sid) {
            throw new UnauthorizedError('Invalid session');
        }

        const now = Date.now();
        if (now - sessionData.creation > env.sessionExpirationMins * 60 * 1000) {
            throw new UnauthorizedError('Expired session');
        }

        return sessionData;
    } catch {
        if (throwOnUnauthorized) {
            throw new UnauthorizedError('Not logged in');
        } else {
            return undefined;
        }
    }
}
