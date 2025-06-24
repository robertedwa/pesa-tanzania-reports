
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const supabase = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
);

const handler = async (req: Request): Promise<Response> => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const callbackData = await req.json();
    console.log('Mpesa callback received:', JSON.stringify(callbackData, null, 2));

    const { Body } = callbackData;
    const { stkCallback } = Body;
    
    const checkoutRequestID = stkCallback.CheckoutRequestID;
    const resultCode = stkCallback.ResultCode;
    const resultDesc = stkCallback.ResultDesc;

    let status = 'failed';
    let mpesaReceiptNumber = null;

    if (resultCode === 0) {
      // Payment successful
      status = 'completed';
      const callbackMetadata = stkCallback.CallbackMetadata;
      
      if (callbackMetadata && callbackMetadata.Item) {
        const receiptItem = callbackMetadata.Item.find((item: any) => item.Name === 'MpesaReceiptNumber');
        if (receiptItem) {
          mpesaReceiptNumber = receiptItem.Value;
        }
      }
    }

    // Update contribution status in database
    const { error } = await supabase
      .from('contributions')
      .update({
        status: status,
        // You might want to add fields to store payment details
      })
      .eq('id', checkoutRequestID); // Assuming you're using checkout request ID as reference

    if (error) {
      console.error('Error updating contribution:', error);
    }

    console.log(`Payment ${status} for checkout request: ${checkoutRequestID}`);

    return new Response(
      JSON.stringify({ success: true }),
      {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          ...corsHeaders,
        },
      }
    );

  } catch (error: any) {
    console.error('Error processing Mpesa callback:', error);
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
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

serve(handler);
