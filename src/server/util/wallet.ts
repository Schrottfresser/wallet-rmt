import env from '@server/env.js';
import { WalletType } from '@server/model/mongoose/wallet.js';

export function getEnabledWalletTypes(): WalletType[] {
    return [...(env.bitcoinEnable ? ['bitcoin' as const] : []), ...(env.moneroEnable ? ['monero' as const] : [])];
}
