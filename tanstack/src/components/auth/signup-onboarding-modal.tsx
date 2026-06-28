import { useState } from 'react'
import {
  BookOpen,
  Calendar,
  Check,
  Languages,
  Layers,
  List,
  Orbit,
  Plus,
  Repeat,
  SkipForward,
  Sparkles,
  Sunrise,
  Sunset,
  X,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import type { ListTemplate } from '@/types/doa-list.types'
import type { SignupGoalId } from '@/lib/signup-onboarding'
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { getTemplateById } from '@/lib/list-templates'
import {
  SIGNUP_GOALS,
  SIGNUP_LIST_TEMPLATE_IDS,
  getSignupGoalLabel,
} from '@/lib/signup-onboarding'

const STEPS = [
  { id: 1, label: 'Welcome' },
  { id: 2, label: 'Your goal' },
  { id: 3, label: 'First list' },
  { id: 4, label: 'Sign in' },
] as const

const WELCOME_FEATURES = [
  {
    icon: BookOpen,
    title: 'Browse the library',
    description: 'Explore 90+ prayers with translations',
  },
  {
    icon: List,
    title: 'Build your lists',
    description: 'Create personal collections for any moment',
  },
  {
    icon: Languages,
    title: 'Read your way',
    description: 'Switch between Rumi, Jawi, and Malay anytime',
  },
]

const templateIconMap: Partial<Record<string, LucideIcon>> = {
  Sunrise,
  Sunset,
  Calendar,
  Plus,
  Orbit,
  Layers,
}

const SIGNUP_LIST_TEMPLATES = SIGNUP_LIST_TEMPLATE_IDS.map((id) =>
  getTemplateById(id),
).filter((template): template is ListTemplate => Boolean(template))

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

function SignupStepper({
  currentStep,
  onStepClick,
}: {
  currentStep: number
  onStepClick: (step: number) => void
}) {
  return (
    <div className="inline-flex items-start">
      {STEPS.map((step, index) => {
        const isComplete = currentStep > step.id
        const isActive = currentStep === step.id
        const isClickable = isComplete

        return (
          <div key={step.id} className="flex items-start">
            <div className="flex shrink-0 flex-col items-center gap-1">
              <button
                type="button"
                disabled={!isClickable}
                onClick={() => isClickable && onStepClick(step.id)}
                className={cn(
                  'relative flex h-10 w-10 items-center justify-center rounded-full text-sm font-semibold transition-colors',
                  isComplete && 'bg-[#1d6a45] text-white',
                  isActive &&
                    'bg-[#1d6a45] text-white ring-2 ring-[#1d6a45]/25',
                  !isComplete &&
                    !isActive &&
                    'border border-border bg-white text-muted-foreground',
                  isClickable && 'cursor-pointer hover:bg-[#185a3a]',
                  !isClickable && !isActive && 'cursor-default',
                )}
                aria-current={isActive ? 'step' : undefined}
              >
                {isActive && (
                  <span className="absolute inset-[-4px] rounded-full border-2 border-[#1d6a45]/60 animate-pulse [animation-duration:2s]" />
                )}
                {isComplete ? <Check className="h-4 w-4" /> : step.id}
              </button>
              <span
                className={cn(
                  'max-w-[3.5rem] text-center text-xs leading-tight font-medium',
                  isActive ? 'text-[#1d6a45]' : 'text-muted-foreground',
                )}
              >
                {step.label}
              </span>
            </div>
            {index < STEPS.length - 1 && (
              <div
                className={cn(
                  'mx-2 mt-5 w-8 shrink-0 border-t-2',
                  currentStep > step.id
                    ? 'border-[#1d6a45]'
                    : 'border-dashed border-border',
                )}
                aria-hidden
              />
            )}
          </div>
        )
      })}
    </div>
  )
}

function SelectableCard({
  title,
  description,
  isSelected,
  onSelect,
  icon: Icon,
  muted = false,
}: {
  title: string
  description: string
  isSelected: boolean
  onSelect: () => void
  icon?: LucideIcon
  muted?: boolean
}) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className={cn(
        'relative w-full rounded-lg border p-4 text-left transition-colors',
        isSelected
          ? 'border-[#1d6a45] bg-[#1d6a45]/15'
          : muted
            ? 'border-[#6B7FD4]/30 bg-[#6B7FD4]/10 hover:bg-white hover:border-[#1d6a45]/40'
            : 'border-border bg-white hover:border-[#1d6a45]/40',
      )}
    >
      <div className="flex items-start gap-3">
        {Icon && (
          <div
            className={cn(
              'flex h-9 w-9 shrink-0 items-center justify-center rounded-lg',
              muted
                ? 'bg-[#6B7FD4]/15 text-[#6B7FD4]'
                : 'bg-[#cd9c54] text-white',
            )}
          >
            <Icon className="h-4 w-4" />
          </div>
        )}
        <div>
          <p className="font-medium text-foreground">{title}</p>
          <p className="mt-0.5 text-sm text-muted-foreground">{description}</p>
        </div>
      </div>
    </button>
  )
}

