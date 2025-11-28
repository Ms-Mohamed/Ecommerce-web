// Database connection warming utility
import { prisma } from './prisma'

let isWarmedUp = false
let warmupPromise = null

export async function warmupDatabase() {
  if (isWarmedUp) return Promise.resolve()
  
  if (warmupPromise) return warmupPromise
  
  warmupPromise = (async () => {
    try {
      console.log('🔥 Warming up database connection...')
      
      // Perform a simple query to establish connection
      await prisma.$queryRaw`SELECT 1`
      
      // Pre-load critical data that's needed on first page load
      await Promise.all([
        // Pre-load categories (needed for navigation)
        prisma.category.findMany({
          where: { isActive: true },
          select: { id: true, name: true },
          take: 10
        }),
        
        // Pre-load a few products (needed for homepage)
        prisma.product.findMany({
          select: {
            id: true,
            name: true,
            price: true,
            images: true,
            inStock: true,
            createdAt: true
          },
          take: 5,
          orderBy: { createdAt: 'desc' }
        })
      ])
      
      isWarmedUp = true
      console.log('✅ Database warmed up successfully')
    } catch (error) {
      console.error('❌ Database warmup failed:', error)
      isWarmedUp = false
      warmupPromise = null
    }
  })()
  
  return warmupPromise
}

// Auto-warmup on module load (for server-side)
if (typeof window === 'undefined') {
  warmupDatabase().catch(console.error)
}
