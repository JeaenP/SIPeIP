import { NextResponse } from "next/server"
import { ObjectId } from "mongodb"
import clientPromise from "@/lib/mongodb"

export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const client = await clientPromise
    const db = client.db("planificacion")

    // Find all programs that have this project to get the programId
    const programa = await db.collection("programas").findOne({
      proyectos: new ObjectId(params.id),
    })

    if (!programa) {
      return NextResponse.json({ error: "Programa no encontrado para este proyecto" }, { status: 404 })
    }

    // Get the project details
    const proyecto = await db.collection("proyectos").findOne({
      _id: new ObjectId(params.id),
    })

    if (!proyecto) {
      return NextResponse.json({ error: "Proyecto no encontrado" }, { status: 404 })
    }

    // Add programId to project data
    return NextResponse.json({
      ...proyecto,
      programaId: programa._id.toString(),
    })
  } catch (error) {
    console.error("Error:", error)
    return NextResponse.json({ error: "Error al obtener el proyecto" }, { status: 500 })
  }
}

