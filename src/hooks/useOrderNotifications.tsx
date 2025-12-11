import { useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useAdmin } from "@/contexts/AdminContext";

export const useOrderNotifications = () => {
    const { storeId, isStoreOwner } = useAdmin();

    useEffect(() => {
        if (!isStoreOwner || !storeId) return;

        console.log("Setting up real-time order subscription for store:", storeId);

        const channel = supabase
            .channel('store-orders')
            .on(
                'postgres_changes',
                {
                    event: 'INSERT',
                    schema: 'public',
                    table: 'orders',
                    filter: `store_id=eq.${storeId}`
                },
                (payload) => {
                    console.log("New order received:", payload);
                    const newOrder = payload.new as any;

                    // Cleanup audio handled by browser interaction policies, usually requires user interaction first
                    // We'll stick to visual toast for now
                    toast.success(`طلب جديد!`, {
                        description: `تم استلام طلب جديد بقيمة ${newOrder.total_price} د.ج`,
                        duration: 5000,
                        action: {
                            label: "عرض",
                            onClick: () => window.location.href = `/store-dashboard/orders`
                        }
                    });
                }
            )
            .subscribe((status) => {
                if (status === 'SUBSCRIBED') {
                    console.log("Subscribed to new orders");
                }
            });

        return () => {
            supabase.removeChannel(channel);
        };
    }, [storeId, isStoreOwner]);
};
