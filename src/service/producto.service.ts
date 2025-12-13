import type { ProductosResponse } from '@/models/producto.model'

const API_URL = 'https://security-module.onrender.com/api/v1'

export const productoService = {
  async getProductos(activo = true, page = 1, limit = 10, sortBy = 'nombre', sortOrder = 'ASC'): Promise<ProductosResponse> {
    const params = new URLSearchParams({
      activo: activo.toString(),
      page: page.toString(),
      limit: limit.toString(),
      sortBy,
      sortOrder
    })
    
    const response = await fetch(`${API_URL}/productos?${params}`, {
      headers: {
        'Accept': 'application/json'
      }
    })
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }
    
    return response.json()
  }
}