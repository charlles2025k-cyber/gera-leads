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

async function findOrCreateUser(email: string, name: string) {
  const { data: users } = await supabase.auth.admin.listUsers()
  let user = users?.users?.find((u: any) => u.email === email)

  if (user) {
    return { user, isNew: false }
  }

  const { data: created, error: createError } = await supabase.auth.admin.createUser({
    email,
    email_confirm: true,
    user_metadata: { name: name || '' },
  })

  if (createError || !created?.user) {
    throw new Error(createError?.message || 'Failed to create user')
  }

  await supabase.auth.admin.generateLink({
    type: 'recovery',
    email,
  })

  return { user: created.user, isNew: true }
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
  const name = body?.data?.customer?.name
  const productName = body?.data?.offer?.name || body?.data?.product?.name || ''

  if (!email) {
    return new Response(JSON.stringify({ error: 'Email not found' }), { headers: corsHeaders, status: 400 })
  }

  try {
    if (event === 'purchase_approved' || event === 'subscription_renewed') {
      const { user, isNew } = await findOrCreateUser(email, name)
      const { plan, days } = getPlanFromOffer(productName)
      const expires = new Date()
      expires.setDate(expires.getDate() + days)

      const { error } = await supabase
        .from('profiles')
        .upsert({ id: user.id, plan, plan_expires_at: expires.toISOString(), status: 'active' })

      if (error) {
        return new Response(JSON.stringify({ error: error.message }), { headers: corsHeaders, status: 500 })
      }

      let disparos_limite = 500
      if (plan === 'quarterly') {
        disparos_limite = 1500
      } else if (plan === 'annual') {
        disparos_limite = 5000
      }

      const userName = name || email.split('@')[0]

      const { error: licenseError } = await supabase
        .from('zapflow_licenses')
        .upsert({
          user_id: user.id,
          plan_type: plan,
          expires_at: expires.toISOString(),
          disparos_limite: disparos_limite,
          user_name: userName
        }, { onConflict: 'user_id' })

      if (licenseError) {
        return new Response(JSON.stringify({ error: licenseError.message }), { headers: corsHeaders, status: 500 })
      }

      return new Response(
        JSON.stringify({ success: true, action: isNew ? 'created_and_activated' : 'activated', plan, expires }),
        { headers: corsHeaders, status: 200 }
      )
    }

    const { data: users } = await supabase.auth.admin.listUsers()
    const user = users?.users?.find((u: any) => u.email === email)

    if (!user) {
      return new Response(JSON.stringify({ error: 'User not found' }), { headers: corsHeaders, status: 404 })
    }

    if (event === 'subscription_canceled') {
      const { data: profile } = await supabase
        .from('profiles')
        .select('plan_expires_at')
        .eq('id', user.id)
        .maybeSingle()

      const { error } = await supabase
        .from('profiles')
        .update({ status: 'canceled' })
        .eq('id', user.id)

      if (error) {
        return new Response(JSON.stringify({ error: error.message }), { headers: corsHeaders, status: 500 })
      }

      if (profile?.plan_expires_at) {
        const { error: licenseError } = await supabase
          .from('zapflow_licenses')
          .update({ expires_at: profile.plan_expires_at })
          .eq('user_id', user.id)

        if (licenseError) {
          return new Response(JSON.stringify({ error: licenseError.message }), { headers: corsHeaders, status: 500 })
        }
      }

      return new Response(JSON.stringify({ success: true, action: 'marked_canceled' }), { headers: corsHeaders, status: 200 })
    }

    if (event === 'refund' || event === 'chargeback') {
      const now = new Date().toISOString()
      const { error } = await supabase
        .from('profiles')
        .update({ plan: 'none', plan_expires_at: now, status: 'revoked' })
        .eq('id', user.id)

      if (error) {
        return new Response(JSON.stringify({ error: error.message }), { headers: corsHeaders, status: 500 })
      }

      const { error: licenseError } = await supabase
        .from('zapflow_licenses')
        .update({ expires_at: now })
        .eq('user_id', user.id)

      if (licenseError) {
        return new Response(JSON.stringify({ error: licenseError.message }), { headers: corsHeaders, status: 500 })
      }

      return new Response(JSON.stringify({ success: true, action: 'revoked' }), { headers: corsHeaders, status: 200 })
    }

    return new Response(JSON.stringify({ success: true, action: 'skipped', event }), { headers: corsHeaders, status: 200 })
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message }), { headers: corsHeaders, status: 500 })
  }
}, { verifyJWT: false })
