import WalletActions from '@client/components/WalletActions.js';
import WalletCard from '@client/components/WalletCard.js';
import WalletNavigation from '@client/components/WalletNavigation.js';
import { WalletDoc } from '@server/model/mongoose/wallet.js';

interface WalletSidebarProps {
    wallet: WalletDoc;
    handleRefreshWallet: () => void;
    handleLockWallet: () => void;
}

function WalletSidebar({ wallet, handleRefreshWallet, handleLockWallet }: Readonly<WalletSidebarProps>) {
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
