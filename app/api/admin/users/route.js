import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

// GET /api/admin/users - Get all users (admin only) - Optimized
async function getUsers(request) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized - Please sign in' },
        { status: 401 }
      )
    }
    
    if (session.user.email !== 'admin@example.com') {
      return NextResponse.json(
        { error: 'Unauthorized - Admin access required' },
        { status: 403 }
      )
    }

    // Get all users with basic fields
    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        image: true
      },
      orderBy: { id: 'desc' }
    })

    return NextResponse.json(users)
  } catch (error) {
    console.error('Error fetching admin users:', error)
    console.error('Error details:', error.message, error.stack)
    return NextResponse.json(
      { error: 'Failed to fetch users', details: error.message },
      { status: 500 }
    )
  }
}

// Export handler directly (caching temporarily disabled for stability)
export async function GET(request) {
  return await getUsers(request)
}

// DELETE /api/admin/users/[id] - Delete a user (admin only)
export async function DELETE(request) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id || session.user.email !== 'admin@example.com') {
      return NextResponse.json(
        { error: 'Unauthorized - Admin access required' },
        { status: 401 }
      )
    }

    const url = new URL(request.url)
    const userId = url.pathname.split('/').pop()

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      )
    }

    // Don't allow deleting the admin user
    const user = await prisma.user.findUnique({
      where: { id: userId }
    })

    if (user?.email === 'admin@example.com') {
      return NextResponse.json(
        { error: 'Cannot delete admin user' },
        { status: 400 }
      )
    }

    await prisma.user.delete({
      where: { id: userId }
    })

    return NextResponse.json({ message: 'User deleted successfully' })
  } catch (error) {
    console.error('Error deleting user:', error)
    return NextResponse.json(
      { error: 'Failed to delete user' },
      { status: 500 }
    )
  }
}
