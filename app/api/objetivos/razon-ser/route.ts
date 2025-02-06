import { NextResponse } from "next/server"
import clientPromise from "@/lib/mongodb"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const rucEntidad = searchParams.get("rucEntidad")

    if (!rucEntidad) {
      return NextResponse.json({ error: "RUC de entidad es requerido" }, { status: 400 })
    }

    const client = await clientPromise
    const db = client.db("planificacion")

    const objetivos = await db
    .collection("objetivos")
    .find({
      tipo: "Razón de Ser",
    })
    .toArray();


    return NextResponse.json(objetivos)
  } catch (error) {
    console.error("Error:", error)
    return NextResponse.json({ error: "Error al obtener los objetivos" }, { status: 500 })
  }
}

