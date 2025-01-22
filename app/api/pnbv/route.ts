import { NextResponse } from 'next/server'
import clientPromise from '@/lib/mongodb'
import type { PNBV } from '@/lib/models/types'

export async function GET() {
  try {
    const client = await clientPromise
    const db = client.db("planificacion")
    
    const pnbvs = await db.collection('PNBVs').find({}).toArray()
    
    return NextResponse.json(pnbvs)

  } catch (error) {
    console.error('Error:', error)
    return NextResponse.json(
      { error: 'Error al obtener los planes nacionales' },
      { status: 500 }
    )
  }
}

