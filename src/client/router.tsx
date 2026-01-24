import { Route, Routes } from 'react-router';
import register from './pages/register.js';
import index from './pages/index.js';
import wallet from '@client/pages/wallet.js';

function Router() {
    return (
        <Routes>
            <Route index Component={index} />
            <Route path="/register" Component={register} />
            <Route path="/wallet/:walletId" Component={wallet} />
        </Routes>
    );
}

export default Router;
