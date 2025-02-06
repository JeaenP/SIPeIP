import { connectToDatabase } from './mongodb'
import type { Usuario } from './models/types'

export async function authenticateUser(cedula: string, password: string): Promise<{ success: boolean; user?: Usuario; error?: string }> {
  try {
    const { db } = await connectToDatabase()
    
    const user = await db.collection('usuarios').findOne({
      cedula: cedula,
      contraseña: password // Note: In production, use proper password hashing
    })

    if (!user) {
      return {
        success: false,
        error: 'Credenciales inválidas'
      }
    }

    return {
      success: true,
      user: user as Usuario
    }

  } catch (error) {
    console.error('Error en autenticación:', error)
    return {
      success: false,
      error: 'Error al autenticar usuario'
    }
  }
}

