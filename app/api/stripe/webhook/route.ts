import { NextRequest, NextResponse } from 'next/server'
import { headers } from 'next/headers'
import Stripe from 'stripe'
import connectDB from '@/lib/mongodb'
import { ObjectId } from 'mongodb'
import mongoose from 'mongoose'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2023-10-16',
})

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!

export async function POST(request: NextRequest) {
  try {
    const body = await request.text()
    const signature = headers().get('stripe-signature')

    if (!signature) {
      return NextResponse.json({ error: 'No signature' }, { status: 400 })
    }

    let event: Stripe.Event

    try {
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret)
    } catch (err) {
      console.error('Webhook signature verification failed:', err)
      return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
    }

    await connectDB()
    const db = mongoose.connection.db

    if (!db) {
      return NextResponse.json({ error: 'Database connection failed' }, { status: 500 })
    }

    switch (event.type) {
      case 'customer.subscription.created':
        await handleSubscriptionCreated(event.data.object as Stripe.Subscription, db)
        break
      case 'customer.subscription.updated':
        await handleSubscriptionUpdated(event.data.object as Stripe.Subscription, db)
        break
      case 'customer.subscription.deleted':
        await handleSubscriptionDeleted(event.data.object as Stripe.Subscription, db)
        break
      case 'invoice.payment_succeeded':
        await handlePaymentSucceeded(event.data.object as Stripe.Invoice, db)
        break
      case 'invoice.payment_failed':
        await handlePaymentFailed(event.data.object as Stripe.Invoice, db)
        break
      default:
        console.log(`Unhandled event type: ${event.type}`)
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error('Webhook error:', error)
    return NextResponse.json(
      { error: 'Webhook handler failed' },
      { status: 500 }
    )
  }
}

async function handleSubscriptionCreated(subscription: Stripe.Subscription, db: any) {
  try {
    const tier = subscription.metadata.tier
    const customerEmail = subscription.metadata.customerEmail
    
    if (!customerEmail) {
      console.error('No customer email in subscription metadata')
      return
    }

    // Update user's subscription in database
    const result = await db.collection('users').updateOne(
      { email: customerEmail },
      {
        $set: {
          subscriptionTier: tier,
          subscriptionStatus: 'active',
          stripeCustomerId: subscription.customer as string,
          stripeSubscriptionId: subscription.id,
          subscriptionStartDate: new Date(subscription.current_period_start * 1000),
          subscriptionEndDate: new Date(subscription.current_period_end * 1000),
          hoursLimit: tier === 'basic' ? 30 : tier === 'standard' ? 60 : 100,
          updatedAt: new Date()
        }
      }
    )

    if (result.matchedCount > 0) {
      console.log(`Subscription created for ${customerEmail}: ${tier}`)
    } else {
      console.error(`User not found for subscription: ${customerEmail}`)
    }
  } catch (error) {
    console.error('Error handling subscription created:', error)
  }
}

async function handleSubscriptionUpdated(subscription: Stripe.Subscription, db: any) {
  try {
    const tier = subscription.metadata.tier
    const customerEmail = subscription.metadata.customerEmail
    
    if (!customerEmail) {
      console.error('No customer email in subscription metadata')
      return
    }

    // Update user's subscription in database
    const result = await db.collection('users').updateOne(
      { email: customerEmail },
      {
        $set: {
          subscriptionTier: tier,
          subscriptionStatus: subscription.status,
          stripeSubscriptionId: subscription.id,
          subscriptionEndDate: new Date(subscription.current_period_end * 1000),
          hoursLimit: tier === 'basic' ? 30 : tier === 'standard' ? 60 : 100,
          updatedAt: new Date()
        }
      }
    )

    if (result.matchedCount > 0) {
      console.log(`Subscription updated for ${customerEmail}: ${tier}`)
    }
  } catch (error) {
    console.error('Error handling subscription updated:', error)
  }
}

async function handleSubscriptionDeleted(subscription: Stripe.Subscription, db: any) {
  try {
    const customerEmail = subscription.metadata.customerEmail
    
    if (!customerEmail) {
      console.error('No customer email in subscription metadata')
      return
    }

    // Update user's subscription status in database
    const result = await db.collection('users').updateOne(
      { email: customerEmail },
      {
        $set: {
          subscriptionStatus: 'cancelled',
          subscriptionEndDate: new Date(subscription.canceled_at! * 1000),
          updatedAt: new Date()
        }
      }
    )

    if (result.matchedCount > 0) {
      console.log(`Subscription cancelled for ${customerEmail}`)
    }
  } catch (error) {
    console.error('Error handling subscription deleted:', error)
  }
}

async function handlePaymentSucceeded(invoice: Stripe.Invoice, db: any) {
  try {
    const customerEmail = invoice.customer_email
    
    if (!customerEmail) {
      console.error('No customer email in invoice')
      return
    }

    // Log successful payment
    await db.collection('payments').insertOne({
      customerEmail,
      stripeInvoiceId: invoice.id,
      amount: invoice.amount_paid,
      currency: invoice.currency,
      status: 'succeeded',
      createdAt: new Date()
    })

    console.log(`Payment succeeded for ${customerEmail}: ${invoice.amount_paid} ${invoice.currency}`)
  } catch (error) {
    console.error('Error handling payment succeeded:', error)
  }
}

async function handlePaymentFailed(invoice: Stripe.Invoice, db: any) {
  try {
    const customerEmail = invoice.customer_email
    
    if (!customerEmail) {
      console.error('No customer email in invoice')
      return
    }

    // Log failed payment
    await db.collection('payments').insertOne({
      customerEmail,
      stripeInvoiceId: invoice.id,
      amount: invoice.amount_due,
      currency: invoice.currency,
      status: 'failed',
      failureReason: invoice.last_finalization_error?.message || 'Unknown',
      createdAt: new Date()
    })

    console.log(`Payment failed for ${customerEmail}: ${invoice.amount_due} ${invoice.currency}`)
  } catch (error) {
    console.error('Error handling payment failed:', error)
  }
}
