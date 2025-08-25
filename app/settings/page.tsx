'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useAuth } from '../contexts/AuthContext'
import { useRouter } from 'next/navigation'
import Header from '../../components/Header'
import Footer from '../../components/Footer'
import { 
  User,
  CreditCard,
  Shield,
  Settings as SettingsIcon,
  Bell,
  Palette,
  Download,
  Clock,
  CheckCircle,
  AlertCircle,
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
  
  const isAuthenticated = status === 'authenticated' || !!customUser
  const isLoading = status === 'loading'
  const currentUser = session?.user || customUser

  // Mock subscription data - replace with real data from your database
  const [subscription, setSubscription] = useState({
    tier: 'Standard',
    status: 'Active',
    nextBilling: '2024-09-25',
    hoursUsed: 23,
    hoursTotal: 60,
    features: [
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
    name: currentUser?.name || '',
    email: currentUser?.email || '',
    timezone: 'UTC+0',
    language: 'English'
  })

  const [notifications, setNotifications] = useState({
    emailUpdates: true,
    transcriptionComplete: true,
    billingReminders: true,
    newFeatures: false
  })

  const [theme, setTheme] = useState('system')

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

  const handleProfileSave = () => {
    // TODO: Implement profile update API call
    console.log('Saving profile:', profileData)
    setIsEditingProfile(false)
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
        return <Zap className="w-5 h-5 text-green-500" />
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
                          {key === 'transcriptionComplete' && 'Get notified when transcription is finished'}
                          {key === 'billingReminders' && 'Receive billing and payment reminders'}
                          {key === 'newFeatures' && 'Learn about new features and updates'}
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
                        { value: 'light', label: 'Light', icon: '☀️' },
                        { value: 'dark', label: 'Dark', icon: '🌙' },
                        { value: 'system', label: 'System', icon: '💻' }
                      ].map((option) => (
                        <button
                          key={option.value}
                          onClick={() => setTheme(option.value)}
                          className={`p-4 rounded-lg border-2 transition-all ${
                            theme === option.value
                              ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
                              : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500'
                          }`}
                        >
                          <div className="text-2xl mb-2">{option.icon}</div>
                          <div className="text-sm font-medium text-gray-900 dark:text-white">
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
                          {subscription.hoursUsed} / {subscription.hoursTotal}
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                        <div 
                          className="bg-primary-600 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${(subscription.hoursUsed / subscription.hoursTotal) * 100}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>

                  <button className="btn-primary w-full">
                    Manage Subscription
                  </button>
                </div>
              </div>

              {/* Plan Features */}
              <div className="card">
                <div className="flex items-center gap-3 mb-6">
                  <Shield className="w-6 h-6 text-primary-600" />
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                    Plan Features
                  </h2>
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
                  <button className="btn-secondary w-full">
                    Upgrade Plan
                  </button>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="card">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  Quick Actions
                </h3>
                
                <div className="space-y-3">
                  <button className="w-full text-left p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors flex items-center gap-3 text-gray-700 dark:text-gray-200">
                    <Download className="w-5 h-5 text-primary-600" />
                    Export Data
                  </button>
                  <button className="w-full text-left p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors flex items-center gap-3 text-gray-700 dark:text-gray-200">
                    <Clock className="w-5 h-5 text-primary-600" />
                    View History
                  </button>
                  <button className="w-full text-left p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors flex items-center gap-3 text-gray-700 dark:text-gray-200">
                    <SettingsIcon className="w-5 h-5 text-primary-600" />
                    Advanced Settings
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
