import Header from '@client/components/Header.js';
import NotLoggedIn from '@client/components/NotLoggedIn.js';
import WalletSettings from '@client/components/wallet/settings/WalletSettings.js';
import WalletSidebar from '@client/components/wallet/sidebar/WalletSidebar.js';
import WalletWrapper from '@client/components/wallet/WalletWrapper.js';
import useSession from '@client/hooks/useSession.js';

function walletSettings() {
    const session = useSession();

    if (session.isLoading || session.error || !session.data) {
        return;
    }

    return (
        <>
            <Header />
            {session.data.isLoggedIn && session.data.user ? (
                <WalletWrapper>
                    <WalletSidebar />
                    <WalletSettings />
                </WalletWrapper>
            ) : (
                <NotLoggedIn />
            )}
        </>
    );
}

export default walletSettings;
