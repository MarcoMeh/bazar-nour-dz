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
import { ConfirmDialog } from "@/components/ConfirmDialog";

interface StoreCategory {
    id: string;
    name: string;
    name_ar?: string;
    slug?: string;
    image_url?: string;
    created_at?: string;
}

interface FormData {
    name: string;
    name_ar: string;
    slug: string;
    image_url: string;
}

export default function AdminStoreCategories() {
    const [categories, setCategories] = useState<StoreCategory[]>([]);
    const [loading, setLoading] = useState(true);
    const [open, setOpen] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [deleteId, setDeleteId] = useState<string | null>(null);

    const [formData, setFormData] = useState<FormData>({
        name: "",
        name_ar: "",
        slug: "",
        image_url: "",
    });
    const [uploading, setUploading] = useState(false);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setLoading(true);
        const { data, error } = await supabase
            .from("store_categories")
            .select("*")
            .order("name");

        if (error) {
            toast.error("فشل في تحميل البيانات");
            console.error(error);
        } else {
            setCategories(data || []);
        }
        setLoading(false);
    };

    const handleDelete = async () => {
        if (!deleteId) return;

        const { error } = await supabase.from("store_categories").delete().eq("id", deleteId);

        if (error) {
            toast.error("فشل في الحذف");
        } else {
            toast.success("تم الحذف بنجاح");
            fetchData();
        }
        setDeleteId(null);
    };

    const handleEdit = (item: StoreCategory) => {
        setEditingId(item.id);
        setFormData({
            name: item.name,
            name_ar: item.name_ar || "",
            slug: item.slug || "",
            image_url: item.image_url || "",
        });
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
                .from('category-images') // Reusing the same bucket
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

        const payload: any = {
            name: formData.name,
            name_ar: formData.name_ar,
            slug: formData.slug || formData.name.toLowerCase().replace(/\s+/g, '-'),
            image_url: formData.image_url,
        };

        let error;
        if (editingId) {
            // Update
            const { error: updateError } = await supabase
                .from("store_categories")
                .update(payload)
                .eq("id", editingId);
            error = updateError;
        } else {
            // Insert
            const { error: insertError } = await supabase
                .from("store_categories")
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
            setFormData({ name: "", name_ar: "", slug: "", image_url: "" });
            fetchData();
        }
    };

    return (
        <div className="p-8">
            <div className="flex items-center justify-between mb-8">
                <h1 className="text-3xl font-bold text-primary">إدارة فئات المتاجر</h1>
                <Dialog open={open} onOpenChange={(val) => {
                    setOpen(val);
                    if (!val) {
                        setEditingId(null);
                        setFormData({ name: "", name_ar: "", slug: "", image_url: "" });
                    }
                }}>
                    <DialogTrigger asChild>
                        <Button onClick={() => {
                            setEditingId(null);
                            setFormData({ name: "", name_ar: "", slug: "", image_url: "" });
                        }}>
                            <Plus className="ml-2 h-4 w-4" />
                            إضافة فئة
                        </Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>{editingId ? "تعديل" : "إضافة جديد"}</DialogTitle>
                            <DialogDescription>
                                أدخل تفاصيل فئة المتجر
                            </DialogDescription>
                        </DialogHeader>
                        <div className="grid gap-4 py-4">
                            <div className="flex flex-col items-center gap-4">
                                <div className="relative w-32 h-32 border-2 border-dashed rounded-lg flex items-center justify-center overflow-hidden bg-muted">
                                    {formData.image_url ? (
                                        <img src={formData.image_url} alt="Category" className="w-full h-full object-cover" />
                                    ) : (
                                        <div className="text-center text-muted-foreground p-2">
                                            <Upload className="mx-auto h-8 w-8 mb-1" />
                                            <span className="text-xs">صورة الفئة</span>
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
                                <Label htmlFor="name">الاسم (إنجليزي)</Label>
                                <Input
                                    id="name"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    placeholder="Store Category Name"
                                />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="name_ar">الاسم (عربي)</Label>
                                <Input
                                    id="name_ar"
                                    value={formData.name_ar}
                                    onChange={(e) => setFormData({ ...formData, name_ar: e.target.value })}
                                    placeholder="اسم فئة المتجر"
                                />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="slug">الاسم اللطيف (Slug)</Label>
                                <Input
                                    id="slug"
                                    value={formData.slug}
                                    onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                                    placeholder="store-category-slug"
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

            <Card>
                <CardHeader>
                    <CardTitle>قائمة فئات المتاجر</CardTitle>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>الصورة</TableHead>
                                <TableHead>الاسم (إنجليزي)</TableHead>
                                <TableHead>الاسم (عربي)</TableHead>
                                <TableHead>الاسم اللطيف</TableHead>
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
                            ) : categories.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={5} className="text-center py-4">لا توجد فئات</TableCell>
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
                                        <TableCell>{cat.name_ar || "-"}</TableCell>
                                        <TableCell>{cat.slug || "-"}</TableCell>
                                        <TableCell>
                                            <div className="flex gap-2">
                                                <Button variant="ghost" size="icon" onClick={() => handleEdit(cat)}>
                                                    <Pencil className="h-4 w-4" />
                                                </Button>
                                                <Button variant="ghost" size="icon" onClick={() => setDeleteId(cat.id)}>
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
                title="حذف الفئة"
                description="هل أنت متأكد من أنك تريد حذف هذه الفئة؟ لا يمكن التراجع عن هذا الإجراء."
                variant="destructive"
            />
        </div>
    );
}
