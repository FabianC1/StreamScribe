import { loadStripe } from '@stripe/stripe-js'

let stripePromise: Promise<any>

export const getStripe = () => {
  if (!stripePromise) {
    stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!)
  }
  return stripePromise
}

export const createCheckoutSession = async (tier: string) => {
  try {
    const response = await fetch('/api/create-checkout-session', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        tier,
        successUrl: `${window.location.origin}/success`,
        cancelUrl: `${window.location.origin}/`,
      }),
    })

    if (!response.ok) {
      throw new Error('Failed to create checkout session')
    }

    const { sessionId } = await response.json()
    return sessionId
  } catch (error) {
    console.error('Error creating checkout session:', error)
    throw error
  }
}

export const redirectToCheckout = async (tier: string) => {
  try {
    const sessionId = await createCheckoutSession(tier)
    const stripe = await getStripe()
    
    if (stripe) {
      const { error } = await stripe.redirectToCheckout({ sessionId })
      if (error) {
        throw error
      }
    }
  } catch (error) {
    console.error('Error redirecting to checkout:', error)
    throw error
  }
}
