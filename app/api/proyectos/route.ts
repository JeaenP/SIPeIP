import { NextResponse } from "next/server"
import { ObjectId } from "mongodb"
import clientPromise from "@/lib/mongodb"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const programaId = searchParams.get("programaId")

    if (!programaId) {
      return NextResponse.json({ error: "ID del programa es requerido" }, { status: 400 })
    }

    const client = await clientPromise
    const db = client.db("planificacion")

    // Get the program to get its assigned projects
    const programa = await db.collection("programas").findOne({
      _id: new ObjectId(programaId),
    })

    if (!programa) {
      return NextResponse.json({ error: "Programa no encontrado" }, { status: 404 })
    }

    // Get all projects
    const proyectos = await db.collection("proyectos").find({}).toArray()

    // Mark projects as assigned based on program's proyectos array
    const proyectosConEstado = proyectos.map((proyecto) => ({
      ...proyecto,
      asignado: programa.proyectos?.some((id: ObjectId) => id.toString() === proyecto._id.toString()) ? "si" : "no",
    }))

    return NextResponse.json(proyectosConEstado)
  } catch (error) {
    console.error("Error:", error)
    return NextResponse.json({ error: "Error al obtener los proyectos" }, { status: 500 })
  }
}

