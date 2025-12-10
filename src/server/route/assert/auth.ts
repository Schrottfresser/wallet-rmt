import { WALLET_AUTH_COOKIE } from '@server/constant/cookie.js';
import UnauthorizedError from '@server/error/unauthorizedError.js';
import { decryptWalletAuthToken } from '@server/util/crypto.js';
import { Request } from 'express';

export async function assertAndGetWalletAuth(req: Request) {
    const token = req.cookies[WALLET_AUTH_COOKIE];
    if (!token) {
        throw new UnauthorizedError('Unauthorized');
    }

    try {
        const payload = await decryptWalletAuthToken(token);
        return payload;
    } catch {
        throw new UnauthorizedError('Unauthorized');
    }
}
