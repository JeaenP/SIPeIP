import { NextResponse } from "next/server"
import { ObjectId } from "mongodb"
import clientPromise from "@/lib/mongodb"

export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const client = await clientPromise
    const db = client.db("planificacion")

    const producto = await db.collection("productos").findOne({
      _id: new ObjectId(params.id),
    })

    if (!producto) {
      return NextResponse.json({ error: "Producto no encontrado" }, { status: 404 })
    }

    return NextResponse.json(producto)
  } catch (error) {
    console.error("Error:", error)
    return NextResponse.json({ error: "Error al obtener el producto" }, { status: 500 })
  }
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  try {
    const client = await clientPromise
    const db = client.db("planificacion")

    // Start a session for the transaction
    const session = client.startSession()

    try {
      await session.withTransaction(async () => {
        // Remove product
        await db.collection("productos").deleteOne(
          {
            _id: new ObjectId(params.id),
          },
          { session },
        )

        // Remove product reference from program
        await db.collection("programas").updateMany({}, { $pull: { productos: new ObjectId(params.id) } }, { session })
      })
    } finally {
      await session.endSession()
    }

    return NextResponse.json({
      success: true,
      message: "Producto eliminado exitosamente",
    })
  } catch (error) {
    console.error("Error:", error)
    return NextResponse.json({ error: "Error al eliminar el producto" }, { status: 500 })
  }
}

