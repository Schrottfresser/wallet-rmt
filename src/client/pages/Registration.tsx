import useWebAuthn from '@client/hooks/useWebAuthn.js';
import { useState } from 'react';

export default function Registration() {
    const { register, login, addPasskey } = useWebAuthn();
    const [username, setUsername] = useState('');

    return (
        <div className="mx-auto mt-5 flex w-min gap-2">
            <input type="text" onChange={(event) => setUsername(event.target.value)} className="border-2 p-2" />
            <button className="bg-green-700 px-5 py-2 hover:cursor-pointer" onClick={() => register(username)}>
                Register
            </button>
            <button className="bg-blue-700 px-5 py-2 hover:cursor-pointer" onClick={() => login(username)}>
                Login
            </button>
            <button className="bg-orange-700 px-5 py-2 hover:cursor-pointer" onClick={() => addPasskey(username)}>
                Add
            </button>
        </div>
    );
}
