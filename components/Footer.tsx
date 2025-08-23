export default function Footer() {
  return (
    <footer className="bg-gray-900 dark:bg-black text-white transition-colors duration-200">
      <div className="container mx-auto px-4 py-12">
        <div className="grid md:grid-cols-4 gap-8">
          {/* Company Info */}
          <div className="col-span-2">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M2 6a2 2 0 012-2h6a2 2 0 012 2v8a2 2 0 01-2 2H4a2 2 0 01-2-2V6zM14.553 7.106A1 1 0 0014 8v4a1 1 0 00.553.894l2 1A1 1 0 0018 13V7a1 1 0 00-1.447-.894l-2 1z" />
                </svg>
              </div>
              <span className="text-xl font-bold">StreamScribe</span>
            </div>
            <p className="text-gray-400 dark:text-gray-300 mb-4 max-w-md transition-colors duration-200">
              Professional YouTube video transcription service powered by advanced AI technology. 
              Transform your content into searchable, accessible text.
            </p>

          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li><a href="/#features" className="text-gray-400 hover:text-white transition-colors">Features</a></li>
              <li><a href="/#pricing" className="text-gray-400 hover:text-white transition-colors">Pricing</a></li>
              <li><a href="/privacy" className="text-gray-400 hover:text-white transition-colors">Privacy Policy</a></li>
              <li><a href="/terms" className="text-gray-400 hover:text-white transition-colors">Terms of Service</a></li>
            </ul>
          </div>

          {/* Company */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Company</h3>
            <ul className="space-y-2">
              <li><a href="/register" className="text-gray-400 hover:text-white transition-colors">Sign Up</a></li>
              <li><a href="/login" className="text-gray-400 hover:text-white transition-colors">Sign In</a></li>
              <li><a href="/subscriptions" className="text-gray-400 hover:text-white transition-colors">Subscriptions</a></li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-800 dark:border-gray-700 mt-8 pt-8 text-center">
          <p className="text-gray-400 dark:text-gray-300 transition-colors duration-200">
            © 2024 StreamScribe. All rights reserved. Powered by advanced AI technology.
          </p>
        </div>
      </div>
    </footer>
  )
}
