import { NextResponse } from 'next/server'
import { warmupDatabase } from '@/lib/db-warmup'

// GET /api/warmup - Warm up the server and database
export async function GET() {
  try {
    console.log('🔥 Starting server warmup...')
    
    // Warm up database
    await warmupDatabase()
    
    // Pre-compile critical pages
    const criticalPages = [
      '/',
      '/shop',
      '/api/products?limit=12',
      '/api/categories'
    ]
    
    // Make internal requests to warm up routes
    const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000'
    
    await Promise.allSettled(
      criticalPages.map(async (path) => {
        try {
          const response = await fetch(`${baseUrl}${path}`, {
            headers: {
              'User-Agent': 'Server-Warmup'
            }
          })
          console.log(`✅ Warmed up: ${path} (${response.status})`)
        } catch (error) {
          console.log(`⚠️ Failed to warm up: ${path}`)
        }
      })
    )
    
    return NextResponse.json({ 
      success: true, 
      message: 'Server warmed up successfully',
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    console.error('❌ Warmup failed:', error)
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    )
  }
}
