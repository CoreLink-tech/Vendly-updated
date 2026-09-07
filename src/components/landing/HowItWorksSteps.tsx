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
    <div className="relative">
      {/* Desktop horizontal connector line */}
      <div
        className="hidden md:block absolute top-5 left-[calc(12.5%+20px)] right-[calc(12.5%+20px)] h-px"
        style={{ backgroundColor: landing.line }}
      />

      <div className="grid grid-cols-1 md:grid-cols-4 gap-x-8 gap-y-10">
        {STEPS.map((s, i) => (
          <div key={s.title} className="relative flex md:flex-col gap-4 md:gap-0">
            {/* Step number */}
            <div className="flex md:justify-center shrink-0">
              <div
                className="relative z-10 w-10 h-10 rounded-full flex items-center justify-center text-sm font-semibold"
                style={{
                  ...displayFont,
                  backgroundColor: landing.green,
                  color: landing.paper,
                  boxShadow: '0 0 0 6px ' + landing.paperDim,
                }}
              >
                {i + 1}
              </div>
            </div>

            {/* Mobile vertical connector */}
            {i < STEPS.length - 1 && (
              <div
                className="md:hidden absolute left-5 top-10 bottom-[-24px] w-px -translate-x-1/2"
                style={{ backgroundColor: landing.line }}
              />
            )}

            <div className="pt-0.5 md:pt-6 md:text-center">
              <h3 className="text-base font-semibold mb-1.5" style={{ color: landing.ink }}>
                {s.title}
              </h3>
              <p className="text-sm leading-relaxed max-w-[220px] md:mx-auto" style={{ color: landing.cocoa }}>
                {s.desc}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
