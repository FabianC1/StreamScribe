'use client'

import { useState, useEffect } from 'react'
import Header from '../../components/Header'
import { Shield, Eye, Database, Lock, Mail, Users, Globe } from 'lucide-react'
import Link from 'next/link'

export default function PrivacyPage() {
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
              <Shield className="w-10 h-10 text-primary-600 dark:text-primary-400" />
            </div>
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Privacy Policy
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              How we collect, use, and protect your personal information
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
              Last updated: {new Date().toLocaleDateString()}
            </p>
          </div>

          {/* Privacy Content */}
          <div className={`max-w-4xl mx-auto transition-all duration-1000 delay-300 ${
            isVisible ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'
          }`}>
            <div className="card p-8 space-y-8">
              
              {/* Introduction */}
              <section className={`transition-all duration-500 delay-400 ${
                isVisible ? 'translate-x-0 opacity-100' : '-translate-x-4 opacity-0'
              }`}>
                <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-3">
                  <Shield className="w-6 h-6 text-primary-600" />
                  1. Introduction
                </h2>
                <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                  At StreamScribe, we are committed to protecting your privacy and ensuring the security of your personal information. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our video transcription service.
                </p>
              </section>

              {/* Information We Collect */}
              <section className={`transition-all duration-500 delay-500 ${
                isVisible ? 'translate-x-0 opacity-100' : '-translate-x-4 opacity-0'
              }`}>
                <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-3">
                  <Database className="w-6 h-6 text-primary-600" />
                  2. Information We Collect
                </h2>
                <div className="space-y-4">
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">Personal Information</h3>
                    <ul className="list-disc list-inside text-gray-600 dark:text-gray-300 space-y-1 ml-4">
                      <li>Name and email address during account registration</li>
                      <li>Payment information for subscription processing</li>
                      <li>Account preferences and settings</li>
                      <li>Communication history with our support team</li>
                    </ul>
                  </div>
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">Usage Information</h3>
                    <ul className="list-disc list-inside text-gray-600 dark:text-gray-300 space-y-1 ml-4">
                      <li>Video URLs submitted for transcription</li>
                      <li>Transcription results and processing times</li>
                      <li>Subscription usage and limits</li>
                      <li>Website interaction data and analytics</li>
                    </ul>
                  </div>
                </div>
              </section>

              {/* How We Use Information */}
              <section className={`transition-all duration-500 delay-600 ${
                isVisible ? 'translate-x-0 opacity-100' : '-translate-x-4 opacity-0'
              }`}>
                <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-3">
                  <Eye className="w-6 h-6 text-primary-600" />
                  3. How We Use Your Information
                </h2>
                <p className="text-gray-600 dark:text-gray-300 leading-relaxed mb-4">
                  We use the collected information for the following purposes:
                </p>
                <ul className="list-disc list-inside text-gray-600 dark:text-gray-300 space-y-2 ml-4">
                  <li>Providing and maintaining our transcription service</li>
                  <li>Processing payments and managing subscriptions</li>
                  <li>Improving our AI models and service quality</li>
                  <li>Communicating with you about service updates</li>
                  <li>Providing customer support and resolving issues</li>
                  <li>Ensuring compliance with legal obligations</li>
                </ul>
              </section>

              {/* Data Sharing */}
              <section className={`transition-all duration-500 delay-700 ${
                isVisible ? 'translate-x-0 opacity-100' : '-translate-x-4 opacity-0'
              }`}>
                <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-3">
                  <Users className="w-6 h-6 text-primary-600" />
                  4. Information Sharing and Disclosure
                </h2>
                <p className="text-gray-600 dark:text-gray-300 leading-relaxed mb-4">
                  We do not sell, trade, or rent your personal information to third parties. We may share information in the following circumstances:
                </p>
                <ul className="list-disc list-inside text-gray-600 dark:text-gray-300 space-y-2 ml-4">
                  <li>With your explicit consent</li>
                  <li>To comply with legal requirements or court orders</li>
                  <li>To protect our rights, property, or safety</li>
                  <li>With trusted service providers who assist in our operations</li>
                  <li>In connection with a business transfer or merger</li>
                </ul>
              </section>

              {/* Data Security */}
              <section className={`transition-all duration-500 delay-800 ${
                isVisible ? 'translate-x-0 opacity-100' : '-translate-x-4 opacity-0'
              }`}>
                <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-3">
                  <Lock className="w-6 h-6 text-primary-600" />
                  5. Data Security
                </h2>
                <p className="text-gray-600 dark:text-gray-300 leading-relaxed mb-4">
                  We implement comprehensive security measures to protect your information:
                </p>
                <ul className="list-disc list-inside text-gray-600 dark:text-gray-300 space-y-2 ml-4">
                  <li>Encryption of data in transit and at rest</li>
                  <li>Regular security audits and vulnerability assessments</li>
                  <li>Access controls and authentication measures</li>
                  <li>Secure data centers with physical security</li>
                  <li>Employee training on data protection practices</li>
                </ul>
              </section>

              {/* Data Retention */}
              <section className={`transition-all duration-500 delay-900 ${
                isVisible ? 'translate-x-0 opacity-100' : '-translate-x-4 opacity-0'
              }`}>
                <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
                  6. Data Retention
                </h2>
                <p className="text-gray-600 dark:text-gray-300 leading-relaxed mb-4">
                  We retain your information for as long as necessary to provide our services and comply with legal obligations:
                </p>
                <ul className="list-disc list-inside text-gray-600 dark:text-gray-300 space-y-2 ml-4">
                  <li>Account information: Retained while your account is active</li>
                  <li>Transcription data: Deleted after 30 days unless you request longer retention</li>
                  <li>Payment records: Retained for accounting and legal compliance</li>
                  <li>Communication logs: Retained for customer service purposes</li>
                </ul>
              </section>

              {/* Your Rights */}
              <section className={`transition-all duration-500 delay-1000 ${
                isVisible ? 'translate-x-0 opacity-100' : '-translate-x-4 opacity-0'
              }`}>
                <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
                  7. Your Privacy Rights
                </h2>
                <p className="text-gray-600 dark:text-gray-300 leading-relaxed mb-4">
                  You have the following rights regarding your personal information:
                </p>
                <ul className="list-disc list-inside text-gray-600 dark:text-gray-300 space-y-2 ml-4">
                  <li>Access and review your personal data</li>
                  <li>Request correction of inaccurate information</li>
                  <li>Request deletion of your data (subject to legal requirements)</li>
                  <li>Opt-out of marketing communications</li>
                  <li>Export your data in a portable format</li>
                  <li>Withdraw consent for data processing</li>
                </ul>
              </section>

              {/* International Transfers */}
              <section className={`transition-all duration-500 delay-1100 ${
                isVisible ? 'translate-x-0 opacity-100' : '-translate-x-4 opacity-0'
              }`}>
                <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-3">
                  <Globe className="w-6 h-6 text-primary-600" />
                  8. International Data Transfers
                </h2>
                <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                  Your information may be transferred to and processed in countries other than your own. We ensure that such transfers comply with applicable data protection laws and implement appropriate safeguards to protect your information.
                </p>
              </section>

              {/* Cookies and Tracking */}
              <section className={`transition-all duration-500 delay-1200 ${
                isVisible ? 'translate-x-0 opacity-100' : '-translate-x-4 opacity-0'
              }`}>
                <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
                  9. Cookies and Tracking Technologies
                </h2>
                <p className="text-gray-600 dark:text-gray-300 leading-relaxed mb-4">
                  We use cookies and similar technologies to enhance your experience:
                </p>
                <ul className="list-disc list-inside text-gray-600 dark:text-gray-300 space-y-2 ml-4">
                  <li>Essential cookies for service functionality</li>
                  <li>Analytics cookies to understand usage patterns</li>
                  <li>Preference cookies to remember your settings</li>
                  <li>Security cookies to protect against fraud</li>
                </ul>
                <p className="text-gray-600 dark:text-gray-300 leading-relaxed mt-4">
                  You can control cookie preferences through your browser settings.
                </p>
              </section>

              {/* Children's Privacy */}
              <section className={`transition-all duration-500 delay-1300 ${
                isVisible ? 'translate-x-0 opacity-100' : '-translate-x-4 opacity-0'
              }`}>
                <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
                  10. Children's Privacy
                </h2>
                <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                  Our service is not intended for children under 13 years of age. We do not knowingly collect personal information from children under 13. If you become aware that a child has provided us with personal information, please contact us immediately.
                </p>
              </section>

              {/* Changes to Policy */}
              <section className={`transition-all duration-500 delay-1400 ${
                isVisible ? 'translate-x-0 opacity-100' : '-translate-x-4 opacity-0'
              }`}>
                <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
                  11. Changes to This Privacy Policy
                </h2>
                <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                  We may update this Privacy Policy from time to time. We will notify you of any material changes by posting the new policy on our website and updating the "Last updated" date. We encourage you to review this policy periodically.
                </p>
              </section>

              {/* Contact Information */}
              <section className={`transition-all duration-500 delay-1500 ${
                isVisible ? 'translate-x-0 opacity-100' : '-translate-x-4 opacity-0'
              }`}>
                <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
                  12. Contact Us
                </h2>
                <p className="text-gray-600 dark:text-gray-300 leading-relaxed mb-4">
                  If you have any questions about this Privacy Policy or our data practices, please contact us:
                </p>
                <div className="space-y-2">
                  <p className="text-gray-600 dark:text-gray-300">
                    <strong>Email:</strong>{' '}
                    <a href="mailto:privacy@streamscribe.com" className="text-primary-600 hover:text-primary-500 dark:text-primary-400 dark:hover:text-primary-300 underline">
                      privacy@streamscribe.com
                    </a>
                  </p>

                </div>
              </section>

              {/* Navigation Links */}
              <div className={`pt-8 border-t border-gray-200 dark:border-gray-700 flex flex-col sm:flex-row gap-4 justify-center items-center transition-all duration-500 delay-1600 ${
                isVisible ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'
              }`}>
                <Link 
                  href="/terms" 
                  className="btn-secondary inline-flex items-center gap-2"
                >
                  View Terms of Service
                </Link>
                <Link 
                  href="/" 
                  className="btn-primary inline-flex items-center gap-2"
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
