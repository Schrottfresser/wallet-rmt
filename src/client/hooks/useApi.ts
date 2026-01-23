import useSWR from 'swr';
import { ErrorResponse } from '@server/model/response/error.js';
import { parseJSON } from '@client/helpers/json.js';

export interface FetchError {
    status: number;
    statusText: string;
    body?: ErrorResponse;
}

function useApi<T>(url: string) {
    const fetcher = async (url: string) => {
        const res = await fetch(url, { cache: 'no-store' });
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

    const { data, error, isLoading, mutate } = useSWR<T, FetchError>(url, fetcher);

    return {
        data,
        error,
        isLoading,
        mutate,
    };
}

export default useApi;
