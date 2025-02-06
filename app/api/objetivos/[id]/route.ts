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
    const { 
      descripcion, 
      tipo, 
      prioridad, 
      estrategias, 
      indicadores,
      // Nuevos campos para actualización de metas
      indicadorIndex,
      metas 
    } = json

    const client = await clientPromise
    const db = client.db("planificacion")

    // Si recibimos indicadorIndex y metas, significa que estamos actualizando metas específicas
    if (indicadorIndex !== undefined && metas) {
      const objetivo = await db.collection('objetivos').findOne({
        _id: new ObjectId(params.id)
      })

      if (!objetivo) {
        return NextResponse.json(
          { error: 'Objetivo no encontrado' },
          { status: 404 }
        )
      }

      // Validar que el indicadorIndex es válido
      if (!objetivo.indicadores || !objetivo.indicadores[indicadorIndex]) {
        return NextResponse.json(
          { error: 'Indicador no encontrado' },
          { status: 400 }
        )
      }

      // Crear las nuevas metas con el formato correcto
      const nuevasMetas = [
        {
          periodo: metas.año,
          valor: metas.primerSemestre
        },
        {
          periodo: metas.año,
          valor: metas.segundoSemestre
        }
      ]

      // Actualizar solo las metas del indicador específico
      const indicadoresActualizados = [...objetivo.indicadores]
      if (!indicadoresActualizados[indicadorIndex].metas) {
        indicadoresActualizados[indicadorIndex].metas = []
      }
      indicadoresActualizados[indicadorIndex].metas.push(...nuevasMetas)

      const result = await db.collection('objetivos').updateOne(
        { _id: new ObjectId(params.id) },
        {
          $set: {
            indicadores: indicadoresActualizados
          }
        }
      )

      if (!result.matchedCount) {
        return NextResponse.json(
          { error: 'No se pudo actualizar las metas' },
          { status: 400 }
        )
      }

      return NextResponse.json({
        success: true,
        message: "Metas actualizadas exitosamente"
      })
    }

    // Si no recibimos indicadorIndex y metas, procedemos con la actualización normal del objetivo
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

