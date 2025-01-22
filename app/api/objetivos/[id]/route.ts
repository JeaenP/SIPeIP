import { NextResponse } from 'next/server'
import { ObjectId } from 'mongodb'
import clientPromise from '@/lib/mongodb'
import type { ObjetivoEstrategico, Indicador } from '@/lib/models/types'

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const json = await request.json()
    const { descripcion, tipo, prioridad, estrategias, indicadores } = json

    if (!descripcion || !tipo || !prioridad) {
      return NextResponse.json(
        { error: 'Todos los campos son requeridos' },
        { status: 400 }
      )
    }

    // Validate indicadores structure
    if (indicadores) {
      for (const indicador of indicadores) {
        if (!indicador.nombre || !indicador.unidad_medida || !indicador.periodicidad) {
          return NextResponse.json(
            { error: 'Datos de indicador incompletos' },
            { status: 400 }
          )
        }

        // Validate metas structure
        if (indicador.metas) {
          for (const meta of indicador.metas) {
            if (!meta.periodo || !meta.valor) {
              return NextResponse.json(
                { error: 'Datos de meta incompletos' },
                { status: 400 }
              )
            }
          }
        }
      }
    }

    const client = await clientPromise
    const db = client.db("planificacion")
    
    const result = await db.collection('objetivos').updateOne(
      { _id: new ObjectId(params.id) },
      { 
        $set: { 
          descripcion,
          tipo,
          prioridad,
          estrategias,
          indicadores,
          estado: 'APROBADO SENPLADES'
        } 
      }
    )

    if (!result.matchedCount) {
      return NextResponse.json(
        { error: 'Objetivo no encontrado' },
        { status: 404 }
      )
    }
    
    return NextResponse.json({ 
      success: true,
      message: "Objetivo actualizado exitosamente"
    })

  } catch (error) {
    console.error('Error:', error)
    return NextResponse.json(
      { error: 'Error al actualizar el objetivo' },
      { status: 500 }
    )
  }
}

