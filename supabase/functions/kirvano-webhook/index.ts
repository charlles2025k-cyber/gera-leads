import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const supabase = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SERVICE_ROLE_KEY')!
)

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

function getPlanFromOffer(productName: string) {
  let plan = 'monthly'
  let days = 30

  if (productName.toLowerCase().includes('trimestral')) {
    plan = 'quarterly'
    days = 90
  } else if (productName.toLowerCase().includes('anual')) {
    plan = 'annual'
    days = 365
  }

  return { plan, days }
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  if (req.method !== 'POST') {
    return new Response('Method not allowed', { status: 405 })
  }

  const body = await req.json()
  const event = body?.event
  const email = body?.data?.customer?.email
  const productName = body?.data?.offer?.name || body?.data?.product?.name || ''

  if (!email) {
    return new Response(JSON.stringify({ error: 'Email not found' }), { headers: corsHeaders, status: 400 })
  }

  const { data: users } = await supabase.auth.admin.listUsers()
  const user = users?.users?.find((u: any) => u.email === email)

  if (!user) {
    return new Response(JSON.stringify({ error: 'User not found' }), { headers: corsHeaders, status: 404 })
  }

  if (event === 'purchase_approved' || event === 'subscription_renewed') {
    const { plan, days } = getPlanFromOffer(productName)
    const expires = new Date()
    expires.setDate(expires.getDate() + days)

    const { error } = await supabase
      .from('profiles')
      .upsert({ id: user.id, plan, plan_expires_at: expires.toISOString(), status: 'active' })

    if (error) {
      return new Response(JSON.stringify({ error: error.message }), { headers: corsHeaders, status: 500 })
    }

    return new Response(JSON.stringify({ success: true, action: 'activated', plan, expires }), { headers: corsHeaders, status: 200 })
  }

  if (event === 'subscription_canceled') {
    const { error } = await supabase
      .from('profiles')
      .update({ status: 'canceled' })
      .eq('id', user.id)

    if (error) {
      return new Response(JSON.stringify({ error: error.message }), { headers: corsHeaders, status: 500 })
    }

    return new Response(JSON.stringify({ success: true, action: 'marked_canceled' }), { headers: corsHeaders, status: 200 })
  }

  if (event === 'refund' || event === 'chargeback') {
    const { error } = await supabase
      .from('profiles')
      .update({ plan: 'none', plan_expires_at: new Date().toISOString(), status: 'revoked' })
      .eq('id', user.id)

    if (error) {
      return new Response(JSON.stringify({ error: error.message }), { headers: corsHeaders, status: 500 })
    }

    return new Response(JSON.stringify({ success: true, action: 'revoked' }), { headers: corsHeaders, status: 200 })
  }

  if (event === 'purchase_refused' || event === 'subscription_renewal_refused') {
    return new Response(JSON.stringify({ success: true, action: 'ignored', event }), { headers: corsHeaders, status: 200 })
  }

  return new Response(JSON.stringify({ success: true, action: 'skipped', event }), { headers: corsHeaders, status: 200 })
}, { verifyJWT: false })
