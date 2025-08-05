
'use client';

// Store Stripe keys in lib folder as requested
export const STRIPE_PUBLISHABLE_KEY = 'pk_test_51RrUe7GtFjZNBwkU3SXBw72VgdtRTV6gscaylFomiJA6bW1UnoBef4wm45u1rtdtFnhT6xDSPEqd6oBHUQ4dwZSa00XKOTzmo3';

export const createPaymentIntent = async (amount: number, fullName: string, email: string) => {
  try {
    const response = await fetch('https://zzjggtbvbdgorrpiocsp.supabase.co/functions/v1/create-payment-intent', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY}`
      },
      body: JSON.stringify({
        amount,
        fullName,
        email
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to create payment intent');
    }

    return await response.json();
  } catch (error) {
    console.error('Payment intent error:', error);
    throw error;
  }
};

export const sendConfirmationEmail = async (
  email: string, 
  fullName: string, 
  registrationType: string, 
  numberOfSpaces: number, 
  totalAmount: number
) => {
  try {
    const response = await fetch('https://zzjggtbvbdgorrpiocsp.supabase.co/functions/v1/send-confirmation-email', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY}`
      },
      body: JSON.stringify({
        email,
        fullName,
        registrationType,
        numberOfSpaces,
        totalAmount
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to send confirmation email');
    }

    return await response.json();
  } catch (error) {
    console.error('Email sending error:', error);
    throw error;
  }
};