import useSession from '@client/hooks/useSession.js';
import Header from '@client/components/Header.js';
import WalletList from '@client/components/WalletList.js';

function index() {
    const { data: session, error, isLoading } = useSession();

    if (isLoading || error || !session) {
        return;
    }

    return (
        <>
            <Header />
            {session.isLoggedIn && session.user && (
                <>
                    <WalletList />
                </>
            )}
        </>
    );
}

export default index;
