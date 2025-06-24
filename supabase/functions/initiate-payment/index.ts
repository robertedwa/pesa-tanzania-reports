
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface PaymentRequest {
  amount: number;
  phoneNumber: string;
  paymentMethod: string;
  contributorName: string;
  purpose?: string;
}

const supabase = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
);

const handler = async (req: Request): Promise<Response> => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { amount, phoneNumber, paymentMethod, contributorName, purpose }: PaymentRequest = await req.json();
    
    console.log('Initiating payment:', { amount, phoneNumber, paymentMethod, contributorName });

    // First, store the contribution as pending
    const { data: contribution, error: dbError } = await supabase
      .from('contributions')
      .insert({
        contributor_name: contributorName,
        amount: amount,
        phone_number: phoneNumber,
        payment_method: paymentMethod,
        purpose: purpose || null,
        status: 'pending'
      })
      .select()
      .single();

    if (dbError) {
      console.error('Database error:', dbError);
      throw new Error('Failed to create contribution record');
    }

    // Initiate payment with the selected provider
    let paymentResponse;
    
    if (paymentMethod === 'mpesa') {
      paymentResponse = await initiateMpesaPayment(amount, phoneNumber, contribution.id);
    } else if (paymentMethod === 'airtel') {
      paymentResponse = await initiateAirtelPayment(amount, phoneNumber, contribution.id);
    } else {
      throw new Error('Unsupported payment method');
    }

    // Update contribution with payment reference
    await supabase
      .from('contributions')
      .update({
        status: 'processing',
        // Add payment reference fields as needed
      })
      .eq('id', contribution.id);

    return new Response(
      JSON.stringify({
        success: true,
        contributionId: contribution.id,
        message: 'Payment request sent to your phone. Please complete the transaction.',
        paymentReference: paymentResponse.reference
      }),
      {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          ...corsHeaders,
        },
      }
    );

  } catch (error: any) {
    console.error('Error initiating payment:', error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message || 'Failed to initiate payment'
      }),
      {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
          ...corsHeaders,
        },
      }
    );
  }
};

async function initiateMpesaPayment(amount: number, phoneNumber: string, contributionId: string) {
  const consumerKey = Deno.env.get('MPESA_CONSUMER_KEY');
  const consumerSecret = Deno.env.get('MPESA_CONSUMER_SECRET');
  
  if (!consumerKey || !consumerSecret) {
    throw new Error('Mpesa credentials not configured');
  }

  // Get OAuth token
  const auth = btoa(`${consumerKey}:${consumerSecret}`);
  const tokenResponse = await fetch('https://sandbox.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials', {
    method: 'GET',
    headers: {
      'Authorization': `Basic ${auth}`
    }
  });

  const tokenData = await tokenResponse.json();
  const accessToken = tokenData.access_token;

  // Initiate STK Push
  const timestamp = new Date().toISOString().replace(/[-:]/g, '').replace(/\..+/, '');
  const password = btoa(`174379${timestamp}MTc0Mzc5YmZiMjc5ZjlhYTliZGJjZjE1OGU5N2RkNzFhNDY3Y2QyZTBjODkzMDU5YjEwZjc4ZTZiNzJhZGE=`);

  const stkPushResponse = await fetch('https://sandbox.safaricom.co.ke/mpesa/stkpush/v1/processrequest', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      BusinessShortCode: '174379',
      Password: password,
      Timestamp: timestamp,
      TransactionType: 'CustomerPayBillOnline',
      Amount: amount,
      PartyA: phoneNumber,
      PartyB: '174379',
      PhoneNumber: phoneNumber,
      CallBackURL: `${Deno.env.get('SUPABASE_URL')}/functions/v1/mpesa-callback`,
      AccountReference: contributionId,
      TransactionDesc: 'Community Contribution'
    })
  });

  const stkData = await stkPushResponse.json();
  console.log('Mpesa STK Push response:', stkData);

  return {
    reference: stkData.CheckoutRequestID,
    provider: 'mpesa'
  };
}

async function initiateAirtelPayment(amount: number, phoneNumber: string, contributionId: string) {
  const apiKey = Deno.env.get('AIRTEL_MONEY_API_KEY');
  const apiSecret = Deno.env.get('AIRTEL_MONEY_API_SECRET');
  const xKey = Deno.env.get('AIRTEL_X_KEY');
  const xSignature = Deno.env.get('AIRTEL_X_SIGNATURE');
  
  if (!apiKey || !apiSecret) {
    throw new Error('Airtel Money credentials not configured');
  }

  // Get OAuth token for Airtel
  const authResponse = await fetch('https://openapiuat.airtel.africa/auth/oauth2/token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      client_id: apiKey,
      client_secret: apiSecret,
      grant_type: 'client_credentials'
    })
  });

  const authData = await authResponse.json();
  const accessToken = authData.access_token;

  // Prepare payment request body
  const paymentBody = {
    reference: contributionId,
    subscriber: {
      country: 'TZ',
      currency: 'TZS',
      msisdn: phoneNumber
    },
    transaction: {
      amount: amount,
      country: 'TZ',
      currency: 'TZS',
      id: contributionId
    }
  };

  // Prepare headers with proper format
  const headers: Record<string, string> = {
    'Accept': '*/*',
    'Content-Type': 'application/json',
    'X-Country': 'TZ',
    'X-Currency': 'TZS',
    'Authorization': `Bearer ${accessToken}`
  };

  // Add x-signature and x-key if provided
  if (xSignature) {
    headers['x-signature'] = xSignature;
  }
  if (xKey) {
    headers['x-key'] = xKey;
  }

  // Initiate payment request using v2 API
  const paymentResponse = await fetch('https://openapiuat.airtel.africa/merchant/v2/payments/', {
    method: 'POST',
    headers: headers,
    body: JSON.stringify(paymentBody)
  });

  const paymentData = await paymentResponse.json();
  console.log('Airtel Money payment response:', paymentData);

  return {
    reference: paymentData.data?.transaction?.id || contributionId,
    provider: 'airtel'
  };
}

serve(handler);
