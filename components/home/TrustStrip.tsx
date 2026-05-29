const features = [
  {
    title: 'Same-Day Delivery',
    copy: 'Order before the cut-off and we deliver today, right on time.',
    icon: (
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 13h12l3-4h3v6h-2m-2 0a2 2 0 1 1-4 0m4 0a2 2 0 1 0-4 0m-7 0a2 2 0 1 1-4 0m4 0a2 2 0 1 0-4 0M3 7h9v6" />
    ),
  },
  {
    title: 'Freshly Curated',
    copy: 'Hand-arranged flowers and bakery-fresh cakes, every single order.',
    icon: (
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8a4 4 0 1 0 0 8 4 4 0 0 0 0-8Zm0 0V4m0 16v-4m4-4h4M4 12h4m9.66-5.66-2.83 2.83M9.17 14.83l-2.83 2.83m11.32 0-2.83-2.83M9.17 9.17 6.34 6.34" />
    ),
  },
  {
    title: 'Secure Checkout',
    copy: 'Protected payments and a satisfaction guarantee on every gift.',
    icon: (
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 3l7 3v5c0 4.5-3 8-7 10-4-2-7-5.5-7-10V6l7-3Zm-2.5 8.5 1.8 1.8 3.7-3.8" />
    ),
  },
  {
    title: 'Always Here',
    copy: 'Friendly support to help you find the perfect surprise.',
    icon: (
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5Z" />
    ),
  },
]

export default function TrustStrip() {
  return (
    <section className="grid grid-cols-2 gap-3 rounded-[30px] border border-wine/10 bg-white p-4 sm:p-6 lg:grid-cols-4">
      {features.map((feature) => (
        <div
          key={feature.title}
          className="flex flex-col gap-2 rounded-[22px] bg-cream/60 p-4 transition hover:bg-cream"
        >
          <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white text-wine shadow-[0_12px_28px_-22px_rgba(124,42,71,0.8)]">
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {feature.icon}
            </svg>
          </span>
          <h3 className="font-display text-base font-semibold text-ink">{feature.title}</h3>
          <p className="text-xs leading-relaxed text-ink/55">{feature.copy}</p>
        </div>
      ))}
    </section>
  )
}
