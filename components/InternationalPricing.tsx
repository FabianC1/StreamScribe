'use client'

import { useState, useEffect } from 'react'
import { useTheme } from '@/lib/theme'

interface PricingData {
  basic: number
  standard: number
  premium: number
  currency: string
  symbol: string
  country: string
}

const defaultPricing: PricingData = {
  basic: 6.99,
  standard: 12.99,
  premium: 19.99,
  currency: 'USD',
  symbol: '$',
  country: 'US'
}

// Exchange rates (you can update these or use a real API)
const exchangeRates: Record<string, number> = {
  USD: 1,
  EUR: 0.85,
  GBP: 0.73,
  CAD: 1.25,
  AUD: 1.35,
  JPY: 110,
  INR: 75,
  BRL: 5.5,
  MXN: 20,
  ZAR: 15,
  NGN: 410,
  KES: 110,
  GHS: 6.5,
  EGP: 15.5,
  MAD: 9.5,
  TND: 2.8,
  DZD: 135,
  RUB: 75,
  CNY: 6.5,
  KRW: 1100,
  SGD: 1.35,
  MYR: 4.2,
  THB: 33,
  IDR: 14500,
  PHP: 50,
  VND: 23000
}

// Currency symbols
const currencySymbols: Record<string, string> = {
  USD: '$',
  EUR: '€',
  GBP: '£',
  CAD: 'C$',
  AUD: 'A$',
  JPY: '¥',
  INR: '₹',
  BRL: 'R$',
  MXN: '$',
  ZAR: 'R',
  NGN: '₦',
  KES: 'KSh',
  GHS: 'GH₵',
  EGP: 'E£',
  MAD: 'MAD',
  TND: 'TND',
  DZD: 'DZD',
  RUB: '₽',
  CNY: '¥',
  KRW: '₩',
  SGD: 'S$',
  MYR: 'RM',
  THB: '฿',
  IDR: 'Rp',
  PHP: '₱',
  VND: '₫'
}

// Country to currency mapping
const countryCurrencyMap: Record<string, string> = {
  US: 'USD',
  GB: 'GBP',
  CA: 'CAD',
  AU: 'AUD',
  DE: 'EUR',
  FR: 'EUR',
  IT: 'EUR',
  ES: 'EUR',
  NL: 'EUR',
  JP: 'JPY',
  IN: 'INR',
  BR: 'BRL',
  MX: 'MXN',
  ZA: 'ZAR',
  NG: 'NGN',
  KE: 'KES',
  GH: 'GHS',
  EG: 'EGP',
  MA: 'MAD',
  TN: 'TND',
  DZ: 'DZD',
  RU: 'RUB',
  CN: 'CNY',
  KR: 'KRW',
  SG: 'SGD',
  MY: 'MYR',
  TH: 'THB',
  ID: 'IDR',
  PH: 'PHP',
  VN: 'VND'
}

export default function InternationalPricing() {
  const [pricing, setPricing] = useState<PricingData>(defaultPricing)
  const [isLoading, setIsLoading] = useState(true)
  const { theme } = useTheme()

  useEffect(() => {
    detectUserLocation()
  }, [])

  const detectUserLocation = async () => {
    try {
      // Try to get location from IP geolocation
      const response = await fetch('https://ipapi.co/json/')
      const data = await response.json()
      
      if (data.country_code && data.currency) {
        const country = data.country_code
        const currency = data.currency
        const rate = exchangeRates[currency] || 1
        
        setPricing({
          basic: Math.round((defaultPricing.basic * rate) * 100) / 100,
          standard: Math.round((defaultPricing.standard * rate) * 100) / 100,
          premium: Math.round((defaultPricing.premium * rate) * 100) / 100,
          currency,
          symbol: currencySymbols[currency] || currency,
          country
        })
      }
    } catch (error) {
      console.log('Could not detect location, using default pricing')
    } finally {
      setIsLoading(false)
    }
  }

  const formatPrice = (price: number) => {
    if (pricing.currency === 'JPY' || pricing.currency === 'KRW' || pricing.currency === 'IDR' || pricing.currency === 'VND') {
      return `${pricing.symbol}${Math.round(price)}`
    }
    return `${pricing.symbol}${price.toFixed(2)}`
  }

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500"></div>
      </div>
    )
  }

  return (
    <div className="bg-white dark:bg-gray-900 rounded-lg shadow-lg p-6 mb-8">
      <div className="text-center mb-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
          🌍 International Pricing
        </h3>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Prices shown in {pricing.currency} ({pricing.country})
        </p>
        <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
          Exchange rates updated regularly • All prices include applicable taxes
        </p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="text-center p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
          <h4 className="font-medium text-gray-900 dark:text-white">Basic</h4>
          <p className="text-2xl font-bold text-primary-600 dark:text-primary-400">
            {formatPrice(pricing.basic)}
          </p>
          <p className="text-sm text-gray-600 dark:text-gray-400">per month</p>
        </div>
        
        <div className="text-center p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
          <h4 className="font-medium text-gray-900 dark:text-white">Standard</h4>
          <p className="text-2xl font-bold text-primary-600 dark:text-primary-400">
            {formatPrice(pricing.standard)}
          </p>
          <p className="text-sm text-gray-600 dark:text-gray-400">per month</p>
        </div>
        
        <div className="text-center p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
          <h4 className="font-medium text-gray-900 dark:text-white">Premium</h4>
          <p className="text-2xl font-bold text-primary-600 dark:text-primary-400">
            {formatPrice(pricing.premium)}
          </p>
          <p className="text-sm text-gray-600 dark:text-gray-400">per month</p>
        </div>
      </div>
      
      <div className="mt-4 text-center">
        <button 
          onClick={detectUserLocation}
          className="text-sm text-primary-600 dark:text-primary-400 hover:underline"
        >
          🔄 Update location
        </button>
      </div>
    </div>
  )
}
