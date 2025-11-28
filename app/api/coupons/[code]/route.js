import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

// GET /api/coupons/[code] - Get a specific coupon
export async function GET(request, { params }) {
    try {
        const { code } = await params;

        const coupon = await prisma.coupon.findUnique({
            where: { code: code.toUpperCase() },
            include: {
                couponUsages: {
                    include: {
                        user: {
                            select: {
                                id: true,
                                name: true,
                                email: true,
                            },
                        },
                    },
                    orderBy: { usedAt: 'desc' },
                },
            },
        });

        if (!coupon) {
            return NextResponse.json({ error: 'Coupon not found' }, { status: 404 });
        }

        return NextResponse.json(coupon);
    } catch (error) {
        console.error('Error fetching coupon:', error);
        return NextResponse.json({ error: 'Failed to fetch coupon' }, { status: 500 });
    }
}

// PUT /api/coupons/[code] - Update a coupon
export async function PUT(request, { params }) {
    try {
        const session = await getServerSession(authOptions);

        if (!session || session.user.email !== 'admin@example.com') {
            return NextResponse.json({ error: 'Unauthorized - Admin access required' }, { status: 401 });
        }

        const { code } = await params;
        const body = await request.json();
        const { description, discount, forNewUser, forMember, isPublic, expiresAt, maxUsage, isActive } = body;

        // Check if coupon exists
        const existingCoupon = await prisma.coupon.findUnique({
            where: { code: code.toUpperCase() },
        });

        if (!existingCoupon) {
            return NextResponse.json({ error: 'Coupon not found' }, { status: 404 });
        }

        // Validation
        if (discount !== undefined && (discount < 1 || discount > 100)) {
            return NextResponse.json({ 
                error: 'Discount must be between 1 and 100' 
            }, { status: 400 });
        }

        if (expiresAt !== undefined && new Date(expiresAt) <= new Date()) {
            return NextResponse.json({ 
                error: 'Expiry date must be in the future' 
            }, { status: 400 });
        }

        const updateData = {};
        if (description !== undefined) updateData.description = description;
        if (discount !== undefined) updateData.discount = parseFloat(discount);
        if (forNewUser !== undefined) updateData.forNewUser = Boolean(forNewUser);
        if (forMember !== undefined) updateData.forMember = Boolean(forMember);
        if (isPublic !== undefined) updateData.isPublic = Boolean(isPublic);
        if (expiresAt !== undefined) updateData.expiresAt = new Date(expiresAt);
        if (maxUsage !== undefined) updateData.maxUsage = maxUsage ? parseInt(maxUsage) : null;
        if (isActive !== undefined) updateData.isActive = Boolean(isActive);

        const updatedCoupon = await prisma.coupon.update({
            where: { code: code.toUpperCase() },
            data: updateData,
        });

        return NextResponse.json(updatedCoupon);
    } catch (error) {
        console.error('Error updating coupon:', error);
        return NextResponse.json({ 
            error: 'Failed to update coupon', 
            details: error.message 
        }, { status: 500 });
    }
}

// DELETE /api/coupons/[code] - Delete a coupon
export async function DELETE(request, { params }) {
    try {
        const session = await getServerSession(authOptions);

        if (!session || session.user.email !== 'admin@example.com') {
            return NextResponse.json({ error: 'Unauthorized - Admin access required' }, { status: 401 });
        }

        const { code } = await params;

        // Check if coupon exists
        const existingCoupon = await prisma.coupon.findUnique({
            where: { code: code.toUpperCase() },
        });

        if (!existingCoupon) {
            return NextResponse.json({ error: 'Coupon not found' }, { status: 404 });
        }

        // Delete coupon (this will also delete related CouponUsage records due to onDelete: Cascade)
        await prisma.coupon.delete({
            where: { code: code.toUpperCase() },
        });

        return NextResponse.json({ message: 'Coupon deleted successfully' });
    } catch (error) {
        console.error('Error deleting coupon:', error);
        return NextResponse.json({ 
            error: 'Failed to delete coupon', 
            details: error.message 
        }, { status: 500 });
    }
}
