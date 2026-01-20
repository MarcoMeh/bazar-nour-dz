import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Pencil, Trash2, Loader2, Upload, X, Search } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useAdmin } from "@/contexts/AdminContext";
import { ConfirmDialog } from "@/components/ConfirmDialog";
import { compressImage } from "@/lib/image-upload";

interface Product {
    id: string;
    name: string;
    description?: string;
    price: number;
    image_url?: string;
    additional_images?: string[];
    has_colors: boolean;
    colors?: string[];
    has_sizes: boolean;
    sizes?: string[];
    delivery_type: string;
    is_active?: boolean;
    category_id?: string;
    subcategory_id?: string;
    store_id?: string;
    created_at?: string;
    categories?: any;
    subcategories?: any;
    stores?: any;
}

interface Category {
    id: string;
    name: string;
    slug?: string;
    image_url?: string;
    created_at?: string;
}

interface Subcategory {
    id: string;
    name: string;
    category_id: string;
    slug?: string;
    image_url?: string;
    created_at?: string;
}

interface Store {
    id: string;
    name: string;
}

export default function AdminProducts() {
    const { isAdmin, isStoreOwner, storeId } = useAdmin();
    const navigate = useNavigate();

    const [products, setProducts] = useState<Product[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);
    const [subcategories, setSubcategories] = useState<Subcategory[]>([]);
    const [stores, setStores] = useState<Store[]>([]);
    const [loading, setLoading] = useState(true);
    const [open, setOpen] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);

    const [deleteId, setDeleteId] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState("");

    // Tag Input State
    const [inputColor, setInputColor] = useState("");
    const [inputSize, setInputSize] = useState("");

    const [formData, setFormData] = useState({
        name: "",
        description: "",
        price: "",
        image_url: "",
        category_id: "",
        subcategory_id: "none",
        store_id: "none",
        has_colors: false,
        colors: [] as string[],
        has_sizes: false,
        sizes: [] as string[],
        free_delivery: false,
        is_sold_out: false,
    });

    useEffect(() => {
        // Redirect if not authorized
        if (!isAdmin && !isStoreOwner) {
            // Wait for auth check to complete? 
            // Ideally AdminLayout handles this, but good to have here.
            // For now, we assume AdminLayout protects the route, 
            // but we need to wait for context to populate.
        }

        fetchData();
    }, [isAdmin, isStoreOwner, storeId]);

    const fetchData = async () => {
        setLoading(true);

        let query = supabase
            .from("products")
            .select("*, categories(name), subcategories(name), stores(name)")
            .order("created_at", { ascending: false });

        // Filter for store owner
        if (isStoreOwner && storeId) {
            query = query.eq('store_id', storeId);
        }

        const { data: prods, error: prodError } = await query;

        const { data: cats } = await supabase.from("categories").select("*").order("name");
        const { data: subcats } = await supabase.from("subcategories").select("*").order("name");

        // Only fetch stores if admin (to populate dropdown)
        let strs: any[] = [];
        if (isAdmin) {
            const { data } = await supabase.from("stores").select("id, name").order("name");
            strs = data || [];
        }

        if (prodError) {
            toast.error("فشل في تحميل المنتجات");
            console.error(prodError);
        } else {
            setProducts((prods || []) as any);
            setCategories((cats || []) as any);
            setSubcategories((subcats || []) as any);
            setStores((strs || []) as any);
        }
        setLoading(false);
    };

    const handleAddColor = () => {
        if (inputColor.trim() && !formData.colors.includes(inputColor.trim())) {
            setFormData({ ...formData, colors: [...formData.colors, inputColor.trim()] });
            setInputColor("");
        }
    };

    const handleRemoveColor = (colorToRemove: string) => {
        setFormData({ ...formData, colors: formData.colors.filter(c => c !== colorToRemove) });
    };

    const handleAddSize = () => {
        if (inputSize.trim() && !formData.sizes.includes(inputSize.trim())) {
            setFormData({ ...formData, sizes: [...formData.sizes, inputSize.trim()] });
            setInputSize("");
        }
    };

    const handleRemoveSize = (sizeToRemove: string) => {
        setFormData({ ...formData, sizes: formData.sizes.filter(s => s !== sizeToRemove) });
    };

    const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
        try {
            if (!event.target.files || event.target.files.length === 0) return;
            setUploading(true);
            let file = event.target.files[0];

            // Compress image before upload
            try {
                file = await compressImage(file);
            } catch (err) {
                console.error("Compression failed, uploading original:", err);
            }

            const fileExt = "jpg"; // We force jpg in compression
            const fileName = `${Math.random()}.${fileExt}`;
            const filePath = `${fileName}`;

            const { error: uploadError } = await supabase.storage
                .from('product-images')
                .upload(filePath, file);

            if (uploadError) throw uploadError;

            const { data } = supabase.storage
                .from('product-images')
                .getPublicUrl(filePath);

            setFormData({ ...formData, image_url: data.publicUrl });
            toast.success("تم رفع الصورة بنجاح");
        } catch (error: any) {
            toast.error("فشل في رفع الصورة: " + error.message);
        } finally {
            setUploading(false);
        }
    };

    const handleSave = async () => {
        if (!formData.name || !formData.price || !formData.category_id) {
            toast.error("الرجاء ملء الحقول المطلوبة (الاسم، السعر، التصنيف)");
            return;
        }

        // Map toggles to delivery_type
        let delivery_type = 'home';
        if (formData.is_sold_out) {
            delivery_type = 'sold-out';
        } else if (formData.free_delivery) {
            delivery_type = 'free';
        }

        // Determine store_id
        let finalStoreId = null;
        if (isStoreOwner && storeId) {
            finalStoreId = storeId;
        } else if (isAdmin) {
            finalStoreId = formData.store_id === "none" ? null : formData.store_id;
        }

        const payload: any = {
            name: formData.name,
            description: formData.description,
            price: parseFloat(formData.price),
            image_url: formData.image_url,
            category_id: formData.category_id,
            subcategory_id: formData.subcategory_id === "none" ? null : formData.subcategory_id,
            store_id: finalStoreId,
            has_colors: formData.has_colors,
            colors: formData.has_colors ? formData.colors : [],
            has_sizes: formData.has_sizes,
            sizes: formData.has_sizes ? formData.sizes : [],
            delivery_type: delivery_type,
        };

        let error;
        if (editingId) {
            const { error: updateError } = await supabase
                .from("products")
                .update(payload)
                .eq("id", editingId);
            error = updateError;
        } else {
            const { error: insertError } = await supabase
                .from("products")
                .insert([payload]);
            error = insertError;
        }

        if (error) {
            console.error("Save error:", error);
            toast.error("فشل في الحفظ");
        } else {
            toast.success(editingId ? "تم التحديث" : "تم الإضافة");
            setOpen(false);
            resetForm();
            fetchData();
        }
    };

    const handleDelete = async () => {
        if (!deleteId) return;
        const { error } = await supabase.from("products").delete().eq("id", deleteId);
        if (error) {
            toast.error("فشل في الحذف");
        } else {
            toast.success("تم الحذف");
            fetchData();
        }
        setDeleteId(null);
    };

    const handleEdit = (product: Product) => {
        setEditingId(product.id);
        setFormData({
            name: product.name,
            description: product.description || "",
            price: product.price.toString(),
            image_url: product.image_url || "",
            category_id: product.category_id || "",
            subcategory_id: product.subcategory_id || "none",
            store_id: product.store_id || "none",
            has_colors: product.has_colors,
            colors: product.colors || [],
            has_sizes: product.has_sizes,
            sizes: product.sizes || [],
            free_delivery: product.delivery_type === 'free',
            is_sold_out: product.delivery_type === 'sold-out',
        });
        setOpen(true);
    };

    const resetForm = () => {
        setEditingId(null);
        setFormData({
            name: "",
            description: "",
            price: "",
            image_url: "",
            category_id: "",
            subcategory_id: "none",
            store_id: "none",
            has_colors: false,
            colors: [],
            has_sizes: false,
            sizes: [],
            free_delivery: false,
            is_sold_out: false,
        });
    };

    // Filter subcategories based on selected category
    const filteredSubcategories = subcategories.filter(sub => sub.category_id === formData.category_id);

    // Filter products based on search
    const filteredProducts = products.filter(product =>
        product.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="p-8">
            <div className="flex items-center justify-between mb-8 gap-4">
                <h1 className="text-3xl font-bold text-primary">إدارة المنتجات</h1>

                <div className="relative flex-1 max-w-sm hidden md:flex">
                    <Search className="absolute right-3 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="بحث عن منتج..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pr-9"
                    />
                </div>

                <Dialog open={open} onOpenChange={(val) => {
                    setOpen(val);
                    if (!val) resetForm();
                }}>
                    <DialogTrigger asChild>
                        <Button>
                            <Plus className="ml-2 h-4 w-4" />
                            إضافة منتج
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-[95vw] sm:max-w-2xl max-h-[90vh] overflow-y-auto overflow-x-hidden p-0 border-none shadow-2xl focus-visible:outline-none">
                        <DialogHeader className="p-4 border-b text-right">
                            <DialogTitle className="text-lg font-bold">{editingId ? "تعديل منتج" : "إضافة منتج جديد"}</DialogTitle>
                            <DialogDescription className="text-xs">أدخل تفاصيل المنتج</DialogDescription>
                        </DialogHeader>
                        <div className="p-4 grid gap-4 overflow-x-hidden">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="grid gap-2">
                                    <Label>الاسم</Label>
                                    <Input
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        placeholder="اسم المنتج"
                                    />
                                </div>
                                <div className="grid gap-2">
                                    <Label>السعر (د.ج)</Label>
                                    <Input
                                        type="number"
                                        value={formData.price}
                                        onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                                        placeholder="0.00"
                                    />
                                </div>
                            </div>

                            <div className="grid gap-2">
                                <Label>الوصف</Label>
                                <Textarea
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    placeholder="وصف المنتج..."
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="grid gap-2">
                                    <Label>التصنيف الرئيسي</Label>
                                    <Select
                                        value={formData.category_id}
                                        onValueChange={(val) => setFormData({ ...formData, category_id: val, subcategory_id: "none" })}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="اختر التصنيف" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {categories.map(c => (
                                                <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="grid gap-2">
                                    <Label>التصنيف الفرعي (اختياري)</Label>
                                    <Select
                                        value={formData.subcategory_id}
                                        onValueChange={(val) => setFormData({ ...formData, subcategory_id: val })}
                                        disabled={!formData.category_id}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="اختر التصنيف الفرعي" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="none">بدون تصنيف فرعي</SelectItem>
                                            {filteredSubcategories.map(s => (
                                                <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>

                            {isAdmin && (
                                <div className="grid gap-2">
                                    <Label>المتجر (المورد)</Label>
                                    <Select
                                        value={formData.store_id}
                                        onValueChange={(val) => setFormData({ ...formData, store_id: val })}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="اختر المتجر" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="none">بدون متجر (منتج عام)</SelectItem>
                                            {stores.map(s => (
                                                <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                            )}

                            <div className="flex flex-col gap-4 border p-4 rounded-lg">
                                <div className="flex flex-col gap-1">
                                    <div className="flex items-center justify-between">
                                        <Label>صورة المنتج</Label>
                                        <div className="flex items-center gap-2">
                                            <Input
                                                id="prod-image"
                                                type="file"
                                                accept="image/*"
                                                className="hidden"
                                                onChange={handleImageUpload}
                                            />
                                            <Label
                                                htmlFor="prod-image"
                                                className="cursor-pointer bg-secondary text-secondary-foreground hover:bg-secondary/90 h-9 px-4 py-2 rounded-md text-sm font-medium flex items-center"
                                            >
                                                <Upload className="w-4 h-4 ml-2" />
                                                رفع صورة
                                            </Label>
                                        </div>
                                    </div>
                                    <p className="text-[10px] text-muted-foreground mt-1">
                                        * يمكنك إضافة صورة رئيسية و 3 صور إضافية (الحد الأقصى 4 صور)
                                    </p>
                                </div>
                                {formData.image_url && (
                                    <div className="relative w-full h-40 bg-muted rounded-md overflow-hidden">
                                        <img src={formData.image_url} alt="Preview" className="w-full h-full object-contain" />
                                        {uploading && (
                                            <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                                                <Loader2 className="h-6 w-6 animate-spin text-white" />
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>

                            <div className="flex flex-col gap-4">
                                <div className="border p-4 rounded-lg space-y-4 bg-slate-50/30">
                                    <div className="flex items-center justify-between">
                                        <Label className="font-bold">المقاسات</Label>
                                        <Switch
                                            checked={formData.has_sizes}
                                            onCheckedChange={(checked) => setFormData({ ...formData, has_sizes: checked })}
                                        />
                                    </div>
                                    {formData.has_sizes && (
                                        <div className="space-y-3 p-2 bg-white rounded-md border border-slate-100">
                                            <div className="flex gap-2">
                                                <Input
                                                    value={inputSize}
                                                    onChange={(e) => setInputSize(e.target.value)}
                                                    placeholder="أضف مقاس..."
                                                    onKeyDown={(e) => {
                                                        if (e.key === 'Enter') {
                                                            e.preventDefault();
                                                            handleAddSize();
                                                        }
                                                    }}
                                                />
                                                <Button type="button" onClick={handleAddSize} size="icon">
                                                    <Plus className="h-4 w-4" />
                                                </Button>
                                            </div>
                                            <div className="flex flex-wrap gap-2">
                                                {formData.sizes.map((size, index) => (
                                                    <Badge key={index} variant="outline" className="px-2 py-1 flex items-center gap-1">
                                                        {size}
                                                        <X
                                                            className="h-3 w-3 cursor-pointer hover:text-destructive"
                                                            onClick={() => handleRemoveSize(size)}
                                                        />
                                                    </Badge>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>

                                <div className="border p-4 rounded-lg space-y-4 bg-slate-50/30">
                                    <div className="flex items-center justify-between">
                                        <Label className="font-bold">الألوان</Label>
                                        <Switch
                                            checked={formData.has_colors}
                                            onCheckedChange={(checked) => setFormData({ ...formData, has_colors: checked })}
                                        />
                                    </div>
                                    {formData.has_colors && (
                                        <div className="space-y-3 p-2 bg-white rounded-md border border-slate-100">
                                            <div className="flex gap-2">
                                                <Input
                                                    value={inputColor}
                                                    onChange={(e) => setInputColor(e.target.value)}
                                                    placeholder="أضف لون..."
                                                    onKeyDown={(e) => {
                                                        if (e.key === 'Enter') {
                                                            e.preventDefault();
                                                            handleAddColor();
                                                        }
                                                    }}
                                                />
                                                <Button type="button" onClick={handleAddColor} size="icon">
                                                    <Plus className="h-4 w-4" />
                                                </Button>
                                            </div>
                                            <div className="flex flex-wrap gap-2">
                                                {formData.colors.map((color, index) => (
                                                    <Badge key={index} variant="secondary" className="px-2 py-1 flex items-center gap-1">
                                                        <div className="w-3 h-3 rounded-full border" style={{ backgroundColor: color }}></div>
                                                        {color}
                                                        <X
                                                            className="h-3 w-3 cursor-pointer hover:text-destructive"
                                                            onClick={() => handleRemoveColor(color)}
                                                        />
                                                    </Badge>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="flex items-center justify-between border p-4 rounded-lg">
                                    <Label>توصيل مجاني</Label>
                                    <Switch
                                        checked={formData.free_delivery}
                                        onCheckedChange={(checked) => setFormData({ ...formData, free_delivery: checked })}
                                    />
                                </div>
                                <div className="flex items-center justify-between border p-4 rounded-lg">
                                    <Label>نفذت الكمية</Label>
                                    <Switch
                                        checked={formData.is_sold_out}
                                        onCheckedChange={(checked) => setFormData({ ...formData, is_sold_out: checked })}
                                    />
                                </div>
                            </div>
                        </div>
                        <DialogFooter>
                            <Button onClick={handleSave} disabled={uploading}>
                                {uploading ? <Loader2 className="h-4 w-4 animate-spin ml-2" /> : null}
                                {editingId ? "تحديث المنتج" : "حفظ المنتج"}
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>قائمة المنتجات</CardTitle>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>الصورة</TableHead>
                                <TableHead>الاسم</TableHead>
                                <TableHead>السعر</TableHead>
                                <TableHead>التصنيف</TableHead>
                                <TableHead>المتجر</TableHead>
                                <TableHead>الحالة</TableHead>
                                <TableHead>الإجراءات</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {loading ? (
                                <TableRow>
                                    <TableCell colSpan={7} className="text-center py-4">
                                        <Loader2 className="h-6 w-6 animate-spin mx-auto" />
                                    </TableCell>
                                </TableRow>
                            ) : filteredProducts.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={7} className="text-center py-4">لا توجد منتجات</TableCell>
                                </TableRow>
                            ) : (
                                filteredProducts.map((product) => (
                                    <TableRow key={product.id}>
                                        <TableCell>
                                            {product.image_url ? (
                                                <img src={product.image_url} alt={product.name} className="w-10 h-10 object-cover rounded" />
                                            ) : (
                                                <div className="w-10 h-10 bg-muted rounded flex items-center justify-center text-xs">لا صورة</div>
                                            )}
                                        </TableCell>
                                        <TableCell className="font-medium">{product.name}</TableCell>
                                        <TableCell>{product.price} د.ج</TableCell>
                                        <TableCell>
                                            {product.categories?.name}
                                            {product.subcategories?.name && ` > ${product.subcategories.name}`}
                                        </TableCell>
                                        <TableCell>
                                            {product.stores?.name || "عام"}
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex flex-col gap-1">
                                                {product.delivery_type === 'sold-out' && <span className="text-xs text-destructive font-bold">نفذت الكمية</span>}
                                                {product.delivery_type === 'free' && <span className="text-xs text-green-600">توصيل مجاني</span>}
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex gap-2">
                                                <Button variant="ghost" size="icon" onClick={() => handleEdit(product)}>
                                                    <Pencil className="h-4 w-4" />
                                                </Button>
                                                <Button variant="ghost" size="icon" onClick={() => setDeleteId(product.id)}>
                                                    <Trash2 className="h-4 w-4 text-destructive" />
                                                </Button>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))

                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>

            <ConfirmDialog
                open={!!deleteId}
                onOpenChange={(open) => !open && setDeleteId(null)}
                onConfirm={handleDelete}
                title="حذف المنتج"
                description="هل أنت متأكد من أنك تريد حذف هذا المنتج؟ لا يمكن التراجع عن هذا الإجراء."
                variant="destructive"
            />
        </div>
    );
}
