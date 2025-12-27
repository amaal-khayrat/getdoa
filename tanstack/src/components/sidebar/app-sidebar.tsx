import * as React from 'react'
import {
  BookOpen,
  Home,
  Plus,
  Settings,
  Heart,
  ImageIcon,
} from 'lucide-react'

import { NavMain } from '@/components/sidebar/nav-main'
import { NavUser } from '@/components/sidebar/nav-user'
import { SpaceSwitcher } from '@/components/sidebar/space-switcher'
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from '@/components/ui/sidebar'
import { useSession } from '@/lib/auth-client'

// Navigation items for the sidebar
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
        title: 'My Lists',
        url: '#',
      },
      {
        title: 'Saved Duas',
        url: '#',
      },
    ],
  },
  {
    title: 'Settings',
    url: '#',
    icon: Settings,
    items: [
      {
        title: 'Profile',
        url: '#',
      },
      {
        title: 'Preferences',
        url: '#',
      },
      {
        title: 'Notifications',
        url: '#',
      },
    ],
  },
]

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { data: session } = useSession()

  const user = {
    name: session?.user?.name || 'Guest',
    email: session?.user?.email || '',
    avatar: session?.user?.image || '',
  }

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <SpaceSwitcher />
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={navItems} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={user} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
