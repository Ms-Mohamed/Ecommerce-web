#!/usr/bin/env node

/**
 * Database Optimization Script
 * This script helps optimize database performance by creating indexes and analyzing query patterns
 */

const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function optimizeDatabase() {
  console.log('🚀 Starting database optimization...')

  try {
    // Check database connection
    await prisma.$queryRaw`SELECT 1`
    console.log('✅ Database connection established')

    // Create indexes for better query performance
    console.log('📊 Creating database indexes...')

    const indexes = [
      // Product indexes
      {
        name: 'idx_product_category',
        query: `CREATE INDEX IF NOT EXISTS idx_product_category ON "Product" ("categoryId")`
      },
      {
        name: 'idx_product_store',
        query: `CREATE INDEX IF NOT EXISTS idx_product_store ON "Product" ("storeId")`
      },
      {
        name: 'idx_product_price',
        query: `CREATE INDEX IF NOT EXISTS idx_product_price ON "Product" ("price")`
      },
      {
        name: 'idx_product_instock',
        query: `CREATE INDEX IF NOT EXISTS idx_product_instock ON "Product" ("inStock")`
      },
      {
        name: 'idx_product_created',
        query: `CREATE INDEX IF NOT EXISTS idx_product_created ON "Product" ("createdAt" DESC)`
      },
      {
        name: 'idx_product_name_search',
        query: `CREATE INDEX IF NOT EXISTS idx_product_name_search ON "Product" USING gin(to_tsvector('english', "name"))`
      },

      // Cart indexes
      {
        name: 'idx_cart_user',
        query: `CREATE INDEX IF NOT EXISTS idx_cart_user ON "Cart" ("userId")`
      },
      {
        name: 'idx_cart_product',
        query: `CREATE INDEX IF NOT EXISTS idx_cart_product ON "Cart" ("productId")`
      },
      {
        name: 'idx_cart_user_product',
        query: `CREATE INDEX IF NOT EXISTS idx_cart_user_product ON "Cart" ("userId", "productId")`
      },

      // Order indexes
      {
        name: 'idx_order_user',
        query: `CREATE INDEX IF NOT EXISTS idx_order_user ON "Order" ("userId")`
      },
      {
        name: 'idx_order_store',
        query: `CREATE INDEX IF NOT EXISTS idx_order_store ON "Order" ("storeId")`
      },
      {
        name: 'idx_order_status',
        query: `CREATE INDEX IF NOT EXISTS idx_order_status ON "Order" ("status")`
      },
      {
        name: 'idx_order_created',
        query: `CREATE INDEX IF NOT EXISTS idx_order_created ON "Order" ("createdAt" DESC)`
      },

      // Rating indexes
      {
        name: 'idx_rating_product',
        query: `CREATE INDEX IF NOT EXISTS idx_rating_product ON "Rating" ("productId")`
      },
      {
        name: 'idx_rating_user',
        query: `CREATE INDEX IF NOT EXISTS idx_rating_user ON "Rating" ("userId")`
      },
      {
        name: 'idx_rating_created',
        query: `CREATE INDEX IF NOT EXISTS idx_rating_created ON "Rating" ("createdAt" DESC)`
      },

      // Stock indexes
      {
        name: 'idx_stock_product',
        query: `CREATE INDEX IF NOT EXISTS idx_stock_product ON "stock_info" ("productId")`
      },
      {
        name: 'idx_stock_quantity',
        query: `CREATE INDEX IF NOT EXISTS idx_stock_quantity ON "stock_info" ("quantity")`
      },

      // Category indexes
      {
        name: 'idx_category_active',
        query: `CREATE INDEX IF NOT EXISTS idx_category_active ON "Category" ("isActive")`
      },

      // Store indexes
      {
        name: 'idx_store_user',
        query: `CREATE INDEX IF NOT EXISTS idx_store_user ON "Store" ("userId")`
      },
      {
        name: 'idx_store_active',
        query: `CREATE INDEX IF NOT EXISTS idx_store_active ON "Store" ("isActive")`
      },
      {
        name: 'idx_store_status',
        query: `CREATE INDEX IF NOT EXISTS idx_store_status ON "Store" ("status")`
      }
    ]

    for (const index of indexes) {
      try {
        await prisma.$executeRawUnsafe(index.query)
        console.log(`✅ Created index: ${index.name}`)
      } catch (error) {
        if (error.message.includes('already exists')) {
          console.log(`⏭️  Index already exists: ${index.name}`)
        } else {
          console.error(`❌ Failed to create index ${index.name}:`, error.message)
        }
      }
    }

    // Analyze tables for better query planning
    console.log('📈 Analyzing tables for query optimization...')
    const tables = ['Product', 'Cart', 'Order', 'Rating', 'Category', 'Store', 'stock_info']
    
    for (const table of tables) {
      try {
        await prisma.$executeRawUnsafe(`ANALYZE "${table}"`)
        console.log(`✅ Analyzed table: ${table}`)
      } catch (error) {
        console.error(`❌ Failed to analyze table ${table}:`, error.message)
      }
    }

    // Get database statistics
    console.log('📊 Database statistics:')
    
    const stats = await Promise.all([
      prisma.product.count(),
      prisma.cart.count(),
      prisma.order.count(),
      prisma.rating.count(),
      prisma.category.count(),
      prisma.store.count()
    ])

    console.log(`   Products: ${stats[0]}`)
    console.log(`   Cart items: ${stats[1]}`)
    console.log(`   Orders: ${stats[2]}`)
    console.log(`   Ratings: ${stats[3]}`)
    console.log(`   Categories: ${stats[4]}`)
    console.log(`   Stores: ${stats[5]}`)

    console.log('🎉 Database optimization completed successfully!')

  } catch (error) {
    console.error('❌ Database optimization failed:', error)
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

// Run optimization if called directly
if (require.main === module) {
  optimizeDatabase()
}

module.exports = { optimizeDatabase }
