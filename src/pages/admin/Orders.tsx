import { useState, useEffect } from "react";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Eye, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { format } from "date-fns";

interface Order {
    id: string;
    created_at: string;
    total_price: number;
    status: string;
    owner_id: string; // Changed from user_id to owner_id
    profiles?: {
        full_name?: string;
        username?: string;
    };
    // Add other fields if needed
}

export default function AdminOrders() {
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchOrders();
    }, []);

    const fetchOrders = async () => {
        setLoading(true);
        // Updated query to use owner_id for the join
        const { data, error } = await supabase
            .from("orders")
            .select("*, profiles:owner_id(full_name, username)")
            .order("created_at", { ascending: false });

        if (error) {
            toast.error("فشل في تحميل الطلبات");
            console.error(error);
        } else {
            // Ensure data matches Order interface
            const formattedData = (data || []).map((item: any) => ({
                ...item,
                profiles: Array.isArray(item.profiles) ? item.profiles[0] : item.profiles
            }));
            setOrders(formattedData as Order[]);
        }
        setLoading(false);
    };

    const handleStatusChange = async (orderId: string, newStatus: string) => {
        const { error } = await supabase
            .from("orders")
            .update({ status: newStatus })
            .eq("id", orderId);

        if (error) {
            toast.error("فشل في تحديث حالة الطلب");
        } else {
            toast.success("تم تحديث حالة الطلب");
            fetchOrders();
        }
    };

    return (
        <div className="p-8">
            <h1 className="text-3xl font-bold mb-8 text-primary">إدارة الطلبات</h1>

            <Card>
                <CardHeader>
                    <CardTitle>قائمة الطلبات</CardTitle>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>رقم الطلب</TableHead>
                                <TableHead>العميل</TableHead>
                                <TableHead>المبلغ</TableHead>
                                <TableHead>الحالة</TableHead>
                                <TableHead>التاريخ</TableHead>
                                <TableHead>الإجراءات</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {loading ? (
                                <TableRow>
                                    <TableCell colSpan={6} className="text-center py-8">
                                        <Loader2 className="h-8 w-8 animate-spin mx-auto" />
                                    </TableCell>
                                </TableRow>
                            ) : orders.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={6} className="text-center py-8">
                                        لا توجد طلبات
                                    </TableCell>
                                </TableRow>
                            ) : (
                                orders.map((order) => (
                                    <TableRow key={order.id}>
                                        <TableCell className="font-medium">#{order.id.slice(0, 8)}</TableCell>
                                        <TableCell>
                                            {order.profiles?.full_name || order.profiles?.username || "غير معروف"}
                                        </TableCell>
                                        <TableCell>{order.total_price} دج</TableCell>
                                        <TableCell>
                                            <Select
                                                defaultValue={order.status}
                                                onValueChange={(val) => handleStatusChange(order.id, val)}
                                            >
                                                <SelectTrigger className="w-[140px]">
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="pending">قيد الانتظار</SelectItem>
                                                    <SelectItem value="processing">قيد المعالجة</SelectItem>
                                                    <SelectItem value="shipped">تم الشحن</SelectItem>
                                                    <SelectItem value="delivered">تم التوصيل</SelectItem>
                                                    <SelectItem value="cancelled">ملغي</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </TableCell>
                                        <TableCell>{format(new Date(order.created_at), "yyyy-MM-dd")}</TableCell>
                                        <TableCell>
                                            <Button variant="ghost" size="icon">
                                                <Eye className="h-4 w-4" />
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    );
}
