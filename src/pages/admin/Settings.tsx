import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { Loader2, Upload, Save, Globe, Phone, Mail, MapPin, Facebook, Instagram } from "lucide-react";

export default function AdminSettings() {
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [uploading, setUploading] = useState(false);

    const [settings, setSettings] = useState({
        id: "",
        site_name: "",
        logo_url: "",
        facebook_url: "",
        instagram_url: "",
        tiktok_url: "",
        whatsapp_number: "",
        phone_number: "",
        email: "",
        address: "",
    });

    useEffect(() => {
        fetchSettings();
    }, []);

    const fetchSettings = async () => {
        try {
            setLoading(true);
            const { data, error } = await supabase
                .from("site_settings")
                .select("*")
                .limit(1)
                .single();

            if (error) {
                // If checking for 'no rows' specific error might be needed, but .single() usually returns data or error
                if (error.code !== 'PGRST116') {
                    console.error("Error fetching settings:", error);
                }
            }

            if (data) {
                setSettings({
                    id: data.id,
                    site_name: data.site_name || "",
                    logo_url: data.logo_url || "",
                    facebook_url: data.facebook_url || "",
                    instagram_url: data.instagram_url || "",
                    tiktok_url: data.tiktok_url || "",
                    whatsapp_number: data.whatsapp_number || "",
                    phone_number: data.phone_number || "",
                    email: data.email || "",
                    address: data.address || "",
                });
            }
        } catch (error) {
            console.error("Error:", error);
            toast.error("فشل في تحميل الإعدادات");
        } finally {
            setLoading(false);
        }
    };

    const handleLogoUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
        try {
            if (!event.target.files || event.target.files.length === 0) return;

            setUploading(true);
            const file = event.target.files[0];
            const fileExt = file.name.split('.').pop();
            const fileName = `site_logo_${Math.random()}.${fileExt}`;
            const filePath = `${fileName}`;

            // Assuming a 'public' bucket or similar exists, often 'store-images' or create a new 'site-assets'
            // For now I'll use 'store-images' as it likely exists and is public
            const { error: uploadError } = await supabase.storage
                .from('store-images')
                .upload(filePath, file);

            if (uploadError) throw uploadError;

            const { data } = supabase.storage
                .from('store-images')
                .getPublicUrl(filePath);

            setSettings(prev => ({ ...prev, logo_url: data.publicUrl }));
            toast.success("تم رفع الشعار بنجاح");
        } catch (error: any) {
            toast.error("فشل في رفع الشعار: " + error.message);
        } finally {
            setUploading(false);
        }
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        try {
            const { error } = await supabase
                .from("site_settings")
                .upsert({
                    id: settings.id || undefined, // undefined to let it autogenerate if empty but we logically fetched one
                    site_name: settings.site_name,
                    logo_url: settings.logo_url,
                    facebook_url: settings.facebook_url,
                    instagram_url: settings.instagram_url,
                    tiktok_url: settings.tiktok_url,
                    whatsapp_number: settings.whatsapp_number,
                    phone_number: settings.phone_number,
                    email: settings.email,
                    address: settings.address,
                    updated_at: new Date().toISOString(),
                });

            if (error) throw error;
            toast.success("تم حفظ الإعدادات بنجاح");
        } catch (error) {
            console.error("Error saving:", error);
            toast.error("حدث خطأ أثناء الحفظ");
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return <div className="flex justify-center p-8"><Loader2 className="h-8 w-8 animate-spin" /></div>;
    }

    return (
        <div className="p-4 md:p-8 space-y-6">
            <h1 className="text-3xl font-bold tracking-tight text-primary flex items-center gap-2">
                <Globe className="h-8 w-8" />
                إعدادات الموقع
            </h1>

            <form onSubmit={handleSave} className="space-y-8">
                <Card>
                    <CardHeader>
                        <CardTitle>الهوية البصرية</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="flex flex-col items-center gap-4">
                            <div className="relative w-32 h-32 border-2 border-dashed rounded-lg flex items-center justify-center overflow-hidden bg-muted">
                                {settings.logo_url ? (
                                    <img src={settings.logo_url} alt="Logo" className="w-full h-full object-contain p-2" />
                                ) : (
                                    <div className="text-center text-muted-foreground p-2">
                                        <Upload className="mx-auto h-8 w-8 mb-1" />
                                        <span className="text-xs">شعار الموقع</span>
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
                                    id="logo-upload"
                                    type="file"
                                    accept="image/*"
                                    className="hidden"
                                    onChange={handleLogoUpload}
                                />
                                <Label
                                    htmlFor="logo-upload"
                                    className="cursor-pointer bg-secondary text-secondary-foreground hover:bg-secondary/90 h-9 px-4 py-2 rounded-md text-sm font-medium flex items-center"
                                >
                                    <Upload className="w-4 h-4 ml-2" />
                                    تغيير الشعار
                                </Label>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label>اسم الموقع</Label>
                            <Input
                                value={settings.site_name}
                                onChange={(e) => setSettings({ ...settings, site_name: e.target.value })}
                                placeholder="مثال: بازارنا"
                            />
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>معلومات التواصل</CardTitle>
                    </CardHeader>
                    <CardContent className="grid gap-4 md:grid-cols-2">
                        <div className="space-y-2">
                            <Label>رقم الهاتف</Label>
                            <div className="relative">
                                <Phone className="absolute right-3 top-3 h-4 w-4 text-muted-foreground" />
                                <Input
                                    value={settings.phone_number}
                                    onChange={(e) => setSettings({ ...settings, phone_number: e.target.value })}
                                    className="pr-9"
                                />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label>رقم الواتساب</Label>
                            <div className="relative">
                                <Phone className="absolute right-3 top-3 h-4 w-4 text-green-600" />
                                <Input
                                    value={settings.whatsapp_number}
                                    onChange={(e) => setSettings({ ...settings, whatsapp_number: e.target.value })}
                                    className="pr-9"
                                />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label>البريد الإلكتروني</Label>
                            <div className="relative">
                                <Mail className="absolute right-3 top-3 h-4 w-4 text-muted-foreground" />
                                <Input
                                    value={settings.email}
                                    onChange={(e) => setSettings({ ...settings, email: e.target.value })}
                                    className="pr-9"
                                />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label>العنوان</Label>
                            <div className="relative">
                                <MapPin className="absolute right-3 top-3 h-4 w-4 text-muted-foreground" />
                                <Input
                                    value={settings.address}
                                    onChange={(e) => setSettings({ ...settings, address: e.target.value })}
                                    className="pr-9"
                                />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>شبكات التواصل الاجتماعي</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <Label>Facebook</Label>
                            <Input
                                value={settings.facebook_url}
                                onChange={(e) => setSettings({ ...settings, facebook_url: e.target.value })}
                                dir="ltr"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>Instagram</Label>
                            <Input
                                value={settings.instagram_url}
                                onChange={(e) => setSettings({ ...settings, instagram_url: e.target.value })}
                                dir="ltr"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>TikTok</Label>
                            <Input
                                value={settings.tiktok_url}
                                onChange={(e) => setSettings({ ...settings, tiktok_url: e.target.value })}
                                dir="ltr"
                            />
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
