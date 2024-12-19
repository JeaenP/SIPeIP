import { NextResponse } from 'next/server'
import clientPromise from '@/lib/mongodb'

export async function GET(
  request: Request,
  { params }: { params: { rucEntidad: string } }
) {
  try {
    const client = await clientPromise
    const db = client.db("planificacion")
    
    const entidad = await db.collection('entidades').findOne({
      rucEntidad: params.rucEntidad
    })
    
    if (!entidad) {
      return NextResponse.json(
        { error: 'Entidad no encontrada' },
        { status: 404 }
      )
    }
    
    return NextResponse.json(entidad)

  } catch (error) {
    console.error('Error:', error)
    return NextResponse.json(
      { error: 'Error al obtener la entidad' },
      { status: 500 }
    )
  }
}

