const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function migrateProductCategories() {
  console.log('🔄 Migrating product categories...\n');

  try {
    // First, ensure we have default categories
    const defaultCategories = [
      'Electronics', 'Clothing', 'Home & Kitchen', 'Beauty & Health', 
      'Toys & Games', 'Sports & Outdoors', 'Books & Media', 
      'Food & Drink', 'Hobbies & Crafts', 'Others'
    ];

    for (const categoryName of defaultCategories) {
      const existingCategory = await prisma.category.findUnique({
        where: { name: categoryName }
      });

      if (!existingCategory) {
        await prisma.category.create({
          data: {
            name: categoryName,
            description: `Default category for ${categoryName}`
          }
        });
        console.log(`✅ Created category: ${categoryName}`);
      }
    }

    // Get all products that still use the old category string field
    const productsWithStringCategories = await prisma.product.findMany({
      where: {
        categoryId: null // This will be null for products using the old system
      }
    });

    console.log(`\n📦 Found ${productsWithStringCategories.length} products to migrate`);

    if (productsWithStringCategories.length === 0) {
      console.log('✅ No products need migration. All products are already using the new category system.');
      return;
    }

    // Migrate each product
    for (const product of productsWithStringCategories) {
      try {
        // Find the category by name
        const category = await prisma.category.findUnique({
          where: { name: product.category }
        });

        if (category) {
          // Update the product to use the new categoryId
          await prisma.product.update({
            where: { id: product.id },
            data: { categoryId: category.id }
          });
          console.log(`✅ Migrated product: ${product.name} -> ${category.name}`);
        } else {
          // Create a new category if it doesn't exist
          const newCategory = await prisma.category.create({
            data: {
              name: product.category,
              description: `Auto-created category for ${product.category}`
            }
          });
          
          await prisma.product.update({
            where: { id: product.id },
            data: { categoryId: newCategory.id }
          });
          console.log(`✅ Created new category and migrated product: ${product.name} -> ${newCategory.name}`);
        }
      } catch (error) {
        console.error(`❌ Error migrating product ${product.name}:`, error.message);
      }
    }

    console.log('\n🎉 Product category migration completed!');
    
    // Verify migration
    const remainingProducts = await prisma.product.count({
      where: { categoryId: null }
    });
    
    if (remainingProducts === 0) {
      console.log('✅ All products successfully migrated to the new category system!');
    } else {
      console.log(`⚠️  ${remainingProducts} products still need migration.`);
    }

  } catch (error) {
    console.error('❌ Error during migration:', error);
  } finally {
    await prisma.$disconnect();
  }
}

migrateProductCategories();
