import { api } from '@/lib/api';

import { LoginAttempt } from '@/types/types';

export const getLoginAttempt = async (): Promise<LoginAttempt[]> => {
    const response = await api.get<{ data: LoginAttempt[] }>('/auth/logs');
    return response.data.data;
};
