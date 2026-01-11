import useSession from '@client/hooks/useSession.js';
import Header from '../components/Header.js';

function index() {
    const { data: session, error, isLoading } = useSession();

    if (isLoading || error || !session) {
        return;
    }

    return (
        <>
            <Header />
            {session.isLoggedIn && (
                <>
                    <div></div>
                    <div></div>
                </>
            )}
        </>
    );
}

export default index;
