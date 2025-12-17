import { createFileRoute } from '@tanstack/react-router'
import { LandingLayout } from '@/components/landing/layout/landing-layout'
import { ContactPage } from '@/components/pages/contact-page'

export const Route = createFileRoute('/contact')({
  component: Contact,
  head: () => ({
    title: 'Contact Us - GetDoa',
    meta: [
      {
        name: 'description',
        content:
          "Get in touch with GetDoa team. We're here to support your spiritual journey. Email us at hazqeel@ellzaf.com for any questions or support.",
      },
    ],
  }),
})

function Contact() {
  return (
    <LandingLayout>
      <ContactPage />
    </LandingLayout>
  )
}
