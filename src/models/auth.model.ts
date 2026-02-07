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


export interface RegisterRequest {
    nombre: string;
    email: string;
    password: string;
    cedula: string;
}


export interface RegisterResponse {
    user: {
        idUsuario: number;
        nombre: string;
        cedula: string;
        email: string;
        estado: string;
        roles: string[];
    };
    token?: string;
}

export interface RecoveryPasswordRequest {
    email: string;
}

export interface RecoveryPasswordResponse {
    message: string;
}


export interface ResetPasswordRequest {
    email: string;
    code: string;
    newPassword: string;
}

export interface ResetPasswordResponse {
    message: string;
}

export interface ChangePasswordRequest {
    currentPassword: string;
    newPassword: string;
}

export interface ChangePasswordResponse {
    message: string;
}
