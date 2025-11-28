import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

// POST /api/coupons/[code]/reactivate - Reactivate a coupon
export async function POST(request, { params }) {
    try {
        const session = await getServerSession(authOptions);

        if (!session || session.user.email !== 'admin@example.com') {
            return NextResponse.json({ error: 'Unauthorized - Admin access required' }, { status: 401 });
        }

        const { code } = await params;
        const body = await request.json();
        const { resetUsageCount = false } = body;

        // Find the coupon
        const coupon = await prisma.coupon.findUnique({
            where: { code: code.toUpperCase() },
        });

        if (!coupon) {
            return NextResponse.json({ error: 'Coupon not found' }, { status: 404 });
        }

        const updateData = {
            isActive: true,
        };

        // Optionally reset usage count
        if (resetUsageCount) {
            updateData.usageCount = 0;
            // Also delete all usage records
            await prisma.couponUsage.deleteMany({
                where: { couponCode: code.toUpperCase() },
            });
        }

        const reactivatedCoupon = await prisma.coupon.update({
            where: { code: code.toUpperCase() },
            data: updateData,
        });

        return NextResponse.json({
            message: 'Coupon reactivated successfully',
            coupon: reactivatedCoupon,
        });
    } catch (error) {
        console.error('Error reactivating coupon:', error);
        return NextResponse.json({ 
            error: 'Failed to reactivate coupon', 
            details: error.message 
        }, { status: 500 });
    }
}
