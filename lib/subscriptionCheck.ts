import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import connectDB from '@/lib/mongodb'
import User from '@/models/User'

const DEV_ACCOUNT_EMAIL = 'galaselfabian@gmail.com'

export async function checkSubscriptionStatus() {
  try {
    const session = await getServerSession(authOptions) as any
    
    if (!session?.user?.email) {
      return { hasSubscription: false, error: 'Not authenticated' }
    }

    await connectDB()

    // Dev account bypass: skip expiry/status check but read real tier from DB
    // This allows freely switching tiers via DEVFREE to test gating behaviour
    if (process.env.NODE_ENV !== 'production' && session.user.email === DEV_ACCOUNT_EMAIL) {
      const devUser = await User.findOne({ email: DEV_ACCOUNT_EMAIL })
      return {
        hasSubscription: true,
        user: {
          id: devUser?._id ?? session.user.id,
          email: session.user.email,
          subscriptionTier: devUser?.subscriptionTier || 'premium',
          subscriptionStatus: 'active',
          hoursUsed: devUser?.hoursUsed || 0,
          hoursLimit: devUser?.hoursLimit || 100
        }
      }
    }
    
    const user = await User.findOne({ email: session.user.email })
    
    if (!user) {
      return { hasSubscription: false, error: 'User not found' }
    }

    const hasActiveSubscription = user.subscriptionTier && 
                               user.subscriptionStatus === 'active' && 
                               user.subscriptionEndDate && 
                               user.subscriptionEndDate > new Date()

    return {
      hasSubscription: hasActiveSubscription,
      user: {
        id: user._id,
        email: user.email,
        subscriptionTier: user.subscriptionTier,
        subscriptionStatus: user.subscriptionStatus,
        hoursUsed: user.hoursUsed,
        hoursLimit: user.hoursLimit
      }
    }
  } catch (error) {
    console.error('Error checking subscription status:', error)
    return { hasSubscription: false, error: 'Database error' }
  }
}

export async function requireSubscription() {
  const subscriptionCheck = await checkSubscriptionStatus()
  
  if (!subscriptionCheck.hasSubscription) {
    throw new Error('Active subscription required')
  }
  
  return subscriptionCheck.user
}
