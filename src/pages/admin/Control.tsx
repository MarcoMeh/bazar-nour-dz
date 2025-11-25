import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";

export default function AdminControl() {
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
                            <Switch id="hero-visible" defaultChecked />
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
                            <Switch id="features-visible" defaultChecked />
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
                            <Switch id="products-visible" defaultChecked />
                        </div>
                        <div className="pt-4">
                            <Label className="mb-2 block">المنتجات المعروضة</Label>
                            <p className="text-sm text-muted-foreground mb-4">
                                اختر المنتجات التي تريد عرضها في الصفحة الرئيسية
                            </p>
                            <Button variant="outline">اختيار المنتجات</Button>
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
                            <Switch id="stores-visible" defaultChecked />
                        </div>
                        <div className="pt-4">
                            <Label className="mb-2 block">المحلات المميزة</Label>
                            <p className="text-sm text-muted-foreground mb-4">
                                اختر المحلات التي تريد عرضها في الصفحة الرئيسية
                            </p>
                            <Button variant="outline">اختيار المحلات</Button>
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
                            <Switch id="categories-visible" defaultChecked />
                        </div>
                    </CardContent>
                </Card>

                <div className="flex justify-end">
                    <Button size="lg">حفظ التغييرات</Button>
                </div>
            </div>
        </div>
    );
}
