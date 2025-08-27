import { NextRequest, NextResponse } from 'next/server'
import connectDB from '../../../../lib/mongodb'
import { User } from '@/models'
import bcrypt from 'bcryptjs'

export async function POST(request: NextRequest) {
  try {
    const { firstName, lastName, email, password } = await request.json()

    // Validate input
    if (!firstName || !lastName || !email || !password) {
      return NextResponse.json(
        { error: 'All fields are required' },
        { status: 400 }
      )
    }

    if (password.length < 8) {
      return NextResponse.json(
        { error: 'Password must be at least 8 characters long' },
        { status: 400 }
      )
    }

    // Connect to database
    await connectDB()

    // Check if user already exists
    const existingUser = await User.findOne({ email: email.toLowerCase() })
    if (existingUser) {
      return NextResponse.json(
        { error: 'User with this email already exists' },
        { status: 409 }
      )
    }

    // Hash password
    const saltRounds = 12
    const hashedPassword = await bcrypt.hash(password, saltRounds)

    // Create user using User model
    const newUser = new User({
      firstName,
      lastName,
      email: email.toLowerCase(),
      passwordHash: hashedPassword,
      subscriptionTier: 'basic',
      subscriptionStatus: 'active',
      subscriptionStartDate: new Date(),
      subscriptionEndDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
      hoursUsed: 0,
      hoursLimit: 30,
      emailVerified: false,
      lastLoginAt: new Date(),
      createdAt: new Date(),
      updatedAt: new Date()
    })

    await newUser.save()

    // Return success (don't return the password)
    const { passwordHash: _, ...userWithoutPassword } = newUser.toObject()
    return NextResponse.json({
      success: true,
      user: userWithoutPassword
    })

  } catch (error) {
    console.error('Registration error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
