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
  payment_intent_id: string;
  paymentIntentId?: string; // Alternative camelCase field name
  user_id: string;
  userId?: string; // Alternative camelCase field name
  package_id: string;
  packageId?: string; // Alternative camelCase field name
}

const corsHeaders = {
  // Set the specific origin for the current application
  'Access-Control-Allow-Origin': '*', // Use wildcard for testing to ensure no CORS issues
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-cors',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS, PUT, DELETE',
  'Access-Control-Allow-Credentials': 'true',
};

serve(async (req: Request) => {
  console.log('--- Verifying Stripe Payment ---');
  console.log('Request Method:', req.method);

  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    console.log('Handling OPTIONS preflight request');
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    console.log('Request Headers:', JSON.stringify(Array.from(req.headers).reduce((obj, [key, value]) => {
      obj[key] = value;
      return obj;
    }, {}), null, 2));

    // Log the raw request
    const clonedReq = req.clone();
    const rawRequest = await clonedReq.text();
    console.log('Raw request body:', rawRequest);

    let requestBody: any;
    try {
      // Attempt to parse the JSON body
      requestBody = JSON.parse(rawRequest);
    } catch (jsonError) {
      console.error('Failed to parse request body as JSON:', jsonError);
      return new Response(
        JSON.stringify({ error: 'Invalid JSON in request body' }),
        { status: 400, headers: corsHeaders }
      );
    }

    console.log('Successfully parsed request body:', JSON.stringify(requestBody, null, 2));

    // Handle both snake_case and camelCase field names and do verbose logging
    const payment_intent_id = requestBody.payment_intent_id || requestBody.paymentIntentId || '';
    const user_id = requestBody.user_id || requestBody.userId || '';
    const package_id = requestBody.package_id || requestBody.packageId || '';
    
    // Log the exact values received from the client
    console.log('Raw field values from request:', { 
      payment_intent_id_raw: requestBody.payment_intent_id, 
      paymentIntentId_raw: requestBody.paymentIntentId,
      user_id_raw: requestBody.user_id, 
      userId_raw: requestBody.userId,
      package_id_raw: requestBody.package_id, 
      packageId_raw: requestBody.packageId
    });

    console.log('Normalized field values:', { payment_intent_id, user_id, package_id });

    // Check if required fields are present - with more lenient validation
    let missingFields = [];
    if (!payment_intent_id) missingFields.push('payment_intent_id');
    // Make user_id optional - the Edge Function will work without it
    // if (!user_id) missingFields.push('user_id');
    if (!package_id) missingFields.push('package_id');
    
    if (missingFields.length > 0) {
      console.error('Missing required fields in request body:', { 
        missingFields,
        payment_intent_id, 
        user_id, 
        package_id,
        originalBody: JSON.stringify(requestBody)
      });
      return new Response(
        JSON.stringify({ 
          error: 'Missing required fields', 
          missingFields,
          details: { payment_intent_id, user_id, package_id },
          originalBody: requestBody 
        }),
        { status: 400, headers: corsHeaders }
      );
    }

    const STRIPE_SECRET_KEY = Deno.env.get('STRIPE_SECRET_KEY')!;
    const PROJECT_URL = Deno.env.get('PROJECT_URL') || 'https://wdbcwawakmyijhbwbdkt.supabase.co';
    const SERVICE_ROLE_KEY = Deno.env.get('SERVICE_ROLE_KEY')!;

    // Check if environment variables are available
    if (!STRIPE_SECRET_KEY || !SERVICE_ROLE_KEY) {
      console.error('Missing environment variables:', {
        hasStripeKey: !!STRIPE_SECRET_KEY,
        hasServiceKey: !!SERVICE_ROLE_KEY
      });
      return new Response(
        JSON.stringify({ error: 'Server configuration error' }),
        { status: 500, headers: corsHeaders }
      );
    }

    // For production, all users should go through the same verification flow
    // No special handling for test users

    try {
      // Initialize Stripe
      const stripe = new Stripe(STRIPE_SECRET_KEY, {
        apiVersion: '2022-11-15',
      });

      // Initialize Supabase client
      const supabase = createClient(PROJECT_URL, SERVICE_ROLE_KEY);

      try {
        // Retrieve the payment intent from Stripe to verify its status
        console.log('Retrieving payment intent from Stripe:', payment_intent_id);
        const paymentIntent = await stripe.paymentIntents.retrieve(payment_intent_id);

        console.log('Payment intent retrieved:', {
          id: paymentIntent.id,
          status: paymentIntent.status
        });

        // Check if payment intent is successful
        if (paymentIntent.status !== 'succeeded') {
          return new Response(
            JSON.stringify({ error: `Payment not completed. Status: ${paymentIntent.status}` }),
            { status: 400, headers: corsHeaders }
          );
        }

        // Verify the package exists and get the XCE amount
        console.log('Looking up package:', package_id);
        const { data: pkg, error: pkgErr } = await supabase
          .from('xce_packages')
          .select('xce_amount')
          .eq('id', package_id)
          .single();

        if (pkgErr) {
          console.error('Package lookup error:', pkgErr);
        }

        if (!pkg) {
          return new Response(
            JSON.stringify({ error: 'Invalid package' }),
            { status: 400, headers: corsHeaders }
          );
        }

        // Ensure the amount is an integer before passing to RPC
        const creditsToGive = Math.floor(pkg.xce_amount);

        // Update payment record
        const { error: updateErr } = await supabase
          .from('stripe_payments')
          .update({ status: 'succeeded' })
          .eq('payment_intent_id', payment_intent_id);

        if (updateErr) {
          console.error('Error updating payment record:', updateErr);
        }

        // Add credits to user's account
        console.log('Calling RPC to complete purchase with:', {
          p_user_id: user_id,
          p_package_id: package_id,
          p_payment_id: payment_intent_id,
          p_amount: creditsToGive
        });
        
        try {
          // Make the RPC call less strict with parameter requirements
          let rpcParams: any = {
            p_package_id: package_id,
            p_payment_id: payment_intent_id,
            p_amount: creditsToGive
          };
          
          // Only include user_id if it exists to avoid null/undefined errors
          if (user_id && user_id.trim() !== '') {
            rpcParams.p_user_id = user_id;
          } else {
            console.log('No user_id provided, using default anonymous user flow');
          }
          
          console.log('Final RPC params:', rpcParams);
          const { error } = await supabase.rpc('complete_xce_purchase', rpcParams);
        

          if (error) {
            console.error('RPC failed:', error);
            return new Response(
              JSON.stringify({ 
                error: 'Failed to add credits', 
                details: error.message || 'Unknown database error',
                code: error.code
              }),
              { status: 500, headers: corsHeaders }
            );
          }
        } catch (dbError) {
          console.error('Database operation error:', dbError);
          return new Response(
            JSON.stringify({ 
              error: 'Database operation failed', 
              details: dbError instanceof Error ? dbError.message : 'Unknown error'
            }),
            { status: 500, headers: corsHeaders }
          );
        }

        return new Response(
          JSON.stringify({ success: true }),
          { status: 200, headers: corsHeaders }
        );
      } catch (stripeError) {
        console.error('Stripe API error:', stripeError);

        // In production, we handle all Stripe API errors the same way
        // with detailed error logging

        return new Response(
          JSON.stringify({ 
            error: 'Error verifying payment with Stripe',
            details: stripeError.message || 'Unknown Stripe error'
          }),
          { status: 500, headers: corsHeaders }
        );
      }
    } catch (functionError) {
      console.error('Function execution error:', functionError);
      return new Response(
        JSON.stringify({ 
          error: 'Server error during payment verification',
          details: functionError.message || 'Unknown error' 
        }),
        { status: 500, headers: corsHeaders }
      );
    }
  } catch (err) {
    console.error('Error verifying payment:', err);
    return new Response(
      JSON.stringify({ error: 'Server error' }),
      { status: 500, headers: corsHeaders }
    );
  }
});
