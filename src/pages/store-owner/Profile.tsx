import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { Loader2, User, Store, Upload, Save, MapPin, Phone } from "lucide-react";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

export default function StoreOwnerProfile() {
    const { user } = useAuth();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [uploading, setUploading] = useState(false);

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
        category_id: "",
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
                .select("*")
                .eq("owner_id", user?.id)
                .single();

            if (storeError && storeError.code !== 'PGRST116') { // Ignore if no store found (though unlikely for store owner)
                console.error("Error fetching store:", storeError);
            }

            if (store) {
                setStoreData({
                    id: store.id,
                    name: store.name,
                    description: store.description || "",
                    image_url: store.image_url || "",
                    category_id: store.category_id || "",
                });
            }

            // 3. Fetch Categories
            const { data: cats } = await supabase
                .from("store_categories")
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
                        category_id: storeData.category_id || null,
                    })
                    .eq("id", storeData.id);

                if (storeError) throw storeError;
            }

            toast.success("تم حفظ التغييرات بنجاح");
        } catch (error) {
            console.error("Error saving changes:", error);
            toast.error("حدث خطأ في حفظ التغييرات");
        } finally {
            setSaving(false);
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
        <div className="container max-w-4xl py-6">
            <h1 className="text-3xl font-bold mb-8 flex items-center gap-2">
                <Store className="h-8 w-8" />
                إعدادات المتجر والملف الشخصي
            </h1>

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
                                <Select
                                    value={storeData.category_id}
                                    onValueChange={(val) => setStoreData({ ...storeData, category_id: val })}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="اختر الفئة" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {categories.map((cat) => (
                                            <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
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

                <div className="flex justify-end">
                    <Button type="submit" size="lg" disabled={saving || uploading}>
                        {saving ? <Loader2 className="ml-2 h-4 w-4 animate-spin" /> : <Save className="ml-2 h-4 w-4" />}
                        حفظ التغييرات
                    </Button>
                </div>
            </form>
        </div>
    );
}
