import axios from "@/services/axios.config";
import type { RegisterRequest } from "@/models/auth.model";
import type { RegisterResponse } from "@/models/auth.model";

const API_URL = "/auth/register";

export const register = async(
    data: RegisterRequest
): Promise<RegisterResponse> => {
    const response = await axios.post<RegisterResponse>(API_URL, data);
    return response.data;
}
