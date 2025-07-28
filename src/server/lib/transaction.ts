import NotFoundError from "@server/errors/notFoundError.js";
import BitcoinRPC from "@server/external/bitcoinRpc.js";
import { IRemote } from "@server/model/remote.js";
import Wallet from "@server/model/wallet.js";
import { Types } from "mongoose";

/**
 * Sends the specified transaction from the given wallet
 * @param walletId the new wallet
 * @param address the address to send to
 * @param amount the amount to send
 * @returns the wallet with sent transaction
 * @throwsError {@link NotFoundError} if the specified wallet was not found
 */
export const sendTransaction = async (
    walletId: Types.ObjectId,
    address: string,
    amount: number
) => {
    const wallet = await Wallet.findById(walletId).populate<{
        remote: IRemote;
    }>("remote");
    if (!wallet) {
        throw new NotFoundError("Wallet not found");
    }

    const bitcoinRpc = new BitcoinRPC(
        wallet.remote.url,
        wallet.remote.username,
        wallet.remote.password
    );

    const txid = await bitcoinRpc.sendtoaddress(
        wallet.remoteName,
        address,
        amount
    );
};

/**
 * Lists the transactions of the wallet with the given id
 * @param walletId id of the wallet to list transactions of
 * @param count max amount of transactions listed
 * @param skip amount of transactions to skip initially
 * @returns the list of wallet transactions
 * @throwsError {@link NotFoundError} if the specified wallet was not found
 */
export const listWalletTransactions = async (
    walletId: Types.ObjectId,
    count?: number,
    skip?: number
) => {
    const wallet = await Wallet.findById(walletId).populate<{
        remote: IRemote;
    }>("remote");
    if (!wallet) {
        throw new NotFoundError("Wallet not found");
    }

    const bitcoinRpc = new BitcoinRPC(
        wallet.remote.url,
        wallet.remote.username,
        wallet.remote.password
    );

    const result = await bitcoinRpc.listtransactions(
        wallet.remoteName,
        count,
        skip
    );

    const transactions = result.map((resultItem) => ({
        txid: resultItem.txid,
        address: resultItem.address,
        amount: resultItem.amount,
        fee: resultItem.fee,
        confirmations: resultItem.confirmations,
        blockHeight: resultItem.blockheight,
        blockIndex: resultItem.blockindex,
        abandoned: resultItem.abandoned,
    }));

    return transactions;
};

/**
 * Sets the transaction fee of the wallet with the given id
 * @param walletId id of the wallet to list transactions of
 * @param fee amount to set the transaction fee to
 * @throwsError {@link NotFoundError} if the specified wallet was not found
 */
export const setTransactionFee = async (
    walletId: Types.ObjectId,
    fee: number
) => {
    const wallet = await Wallet.findById(walletId).populate<{
        remote: IRemote;
    }>("remote");
    if (!wallet) {
        throw new NotFoundError("Wallet not found");
    }

    const bitcoinRpc = new BitcoinRPC(
        wallet.remote.url,
        wallet.remote.username,
        wallet.remote.password
    );

    await bitcoinRpc.settxfee(wallet.remoteName, fee);
};
