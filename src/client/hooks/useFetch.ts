import apiCache from '@client/apiCache.js';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { ErrorResponse } from '@server/model/response/error.js';

export interface FetchError {
    status: number;
    statusText: string;
    body?: ErrorResponse;
}

type RESTMethod = 'GET' | 'POST' | 'DELETE';

interface State<T> {
    data?: T;
    error?: FetchError;
    loading: boolean;
}

const inflight = new Map<string, Promise<any>>();

function useFetch<T>(url: string, method: RESTMethod = 'GET', ttl?: number) {
    const [state, setState] = useState<State<T>>({ loading: true });
    const key = useMemo(() => url, [url]);

    const refetch = useCallback(() => {
        let promise = inflight.get(key);
        if (!promise) {
            promise = fetch(url, { method, cache: 'no-cache' })
                .then(async (res) => {
                    const json = await res.json().catch((error) => {
                        throw error;
                    });

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
            .then((data: T) => {
                setState({
                    data,
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
    }, [url, method, ttl]);

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
    }, [url]);

    return {
        ...state,
        refetch,
    };
}

export default useFetch;
