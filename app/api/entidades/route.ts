import { NextResponse } from 'next/server'
import clientPromise from '@/lib/mongodb'
import type { Entidad } from '@/lib/models/types'

export async function POST(request: Request) {
  try {
    const client = await clientPromise
    const db = client.db("planificacion")
    const json = await request.json()

    const entidad: Entidad = {
      codigoADM: json.codigoADM,
      codigoEntidadFinanciera: json.codigoEntidadFinanciera,
      consejo: json.consejo,
      descripcionTipoNorma: json.descripcionTipoNorma,
      estado: json.estado || 'activo',
      estructuraOrganizacional: json.estructuraOrganizacional,
      funcion: json.funcion,
      gpr: json.gpr || false,
      mision: json.mision,
      nombreEnteSector: json.nombreEnteSector,
      numeroEntidad: json.numeroEntidad,
      numeroRegistroOficial: json.numeroRegistroOficial,
      programas: [],
      razonSocial: json.razonSocial,
      rucEntidad: json.rucEntidad,
      tipoInstitucion: json.tipoInstitucion,
      tipoNorma: json.tipoNorma,
      vision: json.vision,
      zona: json.zona,
    }

    const result = await db.collection('entidades').insertOne(entidad)
    
    return NextResponse.json({ 
      message: "Entidad creada exitosamente",
      id: result.insertedId 
    })

  } catch (error) {
    console.error('Error:', error)
    return NextResponse.json(
      { error: 'Error al crear la entidad' },
      { status: 500 }
    )
  }
}

export async function GET() {
  try {
    const client = await clientPromise
    const db = client.db("planificacion")
    
    const entidades = await db.collection('entidades').find({}).toArray()
    
    return NextResponse.json(entidades)

  } catch (error) {
    console.error('Error:', error)
    return NextResponse.json(
      { error: 'Error al obtener las entidades' },
      { status: 500 }
    )
  }
}

