import { useState, useTransition } from 'react'
import { createFileRoute, getRouteApi, Link } from '@tanstack/react-router'
import { User, Eye, EyeOff, Heart, Globe, Lock } from 'lucide-react'
import { toast } from 'sonner'
import { getMyProfile, updateMyProfile } from './dashboard/functions/profile'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Skeleton } from '@/components/ui/skeleton'

// Get parent dashboard route API for accessing context
const dashboardRoute = getRouteApi('/dashboard')

export const Route = createFileRoute('/dashboard/profile')({
  // Load profile data in the loader - NOT useEffect!
  loader: async ({ context }) => {
    const { user } = context as { user: { id: string } }
    const profileData = await getMyProfile({ data: { userId: user.id } })
    return { profileData }
  },
  pendingComponent: ProfileSettingsSkeleton,
  component: ProfileSettingsPage,
  head: () => ({
    title: 'Profile Settings - GetDoa',
    meta: [
      {
        name: 'description',
        content: 'Manage your profile privacy and display settings.',
      },
    ],
  }),
})

function ProfileSettingsSkeleton() {
  return (
    <div className="p-6 max-w-2xl">
      <div className="mb-8">
        <Skeleton className="h-9 w-48 mb-2" />
        <Skeleton className="h-5 w-64" />
      </div>
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-32" />
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4">
              <Skeleton className="h-16 w-16 rounded-full" />
              <div>
                <Skeleton className="h-6 w-32 mb-2" />
                <Skeleton className="h-4 w-48" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-40" />
          </CardHeader>
          <CardContent className="space-y-4">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-24 w-full" />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

function ProfileSettingsPage() {
  const { profileData } = Route.useLoaderData()
  const { user } = dashboardRoute.useRouteContext()
  const [isPending, startTransition] = useTransition()

  // Form state - initialized from loader data
  const [displayName, setDisplayName] = useState(
    profileData.profile.displayName ?? '',
  )
  const [bio, setBio] = useState(profileData.profile.bio ?? '')
  const [profileVisibility, setProfileVisibility] = useState<
    'public' | 'private'
  >(profileData.profile.profileVisibility as 'public' | 'private')
  const [showAvatar, setShowAvatar] = useState(profileData.profile.showAvatar)
  const [showFullName, setShowFullName] = useState(
    profileData.profile.showFullName,
  )
  const [showFavorites, setShowFavorites] = useState(
    profileData.profile.showFavorites,
  )

  // Track if form is dirty
  const isDirty =
    displayName !== (profileData.profile.displayName ?? '') ||
    bio !== (profileData.profile.bio ?? '') ||
    profileVisibility !== profileData.profile.profileVisibility ||
    showAvatar !== profileData.profile.showAvatar ||
    showFullName !== profileData.profile.showFullName ||
    showFavorites !== profileData.profile.showFavorites

  const getInitials = (name: string): string =>
    name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2)

  const handleSave = () => {
    if (!user) return

    startTransition(async () => {
      try {
        await updateMyProfile({
          data: {
            userId: user.id,
            input: {
              displayName: displayName.trim() || null,
              bio: bio.trim() || null,
              profileVisibility,
              showAvatar,
              showFullName,
              showFavorites,
            },
          },
        })
        toast.success('Profile updated successfully')
      } catch {
        toast.error('Failed to update profile')
      }
    })
  }

  // Computed display name for preview
  const previewDisplayName =
    displayName || (showFullName ? profileData.name : getInitials(profileData.name))

  return (
    <div className="p-6 max-w-2xl">
      <div className="mb-8">
        <h1 className="text-3xl font-serif font-semibold text-foreground">
          Profile Settings
        </h1>
        <p className="text-muted-foreground mt-2">
          Manage how others see your profile
        </p>
      </div>

      <div className="space-y-6">
        {/* Preview Card */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Profile Preview</CardTitle>
            <CardDescription>
              This is how others will see your profile
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4">
              <Avatar className="h-16 w-16">
                {showAvatar && profileData.image ? (
                  <AvatarImage
                    src={profileData.image}
                    alt={profileData.name}
                  />
                ) : null}
                <AvatarFallback>
                  {previewDisplayName.slice(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="font-semibold text-lg">{previewDisplayName}</p>
                {bio && (
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {bio}
                  </p>
                )}
              </div>
            </div>
            <div className="mt-4">
              <Link
                to="/user/$userId"
                params={{ userId: user.id }}
                className="text-sm text-primary hover:underline inline-flex items-center gap-1"
              >
                <Eye className="h-3 w-3" />
                View public profile
              </Link>
            </div>
          </CardContent>
        </Card>

        {/* Display Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <User className="h-5 w-5" />
              Display Settings
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="displayName">Display Name</Label>
              <Input
                id="displayName"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder={profileData.name}
                maxLength={100}
              />
              <p className="text-xs text-muted-foreground">
                Leave empty to use your account name
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="bio">Bio</Label>
              <Textarea
                id="bio"
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder="Tell others about yourself..."
                rows={3}
                maxLength={500}
              />
              <p className="text-xs text-muted-foreground text-right">
                {bio.length}/500
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Privacy Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              {profileVisibility === 'public' ? (
                <Eye className="h-5 w-5" />
              ) : (
                <EyeOff className="h-5 w-5" />
              )}
              Privacy Settings
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label>Profile Visibility</Label>
              <Select
                value={profileVisibility}
                onValueChange={(v) =>
                  setProfileVisibility(v as 'public' | 'private')
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="public">
                    <span className="flex items-center gap-2">
                      <Globe className="h-4 w-4" />
                      Public - Anyone can view your profile
                    </span>
                  </SelectItem>
                  <SelectItem value="private">
                    <span className="flex items-center gap-2">
                      <Lock className="h-4 w-4" />
                      Private - Only you can see your profile
                    </span>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Show Profile Picture</Label>
                <p className="text-xs text-muted-foreground">
                  Display your avatar on your profile
                </p>
              </div>
              <Switch checked={showAvatar} onCheckedChange={setShowAvatar} />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Show Full Name</Label>
                <p className="text-xs text-muted-foreground">
                  {showFullName ? 'Showing full name' : 'Showing initials only'}
                </p>
              </div>
              <Switch
                checked={showFullName}
                onCheckedChange={setShowFullName}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label className="flex items-center gap-2">
                  <Heart className="h-4 w-4" />
                  Show Favorite Lists
                </Label>
                <p className="text-xs text-muted-foreground">
                  Display lists you've favorited on your profile
                </p>
              </div>
              <Switch
                checked={showFavorites}
                onCheckedChange={setShowFavorites}
              />
            </div>
          </CardContent>
        </Card>

        {/* Save Button */}
        <div className="flex justify-end gap-4">
          <Button
            variant="outline"
            onClick={() => {
              // Reset to original values
              setDisplayName(profileData.profile.displayName ?? '')
              setBio(profileData.profile.bio ?? '')
              setProfileVisibility(
                profileData.profile.profileVisibility as 'public' | 'private',
              )
              setShowAvatar(profileData.profile.showAvatar)
              setShowFullName(profileData.profile.showFullName)
              setShowFavorites(profileData.profile.showFavorites)
            }}
            disabled={isPending || !isDirty}
          >
            Reset
          </Button>
          <Button onClick={handleSave} disabled={isPending || !isDirty}>
            {isPending ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>
      </div>
    </div>
  )
}
