import { NextResponse } from "next/server"
import { ObjectId } from "mongodb"
import clientPromise from "@/lib/mongodb"
import type { Producto } from "@/lib/models/types"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const programaId = searchParams.get("programaId")

    if (!programaId) {
      return NextResponse.json({ error: "ID del programa es requerido" }, { status: 400 })
    }

    const client = await clientPromise
    const db = client.db("planificacion")

    const productos = await db.collection("productos").find({ programaId }).toArray()

    return NextResponse.json(productos)
  } catch (error) {
    console.error("Error:", error)
    return NextResponse.json({ error: "Error al obtener los productos" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const json = await request.json()
    const { nombre, descripcion, programaId, rucEntidad } = json

    if (!nombre || !descripcion || !programaId || !rucEntidad) {
      return NextResponse.json({ error: "Todos los campos son requeridos" }, { status: 400 })
    }

    const client = await clientPromise
    const db = client.db("planificacion")

    // Start a session for the transaction
    const session = client.startSession()

    try {
      let result

      await session.withTransaction(async () => {
        // Create product
        const producto: Producto = {
          nombre,
          descripcion,
          programaId,
          rucEntidad,
        }

        result = await db.collection("productos").insertOne(producto, { session })

        // Add product to program's productos array
        await db
          .collection("programas")
          .updateOne({ _id: new ObjectId(programaId) }, { $push: { productos: result.insertedId } }, { session })
      })

      await session.endSession()

      return NextResponse.json({
        success: true,
        id: result?.insertedId,
        message: "Producto creado exitosamente",
      })
    } catch (error) {
      await session.abortTransaction()
      throw error
    } finally {
      await session.endSession()
    }
  } catch (error) {
    console.error("Error:", error)
    return NextResponse.json({ error: "Error al crear el producto" }, { status: 500 })
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get("id")

    if (!id) {
      return NextResponse.json({ error: "ID del producto es requerido" }, { status: 400 })
    }

    const client = await clientPromise
    const db = client.db("planificacion")

    // Start a session for the transaction
    const session = client.startSession()

    try {
      await session.withTransaction(async () => {
        // Remove product
        await db.collection("productos").deleteOne({ _id: new ObjectId(id) }, { session })

        // Remove product reference from all programs
        await db.collection("programas").updateMany({}, { $pull: { productos: new ObjectId(id) } }, { session })
      })

      await session.endSession()

      return NextResponse.json({
        success: true,
        message: "Producto eliminado exitosamente",
      })
    } catch (error) {
      await session.abortTransaction()
      throw error
    } finally {
      await session.endSession()
    }
  } catch (error) {
    console.error("Error:", error)
    return NextResponse.json({ error: "Error al eliminar el producto" }, { status: 500 })
  }
}

