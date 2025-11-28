import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

// GET /api/coupons - Get all coupons
export async function GET(request) {
    try {
        const { searchParams } = new URL(request.url);
        const includeUsage = searchParams.get('includeUsage') === 'true';
        const isActive = searchParams.get('isActive');

        const where = {};
        if (isActive !== null) {
            where.isActive = isActive === 'true';
        }

        const coupons = await prisma.coupon.findMany({
            where,
            include: {
                couponUsages: includeUsage ? {
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
                } : false,
            },
            orderBy: { createdAt: 'desc' },
        });

        return NextResponse.json(coupons);
    } catch (error) {
        console.error('Error fetching coupons:', error);
        return NextResponse.json({ error: 'Failed to fetch coupons' }, { status: 500 });
    }
}

// POST /api/coupons - Create a new coupon
export async function POST(request) {
    try {
        const session = await getServerSession(authOptions);

        if (!session || session.user.email !== 'admin@example.com') {
            return NextResponse.json({ error: 'Unauthorized - Admin access required' }, { status: 401 });
        }

        const body = await request.json();
        const { code, description, discount, forNewUser, forMember, isPublic, expiresAt, maxUsage } = body;

        // Validation
        if (!code || !description || !discount || expiresAt === undefined) {
            return NextResponse.json({ 
                error: 'Missing required fields: code, description, discount, expiresAt' 
            }, { status: 400 });
        }

        if (discount < 1 || discount > 100) {
            return NextResponse.json({ 
                error: 'Discount must be between 1 and 100' 
            }, { status: 400 });
        }

        if (new Date(expiresAt) <= new Date()) {
            return NextResponse.json({ 
                error: 'Expiry date must be in the future' 
            }, { status: 400 });
        }

        // Check if coupon code already exists
        const existingCoupon = await prisma.coupon.findUnique({
            where: { code: code.toUpperCase() },
        });

        if (existingCoupon) {
            return NextResponse.json({ 
                error: 'Coupon code already exists' 
            }, { status: 409 });
        }

        const newCoupon = await prisma.coupon.create({
            data: {
                code: code.toUpperCase(),
                description,
                discount: parseFloat(discount),
                forNewUser: Boolean(forNewUser),
                forMember: Boolean(forMember),
                isPublic: Boolean(isPublic),
                expiresAt: new Date(expiresAt),
                maxUsage: maxUsage ? parseInt(maxUsage) : null,
                isActive: true,
                usageCount: 0,
            },
        });

        return NextResponse.json(newCoupon, { status: 201 });
    } catch (error) {
        console.error('Error creating coupon:', error);
        return NextResponse.json({ 
            error: 'Failed to create coupon', 
            details: error.message 
        }, { status: 500 });
    }
}
