import { NextResponse } from 'next/server'
import clientPromise from '@/lib/mongodb'
import type { Programa } from '@/lib/models/types'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const rucEntidad = searchParams.get('rucEntidad')
    
    if (!rucEntidad) {
      return NextResponse.json(
        { error: 'RUC de entidad es requerido' },
        { status: 400 }
      )
    }

    const client = await clientPromise
    const db = client.db("planificacion")
    
    const programas = await db.collection('programas')
      .find({ rucEntidad })
      .sort({ numero: 1 })
      .toArray()
    
    return NextResponse.json(programas)

  } catch (error) {
    console.error('Error:', error)
    return NextResponse.json(
      { error: 'Error al obtener los programas' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')
    
    if (!id) {
      return NextResponse.json(
        { error: 'ID del programa es requerido' },
        { status: 400 }
      )
    }

    const client = await clientPromise
    const db = client.db("planificacion")
    
    const result = await db.collection('programas').deleteOne({
      _id: id
    })

    if (result.deletedCount === 0) {
      return NextResponse.json(
        { error: 'Programa no encontrado' },
        { status: 404 }
      )
    }
    
    return NextResponse.json({ 
      message: "Programa eliminado exitosamente"
    })

  } catch (error) {
    console.error('Error:', error)
    return NextResponse.json(
      { error: 'Error al eliminar el programa' },
      { status: 500 }
    )
  }
}

