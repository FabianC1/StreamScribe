import Stripe from 'stripe'

// Initialize Stripe with your secret key
if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error('STRIPE_SECRET_KEY environment variable is not set')
}

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2023-10-16',
})

// Product IDs from your Stripe dashboard
// For now, we'll create products on-the-fly instead of using pre-existing ones
export const STRIPE_PRODUCTS = {
  basic: 'basic',
  standard: 'standard', 
  premium: 'premium',
}

// Base prices in GBP (pence - smallest currency unit)
export const BASE_PRICES = {
  basic: 699, // £6.99 in pence
  standard: 1299, // £12.99 in pence
  premium: 1999, // £19.99 in pence
}

// Special promo code for testing - gives 100% off any plan
export const TEST_PROMO_CODE = 'TEST100FREE'

export interface CreateCheckoutSessionParams {
  tier: 'basic' | 'standard' | 'premium'
  customerEmail: string
  successUrl: string
  cancelUrl: string
  customerId?: string
  promoCode?: string
}

export async function createCheckoutSession({
  tier,
  customerEmail,
  successUrl,
  cancelUrl,
  customerId,
  promoCode
}: CreateCheckoutSessionParams) {
  try {
    console.log('🔍 Creating checkout session for:', { tier, customerEmail, successUrl, cancelUrl })
    
    // Create or retrieve customer
    let customer: Stripe.Customer
    if (customerId) {
      console.log('🔍 Retrieving existing customer:', customerId)
      customer = await stripe.customers.retrieve(customerId) as Stripe.Customer
    } else {
      console.log('🔍 Creating new customer for:', customerEmail)
      customer = await stripe.customers.create({
        email: customerEmail,
        metadata: {
          subscriptionTier: tier,
        },
      })
    }
    
    console.log('✅ Customer ready:', customer.id)

         // Apply promo code discount if provided
     const finalAmount = promoCode === TEST_PROMO_CODE ? 0 : BASE_PRICES[tier]
     console.log('🔍 Creating checkout session with amount:', finalAmount, 'pence for', tier, promoCode ? `(Promo: ${promoCode})` : '')
     
     // Create checkout session with automatic currency detection
     const session = await stripe.checkout.sessions.create({
      customer: customer.id,
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'gbp', // Use GBP since prices are in pounds
            product_data: {
              name: `StreamScribe ${tier.charAt(0).toUpperCase() + tier.slice(1)} Plan`,
              description: getTierDescription(tier),
              metadata: {
                tier,
              },
            },
                         unit_amount: finalAmount,
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
                subscription_data: {
            metadata: {
              tier,
              customerEmail,
            },
          },
      customer_update: {
        address: 'auto',
        name: 'auto',
      },
    })
    
    console.log('✅ Checkout session created:', session.id)

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
