import { Github } from 'lucide-react'
import { LANDING_CONTENT } from '@/lib/constants'

export function FooterSection() {
  return (
    <footer className="bg-background border-t border-border pt-16 pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Grid Layout */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-12">
          {/* Brand Column */}
          <div className="col-span-2 md:col-span-1">
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
            <p className="text-sm text-muted-foreground">
              {LANDING_CONTENT.footer.tagline}
            </p>
          </div>

          {/* Links Columns */}
          {Object.entries(LANDING_CONTENT.footer.columns).map(
            ([key, column]) => (
              <div key={key}>
                <h4 className="font-semibold text-foreground mb-4">
                  {column.title}
                </h4>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  {column.links.map((link, index) => (
                    <li key={index}>
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
            ),
          )}
        </div>

        {/* Bottom Section */}
        <div className="pt-8 border-t border-border flex flex-col sm:flex-row justify-between items-center gap-4 text-xs text-muted-foreground">
          <p>{LANDING_CONTENT.footer.copyright}</p>

          {/* GitHub Link Only */}
          <div className="flex gap-4">
            <a
              href="https://github.com/amaal-khayrat/getdoa"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-foreground transition-colors flex items-center gap-2"
              aria-label="GitHub"
            >
              <Github className="w-4 h-4" />
              {LANDING_CONTENT.footer.github}
            </a>
          </div>
        </div>
      </div>
    </footer>
  )
}
