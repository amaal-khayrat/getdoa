import { Crown, Lock, Palette, Type, Sparkles, Image, FileText } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { SubscribeButton } from './subscribe-button'

interface PremiumSettingsPanelProps {
  userId: string
  isPremium: boolean
  isAdminGranted?: boolean
}

const PREMIUM_FEATURES = [
  {
    icon: FileText,
    title: '30 Prayers per List',
    description: 'Double the free limit of 15',
  },
  {
    icon: Type,
    title: 'Premium Fonts',
    description: 'Amiri, Scheherazade, Noto Naskh Arabic',
  },
  {
    icon: Palette,
    title: 'Custom Colors',
    description: 'Background, text, and translation colors',
  },
  {
    icon: Sparkles,
    title: 'Custom Branding',
    description: 'Personal watermark, remove GetDoa branding',
  },
  {
    icon: Image,
    title: 'Decorative Patterns',
    description: '20 beautiful Islamic patterns',
  },
]

export function PremiumSettingsPanel({
  userId,
  isPremium,
  isAdminGranted = false,
}: PremiumSettingsPanelProps) {
  if (isPremium) {
    return (
      <Card className="border-amber-500/30 bg-gradient-to-br from-amber-500/5 to-yellow-500/5">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Crown className="w-5 h-5 text-amber-500" />
              Premium Features Unlocked
            </CardTitle>
            <Badge className="bg-amber-500 text-white">
              {isAdminGranted ? 'Granted' : 'Active'}
            </Badge>
          </div>
          <CardDescription>Customize your doa images with premium features</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid sm:grid-cols-2 gap-3">
            {PREMIUM_FEATURES.map((feature) => (
              <div
                key={feature.title}
                className="flex items-start gap-3 p-3 rounded-lg bg-background/50"
              >
                <div className="p-2 rounded-lg bg-amber-500/10">
                  <feature.icon className="w-4 h-4 text-amber-600" />
                </div>
                <div>
                  <p className="font-medium text-sm">{feature.title}</p>
                  <p className="text-xs text-muted-foreground">{feature.description}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Lock className="w-5 h-5 text-muted-foreground" />
          Premium Features
        </CardTitle>
        <CardDescription>Unlock advanced customization options</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid sm:grid-cols-2 gap-3">
          {PREMIUM_FEATURES.map((feature) => (
            <div
              key={feature.title}
              className="flex items-start gap-3 p-3 rounded-lg bg-muted/30 opacity-60"
            >
              <div className="p-2 rounded-lg bg-muted">
                <feature.icon className="w-4 h-4 text-muted-foreground" />
              </div>
              <div>
                <p className="font-medium text-sm">{feature.title}</p>
                <p className="text-xs text-muted-foreground">{feature.description}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="pt-2">
          <SubscribeButton userId={userId} isPremium={false} variant="full" />
          <p className="text-xs text-muted-foreground text-center mt-2">
            +50 extra doa lists + all premium features
          </p>
        </div>
      </CardContent>
    </Card>
  )
}
