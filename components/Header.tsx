'use client'

import { useState, useEffect } from 'react'
import { Menu, X, Youtube } from 'lucide-react'
import ThemeToggle from './ThemeToggle'

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isScrolled, setIsScrolled] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.scrollY
      setIsScrolled(scrollTop > 10)
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
      isScrolled 
        ? 'bg-white/85 dark:bg-gray-900/85 backdrop-blur-md shadow-lg rounded-b-2xl' 
        : 'bg-white dark:bg-gray-900 shadow-sm rounded-b-2xl'
    } border-b border-gray-100 dark:border-gray-800`}>
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className={`flex items-center gap-2 transition-all duration-300 ${
            isScrolled ? 'scale-95' : 'scale-100'
          }`}>
            <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center">
              <Youtube className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold text-gray-900 dark:text-white">StreamScribe</span>
          </div>

          {/* Desktop Navigation */}
          <nav className={`hidden md:flex items-center gap-6 transition-all duration-300 ${
            isScrolled ? 'gap-5' : 'gap-6'
          }`}>
            <a href="#features" className={`nav-link text-gray-600 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-500 transition-all duration-300 ${
              isScrolled ? 'scale-95 opacity-90' : 'scale-100 opacity-100'
            }`}>
              Features
            </a>
            <a href="#pricing" className={`nav-link text-gray-600 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-500 transition-all duration-300 ${
              isScrolled ? 'scale-95 opacity-90' : 'scale-100 opacity-100'
            }`}>
              Pricing
            </a>
            <a href="/demo" className={`nav-link text-gray-600 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-500 transition-all duration-300 ${
              isScrolled ? 'scale-95 opacity-90' : 'scale-100 opacity-100'
            }`}>
              Demo
            </a>
            <div className={`transition-all duration-300 ${
              isScrolled ? 'scale-95' : 'scale-100'
            }`}>
              <ThemeToggle />
            </div>
            <button className={`btn-primary transition-all duration-300 ${
              isScrolled ? 'scale-95 shadow-md' : 'scale-100'
            }`}>
              Get Started
            </button>
          </nav>

          {/* Mobile Menu Button */}
          <div className={`md:hidden flex items-center gap-2 transition-all duration-300 ${
            isScrolled ? 'gap-1.5' : 'gap-2'
          }`}>
            <div className={`transition-all duration-300 ${
              isScrolled ? 'scale-95' : 'scale-100'
            }`}>
              <ThemeToggle />
            </div>
            <button
              className={`p-2 transition-all duration-300 ${
                isScrolled ? 'scale-95' : 'scale-100'
              }`}
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
              <a href="#features" className={`nav-link text-gray-600 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-500 transition-all duration-300 ${
                isScrolled ? 'scale-95 opacity-90' : 'scale-100 opacity-100'
              }`}>
                Features
              </a>
              <a href="#pricing" className={`nav-link text-gray-600 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-500 transition-all duration-300 ${
                isScrolled ? 'scale-95 opacity-90' : 'scale-100 opacity-100'
              }`}>
                Pricing
              </a>
              <a href="/demo" className={`nav-link text-gray-600 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-500 transition-all duration-300 ${
                isScrolled ? 'scale-95 opacity-90' : 'scale-100 opacity-100'
              }`}>
                Demo
              </a>
              <button className={`btn-primary w-full transition-all duration-300 ${
                isScrolled ? 'scale-95 shadow-md' : 'scale-100'
              }`}>
                Get Started
              </button>
            </nav>
          </div>
        )}
      </div>
    </header>
  )
}