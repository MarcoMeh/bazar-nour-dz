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
import { Eye, Loader2, Trash2, CheckCircle } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ConfirmDialog } from "@/components/ConfirmDialog";

interface OrdersTableProps {
    orders: any[];
    onView: (order: any) => void;
    onDelete: (orderId: string) => void;
    onConfirmDelivery: (orderId: string) => void;
    getStatusBadge: (status: string) => React.ReactNode;
}

const OrdersTable = ({ orders, onView, onDelete, onConfirmDelivery, getStatusBadge }: OrdersTableProps) => (
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
                            <div className="flex gap-1">
                                <Button variant="ghost" size="icon" onClick={() => onView(order)} title="عرض التفاصيل">
                                    <Eye className="h-4 w-4" />
                                </Button>
                                {order.status !== 'delivered' && order.status !== 'cancelled' && (
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="text-green-600 hover:text-green-700 hover:bg-green-50"
                                        onClick={() => onConfirmDelivery(order.id)}
                                        title="تأكيد الوصول والدفع"
                                    >
                                        <CheckCircle className="h-4 w-4" />
                                    </Button>
                                )}
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="text-destructive hover:text-destructive hover:bg-destructive/10"
                                    onClick={() => onDelete(order.id)}
                                    title="حذف الطلب"
                                >
                                    <Trash2 className="h-4 w-4" />
                                </Button>
                            </div>
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
    const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
    const [orderToDelete, setOrderToDelete] = useState<string | null>(null);

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

        const { data: store } = await supabase
            .from("stores")
            .select("id")
            .eq("owner_id", user.id)
            .single();

        const id = store?.id;
        setStoreId(id || null);

        if (!id) {
            setLoading(false);
        }
    };

    const fetchOrders = async () => {
        if (!storeId) return;
        setLoading(true);
        try {
            console.log("=== DEBUG Store Orders ===");
            console.log("Looking for orders with store_id:", storeId);

            // Query orders where:
            // 1. store_id equals this storeId (single-store orders)
            // 2. OR store_ids array contains this storeId (multi-store orders)

            // First, get orders where store_id matches directly
            const { data: directOrders, error: directError } = await supabase
                .from("orders")
                .select("*, profiles:user_id(full_name), wilayas(name)")
                .eq('store_id', storeId)
                .order("created_at", { ascending: false });

            if (directError) throw directError;

            // Second, get orders where store_ids array contains this storeId
            const { data: arrayOrders, error: arrayError } = await supabase
                .from("orders")
                .select("*, profiles:user_id(full_name), wilayas(name)")
                .contains('store_ids', [storeId])
                .order("created_at", { ascending: false });

            if (arrayError) throw arrayError;

            // Merge and deduplicate orders by ID
            const allOrders = [...(directOrders || []), ...(arrayOrders || [])];
            const uniqueOrders = allOrders.reduce((acc: any[], order) => {
                if (!acc.find(o => o.id === order.id)) {
                    acc.push(order);
                }
                return acc;
            }, []);

            // Sort by created_at descending
            uniqueOrders.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

            console.log("Direct orders found:", directOrders?.length || 0);
            console.log("Array orders found:", arrayOrders?.length || 0);
            console.log("Total unique orders:", uniqueOrders.length);

            setOrders(uniqueOrders);
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
            // Fetch all items for this order (since this is the store's order)
            const { data, error } = await supabase
                .from("order_items")
                .select("*, products(name, image_url)")
                .eq("order_id", order.id);

            if (error) throw error;

            console.log("Order items:", data);

            // Format items - show all items since order belongs to this store
            const formattedItems = (data || []).map((item: any) => ({
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

    const handleDeleteClick = (orderId: string) => {
        setOrderToDelete(orderId);
        setDeleteConfirmOpen(true);
    };

    const confirmDelete = async () => {
        if (!orderToDelete) return;

        try {
            console.log("Deleting order:", orderToDelete);

            // Delete order items first
            const { error: itemsError } = await supabase
                .from("order_items")
                .delete()
                .eq("order_id", orderToDelete);

            if (itemsError) {
                console.error("Error deleting order items:", itemsError);
                throw itemsError;
            }

            // Delete the order
            const { error: orderError, count } = await supabase
                .from("orders")
                .delete()
                .eq("id", orderToDelete)
                .select();

            console.log("Delete result:", { orderError, count });

            if (orderError) {
                console.error("Error deleting order:", orderError);
                throw orderError;
            }

            toast.success("تم حذف الطلب بنجاح");
            // Remove from local state immediately
            setOrders(prev => prev.filter(o => o.id !== orderToDelete));
        } catch (error: any) {
            console.error("Error deleting order:", error);
            toast.error("فشل في حذف الطلب: " + (error.message || 'خطأ غير معروف'));
        } finally {
            setOrderToDelete(null);
            setDeleteConfirmOpen(false);
        }
    };

    const handleConfirmDelivery = async (orderId: string) => {
        try {
            const { error } = await supabase
                .from("orders")
                .update({ status: 'delivered' })
                .eq("id", orderId);

            if (error) throw error;

            toast.success("تم تأكيد وصول الطلب ودفعه بنجاح");
            // Update local state
            setOrders(prev => prev.map(o =>
                o.id === orderId ? { ...o, status: 'delivered' } : o
            ));
        } catch (error: any) {
            console.error("Error confirming delivery:", error);
            toast.error("فشل في تأكيد الطلب: " + (error.message || 'خطأ غير معروف'));
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
        <div className="p-4 md:p-8 space-y-4 md:space-y-6">
            <div>
                <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-primary">الطلبات</h1>
                <p className="text-sm md:text-base text-muted-foreground mt-1">عرض ومتابعة طلبات منتجاتك</p>
            </div>

            <Tabs defaultValue="active" className="w-full">
                <TabsList className="grid w-full grid-cols-2 mb-4 md:mb-8 h-11 md:h-10">
                    <TabsTrigger value="active" className="text-sm md:text-base">الطلبات الجارية</TabsTrigger>
                    <TabsTrigger value="history" className="text-sm md:text-base">سجل الطلبات</TabsTrigger>
                </TabsList>

                <TabsContent value="active">
                    <Card>
                        <CardHeader>
                            <CardTitle>الطلبات الجارية</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="table-container overflow-x-auto">
                                <OrdersTable
                                    orders={orders.filter(o => ['pending', 'processing', 'shipped'].includes(o.status))}
                                    onView={handleViewOrder}
                                    onDelete={handleDeleteClick}
                                    onConfirmDelivery={handleConfirmDelivery}
                                    getStatusBadge={getStatusBadge}
                                />
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="history">
                    <Card>
                        <CardHeader>
                            <CardTitle>سجل الطلبات السابقة</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="table-container overflow-x-auto">
                                <OrdersTable
                                    orders={orders.filter(o => ['delivered', 'cancelled'].includes(o.status))}
                                    onView={handleViewOrder}
                                    onDelete={handleDeleteClick}
                                    onConfirmDelivery={handleConfirmDelivery}
                                    getStatusBadge={getStatusBadge}
                                />
                            </div>
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

            <ConfirmDialog
                open={deleteConfirmOpen}
                onOpenChange={setDeleteConfirmOpen}
                onConfirm={confirmDelete}
                title="حذف الطلب"
                description="هل أنت متأكد من حذف هذا الطلب؟ لا يمكن التراجع عن هذا الإجراء."
                confirmText="حذف"
                variant="destructive"
            />
        </div>
    );
}
