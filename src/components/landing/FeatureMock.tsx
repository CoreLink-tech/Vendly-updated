import type { ReactNode } from 'react';
import Image from 'next/image';
import { theme, displayFont } from '@/lib/theme';

const frameStyle = {
  backgroundColor: theme.bg,
  border: `1px solid ${theme.line}`,
};

function Frame({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div
      className="rounded-[24px] overflow-hidden landing-soft-shadow"
      style={frameStyle}
    >
      <div
        className="px-4 py-2.5 flex items-center gap-2"
        style={{ borderBottom: `1px solid ${theme.line}` }}
      >
        <span
          className="w-1.5 h-1.5 rounded-full"
          style={{ backgroundColor: theme.green }}
        />
        <p className="text-[11px] font-medium" style={{ color: theme.cocoa }}>
          {label}
        </p>
      </div>
      <div className="p-4">{children}</div>
    </div>
  );
}

export function StorefrontMock() {
  const images = [
    '/products/perfume.jpg',
    '/products/tote.jpg',
    '/products/slides.jpg',
  ];
  return (
    <Frame label="vendly.app/store/nkiru">
      <div className="flex items-center justify-between mb-3">
        <p className="text-[13px] font-semibold" style={{ ...displayFont, color: theme.ink }}>
          Nkiru &amp; Co.
        </p>
        <span
          className="text-[9px] font-medium px-2 py-1 rounded-full"
          style={{ backgroundColor: theme.greenSoft, color: theme.green }}
        >
          Open
        </span>
      </div>
      <div className="grid grid-cols-3 gap-2">
        {images.map((src, i) => (
          <div key={i} className="aspect-square rounded-xl overflow-hidden relative">
            <Image
              src={src}
              alt=""
              fill
              sizes="100px"
              quality={70}
              loading="lazy"
              className="object-cover"
            />
          </div>
        ))}
      </div>
    </Frame>
  );
}

export function ProductsMock() {
  const rows = [
    { name: 'Eau de Parfum 50ml', stock: '18 in stock', price: '₦10,500', image: '/products/perfume.jpg' },
    { name: 'Woven Tote Bag', stock: '6 in stock', price: '₦6,400', image: '/products/tote.jpg' },
    { name: 'Ankara Slides', stock: '3 in stock', price: '₦10,000', image: '/products/slides.jpg' },
  ];
  return (
    <Frame label="Products · 47">
      <div className="space-y-2.5">
        {rows.map((r) => (
          <div key={r.name} className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg shrink-0 overflow-hidden relative">
              <Image
                src={r.image}
                alt=""
                fill
                sizes="32px"
                quality={65}
                loading="lazy"
                className="object-cover"
              />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-[11px] font-medium truncate" style={{ color: theme.ink }}>
                {r.name}
              </p>
              <p className="text-[9px]" style={{ color: theme.cocoa }}>
                {r.stock}
              </p>
            </div>
            <p className="text-[11px] font-semibold shrink-0" style={{ color: theme.green }}>
              {r.price}
            </p>
          </div>
        ))}
        <div className="flex items-center gap-1.5 pt-1">
          <span className="text-[9px]" style={{ color: theme.cocoa }}>
            + 44 more
          </span>
        </div>
      </div>
    </Frame>
  );
}

export function OrdersMock() {
  const stages = ['Received', 'Accepted', 'Prepared', 'Delivered'];
  return (
    <Frame label="Order #1042">
      <div className="flex items-center">
        {stages.map((s, i) => (
          <div key={s} className="flex items-center flex-1 last:flex-none">
            <div className="flex flex-col items-center gap-1.5">
              <span
                className="w-4 h-4 rounded-full flex items-center justify-center"
                style={{ backgroundColor: i < 3 ? theme.green : theme.line }}
              />
              <p className="text-[8px] text-center leading-tight w-14" style={{ color: i < 3 ? theme.ink : theme.cocoa }}>{s}</p>
            </div>
            {i < stages.length - 1 && (
              <span className="h-px flex-1 -mt-4" style={{ backgroundColor: i < 2 ? theme.green : theme.line }} />
            )}
          </div>
        ))}
      </div>
      <div className="mt-4 pt-3 flex items-center justify-between" style={{ borderTop: `1px solid ${theme.line}` }}>
        <p className="text-[9px]" style={{ color: theme.cocoa }}>Route: Ikeja → Yaba</p>
        <p className="text-[10px] font-semibold" style={{ color: theme.ink }}>₦1,500 delivery</p>
      </div>
    </Frame>
  );
}

export function PaymentsMock() {
  return (
    <Frame label="Checkout">
      <div className="flex gap-2 mb-3">
        <div className="flex-1 rounded-xl p-2.5" style={{ backgroundColor: theme.green }}>
          <p className="text-[9px] font-semibold" style={{ color: theme.bg }}>Pay now</p>
          <p className="text-[8px] mt-1" style={{ color: 'rgba(255,254,251,0.75)' }}>Card, bank, transfer</p>
        </div>
        <div className="flex-1 rounded-xl p-2.5" style={{ border: `1px solid ${theme.line}` }}>
          <p className="text-[9px] font-semibold" style={{ color: theme.ink }}>On delivery</p>
          <p className="text-[8px] mt-1" style={{ color: theme.cocoa }}>Pay when it arrives</p>
        </div>
      </div>
      <div className="flex items-center justify-between text-[10px]" style={{ color: theme.cocoa }}>
        <span>You keep</span>
        <span className="font-semibold" style={{ color: theme.ink }}>100% — no commission</span>
      </div>
    </Frame>
  );
}

export function AnalyticsMock() {
  return (
    <Frame label="This month">
      <div className="flex items-end justify-between mb-3">
        <div>
          <p className="text-[9px]" style={{ color: theme.cocoa }}>Revenue</p>
          <p className="text-[18px] font-semibold" style={{ ...displayFont, color: theme.ink }}>₦1.24m</p>
        </div>
        <span className="text-[9px] font-medium px-2 py-1 rounded-full" style={{ backgroundColor: theme.orangeSoft, color: theme.orange }}>+18%</span>
      </div>
      <div className="flex items-end gap-1.5 h-14">
        {[35, 55, 40, 70, 60, 85, 50, 95, 65, 75, 90, 100].map((h, i) => (
          <span key={i} className="flex-1 rounded-[2px]" style={{ height: `${h}%`, backgroundColor: i === 11 ? theme.green : theme.greenSoft }} />
        ))}
      </div>
    </Frame>
  );
}

export function CustomersMock() {
  const rows = [
    { name: 'Amaka O.', orders: '9 orders', spent: '₦94,000' },
    { name: 'Tunde B.', orders: '4 orders', spent: '₦41,200' },
    { name: 'Grace E.', orders: '2 orders', spent: '₦18,900' },
  ];
  return (
    <Frame label="Customers · 213">
      <div className="space-y-2.5">
        {rows.map((r) => (
          <div key={r.name} className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-full shrink-0 flex items-center justify-center text-[9px] font-semibold" style={{ backgroundColor: theme.greenSoft, color: theme.green }}>
              {r.name[0]}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-[11px] font-medium truncate" style={{ color: theme.ink }}>{r.name}</p>
              <p className="text-[9px]" style={{ color: theme.cocoa }}>{r.orders}</p>
            </div>
            <p className="text-[10px] font-semibold shrink-0" style={{ color: theme.ink }}>{r.spent}</p>
          </div>
        ))}
      </div>
    </Frame>
  );
}
