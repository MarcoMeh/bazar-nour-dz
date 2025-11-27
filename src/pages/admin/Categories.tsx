import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
import { Plus, Pencil, Trash2, Loader2, Upload } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

// Interfaces matching the DB schema (plus slug)
interface Category {
    id: string;
    name: string;
    slug?: string;
    image_url?: string;
    created_at?: string;
}

interface Subcategory {
    id: string;
    category_id: string;
    name: string;
    slug?: string;
    image_url?: string;
    created_at?: string;
    // Joined category data
    categories?: Category;
}

interface FormData {
    name: string;
    slug: string;
    image_url: string;
    category_id: string; // For subcategories
}

export default function AdminCategories() {
    const [categories, setCategories] = useState<Category[]>([]);
    const [subcategories, setSubcategories] = useState<Subcategory[]>([]);
    const [loading, setLoading] = useState(true);
    const [open, setOpen] = useState(false);

    // We need to know if we are editing a category or subcategory
    const [editingType, setEditingType] = useState<'category' | 'subcategory'>('category');
    const [editingId, setEditingId] = useState<string | null>(null);

    const [formData, setFormData] = useState<FormData>({
        name: "",
        slug: "",
        image_url: "",
        category_id: "none", // "none" means it's a main category
    });
    const [uploading, setUploading] = useState(false);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setLoading(true);
        const { data: cats, error: catError } = await supabase
            .from("categories")
            .select("*")
            .order("name");

        const { data: subcats, error: subError } = await supabase
            .from("subcategories")
            .select("*, categories(*)")
            .order("name");

        if (catError || subError) {
            toast.error("فشل في تحميل البيانات");
            console.error(catError || subError);
        } else {
            setCategories(cats || []);
            setSubcategories(subcats || []);
        }
        setLoading(false);
    };

    const handleDelete = async (id: string, type: 'category' | 'subcategory') => {
        if (!confirm("هل أنت متأكد من الحذف؟")) return;

        const table = (type === 'category' ? 'categories' : 'subcategories') as "categories" | "subcategories";
        const { error } = await supabase.from(table).delete().eq("id", id);

        if (error) {
            toast.error("فشل في الحذف");
        } else {
            toast.success("تم الحذف بنجاح");
            fetchData();
        }
    };

    const handleEdit = (item: Category | Subcategory, type: 'category' | 'subcategory') => {
        setEditingType(type);
        setEditingId(item.id);

        if (type === 'category') {
            const cat = item as Category;
            setFormData({
                name: cat.name,
                slug: cat.slug || "",
                image_url: cat.image_url || "",
                category_id: "none"
            });
        } else {
            const sub = item as Subcategory;
            setFormData({
                name: sub.name,
                slug: sub.slug || "",
                image_url: sub.image_url || "",
                category_id: sub.category_id
            });
        }
        setOpen(true);
    };

    const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
        try {
            if (!event.target.files || event.target.files.length === 0) {
                return;
            }
            setUploading(true);
            const file = event.target.files[0];
            const fileExt = file.name.split('.').pop();
            const fileName = `${Math.random()}.${fileExt}`;
            const filePath = `${fileName}`;

            const { error: uploadError } = await supabase.storage
                .from('category-images')
                .upload(filePath, file);

            if (uploadError) {
                throw uploadError;
            }

            const { data } = supabase.storage
                .from('category-images')
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
        if (!formData.name) {
            toast.error("الاسم مطلوب");
            return;
        }

        const isSubcategory = formData.category_id !== "none";

        // Determine target table and payload
        let table = (isSubcategory ? 'subcategories' : 'categories') as "categories" | "subcategories";
        let payload: any = {
            name: formData.name,
            slug: formData.slug || formData.name.toLowerCase().replace(/\s+/g, '-'), // Auto-generate slug if empty
            image_url: formData.image_url
        };

        if (isSubcategory) {
            payload.category_id = formData.category_id;
        }

        let error;
        if (editingId) {
            // Update
            if (editingType === 'category' && isSubcategory) {
                toast.error("لا يمكن تحويل تصنيف رئيسي إلى فرعي مباشرة");
                return;
            } else if (editingType === 'subcategory' && !isSubcategory) {
                toast.error("لا يمكن تحويل تصنيف فرعي إلى رئيسي مباشرة");
                return;
            }

            const { error: updateError } = await supabase
                .from(table)
                .update(payload)
                .eq("id", editingId);
            error = updateError;
        } else {
            // Insert
            const { error: insertError } = await supabase
                .from(table)
                .insert([payload]);
            error = insertError;
        }

        if (error) {
            console.error("Save error:", error);
            toast.error(`فشل في الحفظ: ${error.message || "خطأ غير معروف"}`);
        } else {
            toast.success(editingId ? "تم التحديث" : "تم الإضافة");
            setOpen(false);
            setEditingId(null);
            setFormData({ name: "", slug: "", image_url: "", category_id: "none" });
            fetchData();
        }
    };

    return (
        <div className="p-8">
            <div className="flex items-center justify-between mb-8">
                <h1 className="text-3xl font-bold text-primary">إدارة التصنيفات</h1>
                <Dialog open={open} onOpenChange={(val) => {
                    setOpen(val);
                    if (!val) {
                        setEditingId(null);
                        setFormData({ name: "", slug: "", image_url: "", category_id: "none" });
                        setEditingType('category');
                    }
                }}>
                    <DialogTrigger asChild>
                        <Button onClick={() => {
                            setEditingType('category');
                            setFormData({ name: "", slug: "", image_url: "", category_id: "none" });
                        }}>
                            <Plus className="ml-2 h-4 w-4" />
                            إضافة تصنيف
                        </Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>{editingId ? "تعديل" : "إضافة جديد"}</DialogTitle>
                            <DialogDescription>
                                أدخل التفاصيل
                            </DialogDescription>
                        </DialogHeader>
                        <div className="grid gap-4 py-4">
                            <div className="grid gap-2">
                                <Label htmlFor="type">نوع التصنيف</Label>
                                <Select
                                    value={formData.category_id}
                                    onValueChange={(val) => setFormData({ ...formData, category_id: val })}
                                    disabled={!!editingId} // Disable changing type during edit for simplicity
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="اختر النوع" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="none">تصنيف رئيسي</SelectItem>
                                        {categories.map(c => (
                                            <SelectItem key={c.id} value={c.id}>فرعي من: {c.name}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="flex flex-col items-center gap-4">
                                <div className="relative w-32 h-32 border-2 border-dashed rounded-lg flex items-center justify-center overflow-hidden bg-muted">
                                    {formData.image_url ? (
                                        <img src={formData.image_url} alt="Category" className="w-full h-full object-cover" />
                                    ) : (
                                        <div className="text-center text-muted-foreground p-2">
                                            <Upload className="mx-auto h-8 w-8 mb-1" />
                                            <span className="text-xs">صورة التصنيف</span>
                                        </div>
                                    )}
                                    {uploading && (
                                        <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                                            <Loader2 className="h-6 w-6 animate-spin text-white" />
                                        </div>
                                    )}
                                </div>
                                <div className="flex items-center gap-2">
                                    <Input
                                        id="image-upload"
                                        type="file"
                                        accept="image/*"
                                        className="hidden"
                                        onChange={handleImageUpload}
                                    />
                                    <Label
                                        htmlFor="image-upload"
                                        className="cursor-pointer bg-secondary text-secondary-foreground hover:bg-secondary/90 h-9 px-4 py-2 rounded-md text-sm font-medium flex items-center"
                                    >
                                        <Upload className="w-4 h-4 ml-2" />
                                        رفع صورة
                                    </Label>
                                </div>
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="name">الاسم</Label>
                                <Input
                                    id="name"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    placeholder="اسم التصنيف"
                                />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="slug">الاسم اللطيف (Slug)</Label>
                                <Input
                                    id="slug"
                                    value={formData.slug}
                                    onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                                    placeholder="example-slug"
                                />
                            </div>
                        </div>
                        <DialogFooter>
                            <Button onClick={handleSave} disabled={uploading}>
                                {uploading ? <Loader2 className="h-4 w-4 animate-spin ml-2" /> : null}
                                {editingId ? "تحديث" : "حفظ"}
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>

            <div className="grid gap-6">
                {/* Main Categories */}
                <Card>
                    <CardHeader>
                        <CardTitle>التصنيفات الرئيسية</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>الصورة</TableHead>
                                    <TableHead>الاسم</TableHead>
                                    <TableHead>الاسم اللطيف</TableHead>
                                    <TableHead>الإجراءات</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {loading ? (
                                    <TableRow>
                                        <TableCell colSpan={4} className="text-center py-4">
                                            <Loader2 className="h-6 w-6 animate-spin mx-auto" />
                                        </TableCell>
                                    </TableRow>
                                ) : categories.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={4} className="text-center py-4">لا توجد تصنيفات رئيسية</TableCell>
                                    </TableRow>
                                ) : (
                                    categories.map((cat) => (
                                        <TableRow key={cat.id}>
                                            <TableCell>
                                                {cat.image_url ? (
                                                    <img src={cat.image_url} alt={cat.name} className="w-10 h-10 object-cover rounded" />
                                                ) : (
                                                    <div className="w-10 h-10 bg-muted rounded flex items-center justify-center text-xs">لا صورة</div>
                                                )}
                                            </TableCell>
                                            <TableCell className="font-medium">{cat.name}</TableCell>
                                            <TableCell>{cat.slug || "-"}</TableCell>
                                            <TableCell>
                                                <div className="flex gap-2">
                                                    <Button variant="ghost" size="icon" onClick={() => handleEdit(cat, 'category')}>
                                                        <Pencil className="h-4 w-4" />
                                                    </Button>
                                                    <Button variant="ghost" size="icon" onClick={() => handleDelete(cat.id, 'category')}>
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

                {/* Subcategories */}
                <Card>
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <CardTitle>الفئات الفرعية</CardTitle>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>الصورة</TableHead>
                                    <TableHead>الاسم</TableHead>
                                    <TableHead>الاسم اللطيف</TableHead>
                                    <TableHead>التصنيف الرئيسي</TableHead>
                                    <TableHead>الإجراءات</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {loading ? (
                                    <TableRow>
                                        <TableCell colSpan={5} className="text-center py-4">
                                            <Loader2 className="h-6 w-6 animate-spin mx-auto" />
                                        </TableCell>
                                    </TableRow>
                                ) : subcategories.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={5} className="text-center py-4">لا توجد فئات فرعية</TableCell>
                                    </TableRow>
                                ) : (
                                    subcategories.map((sub) => (
                                        <TableRow key={sub.id}>
                                            <TableCell>
                                                {sub.image_url ? (
                                                    <img src={sub.image_url} alt={sub.name} className="w-10 h-10 object-cover rounded" />
                                                ) : (
                                                    <div className="w-10 h-10 bg-muted rounded flex items-center justify-center text-xs">لا صورة</div>
                                                )}
                                            </TableCell>
                                            <TableCell className="font-medium">{sub.name}</TableCell>
                                            <TableCell>{sub.slug || "-"}</TableCell>
                                            <TableCell>{sub.categories?.name || "غير معروف"}</TableCell>
                                            <TableCell>
                                                <div className="flex gap-2">
                                                    <Button variant="ghost" size="icon" onClick={() => handleEdit(sub, 'subcategory')}>
                                                        <Pencil className="h-4 w-4" />
                                                    </Button>
                                                    <Button variant="ghost" size="icon" onClick={() => handleDelete(sub.id, 'subcategory')}>
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
            </div>
        </div>
    );
}
