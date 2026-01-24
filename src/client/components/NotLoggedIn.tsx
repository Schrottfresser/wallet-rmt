import { ExclamationTriangleIcon } from '@heroicons/react/24/solid';

function NotLoggedIn() {
    return (
        <div className="absolute top-1/2 left-1/2 -translate-1/2 w-1/4">
            <div className="flex gap-3">
                <ExclamationTriangleIcon className="size-8" />
                <h2 className="text-xl font-bold">Not logged in</h2>
            </div>
            <p className="mt-2">Please login in order to use the application.</p>
        </div>
    );
}

export default NotLoggedIn;
