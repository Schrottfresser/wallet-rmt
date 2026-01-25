import { currencyIconMap } from '@client/util/currency.js';
import { WalletDoc } from '@server/model/mongoose/wallet.js';
import { currencyProperties } from '@server/util/currency.js';

interface WalletCardProps {
    wallet: WalletDoc;
}

function WalletCard({ wallet }: Readonly<WalletCardProps>) {
    const WalletIcon = currencyIconMap[wallet.type];
    const walletTypeLabel = currencyProperties[wallet.type].name;
    const formattedBalance = currencyProperties[wallet.type].format(wallet.balance || 0n);

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
