export const SIGNUP_ONBOARDING_KEY = 'getdoa_signup_onboarding'

export type SignupGoalId = 'daily-routine' | 'specific-need' | 'skip'

export interface SignupOnboardingPrefs {
  goal: SignupGoalId
  templateId: string
}

export const SIGNUP_GOALS = [
  {
    id: 'daily-routine' as const,
    title: 'Build a daily routine',
    description: 'Set up dzikir and prayers for morning or evening',
  },
  {
    id: 'specific-need' as const,
    title: 'Prayers for a specific need',
    description:
      'Exam, travel, anxiety, gratitude. We will suggest one.',
  },
  {
    id: 'skip' as const,
    title: 'Skip for now',
    description: 'Explore the library and build at your own pace',
  },
]

export const SIGNUP_LIST_TEMPLATE_IDS = [
  'daily-dzikir',
  'daily-essentials',
  'empty',
] as const

export function saveSignupOnboardingPrefs(prefs: SignupOnboardingPrefs) {
  if (typeof sessionStorage === 'undefined') return
  sessionStorage.setItem(SIGNUP_ONBOARDING_KEY, JSON.stringify(prefs))
}

export function getSignupOnboardingPrefs(): SignupOnboardingPrefs | null {
  if (typeof sessionStorage === 'undefined') return null
  const raw = sessionStorage.getItem(SIGNUP_ONBOARDING_KEY)
  if (!raw) return null
  try {
    return JSON.parse(raw) as SignupOnboardingPrefs
  } catch {
    return null
  }
}

export function clearSignupOnboardingPrefs() {
  if (typeof sessionStorage === 'undefined') return
  sessionStorage.removeItem(SIGNUP_ONBOARDING_KEY)
}

export function getSignupGoalLabel(goalId: SignupGoalId): string {
  return SIGNUP_GOALS.find((g) => g.id === goalId)?.title ?? goalId
}
