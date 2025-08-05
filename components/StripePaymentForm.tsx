'use client';

import { useState, useEffect } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { STRIPE_PUBLISHABLE_KEY } from '@/lib/stripe';

const stripePromise = loadStripe(STRIPE_PUBLISHABLE_KEY);

interface StripePaymentFormProps {
  clientSecret: string;
  amount: number;
  onSuccess: () => void;
  onError: (error: string) => void;
  loading: boolean;
}

export default function StripePaymentForm({ 
  clientSecret, 
  amount, 
  onSuccess, 
  onError, 
  loading 
}: StripePaymentFormProps) {
  const [stripe, setStripe] = useState<any>(null);
  const [elements, setElements] = useState<any>(null);
  const [cardError, setCardError] = useState<string>('');
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    const initializeStripe = async () => {
      const stripeInstance = await stripePromise;
      setStripe(stripeInstance);

      if (stripeInstance && clientSecret) {
        const elementsInstance = stripeInstance.elements({
          clientSecret,
          appearance: {
            theme: 'stripe',
            variables: {
              colorPrimary: '#2563eb',
              colorBackground: '#ffffff',
              colorText: '#374151',
              colorDanger: '#ef4444',
              fontFamily: 'system-ui, sans-serif',
              borderRadius: '8px',
            }
          }
        });
        setElements(elementsInstance);
      }
    };

    initializeStripe();
  }, [clientSecret]);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!stripe || !elements || processing) {
      return;
    }

    setProcessing(true);
    setCardError('');

    const result = await stripe.confirmPayment({
      elements,
      redirect: 'if_required',
    });

    if (result.error) {
      setCardError(result.error.message || 'Payment failed');
      onError(result.error.message || 'Payment failed');
    } else {
      onSuccess();
    }

    setProcessing(false);
  };

  if (!stripe || !elements) {
    return (
      <div className="flex items-center justify-center p-8">
        <i className="ri-loader-4-line w-6 h-6 flex items-center justify-center animate-spin text-blue-600 mr-2"></i>
        <span className="text-gray-600">Loading payment form...</span>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="bg-blue-50 rounded-lg p-4">
        <div className="flex items-center gap-3 mb-3">
          <i className="ri-shield-check-line w-6 h-6 flex items-center justify-center text-blue-600"></i>
          <h4 className="font-semibold text-blue-900">Secure Payment</h4>
        </div>
        <p className="text-sm text-blue-700 mb-4">
          Your payment information is encrypted and secure. We use Stripe for processing.
        </p>
        <div className="flex items-center gap-2 text-xs text-blue-600">
          <i className="ri-lock-line w-4 h-4 flex items-center justify-center"></i>
          <span>SSL Encrypted • PCI Compliant</span>
        </div>
      </div>

      <div>
        <div id="payment-element" className="p-4 border border-gray-300 rounded-lg">
          {elements && (
            <div ref={(ref) => {
              if (ref && elements) {
                const paymentElement = elements.create('payment');
                paymentElement.mount(ref);
              }
            }} />
          )}
        </div>
      </div>

      {cardError && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center gap-2">
            <i className="ri-error-warning-line w-5 h-5 flex items-center justify-center text-red-500"></i>
            <span className="text-red-700 text-sm">{cardError}</span>
          </div>
        </div>
      )}

      <button
        type="submit"
        disabled={!stripe || processing || loading}
        className="w-full bg-blue-600 hover:bg-blue-700 text-white py-4 rounded-lg text-lg font-semibold transition-colors disabled:opacity-50 cursor-pointer whitespace-nowrap flex items-center justify-center gap-2"
      >
        {processing || loading ? (
          <>
            <i className="ri-loader-4-line w-5 h-5 flex items-center justify-center animate-spin"></i>
            Processing Payment...
          </>
        ) : (
          <>
            <i className="ri-bank-card-line w-5 h-5 flex items-center justify-center"></i>
            Pay ${amount}
          </>
        )}
      </button>

      <div className="text-center text-sm text-gray-500">
        <p>Powered by <span className="font-semibold">Stripe</span></p>
      </div>
    </form>
  );
}