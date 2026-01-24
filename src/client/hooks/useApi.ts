import useSWR from 'swr';
import { ErrorResponse } from '@server/model/response/error.js';
import fetcher from '@client/helpers/fetcher.js';

export interface FetchError {
    status: number;
    statusText: string;
    body?: ErrorResponse;
}

function useApi<T>(url: string) {
    const { data, error, isLoading, mutate } = useSWR<T, FetchError>(url, fetcher);

    return {
        data,
        error,
        isLoading,
        mutate,
    };
}

export default useApi;
