import { Route, Routes } from 'react-router';
import register from './pages/register.js';
import index from './pages/index.js';
import wallet from '@client/pages/wallet/index.js';
import walletSend from '@client/pages/wallet/send.js';
import walletReceive from '@client/pages/wallet/receive.js';
import walletTransactions from '@client/pages/wallet/transactons.js';

function Router() {
    return (
        <Routes>
            <Route index Component={index} />
            <Route path="/register" Component={register} />
            <Route path="/wallet/:walletId/" Component={wallet} />
            <Route path="/wallet/:walletId/send" Component={walletSend} />
            <Route path="/wallet/:walletId/receive" Component={walletReceive} />
            <Route path="/wallet/:walletId/transactions" Component={walletTransactions} />
        </Routes>
    );
}

export default Router;
