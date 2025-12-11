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
    subscription_end_date?: string | null;
    categories?: { id: string; name: string }[];
}

export interface StoreFilters {
    page?: number;
    pageSize?: number;
    categoryId?: string;
    search?: string;
}

export interface StoresResponse {
    stores: Store[];
    totalCount: number;
    totalPages: number;
    currentPage: number;
}

async function fetchStores(filters: StoreFilters = {}): Promise<StoresResponse> {
    const {
        page = 1,
        pageSize = 12,
        categoryId,
        search
    } = filters;

    let query = supabase
        .from('stores')
        .select(`
            *,
            store_categories!inner (
                categories (
                    id,
                    name
                )
            )
        `, { count: 'exact' })
        .eq('is_active', true)
        .or(`subscription_end_date.gt.${new Date().toISOString()},subscription_end_date.is.null`);

    // Apply filters
    if (categoryId && categoryId !== 'all') {
        // We use !inner on store_categories in select to ensure we only get stores that have the category
        // But we need to filter on the joined table column
        query = query.eq('store_categories.category_id', categoryId);
    } else {
        // If no category filter (or 'all'), we want ALL stores regardless of having a category.
        // So we redefine the query to use a standard LEFT JOIN (no !inner).

        query = supabase
            .from('stores')
            .select(`
                *,
                store_categories (
                    categories (
                        id,
                        name
                    )
                )
            `, { count: 'exact' })
            .eq('is_active', true)
            .or(`subscription_end_date.gt.${new Date().toISOString()},subscription_end_date.is.null`);
    }

    if (search) {
        query = query.ilike('name', `%${search}%`);
    }

    // Pagination
    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;

    // Order by name
    query = query.order('name', { ascending: true }).range(from, to);

    const { data, error, count } = await query;

    if (error) {
        throw new Error(error.message);
    }

    // Process data to flatten categories structure
    const processedStores = (data || []).map((store: any) => ({
        ...store,
        categories: store.store_categories?.map((sc: any) => sc.categories).filter(Boolean) || []
    }));

    const totalCount = count || 0;
    const totalPages = Math.ceil(totalCount / pageSize);

    return {
        stores: processedStores,
        totalCount,
        totalPages,
        currentPage: page,
    };
}

async function fetchStoreById(storeId: string): Promise<Store | null> {
    const { data, error } = await supabase
        .from('stores')
        .select('*')
        .eq('id', storeId)
        .eq('is_active', true)
        .or(`subscription_end_date.gt.${new Date().toISOString()},subscription_end_date.is.null`)
        .single();

    if (error) {
        if (error.code === 'PGRST116') return null;
        throw new Error(error.message);
    }

    return data as Store;
}

export function useStores(filters: StoreFilters = {}) {
    return useQuery({
        queryKey: ['stores', filters],
        queryFn: () => fetchStores(filters),
        staleTime: 5 * 60 * 1000,
        gcTime: 10 * 60 * 1000,
    });
}

export function useStore(storeId?: string | null) {
    return useQuery({
        queryKey: ['store', storeId],
        queryFn: () => fetchStoreById(storeId!),
        enabled: !!storeId,
        staleTime: 5 * 60 * 1000,
    });
}
