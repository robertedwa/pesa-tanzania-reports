
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
    const requestBody = await req.json();
    console.log('Raw request body:', JSON.stringify(requestBody, null, 2));
    
    const paymentData = requestBody.body || requestBody;
    const { amount, phoneNumber, paymentMethod, contributorName, purpose }: PaymentRequest = paymentData;
    
    console.log('Parsed payment data:', { amount, phoneNumber, paymentMethod, contributorName, purpose });

    // Validate required fields
    if (!amount || !phoneNumber || !paymentMethod || !contributorName) {
      throw new Error('Missing required fields: amount, phoneNumber, paymentMethod, or contributorName');
    }

    // Format phone number (ensure it starts with 255 for Tanzania)
    let formattedPhone = phoneNumber.replace(/\D/g, ''); // Remove non-digits
    if (formattedPhone.startsWith('0')) {
      formattedPhone = '255' + formattedPhone.substring(1);
    } else if (!formattedPhone.startsWith('255')) {
      formattedPhone = '255' + formattedPhone;
    }
    
    console.log('Formatted phone number:', formattedPhone);

    // First, store the contribution as pending
    const { data: contribution, error: dbError } = await supabase
      .from('contributions')
      .insert({
        contributor_name: contributorName,
        amount: amount,
        phone_number: formattedPhone,
        payment_method: paymentMethod,
        purpose: purpose || null,
        status: 'pending'
      })
      .select()
      .single();

    if (dbError) {
      console.error('Database error:', dbError);
      throw new Error(`Failed to create contribution record: ${dbError.message}`);
    }

    console.log('Contribution created:', contribution);

    // Initiate payment with the selected provider
    let paymentResponse;
    
    try {
      if (paymentMethod === 'mpesa') {
        paymentResponse = await initiateMpesaPayment(amount, formattedPhone, contribution.id);
      } else if (paymentMethod === 'airtel') {
        paymentResponse = await initiateAirtelPayment(amount, formattedPhone, contribution.id);
      } else {
        throw new Error(`Unsupported payment method: ${paymentMethod}`);
      }

      console.log('Payment response:', paymentResponse);

      // Update contribution with payment reference
      await supabase
        .from('contributions')
        .update({
          status: 'processing',
        })
        .eq('id', contribution.id);

      return new Response(
        JSON.stringify({
          success: true,
          contributionId: contribution.id,
          message: 'Payment request sent to your phone. Please complete the transaction.',
          paymentReference: paymentResponse.reference,
          phoneNumber: formattedPhone
        }),
        {
          status: 200,
          headers: {
            'Content-Type': 'application/json',
            ...corsHeaders,
          },
        }
      );

    } catch (paymentError: any) {
      console.error('Payment initiation error:', paymentError);
      
      // Update contribution status to failed
      await supabase
        .from('contributions')
        .update({ status: 'failed' })
        .eq('id', contribution.id);

      throw new Error(`Payment initiation failed: ${paymentError.message}`);
    }

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
  
  console.log('M-Pesa credentials check:', { 
    hasConsumerKey: !!consumerKey, 
    hasConsumerSecret: !!consumerSecret 
  });

  if (!consumerKey || !consumerSecret) {
    console.log('M-Pesa credentials not found, simulating payment request');
    
    // For testing: simulate a delay and then update status
    setTimeout(async () => {
      try {
        await supabase
          .from('contributions')
          .update({ status: 'completed' })
          .eq('id', contributionId);
        console.log('Test payment completed for contribution:', contributionId);
      } catch (error) {
        console.error('Error updating test payment:', error);
      }
    }, 10000); // Complete after 10 seconds for testing

    return {
      reference: `TEST_MPESA_${contributionId}`,
      provider: 'mpesa',
      testMode: true
    };
  }

  try {
    console.log('Initiating real M-Pesa payment...');
    
    // Get OAuth token
    const auth = btoa(`${consumerKey}:${consumerSecret}`);
    const tokenResponse = await fetch('https://sandbox.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials', {
      method: 'GET',
      headers: {
        'Authorization': `Basic ${auth}`
      }
    });

    if (!tokenResponse.ok) {
      throw new Error(`M-Pesa auth failed: ${tokenResponse.status} ${tokenResponse.statusText}`);
    }

    const tokenData = await tokenResponse.json();
    const accessToken = tokenData.access_token;

    if (!accessToken) {
      throw new Error('Failed to get M-Pesa access token');
    }

    console.log('M-Pesa access token obtained');

    // Initiate STK Push
    const timestamp = new Date().toISOString().replace(/[-:]/g, '').replace(/\..+/, '');
    const password = btoa(`174379${timestamp}bfb279f9aa9bdbcf158e97dd71a467cd2e0c893059b10f78e6b72ada1ed2c919`);

    const stkPushPayload = {
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
    };

    console.log('M-Pesa STK Push payload:', JSON.stringify(stkPushPayload, null, 2));

    const stkPushResponse = await fetch('https://sandbox.safaricom.co.ke/mpesa/stkpush/v1/processrequest', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(stkPushPayload)
    });

    const stkData = await stkPushResponse.json();
    console.log('M-Pesa STK Push response:', JSON.stringify(stkData, null, 2));

    if (!stkPushResponse.ok || stkData.errorCode) {
      throw new Error(`M-Pesa STK Push failed: ${stkData.errorMessage || stkData.ResponseDescription || 'Unknown error'}`);
    }

    return {
      reference: stkData.CheckoutRequestID || `MPESA_${contributionId}`,
      provider: 'mpesa',
      responseCode: stkData.ResponseCode,
      responseDescription: stkData.ResponseDescription
    };
  } catch (error: any) {
    console.error('M-Pesa payment error:', error);
    throw error;
  }
}

