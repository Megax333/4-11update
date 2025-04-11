/// <reference lib="deno.ns" />
/// <reference lib="deno.unstable" />

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

declare const Deno: {
  env: {
    get(key: string): string | undefined;
  };
};

interface RequestBody {
  order_id: string;
  user_id: string;
  package_id: string;
}

const corsHeaders = {
  // Set the specific origin for the current application
  'Access-Control-Allow-Origin': 'http://localhost:5173',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { order_id, user_id, package_id } = await req.json() as RequestBody

    const PAYPAL_CLIENT_ID = Deno.env.get('PAYPAL_CLIENT_ID')!
    const PAYPAL_SECRET = Deno.env.get('PAYPAL_SECRET')!
    const PROJECT_URL = Deno.env.get('PROJECT_URL') || 'https://wdbcwawakmyijhbwbdkt.supabase.co'
    const SERVICE_ROLE_KEY = Deno.env.get('SERVICE_ROLE_KEY')!

    const supabase = createClient(PROJECT_URL, SERVICE_ROLE_KEY)

    const auth = btoa(`${PAYPAL_CLIENT_ID}:${PAYPAL_SECRET}`)

    const tokenRes = await fetch('https://api-m.sandbox.paypal.com/v1/oauth2/token', {
      method: 'POST',
      headers: {
        Authorization: `Basic ${auth}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: 'grant_type=client_credentials',
    })

    const tokenData = await tokenRes.json()
    const accessToken = tokenData.access_token

    const orderRes = await fetch(`https://api-m.sandbox.paypal.com/v2/checkout/orders/${order_id}`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    })

    const orderData = await orderRes.json()

    if (
      orderData.status !== 'COMPLETED' ||
      orderData.purchase_units[0].payments.captures[0].status !== 'COMPLETED'
    ) {
      return new Response(JSON.stringify({ error: 'Payment not completed' }), {
        status: 400,
        headers: corsHeaders,
      })
    }

    // ✅ NEW: fetch package to get actual XCE amount
    const { data: pkg, error: pkgErr } = await supabase
      .from('xce_packages')
      .select('xce_amount')
      .eq('id', package_id)
      .single()

    if (pkgErr || !pkg) {
      return new Response(JSON.stringify({ error: 'Invalid package' }), {
        status: 400,
        headers: corsHeaders,
      })
    }

    // Ensure the amount is an integer before passing to RPC
    const creditsToGive = Math.floor(pkg.xce_amount)
    const paymentId = orderData.id

    const { error } = await supabase.rpc('complete_xce_purchase', {
      p_user_id: user_id,
      p_package_id: package_id,
      p_payment_id: paymentId,
      p_amount: creditsToGive,
    })

    if (error) {
      console.error('RPC failed:', error)
      return new Response(JSON.stringify({ error: 'Failed to add credits' }), {
        status: 500,
        headers: corsHeaders,
      })
    }

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: corsHeaders,
    })
  } catch (err) {
    console.error('Error verifying payment:', err)
    return new Response(JSON.stringify({ error: 'Server error' }), {
      status: 500,
      headers: corsHeaders,
    })
  }
})
