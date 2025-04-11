/// <reference lib="deno.ns" />
/// <reference lib="deno.unstable" />

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import Stripe from 'https://esm.sh/stripe@11.17.0?dts';

declare const Deno: {
  env: {
    get(key: string): string | undefined;
  };
};

interface RequestBody {
  package_id: string;
  amount: number;
  currency: string;
}

const corsHeaders = {
  // Set the specific origin for the current application
  'Access-Control-Allow-Origin': 'http://localhost:5173',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    console.log('Request received for payment intent creation');
    
    // Parse and validate the request body
    let package_id, amount, currency;
    try {
      const body = await req.json() as RequestBody;
      package_id = body.package_id;
      amount = body.amount;
      currency = body.currency;
      
      console.log('Request data:', { package_id, amount, currency });
      
      // Validate required fields
      if (!package_id || !amount || !currency) {
        throw new Error('Missing required fields');
      }
    } catch (parseError) {
      console.error('Failed to parse request body:', parseError);
      return new Response(
        JSON.stringify({ error: 'Invalid request format' }),
        { status: 400, headers: corsHeaders }
      );
    }
    
    // Log the environment variables (without revealing the full keys)
    const stripeKey = Deno.env.get('STRIPE_SECRET_KEY');
    const projectUrl = Deno.env.get('PROJECT_URL') || 'https://wdbcwawakmyijhbwbdkt.supabase.co';
    const serviceKey = Deno.env.get('SERVICE_ROLE_KEY');
    
    console.log('Environment check:', { 
      hasStripeKey: !!stripeKey,
      stripeKeyPrefix: stripeKey ? stripeKey.substring(0, 7) : 'missing',
      projectUrl,
      hasServiceKey: !!serviceKey,
      serviceKeyLength: serviceKey ? serviceKey.length : 0
    });
    
    // Get the required secrets from environment variables
    // IMPORTANT: We're NOT using fallback values for production keys
    const STRIPE_SECRET_KEY = Deno.env.get('STRIPE_SECRET_KEY');
    if (!STRIPE_SECRET_KEY || !STRIPE_SECRET_KEY.startsWith('sk_')) {
      console.error('Invalid or missing Stripe Secret Key');
      return new Response(
        JSON.stringify({ error: 'Server configuration error: Invalid Stripe key' }),
        { status: 500, headers: corsHeaders }
      );
    }
    
    const PROJECT_URL = Deno.env.get('PROJECT_URL') || 'https://wdbcwawakmyijhbwbdkt.supabase.co';
    const SERVICE_ROLE_KEY = Deno.env.get('SERVICE_ROLE_KEY');
    if (!SERVICE_ROLE_KEY) {
      console.error('Missing Supabase Service Role Key');
      return new Response(
        JSON.stringify({ error: 'Server configuration error: Missing database credentials' }),
        { status: 500, headers: corsHeaders }
      );
    }
    
    console.log('Initializing Stripe and Supabase clients...');
    
    try {
      // Initialize Stripe with the latest API version
      const stripe = new Stripe(STRIPE_SECRET_KEY, {
        apiVersion: '2023-10-16',
      });
      
      // Initialize Supabase client
      const supabase = createClient(PROJECT_URL, SERVICE_ROLE_KEY);
      
      console.log('Creating payment intent...');
      // Create a payment intent
      const paymentIntent = await stripe.paymentIntents.create({
        amount: amount,
        currency: currency.toLowerCase(),
        automatic_payment_methods: {
          enabled: true,
        },
        metadata: {
          package_id: package_id,
        },
      });
      
      console.log('Payment intent created successfully:', { 
        id: paymentIntent.id,
        status: paymentIntent.status,
        hasClientSecret: !!paymentIntent.client_secret 
      });
    
      console.log('Recording payment intent in database...');
      
      // Create a record of the payment intent
      const { error: dbError } = await supabase
        .from('stripe_payments')
        .insert({
          payment_intent_id: paymentIntent.id,
          package_id: package_id,
          amount: amount,
          currency: currency.toLowerCase(),
          status: paymentIntent.status,
        });
      
      if (dbError) {
        console.error('Error creating payment record:', dbError);
        // We'll continue even if DB insert fails - the payment can still work
        // Just log the error but don't fail the request
        console.log('Continuing despite database error');
      } else {
        console.log('Payment record created in database');
      }
    
      // Return the client secret to the client
      console.log('Returning client secret to frontend');
      return new Response(
        JSON.stringify({ 
          clientSecret: paymentIntent.client_secret,
          paymentIntentId: paymentIntent.id
        }),
        { status: 200, headers: corsHeaders }
      );
    } catch (stripeError: any) {
      console.error('Stripe API error:', stripeError);
      return new Response(
        JSON.stringify({ 
          error: 'Stripe API error', 
          message: stripeError.message || 'Unknown Stripe error',
          type: stripeError.type || 'unknown'
        }),
        { status: 500, headers: corsHeaders }
      );
    }
    
  } catch (err: any) {
    console.error('Unhandled error in Edge Function:', err);
    return new Response(
      JSON.stringify({ 
        error: 'Failed to create payment intent',
        message: err.message || 'Unknown error',
        timestamp: new Date().toISOString()
      }),
      { status: 500, headers: corsHeaders }
    );
  }
});
