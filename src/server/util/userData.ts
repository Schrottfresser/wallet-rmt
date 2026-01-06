import env from '@server/env.js';
import fs from 'fs/promises';
import { decryptDirectory, encryptDirectory } from './crypto.js';

export async function isUserData(username: string) {
    try {
        await fs.access(`${env.dataDir}/${username}.enc`);
        return true;
    } catch (error) {
        return false;
    }
}

export async function initUserData(username: string, masterKey: CryptoKey) {
    const userTmpfsDir = `${env.walletTmpfsDir}/${username}`;
    const userDataFile = `${env.dataDir}/${username}.enc`;

    await fs.writeFile(`${userTmpfsDir}/user`, username);
    await encryptDirectory(userTmpfsDir, userDataFile, masterKey);
}

export async function decryptUserData(username: string, masterKey: CryptoKey) {
    const userTmpfsDir = `${env.walletTmpfsDir}/${username}`;
    const userDataFile = `${env.dataDir}/${username}.enc`;

    await fs.mkdir(userTmpfsDir);
    await decryptDirectory(userDataFile, userTmpfsDir, masterKey);
}
