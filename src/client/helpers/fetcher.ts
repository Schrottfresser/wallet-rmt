import { bigIntReplacer, bigIntReviver } from '@server/util/json.js';
import { FetchError } from '@client/hooks/useApi.js';

type APIMethod = 'GET' | 'POST' | 'DELETE';

const fetcher = async <T>(url: string, method: APIMethod = 'GET', body?: unknown, additionalHeaders?: HeadersInit) => {
    const headers: HeadersInit = {
        ...additionalHeaders,
        ...(body ? { 'Content-Type': 'application/json' } : {}),
    };

    const res = await fetch(url, {
        method,
        headers,
        body: JSON.stringify(body, bigIntReplacer),
    });
    const text = await res.text();
    const json = JSON.parse(text, bigIntReviver);

    if (!res.ok) {
        const error: FetchError = {
            status: res.status,
            statusText: res.statusText,
            body: json,
        };

        throw error;
    }

    return json as T;
};

export default fetcher;
