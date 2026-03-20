function normalizeOrigin(value?: string | null) {
  return value?.trim().replace(/\/$/, '') || ''
}

function isLocalOrigin(value: string) {
  try {
    const hostname = new URL(value).hostname
    return hostname === 'localhost' || hostname === '127.0.0.1'
  } catch {
    return false
  }
}

export function getGoogleOAuthConfigError(currentOrigin: string) {
  const configuredOrigin = normalizeOrigin(process.env.NEXT_PUBLIC_APP_URL)
  const activeOrigin = normalizeOrigin(currentOrigin)

  if (!configuredOrigin || !activeOrigin || configuredOrigin === activeOrigin) {
    return null
  }

  if (isLocalOrigin(configuredOrigin) && !isLocalOrigin(activeOrigin)) {
    return null
  }

  return `Google sign-in is configured for ${configuredOrigin}. Open the app there, or update NEXT_PUBLIC_APP_URL, NEXTAUTH_URL, and your Google OAuth settings to allow ${activeOrigin}/api/auth/callback/google.`
}
