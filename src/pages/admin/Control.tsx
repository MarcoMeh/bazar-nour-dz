import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

interface SiteSettings {
    id: number;
    hero_visible: boolean;
    features_visible: boolean;
    products_visible: boolean;
    stores_visible: boolean;
    categories_visible: boolean;
}

export default function AdminControl() {
    const [settings, setSettings] = useState<SiteSettings | null>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        fetchSettings();
    }, []);

    const fetchSettings = async () => {
        try {
            const { data, error } = await supabase
                .from("site_settings" as any)
                .select("*")
                .single();

            if (error) {
                console.error("Error fetching settings:", error);
                // If table is empty, maybe insert default? Or just handle error.
                // For now, assume script ran and row exists.
            } else {
                setSettings(data as any);
            }
        } catch (error) {
            console.error("Error:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleToggle = (key: keyof SiteSettings) => {
        if (!settings) return;
        setSettings({ ...settings, [key]: !settings[key] });
    };

    const handleSave = async () => {
        if (!settings) return;
        setSaving(true);
        try {
            const { error } = await supabase
                .from("site_settings" as any)
                .update({
                    hero_visible: settings.hero_visible,
                    features_visible: settings.features_visible,
                    products_visible: settings.products_visible,
                    stores_visible: settings.stores_visible,
                    categories_visible: settings.categories_visible,
                })
                .eq("id", 1); // Assuming single row with ID 1

            if (error) throw error;
            toast.success("تم حفظ التغييرات بنجاح");
        } catch (error) {
            console.error("Error saving settings:", error);
            toast.error("حدث خطأ أثناء الحفظ");
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return <div className="p-8 flex justify-center"><Loader2 className="animate-spin" /></div>;
    }

    if (!settings) {
        return <div className="p-8 text-center">فشل في تحميل الإعدادات. يرجى التأكد من تشغيل سكربت قاعدة البيانات.</div>;
    }

    return (
        <div className="p-8">
            <h1 className="text-3xl font-bold mb-8 text-primary">لوحة التحكم في الصفحة الرئيسية</h1>

            <div className="grid gap-6">
                {/* Hero Section Control */}
                <Card>
                    <CardHeader>
                        <CardTitle>قسم البطل (Hero)</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex items-center justify-between">
                            <Label htmlFor="hero-visible">إظهار قسم البطل</Label>
                            <Switch
                                id="hero-visible"
                                checked={settings.hero_visible}
                                onCheckedChange={() => handleToggle("hero_visible")}
                            />
                        </div>
                    </CardContent>
                </Card>

                {/* Features Section Control */}
                <Card>
                    <CardHeader>
                        <CardTitle>قسم المميزات</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex items-center justify-between">
                            <Label htmlFor="features-visible">إظهار قسم المميزات</Label>
                            <Switch
                                id="features-visible"
                                checked={settings.features_visible}
                                onCheckedChange={() => handleToggle("features_visible")}
                            />
                        </div>
                    </CardContent>
                </Card>

                {/* Best Products Control */}
                <Card>
                    <CardHeader>
                        <CardTitle>أفضل المنتجات</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex items-center justify-between">
                            <Label htmlFor="products-visible">إظهار قسم أفضل المنتجات</Label>
                            <Switch
                                id="products-visible"
                                checked={settings.products_visible}
                                onCheckedChange={() => handleToggle("products_visible")}
                            />
                        </div>
                    </CardContent>
                </Card>

                {/* Stores Section Control */}
                <Card>
                    <CardHeader>
                        <CardTitle>قسم المحلات</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex items-center justify-between">
                            <Label htmlFor="stores-visible">إظهار قسم المحلات</Label>
                            <Switch
                                id="stores-visible"
                                checked={settings.stores_visible}
                                onCheckedChange={() => handleToggle("stores_visible")}
                            />
                        </div>
                    </CardContent>
                </Card>

                {/* Categories Section Control */}
                <Card>
                    <CardHeader>
                        <CardTitle>قسم التصنيفات</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex items-center justify-between">
                            <Label htmlFor="categories-visible">إظهار قسم التصنيفات</Label>
                            <Switch
                                id="categories-visible"
                                checked={settings.categories_visible}
                                onCheckedChange={() => handleToggle("categories_visible")}
                            />
                        </div>
                    </CardContent>
                </Card>

                <div className="flex justify-end">
                    <Button size="lg" onClick={handleSave} disabled={saving}>
                        {saving && <Loader2 className="ml-2 h-4 w-4 animate-spin" />}
                        حفظ التغييرات
                    </Button>
                </div>
            </div>
        </div>
    );
}
