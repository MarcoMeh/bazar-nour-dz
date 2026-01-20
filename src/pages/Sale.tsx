import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { ProductCard } from '@/components/ProductCard';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Loader2, Tag, TrendingDown } from 'lucide-react';
import SEO from '@/components/SEO';
import { toast } from 'sonner';

const Sale = () => {
    const [products, setProducts] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [sortBy, setSortBy] = useState('discount-desc');

    useEffect(() => {
        fetchSaleProducts();
    }, [sortBy]);

    const fetchSaleProducts = async () => {
        setLoading(true);
        try {
            let query = supabase
                .from('products')
                .select('*, stores(name)')
                .not('discount_percentage', 'is', null)
                .gt('discount_percentage', 0);

            // Apply sorting
            switch (sortBy) {
                case 'discount-desc':
                    query = query.order('discount_percentage', { ascending: false });
                    break;
                case 'price-asc':
                    query = query.order('price', { ascending: true });
                    break;
                case 'price-desc':
                    query = query.order('price', { ascending: false });
                    break;
                default:
                    query = query.order('created_at', { ascending: false });
            }

            const { data, error } = await query;

            if (error) throw error;
            const mappedProducts = (data || []).map((p: any) => ({
                ...p,
                storeName: p.stores?.name
            }));
            setProducts(mappedProducts || []);
        } catch (error: any) {
            console.error('Error fetching sale products:', error);
            toast.error('خطأ في تحميل المنتجات');
        } finally {
            setLoading(false);
        }
    };

    const calculateDiscountedPrice = (price: number, discount?: number) => {
        if (!discount) return price;
        return price - (price * discount / 100);
    };

    const totalSavings = products.reduce((sum, product) => {
        return sum + (product.price - calculateDiscountedPrice(product.price, product.discount_percentage));
    }, 0);

    return (
        <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-orange-50">
            <SEO
                title="التخفيضات - وفر الآن - بازارنا"
                description="احصل على أفضل العروض والتخفيضات على الملابس والأحذية والإكسسوارات. خصومات تصل إلى 70% على منتجات مختارة!"
            />

            <div className="container mx-auto px-4 py-12">
                {/* Header */}
                <div className="text-center mb-12">
                    <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-red-500 to-orange-500 mb-4 animate-pulse">
                        <Tag className="h-10 w-10 text-white" />
                    </div>
                    <h1 className="text-4xl md:text-6xl font-black mb-4 bg-gradient-to-r from-red-600 to-orange-600 bg-clip-text text-transparent">
                        التخفيضات الكبرى 🔥
                    </h1>
                    <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-6">
                        عروض حصرية وخصومات مذهلة على أفضل المنتجات
                    </p>

                    {/* Stats */}
                    <div className="flex justify-center gap-4 flex-wrap">
                        <Badge className="bg-red-500 text-white text-lg px-6 py-2">
                            {products.length} منتج مخفض
                        </Badge>
                        {totalSavings > 0 && (
                            <Badge variant="outline" className="text-lg px-6 py-2 border-red-500 text-red-600">
                                <TrendingDown className="h-4 w-4 ml-2" />
                                وفر حتى {totalSavings.toFixed(0)} دج
                            </Badge>
                        )}
                    </div>
                </div>

                {/* Sort */}
                {!loading && products.length > 0 && (
                    <div className="flex justify-end mb-6">
                        <Select value={sortBy} onValueChange={setSortBy}>
                            <SelectTrigger className="w-[220px]">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="discount-desc">أعلى خصم</SelectItem>
                                <SelectItem value="newest">الأحدث</SelectItem>
                                <SelectItem value="price-asc">السعر: من الأقل للأعلى</SelectItem>
                                <SelectItem value="price-desc">السعر: من الأعلى للأقل</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                )}

                {/* Loading */}
                {loading && (
                    <div className="flex justify-center py-20">
                        <Loader2 className="h-12 w-12 animate-spin text-red-500" />
                    </div>
                )}

                {/* No Products */}
                {!loading && products.length === 0 && (
                    <Card className="p-12 text-center max-w-md mx-auto">
                        <div className="text-6xl mb-4">🏷️</div>
                        <h3 className="text-xl font-bold mb-2">لا توجد تخفيضات حالياً</h3>
                        <p className="text-muted-foreground mb-6">
                            تابعنا للحصول على أحدث العروض والتخفيضات
                        </p>
                        <Link to="/products">
                            <Button>تصفح جميع المنتجات</Button>
                        </Link>
                    </Card>
                )}

                {/* Products Grid */}
                {!loading && products.length > 0 && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {products.map((product) => (
                            <div key={product.id} className="relative">
                                {/* Discount Badge */}
                                {product.discount_percentage && (
                                    <div className="absolute top-2 left-2 z-10">
                                        <Badge className="bg-red-600 text-white text-lg px-3 py-1 shadow-lg">
                                            -{product.discount_percentage}%
                                        </Badge>
                                    </div>
                                )}
                                <ProductCard {...product} />
                            </div>
                        ))}
                    </div>
                )}

                {/* CTA */}
                {!loading && products.length > 0 && (
                    <div className="mt-16 text-center">
                        <Card className="p-8 bg-gradient-to-r from-red-50 to-orange-50 border-2 border-red-200 max-w-2xl mx-auto">
                            <h3 className="text-2xl font-bold mb-2">لا تفوت هذه العروض!</h3>
                            <p className="text-muted-foreground mb-4">
                                العروض محدودة وقد تنتهي في أي وقت
                            </p>
                            <Link to="/products">
                                <Button variant="outline" size="lg">
                                    تصفح جميع المنتجات
                                </Button>
                            </Link>
                        </Card>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Sale;
