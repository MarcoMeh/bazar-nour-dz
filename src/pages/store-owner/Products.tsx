import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Plus, Edit, Trash2, Upload, X } from "lucide-react";
import { ConfirmDialog } from "@/components/ConfirmDialog";
import { ERROR_MESSAGES, SUCCESS_MESSAGES, getErrorMessage } from "@/lib/errorMessages";
import { LoadingSpinner } from "@/components/LoadingSpinner";

export default function StoreOwnerProducts() {
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
        home_delivery: true,
        office_delivery: true,
        is_sold_out: false,
        is_free_delivery: false,
        additional_images: [] as string[],
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

        const { data: store } = await supabase
            .from("stores")
            .select("id")
            .eq("owner_id", user.id)
            .single();

        setStoreId(store?.id || null);
    };

    const fetchCategories = async () => {
        // Fetch categories (main categories)
        const { data: cats } = await supabase.from("categories").select("*").order("name");
        // Fetch subcategories (separate table like admin page)
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

        if (error) {
            toast.error(getErrorMessage(error));
        } else {
            setProducts(data || []);
        }
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
            home_delivery: true,
            office_delivery: true,
            is_sold_out: false,
            is_free_delivery: false,
            additional_images: [],
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
            home_delivery: product.home_delivery ?? true,
            office_delivery: product.office_delivery ?? true,
            is_sold_out: product.is_sold_out ?? false,
            is_free_delivery: product.is_free_delivery ?? false,
            additional_images: product.additional_images || [],
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

        if (error) {
            toast.error(getErrorMessage(error));
        } else {
            toast.success(SUCCESS_MESSAGES.PRODUCTS.DELETED);
            fetchProducts();
        }
        setProductToDelete(null);
    };

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        setUploading(true);

        const fileExt = file.name.split(".").pop();
        const fileName = `${Date.now()}-${Math.random().toString(36).slice(2)}.${fileExt}`;

        const { error: uploadError } = await supabase.storage
            .from("product-images")
            .upload(fileName, file);

        if (uploadError) {
            toast.error("فشل رفع الصورة");
            setUploading(false);
            return;
        }

        const { data: { publicUrl } } = supabase.storage.from("product-images").getPublicUrl(fileName);
        setFormData((prev) => ({ ...prev, image_url: publicUrl }));
        toast.success("تم رفع الصورة");
        setUploading(false);
    };

    const handleAdditionalImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (!files || files.length === 0) return;
        setUploading(true);

        const newImages: string[] = [];

        for (let i = 0; i < files.length; i++) {
            const file = files[i];
            const fileExt = file.name.split(".").pop();
            const fileName = `${Date.now()}-${Math.random().toString(36).slice(2)}.${fileExt}`;

            const { error: uploadError } = await supabase.storage
                .from("product-images")
                .upload(fileName, file);

            if (uploadError) {
                toast.error(`فشل رفع الصورة ${file.name}`);
                continue;
            }

            const { data: { publicUrl } } = supabase.storage.from("product-images").getPublicUrl(fileName);
            newImages.push(publicUrl);
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

    // Filter subcategories based on selected category (same logic as admin page)
    const filteredSubcategories = subcategories.filter(sub => sub.category_id === formData.category_id);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!formData.name_ar || !formData.price || !formData.category_id) {
            toast.error("الرجاء ملء الاسم، السعر، والفئة الرئيسية");
            return;
        }

        // Subcategory is required if there are subcategories for the selected category
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
            home_delivery: formData.home_delivery,
            office_delivery: formData.office_delivery,
            is_sold_out: formData.is_sold_out,
            is_free_delivery: formData.is_free_delivery,
            additional_images: formData.additional_images,
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

    if (loading) {
        return <LoadingSpinner fullScreen message="جاري تحميل المنتجات..." />;
    }

    if (!storeId) {
        return (
            <Card className="p-8 text-center">
                <p className="text-muted-foreground">لا يوجد محل مرتبط بحسابك</p>
            </Card>
        );
    }

    return (
        <div className="p-4 md:p-8 space-y-4 md:space-y-6">
            <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-3">
                <div>
                    <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-primary">إدارة المنتجات</h1>
                    <p className="text-sm md:text-base text-muted-foreground mt-1">إضافة وتعديل منتجات محلك</p>
                </div>

                <Dialog open={isDialogOpen} onOpenChange={(open) => { setIsDialogOpen(open); if (!open) resetForm(); }}>
                    <DialogTrigger asChild>
                        <Button className="w-full md:w-auto">
                            <Plus className="ml-2 h-4 w-4" />
                            إضافة منتج
                        </Button>
                    </DialogTrigger>

                    <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                        <DialogHeader>
                            <DialogTitle>{editingProduct ? "تعديل المنتج" : "إضافة منتج جديد"}</DialogTitle>
                        </DialogHeader>

                        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
                            <div>
                                <Label>الاسم بالعربية *</Label>
                                <Input value={formData.name_ar} onChange={(e) => setFormData((prev) => ({ ...prev, name_ar: e.target.value }))} required />
                            </div>

                            <div>
                                <Label>الوصف</Label>
                                <Textarea value={formData.description_ar} onChange={(e) => setFormData((prev) => ({ ...prev, description_ar: e.target.value }))} />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <Label>السعر (دج) *</Label>
                                    <Input type="number" step="0.01" value={formData.price} onChange={(e) => setFormData((prev) => ({ ...prev, price: e.target.value }))} required />
                                </div>

                                <div className="space-y-4">
                                    {/* Main Category */}
                                    <div>
                                        <Label>التصنيف الرئيسي *</Label>
                                        <Select
                                            value={formData.category_id}
                                            onValueChange={(v) => setFormData(prev => ({ ...prev, category_id: v, subcategory_id: "" }))}
                                        >
                                            <SelectTrigger><SelectValue placeholder="اختر التصنيف" /></SelectTrigger>
                                            <SelectContent>
                                                {categories.map((cat) => (
                                                    <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    {/* Subcategory - shows when main category is selected */}
                                    {formData.category_id && (
                                        <div className="animate-in fade-in slide-in-from-top-2">
                                            <Label>التصنيف الفرعي {filteredSubcategories.length > 0 ? "*" : "(اختياري)"}</Label>
                                            {filteredSubcategories.length > 0 ? (
                                                <Select
                                                    value={formData.subcategory_id}
                                                    onValueChange={(v) => setFormData((prev) => ({ ...prev, subcategory_id: v }))}
                                                >
                                                    <SelectTrigger><SelectValue placeholder="اختر التصنيف الفرعي" /></SelectTrigger>
                                                    <SelectContent>
                                                        {filteredSubcategories.map((subcat) => (
                                                            <SelectItem key={subcat.id} value={subcat.id}>{subcat.name}</SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                            ) : (
                                                <p className="text-sm text-muted-foreground p-2 border rounded-md bg-muted">
                                                    لا توجد تصنيفات فرعية لهذا التصنيف
                                                </p>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div>
                                <Label>صورة المنتج الرئيسية</Label>
                                <div className="flex items-center gap-3">
                                    <input id="image-upload" type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
                                    <label htmlFor="image-upload">
                                        <Button type="button" variant="outline" asChild>
                                            <span><Upload className="ml-2 h-4 w-4" />{uploading ? "جاري الرفع..." : "رفع صورة"}</span>
                                        </Button>
                                    </label>
                                    <Input placeholder="أو ضع رابط الصورة" value={formData.image_url} onChange={(e) => setFormData((prev) => ({ ...prev, image_url: e.target.value }))} />
                                </div>
                                {formData.image_url && <img src={formData.image_url} alt="preview" className="h-32 w-32 object-cover rounded mt-2 border" />}
                            </div>

                            <div>
                                <Label>صور إضافية (للمعرض)</Label>
                                <div className="flex items-center gap-3 mb-2">
                                    <input id="additional-images-upload" type="file" accept="image/*" multiple onChange={handleAdditionalImageUpload} className="hidden" />
                                    <label htmlFor="additional-images-upload">
                                        <Button type="button" variant="secondary" asChild>
                                            <span><Plus className="ml-2 h-4 w-4" />{uploading ? "جاري الرفع..." : "إضافة صور"}</span>
                                        </Button>
                                    </label>
                                </div>

                                {formData.additional_images && formData.additional_images.length > 0 && (
                                    <div className="grid grid-cols-4 gap-2 mt-2">
                                        {formData.additional_images.map((img, index) => (
                                            <div key={index} className="relative group">
                                                <img src={img} alt={`additional-${index}`} className="h-20 w-full object-cover rounded border" />
                                                <button
                                                    type="button"
                                                    onClick={() => removeAdditionalImage(index)}
                                                    className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                                                >
                                                    <X className="h-3 w-3" />
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="flex items-center justify-between">
                                    <Label>التوصيل للمنزل</Label>
                                    <Switch checked={formData.home_delivery} onCheckedChange={(checked) => setFormData((prev) => ({ ...prev, home_delivery: checked }))} />
                                </div>

                                <div className="flex items-center justify-between">
                                    <Label>التوصيل للمكتب</Label>
                                    <Switch checked={formData.office_delivery} onCheckedChange={(checked) => setFormData((prev) => ({ ...prev, office_delivery: checked }))} />
                                </div>

                                <div className="flex items-center justify-between">
                                    <Label>توصيل مجاني</Label>
                                    <Switch checked={formData.is_free_delivery} onCheckedChange={(checked) => setFormData((prev) => ({ ...prev, is_free_delivery: checked }))} />
                                </div>

                                <div className="flex items-center justify-between">
                                    <Label>نفد من المخزون</Label>
                                    <Switch checked={formData.is_sold_out} onCheckedChange={(checked) => setFormData((prev) => ({ ...prev, is_sold_out: checked }))} />
                                </div>
                            </div>

                            <div className="flex gap-2 justify-end pt-4">
                                <Button type="button" variant="outline" onClick={() => { setIsDialogOpen(false); resetForm(); }}>إلغاء</Button>
                                <Button type="submit">{editingProduct ? "تحديث" : "إضافة"}</Button>
                            </div>
                        </form>
                    </DialogContent>
                </Dialog>
            </div>

            {/* Products List */}
            <div className="grid gap-4">
                {products.length === 0 ? (
                    <Card className="p-12 text-center">
                        <p className="text-muted-foreground mb-4">لا توجد منتجات بعد</p>
                        <Button onClick={() => setIsDialogOpen(true)}>
                            <Plus className="ml-2 h-4 w-4" />
                            أضف منتجك الأول
                        </Button>
                    </Card>
                ) : (
                    products.map((product) => (
                        <Card key={product.id} className="p-4 flex justify-between items-center">
                            <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                    <h3 className="font-bold text-lg">{product.name}</h3>
                                    {product.is_sold_out && <Badge variant="destructive">نفد</Badge>}
                                </div>
                                <p className="text-sm font-medium text-primary">{product.price} دج</p>
                                {product.categories?.name && (
                                    <p className="text-xs text-muted-foreground">
                                        {product.categories.name}
                                        {product.subcategories?.name && ` / ${product.subcategories.name}`}
                                    </p>
                                )}
                                {product.description && <p className="text-sm text-muted-foreground mt-1">{product.description}</p>}

                                <div className="mt-3 flex flex-wrap gap-2">
                                    {product.is_free_delivery && <Badge variant="secondary">توصيل مجاني</Badge>}
                                    {product.home_delivery && <Badge variant="outline">توصيل منزل</Badge>}
                                    {product.office_delivery && <Badge variant="outline">توصيل مكتب</Badge>}
                                </div>
                            </div>

                            <div className="flex gap-2">
                                <Button variant="outline" size="icon" onClick={() => handleEdit(product)}>
                                    <Edit className="h-4 w-4" />
                                </Button>
                                <Button variant="destructive" size="icon" onClick={() => handleDelete(product.id)}>
                                    <Trash2 className="h-4 w-4" />
                                </Button>
                            </div>
                        </Card>
                    ))
                )}
            </div>

            <ConfirmDialog
                open={deleteConfirmOpen}
                onOpenChange={setDeleteConfirmOpen}
                onConfirm={confirmDelete}
                title="حذف المنتج"
                description="هل أنت متأكد من حذف هذا المنتج؟ لن تتمكن من التراجع عن هذا الإجراء."
                confirmText="حذف"
                variant="destructive"
            />
        </div>
    );
}