async function initiateAirtelPayment(amount: number, phoneNumber: string, contributionId: string) {
  const clientId = Deno.env.get('AIRTEL_CLIENT_ID');
  const clientSecret = Deno.env.get('AIRTEL_CLIENT_SECRET');
  const xKey = Deno.env.get('AIRTEL_X_KEY');
  const xSignature = Deno.env.get('AIRTEL_X_SIGNATURE');
  
  console.log('Airtel credentials check:', { 
    hasClientId: !!clientId, 
    hasClientSecret: !!clientSecret,
    hasXKey: !!xKey,
    hasXSignature: !!xSignature
  });

  if (!clientId || !clientSecret) {
    console.log('Airtel credentials not found, simulating payment request');
    
    // For testing: simulate a delay and then update status
    setTimeout(async () => {
      try {
        await supabase
          .from('contributions')
          .update({ status: 'completed' })
          .eq('id', contributionId);
        console.log('Test payment completed for contribution:', contributionId);
      } catch (error) {
        console.error('Error updating test payment:', error);
      }
    }, 8000); // Complete after 8 seconds for testing

    return {
      reference: `TEST_AIRTEL_${contributionId}`,
      provider: 'airtel',
      testMode: true
    };
  }

  try {
    console.log('Initiating real Airtel Money payment...');
    
    // Get OAuth token for Airtel
    const authPayload = {
      client_id: clientId,
      client_secret: clientSecret,
      grant_type: 'client_credentials'
    };

    console.log('Airtel auth payload:', authPayload);

    const authResponse = await fetch('https://openapiuat.airtel.africa/auth/oauth2/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(authPayload)
    });

    if (!authResponse.ok) {
      throw new Error(`Airtel auth failed: ${authResponse.status} ${authResponse.statusText}`);
    }

    const authData = await authResponse.json();
    console.log('Airtel auth response:', authData);

    const accessToken = authData.access_token;

    if (!accessToken) {
      throw new Error('Failed to get Airtel access token');
    }

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

    console.log('Airtel payment payload:', JSON.stringify(paymentBody, null, 2));

    // Prepare headers
    const headers: Record<string, string> = {
      'Accept': '*/*',
      'Content-Type': 'application/json',
      'X-Country': 'TZ',
      'X-Currency': 'TZS',
      'Authorization': `Bearer ${accessToken}`
    };

    if (xSignature) headers['x-signature'] = xSignature;
    if (xKey) headers['x-key'] = xKey;

    console.log('Airtel request headers:', Object.keys(headers));

    // Initiate payment request
    const paymentResponse = await fetch('https://openapiuat.airtel.africa/merchant/v2/payments/', {
      method: 'POST',
      headers: headers,
      body: JSON.stringify(paymentBody)
    });

    const paymentData = await paymentResponse.json();
    console.log('Airtel Money payment response:', JSON.stringify(paymentData, null, 2));

    if (!paymentResponse.ok) {
      throw new Error(`Airtel payment failed: ${paymentData.message || paymentResponse.statusText}`);
    }

    return {
      reference: paymentData.data?.transaction?.id || `AIRTEL_${contributionId}`,
      provider: 'airtel',
      status: paymentData.status,
      message: paymentData.message
    };
  } catch (error: any) {
    console.error('Airtel payment error:', error);
    throw error;
  }
}

serve(handler);
