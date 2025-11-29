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
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Eye, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { format } from "date-fns";
import { useAdmin } from "@/contexts/AdminContext";

interface OrderItem {
    id: string;
    product_id: string;
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
    user_id: string;
    full_name: string;
    phone: string;
    address: string;
    wilaya_id: number;
    delivery_option: string;
    profiles?: {
        full_name?: string;
    };
    stores?: {
        name: string;
    };
    wilayas?: {
        name: string;
    };
}

export default function AdminOrders() {
    const { isAdmin, isStoreOwner, storeId } = useAdmin();
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);

    // Order Details State
    const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
    const [orderItems, setOrderItems] = useState<OrderItem[]>([]);
    const [loadingItems, setLoadingItems] = useState(false);
    const [isDialogOpen, setIsDialogOpen] = useState(false);

    const handleViewOrder = async (order: Order) => {
        setSelectedOrder(order);
        setIsDialogOpen(true);
        setLoadingItems(true);

        const { data, error } = await supabase
            .from("order_items")
            .select("*, products(name, image_url)")
            .eq("order_id", order.id);

        if (error) {
            console.error("Error fetching items:", error);
            toast.error("فشل في تحميل تفاصيل الطلب");
        } else {
            // Map data to handle array response from join if necessary
            const formattedItems = (data || []).map((item: any) => ({
                ...item,
                products: Array.isArray(item.products) ? item.products[0] : item.products
            }));
            setOrderItems(formattedItems);
        }
        setLoadingItems(false);
    };

    useEffect(() => {
        fetchOrders();
    }, [isAdmin, isStoreOwner, storeId]);

    const fetchOrders = async () => {
        setLoading(true);
        // Updated query to use user_id for the join and include stores(name) and wilayas(name)
        let query = supabase
            .from("orders")
            .select("*, profiles:user_id(full_name), stores(name), wilayas(name)")
            .order("created_at", { ascending: false });

        if (isStoreOwner && storeId) {
            query = query.eq('store_id', storeId);
        }

        const { data, error } = await query;

        if (error) {
            toast.error("فشل في تحميل الطلبات");
            console.error(error);
        } else {
            // Ensure data matches Order interface
            const formattedData = (data || []).map((item: any) => ({
                ...item,
                profiles: Array.isArray(item.profiles) ? item.profiles[0] : item.profiles,
                stores: Array.isArray(item.stores) ? item.stores[0] : item.stores,
                wilayas: Array.isArray(item.wilayas) ? item.wilayas[0] : item.wilayas
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
                                <TableHead>المتجر</TableHead>
                                <TableHead>المبلغ</TableHead>
                                <TableHead>الحالة</TableHead>
                                <TableHead>التاريخ</TableHead>
                                <TableHead>الإجراءات</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {loading ? (
                                <TableRow>
                                    <TableCell colSpan={7} className="text-center py-8">
                                        <Loader2 className="h-8 w-8 animate-spin mx-auto" />
                                    </TableCell>
                                </TableRow>
                            ) : orders.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={7} className="text-center py-8">
                                        لا توجد طلبات
                                    </TableCell>
                                </TableRow>
                            ) : (
                                orders.map((order) => (
                                    <TableRow key={order.id}>
                                        <TableCell className="font-medium">#{order.id.slice(0, 8)}</TableCell>
                                        <TableCell>
                                            {order.full_name || order.profiles?.full_name || "غير معروف"}
                                        </TableCell>
                                        <TableCell>
                                            {order.stores?.name || "عام"}
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
                                            <Button variant="ghost" size="icon" onClick={() => handleViewOrder(order)}>
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
                                    <p className="text-sm text-muted-foreground">المتجر</p>
                                    <p className="font-medium">{selectedOrder.stores?.name || "عام"}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-muted-foreground">رقم الهاتف</p>
                                    <p className="font-medium">{selectedOrder.phone}</p>
                                </div>
                                <div className="col-span-2">
                                    <p className="text-sm text-muted-foreground">العنوان</p>
                                    <p className="font-medium">{selectedOrder.address}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-muted-foreground">الولاية</p>
                                    <p className="font-medium">{selectedOrder.wilayas?.name || "غير محدد"}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-muted-foreground">طريقة التوصيل</p>
                                    <p className="font-medium">
                                        {selectedOrder.delivery_option === 'home' ? 'توصيل للمنزل' : 'استلام من المكتب'}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-sm text-muted-foreground">الإجمالي</p>
                                    <p className="font-bold text-green-600 text-lg">{selectedOrder.total_price} دج</p>
                                </div>
                            </div>

                            {/* Order Items */}
                            <div>
                                <h3 className="font-bold mb-4">المنتجات</h3>
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
                                            {orderItems.map((item) => (
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
                                            ))}
                                        </TableBody>
                                    </Table>
                                )}
                            </div>
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </div >
    );
}
