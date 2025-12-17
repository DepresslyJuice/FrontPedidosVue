export interface DetallePedido {
  idDetalle: number
  idProducto: number
  nombreProducto: string
  cantidad: number
  precioUnitario: string
  subtotal: string
}

export interface Pedido {
  idPedido: number
  idCliente: number
  nombreCliente: string
  fecha: string
  estado: 'pendiente' | 'confirmado' | 'preparando' | 'listo' | 'entregado' | 'cancelado'
  total: number
  metodoPago: string
  direccion: string
  observaciones: string
  detalles?: DetallePedido[]
}

export interface CreatePedidoDto {
  metodoPago: string
  direccion: string
  observaciones?: string
  detalles: {
    idProducto: number
    cantidad: number
  }[]
}

export interface PedidosResponse {
  data: Pedido[]
  total: number
  page: number
  limit: number
  totalPages: number
}

export interface FilterPedidoDto {
  estado?: string
  fechaDesde?: string
  fechaHasta?: string
  page?: number
  limit?: number
}

export interface EstadisticasPedidos {
  totalPedidos: number
  totalVentas: number
  pedidosPorEstado: Record<string, number>
  ventasPorMes: Array<{
    mes: string
    ventas: number
  }>
}

export interface CambiarEstadoDto {
  estado: 'pendiente' | 'confirmado' | 'preparando' | 'listo' | 'entregado' | 'cancelado'
}