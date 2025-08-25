'use client'

import { useState } from 'react'
import { Check, Star, Crown, Zap, ArrowRight } from 'lucide-react'
import Link from 'next/link'

interface PricingTier {
  id: string
  name: string
  price: number
  hours: number
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
      hours: 30,
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
      icon: <Zap className="w-6 h-6" />
    },
    {
      id: 'standard',
      name: 'Standard',
      price: 12.99,
      hours: 60,
      features: [
        'Everything in Basic',
        '60 hours transcription',
        'High accuracy',
        'DOCX & SRT exports',
        'Advanced analytics',
        'No ads',
        'Themes'
      ],
      popular: true,
      icon: <Star className="w-6 h-6" />
    },
    {
      id: 'premium',
      name: 'Premium',
      price: 19.99,
      hours: 100,
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
      icon: <Crown className="w-6 h-6" />
    }
  ]

  const handleSubscribe = (tierId: string) => {
    setSelectedTier(tierId)
    // Redirect to registration for new users
    window.location.href = '/register'
  }

  return (
    <div className="space-y-8">
      {/* View Detailed Pricing Link */}
      <div className="text-center mb-8">
        <Link
          href="/pricing"
          className="inline-flex items-center gap-2 text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 font-medium transition-colors duration-200"
        >
          View detailed pricing and features
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8 max-w-6xl mx-auto">
        {tiers.map((tier) => (
          <div
            key={tier.id}
            className={`relative card pricing-card transition-all duration-200 hover:shadow-xl ${
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
                <div className="text-primary-600 dark:text-primary-500">
                  {tier.icon}
                </div>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2 transition-colors duration-200">{tier.name}</h3>
              <div className="mb-4">
                <span className="text-4xl font-bold text-gray-900 dark:text-white transition-colors duration-200">£{tier.price}</span>
                <span className="text-gray-500 dark:text-gray-400 transition-colors duration-200">/month</span>
              </div>
              <p className="text-gray-600 dark:text-gray-300 mb-4 transition-colors duration-200">{tier.hours} hours per month</p>
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
              {selectedTier === tier.id ? 'Redirecting...' : 'Get Started'}
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
    </div>
  )
}
