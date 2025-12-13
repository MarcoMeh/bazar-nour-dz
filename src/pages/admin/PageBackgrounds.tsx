import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Upload, ImageIcon, Save } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Label } from "@/components/ui/label";

import { PageBackground } from "@/type_defs";

export default function PageBackgrounds() {
    const [backgrounds, setBackgrounds] = useState<PageBackground[]>([]);
    const [loading, setLoading] = useState(true);
    const [uploading, setUploading] = useState<string | null>(null);

    useEffect(() => {
        fetchBackgrounds();
    }, []);

    const fetchBackgrounds = async () => {
        setLoading(true);
        const { data, error } = await supabase
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            .from("page_backgrounds" as any)
            .select("*")
            .order("page_name");

        if (error) {
            console.error("Error fetching backgrounds:", error);
            // toast.error("Failed to fetch backgrounds"); 
        } else {
            setBackgrounds((data as unknown as PageBackground[]) || []);
        }
        setLoading(false);
    };

    const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>, pageKey: string) => {
        try {
            if (!event.target.files || event.target.files.length === 0) {
                return;
            }
            setUploading(pageKey);
            const file = event.target.files[0];
            const fileExt = file.name.split('.').pop();
            const fileName = `bg_${pageKey}_${Date.now()}.${fileExt}`;
            const filePath = `${fileName}`;

            const { error: uploadError } = await supabase.storage
                .from('store-images') // Reusing existing bucket
                .upload(filePath, file);

            if (uploadError) {
                throw uploadError;
            }

            const { data } = supabase.storage
                .from('store-images')
                .getPublicUrl(filePath);

            updateBackground(pageKey, data.publicUrl);
            toast.success("تم رفع الصورة بنجاح");
        } catch (error: any) {
            toast.error("فشل في رفع الصورة: " + error.message);
        } finally {
            setUploading(null);
        }
    };

    const updateBackground = async (pageKey: string, imageUrl: string) => {
        const { error } = await supabase
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            .from("page_backgrounds" as any)
            .update({ image_url: imageUrl })
            .eq("page_key", pageKey);

        if (error) {
            console.error("Error updating background:", error);
            toast.error("فشل في تحديث الخلفية");
        } else {
            fetchBackgrounds();
        }
    };

    return (
        <div className="space-y-6 font-cairo text-right" dir="rtl">
            <div className="flex justify-between items-center">
                <h2 className="text-3xl font-bold tracking-tight">إدارة خلفيات الصفحات</h2>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>قائمة الصفحات</CardTitle>
                </CardHeader>
                <CardContent>
                    {loading ? (
                        <div className="flex justify-center p-8">
                            <Loader2 className="h-8 w-8 animate-spin text-primary" />
                        </div>
                    ) : (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead className="text-right">اسم الصفحة</TableHead>
                                    <TableHead className="text-center">الصورة الحالية</TableHead>
                                    <TableHead className="text-right">تغيير الصورة</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {backgrounds.length === 0 && (
                                    <TableRow>
                                        <TableCell colSpan={3} className="text-center py-8 text-muted-foreground">
                                            لا توجد بيانات. يرجى تشغيل ملف SQL المرفق.
                                        </TableCell>
                                    </TableRow>
                                )}
                                {backgrounds.map((bg) => (
                                    <TableRow key={bg.id}>
                                        <TableCell className="font-medium">{bg.page_name}</TableCell>
                                        <TableCell className="text-center">
                                            {bg.image_url ? (
                                                <div className="relative w-32 h-20 mx-auto rounded-lg overflow-hidden border">
                                                    <img
                                                        src={bg.image_url}
                                                        alt={bg.page_name}
                                                        className="w-full h-full object-cover"
                                                    />
                                                </div>
                                            ) : (
                                                <div className="w-32 h-20 mx-auto rounded-lg border border-dashed flex items-center justify-center bg-gray-50 text-gray-400">
                                                    <ImageIcon className="h-6 w-6" />
                                                </div>
                                            )}
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex items-center gap-2">
                                                <Input
                                                    id={`upload-${bg.page_key}`}
                                                    type="file"
                                                    accept="image/*"
                                                    className="hidden"
                                                    onChange={(e) => handleImageUpload(e, bg.page_key)}
                                                    disabled={uploading === bg.page_key}
                                                />
                                                <Label
                                                    htmlFor={`upload-${bg.page_key}`}
                                                    className={`cursor-pointer inline-flex items-center gap-2 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 rounded-md text-sm font-medium transition-colors ${uploading === bg.page_key ? "opacity-50 cursor-not-allowed" : ""}`}
                                                >
                                                    {uploading === bg.page_key ? (
                                                        <Loader2 className="h-4 w-4 animate-spin" />
                                                    ) : (
                                                        <Upload className="h-4 w-4" />
                                                    )}
                                                    رفع صورة
                                                </Label>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
