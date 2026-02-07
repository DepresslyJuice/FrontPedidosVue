import axios from '@/services/axios.config'
import type { RecoveryPasswordRequest, RecoveryPasswordResponse } from '@/models/auth.model'

export const recoveryPassword = async (
    data: RecoveryPasswordRequest
): Promise<RecoveryPasswordResponse> => {
    const response = await axios.post<RecoveryPasswordResponse>('/auth/password-recovery/request', data);
    return response.data;
}

