import Header from '@client/components/Header.js';
import NotLoggedIn from '@client/components/NotLoggedIn.js';
import WalletReceive from '@client/components/wallet/receive/WalletReceive.js';
import WalletSend from '@client/components/wallet/send/WalletSend.js';
import WalletSidebar from '@client/components/wallet/sidebar/WalletSidebar.js';
import WalletWrapper from '@client/components/wallet/WalletWrapper.js';
import useSession from '@client/hooks/useSession.js';

function walletReceive() {
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
                    <WalletReceive username={session.data.user.username} />
                </WalletWrapper>
            ) : (
                <NotLoggedIn />
            )}
        </>
    );
}

export default walletReceive;
