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
    const [loading, setLoading] = useState(true);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [editingProduct, setEditingProduct] = useState<any>(null);
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

const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name_ar || !formData.price || !formData.category_id) {
        toast.error("الرجاء ملء الاسم، السعر، والفئة");
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
        category_id: formData.category_id,
        image_url: formData.image_url || null,
        store_id: storeId,
        home_delivery: formData.home_delivery,
        office_delivery: formData.office_delivery,
        is_sold_out: formData.is_sold_out,
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
    <div>
        <div className="flex justify-between items-center mb-8">
            <div>
                <h1 className="text-3xl font-bold">إدارة المنتجات</h1>
                <p className="text-muted-foreground mt-1">إضافة وتعديل منتجات محلك</p>
            </div>

            <Dialog open={isDialogOpen} onOpenChange={(open) => { setIsDialogOpen(open); if (!open) resetForm(); }}>
                <DialogTrigger asChild>
                    <Button>
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

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <Label>السعر (دج) *</Label>
                                <Input type="number" step="0.01" value={formData.price} onChange={(e) => setFormData((prev) => ({ ...prev, price: e.target.value }))} required />
                            </div>

                            <div className="space-y-4">
                                <div>
                                    <Label>الفئة الرئيسية *</Label>
                                    <Select
                                        value={(() => {
                                            if (!formData.category_id) return "";
                                            const selectedCat = categories.find(c => c.id === formData.category_id);
                                            if (selectedCat?.parent_id) return selectedCat.parent_id;
                                            // If current category is a main category (no parent), return its own id
                                            return selectedCat?.id || "";
                                        })()}
                                        onValueChange={(parentId) => {
                                            // When main category changes, we must reset the selected sub-category
                                            // unless we want to allow selecting the main category itself (if valid).
                                            // For now, let's just trigger the UI update.
                                            // We can't easily set a valid 'category_id' yet because the user hasn't selected a sub-category.
                                            // EXCEPT if we assume the main category is a valid selection until a sub is picked.
                                            // BUT usually we want leaf nodes.
                                            // Lets clear the actual category_id field so validation fails if they don't pick a sub-category
                                            // OR set it to the parentId temporarily if products can be in root.

                                            // Better approach: We need a local state for the UI that might be separate from formData.category_id initially?
                                            // Actually, the trick above using the IIFE to derive value is good for reading, but for writing we need to be careful.
                                            // Let's just reset category_id to empty string to force sub-selection
                                            setFormData(prev => ({ ...prev, category_id: "" }));

                                            // We need to store the "active" parent ID somewhere if category_id is empty.
                                            // But since we are stateless inside this replace, we rely on a hack or we need to add state.
                                            // Integrating state properly is better.

                                            // Since I cannot add top-level state easily with 'replace_file_content' without replacing the whole file or multiple chunks,
                                            // I will try to infer 'parent' from the props or add a temporary state handling by using a specialized handler
                                            // But wait, I can just use a helper state variable if I modify the component body.

                                            // Let's fallback to: Write to a specialized state variable `activeParentId`?
                                            // No, I'll just clear `formData.category_id` and find a way to persist the parent ID selection.
                                            // A common pattern: formData.category_id holds the FINAL choice. 
                                            // If I clear it, I lose the parent info.

                                            // SOLUTION: I will implement a custom logic using `useEffect` or just component level state in the next step.
                                            // FOR NOW: I will output the UI code assuming `activeParentId` exists, 
                                            // AND I will add `activeParentId` state in a separate edit.
                                            setActiveParentId(parentId);
                                        }}
                                    >
                                        <SelectTrigger><SelectValue placeholder="اختر الفئة الرئيسية" /></SelectTrigger>
                                        <SelectContent>
                                            {categories.filter(c => !c.parent_id).map((cat) => (
                                                <SelectItem key={cat.id} value={String(cat.id)}>{cat.name}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>

                                {activeParentId && (
                                    <div className="animate-in fade-in slide-in-from-top-2">
                                        <Label>الفئة الفرعية *</Label>
                                        <Select
                                            value={formData.category_id}
                                            onValueChange={(v) => setFormData((prev) => ({ ...prev, category_id: v }))}
                                        >
                                            <SelectTrigger><SelectValue placeholder="اختر الفئة الفرعية" /></SelectTrigger>
                                            <SelectContent>
                                                {categories
                                                    .filter(c => c.parent_id === activeParentId)
                                                    .map((cat) => (
                                                        <SelectItem key={cat.id} value={String(cat.id)}>{cat.name}</SelectItem>
                                                    ))}
                                            </SelectContent>
                                        </Select>
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
