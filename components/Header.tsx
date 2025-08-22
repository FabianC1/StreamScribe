'use client'

import { useState } from 'react'
import { Menu, X, Youtube } from 'lucide-react'
import ThemeToggle from './ThemeToggle'

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  return (
    <header className="bg-white dark:bg-gray-900 shadow-sm border-b border-gray-100 dark:border-gray-800 transition-colors duration-200">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center">
              <Youtube className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold text-gray-900 dark:text-white">StreamScribe</span>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-6">
            <a href="#features" className="nav-link text-gray-600 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-500">
              Features
            </a>
            <a href="#pricing" className="nav-link text-gray-600 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-500">
              Pricing
            </a>
            <a href="/demo" className="nav-link text-gray-600 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-500">
              Demo
            </a>
            <ThemeToggle />
            <button className="btn-primary">
              Get Started
            </button>
          </nav>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center gap-2">
            <ThemeToggle />
            <button
              className="p-2"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? (
                <X className="w-6 h-6 text-gray-600 dark:text-gray-300" />
              ) : (
                <Menu className="w-6 h-6 text-gray-600 dark:text-gray-300" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden py-4 border-t border-gray-100 dark:border-gray-800">
            <nav className="flex flex-col gap-4">
              <a href="#features" className="nav-link text-gray-600 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-500">
                Features
              </a>
              <a href="#pricing" className="nav-link text-gray-600 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-500">
                Pricing
              </a>
              <a href="/demo" className="nav-link text-gray-600 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-500">
                Demo
              </a>
              <button className="btn-primary w-full">
                Get Started
              </button>
            </nav>
          </div>
        )}
      </div>
    </header>
  )
}
