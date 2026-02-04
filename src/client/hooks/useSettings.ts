import useApi from '@client/hooks/useApi.js';
import { SettingsResponse } from '@server/model/response/settings.js';

function useSettings() {
    const { data, error, isLoading } = useApi<SettingsResponse>(`/api/settings`);

    return { data, error, isLoading };
}

export default useSettings;
