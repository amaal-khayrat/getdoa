export const LANDING_CONTENT = {
  navigation: {
    logo: '/logo.svg',
    signUpButton: 'Sign Up',
    loginButton: 'Log In',
    getStartedButton: 'Get the App',
  },

  hero: {
    title: 'Find Inner Peace:',
    subtitle: 'Your Personalized Prayer Journey',
    description:
      'Immerse yourself in a sanctuary of digital serenity. Access authentic Doa and curate your daily supplications.',
    primaryCTA: 'Start Your Journey',
    secondaryCTA: 'Go To Doa Library',
  },

  features: {
    title: 'Designed for the Modern Believer',
    subtitle:
      'Advanced tools seamlessly integrated into a minimalist design to support your spiritual growth.',
    items: [
      {
        icon: 'collections_bookmark',
        title: 'Personalized Compilations',
        description:
          'Create custom folders for specific needs—exams, anxiety, or gratitude—and access them instantly.',
        color: 'teal',
      },
      {
        icon: 'schedule',
        title: 'Smart Reminders',
        description:
          'Gentle, context-aware notifications that remind you to pause and pray at the most meaningful times.',
        color: 'purple',
      },
      {
        icon: 'translate',
        title: 'Multi-Language Insight',
        description:
          'Go beyond simple translation. Access tafsir summaries and word-by-word breakdowns.',
        color: 'amber',
      },
    ],
  },

  publicFeatures: {
    title: 'Public Features',
    subtitle:
      'Essential tools accessible to everyone, designed to begin your spiritual journey with ease.',
    items: [
      {
        icon: 'public',
        title: 'Discover Shared Doa',
        description:
          'Explore a diverse collection of prayers shared by the community for inspiration.',
        color: 'purple',
      },
      {
        icon: 'verified',
        title: 'Trusted References',
        description:
          'Access prayers backed by authentic references for peace of mind.',
        color: 'emerald',
      },
      {
        icon: 'school',
        title: 'Guided Tutorials',
        description:
          'Seamlessly learn to navigate and utilize the app with helpful guidance.',
        color: 'amber',
      },
    ],
  },

  enhancedFeatures: {
    badge: 'Upon Sign Up',
    title: 'Enhanced Features',
    subtitle:
      'Create a free account to unlock intelligent tools and personalized experiences designed to deepen your connection.',
    items: [
      {
        icon: 'edit_note',
        title: 'Compose Your Prayers',
        description:
          'Easily create and personalize your own spiritual supplications.',
        color: 'violet',
      },
      {
        icon: 'auto_awesome',
        title: 'AI Doa Assistant',
        description:
          'Receive intelligent suggestions and verification for your prayer compositions.',
        color: 'indigo',
      },
      {
        icon: 'download_for_offline',
        title: 'Download & Offline',
        description:
          'Securely download your customized prayers to access them offline.',
        color: 'teal',
      },
      {
        icon: 'translate',
        title: 'Write in Your Language',
        description:
          'Craft your prayers in Malay or English, expressing yourself freely.',
        color: 'rose',
      },
      {
        icon: 'qr_code_2',
        title: 'Share Instantly via QR',
        description:
          'Share your unique prayers effortlessly using generated QR codes.',
        color: 'cyan',
      },
      {
        icon: 'bookmark_added',
        title: 'Bookmark Favorites',
        description:
          'Keep your most beloved prayers organized and readily accessible.',
        color: 'orange',
      },
    ],
    ctaButton: 'Sign Up for Free',
  },

  experience: {
    title: 'Immersive Reading',
    description:
      'Experience prayers like never before. Distraction-free layouts, customizable Arabic typography, and thoughtful translations guide your heart to tranquility.',
    features: [
      'Verified Authentic Sources',
      'Audio Recitations',
      'Transliteration Support',
    ],
  },

  prayerCarousel: [
    {
      title: 'Morning Adhkar',
      subtitle: '12 prayers • 5 mins',
      arabicText: 'رَبَّنَا آتِنَا فِي الدُّنْيَا حَسَنَةً',
      translation:
        'Our Lord, give us in this world [that which is] good and in the Hereafter [that which is] good and protect us from the punishment of the Fire.',
      reference: 'Surah Al-Baqarah 2:201',
    },
    {
      title: 'Evening Protection',
      subtitle: '8 prayers • 3 mins',
      arabicText:
        'بِسْمِ اللَّهِ الَّذِي لَا يَضُرُّ مَعَ اسْمِهِ شَيْءٌ فِي الْأَرْضِ وَلَا فِي السَّمَاءِ وَهُوَ السَّمِيعُ الْعَلِيمُ',
      translation:
        'In the name of Allah, with whose name nothing in the earth or the heaven can cause harm, and He is the All-Hearing, the All-Knowing.',
      reference: 'Hadith - Abu Dawud 4/323',
    },
    {
      title: 'Seeking Forgiveness',
      subtitle: 'Daily Istighfar',
      arabicText:
        'أَسْتَغْفِرُ اللَّهَ الْعَظِيمَ الَّذِي لَا إِلَهَ إِلَّا هُوَ الْحَيُّ الْقَيُّومَ وَأَتُوبُ إِلَيْهِ',
      translation:
        'I seek forgiveness from Allah the Almighty, there is no deity except Him, the Ever-Living, the Sustainer of all, and I turn to Him in repentance.',
      reference: 'Hadith - Bukhari 6306',
    },
  ],

  testimonials: {
    title: 'Trusted by thousands seeking tranquility',
    subtitle:
      'Join a community dedicated to mindful prayer and spiritual excellence.',
    activeUsers: 'Active Users this week',
    items: [
      {
        quote:
          'This app completely changed how I approach my daily Adhkar. The design is so calming, it actually makes me want to stay longer and reflect.',
        author: 'Amina Rahman',
        role: 'Verified User',
        avatar: 'A',
      },
    ],
  },

  cta: {
    title: 'Start your journey to inner peace today',
  },

  footer: {
    tagline: 'Crafting digital experiences for the modern soul.',
    copyright: `© ${new Date().getFullYear()} GetDoa App. All rights reserved.`,
    columns: {
      product: {
        title: 'Product',
        links: [{ label: 'Pricing', href: '/pricing' }],
      },
      company: {
        title: 'Company',
        links: [
          { label: 'About', href: '/about' },
          { label: 'Contact', href: '/contact' },
        ],
      },
      legal: {
        title: 'Legal',
        links: [
          { label: 'Privacy Policy', href: '/privacy' },
          { label: 'Terms of Service', href: '/terms' },
          { label: 'Refund Policy', href: '/refund' },
        ],
      },
    },
    github: 'GitHub',
  },

  pages: {
    about: {
      hero: {
        title: 'About GetDoa',
        subtitle: 'A Journey of Digital Spirituality',
        description:
          'Born from a vision to make Islamic supplications accessible to everyone, GetDoa represents the perfect blend of tradition and technology.',
      },
      company: {
        registration: '202203104498 (JM0961486-A)',
        name: 'A product of Ellzaf Empire',
        founded: '2024',
        description:
          'Ellzaf Empire is dedicated to creating digital solutions that enrich spiritual lives and connect communities through technology.',
      },
      mission: {
        title: 'Our Mission',
        content:
          'To provide Muslims worldwide with a beautiful, intuitive platform for daily prayers and supplications, helping strengthen their connection with Allah through modern technology.',
      },
      values: [
        {
          title: 'Authenticity',
          description:
            'All prayers and content are verified by qualified Islamic scholars to ensure accuracy and reliability.',
          icon: 'verified',
          color: 'teal',
        },
        {
          title: 'Accessibility',
          description:
            'Making Islamic knowledge and practices accessible to everyone, regardless of their technical expertise or location.',
          icon: 'accessibility',
          color: 'purple',
        },
        {
          title: 'Innovation',
          description:
            'Combining centuries-old traditions with modern technology to create meaningful spiritual experiences.',
          icon: 'lightbulb',
          color: 'amber',
        },
      ],
    },

    pricing: {
      hero: {
        title: 'Choose Your Spiritual Journey',
        subtitle: 'Flexible pricing to support your prayer needs',
      },
      plans: [
        {
          name: 'Free',
          price: 'RM0',
          period: 'forever',
          description: 'Perfect for starting your spiritual journey',
          features: [
            'Cloud synchronization',
            'One personalized doa list',
            'Access to authentic prayers library',
            'Basic email support',
          ],
          excluded: ['Custom backgrounds', 'Premium fonts'],
          popular: false,
        },
        {
          name: 'Basic',
          price: 'RM3.99',
          period: 'per doa',
          description: 'Add more doa lists to your free account',
          features: [
            'Everything in Free',
            'Additional doa lists',
            'Access to authentic prayers library',
            'Cloud synchronization',
          ],
          excluded: ['Custom backgrounds', 'Premium fonts'],
          popular: false,
        },
        {
          name: 'Complete',
          price: 'RM4.99',
          period: 'per doa',
          description: 'Everything you need for beautiful prayers',
          features: [
            'Everything in Free',
            'Additional doa lists',
            'More background image options',
            'Access to authentic prayers library',
            'Cloud synchronization',
          ],
          excluded: ['Premium fonts'],
          popular: true,
          badge: 'Most Popular',
        },
        {
          name: 'Unlimited Access',
          price: 'RM9.99',
          period: 'per month',
          description: 'Complete freedom to customize your spiritual journey',
          features: [
            'Everything in Complete',
            'Up to 50 doa lists',
            'Fonts customization',
            'All premium backgrounds',
            'Priority support',
            'Early access to new features',
          ],
          excluded: [],
          popular: false,
          badge: 'Best Value',
        },
      ],
      faq: [
        {
          question: 'Which plan is right for me?',
          answer:
            'Start with Free - it includes everything you need for basic prayer management! If you need more doa lists, choose Basic (RM3.99/doa). For beautiful designs, get Complete (RM4.99/doa). For maximum customization, go for Unlimited Access (RM9.99/month).',
        },
        {
          question: 'Is the Free plan really free forever?',
          answer:
            "Yes! The Free plan includes cloud sync and one personalized doa list at no cost. It's perfect for starting your spiritual journey without any commitment.",
        },
        {
          question: "What's the difference between Basic and Complete plans?",
          answer:
            'Basic (RM3.99) adds more doa lists to your account. Complete (RM4.99) includes everything in Basic PLUS more background image options for your prayers.',
        },
        {
          question: 'Is Unlimited Access worth it?',
          answer:
            'Absolutely! You get 50 doa lists, font customization, all premium backgrounds, priority support, and early access to new features for just RM9.99/month.',
        },
        {
          question: 'Is my data secure and synchronized?',
          answer:
            'Absolutely! All plans include cloud synchronization with 256-bit encryption. Your prayers and settings are automatically synced across all your devices.',
        },
        {
          question: 'Do you offer refunds?',
          answer:
            "Yes, we offer refunds within 14 working days if you haven't used any paid features. Please see our refund policy for details.",
        },
      ],
    },

    contact: {
      hero: {
        title: 'Get in Touch',
        subtitle: "We're here to support your spiritual journey",
      },
      information: {
        email: 'hazqeel@ellzaf.com',
        responseTime: 'We respond within 24 hours during business days',
        businessHours: 'Monday - Friday, 9:00 AM - 6:00 PM (MYT)',
        location: 'Based in Malaysia',
      },
      form: {
        fields: {
          name: 'Your Name',
          email: 'Email Address',
          subject: 'Subject',
          message: 'How can we help you?',
        },
        submitButton: 'Send Message',
        successMessage:
          "Thank you for your message. We'll get back to you soon!",
      },
    },

    terms: {
      hero: {
        title: 'Terms of Service',
        subtitle: 'Legal agreement for using GetDoa',
      },
      lastUpdated: 'Last updated: December 2024',
      sections: [
        {
          title: 'Acceptance of Terms',
          content:
            'By accessing and using GetDoa, you accept and agree to be bound by the terms and provision of this agreement.',
        },
        {
          title: 'Service Description',
          content:
            'GetDoa is a digital platform that provides access to Islamic prayers, supplications, and spiritual content. The service is offered on a subscription basis with various pricing tiers.',
        },
        {
          title: 'User Responsibilities',
          content:
            'Users are responsible for maintaining the confidentiality of their account credentials and for all activities that occur under their account.',
        },
        {
          title: 'Payment Terms',
          content:
            'Payment processing is handled through Razorpay Curlec. By subscribing to our services, you agree to their terms of service and payment policies.',
        },
        {
          title: 'Intellectual Property',
          content:
            'All content on GetDoa, including prayers, translations, and design elements, is protected by copyright and other intellectual property laws.',
        },
        {
          title: 'Limitation of Liability',
          content:
            'GetDoa shall not be liable for any indirect, incidental, special, consequential, or punitive damages arising from your use of the service.',
        },
        {
          title: 'Termination',
          content:
            'We may terminate or suspend your account and bar access to the service immediately, without prior notice or liability, under our sole discretion.',
        },
        {
          title: 'Governing Law',
          content:
            'These terms shall be interpreted and governed by the laws of Malaysia, without regard to its conflict of law provisions.',
        },
      ],
    },

    privacy: {
      hero: {
        title: 'Privacy Policy',
        subtitle: 'How we protect and handle your data',
      },
      lastUpdated: 'Last updated: December 2024',
      sections: [
        {
          title: 'Data Collection',
          content:
            'We collect information necessary to provide our services, including your email address, payment information, and usage data. Payment processing is handled securely through Razorpay Curlec.',
        },
        {
          title: 'Information Usage',
          content:
            'Your information is used to provide and improve our services, process payments, and communicate with you about your account and service updates.',
        },
        {
          title: 'Data Security',
          content:
            'We implement appropriate technical and organizational measures to protect your personal data against unauthorized access, alteration, disclosure, or destruction.',
        },
        {
          title: 'Payment Processing',
          content:
            'Payment information is processed securely through Razorpay Curlec. We do not store your complete payment details on our servers.',
        },
        {
          title: 'User Rights',
          content:
            'You have the right to access, update, or delete your personal information. Contact us at hazqeel@ellzaf.com to exercise these rights.',
        },
        {
          title: 'Cookies and Tracking',
          content:
            'We use essential cookies to provide basic functionality and analytics cookies to understand how our service is used.',
        },
        {
          title: 'Third-Party Services',
          content:
            'We may share information with trusted third-party service providers necessary for our operations, such as payment processing and analytics.',
        },
      ],
    },

    refund: {
      hero: {
        title: 'Refund Policy',
        subtitle: 'Our commitment to your satisfaction',
      },
      lastUpdated: 'Last updated: December 2024',
      eligibility: {
        title: 'Refund Eligibility',
        description:
          'You are eligible for a full refund if you have not used any paid features of your subscription.',
        criteria: [
          'Request must be made within 14 days of purchase',
          'No usage of paid features or services',
          'Valid reason for refund request',
          'Account in good standing',
        ],
      },
      process: {
        title: 'Refund Process',
        steps: [
          'Contact us at hazqeel@ellzaf.com with your refund request',
          'Provide your order number and reason for refund',
          'We review your request within 3-5 business days',
          'Refund is processed within 14 working days',
          'Refund timing depends on your payment provider',
        ],
      },
      timeline: {
        title: 'Processing Time',
        description:
          'Refunds are typically processed within 14 working days. The exact timing depends on your payment provider and may vary.',
        note: 'Please note that it may take additional time for the refund to appear in your account, depending on your bank or payment method.',
      },
    },
  },
}

export type LandingContent = typeof LANDING_CONTENT
