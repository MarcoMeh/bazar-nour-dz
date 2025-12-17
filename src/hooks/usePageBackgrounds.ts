import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export const usePageBackgrounds = () => {
    return useQuery({
        queryKey: ["page-backgrounds"],
        queryFn: async () => {
            const { data, error } = await supabase
                .from("page_backgrounds" as any)
                .select("page_key, image_url");

            if (error) {
                console.error("Error fetching page backgrounds:", error);
                return {};
            }

            // Convert array to object for easy lookup: { 'about_hero': 'url...', ... }
            const bgMap: Record<string, string> = {};
            data.forEach((item: any) => {
                if (item.image_url) {
                    bgMap[item.page_key] = item.image_url;
                }
            });
            return bgMap;
        },
        staleTime: 1000 * 60 * 60, // 1 hour
    });
};
