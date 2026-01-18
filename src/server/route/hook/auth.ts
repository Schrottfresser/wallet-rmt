import { SESSION_COOKIE } from '@server/constant/cookie.js';
import { verifySessionToken } from '@server/util/crypto.js';
import { Request } from 'express';
import UnauthorizedError from '@server/error/unauthorizedError.js';
import { SessionData } from '@server/model/sessionData.js';
import { readSessionData, removeTmpfsUserData } from '@server/util/userData.js';
import env from '@server/env.js';

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
            removeTmpfsUserData(username);

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
