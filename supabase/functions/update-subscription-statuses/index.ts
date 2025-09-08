import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Initialize Appwrite client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabase = createClient(supabaseUrl, supabaseKey)

    console.log('Starting subscription status update...')

    // Get current date
    const now = new Date()
    const threeDaysFromNow = new Date()
    threeDaysFromNow.setDate(now.getDate() + 3)

    // Get all subscriptions that are not frozen
    const { data: subscriptions, error: fetchError } = await supabase
      .from('subscriptions')
      .select('*')
      .or('is_status_frozen.is.null,is_status_frozen.eq.false')

    if (fetchError) {
      throw new Error(`Failed to fetch subscriptions: ${fetchError.message}`)
    }

    console.log(`Found ${subscriptions?.length || 0} subscriptions to check`)

    let updatedCount = 0
    const updates = []

    for (const subscription of subscriptions || []) {
      const endDate = new Date(subscription.end_date)
      let newStatus = subscription.state

      // Determine new status based on end date
      if (endDate < now && subscription.state !== 'overdue' && subscription.state !== 'awaiting_payment' && subscription.state !== 'cancelled') {
        newStatus = 'overdue'
      } else if (endDate <= threeDaysFromNow && endDate >= now && subscription.state === 'active') {
        newStatus = 'expiring_soon'
      }

      // Update if status changed
      if (newStatus !== subscription.state) {
        updates.push({
          id: subscription.id,
          state: newStatus
        })
      }
    }

    // Batch update subscriptions
    if (updates.length > 0) {
      for (const update of updates) {
        const { error: updateError } = await supabase
          .from('subscriptions')
          .update({ state: update.state })
          .eq('id', update.id)

        if (updateError) {
          console.error(`Failed to update subscription ${update.id}:`, updateError)
        } else {
          updatedCount++
        }
      }
    }

    console.log(`Updated ${updatedCount} subscription statuses`)

    return new Response(
      JSON.stringify({
        success: true,
        message: `Updated ${updatedCount} subscription statuses`,
        updatedCount
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      },
    )

  } catch (error) {
    console.error('Error updating subscription statuses:', error)
    
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      },
    )
  }
})