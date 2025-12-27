
// @ts-nocheck
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.7.1"

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders })
    }

    try {
        const supabaseAdmin = createClient(
            Deno.env.get('SUPABASE_URL') ?? '',
            Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
        )

        const { owner_id } = await req.json()

        if (!owner_id) {
            throw new Error("Owner ID is required")
        }

        // 1. Delete the user in Auth
        // This should cascade to profiles and stores if DB is set up with cascades.
        // Even if not, we can manually delete the store first if we want to be safe.

        console.log(`Deleting user: ${owner_id}`)

        // 1. Get the store ID first to clean up related data
        console.log(`Fetching store details for owner: ${owner_id}`)
        const { data: storeData, error: fetchStoreError } = await supabaseAdmin
            .from('stores')
            .select('id')
            .eq('owner_id', owner_id)
            .single()

        if (fetchStoreError) {
            console.error("Could not find store for this owner, maybe already deleted partially:", fetchStoreError)
        }

        if (storeData?.id) {
            const storeId = storeData.id
            console.log(`Cleaning up linked data for store: ${storeId}`)

            // Manual cleanup as fallback for missing cascades
            await supabaseAdmin.from('products').delete().eq('store_id', storeId)
            await supabaseAdmin.from('subscription_logs').delete().eq('store_id', storeId)
            await supabaseAdmin.from('notifications').delete().eq('store_id', storeId)
            await supabaseAdmin.from('store_delivery_settings').delete().eq('store_id', storeId)
            await supabaseAdmin.from('store_delivery_overrides').delete().eq('store_id', storeId)
            await supabaseAdmin.from('store_category_relations').delete().eq('store_id', storeId)
        }

        // 2. Delete the user in Auth
        console.log(`Deleting Auth user: ${owner_id}`)
        const { error: deleteUserError } = await supabaseAdmin.auth.admin.deleteUser(owner_id)

        if (deleteUserError) {
            console.error("Error deleting auth user (proceeding anyway):", deleteUserError)
        }

        // 3. Final cleanup of the store record itself
        console.log(`Deleting store record for owner: ${owner_id}`)
        const { error: storeDeleteError } = await supabaseAdmin
            .from('stores')
            .delete()
            .eq('owner_id', owner_id)

        if (storeDeleteError) {
            console.error("Critical error deleting store record:", storeDeleteError)
            return new Response(JSON.stringify({
                error: `Database Error: ${storeDeleteError.message}`,
                details: storeDeleteError
            }), {
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                status: 400,
            })
        }

        return new Response(
            JSON.stringify({ success: true, message: "Store and user deleted successfully" }),
            {
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                status: 200,
            }
        )

    } catch (error) {
        console.error("Delete store error:", error.message)
        return new Response(
            JSON.stringify({ error: error.message }),
            {
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                status: 400,
            }
        )
    }
})
