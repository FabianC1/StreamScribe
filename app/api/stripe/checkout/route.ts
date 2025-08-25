import { NextRequest, NextResponse } from 'next/server'
import { createCheckoutSession } from '@/lib/stripe'

export async function POST(request: NextRequest) {
  try {
    const { tier, customerEmail, successUrl, cancelUrl, customerId } = await request.json()

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

    const { sessionId, customerId: newCustomerId } = await createCheckoutSession({
      tier,
      customerEmail,
      successUrl,
      cancelUrl,
      customerId,
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
