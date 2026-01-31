import WalletEncryption from '@client/components/wallet/settings/WalletEncryption.js';
import useWallets from '@client/hooks/useWallets.js';
import { useCallback, useMemo } from 'react';
import { useParams } from 'react-router';

function WalletSettings() {
    const { walletId } = useParams();
    const wallets = useWallets();

    const wallet = useMemo(
        () => wallets.data?.find((wallet) => wallet._id.toString() === walletId),
        [wallets.data, walletId],
    );

    const walletPassword = useCallback(
        async (newPassword: string, oldPassword?: string) => {
            if (!wallet) {
                return;
            }

            await wallets.password(wallet._id, newPassword, oldPassword);
        },
        [wallet, wallets.password],
    );

    if (!wallet || !walletId || wallets.isLoading || wallets.error) {
        return;
    }

    return (
        <div className="p-4 w-full shrink h-min">
            <WalletEncryption wallet={wallet} walletPassword={walletPassword} />
        </div>
    );
}

export default WalletSettings;
