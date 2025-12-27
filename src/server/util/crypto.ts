import env, { APP_URL } from '@server/env.js';
import SessionPayload from '@server/model/sessionPayload.js';
import WalletAuthPayload from '@server/model/walletAuthPayload.js';
import crypto from 'crypto';
import { EncryptJWT, generateKeyPair, jwtDecrypt, jwtVerify, SignJWT } from 'jose';

const { publicKey, privateKey } = await generateKeyPair('EdDSA');

let walletAuthKey = generateKey();
registerWalletAuthKeyRotate();

export function createSessionToken(payload: SessionPayload) {
    return new SignJWT(payload)
        .setProtectedHeader({ alg: 'EdDSA' })
        .setIssuedAt()
        .setIssuer(APP_URL)
        .setAudience('login')

        .setExpirationTime('8h')
        .sign(privateKey);
}

export async function verifySessionToken(token: string) {
    const { payload } = await jwtVerify(token, publicKey, {
        issuer: APP_URL,
        audience: 'login',
    });

    return payload;
}

export function createWalletAuthToken(payload: WalletAuthPayload) {
    return new EncryptJWT(payload)
        .setProtectedHeader({ alg: 'dir', enc: 'A256GCM' })
        .setExpirationTime(`${env.walletAuthExpirationMins}m`)
        .encrypt(walletAuthKey);
}

export async function decryptWalletAuthToken(token: string): Promise<WalletAuthPayload> {
    const { payload } = await jwtDecrypt<WalletAuthPayload>(token, walletAuthKey);

    return payload;
}

function generateKey() {
    return crypto.randomBytes(32);
}

function registerWalletAuthKeyRotate() {
    setInterval(
        () => {
            walletAuthKey = generateKey();
            console.log('[crypto] Rotated AES wallet auth key');
        },
        1000 * 60 * 60,
    ); // every hour
}
