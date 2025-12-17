import { Verified } from 'lucide-react'
import { LANDING_CONTENT } from '@/lib/constants'

export function QRCodeSection() {
  return (
    <section className="max-w-4xl mx-auto px-4 sm:px-6 pb-20">
      <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-3xl p-8 sm:p-12 text-center text-white relative overflow-hidden shadow-2xl">
        {/* Background decoration */}
        <div className="absolute top-0 left-0 w-64 h-64 bg-teal-500/20 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2"></div>
        <div className="absolute bottom-0 right-0 w-64 h-64 bg-emerald-500/20 rounded-full blur-3xl translate-x-1/2 translate-y-1/2"></div>

        {/* Content */}
        <div className="relative z-10 space-y-6">
          <h2 className="text-2xl sm:text-3xl font-serif font-medium">
            {LANDING_CONTENT.qrCode.title}
          </h2>

          <p className="text-slate-300 max-w-xl mx-auto">
            {LANDING_CONTENT.qrCode.description}
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-6 pt-4">
            {/* QR Code */}
            <div className="bg-white p-3 rounded-xl shadow-lg">
              <img
                src={LANDING_CONTENT.qrCode.qrImageUrl}
                alt="Donation QR Code"
                className="w-32 h-32 object-contain mix-blend-multiply"
                loading="lazy"
              />
            </div>

            {/* Organization Info */}
            <div className="text-left space-y-2">
              <h3 className="font-bold text-lg">
                {LANDING_CONTENT.qrCode.organization}
              </h3>

              <div className="flex items-center gap-2 text-sm text-slate-300">
                <Verified className="w-4 h-4" />
                {LANDING_CONTENT.qrCode.verification}
              </div>

              <p className="text-xs text-slate-400 max-w-xs">
                {LANDING_CONTENT.qrCode.instructions}
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
