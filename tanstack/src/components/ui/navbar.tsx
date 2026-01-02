import { useState } from 'react'
import { Link } from '@tanstack/react-router'
import { Home, LayoutDashboard, Menu, X } from 'lucide-react'
import type { ComponentProps } from 'react'
import { Button } from '@/components/ui/button'
import { ButtonGroup } from '@/components/ui/button-group'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { LANDING_CONTENT } from '@/lib/constants'
import { useLanguage, type Language } from '@/contexts/language-context'
import { signOut, useSession } from '@/lib/auth-client'
import { cn } from '@/lib/utils'

// Language toggle component - beautiful segmented control following the green theme
function LanguageToggle({
  language,
  onLanguageChange,
  className,
}: {
  language: Language
  onLanguageChange: (lang: Language) => void
  className?: string
}) {
  return (
    <div
      className={cn(
        'relative flex items-center rounded-full bg-secondary/80 p-0.5 shadow-green-sm',
        className
      )}
      role="radiogroup"
      aria-label="Language selection"
    >
      {/* Sliding indicator */}
      <div
        className={cn(
          'absolute h-[calc(100%-4px)] w-[calc(50%-2px)] rounded-full bg-primary shadow-green transition-transform duration-200 ease-out',
          language === 'my' ? 'translate-x-[calc(100%+2px)]' : 'translate-x-0'
        )}
        aria-hidden="true"
      />
      <button
        type="button"
        role="radio"
        aria-checked={language === 'en'}
        onClick={() => onLanguageChange('en')}
        className={cn(
          'relative z-10 flex items-center justify-center px-3 py-1.5 text-sm font-medium transition-colors duration-200',
          language === 'en'
            ? 'text-primary-foreground'
            : 'text-muted-foreground hover:text-foreground'
        )}
      >
        EN
      </button>
      <button
        type="button"
        role="radio"
        aria-checked={language === 'my'}
        onClick={() => onLanguageChange('my')}
        className={cn(
          'relative z-10 flex items-center justify-center px-3 py-1.5 text-sm font-medium transition-colors duration-200',
          language === 'my'
            ? 'text-primary-foreground'
            : 'text-muted-foreground hover:text-foreground'
        )}
      >
        MY
      </button>
    </div>
  )
}

// Compact language toggle for mobile header
function CompactLanguageToggle({
  language,
  onLanguageChange,
}: {
  language: Language
  onLanguageChange: (lang: Language) => void
}) {
  return (
    <div
      className="relative flex items-center rounded-full bg-secondary/80 p-0.5 shadow-green-sm"
      role="radiogroup"
      aria-label="Language selection"
    >
      {/* Sliding indicator */}
      <div
        className={cn(
          'absolute h-[calc(100%-4px)] w-[calc(50%-2px)] rounded-full bg-primary shadow-green transition-transform duration-200 ease-out',
          language === 'my' ? 'translate-x-[calc(100%+2px)]' : 'translate-x-0'
        )}
        aria-hidden="true"
      />
      <button
        type="button"
        role="radio"
        aria-checked={language === 'en'}
        onClick={() => onLanguageChange('en')}
        className={cn(
          'relative z-10 flex items-center justify-center px-2.5 py-1 text-xs font-medium transition-colors duration-200',
          language === 'en'
            ? 'text-primary-foreground'
            : 'text-muted-foreground hover:text-foreground'
        )}
      >
        EN
      </button>
      <button
        type="button"
        role="radio"
        aria-checked={language === 'my'}
        onClick={() => onLanguageChange('my')}
        className={cn(
          'relative z-10 flex items-center justify-center px-2.5 py-1 text-xs font-medium transition-colors duration-200',
          language === 'my'
            ? 'text-primary-foreground'
            : 'text-muted-foreground hover:text-foreground'
        )}
      >
        MY
      </button>
    </div>
  )
}

interface NavbarProps extends Omit<ComponentProps<'nav'>, 'className'> {
  variant?: 'landing' | 'doa'
}

