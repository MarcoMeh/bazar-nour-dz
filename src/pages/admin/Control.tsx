import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Loader2, X, Plus, Search } from "lucide-react";

interface SiteSettings {
    id: number;
    hero_visible: boolean;
    features_visible: boolean;
    products_visible: boolean;
    stores_visible: boolean;
    categories_visible: boolean;
    flash_sale_visible: boolean;
    trending_visible: boolean;
    newsletter_visible: boolean;
}

export default function AdminControl() {
    const [settings, setSettings] = useState<SiteSettings | null>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    const [flashSaleProducts, setFlashSaleProducts] = useState<any[]>([]);
    const [productSearchQuery, setProductSearchQuery] = useState("");
    const [searchResults, setSearchResults] = useState<any[]>([]);

    useEffect(() => {
        fetchSettings();
        fetchFlashSaleProducts();
    }, []);

    const fetchFlashSaleProducts = async () => {
        const { data, error } = await supabase
            .from('flash_sale_items')
            .select(`
                id,
                product:products (
                    id,
                    name_ar,
                    image_url,
                    price
                )
            `);

        if (error) {
            console.error('Error fetching flash sale items:', error);
            return;
        }

        if (data) {
            // Flatten the structure for the UI
            const formattedData = data.map((item: any) => ({
                id: item.product.id, // Use product ID for UI logic match
                flash_sale_item_id: item.id,
                name_ar: item.product.name_ar,
                image_url: item.product.image_url,
                price: item.product.price
            }));
            setFlashSaleProducts(formattedData);
        }
    };

    const searchProducts = async () => {
        if (!productSearchQuery.trim()) return;
        const { data } = await supabase
            .from('products')
            .select('id, name_ar, image_url, price')
            .ilike('name_ar', `%${productSearchQuery}%`)
            .limit(5);
        if (data) setSearchResults(data);
    };

    const addToFlashSale = async (productId: string) => {
        // Check if already exists to avoid unique constraint error (though UI should handle this, safety first)
        const { error } = await supabase
            .from('flash_sale_items')
            .insert({ product_id: productId });

        if (error) {
            console.error("Error adding to flash sale:", error);
            if (error.code === '23505') { // Unique violation
                toast.error("المنتج موجود بالفعل في عروض فلاش");
            } else {
                toast.error("حدث خطأ أثناء إضافة المنتج");
            }
            return;
        }

        fetchFlashSaleProducts();
        setSearchResults([]);
        setProductSearchQuery("");
        toast.success("تم إضافة المنتج لعروض فلاش");
    };

    const removeFromFlashSale = async (productId: string) => {
        // We delete by product_id for convenience since we map it in the UI
        const { error } = await supabase
            .from('flash_sale_items')
            .delete()
            .eq('product_id', productId);

        if (error) {
            console.error("Error removing from flash sale:", error);
            toast.error("حدث خطأ أثناء حذف المنتج");
            return;
        }

        fetchFlashSaleProducts();
        toast.success("تم إزالة المنتج من عروض فلاش");
    };

    const fetchSettings = async () => {
        try {
            const { data, error } = await supabase
                .from("site_settings" as any)
                .select("*")
                .single();

            if (error) {
                console.error("Error fetching settings:", error);
            } else {
                setSettings(data as any);
            }
        } catch (error) {
            console.error("Error:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleToggle = (key: keyof SiteSettings) => {
        if (!settings) return;
        setSettings({ ...settings, [key]: !settings[key] });
    };

    const handleSave = async () => {
        if (!settings) return;
        setSaving(true);
        try {
            const { error } = await supabase
                .from("site_settings" as any)
                .update({
                    hero_visible: settings.hero_visible,
                    features_visible: settings.features_visible,
                    products_visible: settings.products_visible,
                    stores_visible: settings.stores_visible,
                    categories_visible: settings.categories_visible,
                    flash_sale_visible: settings.flash_sale_visible,
                    trending_visible: settings.trending_visible,
                    newsletter_visible: settings.newsletter_visible,
                })
                .eq("id", 1); // Assuming single row with ID 1

            if (error) throw error;
            toast.success("تم حفظ التغييرات بنجاح");
        } catch (error) {
            console.error("Error saving settings:", error);
            toast.error("حدث خطأ أثناء الحفظ");
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return <div className="p-8 flex justify-center"><Loader2 className="animate-spin" /></div>;
    }

    if (!settings) {
        return <div className="p-8 text-center">فشل في تحميل الإعدادات. يرجى التأكد من تشغيل سكربت قاعدة البيانات.</div>;
    }

    return (
        <div className="p-8">
            <h1 className="text-3xl font-bold mb-8 text-primary">لوحة التحكم في الصفحة الرئيسية</h1>

            <div className="grid gap-6">
                {/* Hero Section Control */}
                <Card>
                    <CardHeader>
                        <CardTitle>قسم البطل (Hero)</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex items-center justify-between">
                            <Label htmlFor="hero-visible">إظهار قسم البطل</Label>
                            <Switch
                                id="hero-visible"
                                checked={settings.hero_visible}
                                onCheckedChange={() => handleToggle("hero_visible")}
                            />
                        </div>
                    </CardContent>
                </Card>

                {/* Features Section Control */}
                <Card>
                    <CardHeader>
                        <CardTitle>قسم المميزات</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex items-center justify-between">
                            <Label htmlFor="features-visible">إظهار قسم المميزات</Label>
                            <Switch
                                id="features-visible"
                                checked={settings.features_visible}
                                onCheckedChange={() => handleToggle("features_visible")}
                            />
                        </div>
                    </CardContent>
                </Card>

                {/* Best Products Control */}
                <Card>
                    <CardHeader>
                        <CardTitle>أفضل المنتجات</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex items-center justify-between">
                            <Label htmlFor="products-visible">إظهار قسم أفضل المنتجات</Label>
                            <Switch
                                id="products-visible"
                                checked={settings.products_visible}
                                onCheckedChange={() => handleToggle("products_visible")}
                            />
                        </div>
                    </CardContent>
                </Card>

                {/* Stores Section Control */}
                <Card>
                    <CardHeader>
                        <CardTitle>قسم المحلات</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex items-center justify-between">
                            <Label htmlFor="stores-visible">إظهار قسم المحلات</Label>
                            <Switch
                                id="stores-visible"
                                checked={settings.stores_visible}
                                onCheckedChange={() => handleToggle("stores_visible")}
                            />
                        </div>
                    </CardContent>
                </Card>

                {/* Categories Section Control */}
                <Card>
                    <CardHeader>
                        <CardTitle>قسم التصنيفات</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex items-center justify-between">
                            <Label htmlFor="categories-visible">إظهار قسم التصنيفات</Label>
                            <Switch
                                id="categories-visible"
                                checked={settings.categories_visible}
                                onCheckedChange={() => handleToggle("categories_visible")}
                            />
                        </div>
                    </CardContent>
                </Card>

                {/* Flash Sale Control */}
                <Card>
                    <CardHeader>
                        <CardTitle>عروض فلاش</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex items-center justify-between">
                            <Label htmlFor="flash-sale-visible">إظهار قسم عروض فلاش</Label>
                            <Switch
                                id="flash-sale-visible"
                                checked={settings.flash_sale_visible}
                                onCheckedChange={() => handleToggle("flash_sale_visible")}
                            />
                        </div>

                        <div className="mt-6 border-t pt-4">
                            <h3 className="font-bold mb-4">منتجات عروض فلاش</h3>

                            {/* Active Products */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                                {flashSaleProducts.map(p => (
                                    <div key={p.id} className="flex items-center gap-2 border p-2 rounded relative bg-gray-50">
                                        <img src={p.image_url || "/placeholder.svg"} className="w-10 h-10 rounded object-cover" />
                                        <div className="text-sm truncate flex-1">{p.name_ar}</div>
                                        <Button variant="ghost" size="icon" className="h-6 w-6 text-red-500 hover:text-red-700 hover:bg-red-100" onClick={() => removeFromFlashSale(p.id)}>
                                            <X className="h-4 w-4" />
                                        </Button>
                                    </div>
                                ))}
                                {flashSaleProducts.length === 0 && <p className="text-sm text-gray-500 col-span-2">لا توجد منتجات في عروض فلاش حالياً</p>}
                            </div>

                            {/* Add Product */}
                            <div className="flex gap-2">
                                <Input
                                    placeholder="بحث عن منتج لإضافته..."
                                    value={productSearchQuery}
                                    onChange={e => setProductSearchQuery(e.target.value)}
                                    onKeyDown={(e) => e.key === 'Enter' && searchProducts()}
                                />
                                <Button onClick={searchProducts} variant="secondary"><Search className="h-4 w-4" /></Button>
                            </div>

                            {/* Search Results */}
                            {searchResults.length > 0 && (
                                <div className="mt-2 border rounded-md p-2 space-y-1 max-h-40 overflow-y-auto bg-white shadow-sm">
                                    {searchResults.map(p => (
                                        <div key={p.id} className="flex justify-between items-center p-2 hover:bg-gray-100 cursor-pointer rounded transition-colors" onClick={() => addToFlashSale(p.id)}>
                                            <div className="flex items-center gap-2">
                                                <img src={p.image_url || "/placeholder.svg"} className="w-8 h-8 rounded object-cover" />
                                                <span className="text-sm">{p.name_ar}</span>
                                            </div>
                                            <Plus className="h-4 w-4 text-green-600" />
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </CardContent>
                </Card>

                {/* Trending Control */}
                <Card>
                    <CardHeader>
                        <CardTitle>الأكثر مبيعاً (Trending)</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex items-center justify-between">
                            <Label htmlFor="trending-visible">إظهار قسم الأكثر مبيعاً</Label>
                            <Switch
                                id="trending-visible"
                                checked={settings.trending_visible}
                                onCheckedChange={() => handleToggle("trending_visible")}
                            />
                        </div>
                    </CardContent>
                </Card>

                {/* Newsletter Control */}
                <Card>
                    <CardHeader>
                        <CardTitle>النشرة البريدية</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex items-center justify-between">
                            <Label htmlFor="newsletter-visible">إظهار قسم النشرة البريدية</Label>
                            <Switch
                                id="newsletter-visible"
                                checked={settings.newsletter_visible}
                                onCheckedChange={() => handleToggle("newsletter_visible")}
                            />
                        </div>
                    </CardContent>
                </Card>

                <div className="flex justify-end">
                    <Button size="lg" onClick={handleSave} disabled={saving}>
                        {saving && <Loader2 className="ml-2 h-4 w-4 animate-spin" />}
                        حفظ التغييرات
                    </Button>
                </div>
            </div>
        </div>
    );
}
