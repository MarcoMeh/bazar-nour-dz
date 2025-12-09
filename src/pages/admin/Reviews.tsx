import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import {
    Table, TableBody, TableCell, TableHead, TableHeader, TableRow
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Star, Check, X, Trash2, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";
import { ar } from "date-fns/locale";

interface Review {
    id: string;
    product_id: string;
    user_name: string;
    rating: number;
    comment: string;
    is_approved: boolean;
    created_at: string;
    product?: {
        name: string;
        image_url: string;
    }
}

export default function AdminReviews() {
    const [reviews, setReviews] = useState<Review[]>([]);
    const [loading, setLoading] = useState(true);
    const [statusFilter, setStatusFilter] = useState<"pending" | "approved">("pending");

    useEffect(() => {
        fetchReviews();
    }, [statusFilter]);

    const fetchReviews = async () => {
        setLoading(true);
        const { data, error } = await supabase
            .from("reviews" as any)
            .select(`
                *,
                product:products (
                    name,
                    image_url
                )
            `)
            .eq("is_approved", statusFilter === "approved")
            .order("created_at", { ascending: false });

        if (error) {
            console.error("Error fetching reviews:", error);
            toast.error("حدث خطأ في جلب التقييمات");
        } else {
            setReviews((data as any) || []);
        }
        setLoading(false);
    };

    const handleApprove = async (id: string) => {
        const { error } = await supabase
            .from("reviews" as any)
            .update({ is_approved: true })
            .eq("id", id);

        if (error) {
            toast.error("حدث خطأ في الموافقة");
        } else {
            toast.success("تم نشر التقييم بنجاح");
            fetchReviews();
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm("هل أنت متأكد من حذف هذا التقييم؟")) return;

        const { error } = await supabase
            .from("reviews" as any)
            .delete()
            .eq("id", id);

        if (error) {
            toast.error("حدث خطأ في الحذف");
        } else {
            toast.success("تم حذف التقييم");
            fetchReviews();
        }
    };

    return (
        <div className="p-8 max-w-7xl mx-auto">
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-3xl font-bold">إدارة التقييمات</h1>
            </div>

            <Tabs defaultValue="pending" onValueChange={(v) => setStatusFilter(v as any)} dir="rtl">
                <TabsList className="mb-4">
                    <TabsTrigger value="pending" className="gap-2">
                        <ClockIcon className="w-4 h-4" />
                        بانتظار الموافقة
                    </TabsTrigger>
                    <TabsTrigger value="approved" className="gap-2">
                        <CheckCircleIcon className="w-4 h-4" />
                        المنشورة
                    </TabsTrigger>
                </TabsList>

                <div className="bg-white rounded-lg border shadow-sm">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead className="text-right">المنتج</TableHead>
                                <TableHead className="text-right">الزبون</TableHead>
                                <TableHead className="text-right">التقييم</TableHead>
                                <TableHead className="text-right w-1/3">التعليق</TableHead>
                                <TableHead className="text-right">التاريخ</TableHead>
                                <TableHead className="text-right">الإجراءات</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {loading ? (
                                <TableRow>
                                    <TableCell colSpan={6} className="text-center py-8">
                                        <Loader2 className="w-8 h-8 animate-spin mx-auto text-primary" />
                                    </TableCell>
                                </TableRow>
                            ) : reviews.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                                        لا توجد تقييمات في هذه القائمة
                                    </TableCell>
                                </TableRow>
                            ) : (
                                reviews.map((review) => (
                                    <TableRow key={review.id}>
                                        <TableCell>
                                            <div className="flex items-center gap-2">
                                                {review.product?.image_url && (
                                                    <img src={review.product.image_url} className="w-8 h-8 rounded object-cover" />
                                                )}
                                                <span className="font-medium">{review.product?.name || "منتج محذوف"}</span>
                                            </div>
                                        </TableCell>
                                        <TableCell>{review.user_name}</TableCell>
                                        <TableCell>
                                            <div className="flex">
                                                {[...Array(5)].map((_, i) => (
                                                    <Star
                                                        key={i}
                                                        className={`w-4 h-4 ${i < review.rating ? "fill-yellow-400 text-yellow-400" : "text-gray-200"}`}
                                                    />
                                                ))}
                                            </div>
                                        </TableCell>
                                        <TableCell className="text-sm">{review.comment}</TableCell>
                                        <TableCell className="text-xs text-muted-foreground">
                                            {format(new Date(review.created_at), "dd/MM/yyyy", { locale: ar })}
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex items-center gap-2">
                                                {!review.is_approved && (
                                                    <Button
                                                        size="sm"
                                                        className="bg-green-600 hover:bg-green-700"
                                                        onClick={() => handleApprove(review.id)}
                                                    >
                                                        <Check className="w-4 h-4 ml-1" /> نشر
                                                    </Button>
                                                )}
                                                <Button
                                                    size="sm"
                                                    variant="destructive"
                                                    onClick={() => handleDelete(review.id)}
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </Button>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </div>
            </Tabs>
        </div>
    );
}

const ClockIcon = ({ className }: { className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></svg>
)

const CheckCircleIcon = ({ className }: { className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" /></svg>
)
