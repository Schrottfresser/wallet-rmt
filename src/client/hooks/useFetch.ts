import apiCache from '@client/apiCache.js';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { ErrorResponse } from '@server/model/response/error.js';

export interface FetchError {
    status: number;
    statusText: string;
    body?: ErrorResponse;
}

interface State<T> {
    data?: T;
    error?: FetchError;
    loading: boolean;
}

const inflight = new Map<string, Promise<unknown>>();

function useFetch<T>(url: string, ttl?: number) {
    const [state, setState] = useState<State<T>>({ loading: true });
    const key = useMemo(() => url, [url]);

    const refetch = useCallback(() => {
        let promise = inflight.get(key);
        if (!promise) {
            promise = fetch(url, { cache: 'no-cache' })
                .then(async (res) => {
                    const json = await res.json();

                    if (!res.ok) {
                        const error: FetchError = {
                            status: res.status,
                            statusText: res.statusText,
                            body: json,
                        };

                        throw error;
                    }

                    apiCache.set(key, json, { ttl });
                    return json;
                })
                .finally(() => inflight.delete(key));

            inflight.set(key, promise);
        }

        promise
            .then((data) => {
                setState({
                    data: data as T,
                    loading: false,
                });
            })
            .catch((error) => {
                setState({
                    error: {
                        status: error?.status || 0,
                        statusText: error?.statusText || 'Network Error',
                        body: error?.body,
                    },
                    loading: false,
                });
            });
    }, [url, ttl]);

    useEffect(() => {
        const cached = apiCache.get(key);
        if (cached) {
            setState({
                data: cached as T,
                loading: false,
            });
        } else {
            refetch();
        }
    }, [url, refetch]);

    return {
        ...state,
        refetch,
    };
}

export default useFetch;
