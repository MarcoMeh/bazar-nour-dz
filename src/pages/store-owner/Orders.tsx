import React, { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
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
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Eye, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const OrdersTable = ({ orders, onView, getStatusBadge }: { orders: any[], onView: (order: any) => void, getStatusBadge: (status: string) => React.ReactNode }) => (
    <Table>
        <TableHeader>
            <TableRow>
                <TableHead>رقم الطلب</TableHead>
                <TableHead>العميل</TableHead>
                <TableHead>التاريخ</TableHead>
                <TableHead>الحالة</TableHead>
                <TableHead>الإجراءات</TableHead>
            </TableRow>
        </TableHeader>
        <TableBody>
            {orders.length === 0 ? (
                <TableRow>
                    <TableCell colSpan={5} className="text-center py-8">
                        لا توجد طلبات في هذه القائمة
                    </TableCell>
                </TableRow>
            ) : (
                orders.map((order) => (
                    <TableRow key={order.id}>
                        <TableCell className="font-medium">#{order.id.slice(0, 8)}</TableCell>
                        <TableCell>{order.full_name || order.profiles?.full_name || "غير معروف"}</TableCell>
                        <TableCell>{format(new Date(order.created_at), "yyyy-MM-dd")}</TableCell>
                        <TableCell>{getStatusBadge(order.status)}</TableCell>
                        <TableCell>
                            <Button variant="ghost" size="icon" onClick={() => onView(order)}>
                                <Eye className="h-4 w-4" />
                            </Button>
                        </TableCell>
                    </TableRow>
                ))
            )}
        </TableBody>
    </Table>
);

export default function StoreOwnerOrders() {
    const [orders, setOrders] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedOrder, setSelectedOrder] = useState<any>(null);
    const [orderItems, setOrderItems] = useState<any[]>([]);
    const [loadingItems, setLoadingItems] = useState(false);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [storeId, setStoreId] = useState<string | null>(null);

    useEffect(() => {
        fetchStoreId();
    }, []);

    useEffect(() => {
        if (storeId) {
            fetchOrders();
        }
    }, [storeId]);

    const fetchStoreId = async () => {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const { data: profile } = await supabase
            .from("profiles")
            .select("store_id")
            .eq("id", user.id)
            .single();

        const id = (profile as any)?.store_id;
        setStoreId(id || null);

        if (!id) {
            setLoading(false);
        }
    };

    const fetchOrders = async () => {
        if (!storeId) return;
        setLoading(true);
        try {
            // Get orders for this store using the RPC function
            const { data: storeOrders, error: storeError } = await supabase
                .rpc('get_store_orders', { p_store_id: storeId });

            if (storeError) throw storeError;

            if (!storeOrders || storeOrders.length === 0) {
                setOrders([]);
                setLoading(false);
                return;
            }

            const orderIds = storeOrders.map((o: any) => o.id);

            // Fetch full order details
            const { data, error } = await supabase
                .from("orders")
                .select("*, profiles:user_id(full_name), wilayas(name)")
                .in('id', orderIds)
                .order("created_at", { ascending: false });

            if (error) throw error;
            setOrders(data || []);
        } catch (error: any) {
            console.error("Error fetching orders:", error);
            toast.error("فشل تحميل الطلبات");
        } finally {
            setLoading(false);
        }
    };

    const handleViewOrder = async (order: any) => {
        setSelectedOrder(order);
        setIsDialogOpen(true);
        setLoadingItems(true);

        try {
            // Fetch items for this order AND this store
            const { data, error } = await supabase
                .from("order_items")
                .select("*, products(name, image_url, store_id)")
                .eq("order_id", order.id);

            if (error) throw error;

            // Filter items to show ONLY products from this store
            const storeItems = data.filter((item: any) => item.products?.store_id === storeId);

            // Format items
            const formattedItems = storeItems.map((item: any) => ({
                ...item,
                products: Array.isArray(item.products) ? item.products[0] : item.products
            }));

            setOrderItems(formattedItems);
        } catch (error) {
            console.error("Error fetching items:", error);
            toast.error("فشل تحميل تفاصيل الطلب");
        } finally {
            setLoadingItems(false);
        }
    };

    const getStatusBadge = (status: string) => {
        const styles: Record<string, string> = {
            pending: "bg-yellow-100 text-yellow-800",
            processing: "bg-blue-100 text-blue-800",
            shipped: "bg-purple-100 text-purple-800",
            delivered: "bg-green-100 text-green-800",
            cancelled: "bg-red-100 text-red-800",
        };

        const labels: Record<string, string> = {
            pending: "قيد الانتظار",
            processing: "قيد المعالجة",
            shipped: "تم الشحن",
            delivered: "تم التوصيل",
            cancelled: "ملغي",
        };

        return (
            <Badge variant="outline" className={`${styles[status] || "bg-gray-100"} border-0`}>
                {labels[status] || status}
            </Badge>
        );
    };

    if (loading && !orders.length) {
        return <LoadingSpinner fullScreen message="جاري تحميل الطلبات..." />;
    }

    if (!storeId) {
        return (
            <Card className="p-8 text-center">
                <p className="text-muted-foreground">لا يوجد محل مرتبط بحسابك</p>
            </Card>
        );
    }

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold">الطلبات</h1>
                <p className="text-muted-foreground mt-1">عرض ومتابعة طلبات منتجاتك</p>
            </div>

            <Tabs defaultValue="active" className="w-full">
                <TabsList className="grid w-full grid-cols-2 mb-8">
                    <TabsTrigger value="active">الطلبات الجارية</TabsTrigger>
                    <TabsTrigger value="history">سجل الطلبات</TabsTrigger>
                </TabsList>

                <TabsContent value="active">
                    <Card>
                        <CardHeader>
                            <CardTitle>الطلبات الجارية</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <OrdersTable
                                orders={orders.filter(o => ['pending', 'processing', 'shipped'].includes(o.status))}
                                onView={handleViewOrder}
                                getStatusBadge={getStatusBadge}
                            />
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="history">
                    <Card>
                        <CardHeader>
                            <CardTitle>سجل الطلبات السابقة</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <OrdersTable
                                orders={orders.filter(o => ['delivered', 'cancelled'].includes(o.status))}
                                onView={handleViewOrder}
                                getStatusBadge={getStatusBadge}
                            />
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>

            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>تفاصيل الطلب #{selectedOrder?.id?.slice(0, 8)}</DialogTitle>
                    </DialogHeader>

                    {selectedOrder && (
                        <div className="space-y-6">
                            {/* Customer Info */}
                            <div className="grid grid-cols-2 gap-4 bg-muted/30 p-4 rounded-lg">
                                <div>
                                    <p className="text-sm text-muted-foreground">العميل</p>
                                    <p className="font-medium">{selectedOrder.full_name}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-muted-foreground">رقم الهاتف</p>
                                    <p className="font-medium">{selectedOrder.phone}</p>
                                </div>
                                <div className="col-span-2">
                                    <p className="text-sm text-muted-foreground">العنوان</p>
                                    <p className="font-medium">{selectedOrder.address}, {selectedOrder.wilayas?.name}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-muted-foreground">طريقة التوصيل</p>
                                    <p className="font-medium">
                                        {selectedOrder.delivery_option === 'home' ? 'توصيل للمنزل' : 'استلام من المكتب'}
                                    </p>
                                </div>
                            </div>

                            {/* Order Items */}
                            <div>
                                <h3 className="font-bold mb-4">منتجاتك في هذا الطلب</h3>
                                {loadingItems ? (
                                    <div className="flex justify-center py-8">
                                        <Loader2 className="h-8 w-8 animate-spin" />
                                    </div>
                                ) : (
                                    <Table>
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead>المنتج</TableHead>
                                                <TableHead>الخصائص</TableHead>
                                                <TableHead>الكمية</TableHead>
                                                <TableHead>السعر</TableHead>
                                                <TableHead>الإجمالي</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {orderItems.length === 0 ? (
                                                <TableRow>
                                                    <TableCell colSpan={5} className="text-center">لا توجد منتجات لك في هذا الطلب</TableCell>
                                                </TableRow>
                                            ) : (
                                                orderItems.map((item) => (
                                                    <TableRow key={item.id}>
                                                        <TableCell>
                                                            <div className="flex items-center gap-3">
                                                                {item.products?.image_url && (
                                                                    <img
                                                                        src={item.products.image_url}
                                                                        alt={item.products.name}
                                                                        className="w-10 h-10 object-cover rounded"
                                                                    />
                                                                )}
                                                                <span className="font-medium">{item.products?.name || "منتج محذوف"}</span>
                                                            </div>
                                                        </TableCell>
                                                        <TableCell>
                                                            <div className="flex flex-col gap-1 text-sm">
                                                                {item.selected_color && (
                                                                    <span className="flex items-center gap-1">
                                                                        اللون: <span className="w-3 h-3 rounded-full border" style={{ backgroundColor: item.selected_color }}></span>
                                                                    </span>
                                                                )}
                                                                {item.selected_size && <span>المقاس: {item.selected_size}</span>}
                                                            </div>
                                                        </TableCell>
                                                        <TableCell>{item.quantity}</TableCell>
                                                        <TableCell>{item.price} دج</TableCell>
                                                        <TableCell className="font-bold">{item.price * item.quantity} دج</TableCell>
                                                    </TableRow>
                                                ))
                                            )}
                                        </TableBody>
                                    </Table>
                                )}
                            </div>
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </div>
    );
}
