import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface Category {
    id: string;
    name: string;
    name_ar?: string;
    slug: string;
    image_url?: string | null;
    parent_id?: string | null;
    created_at?: string;
}

async function fetchCategories(): Promise<Category[]> {
    const { data, error } = await supabase
        .from('categories')
        .select('*')
        .order('name');

    if (error) {
        throw new Error(error.message);
    }

    return (data || []) as Category[];
}

export function useCategories() {
    return useQuery({
        queryKey: ['categories'],
        queryFn: fetchCategories,
        staleTime: 10 * 60 * 1000, // 10 minutes
        gcTime: 30 * 60 * 1000, // 30 minutes
    });
}

export function useMainCategories() {
    const { data: categories, ...rest } = useCategories();

    const mainCategories = categories?.filter(cat => !cat.parent_id) || [];

    return {
        data: mainCategories,
        ...rest,
    };
}

export function useSubCategories(parentId: string | null) {
    const { data: categories, ...rest } = useCategories();

    const subCategories = parentId
        ? categories?.filter(cat => cat.parent_id === parentId) || []
        : [];

    return {
        data: subCategories,
        ...rest,
    };
}
