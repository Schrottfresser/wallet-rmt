import Button from '@client/components/base/Button.js';
import { ArrowPathIcon, LockClosedIcon, LockOpenIcon } from '@heroicons/react/24/solid';
import { WalletDoc } from '@server/model/mongoose/wallet.js';

interface WalletActionsProps {
    wallet: WalletDoc;
    handleRefreshWallet: () => void;
    handleLockWallet: () => void;
}

function WalletActions({ wallet, handleRefreshWallet, handleLockWallet }: Readonly<WalletActionsProps>) {
    return (
        <div className="w-full mt-auto pt-4">
            <Button
                style="solid"
                icon={ArrowPathIcon}
                text="Refresh"
                disabled={!wallet.isLoaded}
                onClick={handleRefreshWallet}
                className="w-full"
            />
            <Button
                style="solid"
                icon={wallet.isLoaded ? LockOpenIcon : LockClosedIcon}
                text={wallet.isLoaded ? 'Lock' : 'Unlock'}
                onClick={handleLockWallet}
                className="w-full mt-2"
            />
        </div>
    );
}

export default WalletActions;
