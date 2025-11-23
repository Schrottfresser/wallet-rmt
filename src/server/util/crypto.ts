import env from '@server/env.js';
import WalletAuthPayload from '@server/model/walletAuthPayload.js';
import crypto from 'crypto';
import { EncryptJWT, jwtDecrypt } from 'jose';

let WALLET_AUTH_KEY = generateKey();

export function registerWalletAuthKeyRotate() {
    setInterval(
        () => {
            WALLET_AUTH_KEY = generateKey();
            console.log('[crypto] Rotated AES key');
        },
        1000 * 60 * 60,
    ); // every hour
}

export function createWalletAuthToken(payload: WalletAuthPayload) {
    return new EncryptJWT(payload)
        .setProtectedHeader({ alg: 'dir', enc: 'A256GCM' })
        .setExpirationTime(`${env.walletAuthExpirationMins}m`)
        .encrypt(WALLET_AUTH_KEY);
}

export async function decryptWalletAuthToken(token: string): Promise<WalletAuthPayload> {
    const { payload } = await jwtDecrypt<WalletAuthPayload>(token, WALLET_AUTH_KEY);

    return payload;
}

function generateKey() {
    return crypto.randomBytes(32);
}
