import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface SiteSettings {
    id: string;
    site_name: string;
    logo_url: string | null;
    facebook_url: string | null;
    instagram_url: string | null;
    tiktok_url: string | null;
    whatsapp_number: string | null;
    phone_number: string | null;
    email: string | null;
    address: string | null;
}

export const useSiteSettings = () => {
    return useQuery({
        queryKey: ["site-settings"],
        queryFn: async (): Promise<SiteSettings | null> => {
            const { data, error } = await supabase
                .from("site_settings")
                .select("*")
                .limit(1)
                .maybeSingle();

            if (error) {
                console.error("Error fetching site settings:", error);
                return null; // Return null on error so UI can fallback gracefully
            }

            return data;
        },
        staleTime: 1000 * 60 * 30, // 30 minutes cache, settings don't change often
    });
};
