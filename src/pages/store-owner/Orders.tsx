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
    DialogFooter,
} from "@/components/ui/dialog";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Eye, Loader2, Trash2, CheckCircle, MoreHorizontal, User, MapPin, Package, Phone } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ConfirmDialog } from "@/components/ConfirmDialog";

// --- قائمة الإجراءات (للموبايل والديسك توب) ---
const ActionsMenu = ({ order, onView, onDelete, onConfirmDelivery }: any) => {
    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="h-8 w-8 p-0">
                    <span className="sr-only">فتح القائمة</span>
                    <MoreHorizontal className="h-4 w-4" />
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48 font-cairo">
                <DropdownMenuLabel className="text-right">الإجراءات</DropdownMenuLabel>
                <DropdownMenuItem onClick={() => onView(order)} className="flex justify-end gap-2 cursor-pointer">
                    <span>عرض التفاصيل</span>
                    <Eye className="h-4 w-4" />
                </DropdownMenuItem>
                {order.status !== 'delivered' && order.status !== 'cancelled' && (
                    <DropdownMenuItem onClick={() => onConfirmDelivery(order.id)} className="flex justify-end gap-2 cursor-pointer text-green-600 focus:text-green-700">
                        <span>تأكيد التوصيل</span>
                        <CheckCircle className="h-4 w-4" />
                    </DropdownMenuItem>
                )}
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => onDelete(order.id)} className="flex justify-end gap-2 cursor-pointer text-red-600 focus:text-red-700">
                    <span>حذف الطلب</span>
                    <Trash2 className="h-4 w-4" />
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );
};

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
                <TableHead className="text-right">الطلب</TableHead>
                <TableHead className="text-right hidden md:table-cell">العميل</TableHead>
                <TableHead className="text-right hidden sm:table-cell">التاريخ</TableHead>
                <TableHead className="text-center">الحالة</TableHead>
                <TableHead className="text-left w-[50px]"></TableHead>
            </TableRow>
        </TableHeader>
        <TableBody>
            {orders.length === 0 ? (
                <TableRow>
                    <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                        لا توجد طلبات في هذه القائمة
                    </TableCell>
                </TableRow>
            ) : (
                orders.map((order) => (
                    <TableRow key={order.id}>
                        <TableCell className="font-medium">
                            <div className="flex flex-col">
                                <span>#{order.id.slice(0, 6)}</span>
                                <span className="text-xs text-muted-foreground md:hidden">{order.full_name || "غير معروف"}</span>
                            </div>
                        </TableCell>
                        <TableCell className="hidden md:table-cell">{order.full_name || order.profiles?.full_name || "غير معروف"}</TableCell>
                        <TableCell className="hidden sm:table-cell text-muted-foreground dir-ltr text-right">{format(new Date(order.created_at), "yyyy-MM-dd")}</TableCell>
                        <TableCell className="text-center">{getStatusBadge(order.status)}</TableCell>
                        <TableCell>
                            <ActionsMenu
                                order={order}
                                onView={onView}
                                onDelete={onDelete}
                                onConfirmDelivery={onConfirmDelivery}
                            />
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
            const { data: directOrders, error: directError } = await supabase
                .from("orders")
                .select("*, profiles:user_id(full_name), wilayas(name)")
                .eq('store_id', storeId)
                .order("created_at", { ascending: false });

            if (directError) throw directError;

            const { data: arrayOrders, error: arrayError } = await supabase
                .from("orders")
                .select("*, profiles:user_id(full_name), wilayas(name)")
                .contains('store_ids', [storeId])
                .order("created_at", { ascending: false });

            if (arrayError) throw arrayError;

            const allOrders = [...(directOrders || []), ...(arrayOrders || [])];
            const uniqueOrders = allOrders.reduce((acc: any[], order) => {
                if (!acc.find(o => o.id === order.id)) {
                    acc.push(order);
                }
                return acc;
            }, []);

            uniqueOrders.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
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
            const { data, error } = await supabase
                .from("order_items")
                .select("*, products(name, image_url)")
                .eq("order_id", order.id);

            if (error) throw error;

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
            await supabase.from("order_items").delete().eq("order_id", orderToDelete);
            const { error } = await supabase.from("orders").delete().eq("id", orderToDelete);
            if (error) throw error;
            toast.success("تم حذف الطلب بنجاح");
            setOrders(prev => prev.filter(o => o.id !== orderToDelete));
        } catch (error: any) {
            console.error("Error deleting order:", error);
            toast.error("فشل في حذف الطلب");
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
            toast.success("تم تأكيد وصول الطلب");
            setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: 'delivered' } : o));
        } catch (error: any) {
            console.error("Error confirming delivery:", error);
            toast.error("فشل في تأكيد الطلب");
        }
    };

    const getStatusBadge = (status: string) => {
        const styles: Record<string, string> = {
            pending: "bg-yellow-100 text-yellow-800 border-yellow-200",
            processing: "bg-blue-100 text-blue-800 border-blue-200",
            shipped: "bg-purple-100 text-purple-800 border-purple-200",
            delivered: "bg-green-100 text-green-800 border-green-200",
            cancelled: "bg-red-100 text-red-800 border-red-200",
        };
        const labels: Record<string, string> = {
            pending: "قيد الانتظار",
            processing: "قيد المعالجة",
            shipped: "تم الشحن",
            delivered: "تم التوصيل",
            cancelled: "ملغي",
        };
        return (
            <Badge variant="outline" className={`${styles[status] || "bg-gray-100"} border shadow-sm`}>
                {labels[status] || status}
            </Badge>
        );
    };

    if (loading && !orders.length) return <LoadingSpinner fullScreen message="جاري تحميل الطلبات..." />;
    if (!storeId) return <Card className="p-8 text-center"><p className="text-muted-foreground">لا يوجد محل مرتبط بحسابك</p></Card>;

    return (
        <div className="p-4 md:p-8 space-y-6">
            <div>
                <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-primary">الطلبات</h1>
                <p className="text-sm md:text-base text-muted-foreground mt-1">إدارة ومتابعة طلبات الزبائن</p>
            </div>

            <Tabs defaultValue="active" className="w-full">
                <TabsList className="grid w-full grid-cols-2 mb-6 h-11">
                    <TabsTrigger value="active">الطلبات الجارية</TabsTrigger>
                    <TabsTrigger value="history">سجل الطلبات</TabsTrigger>
                </TabsList>

                <TabsContent value="active">
                    <Card className="border-0 shadow-md">
                        <CardHeader className="bg-white border-b py-4">
                            <CardTitle className="text-base flex items-center gap-2">
                                <Package className="h-5 w-5 text-blue-600" />
                                الطلبات قيد المعالجة
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-0">
                            <OrdersTable
                                orders={orders.filter(o => ['pending', 'processing', 'shipped'].includes(o.status))}
                                onView={handleViewOrder}
                                onDelete={handleDeleteClick}
                                onConfirmDelivery={handleConfirmDelivery}
                                getStatusBadge={getStatusBadge}
                            />
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="history">
                    <Card className="border-0 shadow-md">
                        <CardHeader className="bg-white border-b py-4">
                            <CardTitle className="text-base flex items-center gap-2">
                                <CheckCircle className="h-5 w-5 text-green-600" />
                                الطلبات المكتملة والملغاة
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-0">
                            <OrdersTable
                                orders={orders.filter(o => ['delivered', 'cancelled'].includes(o.status))}
                                onView={handleViewOrder}
                                onDelete={handleDeleteClick}
                                onConfirmDelivery={handleConfirmDelivery}
                                getStatusBadge={getStatusBadge}
                            />
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>

            {/* تفاصيل الطلب (نافذة منبثقة) */}
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto p-0 gap-0 bg-gray-50/50">
                    <DialogHeader className="p-6 bg-white border-b sticky top-0 z-10">
                        <DialogTitle className="flex justify-between items-center">
                            <span>تفاصيل الطلب <span className="font-mono text-base bg-gray-100 px-2 py-1 rounded">#{selectedOrder?.id?.slice(0, 8)}</span></span>
                            {selectedOrder && getStatusBadge(selectedOrder.status)}
                        </DialogTitle>
                    </DialogHeader>

                    {selectedOrder && (
                        <div className="p-6 space-y-6">

                            {/* معلومات العميل */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="bg-white p-4 rounded-xl border shadow-sm space-y-3">
                                    <h3 className="font-semibold flex items-center gap-2 text-sm text-gray-500">
                                        <User className="h-4 w-4" /> بيانات العميل
                                    </h3>
                                    <div>
                                        <p className="font-bold text-gray-900">{selectedOrder.full_name}</p>
                                        <div className="flex items-center gap-2 text-sm mt-1 text-gray-600">
                                            <Phone className="h-3 w-3" />
                                            <span dir="ltr">{selectedOrder.phone}</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="bg-white p-4 rounded-xl border shadow-sm space-y-3">
                                    <h3 className="font-semibold flex items-center gap-2 text-sm text-gray-500">
                                        <MapPin className="h-4 w-4" /> عنوان التوصيل
                                    </h3>
                                    <div>
                                        <p className="font-medium text-gray-900">{selectedOrder.wilayas?.name || "ولاية غير محددة"}</p>
                                        <p className="text-sm text-gray-600 mt-1">{selectedOrder.address}</p>
                                        <Badge variant="secondary" className="mt-2 text-xs">
                                            {selectedOrder.delivery_option === 'home' ? 'توصيل للمنزل' : 'استلام من المكتب'}
                                        </Badge>
                                    </div>
                                </div>
                            </div>

                            {/* قائمة المنتجات */}
                            <div className="bg-white rounded-xl border shadow-sm overflow-hidden">
                                <div className="p-4 border-b bg-gray-50/50">
                                    <h3 className="font-bold flex items-center gap-2">
                                        <Package className="h-4 w-4" /> المنتجات المطلوبة
                                    </h3>
                                </div>

                                {loadingItems ? (
                                    <div className="flex justify-center py-8"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
                                ) : orderItems.length === 0 ? (
                                    <div className="p-8 text-center text-muted-foreground">لا توجد منتجات</div>
                                ) : (
                                    <div className="divide-y">
                                        {orderItems.map((item) => (
                                            <div key={item.id} className="p-4 flex items-start gap-4 hover:bg-gray-50 transition-colors">
                                                {/* صورة المنتج */}
                                                <div className="h-16 w-16 shrink-0 rounded-lg border bg-gray-100 overflow-hidden">
                                                    {item.products?.image_url ? (
                                                        <img src={item.products.image_url} alt="" className="h-full w-full object-cover" />
                                                    ) : (
                                                        <div className="h-full w-full flex items-center justify-center text-gray-400"><Package className="h-6 w-6" /></div>
                                                    )}
                                                </div>

                                                {/* تفاصيل المنتج */}
                                                <div className="flex-1 min-w-0">
                                                    <h4 className="font-bold text-gray-900 truncate">{item.products?.name || "منتج محذوف"}</h4>

                                                    <div className="flex flex-wrap gap-2 mt-2">
                                                        {/* عرض اللون كنص فقط (التعديل المطلوب) */}
                                                        {item.selected_color && (
                                                            <div className="bg-gray-100 px-2 py-1 rounded text-xs text-gray-600 border border-gray-200 font-medium">
                                                                اللون: <span className="font-bold text-gray-900">{item.selected_color}</span>
                                                            </div>
                                                        )}
                                                        {item.selected_size && (
                                                            <div className="bg-gray-100 px-2 py-1 rounded text-xs text-gray-600 border border-gray-200 font-medium">
                                                                المقاس: <span className="font-bold text-gray-900">{item.selected_size}</span>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>

                                                {/* السعر والكمية */}
                                                <div className="text-left shrink-0">
                                                    <p className="font-bold text-gray-900">{item.price} دج</p>
                                                    <p className="text-xs text-gray-500 mt-1">الكمية: {item.quantity}</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}

                                {/* المجموع */}
                                <div className="bg-gray-50 p-4 border-t flex justify-between items-center">
                                    <span className="font-semibold text-gray-600">المجموع الكلي</span>
                                    <span className="font-black text-xl text-primary">
                                        {orderItems.reduce((acc, item) => acc + (item.price * item.quantity), 0).toLocaleString()} دج
                                    </span>
                                </div>
                            </div>
                        </div>
                    )}

                    <DialogFooter className="p-4 bg-white border-t">
                        <Button variant="outline" className="w-full sm:w-auto" onClick={() => setIsDialogOpen(false)}>إغلاق</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            <ConfirmDialog
                open={deleteConfirmOpen}
                onOpenChange={setDeleteConfirmOpen}
                onConfirm={confirmDelete}
                title="حذف الطلب"
                description="هل أنت متأكد؟ لا يمكن استرجاع الطلب بعد الحذف."
                confirmText="حذف نهائي"
                variant="destructive"
            />
        </div>
    );
}