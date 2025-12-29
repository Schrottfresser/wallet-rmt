import env from '@server/env.js';
import fs from 'fs/promises';

export async function isUserData(username: string) {
    try {
        await fs.access(`${env.dataDir}/${username}`);
        return true;
    } catch (error) {
        return false;
    }
}

export async function addUserDataFolder(username: string) {
    await fs.mkdir(`${env.dataDir}/${username}`);
}
