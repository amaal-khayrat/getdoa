import { useLanguage } from '@/contexts/language-context'
import { useSession } from '@/lib/auth-client'
import { LANDING_CONTENT } from '@/lib/constants'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { cn } from '@/lib/utils'

function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/)
  if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase()
  return parts[0].slice(0, 2).toUpperCase()
}

const MY_ACCOUNT_LINKS = [
  { label: 'Dashboard', href: '/dashboard' },
  { label: 'My Lists', href: '/dashboard/saved-lists' },
  { label: 'Bookmarks', href: '/dashboard/saved-duas' },
  { label: 'Settings', href: '/dashboard/profile' },
]

const LABEL_CLASS =
  'text-sm font-semibold tracking-widest uppercase text-foreground mb-4'

export function FooterSection() {
  const { language, setLanguage } = useLanguage()
  const { data: session } = useSession()
  const isAuthenticated = !!session?.user
  const userName = session?.user?.name || ''
  const userImage = session?.user?.image || undefined
  const firstName = userName.split(' ')[0]

  const exploreLinks = isAuthenticated
    ? LANDING_CONTENT.footer.columns.explore.links.filter(
        (l) => l.label !== 'Leaderboard',
      )
    : LANDING_CONTENT.footer.columns.explore.links

  const featuresLinks = isAuthenticated
    ? LANDING_CONTENT.footer.columns.features.links.filter(
        (l) => l.label !== 'Create a List',
      )
    : LANDING_CONTENT.footer.columns.features.links

  return (
    <footer
      className="border-t border-border pt-16 pb-8"
      style={{ backgroundColor: '#f5f3ee' }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Grid Layout */}
        <div
          className={`grid grid-cols-2 md:grid-cols-3 gap-8 mb-12 ${
            isAuthenticated ? 'lg:grid-cols-6' : 'lg:grid-cols-5'
          }`}
        >
          {/* Brand Column */}
          <div className="col-span-2 md:col-span-3 lg:col-span-1">
            <div className="flex items-center gap-2 mb-4">
              <img
                src="/logo.svg"
                alt="GetDoa Logo"
                className="w-6 h-6 rounded"
              />
              <span className="font-serif font-bold text-foreground">
                GetDoa
              </span>
            </div>

            {isAuthenticated ? (
              <>
                <div className="flex items-center gap-3 mb-2">
                  <Avatar size="sm">
                    <AvatarImage src={userImage} alt={userName} />
                    <AvatarFallback>{getInitials(userName)}</AvatarFallback>
                  </Avatar>
                  <p className="text-sm text-muted-foreground">
                    Assalamu'alaikum, {firstName}
                  </p>
                </div>
                <p className="text-sm font-normal text-muted-foreground mb-4">
                  Keep going — every doa counts.
                </p>
              </>
            ) : (
              <p className="text-sm font-normal text-muted-foreground mb-4">
                {LANDING_CONTENT.footer.tagline}
              </p>
            )}

            {/* Language Toggle — only shown when logged in */}
            {isAuthenticated && (
              <div
                className="inline-flex rounded-full border border-border overflow-hidden"
                role="radiogroup"
                aria-label="Language selection"
              >
                {(['en', 'my'] as const).map((lang, i) => (
                  <button
                    key={lang}
                    type="button"
                    role="radio"
                    aria-checked={language === lang}
                    onClick={() => setLanguage(lang)}
                    className={cn(
                      'px-4 py-1.5 text-xs font-medium transition-colors',
                      i === 0 ? '' : 'border-l border-border',
                      language === lang
                        ? 'bg-primary text-primary-foreground'
                        : 'text-muted-foreground hover:text-foreground hover:bg-black/5',
                    )}
                  >
                    {lang.toUpperCase()}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* My Account Column — authenticated only */}
          {isAuthenticated && (
            <div>
              <h4 className={LABEL_CLASS}>My account</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                {MY_ACCOUNT_LINKS.map((link) => (
                  <li key={link.href}>
                    <a
                      href={link.href}
                      className="hover:text-primary transition-colors"
                    >
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Explore Column */}
          <div>
            <h4 className={LABEL_CLASS}>
              {LANDING_CONTENT.footer.columns.explore.title}
            </h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              {exploreLinks.map((link) => (
                <li key={link.href}>
                  <a
                    href={link.href}
                    className="hover:text-primary transition-colors"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Features Column */}
          <div>
            <h4 className={LABEL_CLASS}>
              {LANDING_CONTENT.footer.columns.features.title}
            </h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              {featuresLinks.map((link) => (
                <li key={link.href} className="flex items-center gap-2">
                  <a
                    href={link.href}
                    className="hover:text-primary transition-colors"
                  >
                    {link.label}
                  </a>
                  {'badge' in link && link.badge && (
                    <span className="text-xs bg-orange-500 text-white px-1.5 py-0.5 rounded-full font-medium leading-none">
                      {link.badge}
                    </span>
                  )}
                </li>
              ))}
            </ul>
          </div>

          {/* Company Column */}
          <div>
            <h4 className={LABEL_CLASS}>
              {LANDING_CONTENT.footer.columns.company.title}
            </h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              {LANDING_CONTENT.footer.columns.company.links.map((link) => (
                <li key={link.href}>
                  <a
                    href={link.href}
                    className="hover:text-primary transition-colors"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal Column */}
          <div>
            <h4 className={LABEL_CLASS}>
              {LANDING_CONTENT.footer.columns.legal.title}
            </h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              {LANDING_CONTENT.footer.columns.legal.links.map((link) => (
                <li key={link.href}>
                  <a
                    href={link.href}
                    className="hover:text-primary transition-colors"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="pt-12 border-t border-border flex justify-center items-center text-xs text-muted-foreground">
          <p>{LANDING_CONTENT.footer.copyright}</p>
        </div>
      </div>
    </footer>
  )
}
