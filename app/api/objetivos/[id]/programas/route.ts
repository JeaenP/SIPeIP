import { NextResponse } from 'next/server'
import { ObjectId } from 'mongodb'
import clientPromise from '@/lib/mongodb'

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const client = await clientPromise
    const db = client.db("planificacion")
    
    // Get the objetivo to check its aligned programs
    const objetivo = await db.collection('objetivos').findOne({
      _id: new ObjectId(params.id)
    })

    if (!objetivo) {
      return NextResponse.json(
        { error: 'Objetivo no encontrado' },
        { status: 404 }
      )
    }

    // Get all programs for this entity
    const allProgramas = await db.collection('programas').find({}).toArray()

    // Convert objetivo.programas to array of ObjectId strings for comparison
    const programasAlineados = objetivo.programas?.map(id => id.toString()) || []

    // Split programs into aligned and available
    const programasDisponibles = allProgramas.filter(programa => 
      !programa.alineadoOEI && !programasAlineados.includes(programa._id.toString())
    )

    const programasYaAlineados = allProgramas.filter(programa =>
      programasAlineados.includes(programa._id.toString())
    )
    
    return NextResponse.json({
      programasDisponibles,
      programasAlineados: programasYaAlineados
    })

  } catch (error) {
    console.error('Error:', error)
    return NextResponse.json(
      { error: 'Error al obtener los programas' },
      { status: 500 }
    )
  }
}

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const json = await request.json()
    const { programaId } = json
    
    if (!programaId) {
      return NextResponse.json(
        { error: 'ID del programa es requerido' },
        { status: 400 }
      )
    }

    const client = await clientPromise
    const db = client.db("planificacion")
    
    // Start a session for the transaction
    const session = client.startSession()

    try {
      await session.withTransaction(async () => {
        // Add program to objetivo
        await db.collection('objetivos').updateOne(
          { _id: new ObjectId(params.id) },
          { $addToSet: { programas: new ObjectId(programaId) } },
          { session }
        )

        // Update program's alineadoOEI flag
        await db.collection('programas').updateOne(
          { _id: new ObjectId(programaId) },
          { $set: { alineadoOEI: true } },
          { session }
        )
      })
    } finally {
      await session.endSession()
    }
    
    return NextResponse.json({ 
      success: true,
      message: "Programa alineado exitosamente"
    })

  } catch (error) {
    console.error('Error:', error)
    return NextResponse.json(
      { error: 'Error al alinear el programa' },
      { status: 500 }
    )
  }
}

