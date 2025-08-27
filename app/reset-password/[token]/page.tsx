'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { Lock, Eye, EyeOff, CheckCircle, AlertCircle, ArrowLeft } from 'lucide-react'
import Header from '../../../components/Header'
import Footer from '../../../components/Footer'

export default function ResetPasswordPage() {
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [messageType, setMessageType] = useState<'success' | 'error' | ''>('')
  const [errors, setErrors] = useState<{ password?: string; confirmPassword?: string }>({})
  const [isValidToken, setIsValidToken] = useState(false)
  const [isCheckingToken, setIsCheckingToken] = useState(true)
  
  const router = useRouter()
  const params = useParams()
  const token = params.token as string

  // Check if token is valid on page load
  useEffect(() => {
    const checkToken = async () => {
      try {
        const response = await fetch(`/api/auth/verify-reset-token?token=${token}`)
        if (response.ok) {
          setIsValidToken(true)
        } else {
          setIsValidToken(false)
          setMessage('Invalid or expired reset link. Please request a new one.')
          setMessageType('error')
        }
      } catch (error) {
        setIsValidToken(false)
        setMessage('Failed to verify reset link. Please try again.')
        setMessageType('error')
      } finally {
        setIsCheckingToken(false)
      }
    }

    if (token) {
      checkToken()
    }
  }, [token])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Clear previous errors
    setErrors({})
    setMessage('')
    
    // Validate password
    if (!password.trim()) {
      setErrors({ password: 'Password is required' })
      return
    }
    
    if (password.length < 6) {
      setErrors({ password: 'Password must be at least 6 characters long' })
      return
    }
    
    // Validate confirm password
    if (!confirmPassword.trim()) {
      setErrors({ confirmPassword: 'Please confirm your password' })
      return
    }
    
    if (password !== confirmPassword) {
      setErrors({ confirmPassword: 'Passwords do not match' })
      return
    }

    setIsLoading(true)

    try {
      const response = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          token,
          password 
        }),
      })

      const data = await response.json()

      if (response.ok) {
        setMessage('Password reset successfully! Redirecting to login...')
        setMessageType('success')
        setTimeout(() => {
          router.push('/login')
        }, 2000)
      } else {
        setMessage(data.error || 'Failed to reset password. Please try again.')
        setMessageType('error')
      }
    } catch (error) {
      setMessage('Network error. Please check your connection and try again.')
      setMessageType('error')
    } finally {
      setIsLoading(false)
    }
  }

  if (isCheckingToken) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-700">
        <Header />
        <main className="pt-28 pb-20">
          <div className="container mx-auto px-4">
            <div className="max-w-md mx-auto text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-4 text-gray-600 dark:text-gray-400">Verifying reset link...</p>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    )
  }

  if (!isValidToken) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-700">
        <Header />
        <main className="pt-28 pb-20">
          <div className="container mx-auto px-4">
            <div className="max-w-md mx-auto">
              <button
                onClick={() => router.push('/forgot-password')}
                className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-colors duration-200 mb-8"
              >
                <ArrowLeft className="w-4 h-4" />
                Back to Forgot Password
              </button>

              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-8 text-center">
                <div className="w-16 h-16 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <AlertCircle className="w-8 h-8 text-red-600 dark:text-red-400" />
                </div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                  Invalid Reset Link
                </h1>
                <p className="text-gray-600 dark:text-gray-300 mb-6">
                  {message}
                </p>
                <button
                  onClick={() => router.push('/forgot-password')}
                  className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors duration-200"
                >
                  Request New Reset Link
                </button>
              </div>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-700">
      <Header />
      
      <main className="pt-28 pb-20">
        <div className="container mx-auto px-4">
          <div className="max-w-md mx-auto">
            {/* Back to Forgot Password */}
            <button
              onClick={() => router.push('/forgot-password')}
              className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-colors duration-200 mb-8"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Forgot Password
            </button>

            {/* Main Form */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-8">
              <div className="text-center mb-8">
                <div className="w-16 h-16 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Lock className="w-8 h-8 text-green-600 dark:text-green-400" />
                </div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                  Reset Your Password
                </h1>
                <p className="text-gray-600 dark:text-gray-300">
                  Enter your new password below.
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
                  <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    New Password
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      id="password"
                      value={password}
                      onChange={(e) => {
                        setPassword(e.target.value)
                        if (errors.password) setErrors(prev => ({ ...prev, password: undefined }))
                      }}
                      placeholder="Enter new password"
                      className={`w-full px-4 py-3 pr-12 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 transition-colors duration-200 ${
                        errors.password 
                          ? 'border-red-500 dark:border-red-400 focus:ring-red-500' 
                          : 'border-gray-300 dark:border-gray-600 focus:ring-blue-500'
                      }`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
                    >
                      {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                  {errors.password && (
                    <p className="mt-2 text-sm text-red-600 dark:text-red-400 flex items-center gap-2">
                      <AlertCircle className="w-4 h-4" />
                      {errors.password}
                    </p>
                  )}
                </div>

                <div>
                  <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Confirm New Password
                  </label>
                  <div className="relative">
                    <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      id="confirmPassword"
                      value={confirmPassword}
                      onChange={(e) => {
                        setConfirmPassword(e.target.value)
                        if (errors.confirmPassword) setErrors(prev => ({ ...prev, confirmPassword: undefined }))
                      }}
                      placeholder="Confirm new password"
                      className={`w-full px-4 py-3 pr-12 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 transition-colors duration-200 ${
                        errors.confirmPassword 
                          ? 'border-red-500 dark:border-red-400 focus:ring-red-500' 
                          : 'border-gray-300 dark:border-gray-600 focus:ring-blue-500'
                      }`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
                    >
                      {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                  {errors.confirmPassword && (
                    <p className="mt-2 text-sm text-red-600 dark:text-red-400 flex items-center gap-2">
                      <AlertCircle className="w-4 h-4" />
                      {errors.confirmPassword}
                    </p>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white font-medium rounded-lg transition-colors duration-200 disabled:cursor-not-allowed"
                >
                  {isLoading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      Resetting Password...
                    </>
                  ) : (
                    <>
                      <Lock className="w-4 h-4" />
                      Reset Password
                    </>
                  )}
                </button>
              </form>

              {/* Additional Info */}
              <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
                <p className="text-sm text-gray-500 dark:text-gray-400 text-center">
                  Remember your password?{' '}
                  <button
                    onClick={() => router.push('/login')}
                    className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium transition-colors duration-200"
                  >
                    Sign in here
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
