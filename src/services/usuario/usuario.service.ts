import axios from '@/services/axios.config';
import type { UsuarioResponseDto } from '@/models/usuario.model';

export const getUsuarios = async (): Promise<UsuarioResponseDto> => {
    const response = await axios.get('/usuarios');
    return response.data;
};
