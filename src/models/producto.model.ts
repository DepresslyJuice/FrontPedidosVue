export interface Producto {
  idProducto: number
  nombre: string
  descripcion: string
  precio: string
  activo: boolean
  createdAt: string
  updatedAt: string
}

export interface CreateProductoDto {
  nombre: string
  descripcion: string
  precio: string
}

export interface UpdateProductoDto {
  nombre?: string
  descripcion?: string
  precio?: string
}

export interface FilterProductoDto {
  search?: string
  activo?: boolean
  page?: number
  limit?: number
  sortBy?: string
  sortOrder?: 'ASC' | 'DESC'
}

export interface ProductosResponse {
  data: Producto[]
  total: number
  page: number
  limit: number
  totalPages: number
}