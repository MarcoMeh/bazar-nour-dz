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
import {
    Select as UISelect,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Pencil, Trash2, Loader2, Upload, ToggleRight } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { createClient } from "@supabase/supabase-js";
import { useAdmin } from "@/contexts/AdminContext";
import { ConfirmDialog } from "@/components/ConfirmDialog";

// Define interfaces based on the actual SQL schema
interface Profile {
    id: string;
    email: string;
    role: 'admin' | 'store_owner' | 'customer';
    full_name: string | null;
    phone: string | null;
    address: string | null;
}

interface Store {
    id: string;
    owner_id: string;
    name: string;
    description: string | null;
    image_url: string | null;
    is_active: boolean;
    created_at: string;
    // Joined profile data
    profiles?: Profile;
    category_id?: string;
    store_categories?: { name: string };
    subscription_end_date?: string;
    whatsapp?: string | null;
    facebook?: string | null;
    instagram?: string | null;
    tiktok?: string | null;
}

// Form data interface
interface StoreFormData {
    store_name: string;
    owner_name: string;
    email: string;
    phone: string;
    address: string;
    password?: string;
    image_url: string;
    description: string;
    category_id: string;
    whatsapp: string;
    facebook: string;
    instagram: string;
    tiktok: string;
}

export default function AdminStores() {
    const { isAdmin, isStoreOwner, storeId } = useAdmin();
    const [stores, setStores] = useState<Store[]>([]);
    const [loading, setLoading] = useState(true);
    const [open, setOpen] = useState(false);
    const [editingStore, setEditingStore] = useState<Store | null>(null);
    const [formData, setFormData] = useState<StoreFormData>({
        store_name: "",
        owner_name: "",
        email: "",
        phone: "",
        address: "",
        image_url: "",
        description: "",
        category_id: "",
        whatsapp: "",
        facebook: "",
        instagram: "",
        tiktok: "",
    });
    const [categories, setCategories] = useState<any[]>([]);
    const [uploading, setUploading] = useState(false);
    const [deleteId, setDeleteId] = useState<string | null>(null);

    useEffect(() => {
        fetchStores();
    }, [isAdmin, isStoreOwner, storeId]);

    const fetchStores = async () => {
        setLoading(true);
        // Correct query for separate categories and joined data
        const { data: cats } = await supabase.from("categories").select("*").order("name");
        setCategories(cats || []);

        let query = supabase
            .from("stores")
            .select(`
                *,
                profiles:owner_id(*),
                store_categories(
                    categories(
                        id,
                        name
                    )
                )
            `)
            .order("created_at", { ascending: false });

        if (isStoreOwner && storeId) {
            query = query.eq('id', storeId);
        }

        const { data, error } = await query;

        if (error) {
            toast.error("فشل في تحميل المحلات");
            console.error(error);
        } else {
            // Map to flatten categories for easier usage if needed, or update interface
            const processedStores = (data || []).map((store: any) => ({
                ...store,
                categories: store.store_categories?.map((sc: any) => sc.categories) || [],
                profiles: store.profiles ? {
                    ...store.profiles,
                    role: store.profiles.role as 'admin' | 'store_owner' | 'customer'
                } : undefined
            })) as Store[];
            setStores(processedStores);
        }
        setLoading(false);
    };

    const handleDelete = async () => {
        if (!deleteId) return;

        const { error } = await supabase.from("stores").delete().eq("id", deleteId);

        if (error) {
            toast.error("فشل في حذف المحل");
            console.error(error);
        } else {
            toast.success("تم حذف المحل بنجاح");
            fetchStores();
        }
        setDeleteId(null);
    };

    const handleEdit = (store: Store) => {
        setEditingStore(store);
        setFormData({
            store_name: store.name,
            owner_name: store.profiles?.full_name || "",
            email: store.profiles?.email || "",
            phone: store.profiles?.phone || "",
            address: store.profiles?.address || "",
            image_url: store.image_url || "",
            description: store.description || "",
            category_id: store.category_id || "",
            whatsapp: store.whatsapp || "",
            facebook: store.facebook || "",
            instagram: store.instagram || "",
            tiktok: store.tiktok || "",
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
                .from('store-images')
                .upload(filePath, file);

            if (uploadError) {
                throw uploadError;
            }

            const { data } = supabase.storage
                .from('store-images')
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
        if (!formData.store_name || !formData.email || !formData.owner_name) {
            toast.error("يرجى ملء الحقول الأساسية (اسم المحل، اسم المالك، البريد الإلكتروني)");
            return;
        }

        setLoading(true);

        try {
            if (editingStore) {
                // Update existing store
                // 1. Update Store details
                const { error: storeError } = await supabase
                    .from("stores")
                    .update({
                        name: formData.store_name,
                        image_url: formData.image_url,
                        description: formData.description,
                        category_id: formData.category_id || null,
                        whatsapp: formData.whatsapp || null,
                        facebook: formData.facebook || null,
                        instagram: formData.instagram || null,
                        tiktok: formData.tiktok || null,
                    })
                    .eq("id", editingStore.id);

                if (storeError) throw storeError;

                // 2. Update Profile details
                const { error: profileError } = await supabase
                    .from("profiles")
                    .update({
                        full_name: formData.owner_name,
                        phone: formData.phone,
                        address: formData.address,
                    })
                    .eq("id", editingStore.owner_id);

                if (profileError) throw profileError;

                toast.success("تم تحديث المحل بنجاح");
            } else {
                // Create new store
                if (!formData.password) {
                    toast.error("كلمة المرور مطلوبة للمحلات الجديدة");
                    setLoading(false);
                    return;
                }

                // Temporary client to create user without logging out admin
                const tempClient = createClient(
                    import.meta.env.VITE_SUPABASE_URL,
                    import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
                    {
                        auth: {
                            persistSession: false, // Don't persist this session
                            autoRefreshToken: false,
                            detectSessionInUrl: false,
                        },
                    }
                );

                // 1. Create Auth User
                const { data: authData, error: authError } = await tempClient.auth.signUp({
                    email: formData.email,
                    password: formData.password,
                    options: {
                        data: {
                            full_name: formData.owner_name,
                            role: 'store_owner', // Important: Set role metadata
                        },
                        emailRedirectTo: window.location.origin,
                    },
                });


                if (authError) {
                    // Check if it's a duplicate email error
                    if (authError.message?.includes('already registered') || authError.message?.includes('already been registered')) {
                        throw new Error("البريد الإلكتروني مستخدم مسبقاً. يرجى استخدام بريد إلكتروني آخر");
                    }
                    throw authError;
                }
                if (!authData.user) throw new Error("فشل في إنشاء المستخدم");

                const userId = authData.user.id;
                // Retry logic for profile creation (to handle trigger lag)
                let profileError = null;
                for (let i = 0; i < 3; i++) {
                    // Wait a bit (increasing delay)
                    await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1)));

                    // Use RPC function to create profile (bypasses RLS)
                    const { error } = await supabase.rpc('create_profile_for_user', {
                        user_id: userId,
                        user_email: formData.email,
                        user_role: 'store_owner',
                        user_full_name: formData.owner_name,
                        user_phone: formData.phone,
                        user_address: formData.address,
                    });

                    if (!error) {
                        profileError = null;
                        break;
                    }
                    profileError = error;
                    console.log(`Profile upsert attempt ${i + 1} failed:`, error);
                }

                if (profileError) {
                    console.error("Profile creation error:", profileError);
                    // Check if profile exists (maybe created by trigger)
                    const { data: existingProfile } = await supabase
                        .from("profiles")
                        .select("id")
                        .eq("id", userId)
                        .single();

                    if (!existingProfile) {
                        throw new Error("فشل في إنشاء ملف المستخدم: " + profileError.message);
                    }
                }

                // 3. Create Store
                const { error: storeError } = await supabase
                    .from("stores")
                    .insert({
                        owner_id: userId,
                        name: formData.store_name,
                        description: formData.description,
                        image_url: formData.image_url,
                        is_active: true,
                        category_id: formData.category_id || null,
                        whatsapp: formData.whatsapp || null,
                        facebook: formData.facebook || null,
                        instagram: formData.instagram || null,
                        tiktok: formData.tiktok || null,
                    });

                if (storeError) throw storeError;

                toast.success("تم إضافة المحل وصاحبه بنجاح");
            }

            setOpen(false);
            setEditingStore(null);
            setFormData({
                store_name: "",
                owner_name: "",
                email: "",
                phone: "",
                address: "",
                image_url: "",
                description: "",
                category_id: "",
                whatsapp: "",
                facebook: "",
                instagram: "",
                tiktok: "",
            });
            fetchStores();

        } catch (error: any) {
            console.error("Error saving store:", error);
            toast.error("حدث خطأ أثناء الحفظ: " + error.message);
        } finally {
            setLoading(false);
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
                        setFormData({
                            store_name: "",
                            owner_name: "",
                            email: "",
                            phone: "",
                            address: "",
                            image_url: "",
                            description: "",
                            category_id: "",
                            whatsapp: "",
                            facebook: "",
                            instagram: "",
                            tiktok: "",
                        });
                    }
                }}>
                    {isAdmin && (
                        <DialogTrigger asChild>
                            <Button>
                                <Plus className="ml-2 h-4 w-4" />
                                إضافة محل
                            </Button>
                        </DialogTrigger>
                    )}
                    <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                        <DialogHeader>
                            <DialogTitle>{editingStore ? "تعديل محل" : "إضافة محل جديد"}</DialogTitle>
                            <DialogDescription>
                                أدخل تفاصيل المحل وصاحبه
                            </DialogDescription>
                        </DialogHeader>
                        <div className="grid gap-4 py-4">
                            {/* Store Image Upload */}
                            <div className="flex flex-col items-center gap-4">
                                <div className="relative w-32 h-32 border-2 border-dashed rounded-lg flex items-center justify-center overflow-hidden bg-muted">
                                    {formData.image_url ? (
                                        <img src={formData.image_url} alt="Store" className="w-full h-full object-cover" />
                                    ) : (
                                        <div className="text-center text-muted-foreground p-2">
                                            <Upload className="mx-auto h-8 w-8 mb-1" />
                                            <span className="text-xs">صورة المحل</span>
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
                                <Label htmlFor="store-name">اسم المحل</Label>
                                <Input
                                    id="store-name"
                                    value={formData.store_name}
                                    onChange={(e) => setFormData({ ...formData, store_name: e.target.value })}
                                    placeholder="أدخل اسم المحل"
                                />
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="description">وصف المحل</Label>
                                <Input
                                    id="description"
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    placeholder="وصف مختصر للمحل"
                                />
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="owner-name">اسم صاحب المحل</Label>
                                <Input
                                    id="owner-name"
                                    value={formData.owner_name}
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
                                        value={formData.email}
                                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                        placeholder="email@example.com"
                                        dir="ltr"
                                        disabled={!!editingStore} // Disable email edit as it's auth related
                                    />
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="phone">رقم الهاتف</Label>
                                    <Input
                                        id="phone"
                                        value={formData.phone}
                                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                        placeholder="0555123456"
                                        dir="ltr"
                                    />
                                </div>
                            </div>
                            {!editingStore && (
                                <div className="grid gap-2">
                                    <Label htmlFor="password">كلمة المرور</Label>
                                    <Input
                                        id="password"
                                        type="password"
                                        dir="ltr"
                                        placeholder="******"
                                        value={formData.password || ""}
                                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                    />
                                </div>
                            )}
                            <div className="grid gap-2">
                                <Label htmlFor="address">العنوان</Label>
                                <Input
                                    id="address"
                                    value={formData.address}
                                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                                    placeholder="العنوان الكامل"
                                />
                            </div>

                            <div className="grid gap-2">
                                <Label>فئة المحل</Label>
                                <UISelect
                                    value={formData.category_id}
                                    onValueChange={(val) => setFormData({ ...formData, category_id: val })}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="اختر فئة المحل" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {categories.map((cat) => (
                                            <SelectItem key={cat.id} value={String(cat.id)}>{cat.name}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </UISelect>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="grid gap-2">
                                    <Label htmlFor="whatsapp">WhatsApp</Label>
                                    <Input
                                        id="whatsapp"
                                        value={formData.whatsapp}
                                        onChange={(e) => setFormData({ ...formData, whatsapp: e.target.value })}
                                        placeholder="رقم أو رابط"
                                        dir="ltr"
                                    />
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="facebook">Facebook</Label>
                                    <Input
                                        id="facebook"
                                        value={formData.facebook}
                                        onChange={(e) => setFormData({ ...formData, facebook: e.target.value })}
                                        placeholder="رابط فيسبوك"
                                        dir="ltr"
                                    />
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="instagram">Instagram</Label>
                                    <Input
                                        id="instagram"
                                        value={formData.instagram}
                                        onChange={(e) => setFormData({ ...formData, instagram: e.target.value })}
                                        placeholder="رابط انستغرام"
                                        dir="ltr"
                                    />
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="tiktok">TikTok</Label>
                                    <Input
                                        id="tiktok"
                                        value={formData.tiktok}
                                        onChange={(e) => setFormData({ ...formData, tiktok: e.target.value })}
                                        placeholder="رابط تيك توك"
                                        dir="ltr"
                                    />
                                </div>
                            </div>
                        </div>
                        <DialogFooter>
                            <Button onClick={handleSave} disabled={loading || uploading}>
                                {loading ? <Loader2 className="h-4 w-4 animate-spin ml-2" /> : null}
                                {editingStore ? "تحديث" : "حفظ"}
                            </Button>
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
                                <TableHead>التصنيفات</TableHead>
                                <TableHead>صاحب المحل</TableHead>
                                <TableHead>البريد الإلكتروني</TableHead>
                                <TableHead>الهاتف</TableHead>
                                <TableHead>الحالة</TableHead>
                                <TableHead>الاشتراك</TableHead>
                                <TableHead>الإجراءات</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {loading && stores.length === 0 ? (
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
                                            {store.image_url ? (
                                                <img src={store.image_url} alt={store.name} className="w-12 h-12 object-cover rounded" />
                                            ) : (
                                                <div className="w-12 h-12 bg-muted rounded flex items-center justify-center text-xs">لا صورة</div>
                                            )}
                                        </TableCell>
                                        <TableCell className="font-medium">{store.name}</TableCell>
                                        <TableCell>
                                            <div className="flex flex-wrap gap-1">
                                                {store.categories?.slice(0, 3).map((cat: any) => (
                                                    <span key={cat.id} className="text-[10px] bg-secondary/20 text-secondary-foreground px-1 py-0.5 rounded">
                                                        {cat.name}
                                                    </span>
                                                ))}
                                                {store.store_categories?.name && !store.categories?.length && (
                                                    <span className="text-[10px] bg-secondary/20 text-secondary-foreground px-1 py-0.5 rounded">
                                                        {store.store_categories.name}
                                                    </span>
                                                )}
                                            </div>
                                        </TableCell>
                                        <TableCell>{store.profiles?.full_name || "غير محدد"}</TableCell>
                                        <TableCell dir="ltr" className="text-right">{store.profiles?.email}</TableCell>
                                        <TableCell dir="ltr" className="text-right">{store.profiles?.phone || "-"}</TableCell>
                                        <TableCell>
                                            {(() => {
                                                const isExpired = store.subscription_end_date && new Date(store.subscription_end_date) < new Date();
                                                const isActive = store.is_active && !isExpired;
                                                return (
                                                    <span className={`px-2 py-1 rounded-full text-xs font-bold ${isActive ? "bg-green-100 text-green-700" :
                                                        isExpired ? "bg-orange-100 text-orange-700" :
                                                            "bg-red-100 text-red-700"
                                                        }`}>
                                                        {isActive ? "نشط" : isExpired ? "منتهي" : "متوقف"}
                                                    </span>
                                                );
                                            })()}
                                        </TableCell>
                                        <TableCell>
                                            {store.subscription_end_date ? (
                                                <div className="text-xs">
                                                    ينتهي في: <br />
                                                    <span dir="ltr">{new Date(store.subscription_end_date).toLocaleDateString('en-GB')}</span>
                                                </div>
                                            ) : (
                                                <span className="text-xs text-muted-foreground">-</span>
                                            )}
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex gap-2">
                                                <Button
                                                    variant="outline"
                                                    size="icon"
                                                    className="text-green-600 hover:bg-green-50 border-green-200"
                                                    title="تفعيل الاشتراك (30 يوم)"
                                                    onClick={async () => {
                                                        const endDate = new Date();
                                                        endDate.setDate(endDate.getDate() + 30);
                                                        const { error } = await supabase
                                                            .from('stores')
                                                            .update({
                                                                is_active: true,
                                                                subscription_end_date: endDate.toISOString()
                                                            })
                                                            .eq('id', store.id);

                                                        if (error) toast.error("فشل التحديث");
                                                        else {
                                                            toast.success("تم تفعيل الاشتراك (3000 دج)");
                                                            fetchStores();
                                                        }
                                                    }}
                                                >
                                                    <Upload className="h-4 w-4 rotate-180" /> {/* Simulate 'Update/Upgrade' icon */}
                                                </Button>

                                                <Button
                                                    variant="outline"
                                                    size="icon"
                                                    className="text-orange-600 hover:bg-orange-50 border-orange-200"
                                                    title="إيقاف الاشتراك"
                                                    onClick={async () => {
                                                        const { error } = await supabase
                                                            .from('stores')
                                                            .update({ is_active: false })
                                                            .eq('id', store.id);

                                                        if (error) toast.error("فشل التحديث");
                                                        else {
                                                            toast.success("تم إيقاف الاشتراك");
                                                            fetchStores();
                                                        }
                                                    }}
                                                >
                                                    <ToggleRight className="h-4 w-4" />
                                                </Button>

                                                <Button variant="ghost" size="icon" onClick={() => handleEdit(store)}>
                                                    <Pencil className="h-4 w-4" />
                                                </Button>
                                                <Button variant="ghost" size="icon" onClick={() => setDeleteId(store.id)}>
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
                title="حذف المحل"
                description="هل أنت متأكد من أنك تريد حذف هذا المحل؟ لا يمكن التراجع عن هذا الإجراء."
                variant="destructive"
            />
        </div >
    );
}
