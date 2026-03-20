type DodoCheckoutSessionResponse = {
  session_id: string
  checkout_url: string
}

type DodoPaymentResponse = {
  payment_id: string
  status: string | null
  total_amount: number
  currency: string
  metadata?: Record<string, unknown>
}

type CreateDodoCheckoutSessionInput = {
  amountInMinor: number
  returnUrl: string
  customer: {
    email: string
    name?: string | null
    phoneNumber?: string | null
  }
  billingAddress?: {
    street?: string | null
    city?: string | null
    state?: string | null
    zipcode?: string | null
    country?: string | null
  }
  metadata?: Record<string, string>
}

function getDodoBaseUrl() {
  return process.env.DODO_PAYMENTS_ENVIRONMENT === 'live_mode'
    ? 'https://live.dodopayments.com'
    : 'https://test.dodopayments.com'
}

function getDodoCheckoutCurrency() {
  return (process.env.DODO_PAYMENTS_CURRENCY || 'NPR').toUpperCase()
}

function getDodoCheckoutCountry() {
  return (process.env.DODO_PAYMENTS_COUNTRY || 'NP').toUpperCase()
}

function getDodoConfig() {
  const apiKey = process.env.DODO_PAYMENTS_API_KEY
  const productId = process.env.DODO_PAYMENTS_PRODUCT_ID

  if (!apiKey) {
    throw new Error('DODO_PAYMENTS_API_KEY is not configured')
  }

  if (!productId) {
    throw new Error('DODO_PAYMENTS_PRODUCT_ID is not configured')
  }

  return { apiKey, productId }
}

async function dodoRequest<T>(path: string, init: RequestInit): Promise<T> {
  const { apiKey } = getDodoConfig()
  const response = await fetch(`${getDodoBaseUrl()}${path}`, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
      ...(init.headers || {}),
    },
    cache: 'no-store',
  })

  const payload = await response.json().catch(() => null)

  if (!response.ok) {
    const message =
      payload?.message ||
      payload?.error ||
      payload?.details ||
      'Dodo Payments request failed'
    throw new Error(message)
  }

  return payload as T
}

export function isDodoConfigured() {
  return Boolean(process.env.DODO_PAYMENTS_API_KEY && process.env.DODO_PAYMENTS_PRODUCT_ID)
}

export async function createDodoCheckoutSession({
  amountInMinor,
  returnUrl,
  customer,
  billingAddress,
  metadata,
}: CreateDodoCheckoutSessionInput) {
  const { productId } = getDodoConfig()
  const currency = getDodoCheckoutCurrency()
  const country = getDodoCheckoutCountry()

  return dodoRequest<DodoCheckoutSessionResponse>('/checkouts', {
    method: 'POST',
    body: JSON.stringify({
      product_cart: [
        {
          product_id: productId,
          quantity: 1,
          amount: amountInMinor,
        },
      ],
      customer: {
        email: customer.email,
        name: customer.name || undefined,
        phone_number: customer.phoneNumber || undefined,
      },
      billing_address: billingAddress
        ? {
            street: billingAddress.street || undefined,
            city: billingAddress.city || undefined,
            state: billingAddress.state || undefined,
            zipcode: billingAddress.zipcode || undefined,
            country: billingAddress.country || country,
          }
        : undefined,
      billing_currency: currency,
      feature_flags: {
        redirect_immediately: true,
      },
      return_url: returnUrl,
      metadata,
    }),
  })
}

export async function retrieveDodoPayment(paymentId: string) {
  return dodoRequest<DodoPaymentResponse>(`/payments/${paymentId}`, {
    method: 'GET',
  })
}
