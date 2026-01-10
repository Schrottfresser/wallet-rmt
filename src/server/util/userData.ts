import env from '@server/env.js';
import fs from 'fs/promises';
import crypto from 'crypto';
import { decryptDirectory, encryptDirectory } from './crypto.js';
import { SessionData } from '@server/model/sessionData.js';

export async function isUserData(username: string) {
    try {
        await fs.access(`${env.dataDir}/${username}.enc`);
        return true;
    } catch (error) {
        return false;
    }
}

export async function initUserData(data: SessionData, masterKey: crypto.webcrypto.CryptoKey) {
    const { userTmpfsDir, userDataFile } = generateFilePaths(data.username);

    await fs.mkdir(userTmpfsDir, { recursive: true });
    await writeSessionData(data);

    await encryptDirectory(userTmpfsDir, userDataFile, masterKey);
}

export async function decryptUserData(username: string, masterKey: crypto.webcrypto.CryptoKey) {
    const { userTmpfsDir, userDataFile } = generateFilePaths(username);

    await fs.mkdir(userTmpfsDir, { recursive: true });
    await decryptDirectory(userDataFile, userTmpfsDir, masterKey);
}

export async function encryptUserData(username: string, masterKey: crypto.webcrypto.CryptoKey) {
    const { userTmpfsDir, userDataFile } = generateFilePaths(username);

    await encryptDirectory(userTmpfsDir, userDataFile, masterKey);
    await fs.rm(userTmpfsDir, { recursive: true, force: true });
}

export async function writeSessionData(data: SessionData) {
    const { userTmpfsDir } = generateFilePaths(data.username);

    await fs.writeFile(`${userTmpfsDir}/session.json`, JSON.stringify(data));
}

export async function readSessionData(username: string) {
    const { userTmpfsDir } = generateFilePaths(username);

    const rawSessionData = await fs.readFile(`${userTmpfsDir}/session.json`);
    const sessionData: SessionData = JSON.parse(rawSessionData.toString('utf-8'));

    return sessionData;
}

export async function removeSessionData(username: string) {
    const { userTmpfsDir } = generateFilePaths(username);

    await fs.rm(`${userTmpfsDir}/session.json`, { force: true });
}

function generateFilePaths(username: string) {
    const userTmpfsDir = `${env.walletTmpfsDir}/${username}`;
    const userDataFile = `${env.dataDir}/${username}.enc`;

    return { userTmpfsDir, userDataFile };
}
