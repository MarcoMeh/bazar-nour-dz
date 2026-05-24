import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { ProductCard } from '@/components/ProductCard';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Loader2, Sparkles, Calendar } from 'lucide-react';
import SEO from '@/components/SEO';
import { toast } from 'sonner';

const NewArrivals = () => {
    const [products, setProducts] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [sortBy, setSortBy] = useState('newest');
    const [daysFilter, setDaysFilter] = useState('30');

    const fetchNewProducts = useCallback(async () => {
        setLoading(true);
        try {
            // Calculate date threshold
            const daysAgo = new Date();
            daysAgo.setDate(daysAgo.getDate() - parseInt(daysFilter));

            let query = supabase
                .from('products')
                .select('*, stores(name)')
                .gte('created_at', daysAgo.toISOString());

            // Apply sorting
            switch (sortBy) {
                case 'newest':
                    query = query.order('created_at', { ascending: false });
                    break;
                case 'price-asc':
                    query = query.order('price', { ascending: true });
                    break;
                case 'price-desc':
                    query = query.order('price', { ascending: false });
                    break;
                case 'name':
                    query = query.order('name', { ascending: true });
                    break;
            }

            const { data, error } = await query;

            if (error) throw error;
            const mappedProducts = (data || []).map((p: any) => ({
                ...p,
                storeName: p.stores?.name
            }));
            setProducts(mappedProducts || []);
        } catch (error: any) {
            console.error('Error fetching new products:', error);
            toast.error('خطأ في تحميل المنتجات');
        } finally {
            setLoading(false);
        }
    }, [sortBy, daysFilter]);

    useEffect(() => {
        fetchNewProducts();
    }, [fetchNewProducts]);

    const getDaysAgo = (dateString: string) => {
        const created = new Date(dateString);
        const now = new Date();
        const diffTime = Math.abs(now.getTime() - created.getTime());
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return diffDays;
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
            <SEO
                title="وصل حديثاً - أحدث المنتجات - بازارنا"
                description="اكتشف أحدث الإضافات إلى متجرنا! ملابس وأحذية وإكسسوارات جديدة تصل يومياً. كن أول من يتسوق أحدث صيحات الموضة."
            />

            <div className="container mx-auto px-4 py-12">
                {/* Header */}
                <div className="text-center mb-12">
                    <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 mb-4">
                        <Sparkles className="h-10 w-10 text-white" />
                    </div>
                    <h1 className="text-4xl md:text-6xl font-black mb-4 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                        وصل حديثاً ✨
                    </h1>
                    <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-6">
                        اكتشف أحدث المنتجات والإضافات الجديدة إلى متجرنا
                    </p>

                    {/* Stats */}
                    <Badge className="bg-blue-500 text-white text-lg px-6 py-2">
                        {products.length} منتج جديد
                    </Badge>
                </div>

                {/* Filters */}
                {!loading && products.length > 0 && (
                    <div className="flex flex-wrap justify-between items-center gap-4 mb-6">
                        <div className="flex items-center gap-2">
                            <Calendar className="h-5 w-5 text-muted-foreground" />
                            <Select value={daysFilter} onValueChange={setDaysFilter}>
                                <SelectTrigger className="w-[180px]">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="7">آخر 7 أيام</SelectItem>
                                    <SelectItem value="14">آخر أسبوعين</SelectItem>
                                    <SelectItem value="30">آخر شهر</SelectItem>
                                    <SelectItem value="60">آخر شهرين</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <Select value={sortBy} onValueChange={setSortBy}>
                            <SelectTrigger className="w-[220px]">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="newest">الأحدث أولاً</SelectItem>
                                <SelectItem value="price-asc">السعر: من الأقل للأعلى</SelectItem>
                                <SelectItem value="price-desc">السعر: من الأعلى للأقل</SelectItem>
                                <SelectItem value="name">الاسم</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                )}

                {/* Loading */}
                {loading && (
                    <div className="flex justify-center py-20">
                        <Loader2 className="h-12 w-12 animate-spin text-blue-500" />
                    </div>
                )}

                {/* No Products */}
                {!loading && products.length === 0 && (
                    <Card className="p-12 text-center max-w-md mx-auto">
                        <div className="text-6xl mb-4">📦</div>
                        <h3 className="text-xl font-bold mb-2">لا توجد منتجات جديدة</h3>
                        <p className="text-muted-foreground mb-6">
                            جرب فترة زمنية أطول أو تابعنا لمعرفة الإضافات الجديدة
                        </p>
                        <Link to="/products">
                            <Button>تصفح جميع المنتجات</Button>
                        </Link>
                    </Card>
                )}

                {/* Products Grid */}
                {!loading && products.length > 0 && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {products.map((product) => {
                            const daysAgo = getDaysAgo(product.created_at);
                            return (
                                <div key={product.id} className="relative">
                                    {/* New Badge */}
                                    {daysAgo <= 7 && (
                                        <div className="absolute top-2 left-2 z-10">
                                            <Badge className="bg-gradient-to-r from-blue-600 to-purple-600 text-white text-sm px-3 py-1 shadow-lg">
                                                <Sparkles className="h-3 w-3 ml-1" />
                                                جديد
                                            </Badge>
                                        </div>
                                    )}
                                    {/* Days Badge */}
                                    <div className="absolute top-2 right-2 z-10">
                                        <Badge variant="outline" className="bg-white/90 text-xs">
                                            منذ {daysAgo} {daysAgo === 1 ? 'يوم' : 'أيام'}
                                        </Badge>
                                    </div>
                                    <ProductCard {...product} />
                                </div>
                            );
                        })}
                    </div>
                )}

                {/* CTA */}
                {!loading && products.length > 0 && (
                    <div className="mt-16 text-center">
                        <Card className="p-8 bg-gradient-to-r from-blue-50 to-purple-50 border-2 border-blue-200 max-w-2xl mx-auto">
                            <Sparkles className="h-12 w-12 mx-auto mb-4 text-blue-500" />
                            <h3 className="text-2xl font-bold mb-2">كن أول من يعرف!</h3>
                            <p className="text-muted-foreground mb-4">
                                نضيف منتجات جديدة يومياً. تابع صفحتنا لتبقى على اطلاع
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

export default NewArrivals;
