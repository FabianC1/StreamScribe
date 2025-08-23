'use client'

import { useState, useEffect } from 'react'
import Header from '../../components/Header'
import { CreditCard, Calendar, Clock, AlertTriangle, Settings, User, LogOut, Shield } from 'lucide-react'
import Link from 'next/link'

export default function SubscriptionsPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [showCancelModal, setShowCancelModal] = useState(false)
  const [isAuthenticated, setIsAuthenticated] = useState(false) // TODO: Replace with actual auth state

  // Mock subscription data - in real app, this would come from your backend
  const subscription = {
    status: 'active',
    plan: 'Standard',
    nextBilling: '2024-02-15',
    hoursRemaining: 42,
    totalHours: 60,
    price: 12.99,
    startDate: '2024-01-15',
    customerName: 'John Doe',
    customerEmail: 'john.doe@example.com'
  }

  useEffect(() => {
    // TODO: Check actual authentication status
    // For now, simulate authenticated user
    setIsAuthenticated(true)
  }, [])

  const handleCancelSubscription = async () => {
    setIsLoading(true)
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 2000))
    setIsLoading(false)
    setShowCancelModal(false)
    // In real app, update subscription status
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    })
  }

  // Show authentication required message if not authenticated
  if (!isAuthenticated) {
    return (
      <>
        <Header />
        <main className="pt-28 min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
          <div className="text-center max-w-md mx-auto px-4">
            <div className="mb-8">
              <div className="w-16 h-16 bg-primary-100 dark:bg-primary-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <Shield className="w-8 h-8 text-primary-600 dark:text-primary-400" />
              </div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                Authentication Required
              </h1>
              <p className="text-gray-600 dark:text-gray-300">
                Please sign in to view your subscription details and manage your account.
              </p>
            </div>
            
            <div className="space-y-3">
              <Link href="/login" className="btn-primary w-full">
                Sign In
              </Link>
              <Link href="/register" className="btn-secondary w-full">
                Create Account
              </Link>
            </div>
          </div>
        </main>
      </>
    )
  }

  return (
    <>
      <Header />
      <main className="pt-28 min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="container mx-auto px-4 py-8">
          {/* Page Header */}
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Subscription Management
            </h1>
            <p className="text-lg text-gray-600 dark:text-gray-300">
              Manage your StreamScribe subscription and usage
            </p>
          </div>

          {/* User Info */}
          <div className="max-w-4xl mx-auto mb-6">
            <div className="card">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-primary-100 dark:bg-primary-900/20 rounded-full flex items-center justify-center">
                    <User className="w-6 h-6 text-primary-600 dark:text-primary-400" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white">{subscription.customerName}</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{subscription.customerEmail}</p>
                  </div>
                </div>
                <Link href="/logout" className="btn-secondary flex items-center gap-2">
                  <LogOut className="w-4 h-4" />
                  Sign Out
                </Link>
              </div>
            </div>
          </div>

          {/* Subscription Status Card */}
          <div className="max-w-4xl mx-auto">
            <div className="card mb-8">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">
                  Current Subscription
                </h2>
                <div className={`px-3 py-1 rounded-full text-sm font-medium ${
                  subscription.status === 'active' 
                    ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                    : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                }`}>
                  {subscription.status === 'active' ? 'Active' : 'Inactive'}
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                {/* Plan Details */}
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <CreditCard className="w-5 h-5 text-primary-600" />
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Plan</p>
                      <p className="font-medium text-gray-900 dark:text-white">{subscription.plan}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <Calendar className="w-5 h-5 text-primary-600" />
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Next Billing</p>
                      <p className="font-medium text-gray-900 dark:text-white">
                        {formatDate(subscription.nextBilling)}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <Clock className="w-5 h-5 text-primary-600" />
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Start Date</p>
                      <p className="font-medium text-gray-900 dark:text-white">
                        {formatDate(subscription.startDate)}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Usage & Pricing */}
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <Settings className="w-5 h-5 text-primary-600" />
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Monthly Price</p>
                      <p className="font-medium text-gray-900 dark:text-white">£{subscription.price}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <User className="w-5 h-5 text-primary-600" />
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Hours Remaining</p>
                      <p className="font-medium text-gray-900 dark:text-white">
                        {subscription.hoursRemaining} / {subscription.totalHours}
                      </p>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="mt-4">
                    <div className="flex justify-between text-sm text-gray-500 dark:text-gray-400 mb-2">
                      <span>Usage</span>
                      <span>{Math.round((subscription.totalHours - subscription.hoursRemaining) / subscription.totalHours * 100)}%</span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                      <div 
                        className="bg-primary-600 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${(subscription.totalHours - subscription.hoursRemaining) / subscription.totalHours * 100}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button className="btn-secondary flex items-center gap-2">
                <Settings className="w-4 h-4" />
                Change Plan
              </button>
              <button 
                onClick={() => setShowCancelModal(true)}
                className="btn-primary bg-red-600 hover:bg-red-700 flex items-center gap-2"
              >
                <AlertTriangle className="w-4 h-4" />
                Cancel Subscription
              </button>
            </div>

            {/* Usage History */}
            <div className="card mt-8">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                Recent Usage
              </h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between py-2 border-b border-gray-100 dark:border-gray-700">
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">YouTube Video Transcription</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Video ID: dQw4w9WgXcQ</p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-gray-900 dark:text-white">2.5 hours</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">2 hours ago</p>
                  </div>
                </div>
                <div className="flex items-center justify-between py-2 border-b border-gray-100 dark:border-gray-700">
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">YouTube Video Transcription</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Video ID: 9bZkp7q19f0</p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-gray-900 dark:text-white">1.8 hours</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">1 day ago</p>
                  </div>
                </div>
                <div className="flex items-center justify-between py-2">
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">YouTube Video Transcription</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Video ID: kJQP7kiw5Fk</p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-gray-900 dark:text-white">3.2 hours</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">3 days ago</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Cancel Subscription Modal */}
        {showCancelModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full">
              <div className="flex items-center gap-3 mb-4">
                <AlertTriangle className="w-6 h-6 text-red-600" />
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Cancel Subscription
                </h3>
              </div>
              
              <p className="text-gray-600 dark:text-gray-300 mb-6">
                Are you sure you want to cancel your subscription? You'll lose access to StreamScribe at the end of your current billing period.
              </p>

              <div className="flex gap-3">
                <button
                  onClick={() => setShowCancelModal(false)}
                  className="btn-secondary flex-1"
                  disabled={isLoading}
                >
                  Keep Subscription
                </button>
                <button
                  onClick={handleCancelSubscription}
                  className="btn-primary bg-red-600 hover:bg-red-700 flex-1 flex items-center justify-center gap-2"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Cancelling...
                    </>
                  ) : (
                    'Yes, Cancel'
                  )}
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </>
  )
}
