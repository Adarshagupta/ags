function normalizeOrigin(value?: string | null) {
  return value?.trim().replace(/\/$/, '') || ''
}

export function getGoogleOAuthConfigError(currentOrigin: string) {
  const configuredOrigin = normalizeOrigin(process.env.NEXT_PUBLIC_APP_URL)
  const activeOrigin = normalizeOrigin(currentOrigin)

  if (!configuredOrigin || !activeOrigin || configuredOrigin === activeOrigin) {
    return null
  }

  return `Google sign-in is configured for ${configuredOrigin}. Open the app there, or update NEXT_PUBLIC_APP_URL, NEXTAUTH_URL, and your Google OAuth settings to allow ${activeOrigin}/api/auth/callback/google.`
}
