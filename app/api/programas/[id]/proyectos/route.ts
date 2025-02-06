import { NextResponse } from "next/server"
import { ObjectId } from "mongodb"
import clientPromise from "@/lib/mongodb"

export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const client = await clientPromise
    const db = client.db("planificacion")

    // Get the program
    const programa = await db.collection("programas").findOne({
      _id: new ObjectId(params.id),
    })

    if (!programa) {
      return NextResponse.json({ error: "Programa no encontrado" }, { status: 404 })
    }

    // Get all projects that are not assigned to any program (asignado = "no")
    // and the ones assigned to this specific program
    const proyectos = await db
      .collection("proyectos")
      .find({
        $or: [{ asignado: "no" }, { _id: { $in: programa.proyectos?.map((id) => new ObjectId(id)) || [] } }],
      })
      .toArray()

    // Split into assigned and available based on program's proyectos array
    const proyectosAsignados = proyectos.filter((proyecto) =>
      programa.proyectos?.some((id: ObjectId) => id.toString() === proyecto._id.toString()),
    )

    const proyectosDisponibles = proyectos.filter(
      (proyecto) => !programa.proyectos?.some((id: ObjectId) => id.toString() === proyecto._id.toString()),
    )

    return NextResponse.json({
      proyectosAsignados,
      proyectosDisponibles,
    })
  } catch (error) {
    console.error("Error:", error)
    return NextResponse.json({ error: "Error al obtener los proyectos" }, { status: 500 })
  }
}

export async function POST(request: Request, { params }: { params: { id: string } }) {
  try {
    const json = await request.json()
    const { proyectoId } = json

    if (!proyectoId) {
      return NextResponse.json({ error: "ID del proyecto es requerido" }, { status: 400 })
    }

    const client = await clientPromise
    const db = client.db("planificacion")

    // Verify project is not already assigned
    const proyecto = await db.collection("proyectos").findOne({
      _id: new ObjectId(proyectoId),
    })

    if (!proyecto) {
      return NextResponse.json({ error: "Proyecto no encontrado" }, { status: 404 })
    }

    if (proyecto.asignado === "si") {
      return NextResponse.json({ error: "El proyecto ya está asignado a un programa" }, { status: 400 })
    }

    // Start a session for the transaction
    const session = client.startSession()

    try {
      await session.withTransaction(async () => {
        // Add project to program
        await db
          .collection("programas")
          .updateOne(
            { _id: new ObjectId(params.id) },
            { $addToSet: { proyectos: new ObjectId(proyectoId) } },
            { session },
          )

        // Update project's asignado status
        await db
          .collection("proyectos")
          .updateOne({ _id: new ObjectId(proyectoId) }, { $set: { asignado: "si" } }, { session })
      })
    } finally {
      await session.endSession()
    }

    return NextResponse.json({
      success: true,
      message: "Proyecto asignado exitosamente",
    })
  } catch (error) {
    console.error("Error:", error)
    return NextResponse.json({ error: "Error al asignar el proyecto" }, { status: 500 })
  }
}

export async function DELETE(request: Request, { params }: { params: { id: string; proyectoId: string } }) {
  try {
    const client = await clientPromise
    const db = client.db("planificacion")

    // Start a session for the transaction
    const session = client.startSession()

    try {
      await session.withTransaction(async () => {
        // Remove project from program
        await db
          .collection("programas")
          .updateOne(
            { _id: new ObjectId(params.id) },
            { $pull: { proyectos: new ObjectId(params.proyectoId) } },
            { session },
          )

        // Check if project is assigned to any other program
        const otherPrograms = await db.collection("programas").findOne({
          _id: { $ne: new ObjectId(params.id) },
          proyectos: new ObjectId(params.proyectoId),
        })

        // Only update asignado status if not assigned to other programs
        if (!otherPrograms) {
          await db
            .collection("proyectos")
            .updateOne({ _id: new ObjectId(params.proyectoId) }, { $set: { asignado: "no" } }, { session })
        }
      })
    } finally {
      await session.endSession()
    }

    return NextResponse.json({
      success: true,
      message: "Proyecto desasignado exitosamente",
    })
  } catch (error) {
    console.error("Error:", error)
    return NextResponse.json({ error: "Error al desasignar el proyecto" }, { status: 500 })
  }
}

