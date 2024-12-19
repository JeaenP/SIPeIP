import { NextResponse } from 'next/server'
import { connectToDatabase } from '@/lib/mongodb'

export async function GET() {
  try {
    const { db } = await connectToDatabase()
    
    // Test write operation
    const testResult = await db.collection('test').insertOne({
      test: true,
      timestamp: new Date()
    })

    // Test read operation
    const testDoc = await db.collection('test').findOne({ _id: testResult.insertedId })

    // Clean up
    await db.collection('test').deleteOne({ _id: testResult.insertedId })

    return NextResponse.json({
      success: true,
      message: 'Database connection and operations successful',
      details: {
        writeResult: testResult,
        readResult: testDoc
      }
    })

  } catch (error) {
    console.error('Database connection test failed:', error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        details: error
      },
      { status: 500 }
    )
  }
}

