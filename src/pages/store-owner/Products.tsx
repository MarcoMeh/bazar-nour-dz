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

// Utility to compress images
const compressImage = async (file: File): Promise<File> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = (event) => {
            const img = new Image();
            img.src = event.target?.result as string;
            img.onload = () => {
                const canvas = document.createElement('canvas');
                const MAX_WIDTH = 1200; // Resize to max width
                let width = img.width;
                let height = img.height;

                if (width > MAX_WIDTH) {
                    height *= MAX_WIDTH / width;
                    width = MAX_WIDTH;
                }

                canvas.width = width;
                canvas.height = height;
                const ctx = canvas.getContext('2d');
                ctx?.drawImage(img, 0, 0, width, height);

                canvas.toBlob((blob) => {
                    if (blob) {
                        // Create new file with jpeg compression
                        const newFile = new File([blob], file.name.replace(/\.[^/.]+$/, ".jpg"), {
                            type: 'image/jpeg',
                            lastModified: Date.now(),
                        });
                        resolve(newFile);
                    } else {
                        reject(new Error("Canvas to Blob failed"));
                    }
                }, 'image/jpeg', 0.7); // 70% quality
            };
            img.onerror = (err) => reject(err);
        };
        reader.onerror = (err) => reject(err);
    });
};

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
        });
        setEditingProduct(null);
    };

    const handleEdit = (product: any) => {
        setEditingProduct(product);
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
            name: formData.name_ar,
            description: formData.description_ar || null,
            price: parseFloat(formData.price),
            category_id: formData.category_id || null,
            subcategory_id: formData.subcategory_id || null,
            image_url: formData.image_url || null,
            store_id: storeId,
            is_delivery_home_available: formData.is_delivery_home_available,
            is_delivery_desk_available: formData.is_delivery_desk_available,
            is_sold_out: formData.is_sold_out,
            is_free_delivery: formData.is_free_delivery,
            additional_images: formData.additional_images,
            sizes: formData.sizes,
            colors: formData.colors,
            brand: formData.brand || null,
            material: formData.material || null,
        };

        let error;
        if (editingProduct) {
            ({ error } = await supabase.from("products").update(productData as any).eq("id", editingProduct.id));
        } else {
            ({ error } = await supabase.from("products").insert([productData as any]));
        }

        if (error) {
            toast.error(getErrorMessage(error));
        } else {
            toast.success(editingProduct ? SUCCESS_MESSAGES.PRODUCTS.UPDATED : SUCCESS_MESSAGES.PRODUCTS.CREATED);
            setIsDialogOpen(false);
            resetForm();
            fetchProducts();
        }
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

                    <DialogContent className="max-w-xl max-h-[95vh] overflow-y-auto p-0 gap-0 bg-white rounded-2xl">
                        <DialogHeader className="p-6 pb-2 border-b">
                            <DialogTitle>{editingProduct ? "تعديل بيانات المنتج" : "إضافة منتج جديد"}</DialogTitle>
                        </DialogHeader>

                        <form onSubmit={handleSubmit} className="p-6 space-y-6">

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

                                <div className="grid grid-cols-2 gap-4">
                                    <div><Label className="mb-2 block">المقاسات</Label><SizeSelector selectedSizes={formData.sizes} onSizesChange={(sizes) => setFormData((prev) => ({ ...prev, sizes }))} /></div>
                                    <div><Label className="mb-2 block">الألوان</Label><ColorSelector selectedColors={formData.colors} onColorsChange={(colors) => setFormData((prev) => ({ ...prev, colors }))} /></div>
                                </div>
                            </div>

                            {/* 5. الإعدادات (Switches Grid) */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                                <div className="flex items-center justify-between p-3.5 border rounded-xl hover:bg-slate-50 transition-colors bg-white">
                                    <Label htmlFor="home_delivery" className="flex-1 cursor-pointer text-sm font-semibold">توصيل منزل</Label>
                                    <Switch
                                        id="home_delivery"
                                        checked={formData.is_delivery_home_available}
                                        onCheckedChange={(c) => setFormData(prev => ({ ...prev, is_delivery_home_available: c }))}
                                    />
                                </div>
                                <div className="flex items-center justify-between p-3.5 border rounded-xl hover:bg-slate-50 transition-colors bg-white">
                                    <Label htmlFor="office_delivery" className="flex-1 cursor-pointer text-sm font-semibold">توصيل مكتب</Label>
                                    <Switch
                                        id="office_delivery"
                                        checked={formData.is_delivery_desk_available}
                                        onCheckedChange={(c) => setFormData(prev => ({ ...prev, is_delivery_desk_available: c }))}
                                    />
                                </div>
                                <div className="flex items-center justify-between p-3.5 border rounded-xl hover:bg-green-50/30 border-green-100 transition-colors bg-white">
                                    <Label htmlFor="free_delivery" className="flex-1 cursor-pointer text-sm font-semibold text-green-700">توصيل مجاني</Label>
                                    <Switch
                                        id="free_delivery"
                                        checked={formData.is_free_delivery}
                                        onCheckedChange={(c) => setFormData(prev => ({ ...prev, is_free_delivery: c }))}
                                    />
                                </div>
                                <div className="flex items-center justify-between p-3.5 border rounded-xl hover:bg-red-50/30 border-red-100 transition-colors bg-white">
                                    <Label htmlFor="sold_out" className="flex-1 cursor-pointer text-sm font-semibold text-red-600">نفد المخزون</Label>
                                    <Switch
                                        id="sold_out"
                                        checked={formData.is_sold_out}
                                        onCheckedChange={(c) => setFormData(prev => ({ ...prev, is_sold_out: c }))}
                                    />
                                </div>
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