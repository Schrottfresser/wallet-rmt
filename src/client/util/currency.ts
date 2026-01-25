import BitcoinIcon from '@client/components/icons/BitcoinIcon.js';
import MoneroIcon from '@client/components/icons/MoneroIcon.js';
import { WalletType } from '@server/model/mongoose/wallet.js';
import { ComponentType, JSX } from 'react';

export type IconProps = {
    title?: string;
    className?: string;
};

export const currencyIconMap: Record<WalletType, ComponentType<IconProps>> = {
    bitcoin: BitcoinIcon,
    monero: MoneroIcon,
};
