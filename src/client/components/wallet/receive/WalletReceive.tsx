import WalletAddressList from '@client/components/wallet/receive/WalletAddressList.js';
import useWallets from '@client/hooks/useWallets.js';
import { useMemo } from 'react';
import { useParams } from 'react-router';

function WalletReceive() {
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
        <div className="p-4 w-full shrink h-min">
            <WalletAddressList wallet={wallet} addAddress={() => wallets.addAddress(wallet._id)} />
        </div>
    );
}

export default WalletReceive;
