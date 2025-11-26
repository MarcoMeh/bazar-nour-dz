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

interface StoreOwner {
    id: string;
    owner_name: string;
    email: string;
    phone?: string;
    address?: string;
    store_image_url?: string;
    store_name?: string;
    category_id?: string;
    facebook_link?: string;
    instagram_link?: string;
    tiktok_link?: string;
    whatsapp_number?: string;
    password?: string;
    is_active?: boolean;
    created_at?: string;
    updated_at?: string;
}

export default function AdminStores() {
    const [stores, setStores] = useState<StoreOwner[]>([]);
    const [loading, setLoading] = useState(true);
    const [open, setOpen] = useState(false);
    const [editingStore, setEditingStore] = useState<StoreOwner | null>(null);
    const [formData, setFormData] = useState<Partial<StoreOwner>>({});

    useEffect(() => {
        fetchStores();
    }, []);

    const fetchStores = async () => {
        setLoading(true);
        const { data, error } = await supabase
            .from("store_owners")
            .select("*")
            .order("created_at", { ascending: false });

        if (error) {
            toast.error("فشل في تحميل المحلات");
            console.error(error);
        } else {
            setStores(data || []);
        }
        setLoading(false);
    };

    const handleDelete = async (id: string) => {
        if (!confirm("هل أنت متأكد من حذف هذا المحل؟")) return;

        const { error } = await supabase.from("store_owners").delete().eq("id", id);

        if (error) {
            toast.error("فشل في حذف المحل");
        } else {
            toast.success("تم حذف المحل بنجاح");
            fetchStores();
        }
    };

    const handleEdit = (store: StoreOwner) => {
        setEditingStore(store);
        setFormData(store);
        setOpen(true);
    };

    const handleSave = async () => {
        if (!formData.owner_name || !formData.email) {
            toast.error("يرجى ملء الحقول الأساسية");
            return;
        }

        let error;
        if (editingStore) {
            const { error: updateError } = await supabase
                .from("store_owners")
                .update(formData)
                .eq("id", editingStore.id);
            error = updateError;
        } else {
            // Ensure required fields are present for insert
            const insertData = {
                owner_name: formData.owner_name,
                email: formData.email,
                phone: formData.phone || null,
                address: formData.address || null,
                store_image_url: formData.store_image_url || null,
                store_name: formData.store_name || null,
                category_id: formData.category_id || null,
                facebook_link: formData.facebook_link || null,
                instagram_link: formData.instagram_link || null,
                tiktok_link: formData.tiktok_link || null,
                whatsapp_number: formData.whatsapp_number || null,
            };
            const { error: insertError } = await supabase
                .from("store_owners")
                .insert([insertData]);
            error = insertError;
        }

        if (error) {
            toast.error("فشل في حفظ المحل");
            console.error(error);
        } else {
            toast.success(editingStore ? "تم تحديث المحل" : "تم إضافة المحل");
            setOpen(false);
            setEditingStore(null);
            setFormData({});
            fetchStores();
        }
    };

    return (
        <div className="p-8">
            <div className="flex items-center justify-between mb-8">
                <h1 className="text-3xl font-bold text-primary">إدارة المحلات</h1>
                <Dialog open={open} onOpenChange={(val) => {
                    setOpen(val);
                    if (!val) {
                        setEditingStore(null);
                        setFormData({});
                    }
                }}>
                    <DialogTrigger asChild>
                        <Button>
                            <Plus className="ml-2 h-4 w-4" />
                            إضافة محل
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-2xl">
                        <DialogHeader>
                            <DialogTitle>{editingStore ? "تعديل محل" : "إضافة محل جديد"}</DialogTitle>
                            <DialogDescription>
                                أدخل تفاصيل المحل وصاحبه
                            </DialogDescription>
                        </DialogHeader>
                        <div className="grid gap-4 py-4">
                            <div className="grid gap-2">
                                <Label htmlFor="store-name">اسم المحل</Label>
                                <Input
                                    id="store-name"
                                    value={formData.store_name || ""}
                                    onChange={(e) => setFormData({ ...formData, store_name: e.target.value })}
                                    placeholder="أدخل اسم المحل"
                                />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="owner-name">اسم صاحب المحل</Label>
                                <Input
                                    id="owner-name"
                                    value={formData.owner_name || ""}
                                    onChange={(e) => setFormData({ ...formData, owner_name: e.target.value })}
                                    placeholder="الاسم الكامل"
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="grid gap-2">
                                    <Label htmlFor="email">البريد الإلكتروني</Label>
                                    <Input
                                        id="email"
                                        type="email"
                                        value={formData.email || ""}
                                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                        placeholder="email@example.com"
                                        dir="ltr"
                                    />
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="phone">رقم الهاتف</Label>
                                    <Input
                                        id="phone"
                                        value={formData.phone || ""}
                                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                        placeholder="0555123456"
                                        dir="ltr"
                                    />
                                </div>
                            </div>
                            {!editingStore && (
                                <div className="grid gap-2">
                                    <Label htmlFor="password">كلمة المرور</Label>
                                    <Input id="password" type="password" dir="ltr" placeholder="******" />
                                </div>
                            )}
                            <div className="grid gap-2">
                                <Label htmlFor="address">العنوان</Label>
                                <Input
                                    id="address"
                                    value={formData.address || ""}
                                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                                    placeholder="العنوان الكامل"
                                />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="store-image">رابط صورة المحل</Label>
                                <Input
                                    id="store-image"
                                    value={formData.store_image_url || ""}
                                    onChange={(e) => setFormData({ ...formData, store_image_url: e.target.value })}
                                    placeholder="https://..."
                                />
                            </div>
                        </div>
                        <DialogFooter>
                            <Button onClick={handleSave}>{editingStore ? "تحديث" : "حفظ"}</Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>قائمة المحلات</CardTitle>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>الصورة</TableHead>
                                <TableHead>اسم المحل</TableHead>
                                <TableHead>صاحب المحل</TableHead>
                                <TableHead>البريد الإلكتروني</TableHead>
                                <TableHead>الهاتف</TableHead>
                                <TableHead>الإجراءات</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {loading ? (
                                <TableRow>
                                    <TableCell colSpan={6} className="text-center py-8">
                                        <Loader2 className="h-8 w-8 animate-spin mx-auto" />
                                    </TableCell>
                                </TableRow>
                            ) : stores.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={6} className="text-center py-8">
                                        لا توجد محلات
                                    </TableCell>
                                </TableRow>
                            ) : (
                                stores.map((store) => (
                                    <TableRow key={store.id}>
                                        <TableCell>
                                            {store.store_image_url ? (
                                                <img src={store.store_image_url} alt={store.store_name} className="w-12 h-12 object-cover rounded" />
                                            ) : (
                                                <div className="w-12 h-12 bg-muted rounded flex items-center justify-center text-xs">لا صورة</div>
                                            )}
                                        </TableCell>
                                        <TableCell className="font-medium">{store.store_name}</TableCell>
                                        <TableCell>{store.owner_name}</TableCell>
                                        <TableCell dir="ltr" className="text-right">{store.email}</TableCell>
                                        <TableCell dir="ltr" className="text-right">{store.phone}</TableCell>
                                        <TableCell>
                                            <div className="flex gap-2">
                                                <Button variant="ghost" size="icon" onClick={() => handleEdit(store)}>
                                                    <Pencil className="h-4 w-4" />
                                                </Button>
                                                <Button variant="ghost" size="icon" onClick={() => handleDelete(store.id)}>
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
    );
}
