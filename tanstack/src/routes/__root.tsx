import {
  HeadContent,
  Link,
  Outlet,
  Scripts,
  createRootRoute,
} from '@tanstack/react-router'
import { TanStackRouterDevtoolsPanel } from '@tanstack/react-router-devtools'
import { TanStackDevtools } from '@tanstack/react-devtools'
import { z } from 'zod'

import appCss from '../styles.css?url'
import { FontPreloader } from '@/components/font-preloader'
import { ReferralCapture } from '@/components/referral-capture'
import { Toaster } from '@/components/ui/sonner'

// Define search params at root level for type safety
const rootSearchSchema = z.object({
  ref: z.string().optional(),
})

function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <div className="text-center">
        <h1 className="text-8xl font-serif font-bold text-muted-foreground/30">
          404
        </h1>
        <h2 className="mt-4 text-2xl font-serif font-medium text-foreground">
          Page Not Found
        </h2>
        <p className="mt-2 text-muted-foreground max-w-md mx-auto">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <Link
          to="/"
          className="mt-6 inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
        >
          Go back home
        </Link>
      </div>
    </div>
  )
}

export const Route = createRootRoute({
  validateSearch: rootSearchSchema,
  component: () => (
    <>
      <FontPreloader />
      <ReferralCapture />
      <Outlet />
      <Toaster />
    </>
  ),
  notFoundComponent: NotFound,
  head: () => ({
    meta: [
      {
        charSet: 'utf-8',
      },
      {
        name: 'viewport',
        content: 'width=device-width, initial-scale=1',
      },
      {
        title: 'GetDoa - Your Personalized Prayer Journey',
      },
    ],
    links: [
      {
        rel: 'stylesheet',
        href: appCss,
      },
    ],
  }),

  shellComponent: RootDocument,
})

function RootDocument({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <TanStackDevtools
          config={{
            position: 'bottom-right',
          }}
          plugins={[
            {
              name: 'Tanstack Router',
              render: <TanStackRouterDevtoolsPanel />,
            },
          ]}
        />
        <Scripts />
      </body>
    </html>
  )
}
