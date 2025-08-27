import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import connectDB from '@/lib/mongodb'
import User from '@/models/User'

export async function checkSubscriptionStatus() {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.email) {
      return { hasSubscription: false, error: 'Not authenticated' }
    }

    await connectDB()
    
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
