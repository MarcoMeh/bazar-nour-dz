
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

        const { email, password, fullName, phone, address, storeName, role } = await req.json()

        // 1. Create the user in Auth
        const { data: userData, error: userError } = await supabaseAdmin.auth.admin.createUser({
            email,
            password,
            email_confirm: true,
            user_metadata: {
                full_name: fullName,
                role: role || 'store_owner',
            },
        })

        if (userError) throw userError

        const userId = userData.user.id

        // 2. Update the profile with additional details
        // Note: The 'handle_new_user' trigger might have already created the profile, 
        // so we should try to update it. If not, we insert.
        // However, since we are admin, we can just upsert.
        const { error: profileError } = await supabaseAdmin
            .from('profiles')
            .upsert({
                id: userId,
                full_name: fullName,
                phone: phone,
                address: address,
                username: storeName, // Use storeName as username for login
                email: email, // Save email for lookup by username
                role: role || 'store_owner',
                updated_at: new Date().toISOString(),
            })

        if (profileError) throw profileError

        // 3. Create the Store (Category) if provided
        let categoryId = null;
        if (storeName) {
            // Check if store exists
            const { data: existingStore } = await supabaseAdmin
                .from('categories')
                .select('id')
                .eq('name', storeName) // Assuming column is 'name' based on previous fixes
                .maybeSingle()

            if (existingStore) {
                categoryId = existingStore.id
            } else {
                // Create new store
                const slug = `${storeName.replace(/\s+/g, '-').toLowerCase()}-${Date.now()}`
                const { data: newStore, error: storeError } = await supabaseAdmin
                    .from('categories')
                    .insert({
                        name: storeName,
                        name_ar: storeName, // Keeping both for compatibility if needed
                        slug: slug,
                        parent_id: null // Or fetch 'ourstores' id if needed, but keeping simple for now
                    })
                    .select()
                    .single()

                if (storeError) throw storeError
                categoryId = newStore.id
            }
        }

        return new Response(
            JSON.stringify({ user: userData.user, categoryId }),
            {
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                status: 200,
            }
        )

    } catch (error) {
        return new Response(
            JSON.stringify({ error: error.message }),
            {
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                status: 400,
            }
        )
    }
})
