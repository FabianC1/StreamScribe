'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Mail, ArrowLeft, CheckCircle, AlertCircle } from 'lucide-react'
import Header from '../../components/Header'
import Footer from '../../components/Footer'

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [messageType, setMessageType] = useState<'success' | 'error' | ''>('')
  const [errors, setErrors] = useState<{ email?: string }>({})
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Clear previous errors
    setErrors({})
    setMessage('')
    
    // Validate email
    if (!email.trim()) {
      setErrors({ email: 'Email is required' })
      return
    }
    
    // Basic email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email.trim())) {
      setErrors({ email: 'Please enter a valid email address' })
      return
    }

    setIsLoading(true)

    try {
      const response = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: email.trim() }),
      })

      const data = await response.json()

      if (response.ok) {
        setMessage('Password reset email sent! Check your inbox and spam folder.')
        setMessageType('success')
        setEmail('')
      } else {
        setMessage(data.error || 'Failed to send reset email. Please try again.')
        setMessageType('error')
      }
    } catch (error) {
      setMessage('Network error. Please check your connection and try again.')
      setMessageType('error')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-700">
      <Header />
      
      <main className="pt-28 pb-20">
        <div className="container mx-auto px-4">
          <div className="max-w-md mx-auto">
            {/* Back to Login */}
            <button
              onClick={() => router.push('/login')}
              className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-colors duration-200 mb-8"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Login
            </button>

            {/* Main Form */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-8">
              <div className="text-center mb-8">
                <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Mail className="w-8 h-8 text-blue-600 dark:text-blue-400" />
                </div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                  Forgot Your Password?
                </h1>
                <p className="text-gray-600 dark:text-gray-300">
                  Enter your email address and we'll send you a link to reset your password.
                </p>
              </div>

              {/* Message Display */}
              {message && (
                <div className={`mb-6 p-4 rounded-lg border ${
                  messageType === 'success' 
                    ? 'bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-300 border-green-200 dark:border-green-800'
                    : 'bg-red-100 dark:bg-red-900/20 text-red-700 dark:text-red-300 border-red-200 dark:border-red-800'
                }`}>
                  <div className="flex items-center gap-3">
                    {messageType === 'success' ? (
                      <CheckCircle className="w-5 h-5 text-green-500" />
                    ) : (
                      <AlertCircle className="w-5 h-5 text-red-500" />
                    )}
                    <span className="text-sm font-medium">{message}</span>
                  </div>
                </div>
              )}

              {/* Reset Form */}
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Email Address
                  </label>
                  <input
                    type="email"
                    id="email"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value)
                      if (errors.email) setErrors({})
                    }}
                    placeholder="Enter your email address"
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 transition-colors duration-200 ${
                      errors.email 
                        ? 'border-red-500 dark:border-red-400 focus:ring-red-500' 
                        : 'border-gray-300 dark:border-gray-600 focus:ring-blue-500'
                    }`}
                  />
                  {errors.email && (
                    <p className="mt-2 text-sm text-red-600 dark:text-red-400 flex items-center gap-2">
                      <AlertCircle className="w-4 h-4" />
                      {errors.email}
                    </p>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-medium rounded-lg transition-colors duration-200 disabled:cursor-not-allowed"
                >
                  {isLoading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      Sending Reset Email...
                    </>
                  ) : (
                    <>
                      <Mail className="w-4 h-4" />
                      Send Reset Email
                    </>
                  )}
                </button>
              </form>

              {/* Additional Info */}
              <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
                <p className="text-sm text-gray-500 dark:text-gray-400 text-center">
                  Don't have an account?{' '}
                  <button
                    onClick={() => router.push('/register')}
                    className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium transition-colors duration-200"
                  >
                    Sign up here
                  </button>
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
