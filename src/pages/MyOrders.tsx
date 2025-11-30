import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, Package, ShoppingBag } from "lucide-react";
import { format } from "date-fns";
import { ar } from "date-fns/locale";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

interface OrderItem {
    id: string;
    quantity: number;
    price: number;
    selected_color?: string;
    selected_size?: string;
    products?: {
        name: string;
        image_url?: string;
    };
}

interface Order {
    id: string;
    created_at: string;
    total_price: number;
    status: string;
    order_items: OrderItem[];
}

export default function MyOrders() {
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchOrders();
    }, []);

    const fetchOrders = async () => {
        try {
            const { data: { user } } = await supabase.auth.getUser();

            if (!user) return;

            const { data, error } = await supabase
                .from("orders")
                .select(`
                    id,
                    created_at,
                    total_price,
                    status,
                    order_items (
                        id,
                        quantity,
                        price,
                        selected_color,
                        selected_size,
                        products (
                            name,
                            image_url
                        )
                    )
                `)
                .eq("user_id", user.id)
                .order("created_at", { ascending: false });

            if (error) throw error;

            // Transform data to match interface if needed, or just cast if structure matches
            // The query returns order_items with nested products. 
            // We need to ensure the type matches what we use in render.
            setOrders(data as any || []);
        } catch (error) {
            console.error("Error fetching orders:", error);
        } finally {
            setLoading(false);
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case "pending": return "bg-yellow-500";
            case "processing": return "bg-blue-500";
            case "shipped": return "bg-purple-500";
            case "delivered": return "bg-green-500";
            case "cancelled": return "bg-red-500";
            default: return "bg-gray-500";
        }
    };

    const getStatusText = (status: string) => {
        switch (status) {
            case "pending": return "قيد الانتظار";
            case "processing": return "جاري التجهيز";
            case "shipped": return "تم الشحن";
            case "delivered": return "تم التوصيل";
            case "cancelled": return "ملغي";
            default: return status;
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <div className="container py-8 min-h-screen">
            <h1 className="text-3xl font-bold mb-8 flex items-center gap-2">
                <ShoppingBag className="h-8 w-8" />
                طلباتي
            </h1>

            {orders.length === 0 ? (
                <div className="text-center py-16 bg-muted/30 rounded-lg border-2 border-dashed">
                    <Package className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
                    <h2 className="text-xl font-semibold mb-2">لا توجد طلبات حتى الآن</h2>
                    <p className="text-muted-foreground mb-6">لم تقم بإجراء أي طلب بعد.</p>
                    <Button asChild>
                        <Link to="/products">تصفح المنتجات</Link>
                    </Button>
                </div>
            ) : (
                <div className="space-y-6">
                    {orders.map((order) => (
                        <Card key={order.id} className="overflow-hidden">
                            <CardHeader className="bg-muted/50 flex flex-row items-center justify-between p-4 sm:p-6">
                                <div className="space-y-1">
                                    <CardTitle className="text-lg">
                                        طلب #{order.id.slice(0, 8)}
                                    </CardTitle>
                                    <p className="text-sm text-muted-foreground">
                                        {format(new Date(order.created_at), "PPP p", { locale: ar })}
                                    </p>
                                </div>
                                <div className="flex flex-col items-end gap-2">
                                    <Badge className={`${getStatusColor(order.status)} hover:${getStatusColor(order.status)}`}>
                                        {getStatusText(order.status)}
                                    </Badge>
                                    <span className="font-bold text-lg">
                                        {order.total_price} دج
                                    </span>
                                </div>
                            </CardHeader>
                            <CardContent className="p-4 sm:p-6">
                                <div className="space-y-4">
                                    {order.order_items.map((item) => (
                                        <div key={item.id} className="flex justify-between items-center border-b last:border-0 pb-4 last:pb-0">
                                            <div className="flex items-center gap-4">
                                                {item.products?.image_url && (
                                                    <img
                                                        src={item.products.image_url}
                                                        alt={item.products.name}
                                                        className="w-16 h-16 object-cover rounded-md"
                                                    />
                                                )}
                                                <div>
                                                    <p className="font-medium">{item.products?.name || "منتج غير متوفر"}</p>
                                                    <div className="text-sm text-muted-foreground flex gap-2">
                                                        {item.selected_color && (
                                                            <span className="flex items-center gap-1">
                                                                اللون: <span className="w-3 h-3 rounded-full border" style={{ backgroundColor: item.selected_color }}></span>
                                                            </span>
                                                        )}
                                                        {item.selected_size && <span>المقاس: {item.selected_size}</span>}
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="text-left">
                                                <p className="font-medium">{item.price} دج</p>
                                                <p className="text-sm text-muted-foreground">الكمية: {item.quantity}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
}
