'use client'

import { useState, useEffect } from 'react'
import Header from '../../components/Header'
import { Mail, Lock, Eye, EyeOff, AlertCircle, User, CheckCircle, Chrome } from 'lucide-react'
import Link from 'next/link'

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  })
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [isVisible, setIsVisible] = useState(false)
  const [passwordStrength, setPasswordStrength] = useState({
    length: false,
    uppercase: false,
    lowercase: false,
    number: false,
    special: false
  })

  useEffect(() => {
    // Trigger animations when component mounts
    setIsVisible(true)
  }, [])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))

    // Check password strength
    if (name === 'password') {
      setPasswordStrength({
        length: value.length >= 8,
        uppercase: /[A-Z]/.test(value),
        lowercase: /[a-z]/.test(value),
        number: /\d/.test(value),
        special: /[!@#$%^&*(),.?":{}|<>]/.test(value)
      })
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')

    // Validate passwords match
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match')
      setIsLoading(false)
      return
    }

    // Validate password strength
    const isStrongPassword = Object.values(passwordStrength).every(Boolean)
    if (!isStrongPassword) {
      setError('Please ensure your password meets all requirements')
      setIsLoading(false)
      return
    }

    try {
      // TODO: Implement actual registration logic
      // For now, simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      // Mock successful registration
      console.log('Registration successful:', formData.email)
      
      // Redirect to login page
      window.location.href = '/login'
    } catch (err) {
      setError('Registration failed. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const getPasswordStrengthColor = (isValid: boolean) => {
    return isValid ? 'text-green-600 dark:text-green-400' : 'text-gray-400 dark:text-gray-500'
  }

  return (
    <>
      <Header />
      <main className="pt-28 min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-700 transition-colors duration-200 flex items-center justify-center py-8">
        <div className={`w-full max-w-md transition-all duration-1000 transform ${
          isVisible ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'
        }`}>
          <div className={`text-center mb-8 transition-all duration-1000 delay-200 ${
            isVisible ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'
          }`}>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              Create Account
            </h1>
            <p className="text-gray-600 dark:text-gray-300">
              Join StreamScribe and start transcribing videos
            </p>
          </div>

          <div className={`card transition-all duration-1000 delay-300 ${
            isVisible ? 'translate-y-0 opacity-100 scale-100' : 'translate-y-4 opacity-0 scale-95'
          }`}>
            {error && (
              <div className={`mb-4 p-3 bg-red-100 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg flex items-center gap-2 text-red-700 dark:text-red-300 transition-all duration-500 ${
                error ? 'animate-bounce' : ''
              }`}>
                <AlertCircle className="w-4 h-4" />
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className={`transition-all duration-500 delay-400 ${
                isVisible ? 'translate-x-0 opacity-100' : '-translate-x-4 opacity-0'
              }`}>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Full Name
                </label>
                <div className="relative group">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 transition-colors duration-200 group-focus-within:text-primary-600" />
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 transition-all duration-200 hover:border-primary-300 dark:hover:border-primary-600"
                    placeholder="Enter your full name"
                  />
                </div>
              </div>

              <div className={`transition-all duration-500 delay-500 ${
                isVisible ? 'translate-x-0 opacity-100' : '-translate-x-4 opacity-0'
              }`}>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Email Address
                </label>
                <div className="relative group">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 transition-colors duration-200 group-focus-within:text-primary-600" />
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 transition-all duration-200 hover:border-primary-300 dark:hover:border-primary-600"
                    placeholder="Enter your email"
                  />
                </div>
              </div>

              <div className={`transition-all duration-500 delay-600 ${
                isVisible ? 'translate-x-0 opacity-100' : '-translate-x-4 opacity-0'
              }`}>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Password
                </label>
                <div className="relative group">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 transition-colors duration-200 group-focus-within:text-primary-600" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    id="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    required
                    className="w-full pl-10 pr-12 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 transition-all duration-200 hover:border-primary-300 dark:hover:border-primary-600"
                    placeholder="Create a password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors duration-200"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>

                {/* Password Strength Indicator */}
                <div className={`mt-2 space-y-1 transition-all duration-500 delay-700 ${
                  isVisible ? 'translate-x-0 opacity-100' : '-translate-x-4 opacity-0'
                }`}>
                  <div className={`flex items-center gap-2 text-xs transition-all duration-300 ${
                    passwordStrength.length ? 'animate-pulse' : ''
                  }`}>
                    <CheckCircle className={`w-3 h-3 transition-all duration-300 ${
                      passwordStrength.length ? 'scale-110' : 'scale-100'
                    } ${getPasswordStrengthColor(passwordStrength.length)}`} />
                    <span className={getPasswordStrengthColor(passwordStrength.length)}>At least 8 characters</span>
                  </div>
                  <div className={`flex items-center gap-2 text-xs transition-all duration-300 ${
                    passwordStrength.uppercase ? 'animate-pulse' : ''
                  }`}>
                    <CheckCircle className={`w-3 h-3 transition-all duration-300 ${
                      passwordStrength.uppercase ? 'scale-110' : 'scale-100'
                    } ${getPasswordStrengthColor(passwordStrength.uppercase)}`} />
                    <span className={getPasswordStrengthColor(passwordStrength.uppercase)}>One uppercase letter</span>
                  </div>
                  <div className={`flex items-center gap-2 text-xs transition-all duration-300 ${
                    passwordStrength.lowercase ? 'animate-pulse' : ''
                  }`}>
                    <CheckCircle className={`w-3 h-3 transition-all duration-300 ${
                      passwordStrength.lowercase ? 'scale-110' : 'scale-100'
                    } ${getPasswordStrengthColor(passwordStrength.lowercase)}`} />
                    <span className={getPasswordStrengthColor(passwordStrength.lowercase)}>One lowercase letter</span>
                  </div>
                  <div className={`flex items-center gap-2 text-xs transition-all duration-300 ${
                    passwordStrength.number ? 'animate-pulse' : ''
                  }`}>
                    <CheckCircle className={`w-3 h-3 transition-all duration-300 ${
                      passwordStrength.number ? 'scale-110' : 'scale-100'
                    } ${getPasswordStrengthColor(passwordStrength.number)}`} />
                    <span className={getPasswordStrengthColor(passwordStrength.number)}>One number</span>
                  </div>
                  <div className={`flex items-center gap-2 text-xs transition-all duration-300 ${
                    passwordStrength.special ? 'animate-pulse' : ''
                  }`}>
                    <CheckCircle className={`w-3 h-3 transition-all duration-300 ${
                      passwordStrength.special ? 'scale-110' : 'scale-100'
                    } ${getPasswordStrengthColor(passwordStrength.special)}`} />
                    <span className={getPasswordStrengthColor(passwordStrength.special)}>One special character</span>
                  </div>
                </div>
              </div>

              <div className={`transition-all duration-500 delay-700 ${
                isVisible ? 'translate-x-0 opacity-100' : '-translate-x-4 opacity-0'
              }`}>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Confirm Password
                </label>
                <div className="relative group">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 transition-colors duration-200 group-focus-within:text-primary-600" />
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    id="confirmPassword"
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    required
                    className="w-full pl-10 pr-12 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 transition-all duration-200 hover:border-primary-300 dark:hover:border-primary-600"
                    placeholder="Confirm your password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors duration-200"
                  >
                    {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              <div className={`flex items-start transition-all duration-500 delay-800 ${
                isVisible ? 'translate-x-0 opacity-100' : '-translate-x-4 opacity-0'
              }`}>
                <input
                  type="checkbox"
                  required
                  className="w-4 h-4 mt-1 text-primary-600 bg-gray-100 border-gray-300 rounded focus:ring-primary-500 dark:focus:ring-primary-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600 transition-all duration-200"
                />
                <label className="ml-2 text-sm text-gray-600 dark:text-gray-300">
                  I agree to the{' '}
                  <Link href="/terms" className="text-primary-600 hover:text-primary-500 dark:text-primary-400 dark:hover:text-primary-300 transition-colors duration-200 hover:underline">
                    Terms of Service
                  </Link>{' '}
                  and{' '}
                  <Link href="/privacy" className="text-primary-600 hover:text-primary-500 dark:text-primary-400 dark:hover:text-primary-300 transition-colors duration-200 hover:underline">
                    Privacy Policy
                  </Link>
                </label>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className={`w-full btn-primary py-3 flex items-center justify-center gap-2 transition-all duration-500 delay-900 ${
                  isVisible ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'
                } hover:scale-105 active:scale-95`}
              >
                {isLoading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Creating account...
                  </>
                ) : (
                  'Create Account'
                )}
              </button>

              {/* Divider */}
              <div className={`relative my-6 transition-all duration-500 delay-950 ${
                isVisible ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'
              }`}>
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-300 dark:border-gray-600"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-white dark:bg-gray-800 text-gray-500 dark:text-gray-400">
                    Or continue with
                  </span>
                </div>
              </div>

              {/* Google Sign-In Button */}
              <button
                type="button"
                className={`w-full bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 py-3 px-4 rounded-lg flex items-center justify-center gap-3 transition-all duration-500 delay-1000 hover:bg-gray-50 dark:hover:bg-gray-700 hover:border-gray-400 dark:hover:border-gray-500 active:scale-95 ${
                  isVisible ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'
                }`}
                onClick={() => {
                  // TODO: Implement Google OAuth
                  console.log('Google sign-in clicked')
                }}
              >
                <Chrome className="w-5 h-5" />
                <span className="font-medium">Sign up with Google</span>
              </button>
            </form>

            <div className={`mt-6 text-center transition-all duration-500 delay-1000 ${
              isVisible ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'
            }`}>
              <p className="text-gray-600 dark:text-gray-300">
                Already have an account?{' '}
                <Link href="/login" className="text-primary-600 hover:text-primary-500 dark:text-primary-400 dark:hover:text-primary-300 font-medium transition-colors duration-200 hover:underline">
                  Log in
                </Link>
              </p>
            </div>
          </div>
        </div>
      </main>
    </>
  )
}
