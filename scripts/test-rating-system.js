const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function testRatingSystem() {
    console.log('🧪 Testing Rating System...\n');

    try {
        // 1. Check if we have any products
        const products = await prisma.product.findMany({
            take: 1,
            include: {
                rating: true
            }
        });

        if (products.length === 0) {
            console.log('❌ No products found. Please create some products first.');
            return;
        }

        const product = products[0];
        console.log(`✅ Found product: ${product.name}`);
        console.log(`   Current ratings: ${product.rating.length}`);

        // 2. Check if we have any users
        const users = await prisma.user.findMany({
            take: 1
        });

        if (users.length === 0) {
            console.log('❌ No users found. Please create some users first.');
            return;
        }

        const user = users[0];
        console.log(`✅ Found user: ${user.name}`);

        // 3. Check if we have any orders for this user
        const orders = await prisma.order.findMany({
            where: {
                userId: user.id,
                orderItems: {
                    some: {
                        productId: product.id
                    }
                }
            },
            take: 1
        });

        if (orders.length === 0) {
            console.log('❌ No orders found for this user with this product.');
            console.log('   The rating system requires users to have ordered the product first.');
            return;
        }

        const order = orders[0];
        console.log(`✅ Found order: ${order.id}`);

        // 4. Check existing ratings
        const existingRatings = await prisma.rating.findMany({
            where: {
                userId: user.id,
                productId: product.id,
                orderId: order.id
            }
        });

        if (existingRatings.length > 0) {
            console.log(`✅ Found existing rating: ${existingRatings[0].rating} stars`);
            console.log(`   Review: "${existingRatings[0].review}"`);
        } else {
            console.log('ℹ️  No existing rating found for this user/product/order combination.');
        }

        // 5. Test rating creation (if no existing rating)
        if (existingRatings.length === 0) {
            console.log('\n🧪 Testing rating creation...');
            
            const newRating = await prisma.rating.create({
                data: {
                    rating: 5,
                    review: 'This is a test rating created by the test script.',
                    userId: user.id,
                    productId: product.id,
                    orderId: order.id
                }
            });

            console.log(`✅ Successfully created rating: ${newRating.id}`);
            console.log(`   Rating: ${newRating.rating} stars`);
            console.log(`   Review: "${newRating.review}"`);

            // Clean up - delete the test rating
            await prisma.rating.delete({
                where: { id: newRating.id }
            });
            console.log('🧹 Cleaned up test rating');
        }

        // 6. Test rating aggregation
        const allRatings = await prisma.rating.findMany({
            where: { productId: product.id }
        });

        if (allRatings.length > 0) {
            const averageRating = allRatings.reduce((acc, rating) => acc + rating.rating, 0) / allRatings.length;
            console.log(`\n📊 Rating Statistics for ${product.name}:`);
            console.log(`   Total ratings: ${allRatings.length}`);
            console.log(`   Average rating: ${averageRating.toFixed(2)} stars`);
        }

        console.log('\n✅ Rating system test completed successfully!');

    } catch (error) {
        console.error('❌ Error testing rating system:', error);
    } finally {
        await prisma.$disconnect();
    }
}

// Run the test
testRatingSystem();
