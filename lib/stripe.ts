import Stripe from 'stripe'

// Initialize Stripe with your secret key
export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-06-20',
})

// Product IDs from your Stripe dashboard
export const STRIPE_PRODUCTS = {
  basic: 'prod_basic_id', // Replace with your actual Stripe product ID
  standard: 'prod_standard_id', // Replace with your actual Stripe product ID
  premium: 'prod_premium_id', // Replace with your actual Stripe product ID
}

// Base prices in USD (Stripe will automatically convert to local currency)
export const BASE_PRICES = {
  basic: 699, // $6.99 in cents
  standard: 1299, // $12.99 in cents
  premium: 1999, // $19.99 in cents
}

export interface CreateCheckoutSessionParams {
  tier: 'basic' | 'standard' | 'premium'
  customerEmail: string
  successUrl: string
  cancelUrl: string
  customerId?: string
}

export async function createCheckoutSession({
  tier,
  customerEmail,
  successUrl,
  cancelUrl,
  customerId
}: CreateCheckoutSessionParams) {
  try {
    // Create or retrieve customer
    let customer: Stripe.Customer
    if (customerId) {
      customer = await stripe.customers.retrieve(customerId) as Stripe.Customer
    } else {
      customer = await stripe.customers.create({
        email: customerEmail,
        metadata: {
          subscriptionTier: tier,
        },
      })
    }

    // Create checkout session with automatic currency detection
    const session = await stripe.checkout.sessions.create({
      customer: customer.id,
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'usd', // Stripe will automatically convert to local currency
            product_data: {
              name: `StreamScribe ${tier.charAt(0).toUpperCase() + tier.slice(1)} Plan`,
              description: getTierDescription(tier),
              metadata: {
                tier,
              },
            },
            unit_amount: BASE_PRICES[tier],
            recurring: {
              interval: 'month',
            },
          },
          quantity: 1,
        },
      ],
      mode: 'subscription',
      success_url: successUrl,
      cancel_url: cancelUrl,
      allow_promotion_codes: true,
      billing_address_collection: 'required',
      tax_id_collection: {
        enabled: true,
      },
      subscription_data: {
        metadata: {
          tier,
          customerEmail,
        },
        trial_period_days: 7, // 7-day free trial
      },
      customer_update: {
        address: 'auto',
        name: 'auto',
      },
      // Enable automatic tax calculation
      automatic_tax: {
        enabled: true,
      },
      // Enable international payments
      payment_method_options: {
        card: {
          request_three_d_secure: 'automatic',
        },
      },
    })

    return { sessionId: session.id, customerId: customer.id }
  } catch (error) {
    console.error('Error creating checkout session:', error)
    throw error
  }
}

export async function createCustomerPortalSession(customerId: string, returnUrl: string) {
  try {
    const session = await stripe.billingPortal.sessions.create({
      customer: customerId,
      return_url: returnUrl,
    })
    return session.url
  } catch (error) {
    console.error('Error creating customer portal session:', error)
    throw error
  }
}

export async function getSubscription(subscriptionId: string) {
  try {
    const subscription = await stripe.subscriptions.retrieve(subscriptionId, {
      expand: ['customer', 'latest_invoice', 'items.data.price'],
    })
    return subscription
  } catch (error) {
    console.error('Error retrieving subscription:', error)
    throw error
  }
}

export async function cancelSubscription(subscriptionId: string) {
  try {
    const subscription = await stripe.subscriptions.update(subscriptionId, {
      cancel_at_period_end: true,
    })
    return subscription
  } catch (error) {
    console.error('Error canceling subscription:', error)
    throw error
  }
}

export async function updateSubscription(subscriptionId: string, newTier: string) {
  try {
    const subscription = await stripe.subscriptions.retrieve(subscriptionId)
    const priceId = getPriceIdForTier(newTier)
    
    if (!priceId) {
      throw new Error('Invalid tier')
    }

    // Update the subscription with the new price
    const updatedSubscription = await stripe.subscriptions.update(subscriptionId, {
      items: [
        {
          id: subscription.items.data[0].id,
          price: priceId,
        },
      ],
      proration_behavior: 'create_prorations',
      metadata: {
        tier: newTier,
      },
    })

    return updatedSubscription
  } catch (error) {
    console.error('Error updating subscription:', error)
    throw error
  }
}

// Helper functions
function getTierDescription(tier: string): string {
  const descriptions = {
    basic: '30 hours/month, TXT exports, timestamps, basic analytics',
    standard: '60 hours/month, TXT/DOCX/SRT exports, advanced analytics, no ads',
    premium: '100 hours/month, all export formats, AI highlights, full customization',
  }
  return descriptions[tier as keyof typeof descriptions] || ''
}

function getPriceIdForTier(tier: string): string | null {
  // You'll need to replace these with your actual Stripe price IDs
  const priceIds = {
    basic: 'price_basic_id',
    standard: 'price_standard_id',
    premium: 'price_premium_id',
  }
  return priceIds[tier as keyof typeof priceIds] || null
}

// Webhook event handlers
export async function handleSubscriptionCreated(subscription: Stripe.Subscription) {
  try {
    const tier = subscription.metadata.tier
    const customerEmail = subscription.metadata.customerEmail
    
    // Update your database with the new subscription
    // This would typically involve updating the user's subscription status
    console.log(`New subscription created: ${tier} for ${customerEmail}`)
    
    return { success: true }
  } catch (error) {
    console.error('Error handling subscription created:', error)
    throw error
  }
}

export async function handleSubscriptionUpdated(subscription: Stripe.Subscription) {
  try {
    const tier = subscription.metadata.tier
    const customerEmail = subscription.metadata.customerEmail
    
    // Update your database with the subscription changes
    console.log(`Subscription updated: ${tier} for ${customerEmail}`)
    
    return { success: true }
  } catch (error) {
    console.error('Error handling subscription updated:', error)
    throw error
  }
}

export async function handleSubscriptionDeleted(subscription: Stripe.Subscription) {
  try {
    const customerEmail = subscription.metadata.customerEmail
    
    // Update your database to mark subscription as cancelled
    console.log(`Subscription cancelled for ${customerEmail}`)
    
    return { success: true }
  } catch (error) {
    console.error('Error handling subscription deleted:', error)
    throw error
  }
}
