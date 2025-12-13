export interface Producto {
  idProducto: number
  nombre: string
  descripcion: string
  precio: string
  activo: boolean
  createdAt: string
  updatedAt: string
}

export interface ProductosResponse {
  data: Producto[]
  total: number
  page: number
  limit: number
  totalPages: number
}