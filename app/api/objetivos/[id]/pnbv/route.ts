import { NextResponse } from 'next/server'
import { ObjectId } from 'mongodb'
import clientPromise from '@/lib/mongodb'
import type { PNBVAlineacion } from '@/lib/models/types'

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const client = await clientPromise
    const db = client.db("planificacion")
    
    const objetivo = await db.collection('objetivos').findOne({
      _id: new ObjectId(params.id)
    })

    if (!objetivo) {
      return NextResponse.json(
        { error: 'Objetivo no encontrado' },
        { status: 404 }
      )
    }
    
    return NextResponse.json(objetivo.alineacionPNBV || null)

  } catch (error) {
    console.error('Error:', error)
    return NextResponse.json(
      { error: 'Error al obtener la alineación PNBV' },
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
    const alineacion: PNBVAlineacion = {
      objetivoId: json.objetivoId,
      objetivo: json.objetivo,
      politica: json.politica,
      metaPrincipal: json.metaPrincipal,
      programaNacional: json.programaNacional
    }

    const client = await clientPromise
    const db = client.db("planificacion")
    
    const result = await db.collection('objetivos').updateOne(
      { _id: new ObjectId(params.id) },
      { $set: { alineacionPNBV: alineacion } }
    )

    if (!result.matchedCount) {
      return NextResponse.json(
        { error: 'Objetivo no encontrado' },
        { status: 404 }
      )
    }
    
    return NextResponse.json({ 
      success: true,
      message: "Alineación PNBV guardada exitosamente"
    })

  } catch (error) {
    console.error('Error:', error)
    return NextResponse.json(
      { error: 'Error al guardar la alineación PNBV' },
      { status: 500 }
    )
  }
}

