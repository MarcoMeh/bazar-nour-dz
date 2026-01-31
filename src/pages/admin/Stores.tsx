import { useState, useEffect } from "react";
import { generateSlug } from "@/lib/utils";
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
import { Plus, Pencil, Trash2, Loader2, Upload, ToggleRight, Power, RefreshCw } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { createClient } from "@supabase/supabase-js";
import { useAdmin } from "@/contexts/AdminContext";
import { ConfirmDialog } from "@/components/ConfirmDialog";
import { MultiSelect } from "@/components/MultiSelect";

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
    slug?: string | null;
    description: string | null;
    image_url: string | null;
    is_active: boolean;
    created_at: string;
    // Joined profile data
    profiles?: Profile;
    subscription_end_date?: string;
    whatsapp?: string | null;
    facebook?: string | null;
    instagram?: string | null;
    tiktok?: string | null;
    // Relations
    store_category_relations?: {
        store_categories?: {
            id: string;
            name: string;
        };
    }[];
    categories?: { id: string; name: string }[];
    is_manually_suspended?: boolean; // Added field
    cover_image_url?: string | null;
}

// Form data interface
interface StoreFormData {
    store_name: string;
    slug: string;
    owner_name: string;
    email: string;
    phone: string;
    address: string;
    password?: string;
    image_url: string;
    description: string;
    category_ids: string[];
    whatsapp: string;
    facebook: string;
    instagram: string;
    tiktok: string;
    cover_image_url: string;
}

