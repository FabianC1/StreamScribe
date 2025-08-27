'use client'

import { useState } from 'react'
import { useSession } from 'next-auth/react'
import { useAuth } from '../contexts/AuthContext'
import Header from '../../components/Header'
import Footer from '../../components/Footer'
import { loadStripe } from '@stripe/stripe-js'

import { 
  Check, 
  X, 
  Star,
  Zap,
  Crown,
  Shield,
  Clock,
  Download,
  BarChart3,
  Users,
  Monitor,
  Headphones,
  FileText
} from 'lucide-react'
import Link from 'next/link'

export default function PricingPage() {
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null)
  const { data: session, status } = useSession()
  const { user: customUser } = useAuth()
  
  const isAuthenticated = status === 'authenticated' || !!customUser

  const plans = [
    {
      id: 'basic',
      name: 'Basic',
      price: '£6.99',
      period: '/month',
      hours: '30 hours per month',
      features: [
        '30 hours transcription',
        'Standard accuracy',
        'TXT export only',
        'Timestamps',
        'Save notes',
        'Cached transcripts',
        'Video history',
        'Ads shown (ad removal not included)'
      ],
      popular: false
    },
    {
      id: 'standard',
      name: 'Standard',
      price: '£12.99',
      period: '/month',
      hours: '60 hours per month',
      features: [
        'Everything in Basic',
        '60 hours transcription',
        'High accuracy',
        'DOCX & SRT exports',
        'Advanced analytics',
        'No ads',
        'Themes'
      ],
      popular: true
    },
    {
      id: 'premium',
      name: 'Premium',
      price: '£19.99',
      period: '/month',
      hours: '100 hours per month',
      features: [
        'Everything in Standard',
        '100 hours transcription',
        'Premium accuracy',
        'All export formats (VTT, MP3, MP4)',
        'AI highlights & summaries',
        'Full customization',
        'Collaboration features',
        'Organization tools',
        'Custom workspace'
      ],
      popular: false
    }
  ]

  const [isLoading, setIsLoading] = useState<string | null>(null)

  const handlePlanSelect = async (planId: string) => {
    if (!isAuthenticated) {
      // Redirect to registration for new users
      window.location.href = '/register'
      return
    }
    
    setIsLoading(planId)
    setSelectedPlan(planId)
    
    try {
      // Create Stripe checkout session
      const response = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          tier: planId,
          customerEmail: session?.user?.email,
          successUrl: `${window.location.origin}/dashboard?success=true`,
          cancelUrl: `${window.location.origin}/pricing?canceled=true`,
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to create checkout session')
      }

      const { sessionId } = await response.json()
      
      console.log('🔍 Stripe publishable key:', process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY ? 'Present' : 'Missing')
      
      // Redirect to Stripe checkout
      const stripe = await loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!)
      console.log('🔍 Stripe instance loaded:', !!stripe)
      
      if (stripe) {
        console.log('🔍 Redirecting to Stripe checkout with session:', sessionId)
        const { error } = await stripe.redirectToCheckout({ sessionId })
        if (error) {
          console.error('❌ Stripe checkout error:', error)
          alert('Failed to redirect to checkout. Please try again.')
        } else {
          console.log('✅ Stripe redirect successful')
        }
      } else {
        console.error('❌ Failed to load Stripe')
        alert('Failed to load payment system. Please try again.')
      }
    } catch (error) {
      console.error('Error creating checkout session:', error)
      alert('Failed to create checkout session. Please try again.')
    } finally {
      setIsLoading(null)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-700 transition-colors duration-200">
      <Header />
      
      <main className="pt-28">
        {/* Hero Section */}
        <section className="text-center py-20 px-4">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-5xl md:text-6xl font-bold text-gray-900 dark:text-white mb-6">
              Choose Your Perfect Plan
            </h1>
            <p className="text-xl md:text-2xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto leading-relaxed">
              Select the plan that best fits your transcription needs. All plans include our core features and 24/7 support.
            </p>
          </div>
        </section>

        {/* Pricing Cards */}
        <section className="py-20 px-4">
          <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {plans.map((plan) => (
                <div
                  key={plan.id}
                  className={`relative bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-xl transition-all duration-300 hover:scale-105 ${
                    plan.popular 
                      ? 'ring-2 ring-primary-500 dark:ring-primary-400 transform scale-105' 
                      : 'border border-gray-200 dark:border-gray-700'
                  }`}
                >
                  {plan.popular && (
                    <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                      <div className="bg-primary-500 text-white px-4 py-2 rounded-full text-sm font-semibold">
                        Most Popular
                      </div>
                    </div>
                  )}

                  <div className="text-center mb-8">
                    <div className="w-16 h-16 bg-primary-100 dark:bg-primary-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
                      {plan.id === 'premium' ? (
                        <Crown className="w-8 h-8 text-primary-600 dark:text-primary-400" />
                      ) : plan.id === 'standard' ? (
                        <Star className="w-8 h-8 text-primary-600 dark:text-primary-400" />
                      ) : (
                        <Zap className="w-8 h-8 text-primary-600 dark:text-primary-400" />
                      )}
                    </div>
                    <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                      {plan.name}
                    </h3>
                    <div className="flex items-baseline justify-center mb-4">
                      <span className="text-4xl font-bold text-primary-600 dark:text-primary-400">
                        {plan.price}
                      </span>
                      <span className="text-gray-600 dark:text-gray-400 ml-1">
                        {plan.period}
                      </span>
                    </div>
                    <p className="text-gray-600 dark:text-gray-300 mb-2">
                      {plan.hours}
                    </p>
                  </div>

                  {/* Features */}
                  <div className="mb-8">
                    <ul className="space-y-3">
                      {plan.features.map((feature, index) => (
                        <li key={index} className="flex items-start">
                          <Check className="w-5 h-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                          <span className="text-gray-700 dark:text-gray-300 text-sm">
                            {feature}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* CTA Button */}
                  <button
                    onClick={() => handlePlanSelect(plan.id)}
                    disabled={isLoading === plan.id}
                    className="w-full py-4 px-6 rounded-lg font-semibold transition-colors duration-200 bg-primary-600 hover:bg-primary-700 text-white disabled:bg-primary-400 disabled:cursor-not-allowed"
                  >
                                         {isLoading === plan.id ? (
                       <div className="flex items-center justify-center gap-2">
                         <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                         Creating Checkout...
                       </div>
                     ) : (
                       isAuthenticated ? 'Select Plan' : 'Get Started'
                     )}
                   </button>
                   <p className="text-center text-sm text-gray-500 dark:text-gray-400 mt-3">
                     Cancel anytime • No setup fees
                   </p>
                 </div>
               ))}
             </div>
           </div>
         </section>

        {/* FAQ Section */}
        <section className="py-20 px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold text-center text-gray-900 dark:text-white mb-16">
              Frequently Asked Questions
            </h2>
            
            <div className="space-y-8">
              <div className="bg-white dark:bg-gray-800 rounded-lg p-6">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
                  Can I change my plan later?
                </h3>
                <p className="text-gray-600 dark:text-gray-300">
                  Yes! You can upgrade or downgrade your plan at any time. Changes will take effect at the start of your next billing cycle.
                </p>
              </div>

              <div className="bg-white dark:bg-gray-800 rounded-lg p-6">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
                  What happens if I exceed my monthly hours?
                </h3>
                <p className="text-gray-600 dark:text-gray-300">
                  You'll receive a notification when you're close to your limit. You can either upgrade your plan or wait until the next billing cycle.
                </p>
              </div>

              <div className="bg-white dark:bg-gray-800 rounded-lg p-6">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
                  Is there a free trial?
                </h3>
                <p className="text-gray-600 dark:text-gray-300">
                  We offer a 7-day money-back guarantee. If you're not satisfied with our service, we'll refund your first payment.
                </p>
              </div>

              <div className="bg-white dark:bg-gray-800 rounded-lg p-6">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
                  How do I cancel my subscription?
                </h3>
                <p className="text-gray-600 dark:text-gray-300">
                  You can cancel your subscription at any time from your account settings. Your access will continue until the end of your current billing period.
                </p>
              </div>
            </div>
          </div>
        </section>


      </main>

      <Footer />
    </div>
  )
}
