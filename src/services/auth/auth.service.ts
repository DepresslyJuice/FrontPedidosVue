import axios from '@/services/axios.config';
import type { LoginResponse, LoginRequest, ChangePasswordRequest, ChangePasswordResponse } from '@/models/auth.model';

const API_URL = '/auth/login';

export const login = async (
    data: LoginRequest
): Promise<LoginResponse> => {
    const response = await axios.post<LoginResponse>(API_URL, data);
    return response.data;
}

export const changePassword = async (
    data: ChangePasswordRequest
): Promise<ChangePasswordResponse> => {
    const response = await axios.post<ChangePasswordResponse>('/auth/change-password', data);
    return response.data;
}
