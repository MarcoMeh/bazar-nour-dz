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
    // Fetch Main Categories
    const { data: mainCats, error: mainError } = await supabase
        .from('categories')
        .select('*')
        .order('name');

    // Fetch Subcategories
    const { data: subCats, error: subError } = await supabase
        .from('subcategories')
        .select('*')
        .order('name');

    if (mainError) {
        console.error('Error fetching categories:', mainError);
        throw new Error(mainError.message);
    }
    if (subError) {
        console.error('Error fetching subcategories:', subError);
        throw new Error(subError.message);
    }

    // Normalize Data
    const formattedMain = (mainCats || []).map((c: any) => ({
        id: c.id,
        name: c.name,
        name_ar: c.name_ar || c.name, // Fallback
        slug: c.slug,
        image_url: c.image_url,
        parent_id: null,
        created_at: c.created_at
    }));

    const formattedSub = (subCats || []).map((c: any) => ({
        id: c.id,
        name: c.name,
        name_ar: c.name_ar || c.name,
        slug: c.slug,
        image_url: c.image_url,
        parent_id: c.category_id, // Map FK to parent_id
        created_at: c.created_at
    }));

    return [...formattedMain, ...formattedSub];
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

    // Filter mainly by parent_id being null or undefined
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
