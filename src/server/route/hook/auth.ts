import { WALLET_AUTH_COOKIE } from '@server/constant/cookie.js';
import { decryptWalletAuthToken } from '@server/util/crypto.js';
import { Request } from 'express';
import { ObjectId } from '../validation/index.js';

export async function useWalletPassword(req: Request, walletId: ObjectId) {
    const token = req.cookies[WALLET_AUTH_COOKIE];

    try {
        const payload = await decryptWalletAuthToken(token);
        const password = payload.passwords[walletId.toString()];

        return password;
    } catch {
        return;
    }
}
