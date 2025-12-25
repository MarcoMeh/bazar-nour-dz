import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import {
    Loader2, User, Store, Upload, Save, MapPin, Phone, Lock, ImageIcon, Star, Check, Palette, Eye,
    Plus, Trash2, Facebook, Instagram, Hash, ExternalLink, Clock, FileText, CheckCircle2,
    LayoutDashboard, Package, ShoppingCart, Settings
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { MultiSelect } from "@/components/MultiSelect";
import { STORE_THEMES } from "@/config/themes";

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
        theme_id: "default",
        primary_color: "",
        secondary_color: "",
        background_color: "",
        text_color: "",
        phone_numbers: [] as string[],
    });

    const [categories, setCategories] = useState<any[]>([]);

    useEffect(() => {
        if (user) {
            fetchData();
        }
    }, [user]);

    const handleAddPhone = () => {
        setStoreData({
            ...storeData,
            phone_numbers: [...storeData.phone_numbers, ""]
        });
    };

    const handlePhoneChange = (index: number, value: string) => {
        const newPhones = [...storeData.phone_numbers];
        newPhones[index] = value;
        setStoreData({ ...storeData, phone_numbers: newPhones });
    };

    const handleRemovePhone = (index: number) => {
        const newPhones = storeData.phone_numbers.filter((_, i) => i !== index);
        setStoreData({ ...storeData, phone_numbers: newPhones });
    };

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
                    theme_id: storeData.theme_id || "default",
                    primary_color: storeData.primary_color || "",
                    secondary_color: storeData.secondary_color || "",
                    background_color: storeData.background_color || "",
                    text_color: storeData.text_color || "",
                    phone_numbers: storeData.phone_numbers || [],
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

    const handleCoverImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
        try {
            if (!event.target.files || event.target.files.length === 0) {
                return;
            }
            setUploading(true);
            const file = event.target.files[0];
            const fileExt = file.name.split('.').pop();
            const fileName = `cover_${Math.random()}.${fileExt}`;
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

            setStoreData(prev => ({ ...prev, cover_image_url: data.publicUrl }));
            toast.success("تم رفع الغلاف بنجاح");
        } catch (error: any) {
            toast.error("فشل في رفع الغلاف: " + error.message);
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
                        cover_image_url: storeData.cover_image_url,
                        whatsapp: storeData.whatsapp || null,
                        facebook: storeData.facebook || null,
                        instagram: storeData.instagram || null,
                        tiktok: storeData.tiktok || null,
                        opening_hours: storeData.opening_hours || null,
                        location_url: storeData.location_url || null,
                        return_policy: storeData.return_policy || null,
                        theme_id: storeData.theme_id,
                        primary_color: storeData.primary_color || null,
                        secondary_color: storeData.secondary_color || null,
                        background_color: storeData.background_color || null,
                        text_color: storeData.text_color || null,
                        phone_numbers: storeData.phone_numbers.filter(p => p.trim() !== ""),
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

    const activeTheme = STORE_THEMES.find(t => t.id === storeData.theme_id) || STORE_THEMES[0];
    const previewColors = {
        primary: storeData.primary_color || activeTheme.colors.primary,
        secondary: storeData.secondary_color || activeTheme.colors.secondary,
        background: storeData.background_color || activeTheme.colors.background,
        text: storeData.text_color || activeTheme.colors.text
    };

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
                        {/* Cover Image Upload (New) */}
                        <div className="flex flex-col items-center gap-4 border-b pb-6">
                            <Label className="w-full text-right font-semibold">صورة الغلاف (خلفية المتجر)</Label>
                            <div className="relative w-full h-32 md:h-48 border-2 border-dashed rounded-lg flex items-center justify-center overflow-hidden bg-muted group">
                                {storeData.cover_image_url ? (
                                    <img src={storeData.cover_image_url} alt="Cover" className="w-full h-full object-cover" />
                                ) : (
                                    <div className="text-center text-muted-foreground p-2">
                                        <ImageIcon className="mx-auto h-8 w-8 mb-1" />
                                        <span className="text-xs">اضغط لرفع صورة الغلاف</span>
                                    </div>
                                )}
                                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                    <Label
                                        htmlFor="cover-image"
                                        className="cursor-pointer bg-white/20 hover:bg-white/30 text-white border border-white/50 h-9 px-4 py-2 rounded-md text-sm font-medium flex items-center backdrop-blur-sm"
                                    >
                                        <Upload className="w-4 h-4 ml-2" />
                                        تغيير الغلاف
                                    </Label>
                                </div>
                                {uploading && (
                                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center z-10">
                                        <Loader2 className="h-6 w-6 animate-spin text-white" />
                                    </div>
                                )}
                            </div>
                            <Input
                                id="cover-image"
                                type="file"
                                accept="image/*"
                                className="hidden"
                                onChange={handleCoverImageUpload}
                            />
                        </div>

                        {/* Logo Upload (Existing) */}
                        <div className="flex flex-col items-center gap-4">
                            <Label className="w-full text-right font-semibold">شعار المتجر (Logo)</Label>
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

                        <div className="space-y-2">
                            <Label>أرقام الهاتف الإضافية</Label>
                            <div className="space-y-3">
                                {storeData.phone_numbers.map((phone, index) => (
                                    <div key={index} className="flex gap-2 relative">
                                        <div className="relative flex-1">
                                            <Phone className="absolute right-3 top-3 h-4 w-4 text-muted-foreground" />
                                            <Input
                                                value={phone}
                                                onChange={(e) => handlePhoneChange(index, e.target.value)}
                                                className="pr-9"
                                                placeholder="0X XX XX XX XX"
                                                dir="ltr"
                                            />
                                        </div>
                                        <Button
                                            type="button"
                                            variant="destructive"
                                            size="icon"
                                            onClick={() => handleRemovePhone(index)}
                                            className="shrink-0"
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </div>
                                ))}
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={handleAddPhone}
                                    className="w-full border-dashed"
                                >
                                    <Plus className="mr-2 h-4 w-4" />
                                    إضافة رقم هاتف آخر
                                </Button>
                            </div>
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

                {/* Theme Selection Section - MOVED TO BOTTOM */}
                <Card className="border-2 border-primary/20 shadow-xl overflow-hidden mb-8">
                    <CardHeader className="bg-gradient-to-r from-primary/10 to-transparent border-b">
                        <CardTitle className="flex items-center gap-3 text-xl">
                            <Palette className="h-6 w-6 text-primary animate-pulse" />
                            تصميم وشخصية المتجر (القوالب)
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-8">
                        <div className="flex flex-col lg:flex-row gap-8">
                            {/* Live Miniature Preview */}
                            <div className="w-full lg:w-72 shrink-0">
                                <div className="sticky top-4">
                                    <h4 className="font-bold text-sm mb-4 flex items-center gap-2">
                                        <Eye className="w-4 h-4 text-primary" />
                                        معاينة مباشرة مصغرة
                                    </h4>
                                    <div
                                        className="aspect-[9/16] rounded-3xl border-8 border-gray-900 shadow-2xl overflow-hidden relative"
                                        style={{
                                            backgroundColor: previewColors.background
                                        }}
                                    >
                                        <div className="absolute top-0 inset-x-0 h-4 bg-gray-900 flex justify-center items-center">
                                            <div className="w-12 h-1 bg-gray-800 rounded-full"></div>
                                        </div>

                                        {/* Mini Store Content */}
                                        {(() => {
                                            const isElegant = activeTheme.styles.headerStyle === 'elegant';
                                            const isBold = activeTheme.styles.headerStyle === 'bold';

                                            return (
                                                <div className="p-3 h-full overflow-hidden" style={{ fontFamily: activeTheme.typography.fontFamily }}>
                                                    {/* Mini Header */}
                                                    <div className={`mt-4 mb-4 ${isElegant ? 'text-center' : ''}`}>
                                                        <div className={`w-10 h-10 mx-auto rounded-lg mb-2 shadow-sm`} style={{ backgroundColor: previewColors.primary }}></div>
                                                        <div className={`h-3 w-2/3 ${isElegant ? 'mx-auto' : ''} rounded-full mb-1`} style={{ backgroundColor: previewColors.text }}></div>
                                                        <div className={`h-2 w-1/3 ${isElegant ? 'mx-auto' : ''} rounded-full opacity-30`} style={{ backgroundColor: previewColors.text }}></div>
                                                    </div>

                                                    {/* Mini Grid */}
                                                    <div className={`grid gap-2 ${activeTheme.styles.layoutType === 'grid' ? 'grid-cols-2' : activeTheme.styles.layoutType === 'compact' ? 'grid-cols-3' : 'grid-cols-2'}`}>
                                                        {[1, 2, 3, 4].map(i => (
                                                            <div
                                                                key={i}
                                                                className="rounded-lg p-1 shadow-sm border border-gray-100/10"
                                                                style={{
                                                                    backgroundColor: 'rgba(255,255,255,0.1)',
                                                                    borderRadius: activeTheme.styles.borderRadius,
                                                                    height: activeTheme.styles.layoutType === 'masonry' && i % 2 === 0 ? '60px' : '50px'
                                                                }}
                                                            >
                                                                <div className="w-full h-2/3 bg-gray-100/50 rounded-md mb-1"></div>
                                                                <div className="w-full h-1 bg-gray-200 rounded-full"></div>
                                                            </div>
                                                        ))}
                                                    </div>

                                                    {/* Mini CTA */}
                                                    <div className="absolute bottom-6 inset-x-4">
                                                        <div className="h-8 w-full rounded-full shadow-lg flex items-center justify-center text-[8px] font-bold text-white overflow-hidden" style={{ backgroundColor: previewColors.primary }}>
                                                            SHOP NOW
                                                        </div>
                                                    </div>
                                                </div>
                                            );
                                        })()}
                                    </div>
                                </div>
                            </div>

                            {/* Selection Controls */}
                            <div className="flex-1 space-y-8 overflow-hidden">
                                {/* Step 1: Choose Layout (Shape) */}
                                <div className="space-y-4">
                                    <h4 className="font-black text-lg flex items-center gap-2">
                                        <div className="w-6 h-6 rounded-full bg-primary text-white text-xs flex items-center justify-center">1</div>
                                        اختر الهيكل (التوزيع)
                                    </h4>
                                    <div className="flex gap-4 overflow-x-auto pb-4 no-scrollbar scroll-smooth">
                                        {Array.from(new Set(STORE_THEMES.map(t => t.styles.layoutType))).map(layout => {
                                            const isSelected = STORE_THEMES.find(t => t.id === storeData.theme_id)?.styles.layoutType === layout;
                                            return (
                                                <div
                                                    key={layout}
                                                    onClick={() => {
                                                        const firstThemeOfLayout = STORE_THEMES.find(t => t.styles.layoutType === layout);
                                                        if (firstThemeOfLayout) setStoreData({ ...storeData, theme_id: firstThemeOfLayout.id });
                                                    }}
                                                    className={`
                                                        shrink-0 w-32 p-4 rounded-2xl border-2 transition-all cursor-pointer flex flex-col items-center gap-2
                                                        ${isSelected ? 'border-primary bg-primary/5 ring-4 ring-primary/10' : 'border-gray-100 hover:border-primary/30'}
                                                    `}
                                                >
                                                    <div className="grid grid-cols-2 gap-1 w-12 h-12 opacity-40">
                                                        {layout === 'grid' && [1, 2, 3, 4].map(i => <div key={i} className="bg-current rounded-[2px]" />)}
                                                        {layout === 'masonry' && [1, 2, 3, 4].map(i => <div key={i} className={`bg-current rounded-[2px] ${i % 2 === 0 ? 'h-full' : 'h-2/3'}`} />)}
                                                        {layout === 'compact' && [1, 2, 3, 4, 5, 6].map(i => <div key={i} className="bg-current rounded-[1px]" />)}
                                                        {layout === 'modern' && <div className="col-span-2 h-full bg-current rounded-md" />}
                                                    </div>
                                                    <span className="text-xs font-bold uppercase tracking-widest">{layout}</span>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>

                                {/* Step 2: Customize Colors */}
                                <div className="space-y-4">
                                    <div className="flex items-center justify-between">
                                        <h4 className="font-black text-lg flex items-center gap-2">
                                            <div className="w-6 h-6 rounded-full bg-primary text-white text-xs flex items-center justify-center">2</div>
                                            تخصيص الألوان
                                        </h4>
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => setStoreData({
                                                ...storeData,
                                                primary_color: "",
                                                secondary_color: "",
                                                background_color: "",
                                                text_color: ""
                                            })}
                                            className="text-xs text-muted-foreground hover:text-destructive"
                                        >
                                            إعادة تعيين للأصل
                                        </Button>
                                    </div>

                                    <div className="grid gap-6 md:grid-cols-2">
                                        <div className="space-y-2">
                                            <Label className="text-xs font-bold text-muted-foreground uppercase">اللون الرئيسي (الأزرار والعناوين)</Label>
                                            <div className="flex gap-2">
                                                <div className="h-10 w-10 rounded-lg shadow-sm border overflow-hidden shrink-0">
                                                    <input
                                                        type="color"
                                                        value={storeData.primary_color || activeTheme.colors.primary}
                                                        onChange={(e) => setStoreData({ ...storeData, primary_color: e.target.value })}
                                                        className="w-[150%] h-[150%] -translate-x-[25%] -translate-y-[25%] cursor-pointer"
                                                    />
                                                </div>
                                                <Input
                                                    value={storeData.primary_color || activeTheme.colors.primary}
                                                    onChange={(e) => setStoreData({ ...storeData, primary_color: e.target.value })}
                                                    className="font-mono text-sm uppercase"
                                                    placeholder={activeTheme.colors.primary}
                                                />
                                            </div>
                                        </div>

                                        <div className="space-y-2">
                                            <Label className="text-xs font-bold text-muted-foreground uppercase">اللون الثانوي (التفاصيل والايقونات)</Label>
                                            <div className="flex gap-2">
                                                <div className="h-10 w-10 rounded-lg shadow-sm border overflow-hidden shrink-0">
                                                    <input
                                                        type="color"
                                                        value={storeData.secondary_color || activeTheme.colors.secondary}
                                                        onChange={(e) => setStoreData({ ...storeData, secondary_color: e.target.value })}
                                                        className="w-[150%] h-[150%] -translate-x-[25%] -translate-y-[25%] cursor-pointer"
                                                    />
                                                </div>
                                                <Input
                                                    value={storeData.secondary_color || activeTheme.colors.secondary}
                                                    onChange={(e) => setStoreData({ ...storeData, secondary_color: e.target.value })}
                                                    className="font-mono text-sm uppercase"
                                                    placeholder={activeTheme.colors.secondary}
                                                />
                                            </div>
                                        </div>

                                        <div className="space-y-2">
                                            <Label className="text-xs font-bold text-muted-foreground uppercase">لون الخلفية (كامل المتجر)</Label>
                                            <div className="flex gap-2">
                                                <div className="h-10 w-10 rounded-lg shadow-sm border overflow-hidden shrink-0">
                                                    <input
                                                        type="color"
                                                        value={storeData.background_color || activeTheme.colors.background}
                                                        onChange={(e) => setStoreData({ ...storeData, background_color: e.target.value })}
                                                        className="w-[150%] h-[150%] -translate-x-[25%] -translate-y-[25%] cursor-pointer"
                                                    />
                                                </div>
                                                <Input
                                                    value={storeData.background_color || activeTheme.colors.background}
                                                    onChange={(e) => setStoreData({ ...storeData, background_color: e.target.value })}
                                                    className="font-mono text-sm uppercase"
                                                    placeholder={activeTheme.colors.background}
                                                />
                                            </div>
                                        </div>

                                        <div className="space-y-2">
                                            <Label className="text-xs font-bold text-muted-foreground uppercase">لون النص</Label>
                                            <div className="flex gap-2">
                                                <div className="h-10 w-10 rounded-lg shadow-sm border overflow-hidden shrink-0">
                                                    <input
                                                        type="color"
                                                        value={storeData.text_color || activeTheme.colors.text}
                                                        onChange={(e) => setStoreData({ ...storeData, text_color: e.target.value })}
                                                        className="w-[150%] h-[150%] -translate-x-[25%] -translate-y-[25%] cursor-pointer"
                                                    />
                                                </div>
                                                <Input
                                                    value={storeData.text_color || activeTheme.colors.text}
                                                    onChange={(e) => setStoreData({ ...storeData, text_color: e.target.value })}
                                                    className="font-mono text-sm uppercase"
                                                    placeholder={activeTheme.colors.text}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>

                            </div>
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
