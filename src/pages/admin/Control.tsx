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
            .from('flash_sale_items' as any)
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
            .from('flash_sale_items' as any)
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
            .from('flash_sale_items' as any)
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

            if (error && error.code !== 'PGRST116') { // PGRST116 is 'Row not found'
                console.error("Error fetching settings:", error);
            } else if (data) {
                setSettings(data as any);
            } else {
                // No settings found, create default
                const { data: newData, error: createError } = await supabase
                    .from("site_settings" as any)
                    .insert([{
                        id: 1,
                        hero_visible: true,
                        features_visible: true,
                        products_visible: true,
                        stores_visible: true,
                        categories_visible: true,
                        flash_sale_visible: true,
                        trending_visible: true,
                        newsletter_visible: true,
                    }])
                    .select()
                    .single();

                if (createError) {
                    console.error("Error creating default settings:", createError);
                    toast.error("فشل في إنشاء إعدادات افتراضية");
                } else {
                    setSettings(newData as any);
                }
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
        return <div className="p-8 text-center text-red-500">فشل في تحميل الإعدادات. يرجى مراجعة سجل الأخطاء.</div>;
    }

    return (
        <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-8">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-gray-900">إعدادات الموقع</h1>
                    <p className="text-muted-foreground mt-2">تحكم في ظهور أقسام الصفحة الرئيسية والميزات.</p>
                </div>
                <Button size="lg" onClick={handleSave} disabled={saving} className="bg-primary hover:bg-primary/90">
                    {saving && <Loader2 className="ml-2 h-4 w-4 animate-spin" />}
                    حفظ التغييرات
                </Button>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
                {/* 1. Visibility Settings (Grouped) */}
                <Card className="h-fit shadow-md border-0 bg-white/50 backdrop-blur-sm">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <span className="bg-primary/10 p-2 rounded-lg text-primary text-xl">👁️</span>
                            أقسام الصفحة الرئيسية
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        {[
                            { id: "hero_visible", label: "قسم البطل (Hero Section)", desc: "الصورة الكبيرة في مقدمة الموقع" },
                            { id: "features_visible", label: "المميزات (Why Us)", desc: "قسم لماذا تختارنا" },
                            { id: "categories_visible", label: "التصنيفات (Categories)", desc: "شريط التصنيفات الدائري" },
                            { id: "stores_visible", label: "المحلات (Featured Stores)", desc: "قائمة المتاجر المميزة" },
                            { id: "flash_sale_visible", label: "عروض فلاش (Flash Sales)", desc: "عداد التنازلي والعروض المؤقتة" },
                            { id: "products_visible", label: "أحدث المنتجات (New Arrivals)", desc: "شبكة المنتجات المضافة حديثاً" },
                            { id: "trending_visible", label: "الأكثر مبيعاً (Best Sellers)", desc: "المنتجات الرائجة" },
                            { id: "newsletter_visible", label: "النشرة البريدية", desc: "نموذج الاشتراك في الأسفل" },
                        ].map((item) => (
                            <div key={item.id} className="flex items-center justify-between p-3 rounded-lg hover:bg-white hover:shadow-sm transition-all border border-transparent hover:border-gray-100">
                                <div className="space-y-0.5">
                                    <Label htmlFor={item.id} className="text-base font-medium text-gray-800 cursor-pointer">{item.label}</Label>
                                    <p className="text-xs text-muted-foreground">{item.desc}</p>
                                </div>
                                <Switch
                                    id={item.id}
                                    checked={settings[item.id as keyof SiteSettings] as boolean}
                                    onCheckedChange={() => handleToggle(item.id as keyof SiteSettings)}
                                />
                            </div>
                        ))}
                    </CardContent>
                </Card>

                {/* 2. Flash Sale Management */}
                <Card className="h-fit shadow-md border-0 bg-white/50 backdrop-blur-sm">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <span className="bg-yellow-100 p-2 rounded-lg text-yellow-600 text-xl">⚡</span>
                            إدارة عروض فلاش
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="flex gap-2">
                            <div className="relative flex-1">
                                <Search className="absolute right-3 top-2.5 h-4 w-4 text-muted-foreground" />
                                <Input
                                    placeholder="بحث عن منتج لإضافته..."
                                    value={productSearchQuery}
                                    onChange={e => setProductSearchQuery(e.target.value)}
                                    onKeyDown={(e) => e.key === 'Enter' && searchProducts()}
                                    className="pr-9"
                                />
                            </div>
                            <Button onClick={searchProducts} variant="secondary">بحث</Button>
                        </div>

                        {/* Search Results */}
                        {searchResults.length > 0 && (
                            <div className="border rounded-xl p-2 space-y-1 bg-white shadow-lg animate-in fade-in slide-in-from-top-2 z-10">
                                <div className="text-xs font-semibold text-muted-foreground px-2 py-1">نتائج البحث:</div>
                                {searchResults.map(p => (
                                    <div key={p.id} className="flex justify-between items-center p-2 hover:bg-indigo-50 cursor-pointer rounded-lg transition-colors group" onClick={() => addToFlashSale(p.id)}>
                                        <div className="flex items-center gap-3">
                                            <img src={p.image_url || "/placeholder.svg"} className="w-10 h-10 rounded-md object-cover border border-gray-200" />
                                            <div>
                                                <p className="text-sm font-medium text-gray-900">{p.name_ar}</p>
                                                <p className="text-xs text-gray-500">{p.price} د.ج</p>
                                            </div>
                                        </div>
                                        <Button size="icon" variant="ghost" className="h-8 w-8 text-green-600 bg-green-50 opacity-0 group-hover:opacity-100 transition-all">
                                            <Plus className="h-4 w-4" />
                                        </Button>
                                    </div>
                                ))}
                            </div>
                        )}

                        <div className="border-t pt-4">
                            <h3 className="font-bold mb-4 flex items-center justify-between">
                                <span>المنتجات النشطة حالياً</span>
                                <span className="bg-red-100 text-red-700 text-xs px-2 py-1 rounded-full">{flashSaleProducts.length}</span>
                            </h3>

                            {/* Active Products List */}
                            <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                                {flashSaleProducts.map(p => (
                                    <div key={p.id} className="flex items-center justify-between p-3 rounded-xl border border-gray-100 bg-gray-50/50 hover:bg-white hover:shadow-sm transition-all group">
                                        <div className="flex items-center gap-3">
                                            <img src={p.image_url || "/placeholder.svg"} className="w-12 h-12 rounded-lg object-cover border border-gray-200" />
                                            <div>
                                                <p className="text-sm font-bold text-gray-900 line-clamp-1">{p.name_ar}</p>
                                                <p className="text-xs text-gray-500">{p.price} د.ج</p>
                                            </div>
                                        </div>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="h-8 w-8 text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                                            onClick={() => removeFromFlashSale(p.id)}
                                        >
                                            <X className="h-4 w-4" />
                                        </Button>
                                    </div>
                                ))}
                                {flashSaleProducts.length === 0 && (
                                    <div className="text-center py-8 text-muted-foreground bg-gray-50 rounded-xl border border-dashed">
                                        <p>لا توجد منتجات في عروض فلاش</p>
                                        <p className="text-xs mt-1">ابدأ بالبحث لإضافة منتجات</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
