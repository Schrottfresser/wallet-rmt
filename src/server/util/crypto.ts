import fs from 'fs/promises';
import env, { APP_URL } from '@server/env.js';
import logger from '@server/logger.js';
import WalletAuthPayload from '@server/model/walletAuthPayload.js';
import { mnemonicToEntropy } from 'bip39';
import crypto from 'crypto';
import { EncryptJWT, generateKeyPair, jwtDecrypt, jwtVerify, SignJWT } from 'jose';
import path from 'path';
import { JWTSessionPayload } from '@server/model/sessionData.js';

const { publicKey, privateKey } = await generateKeyPair('EdDSA');

let walletAuthKey = generateWalletAuthKey();
registerWalletAuthKeyRotate();

export function createSessionToken(payload: JWTSessionPayload) {
    return new SignJWT(payload)
        .setProtectedHeader({ alg: 'EdDSA' })
        .setIssuedAt()
        .setIssuer(APP_URL)
        .setAudience('login')

        .setExpirationTime(`${env.sessionExpirationMins}m`)
        .sign(privateKey);
}

export async function verifySessionToken(token: string) {
    const { payload } = await jwtVerify<JWTSessionPayload>(token, publicKey, {
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

export async function deriveAESKeyFromPRF(prf: Uint8Array<ArrayBuffer>, salt: Uint8Array<ArrayBuffer>) {
    const keyMaterial = await crypto.subtle.importKey('raw', prf, 'HKDF', false, ['deriveKey']);
    const aesKey = await crypto.subtle.deriveKey(
        {
            name: 'HKDF',
            hash: 'SHA-256',
            salt,
            info: Buffer.from(new TextEncoder().encode('prf-key')),
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

export async function wrapMasterKey(masterKeyData: Uint8Array<ArrayBuffer>, aesKey: crypto.webcrypto.CryptoKey) {
    const iv = crypto.randomBytes(12);
    const ciphertext = await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, aesKey, masterKeyData);

    return { ciphertext, iv };
}

export async function unwrapMasterKey(
    wrapped: { ciphertext: Uint8Array<ArrayBuffer>; iv: Uint8Array<ArrayBuffer> },
    aesKey: crypto.webcrypto.CryptoKey,
) {
    const masterKeyData = new Uint8Array(
        await crypto.subtle.decrypt({ name: 'AES-GCM', iv: wrapped.iv }, aesKey, wrapped.ciphertext),
    );

    return masterKeyData;
}

export async function exportMasterKeyData(masterKey: crypto.webcrypto.CryptoKey) {
    const masterKeyData = await crypto.subtle.exportKey('raw', masterKey);

    return new Uint8Array(masterKeyData);
}

export async function createMasterKey(masterKeyData: Uint8Array<ArrayBuffer>) {
    const masterKey = await crypto.subtle.importKey('raw', masterKeyData, 'AES-GCM', true, ['encrypt', 'decrypt']);

    return masterKey;
}

export async function encryptDirectory(dir: string, outputFile: string, key: crypto.webcrypto.CryptoKey) {
    const files = await collectFiles(dir);

    const metadataBuffer = Buffer.from(JSON.stringify(files), 'utf-8');
    const metadataLengthBuffer = Buffer.alloc(4);
    metadataLengthBuffer.writeUInt32BE(metadataBuffer.length);

    const fileBuffers = await Promise.all(files.map(async (file) => await fs.readFile(file.fullPath)));
    const combinedData = Buffer.concat([metadataLengthBuffer, metadataBuffer, ...fileBuffers]);

    const iv = crypto.randomBytes(12);
    const encrypted = await crypto.subtle.encrypt(
        {
            name: 'AES-GCM',
            iv,
        },
        key,
        combinedData,
    );

    const finalBuffer = Buffer.concat([iv, Buffer.from(encrypted)]);
    await fs.writeFile(outputFile, finalBuffer);
}

export async function decryptDirectory(encryptedFile: string, outputDir: string, key: crypto.webcrypto.CryptoKey) {
    const buffer = await fs.readFile(encryptedFile);
    const iv = buffer.subarray(0, 12);
    const ciphertext = buffer.subarray(12);

    const decrypted = Buffer.from(
        await crypto.subtle.decrypt(
            {
                name: 'AES-GCM',
                iv,
            },
            key,
            ciphertext,
        ),
    );

    const metadataLength = decrypted.readUInt32BE();
    const metadataBuffer = decrypted.subarray(4, 4 + metadataLength);
    const metadata: CollectedFile[] = JSON.parse(metadataBuffer.toString('utf-8'));

    let offset = 4 + metadataLength;
    for (const { relativePath, size } of metadata) {
        const fileBuffer = decrypted.subarray(offset, offset + size);
        const fileOutputPath = path.join(outputDir, relativePath);

        await fs.mkdir(path.dirname(fileOutputPath), { recursive: true });
        await fs.writeFile(fileOutputPath, fileBuffer);

        offset += size;
    }
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

interface CollectedFile {
    relativePath: string;
    fullPath: string;
    size: number;
}

async function collectFiles(dir: string, baseDir = dir): Promise<CollectedFile[]> {
    let files: CollectedFile[] = [];

    for (const entry of await fs.readdir(dir)) {
        const fullPath = path.join(dir, entry);
        const stats = await fs.stat(fullPath);

        if (stats.isFile()) {
            files.push({
                relativePath: path.relative(baseDir, fullPath),
                fullPath,
                size: stats.size,
            });
        } else if (stats.isDirectory()) {
            files = files.concat(await collectFiles(fullPath, baseDir));
        }
    }
    return files;
}
