import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Loader2, X, Plus, Search, Eye, Zap, Settings, AlertTriangle, Store, ArrowRight } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

interface SiteSettings {
    id: string; // Changed from number to string (UUID)
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

    // Store Selection State
    const [viewMode, setViewMode] = useState<'search_stores' | 'select_products'>('search_stores');
    const [storeSearchQuery, setStoreSearchQuery] = useState("");
    const [storeSearchResults, setStoreSearchResults] = useState<any[]>([]);
    const [selectedStore, setSelectedStore] = useState<any | null>(null);
    const [storeProducts, setStoreProducts] = useState<any[]>([]);
    const [loadingProducts, setLoadingProducts] = useState(false);

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
            const formattedData = data.map((item: any) => ({
                id: item.product.id,
                flash_sale_item_id: item.id,
                name_ar: item.product.name_ar,
                image_url: item.product.image_url,
                price: item.product.price
            }));
            setFlashSaleProducts(formattedData);
        }
    };

    const searchStores = async () => {
        if (!storeSearchQuery.trim()) return;
        const { data } = await supabase
            .from('stores')
            .select('id, name, image_url')
            .ilike('name', `%${storeSearchQuery}%`)
            .limit(5);
        if (data) setStoreSearchResults(data);
    };

    const handleSelectStore = async (store: any) => {
        setSelectedStore(store);
        setViewMode('select_products');
        setLoadingProducts(true);
        // Fetch products for this store
        const { data, error } = await supabase
            .from('products')
            .select('id, name, name_ar, image_url, price')
            .eq('store_id', store.id);

        if (error) {
            console.error("Error fetching store products:", error);
            toast.error(`حدث خطأ أثناء تحميل المنتجات: ${(error as any).message || "خطأ غير محدد"}`);
        } else if (data) {
            setStoreProducts(data);
        }
        setLoadingProducts(false);
    };

    const handleBackToStores = () => {
        setSelectedStore(null);
        setStoreProducts([]);
        setViewMode('search_stores');
    };

    const addToFlashSale = async (productId: string) => {
        const { error } = await supabase
            .from('flash_sale_items' as any)
            .insert({ product_id: productId });

        if (error) {
            console.error("Error adding to flash sale:", error);
            if (error.code === '23505') {
                toast.error("المنتج موجود بالفعل في عروض فلاش");
            } else {
                toast.error("حدث خطأ أثناء إضافة المنتج");
            }
            return;
        }

        fetchFlashSaleProducts();
        // Don't clear store search context, just show success
        toast.success("تم إضافة المنتج لعروض فلاش");
    };

    const removeFromFlashSale = async (productId: string) => {
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
                .maybeSingle(); // Switch to maybeSingle to avoid PGRST116 error log

            if (error) {
                console.error("Error fetching settings:", error);
            } else if (data) {
                setSettings(data as any);
            } else {
                // Default settings fallback
                setSettings({
                    id: "",
                    hero_visible: true,
                    features_visible: true,
                    products_visible: true,
                    stores_visible: true,
                    categories_visible: true,
                    flash_sale_visible: true,
                    trending_visible: true,
                    newsletter_visible: true,
                });
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
            // Prepare payload without ID initially
            const { id, ...updates } = settings;

            // If ID is valid UUID, include it. If empty string (from our default state), exclude it to let DB generate one
            const payload = id && id.length > 10 ? { id, ...updates } : updates;

            const { data, error } = await supabase
                .from("site_settings" as any)
                .upsert(payload)
                .select()
                .single();

            if (error) throw error;

            // Update local state with returned data (crucial for getting the generated ID)
            if (data) setSettings(data as any);

            toast.success("تم حفظ التغييرات بنجاح");
        } catch (error: any) {
            console.error("Error saving settings:", error);
            toast.error(`حدث خطأ أثناء الحفظ: ${error.message || error.details || "خطأ غير محدد"}`);
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return <div className="p-8 flex justify-center"><Loader2 className="animate-spin" /></div>;
    }

    if (!settings) {
        return <div className="p-8 text-center text-red-500">فشل في تحميل الإعدادات</div>;
    }

    return (
        <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-8" dir="rtl">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-gray-900 flex items-center gap-2">
                        <Settings className="w-8 h-8 text-primary" />
                        لوحة التحكم المركزية
                    </h1>
                    <p className="text-muted-foreground mt-2">إدارة ظهور الأقسام والعروض الترويجية من مكان واحد.</p>
                </div>
                <Button size="lg" onClick={handleSave} disabled={saving} className="w-full md:w-auto bg-primary hover:bg-primary/90 shadow-lg">
                    {saving && <Loader2 className="ml-2 h-4 w-4 animate-spin" />}
                    حفظ التغييرات
                </Button>
            </div>

            <Tabs defaultValue="visibility" className="space-y-6">
                <TabsList className="bg-white p-1 border h-auto w-full justify-start overflow-x-auto">
                    <TabsTrigger value="visibility" className="px-6 py-2.5 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground text-base">
                        <Eye className="w-4 h-4 ml-2" />
                        واجهة المستخدم
                    </TabsTrigger>
                    <TabsTrigger value="flash_sales" className="px-6 py-2.5 data-[state=active]:bg-yellow-500 data-[state=active]:text-white text-base">
                        <Zap className="w-4 h-4 ml-2" />
                        عروض فلاش
                    </TabsTrigger>
                </TabsList>

                {/* VISIBILITY SETTINGS */}
                <TabsContent value="visibility" className="space-y-4">
                    <Alert className="bg-blue-50 border-blue-200 text-blue-800">
                        <AlertTriangle className="h-4 w-4" />
                        <AlertTitle>ملاحظة هامة</AlertTitle>
                        <AlertDescription>
                            إخفاء قسم معين سيجعله يختفي تماماً من الصفحة الرئيسية لجميع الزوار فوراً بعد الحفظ.
                        </AlertDescription>
                    </Alert>

                    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                        {[
                            { id: "hero_visible", label: "الواجهة الرئيسية (Hero)", icon: "🖼️", desc: "الصورة الكبيرة والرسالة الترحيبية" },
                            { id: "categories_visible", label: "شريط التصنيفات", icon: "📂", desc: "القائمة الدائرية للأقسام" },
                            { id: "features_visible", label: "لماذا تختارنا", icon: "✨", desc: "قسم المميزات والخدمات" },
                            { id: "stores_visible", label: "أفضل المحلات", icon: "🏪", desc: "قائمة المتاجر المميزة" },
                            { id: "flash_sale_visible", label: "عروض فلاش", icon: "⚡", desc: "شريط العروض المؤقتة" },
                            { id: "products_visible", label: "وصل حديثاً", icon: "🛍️", desc: "شبكة المنتجات الجديدة" },
                            { id: "trending_visible", label: "الأكثر طلباً", icon: "🔥", desc: "المنتجات الرائجة حالياً" },
                            { id: "newsletter_visible", label: "القائمة البريدية", icon: "📧", desc: "نموذج الاشتراك في الأسفل" },
                        ].map((item) => (
                            <Card key={item.id} className={`transition-all duration-300 border-2 ${settings[item.id as keyof SiteSettings] ? 'border-primary/20 bg-primary/5' : 'border-gray-100 opacity-70 grayscale'}`}>
                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                    <CardTitle className="text-base font-medium">
                                        {item.icon} {item.label}
                                    </CardTitle>
                                    <Switch
                                        checked={settings[item.id as keyof SiteSettings] as boolean}
                                        onCheckedChange={() => handleToggle(item.id as keyof SiteSettings)}
                                    />
                                </CardHeader>
                                <CardContent>
                                    <p className="text-xs text-muted-foreground">{item.desc}</p>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </TabsContent>

                {/* FLASH SALES MANAGMENT */}
                <TabsContent value="flash_sales">
                    <div className="grid gap-6 md:grid-cols-12">
                        {/* Search & Add */}
                        <Card className="md:col-span-5 h-fit">
                            <CardHeader>
                                <CardTitle>{viewMode === 'search_stores' ? 'إضافة منتجات من متجر' : `منتجات ${selectedStore?.name}`}</CardTitle>
                                <CardDescription>
                                    {viewMode === 'search_stores'
                                        ? 'ابحث عن المتجر أولاً لاستعراض منتجاته'
                                        : 'اختر المنتجات لإضافتها لعروض فلاش'}
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                {viewMode === 'search_stores' ? (
                                    <>
                                        <div className="flex gap-2">
                                            <div className="relative flex-1">
                                                <Search className="absolute right-3 top-2.5 h-4 w-4 text-muted-foreground" />
                                                <Input
                                                    placeholder="اسم المتجر..."
                                                    value={storeSearchQuery}
                                                    onChange={e => setStoreSearchQuery(e.target.value)}
                                                    onKeyDown={(e) => e.key === 'Enter' && searchStores()}
                                                />
                                            </div>
                                            <Button onClick={searchStores} variant="secondary">بحث</Button>
                                        </div>

                                        {storeSearchResults.length > 0 && (
                                            <div className="border rounded-lg divide-y bg-slate-50 overflow-hidden">
                                                {storeSearchResults.map(store => (
                                                    <div key={store.id} className="flex justify-between items-center p-3 hover:bg-slate-100 transition-colors cursor-pointer" onClick={() => handleSelectStore(store)}>
                                                        <div className="flex items-center gap-3">
                                                            <div className="w-10 h-10 rounded-full bg-white border flex items-center justify-center overflow-hidden">
                                                                {store.image_url ? (
                                                                    <img src={store.image_url} alt={store.name} className="w-full h-full object-cover" />
                                                                ) : (
                                                                    <Store className="w-5 h-5 text-gray-400" />
                                                                )}
                                                            </div>
                                                            <div className="text-sm">
                                                                <p className="font-medium">{store.name}</p>
                                                            </div>
                                                        </div>
                                                        <Button size="sm" variant="ghost" className="h-8 w-8 p-0">
                                                            <ArrowRight className="h-4 w-4 rotate-180" /> {/* RTL arrow logic */}
                                                        </Button>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </>
                                ) : (
                                    <>
                                        <Button variant="outline" size="sm" onClick={handleBackToStores} className="mb-2 w-full">
                                            <ArrowRight className="ml-2 h-4 w-4" />
                                            العودة للبحث عن متاجر
                                        </Button>

                                        {loadingProducts ? (
                                            <div className="text-center py-8 text-muted-foreground">
                                                <Loader2 className="mx-auto h-8 w-8 animate-spin mb-2" />
                                                جاري تحميل المنتجات...
                                            </div>
                                        ) : storeProducts.length > 0 ? (
                                            <div className="border rounded-lg divide-y bg-slate-50 overflow-hidden max-h-[400px] overflow-y-auto">
                                                {storeProducts.map(p => {
                                                    const isAlreadyAdded = flashSaleProducts.some(fp => fp.id === p.id);
                                                    return (
                                                        <div key={p.id} className="flex justify-between items-center p-3 hover:bg-slate-100 transition-colors">
                                                            <div className="flex items-center gap-3">
                                                                <img src={p.image_url || "/placeholder.svg"} className="w-10 h-10 rounded object-cover bg-white" />
                                                                <div className="text-sm">
                                                                    <p className="font-medium line-clamp-1">{p.name_ar || p.name}</p>
                                                                    <p className="text-muted-foreground text-xs">{p.price} د.ج</p>
                                                                </div>
                                                            </div>
                                                            <Button
                                                                size="sm"
                                                                onClick={() => !isAlreadyAdded && addToFlashSale(p.id)}
                                                                disabled={isAlreadyAdded}
                                                                variant={isAlreadyAdded ? "ghost" : "default"}
                                                                className={`h-8 w-8 p-0 rounded-full ${isAlreadyAdded ? 'text-green-600 bg-green-50' : ''}`}
                                                            >
                                                                {isAlreadyAdded ? <Zap className="h-4 w-4 fill-current" /> : <Plus className="h-4 w-4" />}
                                                            </Button>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        ) : (
                                            <div className="text-center py-8 text-muted-foreground">
                                                لا توجد منتجات في هذا المتجر
                                            </div>
                                        )}
                                    </>
                                )}
                            </CardContent>
                        </Card>

                        {/* List Active */}
                        <Card className="md:col-span-7">
                            <CardHeader>
                                <CardTitle className="flex justify-between items-center">
                                    <span>المنتجات النشطة</span>
                                    <span className="bg-yellow-100 text-yellow-800 text-xs px-2.5 py-0.5 rounded-full ring-1 ring-yellow-600/20">
                                        {flashSaleProducts.length} منتج
                                    </span>
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                {flashSaleProducts.length > 0 ? (
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        {flashSaleProducts.map(p => (
                                            <div key={p.id} className="flex items-center gap-3 p-3 rounded-xl border bg-white shadow-sm hover:shadow-md transition-all group relative">
                                                <img src={p.image_url || "/placeholder.svg"} className="w-16 h-16 rounded-lg object-cover" />
                                                <div className="flex-1 min-w-0">
                                                    <h4 className="font-bold text-sm truncate">{p.name_ar}</h4>
                                                    <p className="text-yellow-600 font-bold text-sm">{p.price} د.ج</p>
                                                </div>
                                                <Button
                                                    variant="ghost" size="icon"
                                                    onClick={() => removeFromFlashSale(p.id)}
                                                    className="absolute top-2 left-2 h-7 w-7 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                                                >
                                                    <X className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="text-center py-12 text-muted-foreground bg-slate-50 rounded-xl border border-dashed">
                                        <Zap className="h-10 w-10 mx-auto text-gray-300 mb-3" />
                                        <p>لا توجد منتجات في عروض فلاش حالياً</p>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </div>
                </TabsContent>
            </Tabs>
        </div>
    );
}
