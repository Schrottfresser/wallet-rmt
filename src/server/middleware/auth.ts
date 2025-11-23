import { WALLET_AUTH_COOKIE } from '@server/constant/cookie.js';
import UnauthorizedError from '@server/error/unauthorizedError.js';
import { decryptWalletAuthToken } from '@server/util/crypto.js';
import { NextFunction, Request, Response } from 'express';

export async function walletAuthMiddleware(req: Request, _res: Response, next: NextFunction) {
    const token = req.cookies[WALLET_AUTH_COOKIE];
    if (!token) {
        throw new UnauthorizedError('Unauthorized');
    }

    try {
        const payload = await decryptWalletAuthToken(token);
        req.walletAuth = payload;
    } catch {
        throw new UnauthorizedError('Unauthorized');
    }

    return next();
}
