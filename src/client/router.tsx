import { Route, Routes } from 'react-router';
import Registration from './pages/Registration.js';

function Router() {
    return (
        <Routes>
            <Route index element={<div></div>} />
            <Route path="/register" Component={Registration} />
        </Routes>
    );
}

export default Router;
