import { NextResponse } from 'next/server'
import { ObjectId } from 'mongodb'
import clientPromise from '@/lib/mongodb'

export async function DELETE(
  request: Request,
  { params }: { params: { id: string; programaId: string } }
) {
  try {
    const client = await clientPromise
    const db = client.db("planificacion")
    
    // Start a session for the transaction
    const session = client.startSession()

    try {
      await session.withTransaction(async () => {
        // Remove program from objetivo
        await db.collection('objetivos').updateOne(
          { _id: new ObjectId(params.id) },
          { $pull: { programas: new ObjectId(params.programaId) } },
          { session }
        )

        // Update program's alineadoOEI flag
        await db.collection('programas').updateOne(
          { _id: new ObjectId(params.programaId) },
          { $set: { alineadoOEI: false } },
          { session }
        )
      })
    } finally {
      await session.endSession()
    }
    
    return NextResponse.json({ 
      success: true,
      message: "Programa desalineado exitosamente"
    })

  } catch (error) {
    console.error('Error:', error)
    return NextResponse.json(
      { error: 'Error al desalinear el programa' },
      { status: 500 }
    )
  }
}

