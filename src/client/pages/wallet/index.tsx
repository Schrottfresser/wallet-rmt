import Header from '@client/components/Header.js';
import NotLoggedIn from '@client/components/NotLoggedIn.js';
import WalletSidebar from '@client/components/wallet/sidebar/WalletSidebar.js';
import useSession from '@client/hooks/useSession.js';

function wallet() {
    const session = useSession();

    if (session.isLoading || session.error || !session.data) {
        return;
    }

    return (
        <>
            <Header />
            {session.data.isLoggedIn && session.data.user ? (
                <>
                    <WalletSidebar />
                </>
            ) : (
                <NotLoggedIn />
            )}
        </>
    );
}

export default wallet;
