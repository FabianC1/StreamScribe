import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2023-10-16',
})

export async function POST(request: NextRequest) {
  try {
    const { tier, successUrl, cancelUrl } = await request.json()

    // Define pricing based on tier
    const pricing = {
      basic: {
        price: 699, // £6.99 in pence
        hours: 30,
      },
      standard: {
        price: 1299, // £12.99 in pence
        hours: 60,
      },
      premium: {
        price: 1999, // £19.99 in pence
        hours: 100,
      },
    }

    const selectedTier = pricing[tier as keyof typeof pricing]
    if (!selectedTier) {
      return NextResponse.json(
        { error: 'Invalid tier selected' },
        { status: 400 }
      )
    }

    // Create Stripe checkout session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'gbp',
            product_data: {
              name: `StreamScribe ${tier.charAt(0).toUpperCase() + tier.slice(1)} Plan`,
              description: `${selectedTier.hours} hours of transcription per month`,
            },
            unit_amount: selectedTier.price,
            recurring: {
              interval: 'month',
            },
          },
          quantity: 1,
        },
      ],
      mode: 'subscription',
      success_url: successUrl || `${process.env.NEXT_PUBLIC_BASE_URL}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: cancelUrl || `${process.env.NEXT_PUBLIC_BASE_URL}/pricing`,
      metadata: {
        tier,
        hours: selectedTier.hours.toString(),
      },
    })

    return NextResponse.json({ sessionId: session.id })
  } catch (error) {
    console.error('Error creating checkout session:', error)
    return NextResponse.json(
      { error: 'Failed to create checkout session' },
      { status: 500 }
    )
  }
}
