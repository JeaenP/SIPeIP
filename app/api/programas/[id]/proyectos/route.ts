import { NextResponse } from 'next/server'
import { ObjectId } from 'mongodb'
import clientPromise from '@/lib/mongodb'

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const json = await request.json()
    const { proyectoId } = json
    
    if (!proyectoId) {
      return NextResponse.json(
        { error: 'ID del proyecto es requerido' },
        { status: 400 }
      )
    }

    const client = await clientPromise
    const db = client.db("planificacion")
    
    // Add project to program
    const result = await db.collection('programas').updateOne(
      { _id: new ObjectId(params.id) },
      { $addToSet: { proyectos: new ObjectId(proyectoId) } }
    )

    // Update project's asignado field
    await db.collection('proyectos').updateOne(
      { _id: new ObjectId(proyectoId) },
      { $set: { asignado: "si" } }
    )

    if (!result.matchedCount) {
      return NextResponse.json(
        { error: 'Programa no encontrado' },
        { status: 404 }
      )
    }
    
    return NextResponse.json({ 
      success: true,
      message: "Proyecto asignado exitosamente"
    })

  } catch (error) {
    console.error('Error:', error)
    return NextResponse.json(
      { error: 'Error al asignar el proyecto' },
      { status: 500 }
    )
  }
}

