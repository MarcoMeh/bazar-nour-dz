import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Package, ShoppingCart, DollarSign, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { RevenueChart } from "@/components/admin/dashboard/RevenueChart";
import { OrderStatusChart } from "@/components/admin/dashboard/OrderStatusChart";
import { RecentOrders } from "@/components/admin/dashboard/RecentOrders";
import { subDays, format } from "date-fns";

export default function StoreOwnerDashboard() {
    const [stats, setStats] = useState({
        products: 0,
        orders: 0,
        revenue: 0
    });
    const [recentOrders, setRecentOrders] = useState<any[]>([]);
    const [revenueData, setRevenueData] = useState<any[]>([]);
    const [orderStatusData, setOrderStatusData] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [storeId, setStoreId] = useState<string | null>(null);

    useEffect(() => {
        fetchStoreId();
    }, []);

    useEffect(() => {
        if (storeId) {
            fetchDashboardData();
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

        setStoreId(store?.id || null);
    };

    const fetchDashboardData = async () => {
        if (!storeId) return;

        setLoading(true);
        try {
            // 1. Products Count
            const { count: productsCount } = await supabase
                .from("products")
                .select("*", { count: "exact", head: true })
                .eq('store_id', storeId);

            // 2. Get orders directly by store_id
            const { data: storeOrders, count: ordersCount } = await supabase
                .from('orders')
                .select('*', { count: 'exact' })
                .eq('store_id', storeId);

            // Calculate revenue from orders
            const revenue = storeOrders?.reduce((sum, order) => {
                if (order.status !== 'cancelled') {
                    return sum + (Number(order.total_price) || 0);
                }
                return sum;
            }, 0) || 0;

            setStats({
                products: productsCount || 0,
                orders: ordersCount || 0,
                revenue
            });

            // 3. Fetch full order details for charts and recent orders
            if (storeOrders && storeOrders.length > 0) {
                const allOrders = storeOrders;

                // Prepare Revenue Chart Data (Last 7 Days)
                const last7Days = Array.from({ length: 7 }, (_, i) => {
                    const d = subDays(new Date(), 6 - i);
                    return format(d, "yyyy-MM-dd");
                });

                const chartData = last7Days.map(date => {
                    const dayRevenue = allOrders
                        ?.filter(o =>
                            o.status !== 'cancelled' &&
                            format(new Date(o.created_at), "yyyy-MM-dd") === date
                        )
                        .reduce((sum, o) => sum + (o.total_price || 0), 0) || 0;

                    return { date: format(new Date(date), "MM/dd"), revenue: dayRevenue };
                });
                setRevenueData(chartData);

                // Prepare Order Status Data
                const statusCounts = allOrders?.reduce((acc: any, order) => {
                    acc[order.status] = (acc[order.status] || 0) + 1;
                    return acc;
                }, {}) || {};

                const statusChartData = [
                    { name: 'قيد الانتظار', value: statusCounts['pending'] || 0, color: '#fbbf24' },
                    { name: 'قيد المعالجة', value: statusCounts['processing'] || 0, color: '#3b82f6' },
                    { name: 'تم الشحن', value: statusCounts['shipped'] || 0, color: '#8b5cf6' },
                    { name: 'تم التوصيل', value: statusCounts['delivered'] || 0, color: '#22c55e' },
                    { name: 'ملغي', value: statusCounts['cancelled'] || 0, color: '#ef4444' },
                ].filter(item => item.value > 0);
                setOrderStatusData(statusChartData);

                // Fetch Recent Orders (Detailed)
                const uniqueOrderIds = new Set(allOrders.map(o => o.id));
                const { data: recentOrdersData } = await supabase
                    .from("orders")
                    .select("*, profiles:user_id(full_name)")
                    .in('id', Array.from(uniqueOrderIds))
                    .order("created_at", { ascending: false })
                    .limit(5);

                if (recentOrdersData) {
                    const mappedOrders = recentOrdersData.map((order: any) => ({
                        ...order,
                        profiles: Array.isArray(order.profiles) ? order.profiles[0] : order.profiles
                    }));
                    setRecentOrders(mappedOrders);
                }
            }

        } catch (error) {
            console.error("Error fetching dashboard data:", error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="p-8 flex justify-center items-center h-full">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    if (!storeId) {
        return (
            <div className="p-8 flex justify-center items-center h-full">
                <p className="text-muted-foreground">لا يوجد محل مرتبط بحسابك</p>
            </div>
        );
    }

    return (
        <div className="p-4 md:p-8 space-y-4 md:space-y-8">
            <div className="flex items-center justify-between space-y-2">
                <h2 className="text-2xl md:text-3xl font-bold tracking-tight text-primary">لوحة التحكم</h2>
            </div>

            {/* Stats Grid - Single column on mobile */}
            <div className="grid gap-3 md:gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm md:text-base font-medium">إجمالي الإيرادات</CardTitle>
                        <DollarSign className="h-5 w-5 md:h-4 md:w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-xl md:text-2xl font-bold">{stats.revenue.toLocaleString()} دج</div>
                        <p className="text-xs text-muted-foreground">إجمالي المبيعات</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm md:text-base font-medium">الطلبات</CardTitle>
                        <ShoppingCart className="h-5 w-5 md:h-4 md:w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-xl md:text-2xl font-bold">{stats.orders}</div>
                        <p className="text-xs text-muted-foreground">طلبات جديدة</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm md:text-base font-medium">المنتجات</CardTitle>
                        <Package className="h-5 w-5 md:h-4 md:w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-xl md:text-2xl font-bold">{stats.products}</div>
                        <p className="text-xs text-muted-foreground">المنتجات المتاحة</p>
                    </CardContent>
                </Card>
            </div>

            {/* Charts Section - Stack on mobile */}
            <div className="grid gap-3 md:gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-4">
                <RevenueChart data={revenueData} />
                <OrderStatusChart data={orderStatusData} />
            </div>

            {/* Recent Orders Section */}
            <div className="grid gap-3 md:gap-4 grid-cols-1">
                <RecentOrders orders={recentOrders} />
            </div>
        </div>
    );
}
