import { Route, Routes } from 'react-router';
import Register from './pages/Register.js';
import index from './pages/index.js';

function Router() {
    return (
        <Routes>
            <Route index Component={index} />
            <Route path="/register" Component={Register} />
        </Routes>
    );
}

export default Router;
