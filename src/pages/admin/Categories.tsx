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
import { Plus, Pencil, Trash2, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface Category {
    id: string;
    name_ar: string;
    slug: string;
    image_url?: string;
    parent_id?: string | null;
}

export default function AdminCategories() {
    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState(true);
    const [open, setOpen] = useState(false);
    const [editingCategory, setEditingCategory] = useState<Category | null>(null);
    const [formData, setFormData] = useState<Partial<Category>>({});

    useEffect(() => {
        fetchCategories();
    }, []);

    const fetchCategories = async () => {
        setLoading(true);
        const { data, error } = await supabase
            .from("categories")
            .select("*")
            .order("name_ar");

        if (error) {
            toast.error("فشل في تحميل التصنيفات");
            console.error(error);
        } else {
            setCategories(data || []);
        }
        setLoading(false);
    };

    const mainCategories = categories.filter(c => !c.parent_id);
    const subCategories = categories.filter(c => c.parent_id);

    const handleDelete = async (id: string) => {
        if (!confirm("هل أنت متأكد من حذف هذا التصنيف؟")) return;

        const { error } = await supabase.from("categories").delete().eq("id", id);

        if (error) {
            toast.error("فشل في حذف التصنيف");
        } else {
            toast.success("تم حذف التصنيف بنجاح");
            fetchCategories();
        }
    };

    const handleEdit = (category: Category) => {
        setEditingCategory(category);
        setFormData(category);
        setOpen(true);
    };

    const handleSave = async () => {
        if (!formData.name_ar || !formData.slug) {
            toast.error("يرجى ملء الحقول الأساسية");
            return;
        }

        let error;
        if (editingCategory) {
            const { error: updateError } = await supabase
                .from("categories")
                .update(formData)
                .eq("id", editingCategory.id);
            error = updateError;
        } else {
            // Ensure required fields are present for insert
            const insertData = {
                name_ar: formData.name_ar,
                slug: formData.slug,
                name: formData.slug, // Use slug as name if name is not provided
                image_url: formData.image_url || null,
                parent_id: formData.parent_id || null
            };
            const { error: insertError } = await supabase
                .from("categories")
                .insert([insertData]);
            error = insertError;
        }

        if (error) {
            toast.error("فشل في حفظ التصنيف");
            console.error(error);
        } else {
            toast.success(editingCategory ? "تم تحديث التصنيف" : "تم إضافة التصنيف");
            setOpen(false);
            setEditingCategory(null);
            setFormData({});
            fetchCategories();
        }
    };

    return (
        <div className="p-8">
            <div className="flex items-center justify-between mb-8">
                <h1 className="text-3xl font-bold text-primary">إدارة التصنيفات</h1>
                <Dialog open={open} onOpenChange={(val) => {
                    setOpen(val);
                    if (!val) {
                        setEditingCategory(null);
                        setFormData({});
                    }
                }}>
                    <DialogTrigger asChild>
                        <Button>
                            <Plus className="ml-2 h-4 w-4" />
                            إضافة تصنيف
                        </Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>{editingCategory ? "تعديل تصنيف" : "إضافة تصنيف جديد"}</DialogTitle>
                            <DialogDescription>
                                أدخل تفاصيل التصنيف
                            </DialogDescription>
                        </DialogHeader>
                        <div className="grid gap-4 py-4">
                            <div className="grid gap-2">
                                <Label htmlFor="cat-name">الاسم بالعربية</Label>
                                <Input
                                    id="cat-name"
                                    value={formData.name_ar || ""}
                                    onChange={(e) => setFormData({ ...formData, name_ar: e.target.value })}
                                    placeholder="مثال: ملابس"
                                />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="cat-slug">الاسم اللطيف (Slug)</Label>
                                <Input
                                    id="cat-slug"
                                    value={formData.slug || ""}
                                    onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                                    placeholder="example: clothes"
                                />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="cat-image">رابط الصورة</Label>
                                <Input
                                    id="cat-image"
                                    value={formData.image_url || ""}
                                    onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                                    placeholder="https://..."
                                />
                            </div>
                        </div>
                        <DialogFooter>
                            <Button onClick={handleSave}>{editingCategory ? "تحديث" : "حفظ"}</Button>
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
                                    <TableHead>الاسم</TableHead>
                                    <TableHead>الاسم اللطيف</TableHead>
                                    <TableHead>الإجراءات</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {loading ? (
                                    <TableRow>
                                        <TableCell colSpan={3} className="text-center py-4">
                                            <Loader2 className="h-6 w-6 animate-spin mx-auto" />
                                        </TableCell>
                                    </TableRow>
                                ) : mainCategories.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={3} className="text-center py-4">لا توجد تصنيفات رئيسية</TableCell>
                                    </TableRow>
                                ) : (
                                    mainCategories.map((cat) => (
                                        <TableRow key={cat.id}>
                                            <TableCell className="font-medium">{cat.name_ar}</TableCell>
                                            <TableCell>{cat.slug}</TableCell>
                                            <TableCell>
                                                <div className="flex gap-2">
                                                    <Button variant="ghost" size="icon" onClick={() => handleEdit(cat)}>
                                                        <Pencil className="h-4 w-4" />
                                                    </Button>
                                                    <Button variant="ghost" size="icon" onClick={() => handleDelete(cat.id)}>
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
                                    <TableHead>الاسم</TableHead>
                                    <TableHead>التصنيف الرئيسي</TableHead>
                                    <TableHead>الإجراءات</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {loading ? (
                                    <TableRow>
                                        <TableCell colSpan={3} className="text-center py-4">
                                            <Loader2 className="h-6 w-6 animate-spin mx-auto" />
                                        </TableCell>
                                    </TableRow>
                                ) : subCategories.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={3} className="text-center py-4">لا توجد فئات فرعية</TableCell>
                                    </TableRow>
                                ) : (
                                    subCategories.map((sub) => {
                                        const parent = mainCategories.find(m => m.id === sub.parent_id);
                                        return (
                                            <TableRow key={sub.id}>
                                                <TableCell className="font-medium">{sub.name_ar}</TableCell>
                                                <TableCell>{parent?.name_ar || "غير معروف"}</TableCell>
                                                <TableCell>
                                                    <div className="flex gap-2">
                                                        <Button variant="ghost" size="icon" onClick={() => handleEdit(sub)}>
                                                            <Pencil className="h-4 w-4" />
                                                        </Button>
                                                        <Button variant="ghost" size="icon" onClick={() => handleDelete(sub.id)}>
                                                            <Trash2 className="h-4 w-4 text-destructive" />
                                                        </Button>
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        );
                                    })
                                )}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
