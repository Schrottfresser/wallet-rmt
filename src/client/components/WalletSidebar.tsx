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
        <div className="fixed h-full w-90 border-r-2 p-5 overflow-scroll">
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
