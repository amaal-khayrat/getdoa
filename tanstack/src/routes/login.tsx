import { createFileRoute, Link } from '@tanstack/react-router'
import { useState } from 'react'
import { X } from 'lucide-react'
import { z } from 'zod'
import { signIn, signUp } from '@/lib/auth-client'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { LANDING_CONTENT } from '@/lib/constants'
import { SignupOnboardingModal } from '@/components/auth/signup-onboarding-modal'

const loginSearchSchema = z.object({
  ref: z.string().optional(),
})

export const Route = createFileRoute('/login')({
  validateSearch: loginSearchSchema,
  component: LoginPage,
  head: () => ({
    title: 'Sign In - GetDoa',
    meta: [
      {
        name: 'description',
        content:
          'Sign in to GetDoa with Google to continue your prayer journey',
      },
    ],
  }),
})

function GoogleIcon({ className }: { className?: string }) {
  return (
    <svg className={cn('h-5 w-5 shrink-0', className)} viewBox="0 0 24 24">
      <path
        fill="#4285F4"
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
      />
      <path
        fill="#34A853"
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      />
      <path
        fill="#FBBC05"
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
      />
      <path
        fill="#EA4335"
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
      />
    </svg>
  )
}

function LoadingSpinner() {
  return (
    <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24">
      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="4"
        fill="none"
      />
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
      />
    </svg>
  )
}


function LoginPage() {
  const [error, setError] = useState('')
  const [signupModalOpen, setSignupModalOpen] = useState(false)
  const [loadingAction, setLoadingAction] = useState<'signin' | 'signup' | null>(
    null,
  )
  const search = Route.useSearch()

  const getCallbackURL = (override?: string) => {
    if (override) return override
    if (search.ref && search.ref.startsWith('/') && !search.ref.startsWith('//')) {
      return search.ref
    }
    return '/dashboard'
  }

  const handleGoogleAuth = async (
    action: 'signin' | 'signup',
    callbackOverride?: string,
  ) => {
    setError('')
    setLoadingAction(action)

    try {
      const callbackURL = getCallbackURL(callbackOverride)
      if (action === 'signup') {
        await signUp.social({
          provider: 'google',
          callbackURL,
        })
      } else {
        await signIn.social({
          provider: 'google',
          callbackURL,
        })
      }
    } catch {
      setError('Failed to connect with Google. Please try again.')
      setLoadingAction(null)
    }
  }

  const isLoading = loadingAction !== null

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F0F9F1] px-4 py-12">
      <div className="relative w-full max-w-md rounded-xl border border-border/80 bg-[linear-gradient(160deg,#fdfcf3_0%,#e8f3ee_100%)] p-8 pt-10 shadow-[0_10px_40px_-10px_rgba(0,0,0,0.12),0_4px_16px_-4px_rgba(0,0,0,0.08)]">
        <Link
          to="/"
          className="absolute top-2 right-2 rounded-md p-1.5 text-muted-foreground/70 transition-colors hover:text-muted-foreground"
          aria-label="Close"
        >
          <X className="h-5 w-5" />
        </Link>

        {/* Brand */}
        <div className="mb-8">
          <Link
            to="/"
            className="inline-flex items-center gap-2 hover:opacity-80 transition-opacity"
          >
            <img
              src={LANDING_CONTENT.navigation.logo}
              alt="GetDoa"
              className="h-9 w-9 rounded-lg"
            />
            <span className="text-base font-semibold tracking-tight text-foreground">
              GetDoa
            </span>
          </Link>
          <div
            className="mt-4 h-0.5 w-14 rounded-full bg-[#1d6a45]"
            aria-hidden
          />
        </div>

        {/* Copy */}
        <div className="mb-8 space-y-3 text-left">
          <h1 className="text-[28px] font-medium leading-snug tracking-tight text-foreground">
            Keep every dua
            <br />
            close to heart.
          </h1>
          <p className="text-sm leading-relaxed text-muted-foreground">
            Because some duas deserve to be remembered.{' '}
            <span className="text-primary">
              Create your free account and start collecting.
            </span>
          </p>
        </div>

        {/* Actions */}
        <div className="space-y-4">
          {error && (
            <div className="rounded-lg bg-destructive/10 p-3 text-sm text-destructive">
              {error}
            </div>
          )}

          <Button
            size="lg"
            className="h-12 w-full gap-3 rounded-lg border-0 bg-[#1d6a45] text-[15px] font-medium text-white shadow-none hover:bg-[#185a3a]"
            onClick={() => handleGoogleAuth('signin')}
            disabled={isLoading}
          >
            {loadingAction === 'signin' ? (
              <LoadingSpinner />
            ) : (
              <GoogleIcon />
            )}
            Continue with Google
          </Button>

          <div className="relative py-1">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-border" />
            </div>
            <div className="relative flex justify-center text-xs">
              <span className="bg-[#e8f3ee] px-3 text-muted-foreground">
                New to GetDoa
              </span>
            </div>
          </div>

          <Button
            variant="outline"
            size="lg"
            className="h-12 w-full rounded-lg border-border bg-white text-[15px] font-medium text-foreground shadow-none hover:bg-white"
            onClick={() => setSignupModalOpen(true)}
            disabled={isLoading}
          >
            Create a free account
          </Button>
        </div>
      </div>

      <SignupOnboardingModal
        open={signupModalOpen}
        onOpenChange={setSignupModalOpen}
        onSignUp={() => handleGoogleAuth('signup', '/onboarding')}
        isSigningUp={loadingAction === 'signup'}
      />
    </div>
  )
}
