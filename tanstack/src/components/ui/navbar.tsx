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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { LANDING_CONTENT } from '@/lib/constants'
import { useLanguage } from '@/contexts/language-context'
import { signOut, useSession } from '@/lib/auth-client'

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
          <DropdownMenuSeparator />
          <DropdownMenuItem
            render={<Link to="/dashboard" />}
            className="cursor-pointer"
          >
            Dashboard
          </DropdownMenuItem>
          <DropdownMenuItem onClick={handleSignOut} className="cursor-pointer">
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

        {/* Desktop Actions */}
        <div className="hidden md:flex items-center gap-4">
          {variant === 'landing' ? (
            isAuthenticated ? (
              <UserProfile />
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
                    variant="primary-gradient"
                    className="w-full font-medium py-3 shadow-green hover:shadow-green-lg transition-all duration-300"
                    render={<Link to="/login" onClick={handleLinkClick} />}
                  >
                    Sign In with Google
                  </Button>
                )
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
