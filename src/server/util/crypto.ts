import env, { APP_URL } from '@server/env.js';
import logger from '@server/logger.js';
import SessionPayload from '@server/model/sessionPayload.js';
import WalletAuthPayload from '@server/model/walletAuthPayload.js';
import { mnemonicToEntropy } from 'bip39';
import crypto from 'crypto';
import { EncryptJWT, generateKeyPair, jwtDecrypt, jwtVerify, SignJWT } from 'jose';

const { publicKey, privateKey } = await generateKeyPair('EdDSA');

let walletAuthKey = generateWalletAuthKey();
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

export async function deriveAESKeyFromPRF(prf: Uint8Array, salt: Uint8Array) {
    const keyMaterial = await crypto.subtle.importKey('raw', prf, 'HKDF', false, ['deriveKey']);
    const aesKey = await crypto.subtle.deriveKey(
        {
            name: 'HKDF',
            hash: 'SHA-256',
            salt,
            info: new TextEncoder().encode('prf-key'),
        },
        keyMaterial,
        { name: 'AES-GCM', length: 256 },
        true,
        ['encrypt', 'decrypt'],
    );

    return aesKey;
}

export async function deriveAESKeyFromMnemonic(mnemonic: string) {
    const backupKey = Buffer.from(mnemonicToEntropy(mnemonic), 'hex');
    const aesKey = await crypto.subtle.importKey('raw', backupKey, 'AES-GCM', false, ['encrypt', 'decrypt']);

    return aesKey;
}

export async function wrapMasterKey(masterKey: Uint8Array, aesKey: CryptoKey) {
    const iv = crypto.randomBytes(12);
    const ciphertext = new Uint8Array(await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, aesKey, masterKey));

    return { ciphertext, iv };
}

export async function unwrapMasterKey(wrapped: { ciphertext: Uint8Array; iv: Uint8Array }, aesKey: CryptoKey) {
    const decryptedCiphertext = new Uint8Array(
        await crypto.subtle.decrypt({ name: 'AES-GCM', iv: wrapped.iv }, aesKey, wrapped.ciphertext),
    );
    const masterKey = await crypto.subtle.importKey('raw', decryptedCiphertext, 'AES-GCM', true, [
        'encrypt',
        'decrypt',
    ]);

    return masterKey;
}

export async function exportMasterKeyData(masterKey: CryptoKey) {
    const masterKeyData = await crypto.subtle.exportKey('raw', masterKey);

    return new Uint8Array(masterKeyData);
}

function generateWalletAuthKey() {
    return crypto.randomBytes(32);
}

function registerWalletAuthKeyRotate() {
    setInterval(
        () => {
            walletAuthKey = generateWalletAuthKey();
            logger.info('Rotated AES wallet auth key');
        },
        1000 * 60 * 60,
    ); // every hour
}
