export enum AccionAuditoria {
    LOGIN = 'login',
    LOGOUT = 'logout',
    CREATE = 'create',
    UPDATE = 'update',
    DELETE = 'delete',
    APPROVE = 'approve',
    CANCEL = 'cancel',
    CHANGE_STATUS = 'change_status'
}

export interface Auditoria {
    idAuditoria: string
    entidad: string
    idEntidad: string
    accion: AccionAuditoria | string
    usuarioId: number
    usuarioEmail: string
    datosAnteriores: any | null
    datosNuevos: any | null
    ip: string
    userAgent: string | null
    fecha: string | Date
    detalles: string | null
}

export interface FilterAuditoriaDto {
    entidad?: string
    idEntidad?: string
    accion?: AccionAuditoria | string
    usuarioId?: number
    fechaDesde?: string
    fechaHasta?: string
    page?: number
    limit?: number
}

export interface AuditoriaResponse {
    data: Auditoria[]
    total: number
    page: number
    limit: number
    totalPages: number
}

export interface EstadisticasAuditoria {
    total: number
    porAccion: Array<{ accion: string; total: number }>
    porEntidad: Array<{ entidad: string; total: number }>
    usuariosActivos: number
}
