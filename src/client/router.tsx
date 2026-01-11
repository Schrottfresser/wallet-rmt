import { Route, Routes } from 'react-router';
import Registration from './pages/Registration.js';
import index from './pages/index.js';

function Router() {
    return (
        <Routes>
            <Route index Component={index} />
            <Route path="/register" Component={Registration} />
        </Routes>
    );
}

export default Router;
