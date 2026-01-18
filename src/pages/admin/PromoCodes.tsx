import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { Plus, Trash2, Check, X, Loader2, Tags, User, Phone, DollarSign } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface PromoCode {
    id: string;
    code: string;
    influencer_name: string;
    influencer_phone: string;
    discount_price: number;
    is_active: boolean;
    created_at: string;
}

const PromoCodes = () => {
    const [codes, setCodes] = useState<PromoCode[]>([]);
    const [loading, setLoading] = useState(true);
    const [adding, setAdding] = useState(false);
    const [newCode, setNewCode] = useState({
        code: "",
        influencer_name: "",
        influencer_phone: "",
        discount_price: 2000,
    });

    useEffect(() => {
        fetchCodes();
    }, []);

    const fetchCodes = async () => {
        setLoading(true);
        try {
            const { data, error } = await supabase
                .from("promo_codes")
                .select("*")
                .order("created_at", { ascending: false });

            if (error) throw error;
            setCodes(data || []);
        } catch (error) {
            console.error("Error fetching promo codes:", error);
            toast.error("حدث خطأ أثناء تحميل الأكواد");
        } finally {
            setLoading(false);
        }
    };

    const handleAddCode = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newCode.code || !newCode.influencer_name) {
            toast.error("الرجاء ملء الحقول المطلوبة");
            return;
        }

        setAdding(true);
        try {
            const { error } = await supabase
                .from("promo_codes")
                .insert([{
                    code: newCode.code.toUpperCase(),
                    influencer_name: newCode.influencer_name,
                    influencer_phone: newCode.influencer_phone,
                    discount_price: newCode.discount_price,
                    is_active: true
                }]);

            if (error) throw error;

            toast.success("تم إضافة الكود بنجاح");
            setNewCode({ code: "", influencer_name: "", influencer_phone: "", discount_price: 2000 });
            fetchCodes();
        } catch (error: any) {
            if (error.code === "23505") {
                toast.error("هذا الكود موجود بالفعل");
            } else {
                toast.error("حدث خطأ أثناء إضافة الكود");
            }
        } finally {
            setAdding(false);
        }
    };

    const toggleStatus = async (id: string, currentStatus: boolean) => {
        try {
            const { error } = await supabase
                .from("promo_codes")
                .update({ is_active: !currentStatus })
                .eq("id", id);

            if (error) throw error;
            fetchCodes();
        } catch (error) {
            toast.error("حدث خطأ أثناء تحديث الحالة");
        }
    };

    const deleteCode = async (id: string) => {
        if (!confirm("هل أنت متأكد من حذف هذا الكود؟")) return;

        try {
            const { error } = await supabase
                .from("promo_codes")
                .delete()
                .eq("id", id);

            if (error) throw error;
            toast.success("تم حذف الكود");
            fetchCodes();
        } catch (error) {
            toast.error("حدث خطأ أثناء حذف الكود");
        }
    };

    return (
        <div className="p-6 space-y-8 animate-in fade-in duration-500">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-black text-gray-900 flex items-center gap-3">
                        <Tags className="w-8 h-8 text-primary" />
                        إدارة أكواد البرومو
                    </h1>
                    <p className="text-muted-foreground mt-1 font-medium">관리 및 생성 أكواد التخفيض للمؤثرين</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Add New Code Form */}
                <Card className="lg:col-span-1 shadow-xl border-2 border-primary/10 h-fit sticky top-6">
                    <CardHeader>
                        <CardTitle className="text-xl font-bold flex items-center gap-2">
                            <Plus className="w-5 h-5 text-primary" />
                            إضافة كود جديد
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleAddCode} className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="code">الكود (Code)</Label>
                                <Input
                                    id="code"
                                    placeholder="مثلاً: MIRA2026"
                                    value={newCode.code}
                                    onChange={(e) => setNewCode({ ...newCode, code: e.target.value.toUpperCase() })}
                                    className="font-black tracking-widest uppercase border-2 focus:border-primary"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="influencer">اسم المؤثر</Label>
                                <div className="relative">
                                    <User className="absolute right-3 top-3 h-4 w-4 text-muted-foreground" />
                                    <Input
                                        id="influencer"
                                        placeholder="الاسم الكامل"
                                        value={newCode.influencer_name}
                                        onChange={(e) => setNewCode({ ...newCode, influencer_name: e.target.value })}
                                        className="pr-9"
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="phone">رقم هاتف المؤثر</Label>
                                <div className="relative">
                                    <Phone className="absolute right-3 top-3 h-4 w-4 text-muted-foreground" />
                                    <Input
                                        id="phone"
                                        placeholder="0555xxxxxx"
                                        value={newCode.influencer_phone}
                                        onChange={(e) => setNewCode({ ...newCode, influencer_phone: e.target.value })}
                                        className="pr-9"
                                        dir="ltr"
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="price">السعر بعد التخفيض (دج)</Label>
                                <div className="relative">
                                    <DollarSign className="absolute right-3 top-3 h-4 w-4 text-muted-foreground" />
                                    <Input
                                        id="price"
                                        type="number"
                                        value={newCode.discount_price}
                                        onChange={(e) => setNewCode({ ...newCode, discount_price: Number(e.target.value) })}
                                        className="pr-9"
                                    />
                                </div>
                            </div>
                            <Button type="submit" className="w-full font-bold h-12" disabled={adding}>
                                {adding ? <Loader2 className="w-5 h-5 animate-spin" /> : "إضافة الكود"}
                            </Button>
                        </form>
                    </CardContent>
                </Card>

                {/* Codes List */}
                <div className="lg:col-span-2 space-y-4">
                    {loading ? (
                        <div className="flex justify-center p-12">
                            <Loader2 className="w-10 h-10 animate-spin text-primary" />
                        </div>
                    ) : codes.length === 0 ? (
                        <Card className="p-12 text-center bg-muted/30 border-dashed border-2">
                            <Tags className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-20" />
                            <p className="text-muted-foreground font-bold">لا توجد أكواد برومو حالياً</p>
                        </Card>
                    ) : (
                        <div className="grid grid-cols-1 gap-4">
                            <AnimatePresence>
                                {codes.map((code) => (
                                    <motion.div
                                        key={code.id}
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, scale: 0.95 }}
                                    >
                                        <Card className={`overflow-hidden border-2 transition-all ${code.is_active ? 'border-green-100 hover:border-green-200' : 'border-slate-100 opacity-75 grayscale'}`}>
                                            <div className="flex flex-col md:flex-row items-center md:items-stretch h-full">
                                                {/* Code Badge */}
                                                <div className={`p-6 flex flex-col items-center justify-center min-w-[150px] ${code.is_active ? 'bg-green-50 text-green-700' : 'bg-slate-50 text-slate-500'}`}>
                                                    <span className="text-2xl font-black tracking-widest uppercase">{code.code}</span>
                                                    <span className="text-[10px] uppercase font-bold mt-1 opacity-60">كود الخصم</span>
                                                </div>

                                                {/* Info */}
                                                <div className="flex-1 p-6 space-y-3">
                                                    <div className="flex items-center justify-between">
                                                        <h3 className="text-xl font-black text-gray-900">{code.influencer_name}</h3>
                                                        <span className={`px-3 py-1 rounded-full text-xs font-bold ${code.is_active ? 'bg-green-500 text-white' : 'bg-slate-400 text-white'}`}>
                                                            {code.is_active ? "نشط" : "متوقف"}
                                                        </span>
                                                    </div>
                                                    <div className="flex flex-wrap gap-4 text-sm text-gray-600 font-medium">
                                                        <div className="flex items-center gap-1.5">
                                                            <Phone className="w-4 h-4 text-primary/60" />
                                                            <span dir="ltr">{code.influencer_phone || "لا يوجد رقم"}</span>
                                                        </div>
                                                        <div className="flex items-center gap-1.5">
                                                            <DollarSign className="w-4 h-4 text-green-600" />
                                                            <span>السعر الجديد: <span className="font-black text-green-700">{code.discount_price.toLocaleString()} دج</span></span>
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Actions */}
                                                <div className="border-t md:border-t-0 md:border-r border-slate-100 p-4 flex md:flex-col gap-2 bg-slate-50/30">
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        onClick={() => toggleStatus(code.id, code.is_active)}
                                                        className={`h-10 w-10 rounded-xl ${code.is_active ? 'text-amber-600 hover:bg-amber-100 hover:text-amber-700' : 'text-green-600 hover:bg-green-100 hover:text-green-700'}`}
                                                    >
                                                        {code.is_active ? <X className="h-5 w-5" /> : <Check className="h-5 w-5" />}
                                                    </Button>
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        onClick={() => deleteCode(code.id)}
                                                        className="h-10 w-10 rounded-xl text-red-500 hover:bg-red-50 hover:text-red-600"
                                                    >
                                                        <Trash2 className="h-5 w-5" />
                                                    </Button>
                                                </div>
                                            </div>
                                        </Card>
                                    </motion.div>
                                ))}
                            </AnimatePresence>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default PromoCodes;
