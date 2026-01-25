import WalletTransferForm from '@client/components/wallet/send/WalletTransferForm.js';
import useWallets from '@client/hooks/useWallets.js';
import { useMemo } from 'react';
import { useParams } from 'react-router';

interface WalletSendProps {
    username: string;
}

function WalletSend({ username }: WalletSendProps) {
    const { walletId } = useParams();
    const wallets = useWallets();

    const wallet = useMemo(
        () => wallets.data?.find((wallet) => wallet._id.toString() === walletId),
        [wallets.data, walletId],
    );

    if (!wallet || !walletId || wallets.isLoading || wallets.error) {
        return;
    }

    return (
        <div className="p-4 w-full shrink">
            <WalletTransferForm wallet={wallet} username={username} />
        </div>
    );
}

export default WalletSend;
