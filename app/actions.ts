'use server'

import { connectToDatabase } from '@/lib/mongodb'
import type { Entidad } from '@/lib/models/types'

export async function getEntidadByRuc(rucEntidad: string): Promise<{ success: boolean; data?: Entidad; error?: string }> {
  try {
    console.log('Buscando entidad con RUC:', rucEntidad)
    const { db } = await connectToDatabase()
    
    const entidad = await db.collection('entidades').findOne({ rucEntidad })
    
    if (!entidad) {
      console.log('No se encontró la entidad')
      return {
        success: false,
        error: 'Entidad no encontrada'
      }
    }

    console.log('Entidad encontrada:', entidad)
    return {
      success: true,
      data: entidad as Entidad
    }
  } catch (error) {
    console.error('Error al obtener entidad:', error)
    return {
      success: false,
      error: 'Error al obtener la entidad'
    }
  }
}

export async function updateEntidad(formData: FormData): Promise<{ success: boolean; message: string; error?: any }> {
  try {
    const { db } = await connectToDatabase()
    
    const rucEntidad = formData.get('rucEntidad') as string
    console.log('Actualizando entidad con RUC:', rucEntidad)
    
    const updateData: Partial<Entidad> = {
      codigoEntidadFinanciera: formData.get('codigoEntidadFinanciera') as string,
      codigoADM: formData.get('codigoADM') as string,
      numeroRegistroOficial: Number(formData.get('numeroRegistroOficial')),
      consejo: formData.get('consejo') as string,
      zona: formData.get('zona') as string,
      tipoNorma: formData.get('tipoNorma') as string,
      descripcionTipoNorma: formData.get('descripcionTipoNorma') as string,
      estado: formData.get('estado') as string,
      estructuraOrganizacional: formData.get('estructuraOrganizacional') as string,
      funcion: formData.get('funcion') as string,
      funcionInstitucional: formData.get('funcionInstitucional') as string,
      gpr: formData.get('gpr') === 'true',
      mision: formData.get('mision') as string,
      nombre: formData.get('nombre') as string,
      razonSocial: formData.get('razonSocial') as string,
      sector: formData.get('sector') as string,
      tipoInstitucion: formData.get('tipoInstitucion') as string,
      vision: formData.get('vision') as string,
    }

    console.log('Datos a actualizar:', updateData)

    const result = await db.collection('entidades').updateOne(
      { rucEntidad },
      { $set: updateData }
    )

    console.log('Resultado de actualización:', result)

    if (!result.matchedCount) {
      throw new Error('No se encontró la entidad para actualizar')
    }

    return {
      success: true,
      message: 'Entidad actualizada exitosamente'
    }

  } catch (error) {
    console.error('Error al actualizar entidad:', error)
    return {
      success: false,
      message: 'Error al actualizar la entidad',
      error: error instanceof Error ? error.message : 'Error desconocido'
    }
  }
}

