import WalletActions from '@client/components/WalletActions.js';
import WalletCard from '@client/components/WalletCard.js';
import WalletNavigation from '@client/components/WalletNavigation.js';
import useWallets from '@client/hooks/useWallets.js';
import { useCallback, useMemo } from 'react';
import { useParams } from 'react-router';

function WalletSidebar() {
    const { walletId } = useParams();
    const wallets = useWallets();

    const wallet = useMemo(
        () => wallets.data?.find((wallet) => wallet._id.toString() === walletId),
        [wallets.data, walletId],
    );

    const handleRefreshWallet = useCallback(async () => {
        if (!wallet) {
            return;
        }

        await wallets.refresh(wallet._id);
    }, [wallet, wallets.refresh]);

    const handleLockWallet = useCallback(async () => {
        if (!wallet) {
            return;
        }

        if (wallet.isLoaded) {
            await wallets.close(wallet._id);
        } else {
            await wallets.open(wallet._id);
        }
    }, [wallet, wallets.refresh]);

    if (!wallet || !walletId || wallets.isLoading || wallets.error) {
        return;
    }

    return (
        <div className="fixed flex flex-col w-90 h-[calc(100%-var(--header-height))] border-r-2 p-4 overflow-y-auto">
            <WalletCard wallet={wallet} />
            <WalletNavigation wallet={wallet} />
            <WalletActions
                wallet={wallet}
                handleRefreshWallet={handleRefreshWallet}
                handleLockWallet={handleLockWallet}
            />
        </div>
    );
}

export default WalletSidebar;
