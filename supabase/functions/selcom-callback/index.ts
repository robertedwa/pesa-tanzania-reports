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
    console.log('Selcom callback received:', JSON.stringify(callbackData, null, 2));

    const { order_id, payment_status, transaction_id } = callbackData;

    let contributionStatus = 'failed';
    if (payment_status === 'COMPLETED' || payment_status === 'SUCCESS') {
      contributionStatus = 'completed';
    } else if (payment_status === 'PENDING') {
      contributionStatus = 'processing';
    }

    // Update contribution status in database
    const { error } = await supabase
      .from('contributions')
      .update({
        status: contributionStatus,
      })
      .eq('id', order_id);

    if (error) {
      console.error('Error updating contribution:', error);
    }

    console.log(`Selcom payment ${contributionStatus} for order: ${order_id}`);

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
    console.error('Error processing Selcom callback:', error);
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