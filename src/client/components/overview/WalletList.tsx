import Button from '@client/components/base/Button.js';
import WalletCreateModal from '@client/components/overview/WalletCreateModal.js';
import useWallets from '@client/hooks/useWallets.js';
import { PlusIcon } from '@heroicons/react/24/solid';
import { WalletDoc } from '@server/model/mongoose/wallet.js';
import { ObjectId } from '@server/route/validation/index.js';
import { useState } from 'react';
import WalletListItem from '@client/components/overview/WalletListItem.js';

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
                {wallets.data?.length ? (
                    <ul>
                        {wallets.data?.map((wallet) => (
                            <WalletListItem
                                key={wallet._id.toString()}
                                wallet={wallet}
                                handleRefreshClick={handleRefreshClick}
                                handleLockClick={handleLockClick}
                            />
                        ))}
                    </ul>
                ) : (
                    <p className="mt-4">
                        You did not create any wallet yet.
                        <br />
                        Try creating a new one by clicking on the button below.
                    </p>
                )}
                <Button
                    style="solid"
                    text="Create"
                    icon={PlusIcon}
                    onClick={() => setWalletCreateModalOpen(true)}
                    className="text-lg mt-8 ml-auto"
                />
            </div>
        </>
    );
}

export default WalletList;
