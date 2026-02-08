export enum EstadoFactura {
    EMITIDA = 'EMITIDA',
    PAGADA = 'PAGADA',
    ANULADA = 'ANULADA',
}

export interface DetalleFactura {
    idDetalle: number
    idFactura: number
    idProducto: number
    nombreProducto: string
    cantidad: number
    precioUnitario: number
    descuento: number
    subtotal: number
}

export interface Factura {
    idFactura: number
    numeroFactura: string
    idPedido?: number | null
    idCliente: number
    nombreCliente: string
    cedula: string
    direccion: string // Changed from direccionCliente to match likely backend entity
    telefono: string
    email: string // Changed from correoCliente
    fechaEmision: string | Date // Changed from fecha
    subtotal: number
    descuento: number
    porcentajeIva: number
    iva: number
    total: number
    formaPago: string
    estado: EstadoFactura
    observaciones?: string
    fechaAutorizacion?: string | Date
    detalles?: DetalleFactura[]
}

export interface CreateFacturaDetalleDto {
    idProducto: number
    cantidad: number
    precioUnitario: number // Often backend re-validates, but frontend might send it
    descuento?: number
}

export interface CreateFacturaDto {
    idCliente: number
    nombreCliente: string
    cedula: string
    direccion?: string
    telefono?: string
    email?: string
    formaPago: string
    observaciones?: string
    descuento?: number
    detalles: CreateFacturaDetalleDto[]
}

export interface UpdateFacturaDto {
    estado?: EstadoFactura
    observaciones?: string
}

export interface FacturaResponseDto { // Often same as Factura, but could differ
    idFactura: number
    numeroFactura: string
    // ... other fields
    estado: EstadoFactura
}

export interface PaginatedFacturasResponseDto {
    data: Factura[]
    total: number
    page: number
    limit: number
    totalPages: number
}

export interface FilterFacturaDto {
    estado?: EstadoFactura
    fechaDesde?: string
    fechaHasta?: string
    page?: number
    limit?: number
    numeroFactura?: string // Search by number
}