import BadRequestError from '@server/error/badRequestError.js';
import UnauthorizedError from '@server/error/unauthorizedError.js';
import User from '@server/model/mongoose/user.js';
import { WalletDoc, WalletType } from '@server/model/mongoose/wallet.js';
import walletRepository from '@server/repository/wallet.js';
import { createMasterKey, deriveAESKeyFromPRF, unwrapMasterKey } from '@server/util/crypto.js';
import { sleep } from '@server/util/sleep.js';
import { encryptUserData } from '@server/util/userData.js';

export async function createWallet(
    name: string,
    type: WalletType,
    username: string,
    credentialId: string,
    prfBuffer: Uint8Array<ArrayBuffer>,
): Promise<WalletDoc[]> {
    const user = await User.findOne({ username: username });
    if (!user) {
        throw new BadRequestError('User not found');
    }
    const keySlot = user.keySlots.get(credentialId);
    if (!keySlot || !keySlot.salt || !keySlot.ciphertext || !keySlot.iv) {
        throw new UnauthorizedError('Invalid credential');
    }

    const prfKey = await deriveAESKeyFromPRF(prfBuffer, keySlot.salt);
    const masterKeyData = await unwrapMasterKey({ ciphertext: keySlot.ciphertext, iv: keySlot.iv }, prfKey);
    const masterKey = await createMasterKey(masterKeyData);

    const remoteName = `${username}/${name}`;
    const walletService = await walletRepository.create(
        {
            name,
            type,
            remoteName,
            addresses: [],
        },
        username,
    );
    if (!walletService) {
        throw new BadRequestError('Wallet type does not exist');
    }

    await sleep(500); // avoid race conditions
    await encryptUserData(username, masterKey);

    const wallets = user?.wallets || [];
    return wallets;
}
