import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { ProductCard } from '@/components/ProductCard';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2, ArrowRight, SlidersHorizontal } from 'lucide-react';
import SEO from '@/components/SEO';
import { toast } from 'sonner';

const BrandProducts = () => {
    const { slug } = useParams<{ slug: string }>();
    const [products, setProducts] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [brandName, setBrandName] = useState('');
    const [sortBy, setSortBy] = useState('newest');

    useEffect(() => {
        if (slug) {
            fetchBrandProducts();
        }
    }, [slug, sortBy]);

    const fetchBrandProducts = async () => {
        setLoading(true);
        try {
            // Convert slug back to brand name (basic conversion)
            const decodedBrand = slug?.replace(/-/g, ' ') || '';

            let query = supabase
                .from('products')
                .select('*')
                .ilike('brand', decodedBrand);

            // Apply sorting
            switch (sortBy) {
                case 'price-asc':
                    query = query.order('price', { ascending: true });
                    break;
                case 'price-desc':
                    query = query.order('price', { ascending: false });
                    break;
                case 'name':
                    query = query.order('name', { ascending: true });
                    break;
                default:
                    query = query.order('created_at', { ascending: false });
            }

            const { data, error } = await query;

            if (error) throw error;

            if (data && data.length > 0) {
                // Cast to any to avoid TS error about missing brand property
                const firstItem = data[0] as any;
                setBrandName(firstItem.brand || decodedBrand);
                setProducts(data);
            } else {
                setBrandName(decodedBrand);
                setProducts([]);
            }
        } catch (error: any) {
            console.error('Error fetching brand products:', error);
            toast.error('خطأ في تحميل المنتجات');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#FAFAFA]">
            <SEO
                title={`${brandName} - الماركات - بازارنا`}
                description={`تسوق منتجات ${brandName} بأفضل الأسعار. تشكيلة واسعة من الملابس والأحذية والإكسسوارات.`}
            />

            <div className="container mx-auto px-4 py-8">
                {/* Breadcrumb */}
                <div className="flex items-center gap-2 text-sm mb-6">
                    <Link to="/" className="text-muted-foreground hover:text-primary">
                        الرئيسية
                    </Link>
                    <ArrowRight className="h-4 w-4 text-muted-foreground" />
                    <Link to="/brands" className="text-muted-foreground hover:text-primary">
                        الماركات
                    </Link>
                    <ArrowRight className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium">{brandName}</span>
                </div>

                {/* Header */}
                <div className="mb-8">
                    <div className="flex items-center justify-between mb-4">
                        <div>
                            <h1 className="text-3xl md:text-4xl font-black mb-2">
                                منتجات {brandName}
                            </h1>
                            <p className="text-muted-foreground">
                                {loading ? '...' : `${products.length} منتج متاح`}
                            </p>
                        </div>

                        {/* Sort */}
                        {!loading && products.length > 0 && (
                            <div className="flex items-center gap-2">
                                <SlidersHorizontal className="h-5 w-5 text-muted-foreground" />
                                <Select value={sortBy} onValueChange={setSortBy}>
                                    <SelectTrigger className="w-[200px]">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="newest">الأحدث</SelectItem>
                                        <SelectItem value="price-asc">السعر: من الأقل للأعلى</SelectItem>
                                        <SelectItem value="price-desc">السعر: من الأعلى للأقل</SelectItem>
                                        <SelectItem value="name">الاسم</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        )}
                    </div>
                </div>

                {/* Loading */}
                {loading && (
                    <div className="flex justify-center py-20">
                        <Loader2 className="h-12 w-12 animate-spin text-primary" />
                    </div>
                )}

                {/* No Products */}
                {!loading && products.length === 0 && (
                    <Card className="p-12 text-center max-w-md mx-auto">
                        <div className="text-6xl mb-4">📦</div>
                        <h3 className="text-xl font-bold mb-2">لا توجد منتجات</h3>
                        <p className="text-muted-foreground mb-6">
                            لا توجد منتجات متاحة حالياً من ماركة {brandName}
                        </p>
                        <Link to="/brands">
                            <Button variant="outline">العودة للماركات</Button>
                        </Link>
                    </Card>
                )}

                {/* Products Grid */}
                {!loading && products.length > 0 && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {products.map((product) => (
                            <ProductCard
                                key={product.id}
                                {...product}
                            />
                        ))}
                    </div>
                )}

                {/* Back to Brands */}
                {!loading && (
                    <div className="mt-12 text-center">
                        <Link to="/brands">
                            <Button variant="outline" size="lg" className="gap-2">
                                <ArrowRight className="h-5 w-5" />
                                العودة لجميع الماركات
                            </Button>
                        </Link>
                    </div>
                )}
            </div>
        </div>
    );
};

export default BrandProducts;
