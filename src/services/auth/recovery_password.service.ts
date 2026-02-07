import axios from '@/services/axios.config'
import type { RecoveryPasswordRequest, RecoveryPasswordResponse, ResetPasswordRequest, ResetPasswordResponse } from '@/models/auth.model'

export const recoveryPassword = async (
    data: RecoveryPasswordRequest
): Promise<RecoveryPasswordResponse> => {
    const response = await axios.post<RecoveryPasswordResponse>('/auth/password-recovery/request', data);
    return response.data;
}

export const resetPassword = async (
    data: ResetPasswordRequest
): Promise<ResetPasswordResponse> => {
    const response = await axios.post<ResetPasswordResponse>('/auth/password-recovery/reset', data);
    return response.data;
}

