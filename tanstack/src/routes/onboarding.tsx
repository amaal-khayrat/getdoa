import { createFileRoute, redirect, useNavigate } from '@tanstack/react-router'
import { useState } from 'react'
import { z } from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { LANDING_CONTENT } from '@/lib/constants'
import { getSessionFromServer, getUserListLimitInfo } from './dashboard/functions'
import { ListTemplateCard } from '@/components/list/list-template-card'
import { LIST_TEMPLATES, getTemplateById } from '@/lib/list-templates'
import { ArrowRight, Sparkles } from 'lucide-react'
import type { ListLimitInfo } from '@/lib/list-limit'

// Form validation schema
const onboardingSchema = z.object({
  listName: z.string().min(1, 'Please enter a name for your list').max(100),
  templateId: z.string().optional(),
})

type OnboardingFormData = z.infer<typeof onboardingSchema>

export const Route = createFileRoute('/onboarding')({
  loader: async () => {
    const session = await getSessionFromServer()

    // 1. Redirect to login if not authenticated
    if (!session?.user) {
      throw redirect({ to: '/login', search: { ref: '/onboarding' } })
    }

    // 2. Get list limit info (no redirect - builder will disable save if at limit)
    const listLimitInfo = await getUserListLimitInfo({
      data: { userId: session.user.id },
    })

    return {
      user: {
        id: session.user.id,
        name: session.user.name,
      },
      listLimitInfo,
    }
  },
  component: OnboardingPage,
  head: () => ({
    title: 'Create Your Prayer List - GetDoa',
    meta: [
      {
        name: 'description',
        content:
          'Start your spiritual journey by creating a personalized prayer list with GetDoa.',
      },
    ],
  }),
})

function OnboardingPage() {
  const navigate = useNavigate()
  const loaderData = Route.useLoaderData() as {
    user: { id: string; name: string }
    listLimitInfo: ListLimitInfo
  }
  const { user, listLimitInfo } = loaderData

  const [selectedTemplateId, setSelectedTemplateId] =
    useState<string>('morning-azkar')

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<OnboardingFormData>({
    resolver: zodResolver(onboardingSchema),
    defaultValues: {
      listName: '',
      templateId: 'morning-azkar',
    },
  })

  const listName = watch('listName')

  // When template changes, suggest a name if field is empty
  const handleTemplateSelect = (templateId: string) => {
    const previousTemplate = getTemplateById(selectedTemplateId)
    setSelectedTemplateId(templateId)
    setValue('templateId', templateId)

    // Only suggest name if current name is empty or matches previous template name
    const template = getTemplateById(templateId)
    const currentName = listName.trim()

    if (
      template &&
      (!currentName ||
        currentName === previousTemplate?.name ||
        currentName === previousTemplate?.nameMs)
    ) {
      setValue('listName', template.name)
    }
  }

  const onSubmit = (data: OnboardingFormData) => {
    // Navigate to builder with params
    navigate({
      to: '/dashboard/create-doa-list',
      search: {
        name: data.listName,
        template: data.templateId !== 'empty' ? data.templateId : undefined,
      },
    })
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60">
        <div className="container mx-auto px-4 py-4 flex items-center gap-3">
          <img
            src={LANDING_CONTENT.navigation.logo}
            alt="GetDoa"
            className="h-8 w-8 rounded-lg"
          />
          <span className="font-serif text-xl font-semibold">GetDoa</span>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">
            <Sparkles className="h-4 w-4" />
            Step 1 of 2
          </div>
          <h1 className="text-3xl md:text-4xl font-serif font-semibold mb-2">
            {listLimitInfo.current === 0
              ? `Welcome, ${user?.name?.split(' ')[0] || 'Friend'}!`
              : 'Create a New List'}
          </h1>
          <p className="text-muted-foreground text-lg">
            {listLimitInfo.current === 0
              ? "Let's set up your first prayer list"
              : `You have ${listLimitInfo.remaining} list slot${listLimitInfo.remaining === 1 ? '' : 's'} remaining`}
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
          {/* Template Selection */}
          <Card>
            <CardHeader>
              <CardTitle>Choose a Starting Point</CardTitle>
              <CardDescription>
                Select a template to get started quickly, or start with an empty
                list
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {LIST_TEMPLATES.map((template) => (
                  <ListTemplateCard
                    key={template.id}
                    template={template}
                    isSelected={selectedTemplateId === template.id}
                    onSelect={() => handleTemplateSelect(template.id)}
                    language="en"
                  />
                ))}
              </div>
            </CardContent>
          </Card>

          {/* List Name Input */}
          <Card>
            <CardHeader>
              <CardTitle>Name Your List</CardTitle>
              <CardDescription>
                Give your prayer list a meaningful name
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 max-w-md">
                <Label htmlFor="listName">List Name</Label>
                <Input
                  id="listName"
                  placeholder="e.g., My Morning Prayers"
                  {...register('listName')}
                  className={errors.listName ? 'border-destructive' : ''}
                />
                {errors.listName && (
                  <p className="text-sm text-destructive">
                    {errors.listName.message}
                  </p>
                )}
                <p className="text-sm text-muted-foreground">
                  You can always change this later
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Submit Button */}
          <div className="flex justify-center pt-4">
            <Button
              type="submit"
              size="lg"
              className="gap-2 px-8"
              disabled={!listName.trim()}
            >
              Continue to Builder
              <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        </form>
      </main>
    </div>
  )
}
