import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Loader2, Search, Package } from 'lucide-react';
import SEO from '@/components/SEO';
import { toast } from 'sonner';

interface Brand {
    name: string;
    slug: string;
    count: number;
}

const Brands = () => {
    const [brands, setBrands] = useState<Brand[]>([]);
    const [filteredBrands, setFilteredBrands] = useState<Brand[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        fetchBrands();
    }, []);

    useEffect(() => {
        if (searchQuery) {
            setFilteredBrands(
                brands.filter((brand) =>
                    brand.name.toLowerCase().includes(searchQuery.toLowerCase())
                )
            );
        } else {
            setFilteredBrands(brands);
        }
    }, [searchQuery, brands]);

    const fetchBrands = async () => {
        setLoading(true);
        try {
            // Get all products with brands
            const { data: products, error } = await supabase
                .from('products')
                .select('brand')
                .not('brand', 'is', null)
                .neq('brand', '');

            if (error) throw error;

            // Count products per brand
            const brandCounts: { [key: string]: number } = {};
            products?.forEach((product) => {
                if (product.brand) {
                    brandCounts[product.brand] = (brandCounts[product.brand] || 0) + 1;
                }
            });

            // Convert to array and create slugs
            const brandsArray: Brand[] = Object.entries(brandCounts)
                .map(([name, count]) => ({
                    name,
                    slug: name.toLowerCase().replace(/\s+/g, '-'),
                    count,
                }))
                .sort((a, b) => a.name.localeCompare(b.name, 'ar'));

            setBrands(brandsArray);
            setFilteredBrands(brandsArray);
        } catch (error: any) {
            console.error('Error fetching brands:', error);
            toast.error('خطأ في تحميل الماركات');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#FAFAFA]">
            <SEO
                title="الماركات - بازارنا"
                description="تصفح أفضل الماركات العالمية والمحلية في بازارنا. Nike, Adidas, Zara وأكثر من ذلك بأفضل الأسعار."
            />

            <div className="container mx-auto px-4 py-12">
                {/* Header */}
                <div className="text-center mb-12">
                    <h1 className="text-4xl md:text-5xl font-black mb-4 bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">
                        جميع الماركات
                    </h1>
                    <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                        اكتشف مجموعة واسعة من الماركات العالمية والمحلية
                    </p>
                </div>

                {/* Search */}
                <div className="max-w-xl mx-auto mb-8">
                    <div className="relative">
                        <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-5 w-5" />
                        <Input
                            type="text"
                            placeholder="ابحث عن ماركة..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pr-10 h-12 text-lg"
                        />
                    </div>
                </div>

                {/* Loading */}
                {loading && (
                    <div className="flex justify-center py-20">
                        <Loader2 className="h-12 w-12 animate-spin text-primary" />
                    </div>
                )}

                {/* No brands */}
                {!loading && filteredBrands.length === 0 && (
                    <Card className="p-12 text-center max-w-md mx-auto">
                        <Package className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
                        <h3 className="text-xl font-bold mb-2">لا توجد ماركات</h3>
                        <p className="text-muted-foreground">
                            {searchQuery ? 'لم نجد ماركات مطابقة للبحث' : 'لا توجد ماركات متاحة حالياً'}
                        </p>
                    </Card>
                )}

                {/* Brands Grid */}
                {!loading && filteredBrands.length > 0 && (
                    <>
                        <div className="mb-6 text-center">
                            <Badge variant="secondary" className="text-lg px-4 py-2">
                                {filteredBrands.length} ماركة متاحة
                            </Badge>
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                            {filteredBrands.map((brand) => (
                                <Link key={brand.slug} to={`/brands/${brand.slug}`}>
                                    <Card className="p-6 hover:shadow-xl transition-all duration-300 group border-2 hover:border-primary cursor-pointer">
                                        <div className="text-center">
                                            <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-gradient-to-br from-green-100 to-blue-100 flex items-center justify-center group-hover:scale-110 transition-transform">
                                                <span className="text-3xl font-black text-primary">
                                                    {brand.name.charAt(0).toUpperCase()}
                                                </span>
                                            </div>
                                            <h3 className="font-bold text-lg mb-2 group-hover:text-primary transition-colors">
                                                {brand.name}
                                            </h3>
                                            <Badge variant="outline" className="text-sm">
                                                {brand.count} منتج
                                            </Badge>
                                        </div>
                                    </Card>
                                </Link>
                            ))}
                        </div>
                    </>
                )}

                {/* Popular Brands Section */}
                {!loading && !searchQuery && brands.length > 0 && (
                    <div className="mt-16">
                        <h2 className="text-2xl font-bold text-center mb-8">الماركات الأكثر طلباً</h2>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto">
                            {brands
                                .sort((a, b) => b.count - a.count)
                                .slice(0, 8)
                                .map((brand) => (
                                    <Link
                                        key={brand.slug}
                                        to={`/brands/${brand.slug}`}
                                        className="group"
                                    >
                                        <Card className="p-4 text-center hover:bg-primary/5 transition-all">
                                            <div className="font-bold text-lg mb-1 group-hover:text-primary">
                                                {brand.name}
                                            </div>
                                            <div className="text-sm text-muted-foreground">
                                                {brand.count} منتجات
                                            </div>
                                        </Card>
                                    </Link>
                                ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Brands;
