import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { authenticateUser } from '@/lib/auth'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { cedula, password } = body

    const result = await authenticateUser(cedula, password)

    if (!result.success) {
      return NextResponse.json(
        { error: result.error },
        { status: 401 }
      )
    }

    // Set session cookie
    cookies().set('user_session', JSON.stringify({
      cedula: result.user?.cedula,
      rucEntidad: result.user?.rucEntidad
    }), {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 // 24 hours
    })

    return NextResponse.json({
      success: true,
      user: {
        cedula: result.user?.cedula,
        rucEntidad: result.user?.rucEntidad
      }
    })

  } catch (error) {
    console.error('Error en login:', error)
    return NextResponse.json(
      { error: 'Error al procesar el login' },
      { status: 500 }
    )
  }
}

