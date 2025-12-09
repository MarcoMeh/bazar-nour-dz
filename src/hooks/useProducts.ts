import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface ProductFilters {
    page?: number;
    pageSize?: number;
    categoryId?: string;
    subcategoryId?: string;
    storeId?: string;
    search?: string;
    minPrice?: number;
    maxPrice?: number;
    colors?: string[];
    sizes?: string[];
    categoryIds?: string[];
    // New filters
    isFreeDelivery?: boolean;
    isHomeDelivery?: boolean;
    isDesktopDelivery?: boolean;
    inStockOnly?: boolean;
    minRating?: number;
    // New sort options
    sortBy?: 'name' | 'price' | 'created_at' | 'view_count' | 'average_rating';
    sortOrder?: 'asc' | 'desc';
}

export interface Product {
    id: string;
    name: string;
    name_ar: string;
    description?: string;
    description_ar?: string;
    price: number;
    image_url?: string;
    category_id?: string;
    subcategory_id?: string;
    store_id: string; // Required for ProductCard
    colors?: string[];
    sizes?: string[];
    is_delivery_home_available: boolean;
    is_delivery_desktop_available: boolean;
    is_sold_out: boolean;
    is_free_delivery: boolean;
    delivery_type?: string;
    created_at?: string;
    view_count?: number;
    average_rating?: number;
}

export interface ProductsResponse {
    products: Product[];
    totalCount: number;
    totalPages: number;
    currentPage: number;
}

async function fetchProducts(filters: ProductFilters = {}): Promise<ProductsResponse> {
    const {
        page = 1,
        pageSize = 12,
        categoryId,
        subcategoryId,
        storeId,
        search,
        minPrice,
        maxPrice,
        colors,
        sizes,
        isFreeDelivery,
        isHomeDelivery,
        isDesktopDelivery,
        inStockOnly,
        minRating,
        sortBy = 'created_at',
        sortOrder = 'desc',
    } = filters;

    let query: any = supabase.from('products').select('*', { count: 'exact' });

    // Apply filters
    if (storeId) {
        query = query.eq('store_id', storeId);
    }

    if (filters.categoryIds && filters.categoryIds.length > 0) {
        query = query.in('category_id', filters.categoryIds);
    } else if (subcategoryId) {
        query = query.eq('subcategory_id', subcategoryId);
    } else if (categoryId) {
        query = query.eq('category_id', categoryId);
    }

    if (search) {
        query = query.ilike('name', `%${search}%`);
    }

    if (minPrice !== undefined) {
        query = query.gte('price', minPrice);
    }

    if (maxPrice !== undefined) {
        query = query.lte('price', maxPrice);
    }

    // Filter by colors - if product has any of the selected colors
    if (colors && colors.length > 0) {
        // For array overlap: check if any color in the filter exists in product.colors
        query = query.or(colors.map(c => `colors.cs.{${c}}`).join(','));
    }

    // Filter by sizes - if product has any of the selected sizes
    if (sizes && sizes.length > 0) {
        query = query.or(sizes.map(s => `sizes.cs.{${s}}`).join(','));
    }

    // New delivery filters
    if (isFreeDelivery !== undefined) {
        query = query.eq('is_free_delivery', isFreeDelivery);
    }

    if (isHomeDelivery !== undefined) {
        query = query.eq('is_delivery_home_available', isHomeDelivery);
    }

    if (isDesktopDelivery !== undefined) {
        query = query.eq('is_delivery_desktop_available', isDesktopDelivery);
    }

    // Stock filter
    if (inStockOnly) {
        query = query.eq('is_sold_out', false);
    }

    // Rating filter
    if (minRating !== undefined) {
        query = query.gte('average_rating', minRating);
    }

    // Pagination
    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;
    query = query.range(from, to);

    // Sorting
    const ascending = sortOrder === 'asc';
    query = query.order(sortBy, { ascending });

    const { data, error, count } = await query;

    if (error) {
        throw new Error(error.message);
    }

    const totalCount = count || 0;
    const totalPages = Math.ceil(totalCount / pageSize);

    return {
        products: (data || []) as unknown as Product[],
        totalCount,
        totalPages,
        currentPage: page,
    };
}

export function useProducts(filters: ProductFilters = {}) {
    return useQuery<ProductsResponse, Error>({
        queryKey: ['products', filters],
        queryFn: () => fetchProducts(filters),
        staleTime: 5 * 60 * 1000, // 5 minutes
        gcTime: 10 * 60 * 1000, // 10 minutes (formerly cacheTime)
    });
}
