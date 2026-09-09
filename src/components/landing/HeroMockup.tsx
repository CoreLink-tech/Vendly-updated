import Image from 'next/image';
import { theme, displayFont } from '@/lib/theme';

// The hero visual is Vendly's own product UI: a phone running a live
// storefront, with product/order cards breaking out of the frame.

const PRODUCTS = [
  {
    name: 'Eau de Parfum 50ml',
    price: '₦10,500',
    image: '/products/perfume.jpg',
  },
  {
    name: 'Woven Tote Bag',
    price: '₦6,400',
    image: '/products/tote.jpg',
  },
  {
    name: 'Ankara Slides',
    price: '₦10,000',
    image: '/products/slides.jpg',
  },
  {
    name: 'Shea Body Butter',
    price: '₦4,200',
    image: '/products/bodybutter.jpg',
  },
];

export function HeroMockup() {
  return (
    <div className="relative mx-auto w-full max-w-[420px] h-[520px] sm:h-[560px]">
      {/* Phone: live storefront */}
      <div
        className="absolute left-1/2 top-0 -translate-x-1/2 w-[240px] sm:w-[264px] h-[500px] sm:h-[540px] rounded-[36px] p-2.5 shadow-[0_30px_60px_-15px_rgba(9,63,39,0.35)]"
        style={{ backgroundColor: theme.ink }}
      >
        <div
          className="h-full w-full rounded-[26px] overflow-hidden flex flex-col"
          style={{ backgroundColor: theme.greenDeep }}
        >
          {/* status notch */}
          <div className="h-6 flex items-center justify-center shrink-0">
            <div className="w-16 h-4 rounded-full" style={{ backgroundColor: theme.ink }} />
          </div>
          {/* store header */}
          <div className="px-3 pb-3 shrink-0">
            <p
              className="text-[13px] font-semibold tracking-tight"
              style={{ ...displayFont, color: theme.bg }}
            >
              Nkiru &amp; Co.
            </p>
            <div className="flex gap-1.5 mt-2">
              <span
                className="text-[9px] font-medium px-2 py-1 rounded-full"
                style={{ color: theme.bg, border: `1px solid ${theme.lineOnDark}` }}
              >
                Track order
              </span>
              <span
                className="text-[9px] font-medium px-2 py-1 rounded-full flex items-center gap-1"
                style={{ backgroundColor: theme.orange, color: theme.bg }}
              >
                Cart · 2
              </span>
            </div>
          </div>
          {/* product grid */}
          <div className="flex-1 bg-[#FFFEFB] rounded-t-[18px] px-2.5 pt-3 grid grid-cols-2 gap-2 content-start overflow-hidden">
            {PRODUCTS.map((p, index) => (
              <div
                key={p.name}
                className="rounded-[14px] overflow-hidden"
                style={{ border: `1px solid ${theme.line}` }}
              >
                <div className="h-16 relative overflow-hidden">
                  <Image
                    src={p.image}
                    alt={p.name}
                    fill
                    sizes="120px"
                    quality={75}
                    priority={index < 2}
                    className="object-cover"
                  />
                </div>
                <div className="px-2 py-1.5">
                  <p
                    className="text-[8.5px] font-medium leading-tight truncate"
                    style={{ color: theme.ink }}
                  >
                    {p.name}
                  </p>
                  <div className="flex items-center justify-between mt-1">
                    <span className="text-[9px] font-semibold" style={{ color: theme.green }}>
                      {p.price}
                    </span>
                    <span
                      className="text-[8px] font-semibold px-1.5 py-0.5 rounded-full"
                      style={{ backgroundColor: theme.greenDeep, color: theme.bg }}
                    >
                      Add
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Floating: product page */}
      <div
        className="hidden sm:flex absolute left-[-8%] top-[14%] w-[150px] rounded-[20px] p-3 items-start gap-2.5 bg-white shadow-[0_18px_36px_-12px_rgba(22,31,26,0.18)]"
        style={{ border: `1px solid ${theme.line}` }}
      >
        <div className="w-9 h-9 rounded-lg shrink-0 overflow-hidden relative">
          <Image
            src="/products/slides.jpg"
            alt="Ankara Slides"
            fill
            sizes="36px"
            quality={70}
            priority
            className="object-cover"
          />
        </div>
        <div className="min-w-0">
          <p className="text-[10px] font-medium leading-tight" style={{ color: theme.ink }}>
            Ankara Slides
          </p>
          <p className="text-[10px] font-semibold mt-0.5" style={{ color: theme.green }}>
            ₦10,000
          </p>
          <p className="text-[8px] mt-0.5" style={{ color: theme.cocoa }}>
            Size 40 · 3 in stock
          </p>
        </div>
      </div>

      {/* Floating: order dashboard */}
      <div
        className="absolute right-[-4%] sm:right-[-10%] top-[6%] w-[148px] rounded-[20px] p-3.5 bg-white shadow-[0_18px_36px_-12px_rgba(22,31,26,0.18)]"
        style={{ border: `1px solid ${theme.line}` }}
      >
        <p className="text-[9px]" style={{ color: theme.cocoa }}>
          Today
        </p>
        <p
          className="text-[17px] font-semibold mt-0.5"
          style={{ ...displayFont, color: theme.ink }}
        >
          ₦86,200
        </p>
        <div className="flex items-end gap-1 h-7 mt-2">
          {[40, 65, 50, 90, 70, 100, 60].map((h, i) => (
            <span
              key={i}
              className="flex-1 rounded-[2px]"
              style={{
                height: `${h}%`,
                backgroundColor: i === 5 ? theme.orange : theme.greenSoft,
              }}
            />
          ))}
        </div>
        <p className="text-[8px] mt-2" style={{ color: theme.cocoa }}>
          12 orders
        </p>
      </div>

      {/* Floating: checkout */}
      <div
        className="absolute left-1/2 -translate-x-1/2 bottom-0 sm:bottom-2 w-[210px] rounded-[20px] p-3.5 bg-white shadow-[0_18px_40px_-10px_rgba(22,31,26,0.22)]"
        style={{ border: `1px solid ${theme.line}` }}
      >
        <div className="flex items-center justify-between">
          <p className="text-[10px] font-medium" style={{ color: theme.ink }}>
            Order total
          </p>
          <p
            className="text-[13px] font-semibold"
            style={{ ...displayFont, color: theme.ink }}
          >
            ₦20,900
          </p>
        </div>
        <div className="flex gap-1.5 mt-2.5">
          <span
            className="text-[8.5px] font-semibold px-2.5 py-1.5 rounded-lg flex-1 text-center"
            style={{ backgroundColor: theme.green, color: theme.bg }}
          >
            Pay now
          </span>
          <span
            className="text-[8.5px] font-medium px-2.5 py-1.5 rounded-lg flex-1 text-center"
            style={{ border: `1px solid ${theme.line}`, color: theme.ink }}
          >
            On delivery
          </span>
        </div>
      </div>
    </div>
  );
}
