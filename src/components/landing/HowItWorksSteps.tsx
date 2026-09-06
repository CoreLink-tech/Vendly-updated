import { landing, displayFont } from '@/lib/landing-theme';

const STEPS = [
  {
    title: 'Create your store',
    desc: 'Sign up and claim your link — vendly.app/store/your-name is yours from day one.',
  },
  {
    title: 'Add products',
    desc: 'Upload photos, prices, and stock. One product or a hundred, no limit either way.',
  },
  {
    title: 'Share your link',
    desc: 'Drop it into WhatsApp or Instagram. No app for customers to download.',
  },
  {
    title: 'Receive orders',
    desc: 'Orders land in your dashboard. Track them from received through delivered.',
  },
];

export function HowItWorksSteps() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-x-6 gap-y-10">
      {STEPS.map((s, i) => (
        <div key={s.title} className="flex md:block gap-4">
          {/* Mobile: vertical connector */}
          <div className="flex md:hidden flex-col items-center shrink-0">
            <div
              className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-semibold shrink-0"
              style={{ ...displayFont, backgroundColor: landing.green, color: landing.paper }}
            >
              {i + 1}
            </div>
            {i < STEPS.length - 1 && <span className="w-px flex-1 mt-2" style={{ backgroundColor: landing.line }} />}
          </div>
          {/* Desktop: horizontal connector */}
          <div className="hidden md:flex items-center w-full">
            <div
              className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-semibold shrink-0"
              style={{ ...displayFont, backgroundColor: landing.green, color: landing.paper }}
            >
              {i + 1}
            </div>
            {i < STEPS.length - 1 && <span className="h-px flex-1 ml-3" style={{ backgroundColor: landing.line }} />}
          </div>
          <div className="pt-0.5 md:pt-5 md:pr-6 pb-2 md:pb-0">
            <h3 className="text-base font-semibold mb-1.5" style={{ color: landing.ink }}>{s.title}</h3>
            <p className="text-sm leading-relaxed" style={{ color: landing.cocoa }}>{s.desc}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
