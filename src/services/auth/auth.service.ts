import axios from '@/services/axios.config';
import type { LoginResponse } from '@/models/auth.model';
import type { LoginRequest } from '@/models/auth.model';

const API_URL = '/auth/login';

export const login = async(
    data: LoginRequest
): Promise<LoginResponse> => {
    const response = await axios.post<LoginResponse>(API_URL, data);
    return response.data;
}
