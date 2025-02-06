import { NextResponse } from 'next/server'
import clientPromise from '@/lib/mongodb'
import type { Entidad } from '@/lib/models/types'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export async function GET(
  request: Request,
  { params }: { params: { rucEntidad: string } }
) {
  try {
    const client = await clientPromise
    const db = client.db("planificacion")
    
    const entidad = await db.collection('entidades').findOne({
      rucEntidad: params.rucEntidad
    })
    
    if (!entidad) {
      return NextResponse.json(
        { error: 'Entidad no encontrada' },
        { status: 404 }
      )
    }
    
    return NextResponse.json(entidad)

  } catch (error) {
    console.error('Error:', error)
    return NextResponse.json(
      { error: 'Error al obtener la entidad' },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: Request,
  { params }: { params: { rucEntidad: string } }
) {
  try {
    const client = await clientPromise
    const db = client.db("planificacion")
    const json = await request.json()
    
    const updateData: Partial<Entidad> = {
      codigoEntidadFinanciera: json.codigoEntidadFinanciera,
      codigoADM: json.codigoADM,
      numeroRegistroOficial: Number(json.numeroRegistroOficial),
      consejo: json.consejo,
      zona: json.zona,
      tipoNorma: json.tipoNorma,
      descripcionTipoNorma: json.descripcionTipoNorma,
      estado: json.estado,
      estructuraOrganizacional: json.estructuraOrganizacional,
      funcion: json.funcion,
      funcionInstitucional: json.funcionInstitucional,
      gpr: json.gpr === 'true',
      mision: json.mision,
      nombre: json.nombre,
      razonSocial: json.razonSocial,
      sector: json.sector,
      tipoInstitucion: json.tipoInstitucion,
      vision: json.vision,
    }

    const result = await db.collection('entidades').updateOne(
      { rucEntidad: params.rucEntidad },
      { $set: updateData }
    )

    if (!result.matchedCount) {
      return NextResponse.json(
        { error: 'No se encontró la entidad para actualizar' },
        { status: 404 }
      )
    }

    return NextResponse.json({ 
      success: true,
      message: 'Entidad actualizada exitosamente'
    })

  } catch (error) {
    console.error('Error:', error)
    return NextResponse.json(
      { error: 'Error al actualizar la entidad' },
      { status: 500 }
    )
  }
}

