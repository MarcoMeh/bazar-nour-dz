import { useState, useEffect } from "react";
import { Star, Send, User } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { toast } from "sonner";
import { format } from "date-fns";
import { ar } from "date-fns/locale";

interface Review {
    id: string;
    user_name: string;
    rating: number;
    comment: string;
    created_at: string;
}

interface ReviewsSectionProps {
    productId: string;
}

export const ReviewsSection = ({ productId }: ReviewsSectionProps) => {
    const [reviews, setReviews] = useState<Review[]>([]);
    const [loading, setLoading] = useState(true);

    // Form State
    const [userName, setUserName] = useState("");
    const [rating, setRating] = useState(0);
    const [comment, setComment] = useState("");
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        fetchReviews();
    }, [productId]);

    const fetchReviews = async () => {
        const { data, error } = await supabase
            .from("reviews" as any)
            .select("id, user_name, rating, comment, created_at")
            .eq("product_id", productId)
            .eq("is_approved", true)
            .order("created_at", { ascending: false });

        if (error) {
            console.error("Error fetching reviews:", error);
        } else {
            setReviews((data as Review[]) || []);
        }
        setLoading(false);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (rating === 0) {
            toast.error("يرجى اختيار التقييم (عدد النجوم)");
            return;
        }
        if (!userName.trim() || !comment.trim()) {
            toast.error("يرجى ملء الاسم والتعليق");
            return;
        }

        setSubmitting(true);
        const { error } = await supabase
            .from("reviews" as any)
            .insert({
                product_id: productId,
                user_name: userName,
                rating: rating,
                comment: comment,
                is_approved: false // Default pending
            });

        setSubmitting(false);

        if (error) {
            console.error("Error submitting review:", error);
            toast.error("حدث خطأ أثناء إرسال التقييم");
        } else {
            toast.success("تم إرسال تقييمك بنجاح! سيظهر بعد مراجعة الإدارة.");
            setUserName("");
            setRating(0);
            setComment("");
        }
    };

    return (
        <div className="space-y-8 mt-12">
            <h2 className="text-2xl font-bold flex items-center gap-2">
                <Star className="fill-yellow-400 text-yellow-400" />
                التقييمات والآراء
                <span className="text-sm font-normal text-muted-foreground">({reviews.length})</span>
            </h2>

            <div className="grid gap-8 md:grid-cols-2">
                {/* Review Form */}
                <Card>
                    <CardHeader>
                        <CardTitle className="text-lg">أضف تقييمك</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium">التقييم</label>
                                <div className="flex gap-1">
                                    {[1, 2, 3, 4, 5].map((star) => (
                                        <button
                                            key={star}
                                            type="button"
                                            onClick={() => setRating(star)}
                                            className="focus:outline-none transition-transform hover:scale-110"
                                        >
                                            <Star
                                                className={`w-8 h-8 ${star <= rating ? "fill-yellow-400 text-yellow-400" : "text-gray-300"}`}
                                            />
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium">اسمك</label>
                                <Input
                                    placeholder="اكتب اسمك هنا"
                                    value={userName}
                                    onChange={(e) => setUserName(e.target.value)}
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium">رأيك في المنتج</label>
                                <Textarea
                                    placeholder="ما رأيك في جودة المنتج؟"
                                    value={comment}
                                    onChange={(e) => setComment(e.target.value)}
                                    rows={3}
                                />
                            </div>

                            <Button type="submit" disabled={submitting} className="w-full">
                                {submitting ? "جاري الإرسال..." : "إرسال التقييم"}
                                <Send className="w-4 h-4 mr-2" />
                            </Button>
                        </form>
                    </CardContent>
                </Card>

                {/* Reviews List */}
                <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
                    {loading ? (
                        <p className="text-muted-foreground text-center py-8">جاري التحميل...</p>
                    ) : reviews.length === 0 ? (
                        <div className="text-center py-8 text-muted-foreground bg-white rounded-xl border border-dashed">
                            <Star className="w-12 h-12 mx-auto mb-2 opacity-20" />
                            <p>لا توجد تقييمات بعد. كن أول من يقيم هذا المنتج!</p>
                        </div>
                    ) : (
                        reviews.map((review) => (
                            <div key={review.id} className="bg-white p-4 rounded-xl border shadow-sm">
                                <div className="flex justify-between items-start mb-2">
                                    <div className="flex items-center gap-3">
                                        <Avatar className="h-8 w-8">
                                            <AvatarFallback className="bg-primary/10 text-primary">
                                                <User className="w-4 h-4" />
                                            </AvatarFallback>
                                        </Avatar>
                                        <div>
                                            <p className="font-semibold text-sm">{review.user_name}</p>
                                            <div className="flex">
                                                {[...Array(5)].map((_, i) => (
                                                    <Star
                                                        key={i}
                                                        className={`w-3 h-3 ${i < review.rating ? "fill-yellow-400 text-yellow-400" : "text-gray-200"}`}
                                                    />
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                    <span className="text-xs text-muted-foreground">
                                        {format(new Date(review.created_at), "d MMMM yyyy", { locale: ar })}
                                    </span>
                                </div>
                                <p className="text-sm text-gray-700 leading-relaxed mt-2">{review.comment}</p>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
};
