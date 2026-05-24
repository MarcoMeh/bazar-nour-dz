import { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { ProductCard } from '@/components/ProductCard';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Loader2, Search, SlidersHorizontal, X } from 'lucide-react';
import SEO from '@/components/SEO';
import { toast } from 'sonner';

const AdvancedSearch = () => {
    const [searchParams, setSearchParams] = useSearchParams();
    const [products, setProducts] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [categories, setCategories] = useState<any[]>([]);

    // Search filters
    const [query, setQuery] = useState(searchParams.get('q') || '');
    const [selectedCategory, setSelectedCategory] = useState(searchParams.get('category') || '');
    const [selectedBrand, setSelectedBrand] = useState(searchParams.get('brand') || '');
    const [priceRange, setPriceRange] = useState([0, 50000]);
    const [sortBy, setSortBy] = useState('relevance');

    const fetchCategories = useCallback(async () => {
        const { data } = await supabase
            .from('categories')
            .select('*')
            .is('parent_id', null)
            .order('name');
        setCategories(data || []);
    }, []);

    const performSearch = useCallback(async () => {
        setLoading(true);
        try {
            let queryBuilder = supabase.from('products').select('*, stores(name)');

            // Text search
            if (query) {
                queryBuilder = queryBuilder.or(`name.ilike.%${query}%,description.ilike.%${query}%,brand.ilike.%${query}%`);
            }

            // Category filter
            if (selectedCategory) {
                queryBuilder = queryBuilder.eq('category_id', selectedCategory);
            }

            // Brand filter
            if (selectedBrand) {
                queryBuilder = queryBuilder.ilike('brand', selectedBrand);
            }

            // Price range
            queryBuilder = queryBuilder
                .gte('price', priceRange[0])
                .lte('price', priceRange[1]);

            // Sort
            switch (sortBy) {
                case 'price-asc':
                    queryBuilder = queryBuilder.order('price', { ascending: true });
                    break;
                case 'price-desc':
                    queryBuilder = queryBuilder.order('price', { ascending: false });
                    break;
                case 'newest':
                    queryBuilder = queryBuilder.order('created_at', { ascending: false });
                    break;
                default:
                    queryBuilder = queryBuilder.order('name', { ascending: true });
            }

            const { data, error } = await queryBuilder;

            if (error) throw error;

            const mappedProducts = (data || []).map((p: any) => ({
                ...p,
                storeName: p.stores?.name
            }));
            setProducts(mappedProducts || []);

            // Update URL
            const params = new URLSearchParams();
            if (query) params.set('q', query);
            if (selectedCategory) params.set('category', selectedCategory);
            if (selectedBrand) params.set('brand', selectedBrand);
            setSearchParams(params);

        } catch (error: any) {
            console.error('Search error:', error);
            toast.error('خطأ في البحث');
        } finally {
            setLoading(false);
        }
    }, [query, selectedCategory, selectedBrand, priceRange, sortBy, setSearchParams]);

    useEffect(() => {
        fetchCategories();
    }, [fetchCategories]);

    useEffect(() => {
        if (query || selectedCategory || selectedBrand) {
            performSearch();
        }
    }, [query, selectedCategory, selectedBrand, performSearch]);

    const clearFilters = () => {
        setQuery('');
        setSelectedCategory('');
        setSelectedBrand('');
        setPriceRange([0, 50000]);
        setProducts([]);
        setSearchParams({});
    };

    const activeFiltersCount = [query, selectedCategory, selectedBrand].filter(Boolean).length;

    return (
        <div className="min-h-screen bg-[#FAFAFA]">
            <SEO
                title="البحث المتقدم - بازارنا"
                description="ابحث عن المنتجات بدقة. فلتر حسب الفئة، الماركة، السعر والمزيد."
            />

            <div className="container mx-auto px-4 py-8">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold mb-2">البحث المتقدم</h1>
                    <p className="text-muted-foreground">
                        ابحث بدقة عن المنتج المثالي
                    </p>
                </div>

                {/* Search & Filters */}
                <Card className="p-6 mb-8">
                    <div className="space-y-6">
                        {/* Search Input */}
                        <div>
                            <div className="relative">
                                <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-5 w-5" />
                                <Input
                                    type="text"
                                    placeholder="ابحث عن منتج، ماركة..."
                                    value={query}
                                    onChange={(e) => setQuery(e.target.value)}
                                    onKeyPress={(e) => e.key === 'Enter' && performSearch()}
                                    className="pr-10 h-12 text-lg"
                                />
                            </div>
                        </div>

                        {/* Filters Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            {/* Category */}
                            <div>
                                <label className="text-sm font-medium mb-2 block">الفئة</label>
                                <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="كل الفئات" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="">كل الفئات</SelectItem>
                                        {categories.map((cat) => (
                                            <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            {/* Brand */}
                            <div>
                                <label className="text-sm font-medium mb-2 block">الماركة</label>
                                <Input
                                    placeholder="اسم الماركة..."
                                    value={selectedBrand}
                                    onChange={(e) => setSelectedBrand(e.target.value)}
                                />
                            </div>

                            {/* Sort */}
                            <div>
                                <label className="text-sm font-medium mb-2 block">الترتيب</label>
                                <Select value={sortBy} onValueChange={setSortBy}>
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="relevance">الأكثر صلة</SelectItem>
                                        <SelectItem value="newest">الأحدث</SelectItem>
                                        <SelectItem value="price-asc">السعر: من الأقل</SelectItem>
                                        <SelectItem value="price-desc">السعر: من الأعلى</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        {/* Price Range */}
                        <div>
                            <label className="text-sm font-medium mb-2 block">
                                نطاق السعر: {priceRange[0]} - {priceRange[1]} دج
                            </label>
                            <Slider
                                value={priceRange}
                                onValueChange={setPriceRange}
                                max={50000}
                                step={500}
                                className="mt-2"
                            />
                        </div>

                        {/* Action Buttons */}
                        <div className="flex gap-3">
                            <Button onClick={performSearch} className="flex-1" size="lg">
                                <Search className="h-5 w-5 ml-2" />
                                بحث
                            </Button>
                            {activeFiltersCount > 0 && (
                                <Button onClick={clearFilters} variant="outline" size="lg">
                                    <X className="h-5 w-5 ml-2" />
                                    مسح ({activeFiltersCount})
                                </Button>
                            )}
                        </div>
                    </div>
                </Card>

                {/* Results */}
                {loading && (
                    <div className="flex justify-center py-20">
                        <Loader2 className="h-12 w-12 animate-spin text-primary" />
                    </div>
                )}

                {!loading && products.length > 0 && (
                    <>
                        <div className="mb-6">
                            <Badge variant="secondary" className="text-lg px-4 py-2">
                                {products.length} نتيجة
                            </Badge>
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                            {products.map((product) => (
                                <ProductCard key={product.id} {...product} />
                            ))}
                        </div>
                    </>
                )}

                {!loading && products.length === 0 && (query || selectedCategory || selectedBrand) && (
                    <Card className="p-12 text-center">
                        <div className="text-6xl mb-4">🔍</div>
                        <h3 className="text-xl font-bold mb-2">لا توجد نتائج</h3>
                        <p className="text-muted-foreground mb-6">
                            جرب تغيير معايير البحث
                        </p>
                        <Button onClick={clearFilters} variant="outline">
                            مسح الفلاتر
                        </Button>
                    </Card>
                )}
            </div>
        </div>
    );
};

export default AdvancedSearch;
