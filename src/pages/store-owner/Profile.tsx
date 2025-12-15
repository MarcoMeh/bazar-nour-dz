import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { Loader2, User, Store, Upload, Save, MapPin, Phone, Lock } from "lucide-react";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { MultiSelect } from "@/components/MultiSelect";

export default function StoreOwnerProfile() {
    const { user } = useAuth();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [updatingPassword, setUpdatingPassword] = useState(false);

    // Password Update State
    const [passwordData, setPasswordData] = useState({
        newPassword: "",
        confirmPassword: ""
    });

    // Profile Data
    const [profileData, setProfileData] = useState({
        full_name: "",
        phone: "",
        address: "",
    });

    // Store Data
    const [storeData, setStoreData] = useState({
        id: "",
        name: "",
        description: "",
        image_url: "",
        category_ids: [] as string[],
        whatsapp: "",
        facebook: "",
        instagram: "",
        tiktok: "",
        opening_hours: "",
        location_url: "",
        return_policy: "",
        cover_image_url: "",
        subscription_end_date: "",
    });

    const [categories, setCategories] = useState<any[]>([]);

    useEffect(() => {
        if (user) {
            fetchData();
        }
    }, [user]);

    const fetchData = async () => {
        try {
            setLoading(true);

            // 1. Fetch Profile
            const { data: profile, error: profileError } = await supabase
                .from("profiles")
                .select("*")
                .eq("id", user?.id)
                .single();

            if (profileError) throw profileError;

            if (profile) {
                setProfileData({
                    full_name: profile.full_name || "",
                    phone: profile.phone || "",
                    address: profile.address || "",
                });
            }

            // 2. Fetch Store
            const { data: store, error: storeError } = await supabase
                .from("stores")
                .select(`
                    *,
                    store_category_relations(category_id)
                `)
                .eq("owner_id", user?.id)
                .single();

            if (storeError && storeError.code !== 'PGRST116') { // Ignore if no store found (though unlikely for store owner)
                console.error("Error fetching store:", storeError);
            }

            if (store) {
                const storeData = store as any;
                setStoreData({
                    id: store.id,
                    name: store.name,
                    description: store.description || "",
                    image_url: store.image_url || "",
                    category_ids: store.store_category_relations?.map((r: any) => r.category_id) || [],
                    whatsapp: storeData.whatsapp || "",
                    facebook: storeData.facebook || "",
                    instagram: storeData.instagram || "",
                    tiktok: storeData.tiktok || "",
                    opening_hours: storeData.opening_hours || "",
                    location_url: storeData.location_url || "",
                    return_policy: storeData.return_policy || "",
                    cover_image_url: storeData.cover_image_url || "",
                    subscription_end_date: storeData.subscription_end_date || "",
                });
            }


            // 3. Fetch Categories
            const { data: cats } = await supabase
                .from("categories")
                .select("*")
                .order("name");

            setCategories(cats || []);

        } catch (error) {
            console.error("Error fetching data:", error);
            toast.error("حدث خطأ في تحميل البيانات");
        } finally {
            setLoading(false);
        }
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

            setStoreData(prev => ({ ...prev, image_url: data.publicUrl }));
            toast.success("تم رفع الصورة بنجاح");
        } catch (error: any) {
            toast.error("فشل في رفع الصورة: " + error.message);
        } finally {
            setUploading(false);
        }
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);

        try {
            // 1. Update Profile
            const { error: profileError } = await supabase
                .from("profiles")
                .update({
                    full_name: profileData.full_name,
                    phone: profileData.phone,
                    address: profileData.address,
                })
                .eq("id", user?.id);

            if (profileError) throw profileError;

            // 2. Update Store
            if (storeData.id) {
                const { error: storeError } = await supabase
                    .from("stores")
                    .update({
                        name: storeData.name,
                        description: storeData.description,
                        image_url: storeData.image_url,
                        whatsapp: storeData.whatsapp || null,
                        facebook: storeData.facebook || null,
                        instagram: storeData.instagram || null,
                        tiktok: storeData.tiktok || null,
                        opening_hours: storeData.opening_hours || null,
                        location_url: storeData.location_url || null,
                        return_policy: storeData.return_policy || null,
                    })
                    .eq("id", storeData.id);

                if (storeError) throw storeError;

                // Update Categories
                await supabase.from("store_category_relations").delete().eq("store_id", storeData.id);
                if (storeData.category_ids.length > 0) {
                    const { error: catError } = await supabase.from("store_category_relations").insert(
                        storeData.category_ids.map(catId => ({
                            store_id: storeData.id,
                            category_id: catId
                        }))
                    );
                    if (catError) throw catError;
                }
            }

            toast.success("تم حفظ التغييرات بنجاح");
        } catch (error) {
            console.error("Error saving changes:", error);
            toast.error("حدث خطأ في حفظ التغييرات");
        } finally {
            setSaving(false);
        }
    };

    const handlePasswordUpdate = async (e: React.FormEvent) => {
        e.preventDefault();

        if (passwordData.newPassword !== passwordData.confirmPassword) {
            toast.error("كلمات المرور غير متطابقة");
            return;
        }

        if (passwordData.newPassword.length < 6) {
            toast.error("كلمة المرور يجب أن تكون 6 أحرف على الأقل");
            return;
        }

        setUpdatingPassword(true);
        try {
            const { error } = await supabase.auth.updateUser({
                password: passwordData.newPassword
            });

            if (error) throw error;

            toast.success("تم تحديث كلمة المرور بنجاح");
            setPasswordData({ newPassword: "", confirmPassword: "" });
        } catch (error: any) {
            console.error("Error updating password:", error);
            toast.error("فشل في تحديث كلمة المرور: " + error.message);
        } finally {
            setUpdatingPassword(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <div className="p-4 md:p-8 space-y-4 md:space-y-6">
            <div>
                <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-primary flex items-center gap-2">
                    <Store className="h-6 w-6 md:h-8 md:w-8" />
                    إعدادات المتجر والملف الشخصي
                </h1>
            </div>

            <form onSubmit={handleSave} className="space-y-8">
                {/* Store Settings */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Store className="h-5 w-5" />
                            معلومات المتجر
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        {/* Image Upload */}
                        <div className="flex flex-col items-center gap-4">
                            <div className="relative w-32 h-32 border-2 border-dashed rounded-lg flex items-center justify-center overflow-hidden bg-muted">
                                {storeData.image_url ? (
                                    <img src={storeData.image_url} alt="Store" className="w-full h-full object-cover" />
                                ) : (
                                    <div className="text-center text-muted-foreground p-2">
                                        <Upload className="mx-auto h-8 w-8 mb-1" />
                                        <span className="text-xs">شعار المتجر</span>
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
                                    id="store-image"
                                    type="file"
                                    accept="image/*"
                                    className="hidden"
                                    onChange={handleImageUpload}
                                />
                                <Label
                                    htmlFor="store-image"
                                    className="cursor-pointer bg-secondary text-secondary-foreground hover:bg-secondary/90 h-9 px-4 py-2 rounded-md text-sm font-medium flex items-center"
                                >
                                    <Upload className="w-4 h-4 ml-2" />
                                    تغيير الشعار
                                </Label>
                            </div>
                        </div>

                        <div className="grid gap-4 md:grid-cols-2">
                            <div className="space-y-2">
                                <Label htmlFor="storeName">اسم المتجر</Label>
                                <Input
                                    id="storeName"
                                    value={storeData.name}
                                    onChange={(e) => setStoreData({ ...storeData, name: e.target.value })}
                                    placeholder="اسم المتجر"
                                />
                            </div>

                            <div className="space-y-2">
                                <Label>فئة المتجر</Label>
                                <MultiSelect
                                    options={categories.map(c => ({ label: c.name, value: c.id }))}
                                    selected={storeData.category_ids}
                                    onChange={(vals) => setStoreData({ ...storeData, category_ids: vals })}
                                    placeholder="اختر فئات المتجر"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="description">وصف المتجر</Label>
                            <Input
                                id="description"
                                value={storeData.description}
                                onChange={(e) => setStoreData({ ...storeData, description: e.target.value })}
                                placeholder="وصف مختصر للمتجر وما يقدمه"
                            />
                        </div>
                    </CardContent>
                </Card>

                {/* Social Media Links */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Store className="h-5 w-5" />
                            روابط التواصل الاجتماعي
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid gap-4 md:grid-cols-2">
                            <div className="space-y-2">
                                <Label htmlFor="whatsapp">WhatsApp</Label>
                                <Input
                                    id="whatsapp"
                                    value={storeData.whatsapp}
                                    onChange={(e) => setStoreData({ ...storeData, whatsapp: e.target.value })}
                                    placeholder="رقم الواتساب أو الرابط"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="facebook">Facebook</Label>
                                <Input
                                    id="facebook"
                                    value={storeData.facebook}
                                    onChange={(e) => setStoreData({ ...storeData, facebook: e.target.value })}
                                    placeholder="رابط صفحة الفيسبوك"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="instagram">Instagram</Label>
                                <Input
                                    id="instagram"
                                    value={storeData.instagram}
                                    onChange={(e) => setStoreData({ ...storeData, instagram: e.target.value })}
                                    placeholder="رابط حساب انستغرام"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="tiktok">TikTok</Label>
                                <Input
                                    id="tiktok"
                                    value={storeData.tiktok}
                                    onChange={(e) => setStoreData({ ...storeData, tiktok: e.target.value })}
                                    placeholder="رابط حساب تيك توك"
                                />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Personal Info */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <User className="h-5 w-5" />
                            المعلومات الشخصية
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="fullName">الاسم الكامل</Label>
                            <div className="relative">
                                <User className="absolute right-3 top-3 h-4 w-4 text-muted-foreground" />
                                <Input
                                    id="fullName"
                                    value={profileData.full_name}
                                    onChange={(e) => setProfileData({ ...profileData, full_name: e.target.value })}
                                    className="pr-9"
                                    placeholder="الاسم الكامل"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="phone">رقم الهاتف</Label>
                            <div className="relative">
                                <Phone className="absolute right-3 top-3 h-4 w-4 text-muted-foreground" />
                                <Input
                                    id="phone"
                                    value={profileData.phone}
                                    onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })}
                                    className="pr-9"
                                    placeholder="رقم الهاتف"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="address">العنوان</Label>
                            <div className="relative">
                                <MapPin className="absolute right-3 top-3 h-4 w-4 text-muted-foreground" />
                                <Input
                                    id="address"
                                    value={profileData.address}
                                    onChange={(e) => setProfileData({ ...profileData, address: e.target.value })}
                                    className="pr-9"
                                    placeholder="العنوان الكامل"
                                />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Change Password */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Lock className="h-5 w-5" />
                            تغيير كلمة المرور
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="newPassword">كلمة المرور الجديدة</Label>
                            <div className="relative">
                                <Lock className="absolute right-3 top-3 h-4 w-4 text-muted-foreground" />
                                <Input
                                    id="newPassword"
                                    type="password"
                                    value={passwordData.newPassword}
                                    onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                                    className="pr-9"
                                    placeholder="••••••••"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="confirmPassword">تأكيد كلمة المرور</Label>
                            <div className="relative">
                                <Lock className="absolute right-3 top-3 h-4 w-4 text-muted-foreground" />
                                <Input
                                    id="confirmPassword"
                                    type="password"
                                    value={passwordData.confirmPassword}
                                    onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                                    className="pr-9"
                                    placeholder="••••••••"
                                />
                            </div>
                        </div>

                        <div className="flex justify-end mt-4">
                            <Button
                                type="button"
                                onClick={handlePasswordUpdate}
                                disabled={updatingPassword || !passwordData.newPassword}
                                variant="outline"
                            >
                                {updatingPassword ? <Loader2 className="ml-2 h-4 w-4 animate-spin" /> : <Lock className="ml-2 h-4 w-4" />}
                                تحديث كلمة المرور
                            </Button>
                        </div>
                    </CardContent>
                </Card>

                <div className="flex justify-end">
                    <Button type="submit" size="lg" disabled={saving || uploading}>
                        {saving ? <Loader2 className="ml-2 h-4 w-4 animate-spin" /> : <Save className="ml-2 h-4 w-4" />}
                        حفظ التغييرات
                    </Button>
                </div>
            </form>
        </div >
    );
}
