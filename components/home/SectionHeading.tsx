import Link from 'next/link'

type SectionHeadingProps = {
  eyebrow?: string
  title: string
  description?: string
  href?: string
  ctaLabel?: string
  align?: 'left' | 'center'
}

export default function SectionHeading({
  eyebrow,
  title,
  description,
  href,
  ctaLabel = 'View all',
  align = 'left',
}: SectionHeadingProps) {
  const isCenter = align === 'center'

  return (
    <div
      className={`flex flex-row items-start justify-between gap-3 sm:items-end ${
        isCenter ? 'sm:flex-col sm:items-center sm:text-center' : ''
      }`}
    >
      <div className={isCenter ? 'mx-auto max-w-xl' : ''}>
        {eyebrow ? (
          <p className="mb-1.5 flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.28em] text-gold">
            <span className="h-px w-6 bg-gold/60" />
            {eyebrow}
          </p>
        ) : null}
        <h2 className="font-display text-2xl font-semibold leading-tight text-ink sm:text-[28px]">{title}</h2>
        {description ? <p className="mt-1.5 text-sm text-ink/55">{description}</p> : null}
      </div>

      {href ? (
        <Link
          href={href}
          className="group inline-flex flex-shrink-0 items-center gap-1.5 self-start whitespace-nowrap rounded-full border border-wine/15 bg-white px-4 py-2 text-xs font-semibold uppercase tracking-[0.15em] text-wine transition hover:border-wine/40 hover:bg-wine hover:text-white sm:self-auto"
        >
          {ctaLabel}
          <svg
            className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="m9 5 7 7-7 7" />
          </svg>
        </Link>
      ) : null}
    </div>
  )
}
