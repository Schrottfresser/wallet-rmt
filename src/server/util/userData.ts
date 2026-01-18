import env from '@server/env.js';
import fs from 'fs/promises';
import crypto from 'crypto';
import { decryptDirectory, encryptDirectory } from './crypto.js';
import { SessionData } from '@server/model/sessionData.js';
import logger from '@server/logger.js';
import { sleep } from '@server/util/sleep.js';

const tmpfsUserDataRemovals = new Map<string, NodeJS.Timeout>();

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

export async function encryptUserDataAfterTimeout(username: string, masterKey: crypto.webcrypto.CryptoKey) {
    const { userTmpfsDir, userDataFile } = generateFilePaths(username);

    await sleep(500); // avoid race conditions
    await encryptDirectory(userTmpfsDir, userDataFile, masterKey);
}

export async function removeTmpfsUserData(username: string) {
    const { userTmpfsDir } = generateFilePaths(username);

    await fs.rm(userTmpfsDir, { recursive: true, force: true });
}

export function scheduleTmpfsUserDataRemoval(username: string, delay: number) {
    const timeout = setTimeout(async () => {
        removeTmpfsUserData(username);
        logger.debug(`Tmpfs user data for user "${username}" cleaned up`);
    }, delay);

    const oldTimeout = tmpfsUserDataRemovals.get(username);
    clearTimeout(oldTimeout);

    tmpfsUserDataRemovals.set(username, timeout);
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

function generateFilePaths(username: string) {
    const userTmpfsDir = `${env.walletTmpfsDir}/${username}`;
    const userDataFile = `${env.dataDir}/${username}.enc`;

    return { userTmpfsDir, userDataFile };
}
