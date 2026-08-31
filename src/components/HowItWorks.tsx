'use client';

import { useEffect, useRef, useState } from 'react';
import { NavIcon, type IconName } from '@/components/NavIcon';
import { landing, displayFont } from '@/lib/landing-theme';

interface Step {
  label: string;
  icon: IconName;
  title: string;
  desc: string;
}

const STEPS: Step[] = [
  {
    label: 'Create your store',
    icon: 'key',
    title: 'Sign up and claim your link',
    desc: 'Register in minutes and name your business. You get a unique storefront URL — vendly.com/store/your-name — that\u2019s yours from day one.',
  },
  {
    label: 'Customize your look',
    icon: 'settings',
    title: 'Make it look like you',
    desc: 'Add your logo, write your store description, and pick your brand colors. Every change previews live, so you see exactly what customers will see.',
  },
  {
    label: 'Add your products',
    icon: 'package',
    title: 'List what you sell',
    desc: 'Upload products with photos, pricing, categories, and stock counts. Add one or add a hundred \u2014 there\u2019s no limit.',
  },
  {
    label: 'Share & sell',
    icon: 'link',
    title: 'Send your link, take orders',
    desc: 'Share your store link anywhere \u2014 WhatsApp, Instagram, wherever your customers are. They browse, add to cart, and check out. No app to download.',
  },
  {
    label: 'Manage every order',
    icon: 'truck',
    title: 'Track orders start to finish',
    desc: 'Follow each order through the pipeline \u2014 received, accepted, prepared, and delivered \u2014 with logistics coordination built in.',
  },
  {
    label: 'Get paid & grow',
    icon: 'money',
    title: 'Keep 100%, grow at your pace',
    desc: 'Payments come straight to you \u2014 no commissions. Watch your sales in a real-time dashboard, and earn more by referring other vendors.',
  },
];

const SLIDE_MS = 5500;
const onDark = { text: landing.paper, sub: 'rgba(255,252,244,0.72)', faint: 'rgba(255,252,244,0.45)', line: 'rgba(255,252,244,0.14)', hover: 'rgba(255,252,244,0.06)' };

export default function HowItWorks() {
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);
  const [progressKey, setProgressKey] = useState(0);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (paused) return;
    timeoutRef.current = setTimeout(() => {
      setActive((i) => (i + 1) % STEPS.length);
      setProgressKey((k) => k + 1);
    }, SLIDE_MS);
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [active, paused]);

  const goTo = (i: number) => {
    setActive(((i % STEPS.length) + STEPS.length) % STEPS.length);
    setProgressKey((k) => k + 1);
  };

  const step = STEPS[active];

  return (
    <section
      className="px-6 md:px-12 py-20"
      style={{ backgroundColor: landing.paper }}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <div className="max-w-6xl mx-auto">
        <h2 className="text-3xl md:text-[2.5rem] font-semibold mb-14 max-w-xl" style={displayFont}>
          From sign-up to sold, in six steps
        </h2>

        <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-8 lg:gap-12 items-start">
          {/* Step list — desktop */}
          <div className="hidden lg:flex flex-col gap-1">
            {STEPS.map((s, i) => {
              const isActive = i === active;
              return (
                <button
                  key={s.label}
                  onClick={() => goTo(i)}
                  className="text-left px-4 py-3.5 rounded-lg transition-colors relative overflow-hidden"
                  style={{ backgroundColor: isActive ? landing.paperDim : 'transparent' }}
                >
                  {isActive && (
                    <span className="absolute left-0 top-0 bottom-0 w-0.5" style={{ backgroundColor: landing.orange }} />
                  )}
                  <div className="flex items-center gap-3">
                    <span className="text-xs w-5 shrink-0" style={{ color: isActive ? landing.orange : landing.cocoa }}>
                      {String(i + 1).padStart(2, '0')}
                    </span>
                    <span className="text-sm font-medium" style={{ color: isActive ? landing.ink : landing.cocoa }}>
                      {s.label}
                    </span>
                  </div>
                  {isActive && (
                    <div className="mt-2.5 ml-8 h-0.5 rounded-full overflow-hidden" style={{ backgroundColor: landing.line }}>
                      <div
                        key={progressKey}
                        className="h-full rounded-full"
                        style={{
                          backgroundColor: landing.orange,
                          animation: paused ? 'none' : `howItWorksProgress ${SLIDE_MS}ms linear forwards`,
                        }}
                      />
                    </div>
                  )}
                </button>
              );
            })}
          </div>

          {/* Slide */}
          <div className="rounded-2xl p-8 md:p-12 min-h-[420px] flex flex-col" style={{ backgroundColor: landing.ink }}>
            <div className="flex items-start justify-between mb-8">
              <div className="flex items-center justify-center w-12 h-12 rounded-xl" style={{ backgroundColor: 'rgba(245,130,10,0.16)', color: landing.orange }}>
                <NavIcon name={step.icon} />
              </div>
              <span className="text-xs" style={{ color: onDark.faint }}>
                {String(active + 1).padStart(2, '0')} / {String(STEPS.length).padStart(2, '0')}
              </span>
            </div>

            <h3 className="text-2xl md:text-3xl font-semibold mb-3" style={{ ...displayFont, color: onDark.text }}>
              {step.title}
            </h3>
            <p className="text-sm md:text-base leading-relaxed max-w-lg mb-8" style={{ color: onDark.sub }}>
              {step.desc}
            </p>

            <div className="mt-auto">
              <StepMockup index={active} />
            </div>
          </div>
        </div>

        {/* Step list — mobile: dots + swipe-free tap targets */}
        <div className="flex lg:hidden items-center justify-center gap-2 mt-8">
          {STEPS.map((s, i) => (
            <button
              key={s.label}
              onClick={() => goTo(i)}
              aria-label={s.label}
              className="h-1.5 rounded-full transition-all"
              style={{ width: i === active ? 24 : 8, backgroundColor: i === active ? landing.orange : landing.line }}
            />
          ))}
        </div>

        {/* Prev / next controls */}
        <div className="flex items-center justify-center gap-3 mt-8">
          <button
            onClick={() => goTo(active - 1)}
            aria-label="Previous step"
            className="w-9 h-9 rounded-full border flex items-center justify-center"
            style={{ borderColor: landing.line, color: landing.cocoa }}
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4"><polyline points="15 18 9 12 15 6"/></svg>
          </button>
          <button
            onClick={() => goTo(active + 1)}
            aria-label="Next step"
            className="w-9 h-9 rounded-full border flex items-center justify-center"
            style={{ borderColor: landing.line, color: landing.cocoa }}
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4"><polyline points="9 18 15 12 9 6"/></svg>
          </button>
        </div>
      </div>

      <style>{`
        @keyframes howItWorksProgress {
          from { width: 0%; }
          to { width: 100%; }
        }
      `}</style>
    </section>
  );
}

