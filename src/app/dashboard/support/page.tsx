export default function SupportPage() {
  return (
    <div className="max-w-2xl">
      <div className="mb-8">
        <h1 className="text-2xl font-semibold tracking-tight" style={{ color: '#f5f5f5' }}>
          Support
        </h1>
        <p className="text-sm mt-1" style={{ color: '#888888' }}>
          Get help with your Vendly store.
        </p>
      </div>

      <div className="space-y-4">
        <a
          href="https://wa.me/2349168311809"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-5 p-5 rounded-xl border transition-colors"
          style={{ backgroundColor: '#1a1a1a', borderColor: '#2a2a2a' }}
        >
          <span className="text-3xl">💬</span>
          <div className="flex-1">
            <p className="text-sm font-semibold" style={{ color: '#f5f5f5' }}>
              WhatsApp Support
            </p>
            <p className="text-xs mt-0.5" style={{ color: '#888888' }}>
              Chat with our team on WhatsApp
            </p>
          </div>
          <span
            className="text-xs px-3 py-1.5 rounded-full font-semibold"
            style={{ backgroundColor: '#22c55e20', color: '#22c55e' }}
          >
            Open Chat →
          </span>
        </a>

        <div
          className="p-5 rounded-xl border"
          style={{ backgroundColor: '#1a1a1a', borderColor: '#2a2a2a' }}
        >
          <h2 className="text-sm font-semibold mb-4" style={{ color: '#f5f5f5' }}>
            Frequently Asked Questions
          </h2>
          <div className="space-y-4">
            {[
              {
                q: 'How do I activate my store?',
                a: "Go to the Subscription page. Click 'Activate Now' to pay via WhatsApp, or enter an activation code if you received one from Vendly.",
              },
              {
                q: 'How do I get my store URL?',
                a: 'Go to Store Settings and set your store slug. Your URL will be vendly.com/store/your-slug.',
              },
              {
                q: 'When do I get my referral commission?',
                a: 'Commissions are credited once a referred vendor successfully activates their store. You can request a withdrawal from the Referral Dashboard.',
              },
              {
                q: 'How long does withdrawal take?',
                a: 'Withdrawals are processed manually by our team within 1-3 business days.',
              },
              {
                q: 'Can customers pay on delivery?',
                a: "Yes! When customers checkout, they can choose 'Full Payment Before Delivery' or 'Payment On Delivery'.",
              },
            ].map((faq) => (
              <div
                key={faq.q}
                className="border-b pb-4 last:border-0 last:pb-0"
                style={{ borderColor: '#2a2a2a' }}
              >
                <p className="text-sm font-semibold mb-1" style={{ color: '#f5f5f5' }}>
                  {faq.q}
                </p>
                <p className="text-xs leading-relaxed" style={{ color: '#888888' }}>
                  {faq.a}
                </p>
              </div>
            ))}
          </div>
        </div>

        <div
          className="p-5 rounded-xl border"
          style={{ backgroundColor: '#1a1a1a', borderColor: '#2a2a2a' }}
        >
          <h2 className="text-sm font-semibold mb-2" style={{ color: '#f5f5f5' }}>
            Quick Links
          </h2>
          <div className="grid grid-cols-2 gap-3">
            {[
              { label: 'Manage Products', href: '/dashboard/products' },
              { label: 'View Orders', href: '/dashboard/orders' },
              { label: 'Subscription', href: '/dashboard/subscription' },
              { label: 'Referral Dashboard', href: '/dashboard/referrals' },
            ].map((l) => (
              <a
                key={l.href}
                href={l.href}
                className="text-xs py-2 px-3 rounded-lg border transition-colors text-center"
                style={{ borderColor: '#2a2a2a', color: '#888888' }}
              >
                {l.label}
              </a>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
