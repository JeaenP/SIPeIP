import { NextResponse } from "next/server"
import { ObjectId } from "mongodb"
import clientPromise from "@/lib/mongodb"

export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const client = await clientPromise
    const db = client.db("planificacion")

    // Find all programs that have this project
    const programas = await db
      .collection("programas")
      .find({ proyectos: new ObjectId(params.id) })
      .toArray()

    // Get unique rucEntidad values from these programs
    const rucsEntidades = [...new Set(programas.flatMap((p) => p.rucEntidad))]

    // Get entidad details for each RUC
    const entidades = await db
      .collection("entidades")
      .find({ rucEntidad: { $in: rucsEntidades } })
      .project({ rucEntidad: 1, razonSocial: 1 })
      .toArray()

    return NextResponse.json(entidades)
  } catch (error) {
    console.error("Error:", error)
    return NextResponse.json({ error: "Error al obtener los coejecutores" }, { status: 500 })
  }
}

