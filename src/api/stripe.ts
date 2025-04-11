import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

/**
 * Creates a payment intent for a specific package purchase
 */
export async function createPaymentIntent(
  packageId: string, 
  amount: number, 
  currency: string = 'usd'
) {
  try {
    // Call our Supabase Edge Function to create a payment intent
    const { data, error } = await supabase.functions.invoke('create-stripe-payment-intent', {
      body: {
        package_id: packageId,
        amount: amount * 100, // Convert to cents
        currency
      }
    });

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error creating payment intent:', error);
    throw error;
  }
}

/**
 * Confirms a payment was successful and adds credits to user account
 */
export async function confirmPayment(
  paymentIntentId: string,
  userId: string,
  packageId: string
) {
  try {
    // Call our Supabase Edge Function to verify the payment and add credits
    const { data, error } = await supabase.functions.invoke('verify-stripe-payment', {
      body: {
        payment_intent_id: paymentIntentId,
        user_id: userId,
        package_id: packageId
      }
    });

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error confirming payment:', error);
    throw error;
  }
}

/**
 * Handle webhook events from Stripe
 * (This would be implemented on the server side, not in browser)
 */
export async function handleWebhook(event: any, signature: string) {
  try {
    // This would be handled in your Supabase Edge Function
    const { data, error } = await supabase.functions.invoke('stripe-webhook', {
      body: {
        event,
        signature
      }
    });

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error processing Stripe webhook:', error);
    throw error;
  }
}
