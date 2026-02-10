export interface Rol {
    idRol: number;
    nombre: string;
    descripcion: string;
}

export interface Usuario {
    idUsuario: number;
    nombre: string;
    cedula: string;
    email: string;
    estado: string;
    roles: Rol[];
    createdAt: string;
    updatedAt: string;
}

export interface UsuarioResponseDto {
    data: Usuario[];
    meta: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
        hasNextPage: boolean;
        hasPreviousPage: boolean;
    };
}
