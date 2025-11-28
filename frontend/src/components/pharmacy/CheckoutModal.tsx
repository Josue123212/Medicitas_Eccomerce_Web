import React from 'react'
import { loadStripe } from '@stripe/stripe-js'
import { Elements, useStripe, useElements, CardElement } from '@stripe/react-stripe-js'
import { ecommerceService } from '../../services/ecommerceService'

// el publishable key debe existir; si no, mostramos un aviso en el modal

type Props = {
  isOpen: boolean
  onClose: () => void
  onSuccess: (orderId: number) => void
}

const CheckoutForm: React.FC<{ onSuccess: (orderId: number) => void; onClose: () => void }> = ({ onSuccess, onClose }) => {
  const stripe = useStripe()
  const elements = useElements()
  const [loading, setLoading] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!stripe || !elements) return
    setLoading(true)
    setError(null)
    try {
      const { client_secret, order } = await ecommerceService.createStripePaymentIntent()
      const card = elements.getElement(CardElement)
      if (!card) throw new Error('Card element not found')
      const result = await stripe.confirmCardPayment(client_secret, { payment_method: { card } })
      if (result.error) {
        setError(result.error.message || 'Payment failed')
        setLoading(false)
        return
      }
      onSuccess(order?.id)
      onClose()
    } catch (err: any) {
      setError(err?.message || 'Payment error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="p-3 border rounded">
        <CardElement options={{ hidePostalCode: true }} />
      </div>
      <button className="btn-primary px-4 py-2 rounded" disabled={loading}>
        {loading ? 'Procesando…' : 'Pagar'}
      </button>
      {error && <p className="text-red-600 text-sm">{error}</p>}
    </form>
  )
}

const CheckoutModal: React.FC<Props> = ({ isOpen, onClose, onSuccess }) => {
  if (!isOpen) return null
  const pk = import.meta.env.VITE_STRIPE_PUBLIC_KEY as string | undefined
  if (!pk) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-black/40">
        <div className="bg-white rounded-xl p-6 w-full max-w-md">
          <h2 className="text-lg font-semibold mb-2">Pago con tarjeta</h2>
          <p className="text-sm" style={{ color: '#555' }}>
            Configura VITE_STRIPE_PUBLIC_KEY en frontend/.env y reinicia el servidor de desarrollo.
          </p>
          <div className="mt-4 text-right">
            <button className="btn-outline px-3 py-2 rounded" onClick={onClose}>Cerrar</button>
          </div>
        </div>
      </div>
    )
  }
  const stripePromise = loadStripe(pk)
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/40">
      <div className="bg-white rounded-xl p-6 w-full max-w-md">
        <h2 className="text-lg font-semibold mb-4">Pago con tarjeta</h2>
        <Elements stripe={stripePromise}>
          <CheckoutForm onSuccess={onSuccess} onClose={onClose} />
        </Elements>
        <div className="mt-4 text-right">
          <button className="btn-outline px-3 py-2 rounded" onClick={onClose}>Cerrar</button>
        </div>
      </div>
    </div>
  )
}

export default CheckoutModal
