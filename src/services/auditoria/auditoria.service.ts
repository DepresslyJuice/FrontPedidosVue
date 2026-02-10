import axios from '@/services/axios.config'
import type {
    Auditoria,
    FilterAuditoriaDto,
    AuditoriaResponse,
    EstadisticasAuditoria
} from '@/models/auditoria.model'

const API_URL = '/auditoria'

export const obtenerAuditorias = async (filters?: FilterAuditoriaDto): Promise<AuditoriaResponse> => {
    const cleanFilters = filters ? Object.fromEntries(
        Object.entries(filters).filter(([_, value]) => value !== '' && value !== null && value !== undefined)
    ) : {}

    const response = await axios.get<AuditoriaResponse>(API_URL, {
        params: cleanFilters
    })
    return response.data
}

export const obtenerHistorial = async (entidad: string, idEntidad: string | number): Promise<Auditoria[]> => {
    const response = await axios.get<Auditoria[]>(`${API_URL}/historial/${entidad}/${idEntidad}`)
    return response.data
}

export const obtenerEstadisticas = async (fechaDesde?: string, fechaHasta?: string): Promise<EstadisticasAuditoria> => {
    const params: any = {}
    if (fechaDesde) params.fechaDesde = fechaDesde
    if (fechaHasta) params.fechaHasta = fechaHasta

    const response = await axios.get<EstadisticasAuditoria>(`${API_URL}/estadisticas`, { params })
    return response.data
}
