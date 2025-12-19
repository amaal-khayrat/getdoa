import { useState } from 'react'
import { Link } from '@tanstack/react-router'
import { Menu, X } from 'lucide-react'
import { Button, buttonVariants } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { LANDING_CONTENT } from '@/lib/constants'

export function Navigation() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  const handleMobileMenuToggle = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen)
  }

  const handleLinkClick = () => {
    setIsMobileMenuOpen(false)
  }

  return (
    <nav className="fixed top-0 w-full z-50 glass-nav transition-all duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 md:h-20 flex items-center justify-between">
        {/* Logo */}
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

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center gap-8 text-sm font-medium text-muted-foreground"></div>

        {/* Desktop CTA Buttons */}
        <div className="hidden md:flex items-center gap-4">
          <Link
            to="/login"
            className={cn(
              buttonVariants({ variant: 'outline', size: 'default' }),
              'border-teal-600 text-teal-600 hover:bg-teal-600 hover:text-white font-medium px-6'
            )}
          >
            {LANDING_CONTENT.navigation.loginButton}
          </Link>
          <Link
            to="/signup"
            className={cn(
              buttonVariants({ variant: 'default', size: 'default' }),
              'bg-teal-600 hover:bg-teal-700 text-white font-medium px-6 shadow-lg hover:shadow-xl transition-all transform hover:scale-105'
            )}
          >
            {LANDING_CONTENT.navigation.signUpButton}
          </Link>
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
        <div className="md:hidden bg-background/95 backdrop-blur-sm border-t border-border">
          <div className="px-4 pt-4 pb-3 border-t border-border">
            <div className="space-y-3">
              <Link
                to="/login"
                onClick={handleLinkClick}
                className={cn(
                  buttonVariants({ variant: 'outline' }),
                  'w-full border-teal-600 text-teal-600 hover:bg-teal-600 hover:text-white font-medium py-3'
                )}
              >
                {LANDING_CONTENT.navigation.loginButton}
              </Link>
              <Link
                to="/signup"
                onClick={handleLinkClick}
                className={cn(
                  buttonVariants({ variant: 'default' }),
                  'w-full bg-teal-600 hover:bg-teal-700 text-white font-medium py-3 shadow-lg hover:shadow-xl transition-all'
                )}
              >
                {LANDING_CONTENT.navigation.signUpButton}
              </Link>
            </div>
          </div>
        </div>
      )}
    </nav>
  )
}