// Small illustrative mockups per step — echoing real Vendly UI (color
// preview, product cards, order pipeline) rather than generic icon art.
function StepMockup({ index }: { index: number }) {
  switch (index) {
    case 0:
      return (
        <div className="rounded-lg p-4 flex items-center gap-3" style={{ backgroundColor: onDark.hover }}>
          <div className="w-8 h-8 rounded-lg shrink-0" style={{ backgroundColor: 'rgba(245,130,10,0.18)' }} />
          <code className="text-xs md:text-sm" style={{ color: landing.orange }}>vendly.com/store/your-name</code>
        </div>
      );
    case 1:
      return (
        <div className="flex items-center gap-3">
          {[landing.orange, landing.sky, landing.green, landing.orangeDeep].map((c) => (
            <div key={c} className="w-8 h-8 rounded-full border-2" style={{ backgroundColor: c, borderColor: c === landing.orange ? landing.paper : 'transparent' }} />
          ))}
          <span className="text-xs ml-2" style={{ color: onDark.faint }}>Live preview updates instantly</span>
        </div>
      );
    case 2:
      return (
        <div className="flex gap-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="w-16 rounded-lg overflow-hidden" style={{ border: `1px solid ${onDark.line}` }}>
              <div className="aspect-square" style={{ backgroundColor: onDark.hover }} />
              <div className="h-2 mt-1.5 mb-1 mx-1.5 rounded-full" style={{ backgroundColor: onDark.line, width: '70%' }} />
              <div className="h-1.5 mb-1.5 mx-1.5 rounded-full" style={{ backgroundColor: landing.orange, width: '40%' }} />
            </div>
          ))}
        </div>
      );
    case 3:
      return (
        <div className="flex items-center gap-3 text-xs" style={{ color: onDark.sub }}>
          <span className="px-3 py-1.5 rounded-lg" style={{ backgroundColor: onDark.hover, border: `1px solid ${onDark.line}` }}>WhatsApp</span>
          <span className="px-3 py-1.5 rounded-lg" style={{ backgroundColor: onDark.hover, border: `1px solid ${onDark.line}` }}>Instagram</span>
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke={landing.orange} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
          <span className="px-3 py-1.5 rounded-lg font-medium" style={{ backgroundColor: landing.orange, color: landing.ink }}>Order placed</span>
        </div>
      );
    case 4: {
      const stages = ['Received', 'Accepted', 'Prepared', 'Delivered'];
      return (
        <div className="flex items-center">
          {stages.map((s, i) => (
            <div key={s} className="flex items-center">
              <div className="flex flex-col items-center gap-1.5">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: i <= 2 ? landing.orange : onDark.line }} />
                <span className="text-[10px] whitespace-nowrap" style={{ color: i <= 2 ? onDark.sub : onDark.faint }}>{s}</span>
              </div>
              {i < stages.length - 1 && (
                <div className="w-8 md:w-12 h-0.5 mx-1 mb-4" style={{ backgroundColor: i < 2 ? landing.orange : onDark.line }} />
              )}
            </div>
          ))}
        </div>
      );
    }
    case 5:
      return (
        <div className="flex items-end gap-1.5 h-12">
          {[40, 65, 45, 80, 60, 95].map((h, i) => (
            <div key={i} className="w-4 rounded-t" style={{ height: `${h}%`, backgroundColor: i === 5 ? landing.orange : onDark.line }} />
          ))}
        </div>
      );
    default:
      return null;
  }
}
