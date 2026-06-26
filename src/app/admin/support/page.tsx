export default function AdminSupportPage() {
  return (
    <div className="max-w-2xl">
      <div className="mb-8">
        <h1 className="text-2xl font-semibold tracking-tight" style={{ color: '#f5f5f5' }}>
          Support
        </h1>
        <p className="text-sm mt-1" style={{ color: '#888888' }}>
          Admin support resources and tools.
        </p>
      </div>

      <div className="space-y-4">
        <div
          className="p-6 rounded-xl border"
          style={{ backgroundColor: '#1a1a1a', borderColor: '#2a2a2a' }}
        >
          <h2 className="text-sm font-semibold mb-4" style={{ color: '#f5f5f5' }}>
            Admin Quick Actions
          </h2>
          <div className="grid grid-cols-2 gap-3">
            {[
              { label: 'Generate Activation Codes', href: '/admin/activations' },
              { label: 'Activate Vendor', href: '/admin/vendors' },
              { label: 'Approve Withdrawals', href: '/admin/withdrawals' },
              { label: 'Review Ambassadors', href: '/admin/ambassadors' },
              { label: 'Manage Logistics', href: '/admin/logistics' },
              { label: 'View All Orders', href: '/admin/orders' },
            ].map((a) => (
              <a
                key={a.href}
                href={a.href}
                className="text-xs py-2.5 px-3 rounded-lg border text-center transition-colors"
                style={{ borderColor: '#2a2a2a', color: '#888888' }}
              >
                {a.label}
              </a>
            ))}
          </div>
        </div>

        <div
          className="p-6 rounded-xl border"
          style={{ backgroundColor: '#1a1a1a', borderColor: '#2a2a2a' }}
        >
          <h2 className="text-sm font-semibold mb-3" style={{ color: '#f5f5f5' }}>
            Contact & Notifications
          </h2>
          <p className="text-xs mb-2" style={{ color: '#888888' }}>
            Ambassador applications and vendor enquiries are sent to:
          </p>
          <div
            className="flex items-center gap-3 p-3 rounded-lg"
            style={{ backgroundColor: '#0d0d0d' }}
          >
            <span className="flex items-center justify-center"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5"><rect x="5" y="2" width="14" height="20" rx="2" ry="2"/><line x1="12" y1="18" x2="12.01" y2="18"/></svg></span>
            <div>
              <p className="text-sm font-semibold" style={{ color: '#f5f5f5' }}>
                WhatsApp: 09168311809
              </p>
              <p className="text-xs" style={{ color: '#888888' }}>
                Admin notification number
              </p>
            </div>
          </div>
        </div>

        <div
          className="p-6 rounded-xl border"
          style={{ backgroundColor: '#1a1a1a', borderColor: '#2a2a2a' }}
        >
          <h2 className="text-sm font-semibold mb-3" style={{ color: '#f5f5f5' }}>
            Platform Info
          </h2>
          <div className="space-y-2 text-xs">
            {[
              ['Monthly Plan', '₦4,000/month'],
              ['Yearly Plan', '₦40,000/year'],
              ['Monthly Referral Commission', '₦1,000 (25%)'],
              ['Yearly Referral Commission', '₦10,000 (25%)'],
              ['Ambassador Commission', '₦1,000/renewal (monthly)'],
            ].map(([k, v]) => (
              <div key={k} className="flex justify-between" style={{ color: '#888888' }}>
                <span style={{ color: '#555555' }}>{k}</span>
                <span style={{ color: '#f5f5f5' }}>{v}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
