// @ts-nocheck
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.7.1"
import webpush from "npm:web-push"

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// Fallback VAPID keys generated for the project
const DEFAULT_VAPID_PUBLIC_KEY = "BLzppK5cluGLwCWeyfCkia3Hpq7ATXpuMocuMR5iiooHpzIB18B087RKorUZZUUbM1oQxLygrhQCQoXbqekCvkU";
const DEFAULT_VAPID_PRIVATE_KEY = "zF1twFlUhVWD7rEJJwSTHgvQR7SMBlRvAFJYIfEdaHE";

serve(async (req) => {
    // Handle CORS preflight requests
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders })
    }

    try {
        const supabaseAdmin = createClient(
            Deno.env.get('SUPABASE_URL') ?? '',
            Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
        )

        const payload = await req.json()
        const { notification_id, store_id, type, title, message } = payload

        console.log(`Received push notification request for store: ${store_id}, type: ${type}`)

        if (!store_id) {
            throw new Error("store_id is required")
        }

        // 1. Fetch active push subscriptions for this store
        const { data: subscriptions, error: fetchError } = await supabaseAdmin
            .from('store_push_subscriptions')
            .select('*')
            .eq('store_id', store_id)

        if (fetchError) {
            console.error("Error fetching subscriptions:", fetchError)
            throw fetchError
        }

        console.log(`Found ${subscriptions?.length || 0} subscriptions for store: ${store_id}`)

        if (!subscriptions || subscriptions.length === 0) {
            return new Response(JSON.stringify({ success: true, message: "No active subscriptions found for this store" }), {
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                status: 200,
            })
        }

        // 2. Configure VAPID Keys
        const vapidPublicKey = Deno.env.get('VAPID_PUBLIC_KEY') ?? DEFAULT_VAPID_PUBLIC_KEY;
        const vapidPrivateKey = Deno.env.get('VAPID_PRIVATE_KEY') ?? DEFAULT_VAPID_PRIVATE_KEY;
        
        webpush.setVapidDetails(
            "mailto:admin@bazzarna.online",
            vapidPublicKey,
            vapidPrivateKey
        )

        // 3. Construct push payload
        const pushPayload = JSON.stringify({
            title: title || "تنبيه جديد! 📦",
            body: message || "لديك إشعار جديد في لوحة التحكم",
            icon: "/pwa-192x192.png",
            badge: "/pwa-192x192.png",
            vibrate: [100, 50, 100],
            data: {
                url: type === 'new_order' ? "/store-dashboard/orders" : "/store-dashboard",
                notification_id: notification_id
            }
        })

        // 4. Dispatch push to all active subscriptions
        const sendPromises = subscriptions.map(async (sub) => {
            const pushSubscription = {
                endpoint: sub.endpoint,
                keys: {
                    p256dh: sub.p256dh,
                    auth: sub.auth_key
                }
            }

            try {
                await webpush.sendNotification(pushSubscription, pushPayload)
                console.log(`Successfully sent push notification to endpoint: ${sub.endpoint.slice(0, 30)}...`)
            } catch (err) {
                console.error(`Failed to send push notification to endpoint: ${sub.endpoint.slice(0, 30)}...`, err)
                
                // If subscription has expired or is invalid (Status 410 or 404), delete it from DB
                if (err.statusCode === 410 || err.statusCode === 404) {
                    console.log(`Subscription expired (Status ${err.statusCode}). Deleting subscription ID: ${sub.id}`)
                    await supabaseAdmin
                        .from('store_push_subscriptions')
                        .delete()
                        .eq('id', sub.id)
                }
            }
        })

        await Promise.all(sendPromises)

        return new Response(
            JSON.stringify({ success: true, dispatched: subscriptions.length }),
            {
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                status: 200,
            }
        )

    } catch (error) {
        console.error("Push notification error:", error.message)
        return new Response(
            JSON.stringify({ error: error.message }),
            {
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                status: 400,
            }
        )
    }
})
