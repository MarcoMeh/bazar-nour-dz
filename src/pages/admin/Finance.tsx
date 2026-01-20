import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { format } from "date-fns";
import { ar } from "date-fns/locale";
import { toast } from "sonner";
import { Loader2, TrendingDown, TrendingUp, Wallet, Plus, Trash2 } from "lucide-react";

interface Expense {
    id: string;
    title: string;
    amount: number;
    category: string;
    expense_date: string;
    notes?: string;
}

interface Revenue {
    id: string;
    amount: number;
    payment_date: string;
    days_added: number;
    notes?: string;
    stores: {
        name: string;
    } | null;
}

export default function AdminFinance() {
    const [loading, setLoading] = useState(true);
    const [expenses, setExpenses] = useState<Expense[]>([]);
    const [revenues, setRevenues] = useState<Revenue[]>([]);
    const [isAddOpen, setIsAddOpen] = useState(false);
    const [newExpense, setNewExpense] = useState({
        title: "",
        amount: "",
        category: "",
        notes: ""
    });

    useEffect(() => {
        fetchFinancialData();
    }, []);

    const fetchFinancialData = async () => {
        setLoading(true);
        try {
            // Fetch Revenues (Subscription Logs)
            const { data: revData, error: revError } = await supabase
                .from("subscription_logs")
                .select(`
                    id,
                    amount,
                    days_added,
                    payment_date,
                    notes,
                    stores ( name )
                `)
                .order("payment_date", { ascending: false });

            if (revError) throw revError;

            // Fetch Expenses
            const { data: expData, error: expError } = await supabase
                .from("expenses")
                .select("*")
                .order("expense_date", { ascending: false });

            if (expError) throw expError;

            setRevenues(revData as any[]);
            setExpenses(expData || []);

        } catch (error: any) {
            console.error("Error fetching finance data:", error);
            toast.error("فشل تحميل البيانات المالية");
        } finally {
            setLoading(false);
        }
    };

    const handleAddExpense = async () => {
        if (!newExpense.title || !newExpense.amount) {
            toast.error("يرجى إدخال العنوان والمبلغ");
            return;
        }

        try {
            const { error } = await supabase.from("expenses").insert({
                title: newExpense.title,
                amount: parseFloat(newExpense.amount),
                category: newExpense.category || "عام",
                notes: newExpense.notes
            });

            if (error) throw error;

            toast.success("تم إضافة المصروف بنجاح");
            setIsAddOpen(false);
            setNewExpense({ title: "", amount: "", category: "", notes: "" });
            fetchFinancialData();
        } catch (error: any) {
            console.error("Error adding expense:", error);
            toast.error("فشل إضافة المصروف");
        }
    };

    const handleDeleteExpense = async (id: string) => {
        if (!confirm("هل أنت متأكد من حذف هذا المصروف؟")) return;

        try {
            const { error } = await supabase.from("expenses").delete().eq("id", id);
            if (error) throw error;
            toast.success("تم حذف المصروف");
            fetchFinancialData();
        } catch (error: any) {
            console.error("Error deleting expense:", error);
            toast.error("فشل الحذف");
        }
    };

    // Calculations
    const totalRevenue = revenues.reduce((sum, rev) => sum + Number(rev.amount), 0);
    const totalExpenses = expenses.reduce((sum, exp) => sum + Number(exp.amount), 0);
    const netProfit = totalRevenue - totalExpenses;

    if (loading) {
        return <div className="flex justify-center items-center h-96"><Loader2 className="h-8 w-8 animate-spin" /></div>;
    }

    return (
        <div className="container py-8 space-y-8" dir="rtl">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold">الإدارة المالية</h1>
                <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
                    <DialogTrigger asChild>
                        <Button className="gap-2">
                            <Plus className="h-4 w-4" />
                            تسجيل مصروف
                        </Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>إضافة مصروف جديد</DialogTitle>
                            <DialogDescription>أدخل تفاصيل المصروف ليتم احتسابه في التقرير المالي.</DialogDescription>
                        </DialogHeader>
                        <div className="grid gap-4 py-4">
                            <div className="grid gap-2">
                                <Label>العنوان</Label>
                                <Input
                                    value={newExpense.title}
                                    onChange={(e) => setNewExpense({ ...newExpense, title: e.target.value })}
                                    placeholder="مثال: تكاليف سيرفر"
                                />
                            </div>
                            <div className="grid gap-2">
                                <Label>المبلغ (دج)</Label>
                                <Input
                                    type="number"
                                    value={newExpense.amount}
                                    onChange={(e) => setNewExpense({ ...newExpense, amount: e.target.value })}
                                    placeholder="0.00"
                                />
                            </div>
                            <div className="grid gap-2">
                                <Label>التصنيف</Label>
                                <Input
                                    value={newExpense.category}
                                    onChange={(e) => setNewExpense({ ...newExpense, category: e.target.value })}
                                    placeholder="تسويق، رواتب، صيانة..."
                                />
                            </div>
                            <div className="grid gap-2">
                                <Label>ملاحظات</Label>
                                <Input
                                    value={newExpense.notes}
                                    onChange={(e) => setNewExpense({ ...newExpense, notes: e.target.value })}
                                />
                            </div>
                        </div>
                        <DialogFooter>
                            <Button onClick={handleAddExpense}>حفظ</Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>

            {/* Summary Cards */}
            <div className="grid gap-4 md:grid-cols-3">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">إجمالي الإيرادات</CardTitle>
                        <TrendingUp className="h-4 w-4 text-green-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-green-600">{totalRevenue.toLocaleString()} دج</div>
                        <p className="text-xs text-muted-foreground">من الاشتراكات</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">إجمالي المصاريف</CardTitle>
                        <TrendingDown className="h-4 w-4 text-red-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-red-600">{totalExpenses.toLocaleString()} دج</div>
                        <p className="text-xs text-muted-foreground">مصاريف تشغيلية</p>
                    </CardContent>
                </Card>

                <Card className={netProfit >= 0 ? "bg-green-50/50 border-green-200" : "bg-red-50/50 border-red-200"}>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">صافي الربح</CardTitle>
                        <Wallet className={`h-4 w-4 ${netProfit >= 0 ? "text-green-600" : "text-red-600"}`} />
                    </CardHeader>
                    <CardContent>
                        <div className={`text-2xl font-bold ${netProfit >= 0 ? "text-green-700" : "text-red-700"}`}>
                            {netProfit.toLocaleString()} دج
                        </div>
                        <p className="text-xs text-muted-foreground">الإيرادات - المصاريف</p>
                    </CardContent>
                </Card>
            </div>

            {/* Tabs */}
            <Tabs defaultValue="revenues" className="space-y-4">
                <TabsList>
                    <TabsTrigger value="revenues">سجل الإيرادات (الاشتراكات)</TabsTrigger>
                    <TabsTrigger value="expenses">سجل المصاريف</TabsTrigger>
                    <TabsTrigger value="monthly">التقرير الشهري</TabsTrigger>
                </TabsList>

                <TabsContent value="revenues">
                    <Card>
                        <CardHeader>
                            <CardTitle>تفاصيل الإيرادات</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead className="text-right">المتجر</TableHead>
                                        <TableHead className="text-right">المبلغ</TableHead>
                                        <TableHead className="text-right">المدة المضافة</TableHead>
                                        <TableHead className="text-right">التاريخ</TableHead>
                                        <TableHead className="text-right">ملاحظات</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {revenues.map((rev) => (
                                        <TableRow key={rev.id}>
                                            <TableCell className="font-medium">{rev.stores?.name || "غير معروف"}</TableCell>
                                            <TableCell className="text-green-600 font-bold">+{Number(rev.amount).toLocaleString()} دج</TableCell>
                                            <TableCell>{rev.days_added} يوم</TableCell>
                                            <TableCell>{format(new Date(rev.payment_date), "dd MMMM yyyy", { locale: ar })}</TableCell>
                                            <TableCell className="text-muted-foreground">{rev.notes || "-"}</TableCell>
                                        </TableRow>
                                    ))}
                                    {revenues.length === 0 && (
                                        <TableRow>
                                            <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                                                لا توجد بيانات
                                            </TableCell>
                                        </TableRow>
                                    )}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="expenses">
                    <Card>
                        <CardHeader>
                            <CardTitle>تفاصيل المصاريف</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead className="text-right">العنوان</TableHead>
                                        <TableHead className="text-right">التصنيف</TableHead>
                                        <TableHead className="text-right">المبلغ</TableHead>
                                        <TableHead className="text-right">التاريخ</TableHead>
                                        <TableHead className="text-right">ملاحظات</TableHead>
                                        <TableHead className="text-right">إجراءات</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {expenses.map((exp) => (
                                        <TableRow key={exp.id}>
                                            <TableCell className="font-medium">{exp.title}</TableCell>
                                            <TableCell><span className="bg-slate-100 px-2 py-1 rounded text-xs">{exp.category}</span></TableCell>
                                            <TableCell className="text-red-600 font-bold">-{Number(exp.amount).toLocaleString()} دج</TableCell>
                                            <TableCell>{format(new Date(exp.expense_date), "dd MMMM yyyy", { locale: ar })}</TableCell>
                                            <TableCell className="text-muted-foreground">{exp.notes || "-"}</TableCell>
                                            <TableCell>
                                                <Button variant="ghost" size="icon" className="text-destructive" onClick={() => handleDeleteExpense(exp.id)}>
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                    {expenses.length === 0 && (
                                        <TableRow>
                                            <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                                                لا توجد مصاريف مسجلة
                                            </TableCell>
                                        </TableRow>
                                    )}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                </TabsContent>
                <TabsContent value="monthly">
                    <Card>
                        <CardHeader>
                            <CardTitle>التقرير المالي الشهري</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead className="text-right">الشهر</TableHead>
                                        <TableHead className="text-right">الإيرادات</TableHead>
                                        <TableHead className="text-right">المصاريف</TableHead>
                                        <TableHead className="text-right">الصافي</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {Object.entries(
                                        [...revenues.map(r => ({ date: r.payment_date, amount: r.amount, type: 'rev' })),
                                        ...expenses.map(e => ({ date: e.expense_date, amount: e.amount, type: 'exp' }))]
                                            .reduce((acc: any, item) => {
                                                const monthKey = format(new Date(item.date), "MMMM yyyy", { locale: ar });
                                                if (!acc[monthKey]) acc[monthKey] = { rev: 0, exp: 0 };
                                                if (item.type === 'rev') acc[monthKey].rev += Number(item.amount);
                                                else acc[monthKey].exp += Number(item.amount);
                                                return acc;
                                            }, {})
                                    ).sort((a, b) => new Date(b[0]).getTime() - new Date(a[0]).getTime()).map(([month, data]: [string, any]) => (
                                        <TableRow key={month}>
                                            <TableCell className="font-bold">{month}</TableCell>
                                            <TableCell className="text-green-600">{data.rev.toLocaleString()} دج</TableCell>
                                            <TableCell className="text-red-600">{data.exp.toLocaleString()} دج</TableCell>
                                            <TableCell className={data.rev - data.exp >= 0 ? "text-green-700 font-black" : "text-red-700 font-black"}>
                                                {(data.rev - data.exp).toLocaleString()} دج
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
}
