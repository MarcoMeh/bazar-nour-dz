import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";

export default function StoreOwnerProfile() {
    const [isEditing, setIsEditing] = useState(false);

    return (
        <div className="p-8">
            <div className="flex items-center justify-between mb-8">
                <h1 className="text-3xl font-bold text-primary">الملف الشخصي للمحل</h1>
                <Button onClick={() => setIsEditing(!isEditing)}>
                    {isEditing ? "حفظ التغييرات" : "تعديل"}
                </Button>
            </div>

            <div className="grid gap-6 max-w-3xl">
                {/* Store Information */}
                <Card>
                    <CardHeader>
                        <CardTitle>معلومات المحل</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid gap-2">
                            <Label htmlFor="store-name">اسم المحل</Label>
                            <Input
                                id="store-name"
                                defaultValue="محل تجريبي"
                                disabled={!isEditing}
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="store-desc">وصف المحل</Label>
                            <Textarea
                                id="store-desc"
                                defaultValue="وصف المحل وتخصصه"
                                disabled={!isEditing}
                                rows={4}
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="store-image">صورة المحل</Label>
                            <Input
                                id="store-image"
                                placeholder="https://..."
                                disabled={!isEditing}
                            />
                        </div>
                    </CardContent>
                </Card>

                {/* Owner Information */}
                <Card>
                    <CardHeader>
                        <CardTitle>معلومات صاحب المحل</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid gap-2">
                            <Label htmlFor="owner-name">الاسم الكامل</Label>
                            <Input
                                id="owner-name"
                                defaultValue="صاحب المحل"
                                disabled={!isEditing}
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="grid gap-2">
                                <Label htmlFor="email">البريد الإلكتروني</Label>
                                <Input
                                    id="email"
                                    type="email"
                                    defaultValue="owner@example.com"
                                    disabled={!isEditing}
                                    dir="ltr"
                                />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="phone">رقم الهاتف</Label>
                                <Input
                                    id="phone"
                                    defaultValue="0555123456"
                                    disabled={!isEditing}
                                    dir="ltr"
                                />
                            </div>
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="address">العنوان</Label>
                            <Input
                                id="address"
                                defaultValue="العنوان الكامل"
                                disabled={!isEditing}
                            />
                        </div>
                    </CardContent>
                </Card>

                {/* Social Media */}
                <Card>
                    <CardHeader>
                        <CardTitle>روابط التواصل الاجتماعي</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid gap-2">
                            <Label htmlFor="facebook">فيسبوك</Label>
                            <Input
                                id="facebook"
                                placeholder="https://facebook.com/..."
                                disabled={!isEditing}
                                dir="ltr"
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="instagram">إنستغرام</Label>
                            <Input
                                id="instagram"
                                placeholder="https://instagram.com/..."
                                disabled={!isEditing}
                                dir="ltr"
                            />
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
