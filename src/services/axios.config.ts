import axios from 'axios'

// Configuración global de axios
axios.defaults.baseURL = 'https://security-module.onrender.com/api/v1'
//axios.defaults.baseURL = 'http://localhost:3000/api/v1'
axios.defaults.withCredentials = true
axios.defaults.headers.common['Content-Type'] = 'application/json'

// Interceptor para agregar token de autorización
axios.interceptors.request.use(
  (config) => {
    const user = localStorage.getItem('user')
    const token = localStorage.getItem('token')
    
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    
    console.log('Request headers:', config.headers)
    console.log('Request cookies:', document.cookie)
    console.log('Token:', token)
    return config
  },
  (error) => Promise.reject(error)
)

// Interceptor para manejar errores de autenticación
axios.interceptors.response.use(
  (response) => response,
  (error) => {
    // Solo limpiar localStorage en 401, pero no redirigir automáticamente
    if (error.response?.status === 401) {
      console.log('Error 401 - Token expirado o inválido')
    }
    return Promise.reject(error)
  }
)

export default axios