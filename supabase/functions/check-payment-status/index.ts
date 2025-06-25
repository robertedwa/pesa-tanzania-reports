
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
    let contributionId: string | null = null;

    // Handle both GET and POST requests
    if (req.method === 'GET') {
      const url = new URL(req.url);
      contributionId = url.searchParams.get('id');
    } else if (req.method === 'POST') {
      const body = await req.json();
      contributionId = body.id || body.contributionId;
    }

    if (!contributionId) {
      return new Response(
        JSON.stringify({ error: 'Contribution ID is required' }),
        { status: 400, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
      );
    }

    console.log('Checking payment status for contribution:', contributionId);

    const { data: contribution, error } = await supabase
      .from('contributions')
      .select('*')
      .eq('id', contributionId)
      .single();

    if (error) {
      console.error('Error fetching contribution:', error);
      return new Response(
        JSON.stringify({ error: 'Contribution not found' }),
        { status: 404, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
      );
    }

    return new Response(
      JSON.stringify({
        id: contribution.id,
        status: contribution.status,
        amount: contribution.amount,
        contributor_name: contribution.contributor_name,
        timestamp: contribution.timestamp
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
    console.error('Error checking payment status:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
    );
  }
};

serve(handler);
