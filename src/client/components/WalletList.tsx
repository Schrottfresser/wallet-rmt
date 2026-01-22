import Button from '@client/components/base/Button.js';
import BitcoinIcon from '@client/components/icons/BitcoinIcon.js';
import MoneroIcon from '@client/components/icons/MoneroIcon.js';
import WalletCreateModal from '@client/components/WalletCreateModal.js';
import useSession from '@client/hooks/useSession.js';
import useWallets from '@client/hooks/useWallets.js';
import { Button as HeadlessButton } from '@headlessui/react';
import {
    ArrowPathIcon,
    ArrowTurnDownLeftIcon,
    LockClosedIcon,
    LockOpenIcon,
    PlusIcon,
} from '@heroicons/react/24/solid';
import { WalletDoc, WalletType } from '@server/model/mongoose/wallet.js';
import { useState } from 'react';

const getWalletIcon = (type: WalletType) => {
    switch (type) {
        case 'bitcoin':
            return BitcoinIcon;
        case 'monero':
            return MoneroIcon;
    }
};

function WalletList() {
    const { data: session, error: sessionError, isLoading: sessionIsLoading } = useSession();
    const { data: wallets, error: walletsError, isLoading: walletsIsLoading, open, close } = useWallets();

    const [walletCreateModalOpen, setWalletCreateModalOpen] = useState<boolean>();

    const handleLockClick = async (wallet: WalletDoc) => {
        if (wallet.isLoaded) {
            await close(wallet._id);
        } else {
            await open(wallet._id);
        }
    };

    if (!session || !session.isLoggedIn || !session.user || sessionError || sessionIsLoading) {
        return;
    }

    if (walletsError || (!wallets && !walletsIsLoading)) {
        return;
    }

    return (
        <>
            <WalletCreateModal
                isOpen={walletCreateModalOpen}
                onClose={() => setWalletCreateModalOpen(false)}
                username={session.user.username}
            />

            <div className="lg:max-w-2/3 xl:max-w-1/2 mx-auto mt-5 p-3">
                <h2 className="text-2xl font-bold">Wallet list</h2>
                <ul>
                    {wallets?.map((wallet) => {
                        const WalletIcon = getWalletIcon(wallet.type);
                        const LockIcon = wallet.isLoaded ? LockOpenIcon : LockClosedIcon;
                        const lockButtonTitle = wallet.isLoaded ? 'Unlock wallet' : 'Lock wallet';

                        return (
                            <li
                                key={wallet._id.toString()}
                                className="relative mt-2 p-3 rounded-md border-2 flex items-center gap-3 cursor-pointer hover:bg-gray-300"
                            >
                                <HeadlessButton className="absolute left-0 top-0 w-full h-full rounded-md cursor-pointer" />

                                <WalletIcon aria-label={wallet.type} className="size-10 shrink-0" />
                                <span className="font-bold text-lg w-1/2 truncate">{wallet.name}</span>

                                <span className="z-10 cursor-text text-nowrap">0.00000000 BTC</span>

                                <Button
                                    style="solid"
                                    icon={ArrowPathIcon}
                                    title="Refresh wallet"
                                    disabled={!wallet.isLoaded}
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
