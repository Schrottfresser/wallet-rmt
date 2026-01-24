import BitcoinIcon from '@client/components/icons/BitcoinIcon.js';
import MoneroIcon from '@client/components/icons/MoneroIcon.js';
import { WalletType } from '@server/model/mongoose/wallet.js';

export function getWalletIcon(type: WalletType) {
    switch (type) {
        case 'bitcoin':
            return BitcoinIcon;
        case 'monero':
            return MoneroIcon;
    }
}

export function getWalletTypeLabel(type: WalletType) {
    switch (type) {
        case 'bitcoin':
            return 'Bitcoin';
        case 'monero':
            return 'Monero';
    }
}