export function Navbar({ variant = 'landing', ...props }: NavbarProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  // Only use language context in doa variant (since landing page doesn't wrap with LanguageProvider)
  const languageContext = variant === 'doa' ? useLanguage() : null
  const { language = 'en', setLanguage, t } = languageContext || {}

  // Authentication state
  const { data: session } = useSession()
  const isAuthenticated = !!session?.user
  const userName = session?.user?.name
  const userImage = session?.user?.image || undefined

  const handleMobileMenuToggle = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen)
  }

  const handleSignOut = async () => {
    await signOut()
    setIsMobileMenuOpen(false) // Close mobile menu after sign out
  }

  const handleLinkClick = () => {
    setIsMobileMenuOpen(false)
  }

  // User profile dropdown component
  const UserProfile = () => (
    <div className="flex items-center gap-3">
      <Avatar size="sm">
        <AvatarImage src={userImage} alt={userName} />
        <AvatarFallback>
          {userName?.charAt(0).toUpperCase() || 'U'}
        </AvatarFallback>
      </Avatar>
      <div className="hidden sm:flex flex-col">
        <p className="font-medium text-sm text-foreground">{userName}</p>
      </div>
      <DropdownMenu>
        <DropdownMenuTrigger
          render={
            <Button
              variant="ghost"
              size="icon-sm"
              className="h-8 w-8"
              aria-label="User menu"
            />
          }
        >
          <svg
            className="h-4 w-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 9l-7 7-7-7"
            />
          </svg>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-56" align="end">
          <div className="flex items-center justify-start gap-2 p-2">
            <div className="flex flex-col space-y-1 leading-none">
              {userName && <p className="font-medium text-sm">{userName}</p>}
              {session?.user?.email && (
                <p className="w-[200px] truncate text-xs text-muted-foreground">
                  {session.user.email}
                </p>
              )}
            </div>
          </div>
          <DropdownMenuItem
            onClick={handleSignOut}
            className="cursor-pointer text-destructive hover:text-destructive focus:text-destructive"
          >
            Sign out
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )

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

        {/* Mobile Language Toggle - positioned between logo and burger for doa variant */}
        {variant === 'doa' && setLanguage && (
          <div className="md:hidden">
            <CompactLanguageToggle
              language={language as Language}
              onLanguageChange={setLanguage}
            />
          </div>
        )}

        {/* Desktop Actions */}
        <div className="hidden md:flex items-center gap-3">
          {variant === 'landing' ? (
            isAuthenticated ? (
              <div className="flex items-center gap-3">
                <Button
                  variant="secondary"
                  size="sm"
                  className="flex items-center gap-2"
                  render={<Link to="/dashboard" />}
                >
                  <LayoutDashboard className="w-4 h-4" />
                  Go to Dashboard
                </Button>
                <div className="h-5 w-px bg-border" />
                <UserProfile />
              </div>
            ) : (
              <Button
                variant="primary-gradient"
                size="default"
                className="font-medium px-6 shadow-green hover:shadow-green-lg hover:-translate-y-0.5 transition-all duration-300"
                render={<Link to="/login" />}
              >
                Sign In with Google
              </Button>
            )
          ) : (
            <>
              {/* Language Toggle */}
              {setLanguage && (
                <LanguageToggle
                  language={language as Language}
                  onLanguageChange={setLanguage}
                />
              )}
              <div className="h-5 w-px bg-border" />
              {/* Navigation ButtonGroup - Home and Dashboard icons */}
              <ButtonGroup>
                <Tooltip>
                  <TooltipTrigger
                    render={
                      <Button
                        variant="outline"
                        size="icon-sm"
                        render={<Link to="/" />}
                        aria-label={t ? t('backToGetDoa') : 'Back to GetDoa'}
                      />
                    }
                  >
                    <Home className="w-4 h-4" />
                  </TooltipTrigger>
                  <TooltipContent>
                    {t ? t('backToGetDoa') : 'Back to GetDoa'}
                  </TooltipContent>
                </Tooltip>
                {isAuthenticated && (
                  <Tooltip>
                    <TooltipTrigger
                      render={
                        <Button
                          variant="outline"
                          size="icon-sm"
                          render={<Link to="/dashboard" />}
                          aria-label="Go to Dashboard"
                        />
                      }
                    >
                      <LayoutDashboard className="w-4 h-4" />
                    </TooltipTrigger>
                    <TooltipContent>Go to Dashboard</TooltipContent>
                  </Tooltip>
                )}
              </ButtonGroup>
              <div className="h-5 w-px bg-border" />
              {/* User Profile or Login */}
              {isAuthenticated ? (
                <UserProfile />
              ) : (
                <Button
                  variant="green-outline"
                  size="default"
                  className="font-medium px-4"
                  render={<Link to="/login" />}
                >
                  Sign In with Google
                </Button>
              )}
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
                isAuthenticated ? (
                  <>
                    {/* Dashboard button for authenticated users on landing */}
                    <Button
                      variant="secondary"
                      className="w-full flex items-center justify-center gap-2"
                      render={<Link to="/dashboard" onClick={handleLinkClick} />}
                    >
                      <LayoutDashboard className="w-4 h-4" />
                      Go to Dashboard
                    </Button>
                    {/* User profile card */}
                    <div className="flex items-center justify-between py-2 px-3 bg-secondary/50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <Avatar size="sm">
                          <AvatarImage src={userImage} alt={userName} />
                          <AvatarFallback>
                            {userName?.charAt(0).toUpperCase() || 'U'}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex flex-col">
                          <p className="font-medium text-sm">{userName}</p>
                          {session?.user?.email && (
                            <p className="text-xs text-muted-foreground truncate max-w-45">
                              {session.user.email}
                            </p>
                          )}
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={handleSignOut}
                        className="text-destructive hover:text-destructive hover:bg-destructive/10"
                      >
                        Sign out
                      </Button>
                    </div>
                  </>
                ) : (
                  <Button
                    variant="primary-gradient"
                    className="w-full font-medium py-3 shadow-green hover:shadow-green-lg transition-all duration-300"
                    render={<Link to="/login" onClick={handleLinkClick} />}
                  >
                    Sign In with Google
                  </Button>
                )
              ) : (
                <>
                  {/* Navigation buttons */}
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      className="flex-1 flex items-center justify-center gap-2"
                      render={<Link to="/" onClick={handleLinkClick} />}
                    >
                      <Home className="w-4 h-4" />
                      {t ? t('backToGetDoa') : 'Home'}
                    </Button>
                    {isAuthenticated && (
                      <Button
                        variant="secondary"
                        className="flex-1 flex items-center justify-center gap-2"
                        render={<Link to="/dashboard" onClick={handleLinkClick} />}
                      >
                        <LayoutDashboard className="w-4 h-4" />
                        Dashboard
                      </Button>
                    )}
                  </div>
                  {/* User profile or Login */}
                  {isAuthenticated ? (
                    <div className="flex items-center justify-between py-2 px-3 bg-secondary/50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <Avatar size="sm">
                          <AvatarImage src={userImage} alt={userName} />
                          <AvatarFallback>
                            {userName?.charAt(0).toUpperCase() || 'U'}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex flex-col">
                          <p className="font-medium text-sm">{userName}</p>
                          {session?.user?.email && (
                            <p className="text-xs text-muted-foreground truncate max-w-45">
                              {session.user.email}
                            </p>
                          )}
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={handleSignOut}
                        className="text-destructive hover:text-destructive hover:bg-destructive/10"
                      >
                        Sign out
                      </Button>
                    </div>
                  ) : (
                    <Button
                      variant="green-outline"
                      className="w-full font-medium py-3 shadow-green hover:shadow-green-lg transition-all duration-300"
                      render={<Link to="/login" onClick={handleLinkClick} />}
                    >
                      Sign In with Google
                    </Button>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </nav>
  )
}
