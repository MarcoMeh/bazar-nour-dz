import { useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useAdmin } from "@/contexts/AdminContext";

export const useOrderNotifications = () => {
    const { storeId, isStoreOwner } = useAdmin();

    useEffect(() => {
        if (!isStoreOwner || !storeId) return;

        console.log("Setting up real-time notification subscription for store:", storeId);

        // Subscribe to real-time notifications table changes for this store
        const channel = supabase
            .channel(`global-store-notifications-${storeId}`)
            .on(
                'postgres_changes',
                {
                    event: 'INSERT',
                    schema: 'public',
                    table: 'notifications',
                    filter: `store_id=eq.${storeId}`
                },
                (payload) => {
                    console.log("New store notification received:", payload);
                    const newNotification = payload.new as any;

                    // Only show alert for new orders
                    if (newNotification.type === 'new_order') {
                        toast.success("طلب جديد! 📦", {
                            description: newNotification.message || "لقد تلقيت طلباً جديداً",
                            duration: 5000,
                            action: {
                                label: "عرض",
                                onClick: () => window.location.href = `/store-dashboard/orders`
                            }
                        });

                        // Play a subtle notification sound (browser auto-play restrictions may block this until first interaction)
                        try {
                            const audio = new Audio('https://assets.mixkit.co/active_storage/sfx/2358/2358-preview.mp3');
                            audio.play();
                        } catch (e) {
                            console.log("Audio play blocked by browser policies:", e);
                        }
                    }
                }
            )
            .subscribe((status) => {
                if (status === 'SUBSCRIBED') {
                    console.log("Subscribed to new store notifications successfully");
                }
            });

        return () => {
            supabase.removeChannel(channel);
        };
    }, [storeId, isStoreOwner]);
};

