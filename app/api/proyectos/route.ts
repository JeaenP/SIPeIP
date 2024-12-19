import { NextResponse } from 'next/server'
import { ObjectId } from 'mongodb'
import clientPromise from '@/lib/mongodb'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const rucEntidad = searchParams.get('rucEntidad')
    const programaId = searchParams.get('programaId')
    
    if (!rucEntidad) {
      return NextResponse.json(
        { error: 'RUC de entidad es requerido' },
        { status: 400 }
      )
    }

    const client = await clientPromise
    const db = client.db("planificacion")
    
    let proyectos = await db.collection('proyectos')
      .find({ rucEntidad })
      .toArray()

    if (programaId) {
      const programa = await db.collection('programas').findOne({ _id: new ObjectId(programaId) })
      if (programa) {
        proyectos = proyectos.map(proyecto => ({
          ...proyecto,
          asignado: proyecto.asignado === "si" || (programa.proyectos && programa.proyectos.includes(proyecto._id.toString()))
        }))
      }
    }
    
    return NextResponse.json(proyectos)

  } catch (error) {
    console.error('Error:', error)
    return NextResponse.json(
      { error: 'Error al obtener los proyectos' },
      { status: 500 }
    )
  }
}

