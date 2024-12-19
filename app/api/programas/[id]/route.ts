import { NextResponse } from 'next/server'
import { ObjectId } from 'mongodb'
import clientPromise from '@/lib/mongodb'

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const json = await request.json()
    const { nombre, descripcion, codigoMF, tipo, entidad } = json

    if (!nombre || !descripcion || !codigoMF || !tipo || !entidad) {
      return NextResponse.json(
        { error: 'Todos los campos son requeridos' },
        { status: 400 }
      )
    }

    const client = await clientPromise
    const db = client.db("planificacion")
    
    const result = await db.collection('programas').updateOne(
      { _id: new ObjectId(params.id) },
      { 
        $set: { 
          nombre, 
          descripcion, 
          codigoMF, 
          tipo, 
          entidad 
        } 
      }
    )

    if (!result.matchedCount) {
      return NextResponse.json(
        { error: 'Programa no encontrado' },
        { status: 404 }
      )
    }
    
    return NextResponse.json({ 
      success: true,
      message: "Programa actualizado exitosamente"
    })

  } catch (error) {
    console.error('Error:', error)
    return NextResponse.json(
      { error: 'Error al actualizar el programa' },
      { status: 500 }
    )
  }
}

