'use client'

import { useState } from 'react'
import { Check, Clock, Copy, Mail, MapPin, Phone, Send } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { LANDING_CONTENT } from '@/lib/constants'

export function ContactPage() {
  const contactContent = LANDING_CONTENT.pages.contact
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [emailCopied, setEmailCopied] = useState(false)

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    // Simulate form submission
    await new Promise((resolve) => setTimeout(resolve, 1500))

    setIsSubmitting(false)
    setIsSubmitted(true)

    // Reset form after 3 seconds
    setTimeout(() => {
      setIsSubmitted(false)
      setFormData({ name: '', email: '', subject: '', message: '' })
    }, 3000)
  }

  const copyEmailToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(contactContent.information.email)
      setEmailCopied(true)
      setTimeout(() => setEmailCopied(false), 2000)
    } catch (err) {
      console.error('Failed to copy email address')
    }
  }

  const isFormValid =
    formData.name && formData.email && formData.subject && formData.message

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="py-20 bg-gradient-to-br from-teal-500/5 via-emerald-500/5 to-transparent dark:from-teal-500/10 dark:via-emerald-500/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="flex justify-center mb-6">
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-teal-500 to-emerald-600 flex items-center justify-center text-white shadow-lg shadow-teal-500/30">
              <Mail className="w-10 h-10" />
            </div>
          </div>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-serif font-medium text-gradient mb-6">
            {contactContent.hero.title}
          </h1>
          <p className="text-xl md:text-2xl text-muted-foreground mb-4">
            {contactContent.hero.subtitle}
          </p>
        </div>
      </section>

      {/* Contact Information Cards */}
      <section className="py-12 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-6 mb-16">
            {/* Email Card */}
            <Card className="text-center p-6 hover:shadow-lg transition-all duration-300">
              <CardContent className="p-0">
                <div className="w-12 h-12 rounded-lg bg-teal-100 dark:bg-teal-900/30 text-teal-600 dark:text-teal-400 flex items-center justify-center mx-auto mb-4">
                  <Mail className="w-6 h-6" />
                </div>
                <h3 className="font-medium text-foreground mb-2">Email</h3>
                <button
                  onClick={copyEmailToClipboard}
                  className="text-sm text-teal-600 dark:text-teal-400 hover:text-teal-700 dark:hover:text-teal-300 transition-colors flex items-center gap-1 mx-auto"
                >
                  {emailCopied ? (
                    <>
                      <Check className="w-4 h-4" />
                      Copied!
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4" />
                      Copy Email
                    </>
                  )}
                </button>
                <p className="text-xs text-muted-foreground mt-1">
                  {contactContent.information.email}
                </p>
              </CardContent>
            </Card>

            {/* Response Time Card */}
            <Card className="text-center p-6 hover:shadow-lg transition-all duration-300">
              <CardContent className="p-0">
                <div className="w-12 h-12 rounded-lg bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 flex items-center justify-center mx-auto mb-4">
                  <Clock className="w-6 h-6" />
                </div>
                <h3 className="font-medium text-foreground mb-2">
                  Response Time
                </h3>
                <p className="text-sm text-muted-foreground">
                  {contactContent.information.responseTime}
                </p>
              </CardContent>
            </Card>

            {/* Business Hours Card */}
            <Card className="text-center p-6 hover:shadow-lg transition-all duration-300">
              <CardContent className="p-0">
                <div className="w-12 h-12 rounded-lg bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 flex items-center justify-center mx-auto mb-4">
                  <Phone className="w-6 h-6" />
                </div>
                <h3 className="font-medium text-foreground mb-2">
                  Business Hours
                </h3>
                <p className="text-sm text-muted-foreground">
                  {contactContent.information.businessHours}
                </p>
              </CardContent>
            </Card>

            {/* Location Card */}
            <Card className="text-center p-6 hover:shadow-lg transition-all duration-300">
              <CardContent className="p-0">
                <div className="w-12 h-12 rounded-lg bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 flex items-center justify-center mx-auto mb-4">
                  <MapPin className="w-6 h-6" />
                </div>
                <h3 className="font-medium text-foreground mb-2">Location</h3>
                <p className="text-sm text-muted-foreground">
                  {contactContent.information.location}
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Contact Form and Information */}
          <div className="grid lg:grid-cols-2 gap-12">
            {/* Contact Form */}
            <Card className="shadow-sm">
              <CardContent className="p-8">
                <h2 className="text-2xl font-serif font-medium text-foreground mb-6">
                  Send us a Message
                </h2>

                {isSubmitted ? (
                  <div className="text-center py-12">
                    <div className="w-16 h-16 rounded-full bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto mb-4">
                      <Check className="w-8 h-8" />
                    </div>
                    <h3 className="text-lg font-medium text-foreground mb-2">
                      Message Sent Successfully!
                    </h3>
                    <p className="text-muted-foreground">
                      {contactContent.form.successMessage}
                    </p>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                      <Label htmlFor="name">
                        {contactContent.form.fields.name}
                      </Label>
                      <Input
                        id="name"
                        type="text"
                        value={formData.name}
                        onChange={(e) =>
                          handleInputChange('name', e.target.value)
                        }
                        required
                        className="mt-2"
                      />
                    </div>

                    <div>
                      <Label htmlFor="email">
                        {contactContent.form.fields.email}
                      </Label>
                      <Input
                        id="email"
                        type="email"
                        value={formData.email}
                        onChange={(e) =>
                          handleInputChange('email', e.target.value)
                        }
                        required
                        className="mt-2"
                      />
                    </div>

                    <div>
                      <Label htmlFor="subject">
                        {contactContent.form.fields.subject}
                      </Label>
                      <Input
                        id="subject"
                        type="text"
                        value={formData.subject}
                        onChange={(e) =>
                          handleInputChange('subject', e.target.value)
                        }
                        required
                        className="mt-2"
                      />
                    </div>

                    <div>
                      <Label htmlFor="message">
                        {contactContent.form.fields.message}
                      </Label>
                      <Textarea
                        id="message"
                        rows={5}
                        value={formData.message}
                        onChange={(e) =>
                          handleInputChange('message', e.target.value)
                        }
                        required
                        className="mt-2"
                      />
                    </div>

                    <Button
                      type="submit"
                      disabled={!isFormValid || isSubmitting}
                      className="w-full bg-gradient-to-r from-teal-500 to-emerald-600 hover:from-teal-600 hover:to-emerald-700 disabled:opacity-50"
                    >
                      {isSubmitting ? (
                        'Sending...'
                      ) : (
                        <>
                          {contactContent.form.submitButton}
                          <Send className="w-4 h-4 ml-2" />
                        </>
                      )}
                    </Button>
                  </form>
                )}
              </CardContent>
            </Card>

            {/* Quick Contact Information */}
            <div className="space-y-8">
              {/* Direct Email Contact */}
              <Card className="bg-gradient-to-br from-teal-50 to-emerald-50 dark:from-teal-950/20 dark:to-emerald-950/20 border-teal-200 dark:border-teal-800">
                <CardContent className="p-8">
                  <h3 className="text-xl font-serif font-medium text-foreground mb-4">
                    Prefer Email?
                  </h3>
                  <p className="text-muted-foreground mb-6">
                    You can reach us directly at our email address for any
                    questions, support, or feedback.
                  </p>
                  <Button
                    className="w-full bg-gradient-to-r from-teal-500 to-emerald-600 hover:from-teal-600 hover:to-emerald-700"
                    render={
                      <a
                        href={`mailto:${contactContent.information.email}`}
                        className="flex items-center justify-center"
                      />
                    }
                  >
                    <Mail className="w-4 h-4 mr-2" />
                    Email
                  </Button>
                </CardContent>
              </Card>

              {/* Common Questions */}
              <Card>
                <CardContent className="p-8">
                  <h3 className="text-xl font-serif font-medium text-foreground mb-4">
                    Quick Links
                  </h3>
                  <div className="space-y-3">
                    <Button
                      variant="ghost"
                      className="w-full justify-start text-left h-auto p-4"
                      render={<a href="/pricing" className="flex items-center gap-3" />}
                    >
                      <div className="w-8 h-8 rounded-lg bg-teal-100 dark:bg-teal-900/30 text-teal-600 dark:text-teal-400 flex items-center justify-center">
                        <span className="text-xs font-bold">P</span>
                      </div>
                      <div>
                        <div className="font-medium text-foreground">
                          View Pricing Plans
                        </div>
                        <div className="text-sm text-muted-foreground">
                          Compare our subscription options
                        </div>
                      </div>
                    </Button>

                    <Button
                      variant="ghost"
                      className="w-full justify-start text-left h-auto p-4"
                      render={<a href="/refund" className="flex items-center gap-3" />}
                    >
                      <div className="w-8 h-8 rounded-lg bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                        <span className="text-xs font-bold">R</span>
                      </div>
                      <div>
                        <div className="font-medium text-foreground">
                          Refund Policy
                        </div>
                        <div className="text-sm text-muted-foreground">
                          Learn about our 14-day guarantee
                        </div>
                      </div>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
