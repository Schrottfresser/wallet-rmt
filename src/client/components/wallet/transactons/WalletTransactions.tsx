import WalletTransactionsList from '@client/components/wallet/transactons/WalletTransactionsList.js';
import useTransactions from '@client/hooks/useTransactions.js';
import useWallets from '@client/hooks/useWallets.js';
import { useMemo } from 'react';
import { useParams } from 'react-router';

function WalletTransactions() {
    const { walletId } = useParams();
    const wallets = useWallets();
    const transactions = useTransactions(walletId || '');

    const wallet = useMemo(
        () => wallets.data?.find((wallet) => wallet._id.toString() === walletId),
        [wallets.data, walletId],
    );

    if (
        !walletId ||
        !wallet ||
        wallets.isLoading ||
        wallets.error ||
        !transactions.data ||
        transactions.isLoading ||
        transactions.error
    ) {
        return;
    }

    return (
        <div className="p-4 w-full shrink h-min">
            <WalletTransactionsList walletType={wallet.type} transfers={transactions.data} />
        </div>
    );
}

export default WalletTransactions;
