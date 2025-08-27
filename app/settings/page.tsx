'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useAuth } from '../contexts/AuthContext'
import { useRouter } from 'next/navigation'
import { useTheme } from '@/lib/theme'
import Header from '../../components/Header'
import Footer from '../../components/Footer'
import { 
  User,
  CreditCard,
  Shield,
  Bell,
  Palette,
  CheckCircle,
  Edit,
  Save,
  X,
  Crown,
  Star,
  Zap
} from 'lucide-react'

export default function SettingsPage() {
  const { data: session, status } = useSession()
  const { user: customUser } = useAuth()
  const router = useRouter()
  const { theme: currentTheme, setTheme } = useTheme()
  
  const isAuthenticated = status === 'authenticated' || !!customUser
  const isLoadingAuth = status === 'loading'
  const [isLoading, setIsLoading] = useState(true)
  const [showAuthModal, setShowAuthModal] = useState(false)
  // Use the EXACT same state structure as dashboard
  const [usageData, setUsageData] = useState({ hoursUsed: 0, totalTranscriptions: 0 })

  const currentUser = session?.user || customUser

  // Show auth modal if user is not authenticated
  useEffect(() => {
    if (!isLoadingAuth && !isAuthenticated) {
      setShowAuthModal(true)
    }
  }, [isAuthenticated, isLoadingAuth])

  // Subscription data - will be fetched from database
  const [subscription, setSubscription] = useState({
    tier: currentUser?.email === 'galaselfabian@gmail.com' ? 'Premium' : 'Standard',
    status: 'Active',
    nextBilling: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days from now
    hoursUsed: 0,
    hoursTotal: currentUser?.email === 'galaselfabian@gmail.com' ? 100 : 60,
    features: currentUser?.email === 'galaselfabian@gmail.com' ? [
      '100 hours transcription per month',
      'All export formats (TXT, DOCX, SRT, VTT, MP3, MP4)',
      'AI-powered highlights & summaries',
      'Full theme customization',
      'Team collaboration features',
      'Advanced organization tools',
      'Priority phone support',
      'No ads'
    ] : [
      '60 hours transcription per month',
      'TXT, DOCX, and SRT export formats',
      'Advanced analytics with insights',
      'Enhanced video history',
      'Priority email support',
      'No ads'
    ]
  })

  const [isEditingProfile, setIsEditingProfile] = useState(false)
  const [profileData, setProfileData] = useState({
    name: '',
    email: '',
    timezone: 'UTC+0',
    language: 'English'
  })

  const [notifications, setNotifications] = useState({
    emailUpdates: true,
    billingReminders: true,
    usageAlerts: true,
    securityAlerts: true
  })

  const [profileUpdateMessage, setProfileUpdateMessage] = useState('')

  // Stats data - will be fetched from database
  const [stats, setStats] = useState({
    transcriptionsThisMonth: 0,
    totalExports: 0
  })

  // Remove the local theme state since we're using the context
  // const [theme, setTheme] = useState('system')

  // Fetch profile data from MongoDB
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await fetch('/api/profile')
        if (response.ok) {
          const data = await response.json()
          setProfileData(data)
        }
      } catch (error) {
        console.error('Failed to fetch profile:', error)
      }
    }

    if (isAuthenticated) {
      fetchProfile()
    }
  }, [isAuthenticated])

  // Fetch subscription data from database
  useEffect(() => {
    const fetchSubscription = async () => {
      try {
        const response = await fetch('/api/subscription')
        if (response.ok) {
          const data = await response.json()
          setSubscription(prev => ({ ...prev, ...data }))
        }
      } catch (error) {
        console.error('Failed to fetch subscription:', error)
        // Keep default values if fetch fails
      }
    }

    if (isAuthenticated) {
      fetchSubscription()
    }
  }, [isAuthenticated])

  // Fetch stats data - using the EXACT same API call as dashboard
  useEffect(() => {
    const fetchUsageData = async () => {
      try {
        const response = await fetch('/api/usage/stats')
        if (response.ok) {
          const data = await response.json()
          setUsageData({
            hoursUsed: data.monthlyHours || 0,
            totalTranscriptions: data.totalTranscriptions || 0
          })
          console.log('✅ Usage data fetched:', data)
        } else {
          console.error('❌ Usage API response not ok:', response.status)
        }
      } catch (error) {
        console.error('Failed to fetch usage data:', error)
      } finally {
        setIsLoading(false)
      }
    }

    if (isAuthenticated) {
      fetchUsageData()
    }
  }, [isAuthenticated])

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/login')
    }
  }, [isAuthenticated, isLoading, router])

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-700">
        <Header />
        <main className="pt-28 flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
        </main>
      </div>
    )
  }

  if (!isAuthenticated) {
    return null
  }

  const handleProfileSave = async () => {
    try {
      const response = await fetch('/api/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(profileData),
      })

      if (response.ok) {
        setIsEditingProfile(false)
        setProfileUpdateMessage('Profile updated successfully!')
        // Clear success message after 3 seconds
        setTimeout(() => setProfileUpdateMessage(''), 3000)
      } else {
        const error = await response.json()
        setProfileUpdateMessage('Failed to update profile. Please try again.')
        // Clear error message after 5 seconds
        setTimeout(() => setProfileUpdateMessage(''), 5000)
        console.error('Failed to update profile:', error)
      }
    } catch (error) {
      setProfileUpdateMessage('Failed to update profile. Please try again.')
      // Clear error message after 5 seconds
      setTimeout(() => setProfileUpdateMessage(''), 5000)
      console.error('Profile update error:', error)
    }
  }

  const handleNotificationToggle = (key: keyof typeof notifications) => {
    setNotifications(prev => ({
      ...prev,
      [key]: !prev[key]
    }))
  }

  const getTierIcon = (tier: string) => {
    switch (tier.toLowerCase()) {
      case 'premium':
        return <Crown className="w-5 h-5 text-yellow-500" />
      case 'standard':
        return <Star className="w-5 h-5 text-blue-500" />
      case 'basic':
        return <Zap className="w-5 h-5 text-purple-500" />
      default:
        return <Shield className="w-5 h-5 text-gray-500" />
    }
  }

  const getTierColor = (tier: string) => {
    switch (tier.toLowerCase()) {
      case 'premium':
        return 'bg-gradient-to-r from-yellow-400 to-orange-500'
      case 'standard':
        return 'bg-gradient-to-r from-blue-400 to-purple-500'
      case 'basic':
        return 'bg-gradient-to-r from-green-400 to-teal-500'
      default:
        return 'bg-gradient-to-r from-gray-400 to-gray-500'
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-700">
      <style jsx>{`
        .card {
          @apply bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6;
        }
        .btn-primary {
          @apply px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white font-medium rounded-lg transition-colors duration-200;
        }
        .btn-secondary {
          @apply px-4 py-2 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 font-medium rounded-lg transition-colors duration-200;
        }
      `}</style>
      
      <Header />
      
      <main className="pt-28 pb-20">
        <div className="container mx-auto px-4">
          {/* Page Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4">
              Account Settings
            </h1>
            <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              Manage your subscription, profile, and preferences
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
            {/* Left Column - Profile & Account */}
            <div className="lg:col-span-2 space-y-8">
              {/* Profile Section */}
              <div className="card">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
                    <User className="w-6 h-6 text-primary-600" />
                    Profile Information
                  </h2>
                  {!isEditingProfile ? (
                    <button
                      onClick={() => setIsEditingProfile(true)}
                      className="btn-secondary flex items-center gap-2"
                    >
                      <Edit className="w-4 h-4" />
                      Edit
                    </button>
                  ) : (
                    <div className="flex gap-2">
                      <button
                        onClick={handleProfileSave}
                        className="btn-primary flex items-center gap-2"
                      >
                        <Save className="w-4 h-4" />
                        Save
                      </button>
                      <button
                        onClick={() => setIsEditingProfile(false)}
                        className="btn-secondary flex items-center gap-2"
                      >
                        <X className="w-4 h-4" />
                        Cancel
                      </button>
                    </div>
                  )}
                </div>

                {/* Profile Update Message */}
                {profileUpdateMessage && (
                  <div className={`mb-4 p-3 rounded-lg ${
                    profileUpdateMessage.includes('successfully') 
                      ? 'bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-300 border border-green-200 dark:border-green-800'
                      : 'bg-red-100 dark:bg-red-900/20 text-red-700 dark:text-red-300 border border-red-200 dark:border-red-800'
                  }`}>
                    {profileUpdateMessage}
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Full Name
                    </label>
                    {isEditingProfile ? (
                      <input
                        type="text"
                        value={profileData.name}
                        onChange={(e) => setProfileData(prev => ({ ...prev, name: e.target.value }))}
                        className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      />
                    ) : (
                      <p className="text-gray-900 dark:text-white py-3">{profileData.name}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Email
                    </label>
                    {isEditingProfile ? (
                      <input
                        type="email"
                        value={profileData.email}
                        onChange={(e) => setProfileData(prev => ({ ...prev, email: e.target.value }))}
                        className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      />
                    ) : (
                      <p className="text-gray-900 dark:text-white py-3">{profileData.email}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Timezone
                    </label>
                    {isEditingProfile ? (
                      <select
                        value={profileData.timezone}
                        onChange={(e) => setProfileData(prev => ({ ...prev, timezone: e.target.value }))}
                        className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      >
                        <option value="UTC+0">UTC+0 (London)</option>
                        <option value="UTC-5">UTC-5 (New York)</option>
                        <option value="UTC-8">UTC-8 (Los Angeles)</option>
                        <option value="UTC+1">UTC+1 (Paris)</option>
                        <option value="UTC+8">UTC+8 (Singapore)</option>
                      </select>
                    ) : (
                      <p className="text-gray-900 dark:text-white py-3">{profileData.timezone}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Language
                    </label>
                    {isEditingProfile ? (
                      <select
                        value={profileData.language}
                        onChange={(e) => setProfileData(prev => ({ ...prev, language: e.target.value }))}
                        className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      >
                        <option value="English">English</option>
                        <option value="Spanish">Spanish</option>
                        <option value="French">French</option>
                        <option value="German">German</option>
                        <option value="Chinese">Chinese</option>
                      </select>
                    ) : (
                      <p className="text-gray-900 dark:text-white py-3">{profileData.language}</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Notifications Section */}
              <div className="card">
                <div className="flex items-center gap-3 mb-6">
                  <Bell className="w-6 h-6 text-primary-600" />
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                    Notification Preferences
                  </h2>
                </div>

                <div className="space-y-4">
                  {Object.entries(notifications).map(([key, value]) => (
                    <div key={key} className="flex items-center justify-between py-3">
                      <div>
                        <h3 className="font-medium text-gray-900 dark:text-white capitalize">
                          {key.replace(/([A-Z])/g, ' $1').trim()}
                        </h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {key === 'emailUpdates' && 'Receive updates about your account and service'}
                          {key === 'billingReminders' && 'Receive billing and payment reminders'}
                          {key === 'usageAlerts' && 'Get notified when approaching transcription limits'}
                          {key === 'securityAlerts' && 'Receive security notifications and login alerts'}
                        </p>
                      </div>
                      <button
                        onClick={() => handleNotificationToggle(key as keyof typeof notifications)}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                          value ? 'bg-primary-600' : 'bg-gray-300 dark:bg-gray-600'
                        }`}
                      >
                        <span
                          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                            value ? 'translate-x-6' : 'translate-x-1'
                          }`}
                        />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Theme Section */}
              <div className="card">
                <div className="flex items-center gap-3 mb-6">
                  <Palette className="w-6 h-6 text-primary-600" />
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                    Appearance
                  </h2>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                      Theme
                    </label>
                    <div className="grid grid-cols-3 gap-3">
                      {[
                        { value: 'light' as const, label: 'Light', icon: '☀️' },
                        { value: 'dark' as const, label: 'Dark', icon: '🌙' },
                        { value: 'system' as const, label: 'System', icon: '💻' }
                      ].map((option) => (
                        <button
                          key={option.value}
                          onClick={() => setTheme(option.value)}
                          className={`p-4 rounded-lg border-2 transition-all ${
                            currentTheme === option.value
                              ? 'border-primary-500 bg-primary-100/50 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300'
                              : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500 text-gray-700 dark:text-gray-300'
                          }`}
                        >
                          <div className="text-2xl mb-2">{option.icon}</div>
                          <div className="text-sm font-medium">
                            {option.label}
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column - Subscription & Usage */}
            <div className="space-y-8">
              {/* Subscription Status */}
              <div className="card">
                <div className="flex items-center gap-3 mb-6">
                  <CreditCard className="w-6 h-6 text-primary-600" />
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                    Subscription
                  </h2>
                </div>

                <div className="space-y-4">
                  <div className={`p-4 rounded-lg ${getTierColor(subscription.tier)} text-white`}>
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-semibold">{subscription.tier} Plan</span>
                      {getTierIcon(subscription.tier)}
                    </div>
                    <div className="text-sm opacity-90">
                      Status: {subscription.status}
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600 dark:text-gray-400">Next billing:</span>
                      <span className="font-medium text-gray-900 dark:text-white">
                        {new Date(subscription.nextBilling).toLocaleDateString()}
                      </span>
                    </div>
                    
                                         <div className="space-y-2">
                       <div className="flex justify-between items-center">
                         <span className="text-gray-600 dark:text-gray-400">Hours used:</span>
                         <span className="font-medium text-gray-900 dark:text-white">
                           {usageData.hoursUsed.toFixed(1)} / {subscription.hoursTotal}
                         </span>
                       </div>
                       <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                         <div 
                           className="bg-primary-600 h-2 rounded-full transition-all duration-300"
                           style={{ width: `${(usageData.hoursUsed / subscription.hoursTotal) * 100}%` }}
                         ></div>
                       </div>
                     </div>
                  </div>

                  <button 
                    onClick={() => router.push('/subscriptions')}
                    className="btn-primary w-full"
                  >
                    Manage Subscription
                  </button>
                </div>
              </div>

              {/* Plan Features */}
              <div className="card">
                <div className="flex items-center gap-3 mb-6">
                  <Shield className="w-6 h-6 text-primary-600" />
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    Plan Features
                  </h3>
                </div>

                <ul className="space-y-3">
                  {subscription.features.map((feature, index) => (
                    <li key={index} className="flex items-start gap-3">
                      <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                      <span className="text-gray-700 dark:text-gray-200 text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>

                <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
                  {subscription.tier !== 'Premium' && (
                    <button 
                      onClick={() => router.push('/pricing')}
                      className="btn-secondary w-full"
                    >
                      Upgrade Plan
                    </button>
                  )}
                </div>
              </div>

               {/* Quick Stats */}
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
                   <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                     <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Quick Stats</h2>
                     <p className="text-gray-600 dark:text-gray-400 mt-1">Your transcription activity overview</p>
                   </div>
                   
                   <div className="p-6">
                     {isLoading ? (
                       <div className="text-center py-8">
                         <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto"></div>
                         <p className="mt-2 text-gray-500 dark:text-gray-400">Loading stats...</p>
                       </div>
                     ) : (
                       <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                         <div className="text-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                           <div className="text-2xl font-bold text-primary-600 dark:text-primary-400">
                             {usageData.totalTranscriptions}
                           </div>
                           <div className="text-xs text-gray-600 dark:text-gray-400">
                             Total
                           </div>
                         </div>
                         
                         <div className="text-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                           <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                             {usageData.hoursUsed.toFixed(1)}
                           </div>
                           <div className="text-xs text-gray-600 dark:text-gray-400">
                             Hours Used
                           </div>
                         </div>
                         
                         <div className="text-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                           <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                             {usageData.totalTranscriptions}
                           </div>
                           <div className="text-xs text-gray-600 dark:text-gray-400">
                             Total
                           </div>
                         </div>
                         
                         <div className="text-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                           <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                             {usageData.totalTranscriptions}
                           </div>
                           <div className="text-xs text-gray-600 dark:text-gray-400">
                             Today
                           </div>
                         </div>
                       </div>
                     )}
                   </div>
                 </div>

              
             </div>
           </div>
         </div>
       </main>

       {/* Authentication Required Modal */}
       {showAuthModal && (
         <div className="fixed inset-0 bg-black bg-opacity-70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
           <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full transform transition-all duration-300 scale-100 opacity-100 shadow-2xl border border-gray-200 dark:border-gray-700">
             <div className="text-center mb-6">
               <div className="w-16 h-16 bg-primary-100 dark:bg-primary-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
                 <Shield className="w-8 h-8 text-primary-600 dark:text-primary-400" />
               </div>
               <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                 Account Required
               </h3>
               <p className="text-gray-600 dark:text-gray-300">
                 You need to create an account to access your dashboard, settings, and manage your subscription.
               </p>
             </div>
             
             <div className="space-y-3">
               <button
                 onClick={() => router.push('/register')}
                 className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors duration-200"
               >
                 Create Account
               </button>
               <button
                 onClick={() => router.push('/login')}
                 className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:text-gray-300 font-medium rounded-lg transition-colors duration-200"
               >
                 Sign In
               </button>
               <button
                 onClick={() => router.push('/')}
                 className="w-full text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-colors duration-200"
               >
                 Cancel
               </button>
             </div>
           </div>
         </div>
       )}

       <Footer />
     </div>
   )
 }
