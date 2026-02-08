import axios from '@/services/axios.config'
import type {
    Factura,
    CreateFacturaDto,
    UpdateFacturaDto,
    FacturaResponseDto,
    PaginatedFacturasResponseDto,
    FilterFacturaDto
} from '@/models/factura.model'

const API_URL = '/facturacion'

export const createFacturaDirecta = async (data: CreateFacturaDto): Promise<FacturaResponseDto> => {
    const response = await axios.post<FacturaResponseDto>(`${API_URL}/directa`, data)
    return response.data
}

export const obtenerFacturas = async (filters?: FilterFacturaDto): Promise<PaginatedFacturasResponseDto> => {
    // Clean filters to remove empty/null/undefined values
    const cleanFilters = filters ? Object.fromEntries(
        Object.entries(filters).filter(([_, value]) => value !== '' && value !== null && value !== undefined)
    ) : {}

    const response = await axios.get<PaginatedFacturasResponseDto>(API_URL, {
        params: cleanFilters
    })
    return response.data
}

export const obtenerFactura = async (id: number): Promise<FacturaResponseDto> => {
    const response = await axios.get<FacturaResponseDto>(`${API_URL}/${id}`)
    return response.data
}

export const actualizarEstadoFactura = async (id: number, data: UpdateFacturaDto): Promise<FacturaResponseDto> => {
    const response = await axios.patch<FacturaResponseDto>(`${API_URL}/${id}/estado`, data)
    return response.data
}

export const obtenerFacturaPorNumero = async (numero: string): Promise<FacturaResponseDto> => {
    const response = await axios.get<FacturaResponseDto>(`${API_URL}/numero/${numero}`)
    return response.data
}

export const obtenerFacturasCliente = async (idCliente: number): Promise<FacturaResponseDto[]> => {
    const response = await axios.get<FacturaResponseDto[]>(`${API_URL}/cliente/${idCliente}`)
    return response.data
}
