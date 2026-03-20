'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { useCartStore } from '@/lib/store/cart'

type ReturnState = 'verifying' | 'success' | 'processing' | 'failed' | 'error'

export default function DodoReturnPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const clearCart = useCartStore((state) => state.clearCart)
  const [state, setState] = useState<ReturnState>('verifying')
  const [message, setMessage] = useState('Verifying your payment...')

  useEffect(() => {
    const orderId = searchParams.get('orderId')
    const paymentId = searchParams.get('payment_id')
    const status = searchParams.get('status')

    if (!orderId || !paymentId) {
      setState('error')
      setMessage('Missing payment details. Please check your orders page.')
      return
    }

    let isActive = true

    async function confirmPayment() {
      try {
        const response = await fetch('/api/payments/dodo/confirm', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            orderId,
            paymentId,
            status,
          }),
        })

        const data = await response.json()

        if (!response.ok) {
          throw new Error(data.details || data.error || 'Failed to confirm payment')
        }

        if (!isActive) {
          return
        }

        if (data.paymentStatus === 'COMPLETED') {
          clearCart()
          setState('success')
          setMessage('Payment completed. Redirecting to your orders...')
          window.setTimeout(() => {
            router.replace('/orders')
          }, 1200)
          return
        }

        if (data.paymentStatus === 'PENDING') {
          setState('processing')
          setMessage('Your payment is still processing. We will keep your order updated.')
          window.setTimeout(() => {
            router.replace(`/orders/${orderId}`)
          }, 1800)
          return
        }

        setState('failed')
        setMessage('Payment was not completed. You can try again from checkout.')
      } catch (error: any) {
        if (!isActive) {
          return
        }
        setState('error')
        setMessage(error?.message || 'Failed to verify payment')
      }
    }

    void confirmPayment()

    return () => {
      isActive = false
    }
  }, [clearCart, router, searchParams])

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#f4f7fb] px-4">
      <div className="w-full max-w-md rounded-3xl bg-white p-6 text-center shadow-[0_24px_60px_-36px_rgba(15,23,42,0.35)]">
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-[#eef5ff] text-[#2563eb]">
          {state === 'failed' || state === 'error' ? (
            <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18 18 6M6 6l12 12" />
            </svg>
          ) : state === 'success' ? (
            <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="m5 13 4 4L19 7" />
            </svg>
          ) : (
            <div className="h-6 w-6 animate-spin rounded-full border-2 border-current border-t-transparent" />
          )}
        </div>

        <h1 className="text-xl font-semibold text-slate-900">
          {state === 'success'
            ? 'Payment Successful'
            : state === 'processing'
              ? 'Payment Processing'
              : state === 'failed'
                ? 'Payment Failed'
                : state === 'error'
                  ? 'Verification Error'
                  : 'Verifying Payment'}
        </h1>

        <p className="mt-3 text-sm text-slate-600">{message}</p>

        {(state === 'failed' || state === 'error') && (
          <div className="mt-5 flex justify-center gap-3">
            <Link
              href="/checkout"
              className="rounded-xl bg-slate-900 px-4 py-2 text-sm font-medium text-white"
            >
              Back to Checkout
            </Link>
            <Link
              href="/orders"
              className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700"
            >
              View Orders
            </Link>
          </div>
        )}
      </div>
    </main>
  )
}
