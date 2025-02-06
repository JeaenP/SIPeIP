import { cookies } from 'next/headers'
import { NextResponse } from "next/server"
import clientPromise from "@/lib/mongodb"

export async function GET(request: Request) {
  try {

    const userSession = cookies().get('user_session')
    const userData = userSession ? JSON.parse(userSession.value) : null
    const { searchParams } = new URL(request.url)
    const rucEntidad = userData.rucEntidad

    if (!rucEntidad) {
      return NextResponse.json({ error: "RUC de entidad es requerido" }, { status: 400 })
    }

    const client = await clientPromise
    const db = client.db("planificacion")

    const entidad = await db
      .collection("entidades")
      .findOne({ rucEntidad: rucEntidad }, { projection: { gastoCorrienteAsignado: 1, gastoCorrienteCodificado: 1 } })

    if (!entidad) {
      return NextResponse.json({ error: "Entidad no encontrada" }, { status: 404 })
    }

    return NextResponse.json({
      gastoCorrienteAsignado: entidad.gastoCorrienteAsignado || 0,
      gastoCorrienteCodificado: entidad.gastoCorrienteCodificado || 0,
    })
  } catch (error) {
    console.error("Error:", error)
    return NextResponse.json({ error: "Error al obtener datos de gasto corriente" }, { status: 500 })
  }
}

