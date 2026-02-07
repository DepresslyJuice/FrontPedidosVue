import axios from '@/services/axios.config'
import {
  type Pedido,
  type PedidosResponse,
  type CreatePedidoDto,
  type FilterPedidoDto,
  type EstadisticasPedidos,
  EstadoPedido
} from '@/models/pedido.model'

const API_URL = '/pedidos'

export const crearPedido = async (data: CreatePedidoDto): Promise<Pedido> => {
  const response = await axios.post<Pedido>(API_URL, data)
  return response.data
}

export const obtenerPedidos = async (filters?: FilterPedidoDto): Promise<PedidosResponse> => {
  const cleanFilters = filters ? Object.fromEntries(
    Object.entries(filters).filter(([_, value]) => value !== '' && value !== null && value !== undefined)
  ) : {}

  console.log('Obteniendo pedidos con filtros:', cleanFilters)
  const response = await axios.get<PedidosResponse>(API_URL, {
    params: cleanFilters
  })
  console.log('Respuesta pedidos:', response.data)
  return response.data
}

export const obtenerPedido = async (id: number): Promise<Pedido> => {
  const response = await axios.get<Pedido>(`${API_URL}/${id}`)
  return response.data
}

export const obtenerEstadisticas = async (): Promise<EstadisticasPedidos> => {
  const response = await axios.get<EstadisticasPedidos>(`${API_URL}/estadisticas`)
  return response.data
}

export const cambiarEstado = async (id: number, estado: EstadoPedido): Promise<Pedido> => {
  const response = await axios.patch<Pedido>(`${API_URL}/${id}/estado`, { estado })
  return response.data
}

export const cancelarPedido = async (id: number): Promise<Pedido> => {
  const response = await axios.patch<Pedido>(`${API_URL}/${id}/cancelar`)
  return response.data
}

export const eliminarPedido = async (id: number): Promise<void> => {
  await axios.delete(`${API_URL}/${id}`)
}