import { NextResponse } from 'next/server'
import { ObjectId } from 'mongodb'
import clientPromise from '@/lib/mongodb'

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const cliente = await clientPromise
    const baseDatos = cliente.db("planificacion")
    
    // Buscar el proyecto por su ID
    const proyecto = await baseDatos.collection('proyectos').findOne({
      _id: new ObjectId(params.id)
    })
    
    if (!proyecto) {
      return NextResponse.json(
        { error: 'Proyecto no encontrado' },
        { status: 404 }
      )
    }
    
    return NextResponse.json(proyecto)

  } catch (error) {
    console.error('Error:', error)
    return NextResponse.json(
      { error: 'Error al obtener el proyecto' },
      { status: 500 }
    )
  }
}

