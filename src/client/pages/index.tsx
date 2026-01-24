import useSession from '@client/hooks/useSession.js';
import Header from '@client/components/Header.js';
import WalletList from '@client/components/overview/WalletList.js';

function index() {
    const session = useSession();

    if (session.isLoading || session.error || !session.data) {
        return;
    }

    return (
        <>
            <Header />
            {session.data.isLoggedIn && session.data.user && (
                <>
                    <WalletList username={session.data.user.username} />
                </>
            )}
        </>
    );
}

export default index;
