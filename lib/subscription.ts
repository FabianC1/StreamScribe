export type SubscriptionTier = 'basic' | 'standard' | 'premium' | 'free'

export interface SubscriptionFeatures {
  tier: SubscriptionTier
  allowedFormats: string[]
  maxHours: number
  hasAnalytics: boolean
  hasThemes: boolean
  hasCollaboration: boolean
}

export const SUBSCRIPTION_TIERS: Record<SubscriptionTier, SubscriptionFeatures> = {
  free: {
    tier: 'free',
    allowedFormats: ['TXT'],
    maxHours: 5,
    hasAnalytics: false,
    hasThemes: false,
    hasCollaboration: false
  },
  basic: {
    tier: 'basic',
    allowedFormats: ['TXT'],
    maxHours: 30,
    hasAnalytics: false,
    hasThemes: false,
    hasCollaboration: false
  },
  standard: {
    tier: 'standard',
    allowedFormats: ['TXT', 'DOCX', 'SRT'],
    maxHours: 60,
    hasAnalytics: true,
    hasThemes: true,
    hasCollaboration: false
  },
  premium: {
    tier: 'premium',
    allowedFormats: ['TXT', 'DOCX', 'SRT', 'VTT', 'MP3', 'MP4'],
    maxHours: 100,
    hasAnalytics: true,
    hasThemes: true,
    hasCollaboration: true
  }
}

export function canExportFormat(userTier: SubscriptionTier, format: string): boolean {
  const features = SUBSCRIPTION_TIERS[userTier]
  return features.allowedFormats.includes(format)
}

export function getUpgradeMessage(currentTier: SubscriptionTier, format: string): string {
  const formatNames: Record<string, string> = {
    'DOCX': 'DOCX export',
    'SRT': 'SRT export',
    'VTT': 'VTT export',
    'MP3': 'MP3 export',
    'MP4': 'MP4 export'
  }
  
  const formatName = formatNames[format] || format
  
  switch (currentTier) {
    case 'free':
      return `Upgrade to Basic (£6.99/month) for ${formatName}`
    case 'basic':
      return `Upgrade to Standard (£12.99/month) for ${formatName}`
    case 'standard':
      return `Upgrade to Premium (£19.99/month) for ${formatName}`
    default:
      return `Upgrade your plan for ${formatName}`
  }
}

// For now, we'll use a mock subscription tier
// In a real app, this would come from your backend/database
export function getCurrentUserTier(): SubscriptionTier {
  // Mock: return 'premium' for testing all features
  // In production, this would check the user's actual subscription
  return 'premium'
}
