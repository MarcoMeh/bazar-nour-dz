import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import ProductCard from '@/components/ProductCard';
import { Loader2 } from 'lucide-react';

interface SimilarProductsProps {
    currentProductId: string;
    categoryId?: string;
    brand?: string;
    limit?: number;
}

export const SimilarProducts = ({
    currentProductId,
    categoryId,
    brand,
    limit = 4,
}: SimilarProductsProps) => {
    const [products, setProducts] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchSimilarProducts();
    }, [currentProductId, categoryId, brand]);

    const fetchSimilarProducts = async () => {
        setLoading(true);
        try {
            let query = supabase
                .from('products')
                .select('*')
                .neq('id', currentProductId)
                .limit(limit);

            // Priority 1: Same brand and category
            if (brand && categoryId) {
                const { data: sameBrandCategory } = await query
                    .eq('brand', brand)
                    .eq('category_id', categoryId);

                if (sameBrandCategory && sameBrandCategory.length >= limit) {
                    setProducts(sameBrandCategory);
                    setLoading(false);
                    return;
                }
            }

            // Priority 2: Same category
            if (categoryId) {
                const { data: sameCategory } = await query
                    .eq('category_id', categoryId);

                if (sameCategory && sameCategory.length > 0) {
                    setProducts(sameCategory.slice(0, limit));
                    setLoading(false);
                    return;
                }
            }

            // Priority 3: Same brand
            if (brand) {
                const { data: sameBrand } = await query
                    .eq('brand', brand);

                if (sameBrand && sameBrand.length > 0) {
                    setProducts(sameBrand.slice(0, limit));
                    setLoading(false);
                    return;
                }
            }

            // Fallback: Random products
            const { data: randomProducts } = await query
                .order('created_at', { ascending: false });

            setProducts(randomProducts?.slice(0, limit) || []);
        } catch (error) {
            console.error('Error fetching similar products:', error);
            setProducts([]);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    if (products.length === 0) {
        return null;
    }

    return (
        <div className="mt-16">
            <h2 className="text-2xl font-bold mb-6">منتجات مشابهة</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {products.map((product) => (
                    <ProductCard key={product.id} {...product} />
                ))}
            </div>
        </div>
    );
};