export default function AdminStores() {
    const { isAdmin, isStoreOwner, storeId } = useAdmin();
    const [stores, setStores] = useState<Store[]>([]);
    const [loading, setLoading] = useState(true);
    const [open, setOpen] = useState(false);
    const [editingStore, setEditingStore] = useState<Store | null>(null);
    const [formData, setFormData] = useState<StoreFormData>({
        store_name: "",
        slug: "",
        owner_name: "",
        email: "",
        phone: "",
        address: "",
        image_url: "",
        description: "",
        category_ids: [],
        whatsapp: "",
        facebook: "",
        instagram: "",
        tiktok: "",
        cover_image_url: "",
    });
    const [categories, setCategories] = useState<any[]>([]);
    const [uploading, setUploading] = useState(false);
    const [deleteId, setDeleteId] = useState<string | null>(null);

    // Subscription Renewal State
    const [renewDialog, setRenewDialog] = useState<{ open: boolean; storeId: string | null }>({ open: false, storeId: null });
    const [renewData, setRenewData] = useState({ months: "custom", days: "30", amount: "3000", notes: "" });
    const [renewLoading, setRenewLoading] = useState(false);

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
                store_category_relations(
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
                categories: store.store_category_relations?.map((rel: any) => rel.categories).filter(Boolean) || [],
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

        const storeToDelete = stores.find(s => s.id === deleteId);
        if (!storeToDelete) {
            setDeleteId(null);
            return;
        }

        console.log("Starting manual database cleanup for store:", deleteId);

        try {
            setLoading(true);

            // 1. Cleanup dependencies manually to avoid FK blocks
            // First, get product IDs for this store to clean up their dependencies
            const { data: storeProducts } = await supabase
                .from('products')
                .select('id')
                .eq('store_id', deleteId);

            const productIds = storeProducts?.map(p => p.id) || [];

            if (productIds.length > 0) {
                // Delete order items linked to these products
                await supabase.from('order_items' as any).delete().in('product_id', productIds);
                // Delete reviews linked to these products
                await supabase.from('reviews' as any).delete().in('product_id', productIds);
                // Delete flash sale items
                await supabase.from('flash_sale_items' as any).delete().in('product_id', productIds);
                // Delete products
                await supabase.from('products').delete().eq('store_id', deleteId);
            }

            // Delete subscription logs
            await supabase.from('subscription_logs' as any).delete().eq('store_id', deleteId);
            // Delete delivery settings
            await supabase.from('store_delivery_settings' as any).delete().eq('store_id', deleteId);
            // Delete category relations
            await supabase.from('store_category_relations' as any).delete().eq('store_id', deleteId);
            // Delete notifications
            await supabase.from('notifications' as any).delete().eq('store_id', deleteId);

            // 1.5 Nullify store_id in orders to preserve history but allow store deletion
            await supabase.from('orders' as any).update({ store_id: null }).eq('store_id', deleteId);

            // 2. Finally delete the store record
            const { error: storeError } = await supabase
                .from('stores')
                .delete()
                .eq('id', deleteId);

            if (storeError) throw storeError;

            toast.success("تم حذف بيانات المحل والمنتجات بنجاح");
            fetchStores();
        } catch (err: any) {
            console.error("Critical error during manual delete:", err);
            toast.error(`فشل الحذف: ${err.message || "تأكد من حذف البيانات المرتبطة الأخرى أولاً"}`);
        } finally {
            setLoading(false);
            setDeleteId(null);
        }
    };

    const handleEdit = (store: Store) => {
        setEditingStore(store);
        setFormData({
            store_name: store.name || "",
            slug: store.slug || "",
            owner_name: store.profiles?.full_name || "",
            email: store.profiles?.email || "",
            phone: store.profiles?.phone || "",
            address: store.profiles?.address || "",
            image_url: store.image_url || "",
            cover_image_url: store.cover_image_url || "",
            description: store.description || "",
            category_ids: store.categories?.map(c => c.id) || [],
            whatsapp: store.whatsapp || "",
            facebook: store.facebook || "",
            instagram: store.instagram || "",
            tiktok: store.tiktok || "",
        });
        setOpen(true);
    };

    const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>, isCover = false) => {
        const file = event.target.files?.[0];
        if (!file) return;

        setUploading(true);
        try {
            const fileExt = file.name.split('.').pop();
            const fileName = `${Math.random()}.${fileExt}`;
            const bucket = isCover ? 'store-covers' : 'store-images';
            const { error: uploadError } = await supabase.storage
                .from(bucket)
                .upload(fileName, file);

            if (uploadError) throw uploadError;

            const { data } = supabase.storage
                .from(bucket)
                .getPublicUrl(fileName);

            if (isCover) {
                setFormData(prev => ({ ...prev, cover_image_url: data.publicUrl }));
            } else {
                setFormData(prev => ({ ...prev, image_url: data.publicUrl }));
            }

            toast.success("تم رفع الصورة بنجاح");
        } catch (error: any) {
            console.error(error);
            toast.error("فشل رفع الصورة");
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
                const updates: { [key: string]: any } = {};
                if (formData.store_name !== editingStore.name) updates.name = formData.store_name;
                if (formData.slug !== editingStore.slug) updates.slug = formData.slug || generateSlug(formData.store_name);
                if (formData.image_url !== editingStore.image_url) updates.image_url = formData.image_url;
                if (formData.cover_image_url !== editingStore.cover_image_url) updates.cover_image_url = formData.cover_image_url;
                if (formData.description !== editingStore.description) updates.description = formData.description;
                if (formData.whatsapp !== editingStore.whatsapp) updates.whatsapp = formData.whatsapp || null;
                if (formData.facebook !== editingStore.facebook) updates.facebook = formData.facebook || null;
                if (formData.instagram !== editingStore.instagram) updates.instagram = formData.instagram || null;
                if (formData.tiktok !== editingStore.tiktok) updates.tiktok = formData.tiktok || null;

                const { error: storeError } = await supabase
                    .from("stores")
                    .update(updates)
                    .eq("id", editingStore.id);

                if (storeError) throw storeError;

                // Update Categories
                // First delete existing
                await supabase.from("store_category_relations").delete().eq("store_id", editingStore.id);
                // Insert new
                if (formData.category_ids.length > 0) {
                    const { error: catError } = await supabase.from("store_category_relations").insert(
                        formData.category_ids.map(catId => ({
                            store_id: editingStore.id,
                            category_id: catId
                        }))
                    );
                    if (catError) throw catError;
                }

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
                const { data: newStore, error: storeError } = await supabase
                    .from("stores")
                    .insert({
                        owner_id: userId,
                        name: formData.store_name,
                        slug: formData.slug || generateSlug(formData.store_name),
                        description: formData.description,
                        image_url: formData.image_url,
                        is_active: true,
                        whatsapp: formData.whatsapp || null,
                        facebook: formData.facebook || null,
                        instagram: formData.instagram || null,
                        tiktok: formData.tiktok || null,
                    })
                    .select()
                    .single();

                if (storeError) throw storeError;

                // Insert Categories
                if (formData.category_ids.length > 0) {
                    const { error: catError } = await supabase.from("store_category_relations").insert(
                        formData.category_ids.map(catId => ({
                            store_id: newStore.id,
                            category_id: catId
                        }))
                    );
                    if (catError) throw catError;
                }

                if (storeError) throw storeError;

                toast.success("تم إضافة المحل وصاحبه بنجاح");
            }

            setOpen(false);
            setEditingStore(null);
            setFormData({
                store_name: "",
                slug: "",
                owner_name: "",
                email: "",
                phone: "",
                address: "",
                image_url: "",
                description: "",
                category_ids: [],
                whatsapp: "",
                facebook: "",
                instagram: "",
                tiktok: "",
                cover_image_url: "",
            });
            fetchStores();

        } catch (error: any) {
            console.error("Error saving store:", error);
            toast.error("حدث خطأ أثناء الحفظ: " + error.message);
        } finally {
            setLoading(false);
        }
    };

    const handleRenewSubscription = async () => {
        if (!renewDialog.storeId) return;
        setRenewLoading(true);

        const days = parseInt(renewData.days);
        const amount = parseFloat(renewData.amount);

        if (isNaN(days) || days <= 0 || isNaN(amount) || amount < 0) {
            toast.error("يرجى إدخال قيم صحيحة للأيام والمبلغ");
            setRenewLoading(false);
            return;
        }

        try {
            const { error } = await supabase.rpc('extend_store_subscription', {
                p_store_id: renewDialog.storeId,
                p_days: days,
                p_amount: amount,
                p_notes: renewData.notes || null
            });

            if (error) throw error;

            toast.success(`تم تجديد الاشتراك بنجاح (${days} يوم)`);
            setRenewDialog({ open: false, storeId: null });
            fetchStores();
        } catch (error: any) {
            console.error("Renewal error:", error);
            toast.error("فشل تجديد الاشتراك: " + error.message);
        } finally {
            setRenewLoading(false);
        }
    };

    const handleToggleSuspension = async (store: Store) => {
        const newStatus = !store.is_manually_suspended;
        const confirmMsg = newStatus
            ? "هل أنت متأكد من تجميد هذا المحل؟ سيتم إخفاء منتجاته فوراً."
            : "هل أنت متأكد من إعادة تفعيل هذا المحل؟";

        if (!window.confirm(confirmMsg)) return;

        try {
            const { error } = await supabase
                .from('stores')
                .update({ is_manually_suspended: newStatus })
                .eq('id', store.id);

            if (error) throw error;
            toast.success(newStatus ? "تم تجميد المحل" : "تم إلغاء تجميد المحل");
            fetchStores();
        } catch (error: any) {
            toast.error("فشل تغيير حالة التجميد");
        }
    };

    const handleActivateStore = async (store: Store) => {
        try {
            const { error } = await supabase
                .from('stores')
                .update({ is_active: true })
                .eq('id', store.id);

            if (error) throw error;
            toast.success("تم تفعيل المحل بنجاح");
            fetchStores();
        } catch (error: any) {
            toast.error("فشل تفعيل المحل");
        }
    };

    const handleRegenerateSlugs = async () => {
        if (!confirm("هل تريد توليد روابط (Slugs) للمحلات التي لا تمتلك واحداً؟")) return;
        setLoading(true);
        try {
            // Fetch all stores
            const { data: allStores, error: fetchError } = await supabase.from("stores").select("id, name, slug");
            if (fetchError) throw fetchError;

            let updatedCount = 0;
            for (const store of allStores) {
                if (!store.slug || store.slug.trim() === "") {
                    const newSlug = generateSlug(store.name);
                    const { error: updateError } = await supabase
                        .from("stores")
                        .update({ slug: newSlug })
                        .eq("id", store.id);

                    if (!updateError) updatedCount++;
                }
            }
            toast.success(`تم تحديث روابط ${updatedCount} محل.`);
            fetchStores();
        } catch (error: any) {
            console.error(error);
            toast.error("حدث خطأ أثناء تحديث الروابط");
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
                            slug: "",
                            owner_name: "",
                            email: "",
                            phone: "",
                            address: "",
                            image_url: "",
                            description: "",
                            category_ids: [],
                            whatsapp: "",
                            facebook: "",
                            instagram: "",
                            tiktok: "",
                            cover_image_url: "",
                        });
                    }
                }}>
                    {isAdmin && (
                        <div className="flex gap-2">
                            <Button onClick={handleRegenerateSlugs} variant="outline" title="تحديث الروابط المفقودة">
                                <RefreshCw className="mr-2 h-4 w-4" />
                                إصلاح الروابط
                            </Button>
                            <DialogTrigger asChild>
                                <Button>
                                    <Plus className="ml-2 h-4 w-4" />
                                    إضافة محل
                                </Button>
                            </DialogTrigger>
                        </div>
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
                                <Label>صورة الغلاف (Banner)</Label>
                                <div className="flex flex-col items-center gap-4 border rounded-lg p-4 bg-muted/50">
                                    {formData.cover_image_url && (
                                        <div className="w-full h-32 relative rounded-md overflow-hidden bg-background">
                                            <img
                                                src={formData.cover_image_url}
                                                alt="Store Cover"
                                                className="w-full h-full object-cover"
                                            />
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="absolute top-2 right-2 bg-background/50 hover:bg-background/80"
                                                onClick={() => setFormData({ ...formData, cover_image_url: "" })}
                                            >
                                                <Trash2 className="w-4 h-4 text-destructive" />
                                            </Button>
                                        </div>
                                    )}
                                    <div className="flex items-center gap-2">
                                        <Input
                                            id="cover-upload"
                                            type="file"
                                            accept="image/*"
                                            className="hidden"
                                            onChange={(e) => handleImageUpload(e, true)}
                                        />
                                        <Label
                                            htmlFor="cover-upload"
                                            className="cursor-pointer bg-secondary text-secondary-foreground hover:bg-secondary/90 h-9 px-4 py-2 rounded-md text-sm font-medium flex items-center"
                                        >
                                            <Upload className="w-4 h-4 ml-2" />
                                            {formData.cover_image_url ? "تغيير الغلاف" : "رفع غلاف"}
                                        </Label>
                                    </div>
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
                                <Label htmlFor="slug">رابط المحل (Slug)</Label>
                                <Input
                                    id="slug"
                                    value={formData.slug}
                                    onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                                    placeholder="your-store-name"
                                    dir="ltr"
                                />
                                <p className="text-xs text-muted-foreground">اتركه فارغاً ليتم توليده تلقائياً من اسم المحل.</p>
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
                                <Label>فئات المحل</Label>
                                <MultiSelect
                                    options={categories.map(c => ({ label: c.name, value: c.id }))}
                                    selected={formData.category_ids}
                                    onChange={(vals) => setFormData({ ...formData, category_ids: vals })}
                                    placeholder="اختر فئات المحل"
                                />
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

                {/* Renewal Dialog */}
                <Dialog open={renewDialog.open} onOpenChange={(val) => !val && setRenewDialog({ open: false, storeId: null })}>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>تجديد اشتراك المحل</DialogTitle>
                            <DialogDescription>أدخل تفاصيل التجديد (عدد الأيام والمبلغ) يدوياً.</DialogDescription>
                        </DialogHeader>
                        <div className="grid gap-4 py-4">
                            <div className="grid gap-2">
                                <Label>عدد الأيام</Label>
                                <div className="flex gap-2">
                                    <Button
                                        type="button"
                                        variant={renewData.days === "30" ? "default" : "outline"}
                                        size="sm"
                                        onClick={() => setRenewData({ ...renewData, days: "30", amount: "3000" })}
                                    >
                                        شهر (30)
                                    </Button>
                                    <Button
                                        type="button"
                                        variant={renewData.days === "90" ? "default" : "outline"}
                                        size="sm"
                                        onClick={() => setRenewData({ ...renewData, days: "90", amount: "8000" })}
                                    >
                                        3 أشهر (90)
                                    </Button>
                                    <Button
                                        type="button"
                                        variant={renewData.days === "365" ? "default" : "outline"}
                                        size="sm"
                                        onClick={() => setRenewData({ ...renewData, days: "365", amount: "30000" })}
                                    >
                                        سنة (365)
                                    </Button>
                                </div>
                                <Input
                                    type="number"
                                    value={renewData.days}
                                    onChange={(e) => setRenewData({ ...renewData, days: e.target.value })}
                                    placeholder="إدخال يدوي لعدد الأيام"
                                />
                            </div>

                            <div className="grid gap-2">
                                <Label>المبلغ المستلم (دج)</Label>
                                <Input
                                    type="number"
                                    value={renewData.amount}
                                    onChange={(e) => setRenewData({ ...renewData, amount: e.target.value })}
                                />
                            </div>

                            <div className="grid gap-2">
                                <Label>ملاحظات (اختياري)</Label>
                                <Input
                                    value={renewData.notes}
                                    onChange={(e) => setRenewData({ ...renewData, notes: e.target.value })}
                                    placeholder="رقم الوصل، ملاحظة إدارية..."
                                />
                            </div>
                        </div>
                        <DialogFooter>
                            <Button onClick={handleRenewSubscription} disabled={renewLoading}>
                                {renewLoading && <Loader2 className="ml-2 h-4 w-4 animate-spin" />}
                                تأكيد التجديد
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
                                                {store.categories?.map((cat: any) => (
                                                    <span key={cat.id} className="text-[10px] bg-secondary/20 text-secondary-foreground px-1 py-0.5 rounded">
                                                        {cat.name}
                                                    </span>
                                                ))}
                                            </div>
                                        </TableCell>
                                        <TableCell>{store.profiles?.full_name || "غير محدد"}</TableCell>
                                        <TableCell dir="ltr" className="text-right">{store.profiles?.email}</TableCell>
                                        <TableCell dir="ltr" className="text-right">{store.profiles?.phone || "-"}</TableCell>
                                        <TableCell>
                                            {(() => {
                                                const isSuspended = store.is_manually_suspended;
                                                const isExpired = store.subscription_end_date && new Date(store.subscription_end_date) < new Date();

                                                if (!store.is_active) {
                                                    return <span className="px-2 py-1 rounded-full text-xs font-bold bg-gray-100 text-gray-500 border border-gray-200">غير مفعل</span>;
                                                }
                                                if (isSuspended) {
                                                    return <span className="px-2 py-1 rounded-full text-xs font-bold bg-red-100 text-red-700">مجمد</span>;
                                                }
                                                if (isExpired) {
                                                    return <span className="px-2 py-1 rounded-full text-xs font-bold bg-orange-100 text-orange-700">منتهي</span>;
                                                }
                                                return <span className="px-2 py-1 rounded-full text-xs font-bold bg-green-100 text-green-700">نشط</span>;
                                            })()}
                                        </TableCell>
                                        <TableCell>
                                            {store.subscription_end_date ? (
                                                <div className="text-xs">
                                                    ينتهي في: <br />
                                                    <span dir="ltr">{new Date(store.subscription_end_date).toLocaleDateString('en-GB')}</span>
                                                </div>
                                            ) : (
                                                <span className="text-xs text-muted-foreground">غير محدد</span>
                                            )}
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex gap-2">
                                                {!store.is_active && (
                                                    <Button
                                                        variant="outline"
                                                        size="icon"
                                                        className="text-blue-600 hover:bg-blue-50 border-blue-200"
                                                        title="تفعيل المحل"
                                                        onClick={() => handleActivateStore(store)}
                                                    >
                                                        <Power className="h-4 w-4" />
                                                    </Button>
                                                )}
                                                <Button
                                                    variant="outline"
                                                    size="icon"
                                                    className="text-green-600 hover:bg-green-50 border-green-200"
                                                    title="تجديد الاشتراك"
                                                    onClick={() => {
                                                        setRenewData({ months: "custom", days: "30", amount: "3000", notes: "" });
                                                        setRenewDialog({ open: true, storeId: store.id });
                                                    }}
                                                >
                                                    <Upload className="h-4 w-4 rotate-180" />
                                                </Button>

                                                <Button
                                                    variant="outline"
                                                    size="icon"
                                                    className={`${store.is_manually_suspended ? "text-green-600 bg-red-50" : "text-red-600 hover:bg-red-50"} border-red-200`}
                                                    title={store.is_manually_suspended ? "إلغاء التجميد" : "تجميد المحل"}
                                                    onClick={() => handleToggleSuspension(store)}
                                                >
                                                    <ToggleRight className={`h-4 w-4 ${store.is_manually_suspended ? "rotate-180" : ""}`} />
                                                </Button>

                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="text-red-500 hover:text-red-700 hover:bg-red-50"
                                                    onClick={() => setDeleteId(store.id)}
                                                    title="حذف المحل"
                                                >
                                                    <Trash2 className="h-4 w-4" />
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
        </div>
    );
}
