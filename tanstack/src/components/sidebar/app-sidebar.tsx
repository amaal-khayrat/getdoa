import * as React from 'react'
import { Link } from '@tanstack/react-router'
import { BookOpen, Home, Plus, Heart, ImageIcon, Gift, Shield } from 'lucide-react'

import { NavMain } from '@/components/sidebar/nav-main'
import { NavUser } from '@/components/sidebar/nav-user'
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from '@/components/ui/sidebar'
import { useSession } from '@/lib/auth-client'
import { LANDING_CONTENT } from '@/lib/constants'

// Navigation items for the sidebar - Settings removed per architecture
const navItems = [
  {
    title: 'Dashboard',
    url: '/dashboard',
    icon: Home,
    isActive: true,
  },
  {
    title: 'Create Doa List',
    url: '/dashboard/create-doa-list',
    icon: Plus,
  },
  {
    title: 'Create Doa Image',
    url: '/dashboard/doa-image',
    icon: ImageIcon,
  },
  {
    title: 'Browse Duas',
    url: '/doa',
    icon: BookOpen,
  },
  {
    title: 'Favorites',
    url: '#',
    icon: Heart,
    items: [
      {
        title: 'Saved Lists',
        url: '/dashboard/saved-lists',
      },
      {
        title: 'Saved Duas',
        url: '/dashboard/saved-duas',
      },
    ],
  },
  {
    title: 'Invite Friends',
    url: '/dashboard/referrals',
    icon: Gift,
  },
]

interface AppSidebarProps extends React.ComponentProps<typeof Sidebar> {
  isAdmin?: boolean
}

export function AppSidebar({ isAdmin = false, ...props }: AppSidebarProps) {
  const { data: session } = useSession()

  const user = {
    name: session?.user?.name || 'Guest',
    email: session?.user?.email || '',
    avatar: session?.user?.image || '',
  }

  // Add admin item conditionally
  const navItemsWithAdmin = isAdmin
    ? [
        ...navItems,
        {
          title: 'Admin',
          url: '/admin',
          icon: Shield,
        },
      ]
    : navItems

  return (
    <Sidebar collapsible="icon" {...props}>
      {/* Simple branding header instead of SpaceSwitcher */}
      <SidebarHeader className="border-b">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" render={<Link to="/dashboard" />}>
              <div className="bg-primary flex aspect-square size-8 items-center justify-center rounded-lg">
                <img
                  src={LANDING_CONTENT.navigation.logo}
                  alt="GetDoa"
                  className="size-5"
                />
              </div>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-serif font-semibold">GetDoa</span>
                <span className="text-muted-foreground truncate text-xs">Prayer Companion</span>
              </div>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={navItemsWithAdmin} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={user} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
