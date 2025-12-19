import { useState } from 'react'
import { Link } from '@tanstack/react-router'
import { ArrowLeft, Menu, X } from 'lucide-react'
import type { ComponentProps } from 'react'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { LANDING_CONTENT } from '@/lib/constants'
import { useLanguage } from '@/contexts/language-context'

interface NavbarProps extends Omit<ComponentProps<'nav'>, 'className'> {
  onBackClick?: () => void
  variant?: 'landing' | 'doa'
}

export function Navbar({
  onBackClick,
  variant = 'landing',
  ...props
}: NavbarProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  // Only use language context in doa variant (since landing page doesn't wrap with LanguageProvider)
  const languageContext = variant === 'doa' ? useLanguage() : null
  const { language = 'en', setLanguage, t } = languageContext || {}

  const handleMobileMenuToggle = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen)
  }

  const handleLinkClick = () => {
    setIsMobileMenuOpen(false)
  }

  return (
    <nav
      className={`fixed top-0 w-full z-50 transition-all duration-300 ${
        variant === 'landing'
          ? 'glass-nav'
          : 'bg-background/90 backdrop-blur-md border-b border-border'
      }`}
      {...props}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 md:h-20 flex items-center justify-between">
        {/* Logo - Always show GetDoa logo */}
        <a
          href="/"
          className="flex items-center gap-2 hover:opacity-80 transition-opacity"
        >
          <img
            src={LANDING_CONTENT.navigation.logo}
            alt="GetDoa Logo"
            className="w-10 h-10 rounded-lg"
          />
          <span className="text-xl font-serif font-semibold tracking-tight text-foreground">
            GetDoa
          </span>
        </a>

        {/* Desktop Actions */}
        <div className="hidden md:flex items-center gap-4">
          {variant === 'landing' ? (
            <>
              <Button
                variant="outline"
                size="default"
                className="border-teal-600 text-teal-600 hover:bg-teal-600 hover:text-white font-medium px-6"
                asChild
              >
                <Link to="/login">
                  {LANDING_CONTENT.navigation.loginButton}
                </Link>
              </Button>
              <Button
                variant="default"
                size="default"
                className="bg-teal-600 hover:bg-teal-700 text-white font-medium px-6 shadow-lg hover:shadow-xl transition-all transform hover:scale-105"
                asChild
              >
                <Link to="/signup">
                  {LANDING_CONTENT.navigation.signUpButton}
                </Link>
              </Button>
            </>
          ) : (
            <>
              {/* Language Picker */}
              <div className="relative hidden sm:flex items-center">
                <Select
                  value={language}
                  onValueChange={(value) => setLanguage?.(value as 'en' | 'my')}
                >
                  <SelectTrigger size="sm" className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="en">
                      <span className="flex items-center gap-2">
                        <span>🌐</span>
                        English
                      </span>
                    </SelectItem>
                    <SelectItem value="my">
                      <span className="flex items-center gap-2">
                        <span>🌐</span>
                        Bahasa Melayu
                      </span>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="h-5 w-px bg-border"></div>
              {/* Back to GetDoa */}
              <Button
                variant="outline"
                size="sm"
                className="group flex items-center gap-2"
                onClick={onBackClick}
              >
                <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
                {t ? t('backToGetDoa') : 'Back to GetDoa'}
              </Button>
              <div className="h-5 w-px bg-border"></div>
              {/* Login Button */}
              <Button
                variant="outline"
                size="default"
                className="border-teal-600 text-teal-600 hover:bg-teal-600 hover:text-white font-medium px-6"
                asChild
              >
                <Link to="/login">
                  {t ? t('login') : LANDING_CONTENT.navigation.loginButton}
                </Link>
              </Button>
            </>
          )}
        </div>

        {/* Mobile Menu Button */}
        <Button
          variant="ghost"
          size="icon"
          className="md:hidden"
          onClick={handleMobileMenuToggle}
          aria-label="Toggle menu"
        >
          {isMobileMenuOpen ? (
            <X className="w-5 h-5" />
          ) : (
            <Menu className="w-5 h-5" />
          )}
        </Button>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div
          className={`md:hidden ${
            variant === 'landing'
              ? 'bg-background/95 backdrop-blur-sm'
              : 'bg-background/95 backdrop-blur-sm border-t border-border'
          }`}
        >
          <div className="px-4 pt-4 pb-3">
            <div className="space-y-3">
              {variant === 'landing' ? (
                <>
                  <Button
                    variant="outline"
                    className="w-full border-teal-600 text-teal-600 hover:bg-teal-600 hover:text-white font-medium py-3"
                    asChild
                  >
                    <Link to="/login" onClick={handleLinkClick}>
                      {LANDING_CONTENT.navigation.loginButton}
                    </Link>
                  </Button>
                  <Button
                    variant="default"
                    className="w-full bg-teal-600 hover:bg-teal-700 text-white font-medium py-3 shadow-lg hover:shadow-xl transition-all"
                    asChild
                  >
                    <Link to="/signup" onClick={handleLinkClick}>
                      {LANDING_CONTENT.navigation.signUpButton}
                    </Link>
                  </Button>
                </>
              ) : (
                <>
                  <div className="relative flex items-center">
                    <Select
                      value={language}
                      onValueChange={(value) =>
                        setLanguage?.(value as 'en' | 'my')
                      }
                    >
                      <SelectTrigger size="sm" className="w-full">
                        <div className="flex items-center gap-2">
                          <span>🌐</span>
                          <SelectValue />
                        </div>
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="en">English</SelectItem>
                        <SelectItem value="my">Bahasa Melayu</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <Button
                    variant="outline"
                    className="w-full flex items-center justify-center gap-2"
                    onClick={onBackClick}
                  >
                    <ArrowLeft className="w-4 h-4" />
                    {t ? t('backToGetDoa') : 'Back to GetDoa'}
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full border-teal-600 text-teal-600 hover:bg-teal-600 hover:text-white font-medium py-3"
                    asChild
                  >
                    <Link to="/login" onClick={handleLinkClick}>
                      {t ? t('login') : LANDING_CONTENT.navigation.loginButton}
                    </Link>
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </nav>
  )
}
