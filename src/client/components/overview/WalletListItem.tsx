import Button from '@client/components/base/Button.js';
import { currencyIconMap } from '@client/util/currency.js';
import { ArrowPathIcon, ArrowTurnDownLeftIcon, LockClosedIcon, LockOpenIcon } from '@heroicons/react/24/solid';
import { WalletDoc } from '@server/model/mongoose/wallet.js';
import { ObjectId } from '@server/route/validation/index.js';
import { currencyProperties } from '@server/util/currency.js';
import { Link } from 'react-router';

interface WalletListItemProps {
    wallet: WalletDoc;
    handleRefreshClick: (walletId: ObjectId) => void;
    handleLockClick: (wallet: WalletDoc) => void;
}

function WalletListItem({ wallet, handleRefreshClick, handleLockClick }: WalletListItemProps) {
    const WalletIcon = currencyIconMap[wallet.type];
    const formattedBalance = currencyProperties[wallet.type].format(wallet.balance || 0n);

    const LockIcon = wallet.isLoaded ? LockOpenIcon : LockClosedIcon;
    const lockButtonTitle = wallet.isLoaded ? 'Lock wallet' : 'Unlock wallet';

    return (
        <li className="relative mt-2 p-3 rounded-md border-2 flex items-center gap-3 cursor-pointer hover:bg-gray-300">
            <Link
                to={`/wallet/${wallet._id}/`}
                className="absolute left-0 top-0 w-full h-full rounded-md cursor-pointer"
            />

            <WalletIcon aria-label={wallet.type} className="size-10 shrink-0" />
            <span className="font-bold text-lg w-1/2 truncate">{wallet.name}</span>

            <span className="z-10 cursor-text text-nowrap">{formattedBalance}</span>

            <Button
                style="solid"
                icon={ArrowPathIcon}
                title="Refresh wallet"
                disabled={!wallet.isLoaded}
                onClick={() => handleRefreshClick(wallet._id)}
                className="text-lg z-10 ml-auto"
            />
            <Button
                style="solid"
                icon={LockIcon}
                title={lockButtonTitle}
                onClick={() => handleLockClick(wallet)}
                className="text-lg z-10"
            />

            <ArrowTurnDownLeftIcon className="size-8" />
        </li>
    );
}

export default WalletListItem;
