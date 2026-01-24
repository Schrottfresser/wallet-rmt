import { getWalletIcon, getWalletTypeLabel } from '@client/helpers/currency.js';
import { formatBTC } from '@client/util/currencies.js';
import { WalletDoc } from '@server/model/mongoose/wallet.js';
import { useMemo } from 'react';

interface WalletCardProps {
    wallet: WalletDoc;
}

function WalletCard({ wallet }: Readonly<WalletCardProps>) {
    const WalletIcon = getWalletIcon(wallet.type);
    const walletTypeLabel = getWalletTypeLabel(wallet.type);

    const formattedBalance = useMemo(() => formatBTC(wallet.balance || 0n), [wallet.balance]);

    return (
        <div className="p-5 border-2 rounded-md">
            <div className="flex items-center">
                <WalletIcon className="size-10" />
                <div className="ml-3">
                    <p className="text-sm">{walletTypeLabel} Wallet</p>
                    <h2 className="text-xl">{wallet.name}</h2>
                </div>
            </div>
            <p className="mt-6 ml-2 text-lg">{formattedBalance}</p>
        </div>
    );
}

export default WalletCard;
