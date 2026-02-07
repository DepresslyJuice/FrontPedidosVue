export enum EstadoPedido {
  PENDIENTE = 'pendiente',
  CONFIRMADO = 'confirmado',
  EN_PROCESO = 'en_proceso',
  ENVIADO = 'enviado',
  ENTREGADO = 'entregado',
  CANCELADO = 'cancelado',
}

export interface DetallePedido {
  idDetalle?: number // Opcional al crear
  idProducto: number
  nombreProducto?: string // Viene del backend
  cantidad: number
  precioUnitario: number
  subtotal: number
}

export interface Pedido {
  idPedido: number
  idCliente: number
  nombreCliente?: string
  cedula?: string
  fecha: string | Date
  estado: EstadoPedido
  total: number
  metodoPago: string
  direccion?: string
  observaciones?: string
  detalles?: DetallePedido[]
}

export interface CreatePedidoDetalleDto {
  idProducto: number
  cantidad: number
}

export interface CreatePedidoDto {
  metodoPago: string
  direccion?: string
  observaciones?: string
  detalles: CreatePedidoDetalleDto[]
}

export interface UpdatePedidoDto {
  metodoPago?: string
  direccion?: string
  observaciones?: string
}

export interface UpdatePedidoEstadoDto {
  estado: EstadoPedido
}

export interface PedidosResponse {
  data: Pedido[]
  total: number
  page: number
  limit: number
  totalPages: number
}

export interface FilterPedidoDto {
  estado?: EstadoPedido
  fechaDesde?: string
  fechaHasta?: string
  page?: number
  limit?: number
  sortBy?: string
  sortOrder?: 'ASC' | 'DESC'
}

export interface EstadisticasPedidos {
  totalPedidos: number
  totalVentas: number
  porEstado: {
    pendientes: number
    confirmados: number
    enProceso: number
    enviados: number
    entregados: number
    cancelados: number
  }
}