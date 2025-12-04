import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface Store {
    id: string;
    name: string;
    description?: string | null;
    image_url?: string | null;
    category_id?: string;
    owner_id: string;
    is_active: boolean;
    created_at?: string;
}

async function fetchStores(): Promise<Store[]> {
    const { data, error } = await supabase
        .from('stores')
        .select('*')
        .eq('is_active', true)
        .order('name');

    if (error) {
        throw new Error(error.message);
    }

    return (data || []) as Store[];
}

export function useStores() {
    return useQuery({
        queryKey: ['stores'],
        queryFn: fetchStores,
        staleTime: 10 * 60 * 1000, // 10 minutes
        gcTime: 30 * 60 * 1000, // 30 minutes
    });
}
