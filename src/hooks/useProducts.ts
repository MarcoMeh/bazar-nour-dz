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
    storeName?: string;
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

    // Check if stress test simulation is active (100 stores / 1500 products)
    const isStressTest = typeof window !== 'undefined' && localStorage.getItem("simulation_stress_test") === "true";
    if (isStressTest) {
        try {
            // Dynamic import to prevent build failure if file is cleaned up
            const stressTestData = await import("@/config/stress_test_data.json");
            if (stressTestData && stressTestData.default) {
                let list = [...stressTestData.default.products];
                
                // Apply filters locally
                if (storeId) {
                    list = list.filter(p => p.store_id === storeId);
                }
                if (categoryId) {
                    list = list.filter(p => p.category_id === categoryId);
                }
                if (subcategoryId) {
                    list = list.filter(p => p.subcategory_id === subcategoryId);
                }
                if (search) {
                    const lowSearch = search.toLowerCase();
                    list = list.filter(p => 
                        (p.name && p.name.toLowerCase().includes(lowSearch)) || 
                        (p.name_ar && p.name_ar.includes(search))
                    );
                }
                if (minPrice !== undefined) {
                    list = list.filter(p => p.price >= minPrice);
                }
                if (maxPrice !== undefined) {
                    list = list.filter(p => p.price <= maxPrice);
                }
                
                // Sort locally
                const ascending = sortOrder === 'asc';
                list.sort((a: any, b: any) => {
                    const valA = a[sortBy] ?? '';
                    const valB = b[sortBy] ?? '';
                    if (valA < valB) return ascending ? -1 : 1;
                    if (valA > valB) return ascending ? 1 : -1;
                    return 0;
                });
                
                const totalCount = list.length;
                const totalPages = Math.ceil(totalCount / pageSize);
                
                // Pagination slice
                const from = (page - 1) * pageSize;
                const to = from + pageSize;
                const slicedProducts = list.slice(from, to).map(p => ({
                    ...p,
                    is_delivery_home_available: true,
                    is_delivery_desktop_available: true,
                    is_sold_out: false,
                    is_free_delivery: false,
                    storeName: `متجر النخبة الافتراضي`
                })) as Product[];
                
                return {
                    products: slicedProducts,
                    totalCount,
                    totalPages,
                    currentPage: page
                };
            }
        } catch (e) {
            console.warn("Stress test mock data file not found. Falling back to Supabase.", e);
        }
    }

    // Base query joining with stores to check for active status
    let query: any = supabase.from('products').select('*, stores!inner(*)', { count: 'exact' });

    // Apply store visibility filters
    query = query
        .eq('stores.is_active', true)
        .or(`is_manually_suspended.is.false,is_manually_suspended.is.null`, { foreignTable: 'stores' })
        .or(`subscription_end_date.gt.${new Date().toISOString()},subscription_end_date.is.null`, { foreignTable: 'stores' });

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

    // Flatten logic: data has a 'stores' property from the join.
    // We return only the product fields to maintain compatibility.
    const products = (data || []).map((item: any) => {
        const { stores, ...product } = item;
        return {
            ...product,
            storeName: stores?.name
        };
    }) as Product[];

    return {
        products,
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
