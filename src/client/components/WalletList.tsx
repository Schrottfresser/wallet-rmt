import Button from '@client/components/base/Button.js';
import WalletCreateModal from '@client/components/WalletCreateModal.js';
import { getWalletIcon } from '@client/helpers/currency.js';
import useWallets from '@client/hooks/useWallets.js';
import { formatBTC } from '@client/util/currencies.js';
import {
    ArrowPathIcon,
    ArrowTurnDownLeftIcon,
    LockClosedIcon,
    LockOpenIcon,
    PlusIcon,
} from '@heroicons/react/24/solid';
import { WalletDoc } from '@server/model/mongoose/wallet.js';
import { ObjectId } from '@server/route/validation/index.js';
import { useState } from 'react';

interface WalletListProps {
    username: string;
}

function WalletList({ username }: Readonly<WalletListProps>) {
    const wallets = useWallets();

    const [walletCreateModalOpen, setWalletCreateModalOpen] = useState<boolean>();

    const handleRefreshClick = async (walletId: ObjectId) => {
        await wallets.refresh(walletId);
    };

    const handleLockClick = async (wallet: WalletDoc) => {
        if (wallet.isLoaded) {
            await wallets.close(wallet._id);
        } else {
            await wallets.open(wallet._id);
        }
    };

    if (wallets.error || (!wallets.data && !wallets.isLoading)) {
        return;
    }

    return (
        <>
            <WalletCreateModal
                isOpen={walletCreateModalOpen}
                onClose={() => setWalletCreateModalOpen(false)}
                username={username}
            />

            <div className="lg:max-w-2/3 xl:max-w-1/2 mx-auto mt-5 p-3">
                <h2 className="text-2xl font-bold">Wallet list</h2>
                <ul>
                    {wallets.data?.map((wallet) => {
                        const WalletIcon = getWalletIcon(wallet.type);
                        const LockIcon = wallet.isLoaded ? LockOpenIcon : LockClosedIcon;
                        const lockButtonTitle = wallet.isLoaded ? 'Lock wallet' : 'Unlock wallet';

                        const formattedBalance = formatBTC(wallet.balance || 0n);

                        return (
                            <li
                                key={wallet._id.toString()}
                                className="relative mt-2 p-3 rounded-md border-2 flex items-center gap-3 cursor-pointer hover:bg-gray-300"
                            >
                                <a
                                    href={`/wallet/${wallet._id}/`}
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
                    })}
                </ul>
                <Button
                    style="solid"
                    text="Create"
                    icon={PlusIcon}
                    onClick={() => setWalletCreateModalOpen(true)}
                    className="text-lg mt-2 ml-auto"
                />
            </div>
        </>
    );
}

export default WalletList;
