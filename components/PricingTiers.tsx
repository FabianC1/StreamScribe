'use client'

import { useState } from 'react'
import { Check, Star, Crown, Zap } from 'lucide-react'
import { redirectToCheckout } from '@/lib/stripe'

interface PricingTier {
  id: string
  name: string
  price: number
  cost: number
  hours: number
  revenue: number
  features: string[]
  popular?: boolean
  icon: React.ReactNode
}

export default function PricingTiers() {
  const [selectedTier, setSelectedTier] = useState<string | null>(null)

  const tiers: PricingTier[] = [
    {
      id: 'basic',
      name: 'Basic',
      price: 6.99,
      cost: 4.00,
      hours: 30,
      revenue: 2.99,
      features: [
        '30 hours of transcription',
        'Standard accuracy',
        'Text export',
        'Email support',
        'Basic analytics'
      ],
      icon: <Zap className="w-6 h-6" />
    },
    {
      id: 'standard',
      name: 'Standard',
      price: 12.99,
      cost: 8.00,
      hours: 60,
      revenue: 4.99,
      features: [
        '60 hours of transcription',
        'High accuracy',
        'Multiple export formats',
        'Priority support',
        'Advanced analytics',
        'Bulk processing'
      ],
      popular: true,
      icon: <Star className="w-6 h-6" />
    },
    {
      id: 'premium',
      name: 'Premium',
      price: 19.99,
      cost: 15.00,
      hours: 100,
      revenue: 4.99,
      features: [
        '100 hours of transcription',
        'Premium accuracy',
        'All export formats',
        '24/7 support',
        'Full analytics dashboard',
        'API access',
        'Custom integrations',
        'White-label options'
      ],
      icon: <Crown className="w-6 h-6" />
    }
  ]

  const handleSubscribe = async (tierId: string) => {
    setSelectedTier(tierId)
    try {
      await redirectToCheckout(tierId)
    } catch (error) {
      console.error('Failed to redirect to checkout:', error)
      setSelectedTier(null)
      // You could add a toast notification here
      alert('Failed to process subscription. Please try again.')
    }
  }

  return (
    <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
      {tiers.map((tier) => (
        <div
          key={tier.id}
          className={`relative card transition-all duration-300 hover:shadow-xl ${
            tier.popular ? 'ring-2 ring-primary-500 scale-105' : ''
          }`}
        >
          {tier.popular && (
            <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
              <span className="bg-primary-600 text-white px-4 py-1 rounded-full text-sm font-medium">
                Most Popular
              </span>
            </div>
          )}

          <div className="text-center mb-6">
            <div className="w-16 h-16 bg-primary-100 dark:bg-primary-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
              <div className="text-primary-600 dark:text-primary-400">
                {tier.icon}
              </div>
            </div>
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2 transition-colors duration-200">{tier.name}</h3>
            <div className="mb-4">
              <span className="text-4xl font-bold text-gray-900 dark:text-white transition-colors duration-200">£{tier.price}</span>
              <span className="text-gray-500 dark:text-gray-400 transition-colors duration-200">/month</span>
            </div>
            <p className="text-gray-600 dark:text-gray-300 mb-4 transition-colors duration-200">{tier.hours} hours of transcription</p>
          </div>

          {/* Revenue Breakdown */}
          <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 mb-6 transition-colors duration-200">
            <h4 className="font-semibold text-gray-900 dark:text-white mb-2 transition-colors duration-200">Revenue Breakdown</h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-300">Your cost:</span>
                <span className="text-red-600 dark:text-red-400">£{tier.cost.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-300">Customer pays:</span>
                <span className="text-gray-900 dark:text-white">£{tier.price}</span>
              </div>
              <div className="flex justify-between border-t border-gray-200 dark:border-gray-600 pt-2">
                <span className="font-semibold text-gray-900 dark:text-white">Your profit:</span>
                <span className="font-semibold text-green-600 dark:text-green-400">£{tier.revenue.toFixed(2)}</span>
              </div>
            </div>
          </div>

          {/* Features */}
          <ul className="space-y-3 mb-8">
            {tier.features.map((feature, index) => (
              <li key={index} className="flex items-start gap-3">
                <Check className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                <span className="text-gray-700 dark:text-gray-200 transition-colors duration-200">{feature}</span>
              </li>
            ))}
          </ul>

          {/* Subscribe Button */}
          <button
            onClick={() => handleSubscribe(tier.id)}
            className={`w-full py-3 px-6 rounded-lg font-medium transition-colors duration-200 ${
              tier.popular
                ? 'bg-primary-600 hover:bg-primary-700 text-white'
                : 'bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-900 dark:text-white'
            }`}
          >
            {selectedTier === tier.id ? 'Processing...' : 'Subscribe Now'}
          </button>

          {/* Additional Info */}
          <div className="mt-4 text-center">
            <p className="text-xs text-gray-500 dark:text-gray-400 transition-colors duration-200">
              Cancel anytime • No setup fees
            </p>
          </div>
        </div>
      ))}
    </div>
  )
}
