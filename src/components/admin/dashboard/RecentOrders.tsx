import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { ar } from "date-fns/locale";

interface RecentOrdersProps {
    orders: any[];
}

export function RecentOrders({ orders }: RecentOrdersProps) {
    const getStatusBadgeVariant = (status: string) => {
        switch (status) {
            case 'delivered': return 'default'; // Using default (primary) for successish state if 'success' not available in standard badge
            case 'cancelled': return 'destructive';
            case 'processing': return 'secondary';
            case 'shipped': return 'secondary';
            default: return 'outline';
        }
    };

    const getStatusLabel = (status: string) => {
        const labels: Record<string, string> = {
            pending: 'قيد الانتظار',
            processing: 'قيد المعالجة',
            shipped: 'تم الشحن',
            delivered: 'تم التوصيل',
            cancelled: 'ملغي'
        };
        return labels[status] || status;
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle>أحدث الطلبات</CardTitle>
            </CardHeader>
            <CardContent>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>رقم الطلب</TableHead>
                            <TableHead>العميل</TableHead>
                            <TableHead>الحالة</TableHead>
                            <TableHead>السعر الإجمالي</TableHead>
                            <TableHead className="text-left">التاريخ</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {orders.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                                    لا توجد طلبات حديثة
                                </TableCell>
                            </TableRow>
                        ) : (
                            orders.map((order) => (
                                <TableRow key={order.id}>
                                    <TableCell className="font-medium">#{order.id.slice(0, 8)}</TableCell>
                                    <TableCell>{order.profiles?.full_name || 'زائر'}</TableCell>
                                    <TableCell>
                                        <Badge variant={getStatusBadgeVariant(order.status)}>
                                            {getStatusLabel(order.status)}
                                        </Badge>
                                    </TableCell>
                                    <TableCell>{order.total_price.toLocaleString()} دج</TableCell>
                                    <TableCell className="text-left text-muted-foreground">
                                        {format(new Date(order.created_at), "dd MMMM yyyy", { locale: ar })}
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
    );
}
