import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import ProductCard from '@/components/ProductCard';
import { useRecentlyViewed } from '@/contexts/RecentlyViewedContext';
import { Loader2, Eye } from 'lucide-react';

export const RecentlyViewedProducts = () => {
    const { recentlyViewed } = useRecentlyViewed();
    const [products, setProducts] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (recentlyViewed.length > 0) {
            fetchProducts();
        } else {
            setProducts([]);
        }
    }, [recentlyViewed]);

    const fetchProducts = async () => {
        setLoading(true);
        try {
            const { data, error } = await supabase
                .from('products')
                .select('*')
                .in('id', recentlyViewed.slice(0, 8));

            if (error) throw error;

            // Sort by recently viewed order
            const sorted = recentlyViewed
                .map((id) => data?.find((p) => p.id === id))
                .filter(Boolean);

            setProducts(sorted);
        } catch (error) {
            console.error('Error fetching recently viewed products:', error);
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
        <div className="mt-16 border-t pt-12">
            <div className="flex items-center gap-2 mb-6">
                <Eye className="h-6 w-6 text-primary" />
                <h2 className="text-2xl font-bold">شاهدت مؤخراً</h2>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                {products.map((product) => (
                    <ProductCard key={product.id} {...product} />
                ))}
            </div>
        </div>
    );
};
