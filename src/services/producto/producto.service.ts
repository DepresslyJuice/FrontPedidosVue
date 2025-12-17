import axios from '@/services/axios.config'
import type { 
  Producto, 
  ProductosResponse, 
  CreateProductoDto, 
  UpdateProductoDto, 
  FilterProductoDto 
} from '@/models/producto.model'

const API_URL = '/productos'

export const getProductos = async (filters?: FilterProductoDto): Promise<ProductosResponse> => {
  console.log('Getting productos with filters:', filters)
  const cleanFilters = filters ? Object.fromEntries(
    Object.entries(filters).filter(([_, value]) => value !== '' && value !== null && value !== undefined)
  ) : {}
  
  const response = await axios.get<ProductosResponse>(API_URL, {
    params: cleanFilters
  })
  console.log('Productos response:', response.data)
  return response.data
}

export const getProducto = async (id: number): Promise<Producto> => {
  const response = await axios.get<Producto>(`${API_URL}/${id}`)
  return response.data
}

export const createProducto = async (data: CreateProductoDto): Promise<Producto> => {
  const response = await axios.post<Producto>(API_URL, data)
  return response.data
}

export const updateProducto = async (id: number, data: UpdateProductoDto): Promise<Producto> => {
  console.log('Updating producto:', id, data)
  const response = await axios.patch<Producto>(`${API_URL}/${id}`, data)
  console.log('Update response:', response.data)
  return response.data
}

export const deleteProducto = async (id: number): Promise<void> => {
  await axios.delete(`${API_URL}/${id}`)
}

export const toggleProductoActivo = async (id: number): Promise<Producto> => {
  const response = await axios.patch<Producto>(`${API_URL}/${id}/toggle-activo`, {})
  return response.data
}