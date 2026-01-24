import { parseJSON } from '@client/helpers/json.js';
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
        body: JSON.stringify(body),
    });
    const text = await res.text();
    const json = parseJSON(text);

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
