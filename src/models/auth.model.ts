export interface LoginRequest {
    email: string;
    password: string;  
}

export interface LoginResponse {
    user: {
        idUsuario: number;
        nombre: string;
        email: string;
        estado: string;
        roles: string[];
    };
    token?: string;
}   