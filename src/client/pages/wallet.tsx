import Header from '@client/components/Header.js';
import WalletSidebar from '@client/components/WalletSidebar.js';
import useWallets from '@client/hooks/useWallets.js';
import { useCallback, useMemo } from 'react';
import { useParams } from 'react-router';

function wallet() {
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
        <>
            <Header />
            <WalletSidebar
                wallet={wallet}
                handleRefreshWallet={handleRefreshWallet}
                handleLockWallet={handleLockWallet}
            />
        </>
    );
}

export default wallet;
