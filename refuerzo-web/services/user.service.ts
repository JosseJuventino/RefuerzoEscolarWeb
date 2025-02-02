import { api } from '@/lib/api';

import { ActivateAccountRequirements } from '@/types/types';


export const activeProfile = async (usuario: ActivateAccountRequirements): Promise<ActivateAccountRequirements> => {
  const response = await api.patch<ActivateAccountRequirements>('/users/me/profile', usuario);
  return response.data;
};