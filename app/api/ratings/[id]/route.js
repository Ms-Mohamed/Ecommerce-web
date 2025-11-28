import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

// GET /api/ratings/[id] - Get a specific rating
export async function GET(request, { params }) {
  try {
    const { id } = await params

    const rating = await prisma.rating.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            image: true
          }
        },
        product: {
          select: {
            id: true,
            name: true,
            images: true
          }
        }
      }
    })

    if (!rating) {
      return NextResponse.json(
        { error: 'Rating not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(rating)
  } catch (error) {
    console.error('Error fetching rating:', error)
    return NextResponse.json(
      { error: 'Failed to fetch rating' },
      { status: 500 }
    )
  }
}

// PUT /api/ratings/[id] - Update a rating
export async function PUT(request, { params }) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized - Please sign in' },
        { status: 401 }
      )
    }

    const { id } = await params
    const body = await request.json()
    const { rating, review } = body

    // Validate rating value
    if (rating && (rating < 1 || rating > 5)) {
      return NextResponse.json(
        { error: 'Rating must be between 1 and 5' },
        { status: 400 }
      )
    }

    // Check if rating exists and belongs to the user
    const existingRating = await prisma.rating.findUnique({
      where: { id },
      include: {
        user: true
      }
    })

    if (!existingRating) {
      return NextResponse.json(
        { error: 'Rating not found' },
        { status: 404 }
      )
    }

    if (existingRating.userId !== session.user.id) {
      return NextResponse.json(
        { error: 'Unauthorized - You can only update your own ratings' },
        { status: 403 }
      )
    }

    // Update the rating
    const updatedRating = await prisma.rating.update({
      where: { id },
      data: {
        ...(rating && { rating: parseInt(rating) }),
        ...(review !== undefined && { review })
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            image: true
          }
        },
        product: {
          select: {
            id: true,
            name: true,
            images: true
          }
        }
      }
    })

    return NextResponse.json(updatedRating)
  } catch (error) {
    console.error('Error updating rating:', error)
    return NextResponse.json(
      { error: 'Failed to update rating', details: error.message },
      { status: 500 }
    )
  }
}

// DELETE /api/ratings/[id] - Delete a rating
export async function DELETE(request, { params }) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized - Please sign in' },
        { status: 401 }
      )
    }

    const { id } = await params

    // Check if rating exists and belongs to the user
    const existingRating = await prisma.rating.findUnique({
      where: { id },
      include: {
        user: true
      }
    })

    if (!existingRating) {
      return NextResponse.json(
        { error: 'Rating not found' },
        { status: 404 }
      )
    }

    if (existingRating.userId !== session.user.id) {
      return NextResponse.json(
        { error: 'Unauthorized - You can only delete your own ratings' },
        { status: 403 }
      )
    }

    // Delete the rating
    await prisma.rating.delete({
      where: { id }
    })

    return NextResponse.json({ message: 'Rating deleted successfully' })
  } catch (error) {
    console.error('Error deleting rating:', error)
    return NextResponse.json(
      { error: 'Failed to delete rating', details: error.message },
      { status: 500 }
    )
  }
}
