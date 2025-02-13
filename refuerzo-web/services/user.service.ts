import { api } from '@/lib/api';

import { ActivateAccountRequirements, RequestPassResponse } from '@/types/types';


export const activeProfile = async (usuario: ActivateAccountRequirements): Promise<ActivateAccountRequirements> => {
  const response = await api.patch<ActivateAccountRequirements>('/users/me/profile', usuario);
  
  return response.data;
};

export const deleteUser = async (id: string): Promise<void> => {
  await api.delete(`/users/${id}`);
}

export const requestPasswordReset = async (email: string, token : string): Promise<RequestPassResponse> => {
  const response = await api.post<RequestPassResponse>('/users/request-password-reset', { email, token });
  return response.data;
}

export const resetPassword = async (token: string, newPassword: string): Promise<void> => {
  try {
    const response = await api.post("/users/reset-password", { token, newPassword });
    return response.data;
  } catch {
    throw new Error("Error al restablecer la contraseña");
  }
};