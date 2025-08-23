'use client'

import { useState, useEffect } from 'react'
import Header from '../../components/Header'
import { FileText, Shield, Users, CreditCard, Lock } from 'lucide-react'
import Link from 'next/link'

export default function TermsPage() {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    // Trigger animations when component mounts
    setIsVisible(true)
  }, [])

  return (
    <>
      <Header />
      <main className="pt-28 min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-700 transition-colors duration-200">
        <div className="container mx-auto px-4 py-12">
          {/* Header Section */}
          <div className={`text-center mb-12 transition-all duration-1000 transform ${
            isVisible ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'
          }`}>
            <div className="w-20 h-20 bg-primary-100 dark:bg-primary-900/20 rounded-full flex items-center justify-center mx-auto mb-6">
              <FileText className="w-10 h-10 text-primary-600 dark:text-primary-400" />
            </div>
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Terms of Service
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              Please read these terms carefully before using StreamScribe services
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
              Last updated: {new Date().toLocaleDateString()}
            </p>
          </div>

          {/* Terms Content */}
          <div className={`max-w-4xl mx-auto transition-all duration-1000 delay-300 ${
            isVisible ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'
          }`}>
            <div className="card p-8 space-y-8">
              
              {/* Acceptance Section */}
              <section className={`transition-all duration-500 delay-400 ${
                isVisible ? 'translate-x-0 opacity-100' : '-translate-x-4 opacity-0'
              }`}>
                <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-3">
                  <Shield className="w-6 h-6 text-primary-600" />
                  1. Acceptance of Terms
                </h2>
                <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                  By accessing and using StreamScribe ("the Service"), you accept and agree to be bound by the terms and provision of this agreement. If you do not agree to abide by the above, please do not use this service.
                </p>
              </section>

              {/* Service Description */}
              <section className={`transition-all duration-500 delay-500 ${
                isVisible ? 'translate-x-0 opacity-100' : '-translate-x-4 opacity-0'
              }`}>
                <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-3">
                  <FileText className="w-6 h-6 text-primary-600" />
                  2. Service Description
                </h2>
                <p className="text-gray-600 dark:text-gray-300 leading-relaxed mb-4">
                  StreamScribe provides AI-powered video transcription services for YouTube videos. Our service includes:
                </p>
                <ul className="list-disc list-inside text-gray-600 dark:text-gray-300 space-y-2 ml-4">
                  <li>Automated video transcription using advanced AI technology</li>
                  <li>Multiple subscription tiers with varying usage limits</li>
                  <li>Secure processing and storage of transcription data</li>
                  <li>User account management and subscription tracking</li>
                </ul>
              </section>

              {/* User Accounts */}
              <section className={`transition-all duration-500 delay-600 ${
                isVisible ? 'translate-x-0 opacity-100' : '-translate-x-4 opacity-0'
              }`}>
                <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-3">
                  <Users className="w-6 h-6 text-primary-600" />
                  3. User Accounts
                </h2>
                <p className="text-gray-600 dark:text-gray-300 leading-relaxed mb-4">
                  To use our services, you must create an account. You are responsible for:
                </p>
                <ul className="list-disc list-inside text-gray-600 dark:text-gray-300 space-y-2 ml-4">
                  <li>Maintaining the confidentiality of your account credentials</li>
                  <li>All activities that occur under your account</li>
                  <li>Providing accurate and complete information during registration</li>
                  <li>Notifying us immediately of any unauthorized use of your account</li>
                </ul>
              </section>

              {/* Subscription and Payment */}
              <section className={`transition-all duration-500 delay-700 ${
                isVisible ? 'translate-x-0 opacity-100' : '-translate-x-4 opacity-0'
              }`}>
                <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-3">
                  <CreditCard className="w-6 h-6 text-primary-600" />
                  4. Subscription and Payment
                </h2>
                <p className="text-gray-600 dark:text-gray-300 leading-relaxed mb-4">
                  Our service operates on a subscription basis with the following terms:
                </p>
                <ul className="list-disc list-inside text-gray-600 dark:text-gray-300 space-y-2 ml-4">
                  <li>Subscriptions are billed in advance on a monthly basis</li>
                  <li>Usage limits are reset monthly based on your subscription tier</li>
                  <li>Unused hours do not carry over to the next billing period</li>
                  <li>You may cancel your subscription at any time</li>
                  <li>Refunds are provided according to our refund policy</li>
                </ul>
              </section>

              {/* Acceptable Use */}
              <section className={`transition-all duration-500 delay-800 ${
                isVisible ? 'translate-x-0 opacity-100' : '-translate-x-4 opacity-0'
              }`}>
                <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-3">
                  <Lock className="w-6 h-6 text-primary-600" />
                  5. Acceptable Use
                </h2>
                <p className="text-gray-600 dark:text-gray-300 leading-relaxed mb-4">
                  You agree not to use the service to:
                </p>
                <ul className="list-disc list-inside text-gray-600 dark:text-gray-300 space-y-2 ml-4">
                  <li>Transcribe content that violates copyright or intellectual property rights</li>
                  <li>Process illegal, harmful, or inappropriate content</li>
                  <li>Attempt to reverse engineer or compromise our systems</li>
                  <li>Share your account credentials with others</li>
                  <li>Use the service for commercial purposes without proper authorization</li>
                </ul>
              </section>

              {/* Privacy and Data */}
              <section className={`transition-all duration-500 delay-900 ${
                isVisible ? 'translate-x-0 opacity-100' : '-translate-x-4 opacity-0'
              }`}>
                <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
                  6. Privacy and Data Protection
                </h2>
                <p className="text-gray-600 dark:text-gray-300 leading-relaxed mb-4">
                  Your privacy is important to us. Our collection and use of personal information is governed by our Privacy Policy, which is incorporated into these Terms by reference.
                </p>
                <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                  We implement appropriate security measures to protect your data and ensure compliance with applicable data protection laws.
                </p>
              </section>

              {/* Limitation of Liability */}
              <section className={`transition-all duration-500 delay-1000 ${
                isVisible ? 'translate-x-0 opacity-100' : '-translate-x-4 opacity-0'
              }`}>
                <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
                  7. Limitation of Liability
                </h2>
                <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                  StreamScribe shall not be liable for any indirect, incidental, special, consequential, or punitive damages resulting from your use of the service. Our total liability shall not exceed the amount paid by you for the service in the 12 months preceding the claim.
                </p>
              </section>

              {/* Changes to Terms */}
              <section className={`transition-all duration-500 delay-1100 ${
                isVisible ? 'translate-x-0 opacity-100' : '-translate-x-4 opacity-0'
              }`}>
                <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
                  8. Changes to Terms
                </h2>
                <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                  We reserve the right to modify these terms at any time. We will notify users of any material changes via email or through our website. Continued use of the service after changes constitutes acceptance of the new terms.
                </p>
              </section>

              {/* Contact Information */}
              <section className={`transition-all duration-500 delay-1200 ${
                isVisible ? 'translate-x-0 opacity-100' : '-translate-x-4 opacity-0'
              }`}>
                <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
                  9. Contact Information
                </h2>
                <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                  If you have any questions about these Terms of Service, please contact us at{' '}
                  <a href="mailto:legal@streamscribe.com" className="text-primary-600 hover:text-primary-500 dark:text-primary-400 dark:hover:text-primary-300 underline">
                    legal@streamscribe.com
                  </a>
                </p>
              </section>

              {/* Back to Home */}
              <div className={`pt-8 border-t border-gray-200 dark:border-gray-700 text-center transition-all duration-500 delay-1300 ${
                isVisible ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'
              }`}>
                <Link 
                  href="/" 
                  className="btn-secondary inline-flex items-center gap-2"
                >
                  ← Back to Home
                </Link>
              </div>
            </div>
          </div>
        </div>
      </main>
    </>
  )
}
