import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { createCheckoutSession } from '@/lib/stripe'
import connectDB from '@/lib/mongodb'
import User from '@/models/User'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'

const DEV_FREE_PROMO_CODE = 'DEVFREE'

const TIER_HOUR_LIMITS = {
  basic: 30,
  standard: 60,
  premium: 100,
} as const

export async function POST(request: NextRequest) {
  try {
    const { tier, customerEmail, successUrl, cancelUrl, customerId, promoCode } = await request.json()

    if (!tier || !customerEmail || !successUrl || !cancelUrl) {
      return NextResponse.json(
        { error: 'Missing required fields: tier, customerEmail, successUrl, cancelUrl' },
        { status: 400 }
      )
    }

    if (!['basic', 'standard', 'premium'].includes(tier)) {
      return NextResponse.json(
        { error: 'Invalid tier. Must be basic, standard, or premium' },
        { status: 400 }
      )
    }

    const isDevFreeRequest =
      process.env.NODE_ENV !== 'production' &&
      typeof promoCode === 'string' &&
      promoCode.trim().toUpperCase() === DEV_FREE_PROMO_CODE

    if (isDevFreeRequest) {
      const session = await getServerSession(authOptions)

      if (!session?.user?.email) {
        return NextResponse.json(
          { error: 'You must be signed in to use the development free tier flow' },
          { status: 401 }
        )
      }

      await connectDB()

      const subscriptionStartDate = new Date()
      const subscriptionEndDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)

      await User.findOneAndUpdate(
        { email: session.user.email },
        {
          $set: {
            subscriptionTier: tier,
            subscriptionStatus: 'active',
            subscriptionStartDate,
            subscriptionEndDate,
            hoursLimit: TIER_HOUR_LIMITS[tier as keyof typeof TIER_HOUR_LIMITS],
          },
        },
        { new: true }
      )

      return NextResponse.json({
        directActivation: true,
        redirectUrl: '/dashboard?success=true&devPlan=true',
        message: `Development ${tier} plan activated successfully`,
      })
    }

    const { sessionId, customerId: newCustomerId } = await createCheckoutSession({
      tier,
      customerEmail,
      successUrl,
      cancelUrl,
      customerId,
      promoCode,
    })

    return NextResponse.json({
      sessionId,
      customerId: newCustomerId,
      message: 'Checkout session created successfully',
    })
  } catch (error) {
    console.error('Error creating checkout session:', error)
    return NextResponse.json(
      { error: 'Failed to create checkout session' },
      { status: 500 }
    )
  }
}
