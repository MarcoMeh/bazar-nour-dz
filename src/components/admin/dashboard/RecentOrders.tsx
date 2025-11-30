import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

interface RecentOrder {
    id: string;
    created_at: string;
    total_price: number;
    status: string;
    full_name?: string;
    profiles?: { full_name: string } | null;
}

interface RecentOrdersProps {
    orders: RecentOrder[];
}

export function RecentOrders({ orders }: RecentOrdersProps) {
    const getStatusColor = (status: string) => {
        switch (status) {
            case "pending": return "bg-yellow-100 text-yellow-800 hover:bg-yellow-100";
            case "processing": return "bg-blue-100 text-blue-800 hover:bg-blue-100";
            case "shipped": return "bg-purple-100 text-purple-800 hover:bg-purple-100";
            case "delivered": return "bg-green-100 text-green-800 hover:bg-green-100";
            case "cancelled": return "bg-red-100 text-red-800 hover:bg-red-100";
            default: return "bg-gray-100 text-gray-800 hover:bg-gray-100";
        }
    };

    const getStatusLabel = (status: string) => {
        switch (status) {
            case "pending": return "قيد الانتظار";
            case "processing": return "قيد المعالجة";
            case "shipped": return "تم الشحن";
            case "delivered": return "تم التوصيل";
            case "cancelled": return "ملغي";
            default: return status;
        }
    };

    return (
        <Card className="col-span-4">
            <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>آخر الطلبات</CardTitle>
                <Link to="/admin/orders" className="text-sm text-primary hover:underline flex items-center gap-1">
                    عرض الكل <ArrowLeft className="h-4 w-4" />
                </Link>
            </CardHeader>
            <CardContent>
                <div className="space-y-8">
                    {orders.length === 0 ? (
                        <p className="text-center text-muted-foreground py-4">لا توجد طلبات حديثة</p>
                    ) : (
                        orders.map((order) => (
                            <div key={order.id} className="flex items-center">
                                <Avatar className="h-9 w-9">
                                    <AvatarImage src={`https://api.dicebear.com/7.x/initials/svg?seed=${order.full_name || order.profiles?.full_name || 'User'}`} alt="Avatar" />
                                    <AvatarFallback>OM</AvatarFallback>
                                </Avatar>
                                <div className="mr-4 space-y-1">
                                    <p className="text-sm font-medium leading-none">{order.full_name || order.profiles?.full_name || "عميل غير معروف"}</p>
                                    <p className="text-xs text-muted-foreground">
                                        {format(new Date(order.created_at), "yyyy-MM-dd HH:mm")}
                                    </p>
                                </div>
                                <div className="mr-auto font-medium flex flex-col items-end gap-1">
                                    <span>{order.total_price} دج</span>
                                    <Badge variant="outline" className={getStatusColor(order.status)}>
                                        {getStatusLabel(order.status)}
                                    </Badge>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </CardContent>
        </Card>
    );
}
