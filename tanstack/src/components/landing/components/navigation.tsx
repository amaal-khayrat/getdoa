import { useState } from 'react'
import { ArrowRight, Book, Menu, PlayCircle, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
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
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-teal-500 to-emerald-600 flex items-center justify-center text-white shadow-lg shadow-teal-500/30">
            <Book className="w-5 h-5" />
          </div>
          <span className="text-xl font-serif font-semibold tracking-tight text-foreground">
            {LANDING_CONTENT.navigation.logo}
          </span>
        </div>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center gap-8 text-sm font-medium text-muted-foreground">
          {LANDING_CONTENT.navigation.links.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="hover:text-primary transition-colors"
            >
              {link.label}
            </a>
          ))}
        </div>

        {/* Desktop CTA Buttons */}
        <div className="hidden md:flex items-center gap-4">
          <Button variant="ghost" size="sm">
            {LANDING_CONTENT.navigation.loginButton}
          </Button>
          <Button>{LANDING_CONTENT.navigation.getStartedButton}</Button>
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
          <div className="px-4 pt-2 pb-3 space-y-1">
            {LANDING_CONTENT.navigation.links.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="block px-3 py-2 rounded-md text-base font-medium text-muted-foreground hover:text-primary hover:bg-accent transition-colors"
                onClick={handleLinkClick}
              >
                {link.label}
              </a>
            ))}
          </div>
          <div className="px-4 pt-4 pb-3 border-t border-border">
            <div className="space-y-2">
              <Button variant="ghost" className="w-full justify-start">
                {LANDING_CONTENT.navigation.loginButton}
              </Button>
              <Button className="w-full">
                {LANDING_CONTENT.navigation.getStartedButton}
              </Button>
            </div>
          </div>
        </div>
      )}
    </nav>
  )
}
