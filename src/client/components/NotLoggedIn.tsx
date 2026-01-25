import { ExclamationTriangleIcon } from '@heroicons/react/24/solid';

function NotLoggedIn() {
    return (
        <div className="absolute h-[calc(100%-var(--header-height))] w-full flex p-10">
            <div className="mx-auto my-auto w-fit">
                <div className="flex gap-3">
                    <ExclamationTriangleIcon className="size-8" />
                    <h2 className="text-xl font-bold">Not logged in</h2>
                </div>
                <p className="mt-2">You were logged out of the application.</p>
                <p>Only one session is permitted per user simultaneously.</p>
            </div>
        </div>
    );
}

export default NotLoggedIn;
