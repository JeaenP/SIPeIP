import { NextResponse } from 'next/server'
import clientPromise from '@/lib/mongodb'
import type { ObjetivoEstrategico } from '@/lib/models/types'

export async function GET() {
  try {
    const client = await clientPromise
    const db = client.db("planificacion")
    
    // Convert cursor to array before sending response
    const objetivos = await db.collection('objetivos').find({}).toArray()
    
    return NextResponse.json(objetivos)

  } catch (error) {
    console.error('Error:', error)
    return NextResponse.json(
      { error: 'Error al obtener los objetivos estratégicos' },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const client = await clientPromise
    const db = client.db("planificacion")
    const json = await request.json()

    const objetivo: ObjetivoEstrategico = {
      descripcion: json.descripcion,
      tipo: json.tipo,
      prioridad: json.prioridad,
      estado: json.estado || 'APROBADO SENPLADES',
      estrategias: json.estrategias || [],
      indicadores: json.indicadores || [],
      rucEntidad: json.rucEntidad,
    }

    const result = await db.collection('objetivos').insertOne(objetivo)
    
    return NextResponse.json({ 
      message: "Objetivo estratégico creado exitosamente",
      id: result.insertedId 
    })

  } catch (error) {
    console.error('Error:', error)
    return NextResponse.json(
      { error: 'Error al crear el objetivo estratégico' },
      { status: 500 }
    )
  }
}

