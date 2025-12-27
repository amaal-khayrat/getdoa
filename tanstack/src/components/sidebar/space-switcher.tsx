import * as React from 'react'
import { useNavigate } from '@tanstack/react-router'
import {
  BookOpen,
  ChevronsUpDown,
  Plus,
  Sunrise,
  Sunset,
  Heart,
  Calendar,
  type LucideIcon,
} from 'lucide-react'

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from '@/components/ui/sidebar'
import { useSpaceStore, useCurrentSpace } from '@/stores/space-store'

// Map icon names to components
const iconMap: Record<string, LucideIcon> = {
  BookOpen,
  Sunrise,
  Sunset,
  Heart,
  Calendar,
  Plus,
}

export function SpaceSwitcher() {
  const navigate = useNavigate()
  const { isMobile } = useSidebar()
  const spaces = useSpaceStore((state) => state.spaces)
  const setCurrentSpaceId = useSpaceStore((state) => state.setCurrentSpaceId)
  const currentSpace = useCurrentSpace()

  const handleSpaceSwitch = (spaceId: string) => {
    setCurrentSpaceId(spaceId)
  }

  const handleCreateNew = () => {
    navigate({ to: '/onboarding' })
  }

  // Get icon component for a space
  const getSpaceIcon = (iconName: string | null) => {
    if (!iconName) return BookOpen
    return iconMap[iconName] || BookOpen
  }

  const CurrentIcon = currentSpace ? getSpaceIcon(currentSpace.icon) : BookOpen

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger
            render={
              <SidebarMenuButton
                size="lg"
                className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
              />
            }
          >
            <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <CurrentIcon className="size-4" />
            </div>
            <div className="grid flex-1 text-left text-sm leading-tight">
              <span className="truncate font-serif font-semibold">
                {currentSpace?.name || 'Select Space'}
              </span>
              <span className="truncate text-xs text-muted-foreground">
                {currentSpace ? `${currentSpace.doaItems.length} duas` : 'No space selected'}
              </span>
            </div>
            <ChevronsUpDown className="ml-auto size-4" />
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg"
            align="start"
            side={isMobile ? 'bottom' : 'right'}
            sideOffset={4}
          >
            <DropdownMenuGroup>
              <DropdownMenuLabel className="text-xs text-muted-foreground">
                Your Spaces
              </DropdownMenuLabel>
              {spaces.map((space) => {
                const Icon = getSpaceIcon(space.icon)
                return (
                  <DropdownMenuItem
                    key={space.id}
                    onClick={() => handleSpaceSwitch(space.id)}
                    className="gap-2 p-2 cursor-pointer"
                  >
                    <div className="flex size-6 items-center justify-center rounded-sm border">
                      <Icon className="size-4 shrink-0" />
                    </div>
                    <span className="flex-1 truncate">{space.name}</span>
                    <span className="text-xs text-muted-foreground">
                      {space.doaItems.length}
                    </span>
                  </DropdownMenuItem>
                )
              })}
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={handleCreateNew}
              className="gap-2 p-2 cursor-pointer"
            >
              <div className="flex size-6 items-center justify-center rounded-md border bg-background">
                <Plus className="size-4" />
              </div>
              <span className="font-medium text-muted-foreground">
                Create new space
              </span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  )
}

// Alias for backwards compatibility
export { SpaceSwitcher as TeamSwitcher }
