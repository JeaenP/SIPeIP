import { NextResponse } from 'next/server'
import { ObjectId } from 'mongodb'
import clientPromise from '@/lib/mongodb'

export async function DELETE(
  request: Request,
  { params }: { params: { id: string; proyectoId: string } }
) {
  try {
    const client = await clientPromise
    const db = client.db("planificacion")
    
    // Remove project from program
    const result = await db.collection('programas').updateOne(
      { _id: new ObjectId(params.id) },
      { $pull: { proyectos: new ObjectId(params.proyectoId) } }
    )

    // Update project's asignado field
    await db.collection('proyectos').updateOne(
      { _id: new ObjectId(params.proyectoId) },
      { $set: { asignado: "no" } }
    )

    if (!result.matchedCount) {
      return NextResponse.json(
        { error: 'Programa no encontrado' },
        { status: 404 }
      )
    }
    
    return NextResponse.json({ 
      success: true,
      message: "Proyecto desasignado exitosamente"
    })

  } catch (error) {
    console.error('Error:', error)
    return NextResponse.json(
      { error: 'Error al desasignar el proyecto' },
      { status: 500 }
    )
  }
}

