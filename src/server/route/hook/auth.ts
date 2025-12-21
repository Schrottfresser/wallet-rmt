import { SESSION_COOKIE, WALLET_AUTH_COOKIE } from '@server/constant/cookie.js';
import { decryptWalletAuthToken } from '@server/util/crypto.js';
import { Request } from 'express';
import { ObjectId } from '../validation/index.js';
import { decodeJwt } from 'jose';
import SessionPayload from '@server/model/sessionPayload.js';

export async function useWalletPassword(req: Request, walletId: ObjectId): Promise<string | undefined> {
    const token = req.cookies[WALLET_AUTH_COOKIE];

    try {
        const payload = await decryptWalletAuthToken(token);
        const password = payload.passwords[walletId.toString()];

        return password;
    } catch {
        return;
    }
}

export function useSession(req: Request): SessionPayload | undefined {
    const token = req.cookies[SESSION_COOKIE];

    try {
        const session = decodeJwt<SessionPayload>(token);

        return session;
    } catch {
        return;
    }
}
