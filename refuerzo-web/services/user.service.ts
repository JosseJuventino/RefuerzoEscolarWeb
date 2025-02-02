import { api } from '@/lib/api';

import { ActivateAccountRequirements } from '@/types/types';


export const activeProfile = async (usuario: ActivateAccountRequirements): Promise<ActivateAccountRequirements> => {
  console.log(usuario)
  const response = await api.patch<ActivateAccountRequirements>('/users/me/profile', usuario);
  
  return response.data;
};