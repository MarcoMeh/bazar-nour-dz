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
    const [styleFilter, setStyleFilter] = useState('all');

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

                {/* Theme Selection Section - IMPROVED UX (Side-by-Side Mobile) */}
                <Card className="border-2 border-primary/20 shadow-xl overflow-hidden mb-8">
                    <CardHeader className="bg-gradient-to-r from-primary/10 to-transparent border-b">
                        <CardTitle className="flex items-center gap-3 text-xl">
                            <Palette className="h-6 w-6 text-primary animate-pulse" />
                            تصميم وشخصية المتجر (الألوان والأشكال)
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-4 md:p-8 space-y-8">
                        {/* Step 1 & 2: Selection and Preview side by side */}
                        <div className="flex flex-col gap-6">
                            <h4 className="font-black text-lg flex items-center gap-3">
                                <div className="w-8 h-8 rounded-full bg-primary text-white text-sm flex items-center justify-center shadow-lg">1</div>
                                اختر النمط وشاهده مباشرة
                            </h4>

                            <div className="flex gap-4 md:gap-8 overflow-hidden items-start">
                                {/* Styles Selection List - Left Side */}
                                <div className="flex-1 space-y-3 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                                    {STORE_THEMES.map((theme) => {
                                        const isSelected = storeData.theme_id === theme.id;
                                        return (
                                            <div
                                                key={theme.id}
                                                onClick={() => setStoreData({
                                                    ...storeData,
                                                    theme_id: theme.id,
                                                    primary_color: theme.colors.primary,
                                                    secondary_color: theme.colors.secondary,
                                                    background_color: theme.colors.background,
                                                    text_color: theme.colors.text
                                                })}
                                                className={`
                                                    relative group cursor-pointer rounded-xl border-2 transition-all p-3 flex items-center justify-between
                                                    ${isSelected
                                                        ? 'border-primary bg-primary/5 ring-2 ring-primary/10 shadow-md'
                                                        : 'border-transparent bg-muted/30 hover:bg-white hover:border-primary/20'
                                                    }
                                                `}
                                            >
                                                <span className={`text-sm font-black ${isSelected ? 'text-primary' : 'text-muted-foreground'}`}>
                                                    {theme.nameAr}
                                                </span>

                                                {isSelected && (
                                                    <div className="bg-primary text-white p-0.5 rounded-full">
                                                        <Check className="w-3 h-3" />
                                                    </div>
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>

                                {/* Preview Side - Right (beside selection) */}
                                <div className="w-36 md:w-56 lg:w-64 shrink-0">
                                    <div
                                        className="aspect-[9/16] rounded-[1.5rem] md:rounded-[2.5rem] border-4 md:border-8 border-gray-900 shadow-2xl overflow-hidden relative scale-100"
                                        style={{ backgroundColor: previewColors.background }}
                                    >
                                        <div className="absolute top-0 inset-x-0 h-3 bg-gray-900 flex justify-center items-center">
                                            <div className="w-8 h-0.5 bg-gray-800 rounded-full"></div>
                                        </div>

                                        {/* Mini Store Content */}
                                        {(() => {
                                            const logoAlign = activeTheme.styles.logoAlignment;
                                            const descAlign = activeTheme.styles.descriptionAlignment;
                                            const aspect = activeTheme.styles.productImageAspect === 'square' ? '1/1' : activeTheme.styles.productImageAspect === 'portrait' ? '3/4' : '16/9';

                                            return (
                                                <div className="p-2 md:p-3 h-full overflow-hidden" style={{
                                                    fontFamily: activeTheme.typography.fontFamily,
                                                    fontSize: `calc(${activeTheme.typography.baseFontSize} * 0.35)`
                                                }}>
                                                    <div className={`mt-3 mb-3 flex flex-col ${logoAlign === 'center' ? 'items-center text-center' : logoAlign === 'right' ? 'items-end text-right' : 'items-start text-left'}`}>
                                                        <div className={`w-6 h-6 rounded-md mb-1.5 shadow-sm`} style={{ backgroundColor: previewColors.primary }}></div>
                                                        <div className={`h-1.5 w-2/3 rounded-full mb-0.5`} style={{ backgroundColor: previewColors.text }}></div>
                                                        <div className={`h-1 w-1/3 rounded-full opacity-30`} style={{ backgroundColor: previewColors.text }}></div>
                                                    </div>

                                                    <div className={`grid gap-1.5 ${activeTheme.styles.layoutType === 'grid' ? 'grid-cols-2' : activeTheme.styles.layoutType === 'compact' ? 'grid-cols-3' : 'grid-cols-2'}`}>
                                                        {[1, 2, 3, 4].map(i => (
                                                            <div
                                                                key={i}
                                                                className="rounded-md p-1 shadow-sm border border-gray-100/10 flex flex-col gap-1"
                                                                style={{
                                                                    backgroundColor: 'rgba(255,255,255,0.05)',
                                                                    borderRadius: `calc(${activeTheme.styles.borderRadius} * 0.5)`,
                                                                    justifyContent: 'center'
                                                                }}
                                                            >
                                                                <div className="w-full bg-gray-100/30 rounded-sm" style={{ aspectRatio: aspect }}></div>
                                                                <div className={`w-full flex flex-col gap-0.5 ${descAlign === 'center' ? 'items-center text-center' : descAlign === 'right' ? 'items-end text-right' : 'items-start text-left'}`}>
                                                                    <div className="w-3/4 h-0.5 bg-gray-200 rounded-full opacity-50"></div>
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </div>

                                                    <div className="absolute bottom-4 inset-x-3">
                                                        <div className="h-6 lg:h-8 w-full rounded-full shadow-lg flex items-center justify-center text-[6px] md:text-[8px] font-bold text-white overflow-hidden" style={{ backgroundColor: previewColors.primary }}>
                                                            أطلب الآن
                                                        </div>
                                                    </div>
                                                </div>
                                            );
                                        })()}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Step 3: Color Controls Container */}
                        <div className="space-y-6 pt-8 border-t border-dashed">
                            <div className="flex items-center justify-between gap-4">
                                <h4 className="font-black text-lg flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-full bg-primary text-white text-sm flex items-center justify-center shadow-lg">2</div>
                                    تعديل الألوان بحرية (اختياري)
                                </h4>
                                <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setStoreData({
                                        ...storeData,
                                        primary_color: activeTheme.colors.primary,
                                        secondary_color: activeTheme.colors.secondary,
                                        background_color: activeTheme.colors.background,
                                        text_color: activeTheme.colors.text
                                    })}
                                    className="text-[10px] md:text-xs font-bold rounded-lg h-8 md:h-10"
                                >
                                    استعادة ألوان القالب
                                </Button>
                            </div>

                            <div className="grid gap-4 md:grid-cols-2">
                                {/* Primary Color */}
                                <div className="space-y-3 p-4 rounded-xl bg-muted/20 border">
                                    <Label className="text-[10px] font-black text-muted-foreground uppercase">اللون الأساسي (الأزرار والعناوين)</Label>
                                    <div className="flex flex-col gap-3">
                                        <div className="flex gap-2">
                                            <div className="h-10 w-10 rounded-lg overflow-hidden border shrink-0 shadow-inner">
                                                <input
                                                    type="color"
                                                    value={storeData.primary_color || activeTheme.colors.primary}
                                                    onChange={(e) => setStoreData({ ...storeData, primary_color: e.target.value })}
                                                    className="w-full h-full scale-150 cursor-pointer"
                                                />
                                            </div>
                                            <Input
                                                value={storeData.primary_color || activeTheme.colors.primary}
                                                onChange={(e) => setStoreData({ ...storeData, primary_color: e.target.value })}
                                                className="font-mono text-xs h-10 rounded-lg"
                                            />
                                        </div>
                                        {/* Recommended Palette */}
                                        <div className="flex flex-wrap gap-1.5">
                                            {['#1e40af', '#e11d48', '#059669', '#ca8a04', '#7c3aed', '#ec4899', '#f97316', '#0f172a'].map(color => (
                                                <button
                                                    key={color}
                                                    type="button"
                                                    onClick={() => setStoreData({ ...storeData, primary_color: color })}
                                                    className={`w-6 h-6 rounded-full border border-white/20 shadow-sm transition-transform hover:scale-125 ${storeData.primary_color === color ? 'ring-2 ring-primary ring-offset-2' : ''}`}
                                                    style={{ backgroundColor: color }}
                                                />
                                            ))}
                                        </div>
                                    </div>
                                </div>

                                {/* Secondary Color */}
                                <div className="space-y-3 p-4 rounded-xl bg-muted/20 border">
                                    <Label className="text-[10px] font-black text-muted-foreground uppercase">اللون الثانوي (الزينة والأيقونات)</Label>
                                    <div className="flex flex-col gap-3">
                                        <div className="flex gap-2">
                                            <div className="h-10 w-10 rounded-lg overflow-hidden border shrink-0 shadow-inner">
                                                <input
                                                    type="color"
                                                    value={storeData.secondary_color || activeTheme.colors.secondary}
                                                    onChange={(e) => setStoreData({ ...storeData, secondary_color: e.target.value })}
                                                    className="w-full h-full scale-150 cursor-pointer"
                                                />
                                            </div>
                                            <Input
                                                value={storeData.secondary_color || activeTheme.colors.secondary}
                                                onChange={(e) => setStoreData({ ...storeData, secondary_color: e.target.value })}
                                                className="font-mono text-xs h-10 rounded-lg"
                                            />
                                        </div>
                                        {/* Recommended Palette */}
                                        <div className="flex flex-wrap gap-1.5">
                                            {['#60a5fa', '#fb7185', '#34d399', '#facc15', '#a78bfa', '#fbcfe8', '#fdba74', '#94a3b8'].map(color => (
                                                <button
                                                    key={color}
                                                    type="button"
                                                    onClick={() => setStoreData({ ...storeData, secondary_color: color })}
                                                    className={`w-6 h-6 rounded-full border border-white/20 shadow-sm transition-transform hover:scale-125 ${storeData.secondary_color === color ? 'ring-2 ring-primary ring-offset-2' : ''}`}
                                                    style={{ backgroundColor: color }}
                                                />
                                            ))}
                                        </div>
                                    </div>
                                </div>

                                {/* Background Color */}
                                <div className="space-y-3 p-4 rounded-xl bg-muted/20 border">
                                    <Label className="text-[10px] font-black text-muted-foreground uppercase">خلفية المتجر</Label>
                                    <div className="flex flex-col gap-3">
                                        <div className="flex gap-2">
                                            <div className="h-10 w-10 rounded-lg overflow-hidden border shrink-0 shadow-inner">
                                                <input
                                                    type="color"
                                                    value={storeData.background_color || activeTheme.colors.background}
                                                    onChange={(e) => setStoreData({ ...storeData, background_color: e.target.value })}
                                                    className="w-full h-full scale-150 cursor-pointer"
                                                />
                                            </div>
                                            <Input
                                                value={storeData.background_color || activeTheme.colors.background}
                                                onChange={(e) => setStoreData({ ...storeData, background_color: e.target.value })}
                                                className="font-mono text-xs h-10 rounded-lg"
                                            />
                                        </div>
                                        {/* Recommended Palette */}
                                        <div className="flex flex-wrap gap-1.5">
                                            {['#ffffff', '#f8fafc', '#f1f5f9', '#0a0a0a', '#111111', '#fff1f2', '#f0f9ff', '#fafafa'].map(color => (
                                                <button
                                                    key={color}
                                                    type="button"
                                                    onClick={() => setStoreData({ ...storeData, background_color: color })}
                                                    className={`w-6 h-6 rounded-full border border-white/20 shadow-sm transition-transform hover:scale-125 ${storeData.background_color === color ? 'ring-2 ring-primary ring-offset-2' : ''}`}
                                                    style={{ backgroundColor: color }}
                                                />
                                            ))}
                                        </div>
                                    </div>
                                </div>

                                {/* Text Color */}
                                <div className="space-y-3 p-4 rounded-xl bg-muted/20 border">
                                    <Label className="text-[10px) font-black text-muted-foreground uppercase">لون النصوص</Label>
                                    <div className="flex flex-col gap-3">
                                        <div className="flex gap-2">
                                            <div className="h-10 w-10 rounded-lg overflow-hidden border shrink-0 shadow-inner">
                                                <input
                                                    type="color"
                                                    value={storeData.text_color || activeTheme.colors.text}
                                                    onChange={(e) => setStoreData({ ...storeData, text_color: e.target.value })}
                                                    className="w-full h-full scale-150 cursor-pointer"
                                                />
                                            </div>
                                            <Input
                                                value={storeData.text_color || activeTheme.colors.text}
                                                onChange={(e) => setStoreData({ ...storeData, text_color: e.target.value })}
                                                className="font-mono text-xs h-10 rounded-lg"
                                            />
                                        </div>
                                        {/* Recommended Palette */}
                                        <div className="flex flex-wrap gap-1.5">
                                            {['#0f172a', '#1e3a8a', '#4c0519', '#ffffff', '#e2e8f0', '#334155', '#166534', '#991b1b'].map(color => (
                                                <button
                                                    key={color}
                                                    type="button"
                                                    onClick={() => setStoreData({ ...storeData, text_color: color })}
                                                    className={`w-6 h-6 rounded-full border border-white/20 shadow-sm transition-transform hover:scale-125 ${storeData.text_color === color ? 'ring-2 ring-primary ring-offset-2' : ''}`}
                                                    style={{ backgroundColor: color }}
                                                />
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Extra spacing at bottom to prevent sticky bar overlap */}
                <div className="h-32" />

                {/* Sticky Save Bar */}
                <div className="fixed bottom-0 left-0 right-0 z-50 p-4 md:p-6 bg-white/80 backdrop-blur-md border-t shadow-[0_-10px_40px_-15px_rgba(0,0,0,0.1)] flex justify-center lg:justify-end lg:pr-72">
                    <div className="max-w-5xl w-full flex justify-end">
                        <Button
                            type="submit"
                            size="lg"
                            disabled={saving || uploading}
                            className="w-full md:w-auto min-w-[200px] h-14 rounded-2xl text-lg font-black shadow-xl shadow-primary/20 hover:scale-105 active:scale-95 transition-all"
                        >
                            {saving ? (
                                <>
                                    <Loader2 className="ml-3 h-6 w-6 animate-spin" />
                                    جاري الحفظ...
                                </>
                            ) : (
                                <>
                                    <Save className="ml-3 h-6 w-6" />
                                    حفظ التغييرات النهائية
                                </>
                            )}
                        </Button>
                    </div>
                </div>
            </form>
        </div >
    );
}