interface SignupOnboardingModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSignUp: (templateId: string) => void
  isSigningUp: boolean
}

export function SignupOnboardingModal({
  open,
  onOpenChange,
  onSignUp,
  isSigningUp,
}: SignupOnboardingModalProps) {
  const [step, setStep] = useState(1)
  const [goal, setGoal] = useState<SignupGoalId | null>(null)
  const [templateId, setTemplateId] = useState<string>('morning-azkar')

  const handleOpenChange = (next: boolean) => {
    if (!next) {
      setStep(1)
      setGoal(null)
      setTemplateId('morning-azkar')
    }
    onOpenChange(next)
  }

  const handleFinish = () => {
    onSignUp(templateId)
  }

  const selectedTemplate = getTemplateById(templateId)

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent
        showCloseButton={false}
        className="max-h-[90vh] max-w-lg overflow-y-auto rounded-xl border border-border/80 bg-[linear-gradient(160deg,#fdfcf3_0%,#e8f3ee_100%)] p-6 shadow-[0_10px_40px_-10px_rgba(0,0,0,0.12),0_4px_16px_-4px_rgba(0,0,0,0.08)] sm:max-w-lg"
      >
        <div className="mb-5">
          <div className="flex justify-end">
            <button
              type="button"
              onClick={() => handleOpenChange(false)}
              className="rounded-md p-1.5 text-muted-foreground/70 transition-colors hover:text-muted-foreground"
              aria-label="Close"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
          <div className="mt-1 flex justify-center">
            <SignupStepper currentStep={step} onStepClick={(s) => setStep(s)} />
          </div>
        </div>

        <DialogTitle className="sr-only">Create a free account</DialogTitle>

        {step === 1 && (
          <div className="space-y-5">
            <div>
              <p className="text-xs font-medium text-muted-foreground">
                Free to start
              </p>
              <h2 className="mt-1 text-[24px] font-semibold tracking-tight text-foreground">
                Your personal doa companion.
              </h2>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                Discover, save, and read duas in the way that feels right for
                you.
              </p>
            </div>
            <div className="space-y-3">
              {WELCOME_FEATURES.map((feature) => (
                <div
                  key={feature.title}
                  className="flex items-start gap-3 rounded-lg border border-border bg-white p-4"
                >
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#cd9c54] text-white">
                    <feature.icon className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="font-medium text-foreground">
                      {feature.title}
                    </p>
                    <p className="mt-0.5 text-sm text-muted-foreground">
                      {feature.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
            <Button
              className="h-11 w-full rounded-lg border-0 bg-[#1d6a45] text-[15px] font-medium text-white hover:bg-[#185a3a]"
              onClick={() => setStep(2)}
            >
              Get Started
            </Button>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-5">
            <div>
              <p className="text-xs font-medium text-muted-foreground">
                Tell us a little about you
              </p>
              <h2 className="mt-1 text-2xl font-semibold tracking-tight text-foreground">
                What brings you here today?
              </h2>
            </div>
            <div className="space-y-3">
              {SIGNUP_GOALS.map((option) => (
                <SelectableCard
                  key={option.id}
                  title={option.title}
                  description={option.description}
                  isSelected={goal === option.id}
                  onSelect={() => setGoal(option.id)}
                  icon={
                    option.id === 'daily-routine'
                      ? Repeat
                      : option.id === 'specific-need'
                        ? Sparkles
                        : SkipForward
                  }
                  muted={option.id === 'skip'}
                />
              ))}
            </div>
            <div className="flex items-center justify-between gap-4">
              <Button
                variant="outline"
                className="h-11 rounded-lg px-8 text-[15px] font-medium outline-none focus-visible:ring-0 hover:bg-[#1d6a45] hover:text-white hover:border-[#1d6a45]"
                onClick={() => setStep(1)}
              >
                Previous
              </Button>
              <Button
                className="h-11 min-w-[140px] rounded-lg border-0 bg-[#1d6a45] px-8 text-[15px] font-medium text-white hover:bg-[#185a3a]"
                onClick={() => setStep(3)}
              >
                Next
              </Button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-5">
            <div>
              <p className="text-xs font-medium text-muted-foreground">
                Step 3 of 4
              </p>
              <h2 className="mt-1 text-2xl font-semibold tracking-tight text-foreground">
                Start with a ready-made list
              </h2>
              <p className="mt-2 text-sm text-muted-foreground">
                We will create this for you after sign in. You can edit, rename,
                or delete it anytime.
              </p>
            </div>
            <div className="space-y-3">
              {SIGNUP_LIST_TEMPLATES.map((template) => {
                const Icon = templateIconMap[template.icon] || Plus
                return (
                  <SelectableCard
                    key={template.id}
                    title={template.name}
                    description={template.description}
                    isSelected={templateId === template.id}
                    onSelect={() => setTemplateId(template.id)}
                    icon={Icon}
                    muted={template.id === 'empty'}
                  />
                )
              })}
            </div>
            <div className="flex items-center justify-between gap-4">
              <Button
                variant="outline"
                className="h-11 rounded-lg px-8 text-[15px] font-medium outline-none focus-visible:ring-0 hover:bg-[#1d6a45] hover:text-white hover:border-[#1d6a45]"
                onClick={() => setStep(2)}
              >
                Previous
              </Button>
              <Button
                className="h-11 min-w-[140px] rounded-lg border-0 bg-[#1d6a45] px-8 text-[15px] font-medium text-white hover:bg-[#185a3a]"
                onClick={() => setStep(4)}
              >
                Next
              </Button>
            </div>
          </div>
        )}

        {step === 4 && (
          <div className="space-y-5">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-[#1d6a45]">
                One last step
              </p>
              <h2 className="mt-1 text-2xl font-semibold tracking-tight text-foreground">
                Almost there.
              </h2>
              <p className="mt-2 text-sm text-muted-foreground">
                Sign in to unlock your list. It is already set up for you.
              </p>
            </div>

            <div className="rounded-xl border border-border bg-white p-5">
              <div className="space-y-0">
                <div className="pb-4">
                  <p className="text-xs text-muted-foreground">Your goal</p>
                  <p className="mt-0.5 font-semibold text-foreground">
                    {goal ? getSignupGoalLabel(goal) : 'Not selected'}
                  </p>
                </div>
                <div className="border-t border-border pt-4">
                  <p className="text-xs text-muted-foreground">First list</p>
                  <p className="mt-0.5 font-semibold text-foreground">
                    {selectedTemplate?.name ?? 'Morning Azkar'}
                  </p>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between gap-4">
              <Button
                variant="outline"
                className="h-11 rounded-lg px-8 text-[15px] font-medium outline-none focus-visible:ring-0 hover:bg-[#1d6a45] hover:text-white hover:border-[#1d6a45]"
                onClick={() => setStep(3)}
              >
                Previous
              </Button>
              <Button
                className="h-11 min-w-[180px] gap-3 rounded-lg border border-[#dadce0] bg-white px-6 text-[15px] font-medium text-[#3c4043] shadow-none hover:bg-[#f8f9fa] hover:border-[#dadce0]"
                onClick={handleFinish}
                disabled={isSigningUp}
              >
                {isSigningUp ? (
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-gray-300 border-t-gray-600" />
                ) : (
                  <GoogleIcon />
                )}
                Continue with Google
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
