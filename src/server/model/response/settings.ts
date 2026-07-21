import { WalletType } from '@server/model/mongoose/wallet.js';

export interface SettingsResponse {
    enableRegistration: boolean;
    walletTypes: WalletType[];
}
