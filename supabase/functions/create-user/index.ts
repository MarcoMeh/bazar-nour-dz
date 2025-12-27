
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

        const { email, password, fullName, phone, address, storeName, role, description } = await req.json()

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

        // 3. Create the Store in the 'stores' table
        let storeId = null;
        if (storeName) {
            const { data: storeData, error: storeError } = await supabaseAdmin
                .from('stores')
                .insert({
                    owner_id: userId,
                    name: storeName,
                    description: description || null,
                    is_active: false,
                    phone_numbers: phone ? [phone] : []
                })
                .select()
                .single()

            if (storeError) throw storeError
            storeId = storeData.id
        }

        // 4. Create the Category for backward compatibility if needed
        let categoryId = null;
        if (storeName) {
            // Check if category exists
            const { data: existingCat } = await supabaseAdmin
                .from('categories')
                .select('id')
                .eq('name', storeName)
                .maybeSingle()

            if (existingCat) {
                categoryId = existingCat.id
            } else {
                // Create new category
                const slug = `${storeName.replace(/\s+/g, '-').toLowerCase()}-${Date.now()}`
                const { data: newCat, error: catError } = await supabaseAdmin
                    .from('categories')
                    .insert({
                        name: storeName,
                        name_ar: storeName,
                        slug: slug,
                        parent_id: null
                    })
                    .select()
                    .single()

                if (!catError) {
                    categoryId = newCat.id

                    // Link store to this new category in junction table
                    if (storeId) {
                        await supabaseAdmin
                            .from('store_category_relations')
                            .insert({
                                store_id: storeId,
                                category_id: categoryId
                            })
                    }
                }
            }
        }

        return new Response(
            JSON.stringify({ user: userData.user, storeId, categoryId }),
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
