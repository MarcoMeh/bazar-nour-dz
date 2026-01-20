import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Plus, Edit, Trash2, Upload, X, ImageIcon, ImagePlus, Loader2 } from "lucide-react";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { ConfirmDialog } from "@/components/ConfirmDialog";
import { ERROR_MESSAGES, SUCCESS_MESSAGES, getErrorMessage } from "@/lib/errorMessages";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import { SizeSelector } from "@/components/SizeSelector";
import { ColorSelector } from "@/components/ColorSelector";

import { compressImage } from "@/lib/image-upload";

export default function StoreOwnerProducts() {
    // ... (rest of the component)
    const [products, setProducts] = useState<any[]>([]);
    const [categories, setCategories] = useState<any[]>([]);
    const [subcategories, setSubcategories] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [editingProduct, setEditingProduct] = useState<any>(null);
    const [uploading, setUploading] = useState(false);
    const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
    const [productToDelete, setProductToDelete] = useState<string | null>(null);
    const [storeId, setStoreId] = useState<string | null>(null);

    const [formData, setFormData] = useState({
        name_ar: "",
        description_ar: "",
        price: "",
        category_id: "",
        subcategory_id: "",
        image_url: "",
        is_delivery_home_available: true,
        is_delivery_desk_available: true,
        is_sold_out: false,
        is_free_delivery: false,
        additional_images: [] as string[],
        sizes: [] as string[],
        colors: [] as string[],
        brand: "",
        material: "",
        track_inventory: false,
        low_stock_threshold: "5",
        variants: [] as any[],
    });

    useEffect(() => {
        fetchStoreId();
        fetchCategories();
    }, []);

    useEffect(() => {
        if (storeId) {
            fetchProducts();
        }
    }, [storeId]);

    const fetchStoreId = async () => {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;
        const { data: store } = await supabase.from("stores").select("id").eq("owner_id", user.id).single();
        setStoreId(store?.id || null);
    };

    const fetchCategories = async () => {
        const { data: cats } = await supabase.from("categories").select("*").order("name");
        const { data: subcats } = await supabase.from("subcategories").select("*").order("name");
        setCategories(cats || []);
        setSubcategories(subcats || []);
    };

    const fetchProducts = async () => {
        if (!storeId) return;
        setLoading(true);
        const { data, error } = await supabase
            .from("products")
            .select("*, categories(name), subcategories(name)")
            .eq("store_id", storeId)
            .order("created_at", { ascending: false });

        if (error) toast.error(getErrorMessage(error));
        else setProducts(data || []);
        setLoading(false);
    };

    const fetchVariants = async (productId: string) => {
        const { data, error } = await supabase
            .from("product_variants")
            .select("*")
            .eq("product_id", productId);

        if (error) {
            console.error("Error fetching variants:", error);
            return [];
        }
        return data || [];
    };

    const generateVariants = () => {
        const { colors, sizes } = formData;
        const newVariants: any[] = [];

        if (colors.length === 0 && sizes.length === 0) {
            newVariants.push({ color: null, size: null, stock_quantity: 0 });
        } else if (colors.length > 0 && sizes.length === 0) {
            colors.forEach(color => newVariants.push({ color, size: null, stock_quantity: 0 }));
        } else if (colors.length === 0 && sizes.length > 0) {
            sizes.forEach(size => newVariants.push({ color: null, size, stock_quantity: 0 }));
        } else {
            colors.forEach(color => {
                sizes.forEach(size => {
                    newVariants.push({ color, size, stock_quantity: 0 });
                });
            });
        }

        // Merge with existing stock if possible (match by color and size)
        const mergedVariants = newVariants.map(nv => {
            const existing = formData.variants.find(ev => ev.color === nv.color && ev.size === nv.size);
            return existing ? { ...nv, stock_quantity: existing.stock_quantity, id: existing.id } : nv;
        });

        setFormData(prev => ({ ...prev, variants: mergedVariants }));
        toast.info("تم تحديث قائمة التشكيلات بناءً على الألوان والمقاسات المختارة");
    };

    const resetForm = () => {
        setFormData({
            name_ar: "",
            description_ar: "",
            price: "",
            category_id: "",
            subcategory_id: "",
            image_url: "",
            is_delivery_home_available: true,
            is_delivery_desk_available: true,
            is_sold_out: false,
            is_free_delivery: false,
            additional_images: [],
            sizes: [],
            colors: [],
            brand: "",
            material: "",
            track_inventory: false,
            low_stock_threshold: "5",
            variants: [],
        });
        setEditingProduct(null);
    };

    const handleEdit = async (product: any) => {
        setEditingProduct(product);
        const variants = await fetchVariants(product.id);

        setFormData({
            name_ar: product.name || "",
            description_ar: product.description || "",
            price: product.price?.toString() || "",
            category_id: product.category_id || "",
            subcategory_id: product.subcategory_id || "",
            image_url: product.image_url || "",
            is_delivery_home_available: product.is_delivery_home_available ?? true,
            is_delivery_desk_available: product.is_delivery_desk_available ?? true,
            is_sold_out: product.is_sold_out ?? false,
            is_free_delivery: product.is_free_delivery ?? false,
            additional_images: product.additional_images || [],
            sizes: product.sizes || [],
            colors: product.colors || [],
            brand: product.brand || "",
            material: product.material || "",
            track_inventory: product.track_inventory ?? false,
            low_stock_threshold: product.low_stock_threshold?.toString() || "5",
            variants: variants,
        });
        setIsDialogOpen(true);
    };

    const handleDelete = (id: string) => {
        setProductToDelete(id);
        setDeleteConfirmOpen(true);
    };

    const confirmDelete = async () => {
        if (!productToDelete) return;
        const { error } = await supabase.from("products").delete().eq("id", productToDelete);
        if (error) toast.error(getErrorMessage(error));
        else {
            toast.success(SUCCESS_MESSAGES.PRODUCTS.DELETED);
            fetchProducts();
        }
        setProductToDelete(null);
    };

    // --- UPLOAD HANDLERS ---
    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        setUploading(true);

        try {
            const compressedFile = await compressImage(file);
            const fileExt = "jpg"; // We force convert to jpg
            const fileName = `${Date.now()}-${Math.random().toString(36).slice(2)}.${fileExt}`;
            const { error: uploadError } = await supabase.storage.from("product-images").upload(fileName, compressedFile);

            if (uploadError) {
                toast.error("فشل رفع الصورة");
                setUploading(false);
                return;
            }

            const { data: { publicUrl } } = supabase.storage.from("product-images").getPublicUrl(fileName);
            setFormData((prev) => ({ ...prev, image_url: publicUrl }));
            toast.success("تم رفع الصورة الرئيسية (تم ضغطها)");
        } catch (err) {
            console.error(err);
            toast.error("فشل ضغط الصورة");
        }
        setUploading(false);
    };

    const handleAdditionalImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (!files || files.length === 0) return;

        // CHECK LIMIT
        const currentCount = (formData.image_url ? 1 : 0) + (formData.additional_images?.length || 0);
        const allowed = 4 - currentCount;

        if (files.length > allowed) {
            toast.error(`يمكنك إضافة ${allowed} صور فقط (الحد الأقصى 4 صور للمنتج)`);
            return;
        }

        setUploading(true);
        const newImages: string[] = [];

        for (let i = 0; i < files.length; i++) {
            const file = files[i];
            try {
                const compressedFile = await compressImage(file);
                const fileExt = "jpg";
                const fileName = `${Date.now()}-${Math.random().toString(36).slice(2)}.${fileExt}`;
                const { error: uploadError } = await supabase.storage.from("product-images").upload(fileName, compressedFile);

                if (uploadError) {
                    toast.error(`فشل رفع الصورة ${file.name}`);
                    continue;
                }
                const { data: { publicUrl } } = supabase.storage.from("product-images").getPublicUrl(fileName);
                newImages.push(publicUrl);
            } catch (err) {
                console.error(err);
                toast.error(`فشل ضغط الصورة ${file.name}`);
            }
        }
        setFormData((prev) => ({
            ...prev,
            additional_images: [...(prev.additional_images || []), ...newImages]
        }));
        toast.success("تم رفع الصور الإضافية");
        setUploading(false);
    };

    const removeAdditionalImage = (indexToRemove: number) => {
        setFormData((prev) => ({
            ...prev,
            additional_images: prev.additional_images.filter((_, index) => index !== indexToRemove)
        }));
    };

    const filteredSubcategories = subcategories.filter(sub => sub.category_id === formData.category_id);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.name_ar || !formData.price || !formData.category_id) {
            toast.error("الرجاء ملء الاسم، السعر، والفئة الرئيسية");
            return;
        }
        if (filteredSubcategories.length > 0 && !formData.subcategory_id) {
            toast.error("الرجاء اختيار الفئة الفرعية");
            return;
        }
        if (!storeId) {
            toast.error("لم يتم العثور على معرّف المحل");
            return;
        }

        const productData = {
            name: formData.name_ar, // Use name_ar as the default name
            name_ar: formData.name_ar,
            description_ar: formData.description_ar || null,
            price: parseFloat(formData.price),
            category_id: formData.category_id,
            subcategory_id: formData.subcategory_id || null,
            image_url: formData.image_url,
            additional_images: formData.additional_images,
            store_id: storeId,
            is_sold_out: formData.is_sold_out,
            is_free_delivery: formData.is_free_delivery,
            sizes: formData.sizes,
            colors: formData.colors,
            brand: formData.brand || null,
            material: formData.material || null,
            track_inventory: formData.track_inventory,
            low_stock_threshold: parseInt(formData.low_stock_threshold) || 5,
        };

        let result;
        if (editingProduct) {
            result = await supabase.from("products").update(productData as any).eq("id", editingProduct.id).select().single();
        } else {
            result = await supabase.from("products").insert([productData as any]).select().single();
        }

        const { data: savedProduct, error: productError } = result;

        if (productError) {
            toast.error(getErrorMessage(productError));
            return;
        }

        // Handle Variants if tracking is enabled
        if (formData.track_inventory && savedProduct) {
            // Delete old variants that are no longer present in current selection if editing?
            // Simplified: Upsert variants
            const variantsToSave = formData.variants.map(v => ({
                ...v,
                product_id: savedProduct.id,
                stock_quantity: parseInt(v.stock_quantity) || 0
            }));

            // If editing, we might need to handle deletions. For now, let's upsert everything and trust the uniqueness.
            const { error: variantError } = await supabase
                .from("product_variants")
                .upsert(variantsToSave, { onConflict: 'product_id,color,size' });

            if (variantError) {
                console.error("Variant Error:", variantError);
                toast.warning("تم حفظ المنتج ولكن فشل حفظ بيانات المخزون");
            }
        }

        toast.success(editingProduct ? "تم تحديث المنتج بنجاح" : "تم نشر المنتج بنجاح");
        setIsDialogOpen(false);
        resetForm();
        fetchProducts();
    };

    if (loading) return <LoadingSpinner fullScreen message="جاري تحميل المنتجات..." />;
    if (!storeId) return <Card className="p-8 text-center"><p>لا يوجد محل مرتبط بحسابك</p></Card>;

    return (
        <div className="p-4 md:p-8 space-y-6 bg-slate-50 min-h-screen">
            <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-3">
                <div>
                    <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-primary">إدارة المنتجات</h1>
                    <p className="text-sm text-muted-foreground mt-1">قائمة منتجات المتجر</p>
                </div>

                <Dialog open={isDialogOpen} onOpenChange={(open) => { setIsDialogOpen(open); if (!open) resetForm(); }}>
                    <DialogTrigger asChild>
                        <Button className="w-full md:w-auto shadow-md">
                            <Plus className="ml-2 h-4 w-4" /> إضافة منتج
                        </Button>
                    </DialogTrigger>

                    <DialogContent className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-[95vw] sm:max-w-xl max-h-[92vh] overflow-y-auto overflow-x-hidden p-0 bg-white rounded-2xl shadow-2xl border-none focus-visible:outline-none">
                        <DialogHeader className="p-4 border-b sticky top-0 bg-white z-10 text-right">
                            <DialogTitle className="text-lg font-bold">{editingProduct ? "تعديل بيانات المنتج" : "إضافة منتج جديد"}</DialogTitle>
                        </DialogHeader>

                        <form onSubmit={handleSubmit} className="p-4 space-y-5 overflow-x-hidden">

                            {/* 1. القسم الأساسي: الصورة والاسم */}
                            <div className="space-y-4">
                                <div>
                                    <Label className="block mb-2 text-sm font-semibold">صورة المنتج الرئيسية *</Label>
                                    <div className={`relative border-2 border-dashed rounded-xl transition-all ${formData.image_url ? 'border-primary/50 bg-primary/5' : 'border-gray-300 hover:border-primary hover:bg-gray-50'}`}>
                                        <input id="main-image-upload" type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
                                        <label htmlFor="main-image-upload" className="flex flex-col items-center justify-center w-full h-48 cursor-pointer">
                                            {uploading ? (
                                                <div className="flex flex-col items-center text-muted-foreground">
                                                    <Loader2 className="w-8 h-8 animate-spin mb-2" />
                                                    <span className="text-xs">جاري الرفع...</span>
                                                </div>
                                            ) : formData.image_url ? (
                                                <>
                                                    <img src={formData.image_url} alt="Main" className="absolute inset-0 w-full h-full object-contain rounded-xl p-2" />
                                                    <div className="absolute bottom-2 right-2 bg-black/60 text-white text-xs px-2 py-1 rounded-md backdrop-blur-sm flex items-center">
                                                        <Edit className="w-3 h-3 ml-1" /> تغيير الصورة
                                                    </div>
                                                </>
                                            ) : (
                                                <div className="flex flex-col items-center text-muted-foreground">
                                                    <div className="bg-gray-100 p-3 rounded-full mb-3">
                                                        <Upload className="w-6 h-6 text-gray-500" />
                                                    </div>
                                                    <span className="text-sm font-medium">اضغط هنا لرفع الصورة الرئيسية</span>
                                                    <span className="text-xs text-gray-400 mt-1">يفضل أن تكون بأبعاد 1:1 أو 4:5</span>
                                                </div>
                                            )}
                                        </label>
                                    </div>
                                </div>

                                {/* 2. الصور الثانوية: تظهر فقط إذا تم رفع الرئيسية */}
                                {formData.image_url && (
                                    <div className="animate-in fade-in slide-in-from-top-4 p-4 bg-gray-50 rounded-xl border">
                                        <Label className="block mb-3 text-sm font-semibold">صور إضافية (المعرض)</Label>
                                        <div className="grid grid-cols-4 gap-3">
                                            {formData.additional_images.map((img, index) => (
                                                <div key={index} className="relative aspect-square group">
                                                    <img src={img} className="w-full h-full object-cover rounded-lg border bg-white" />
                                                    <button type="button" onClick={() => removeAdditionalImage(index)} className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full p-0.5 shadow-md">
                                                        <X className="w-3 h-3" />
                                                    </button>
                                                </div>
                                            ))}
                                            <input id="gallery-upload" type="file" accept="image/*" multiple onChange={handleAdditionalImageUpload} className="hidden" />
                                            <label htmlFor="gallery-upload" className="aspect-square flex flex-col items-center justify-center border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors bg-white">
                                                <ImagePlus className="w-5 h-5 text-gray-400 mb-1" />
                                                <span className="text-[10px] text-gray-500">أضف</span>
                                            </label>
                                        </div>
                                    </div>
                                )}

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label>اسم المنتج *</Label>
                                        <Input
                                            placeholder="مثال: فستان صيفي مزهر"
                                            value={formData.name_ar}
                                            onChange={(e) => setFormData((prev) => ({ ...prev, name_ar: e.target.value }))}
                                            className="h-11"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>السعر (دج) *</Label>
                                        <Input
                                            type="number"
                                            placeholder="00.00"
                                            value={formData.price}
                                            onChange={(e) => setFormData((prev) => ({ ...prev, price: e.target.value }))}
                                            className="h-11 font-mono text-left"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* 3. التصنيفات */}
                            <div className="p-4 bg-blue-50/50 rounded-xl border border-blue-100 space-y-4">
                                <h3 className="font-semibold text-sm text-blue-800 mb-2">التصنيف</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <Label className="text-xs text-gray-500 mb-1.5 block">القسم الرئيسي</Label>
                                        <Select value={formData.category_id} onValueChange={(v) => setFormData(prev => ({ ...prev, category_id: v, subcategory_id: "" }))}>
                                            <SelectTrigger className="bg-white"><SelectValue placeholder="اختر القسم" /></SelectTrigger>
                                            <SelectContent>
                                                {categories.map((cat) => <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>)}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    {formData.category_id && (
                                        <div className="animate-in fade-in">
                                            <Label className="text-xs text-gray-500 mb-1.5 block">القسم الفرعي</Label>
                                            {filteredSubcategories.length > 0 ? (
                                                <Select value={formData.subcategory_id} onValueChange={(v) => setFormData((prev) => ({ ...prev, subcategory_id: v }))}>
                                                    <SelectTrigger className="bg-white"><SelectValue placeholder="اختر الفرع" /></SelectTrigger>
                                                    <SelectContent>
                                                        {filteredSubcategories.map((sub) => <SelectItem key={sub.id} value={sub.id}>{sub.name}</SelectItem>)}
                                                    </SelectContent>
                                                </Select>
                                            ) : <p className="text-xs text-muted-foreground pt-2">لا توجد فروع لهذا القسم</p>}
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* 4. تفاصيل إضافية */}
                            <div className="space-y-4">
                                <Label>الوصف</Label>
                                <Textarea placeholder="اكتب تفاصيل المنتج..." className="min-h-[80px]" value={formData.description_ar} onChange={(e) => setFormData((prev) => ({ ...prev, description_ar: e.target.value }))} />

                                <div className="space-y-6">
                                    <div className="p-4 bg-gray-50/50 rounded-xl border border-gray-100">
                                        <Label className="mb-3 block font-bold text-gray-700">المقاسات المتاحة</Label>
                                        <SizeSelector selectedSizes={formData.sizes} onSizesChange={(sizes) => setFormData((prev) => ({ ...prev, sizes }))} />
                                    </div>
                                    <div className="p-4 bg-gray-50/50 rounded-xl border border-gray-100">
                                        <Label className="mb-3 block font-bold text-gray-700">الألوان المتاحة</Label>
                                        <ColorSelector selectedColors={formData.colors} onColorsChange={(colors) => setFormData((prev) => ({ ...prev, colors }))} />
                                    </div>
                                </div>
                            </div>

                            {/* 5. الإعدادات (Switches Grid) */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                                <div className="flex items-center justify-between p-3 border rounded-xl hover:bg-slate-50 transition-colors bg-white gap-2">
                                    <Label htmlFor="home_delivery" className="flex-1 cursor-pointer text-xs font-semibold text-right">توصيل منزل</Label>
                                    <Switch
                                        id="home_delivery"
                                        checked={formData.is_delivery_home_available}
                                        onCheckedChange={(c) => setFormData(prev => ({ ...prev, is_delivery_home_available: c }))}
                                    />
                                </div>
                                <div className="flex items-center justify-between p-3 border rounded-xl hover:bg-slate-50 transition-colors bg-white gap-2">
                                    <Label htmlFor="office_delivery" className="flex-1 cursor-pointer text-xs font-semibold text-right">توصيل مكتب</Label>
                                    <Switch
                                        id="office_delivery"
                                        checked={formData.is_delivery_desk_available}
                                        onCheckedChange={(c) => setFormData(prev => ({ ...prev, is_delivery_desk_available: c }))}
                                    />
                                </div>
                                <div className="flex items-center justify-between p-3 border rounded-xl hover:bg-green-50/30 border-green-100 transition-colors bg-white gap-2">
                                    <Label htmlFor="free_delivery" className="flex-1 cursor-pointer text-xs font-semibold text-green-700 text-right">توصيل مجاني</Label>
                                    <Switch
                                        id="free_delivery"
                                        checked={formData.is_free_delivery}
                                        onCheckedChange={(c) => setFormData(prev => ({ ...prev, is_free_delivery: c }))}
                                    />
                                </div>
                                <div className="flex items-center justify-between p-3 border rounded-xl hover:bg-red-50/30 border-red-100 transition-colors bg-white gap-2">
                                    <Label htmlFor="sold_out" className="flex-1 cursor-pointer text-xs font-semibold text-red-600 text-right">نفد المخزون</Label>
                                    <Switch
                                        id="sold_out"
                                        checked={formData.is_sold_out}
                                        onCheckedChange={(c) => setFormData(prev => ({ ...prev, is_sold_out: c }))}
                                    />
                                </div>
                            </div>

                            {/* 6. إدارة المخزون المتقدمة */}
                            <div className="p-4 bg-amber-50/50 rounded-xl border border-amber-100 space-y-4">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <div className="p-1.5 bg-amber-100 rounded-lg text-amber-700">
                                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m7.5 4.27 9 5.15" /><path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z" /><path d="m3.3 7 8.7 5 8.7-5" /><path d="M12 22V12" /></svg>
                                        </div>
                                        <h3 className="font-semibold text-sm text-amber-900">إدارة المخزون (تتبع دقيق)</h3>
                                    </div>
                                    <Switch
                                        checked={formData.track_inventory}
                                        onCheckedChange={(c) => setFormData(prev => ({ ...prev, track_inventory: c }))}
                                    />
                                </div>

                                {formData.track_inventory && (
                                    <div className="space-y-4 animate-in fade-in slide-in-from-top-2">
                                        <div className="flex items-center gap-3">
                                            <Label className="text-xs font-semibold whitespace-nowrap">الإشعار عند انخفاض الكمية لـ:</Label>
                                            <Input
                                                type="number"
                                                className="h-8 w-20 bg-white"
                                                value={formData.low_stock_threshold}
                                                onChange={(e) => setFormData(prev => ({ ...prev, low_stock_threshold: e.target.value }))}
                                            />
                                        </div>

                                        <div className="space-y-2">
                                            <div className="flex justify-between items-center">
                                                <Label className="text-xs font-bold">تحديد الكميات حسب المقاس واللون:</Label>
                                                <Button type="button" variant="outline" size="sm" onClick={generateVariants} className="h-7 text-[10px] bg-white">
                                                    تحديث القائمة
                                                </Button>
                                            </div>

                                            <div className="max-h-60 overflow-y-auto border rounded-lg bg-white">
                                                <Table className="text-[12px]">
                                                    <TableHeader className="bg-gray-50 sticky top-0 z-10">
                                                        <TableRow>
                                                            <TableHead className="h-8 text-right">اللون</TableHead>
                                                            <TableHead className="h-8 text-right">المقاس</TableHead>
                                                            <TableHead className="h-8 text-right">الكمية</TableHead>
                                                        </TableRow>
                                                    </TableHeader>
                                                    <TableBody>
                                                        {formData.variants.length === 0 ? (
                                                            <TableRow>
                                                                <TableCell colSpan={3} className="text-center py-4 text-muted-foreground italic">
                                                                    اضغط على "تحديث القائمة" بعد اختيار الألوان والمقاسات
                                                                </TableCell>
                                                            </TableRow>
                                                        ) : (
                                                            formData.variants.map((variant, idx) => (
                                                                <TableRow key={idx}>
                                                                    <TableCell className="py-2">{variant.color || "—"}</TableCell>
                                                                    <TableCell className="py-2">{variant.size || "—"}</TableCell>
                                                                    <TableCell className="py-2">
                                                                        <Input
                                                                            type="number"
                                                                            min="0"
                                                                            className="h-7 w-16 text-center font-mono"
                                                                            value={variant.stock_quantity}
                                                                            onChange={(e) => {
                                                                                const val = parseInt(e.target.value) || 0;
                                                                                const newVariants = [...formData.variants];
                                                                                newVariants[idx].stock_quantity = Math.max(0, val).toString();
                                                                                setFormData(prev => ({ ...prev, variants: newVariants }));
                                                                            }}
                                                                        />
                                                                    </TableCell>
                                                                </TableRow>
                                                            ))
                                                        )}
                                                    </TableBody>
                                                </Table>
                                            </div>
                                            <p className="text-[10px] text-amber-600 mt-1">
                                                * سيتم استخدام هذه الكميات للتحقق من التوفر أثناء الطلب.
                                            </p>
                                        </div>
                                    </div>
                                )}
                            </div>

                            <div className="sticky bottom-0 pt-4 pb-2 bg-white border-t mt-4 flex gap-3">
                                <Button type="submit" className="flex-1 h-12 text-lg font-bold shadow-lg" disabled={uploading}>
                                    {editingProduct ? "حفظ التعديلات" : "نشر المنتج"}
                                </Button>
                                <Button type="button" variant="outline" className="h-12 w-24" onClick={() => { setIsDialogOpen(false); resetForm(); }}>
                                    إلغاء
                                </Button>
                            </div>
                        </form>
                    </DialogContent>
                </Dialog>
            </div>

            {/* جدول المنتجات */}
            <Card className="overflow-hidden border-0 shadow-sm">
                <CardHeader className="bg-white border-b py-4">
                    <CardTitle className="text-base flex justify-between items-center">
                        <span>المنتجات الحالية</span>
                        <Badge variant="secondary" className="font-normal">{products.length}</Badge>
                    </CardTitle>
                </CardHeader>
                <div className="overflow-x-auto">
                    <Table>
                        <TableHeader>
                            <TableRow className="bg-gray-50/50">
                                <TableHead className="w-[80px] text-right">الصورة</TableHead>
                                <TableHead className="text-right">الاسم</TableHead>
                                <TableHead className="text-right">السعر</TableHead>
                                <TableHead className="text-center">الحالة</TableHead>
                                <TableHead className="text-left">تحكم</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {products.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={5} className="text-center py-12 text-muted-foreground">
                                        لا توجد منتجات. ابدأ بإضافة منتجك الأول!
                                    </TableCell>
                                </TableRow>
                            ) : (
                                products.map((product) => (
                                    <TableRow key={product.id} className="hover:bg-gray-50/50">
                                        <TableCell>
                                            {product.image_url ? (
                                                <img src={product.image_url} className="w-10 h-10 rounded-md object-cover border" />
                                            ) : <div className="w-10 h-10 bg-gray-100 rounded-md flex items-center justify-center"><ImageIcon className="w-4 h-4 text-gray-400" /></div>}
                                        </TableCell>
                                        <TableCell className="font-medium text-sm line-clamp-1 max-w-[150px]">{product.name}</TableCell>
                                        <TableCell className="font-bold text-sm">{product.price}</TableCell>
                                        <TableCell className="text-center">
                                            {product.is_sold_out ? <Badge variant="destructive" className="text-[10px]">نفد</Badge> : <Badge variant="outline" className="text-[10px] bg-green-50 text-green-700 border-green-200">نشط</Badge>}
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex justify-end gap-1">
                                                <Button variant="ghost" size="icon" className="h-8 w-8 text-blue-600 hover:bg-blue-50" onClick={() => handleEdit(product)}><Edit className="w-4 h-4" /></Button>
                                                <Button variant="ghost" size="icon" className="h-8 w-8 text-red-600 hover:bg-red-50" onClick={() => handleDelete(product.id)}><Trash2 className="w-4 h-4" /></Button>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </div>
            </Card>

            <ConfirmDialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen} onConfirm={confirmDelete} title="حذف المنتج" description="لا يمكن التراجع عن هذا الإجراء." confirmText="حذف" variant="destructive" />
        </div>
    );
}