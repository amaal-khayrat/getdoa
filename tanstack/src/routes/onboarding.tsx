import { createFileRoute } from '@tanstack/react-router'
import { CreateSpaceForm } from '@/components/space/create-space-form'
import { useSession } from '@/lib/auth-client'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { LANDING_CONTENT } from '@/lib/constants'
import { Loader2 } from 'lucide-react'

export const Route = createFileRoute('/onboarding')({
  component: OnboardingPage,
  head: () => ({
    title: 'Create Your First Space - GetDoa',
    meta: [
      {
        name: 'description',
        content: 'Create your first prayer space to start your spiritual journey with GetDoa.',
      },
    ],
  }),
})

function OnboardingPage() {
  const { data: session, isPending } = useSession()

  // Show loading while checking session
  if (isPending) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  // Redirect to login if not authenticated
  if (!session?.user) {
    window.location.href = '/login'
    return null
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Simple header */}
      <header className="border-b">
        <div className="container mx-auto px-4 py-4 flex items-center gap-3">
          <img
            src={LANDING_CONTENT.navigation.logo}
            alt="GetDoa"
            className="h-8 w-8 rounded-lg"
          />
          <span className="font-serif text-xl font-semibold">GetDoa</span>
        </div>
      </header>

      {/* Main content */}
      <main className="container mx-auto px-4 py-8 max-w-4xl">
        <Card>
          <CardHeader className="text-center pb-2">
            <CardTitle className="text-3xl font-serif">
              Welcome, {session.user.name?.split(' ')[0]}!
            </CardTitle>
            <CardDescription className="text-base">
              Let's create your first prayer space to get started
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <CreateSpaceForm userId={session.user.id} language="en" />
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
