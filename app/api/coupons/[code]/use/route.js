import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

// POST /api/coupons/[code]/use - Use a coupon
export async function POST(request, { params }) {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized - Please sign in' }, { status: 401 });
        }

        const { code } = await params;
        const body = await request.json();
        const { orderId } = body;

        if (!orderId) {
            return NextResponse.json({ 
                error: 'Missing required field: orderId' 
            }, { status: 400 });
        }

        // Find the coupon
        const coupon = await prisma.coupon.findUnique({
            where: { code: code.toUpperCase() },
        });

        if (!coupon) {
            return NextResponse.json({ error: 'Coupon not found' }, { status: 404 });
        }

        // Check if coupon is active
        if (!coupon.isActive) {
            return NextResponse.json({ error: 'Coupon is not active' }, { status: 400 });
        }

        // Check if coupon has expired
        if (new Date() > coupon.expiresAt) {
            return NextResponse.json({ error: 'Coupon has expired' }, { status: 400 });
        }

        // Check if coupon has reached max usage
        if (coupon.maxUsage && coupon.usageCount >= coupon.maxUsage) {
            // Also deactivate the coupon if it's still marked as active
            if (coupon.isActive) {
                await prisma.coupon.update({
                    where: { code: code.toUpperCase() },
                    data: { isActive: false },
                });
            }
            return NextResponse.json({ error: 'Coupon usage limit reached' }, { status: 400 });
        }

        // Check if user has already used this coupon on this order
        const existingUsage = await prisma.couponUsage.findUnique({
            where: {
                couponCode_userId_orderId: {
                    couponCode: code.toUpperCase(),
                    userId: session.user.id,
                    orderId: orderId,
                },
            },
        });

        if (existingUsage) {
            return NextResponse.json({ error: 'Coupon already used on this order' }, { status: 400 });
        }

        // Check if user is eligible for this coupon
        if (coupon.forNewUser) {
            // Check if user has any previous orders
            const userOrders = await prisma.order.count({
                where: { userId: session.user.id },
            });

            if (userOrders > 0) {
                return NextResponse.json({ 
                    error: 'This coupon is only for new users' 
                }, { status: 400 });
            }
        }

        // Use the coupon
        const couponUsage = await prisma.couponUsage.create({
            data: {
                couponCode: code.toUpperCase(),
                userId: session.user.id,
                orderId: orderId,
            },
        });

        // Update coupon usage count and check if it should be deactivated
        const updatedCoupon = await prisma.coupon.update({
            where: { code: code.toUpperCase() },
            data: {
                usageCount: {
                    increment: 1,
                },
            },
        });

        // Check if coupon has reached max usage and deactivate if necessary
        if (updatedCoupon.maxUsage && updatedCoupon.usageCount >= updatedCoupon.maxUsage) {
            await prisma.coupon.update({
                where: { code: code.toUpperCase() },
                data: {
                    isActive: false,
                },
            });
            console.log(`Coupon ${code} has reached max usage (${updatedCoupon.maxUsage}) and has been deactivated`);
        }

        return NextResponse.json({
            message: 'Coupon used successfully',
            coupon: {
                code: coupon.code,
                discount: coupon.discount,
                description: coupon.description,
            },
            usage: couponUsage,
        });
    } catch (error) {
        console.error('Error using coupon:', error);
        return NextResponse.json({ 
            error: 'Failed to use coupon', 
            details: error.message 
        }, { status: 500 });
    }
}
