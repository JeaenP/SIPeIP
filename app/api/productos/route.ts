import { NextResponse } from 'next/server'
import { ObjectId } from 'mongodb'
import clientPromise from '@/lib/mongodb'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const programaId = searchParams.get('programaId')
    
    if (!programaId) {
      return NextResponse.json(
        { error: 'ID del programa es requerido' },
        { status: 400 }
      )
    }

    const client = await clientPromise
    const db = client.db("planificacion")
    
    const productos = await db.collection('productos')
      .find({ programaId })
      .toArray()
    
    return NextResponse.json(productos)

  } catch (error) {
    console.error('Error:', error)
    return NextResponse.json(
      { error: 'Error al obtener los productos' },
      { status: 500 }
    )
  }
}


export async function POST(request: Request) {
  try {
    const json = await request.json()
    const { nombre, descripcion, programaId, rucEntidad } = json

    if (!nombre || !descripcion || !programaId || !rucEntidad) {
      return NextResponse.json(
        { error: 'Todos los campos son requeridos' },
        { status: 400 }
      )
    }

    const client = await clientPromise
    const db = client.db("planificacion")
    
    const producto: Producto = {
      nombre,
      descripcion,
      programaId,
      rucEntidad
    }

    const result = await db.collection('productos').insertOne(producto)

    const programaObjectId = new ObjectId(programaId)
    // Add product to program's products array
    await db.collection('programas').updateOne(
      { _id: programaObjectId },  // Convertir programaId en ObjectId
      { $push: { productos: result.insertedId } }
    )
    
    return NextResponse.json({ 
      success: true,
      id: result.insertedId 
    })

  } catch (error) {
    console.error('Error:', error)
    return NextResponse.json(
      { error: 'Error al crear el producto' },
      { status: 500 }
    )
  }
}


export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')
    const programaId = searchParams.get('programaId')
    
    if (!id || !programaId) {
      return NextResponse.json(
        { error: 'ID del producto y programa son requeridos' },
        { status: 400 }
      )
    }

    const client = await clientPromise
    const db = client.db("planificacion")
    
    // Remove product
    await db.collection('productos').deleteOne({ 
      _id: new ObjectId(id)
    })
    
    // Remove product from program's products array
    await db.collection('programas').updateOne(
      { _id: new ObjectId(programaId) },
      { $pull: { productos: new ObjectId(id) } }
    )
    
    return NextResponse.json({ 
      success: true,
      message: "Producto eliminado exitosamente"
    })

  } catch (error) {
    console.error('Error:', error)
    return NextResponse.json(
      { error: 'Error al eliminar el producto' },
      { status: 500 }
    )
  }
}

