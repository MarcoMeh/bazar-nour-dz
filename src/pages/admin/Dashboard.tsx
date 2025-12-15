import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Package, ShoppingCart, Store, DollarSign, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAdmin } from "@/contexts/AdminContext";
import { RevenueChart } from "@/components/admin/dashboard/RevenueChart";
import { OrderStatusChart } from "@/components/admin/dashboard/OrderStatusChart";
import { RecentOrders } from "@/components/admin/dashboard/RecentOrders";
import { subDays, format } from "date-fns";

export default function AdminDashboard() {
  const { isAdmin, isStoreOwner, storeId } = useAdmin();
  const [stats, setStats] = useState({
    products: 0,
    orders: 0,
    stores: 0,
    revenue: 0
  });
  const [recentOrders, setRecentOrders] = useState<any[]>([]);
  const [revenueData, setRevenueData] = useState<any[]>([]);
  const [orderStatusData, setOrderStatusData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, [isAdmin, isStoreOwner, storeId]);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      // 1. Fetch Basic Counts
      let productsQuery = supabase.from("products").select("*", { count: "exact", head: true });
      let storesQuery = supabase.from("stores").select("*", { count: "exact", head: true });

      if (isStoreOwner && storeId) {
        productsQuery = productsQuery.eq('store_id', storeId);
        storesQuery = storesQuery.eq('id', storeId);
      }

      const { count: productsCount } = await productsQuery;
      const { count: storesCount } = await storesQuery;

      // 2. Fetch Subscription Logs for Revenue
      const { data: subscriptionLogs, error: subError } = await supabase
        .from("subscription_logs")
        .select("amount, created_at"); // created_at IS payment_date roughly, or usage payment_date column if exists. I used payment_date in schema but usually default now() in created_at works too. Schema had payment_date. Let's use payment_date.

      const { data: logsData } = await supabase
        .from("subscription_logs")
        .select("amount, payment_date");

      if (subError) console.error("Error fetching logs:", subError);

      const subscriptionRevenue = logsData?.reduce((sum, log) => sum + Number(log.amount || 0), 0) || 0;

      // 3. Fetch Orders just for Count and Status
      let ordersQuery = supabase.from("orders").select("id, status, created_at");
      if (isStoreOwner && storeId) {
        ordersQuery = ordersQuery.eq('store_id', storeId);
      }
      const { data: allOrders } = await ordersQuery;
      const ordersCount = allOrders?.length || 0;

      // IF STORE OWNER: Revenue might still be "My Sales" unless they also want to see how much they paid? 
      // The user request "Admin Dashboard... Profits I want about store subscriptions". 
      // This implies specifically for the ADMIN view.
      // For Store Owner, "Revenue" usually means their Sales.
      // I should check `isAdmin` flag. 
      // If `isAdmin`, use subscription revenue. If `isStoreOwner`, keep sales revenue?
      // "The main panel for the page admin of the site... profits I want it about store subscriptions".
      // Okay, strictly for Admin.

      let displayRevenue = 0;
      let chartData: any[] = [];

      if (isAdmin) {
        displayRevenue = subscriptionRevenue;

        // Chart Data for Admin (Subscriptions)
        const last7Days = Array.from({ length: 7 }, (_, i) => {
          const d = subDays(new Date(), 6 - i);
          return format(d, "yyyy-MM-dd");
        });

        chartData = last7Days.map(date => {
          const dayRevenue = logsData
            ?.filter(log => format(new Date(log.payment_date || new Date()), "yyyy-MM-dd") === date)
            .reduce((sum, log) => sum + Number(log.amount || 0), 0) || 0;
          return { date: format(new Date(date), "MM/dd"), revenue: dayRevenue };
        });

      } else {
        // Store Owner: Keep showing their Sales Revenue
        // We need to fetch order totals again for store owner if we want to show sales.
        // My previous fetch only got "id, status". I need total_price for store owner.
        if (isStoreOwner && storeId) {
          const { data: storeOrders } = await supabase
            .from("orders")
            .select("total_price, created_at, status")
            .eq('store_id', storeId);

          displayRevenue = storeOrders
            ?.filter(o => o.status !== 'cancelled')
            .reduce((sum, o) => sum + (o.total_price || 0), 0) || 0;

          // Chart for Store Owner
          const last7Days = Array.from({ length: 7 }, (_, i) => {
            const d = subDays(new Date(), 6 - i);
            return format(d, "yyyy-MM-dd");
          });

          chartData = last7Days.map(date => {
            const dayRevenue = storeOrders
              ?.filter(o =>
                o.status !== 'cancelled' &&
                format(new Date(o.created_at), "yyyy-MM-dd") === date
              )
              .reduce((sum, o) => sum + (o.total_price || 0), 0) || 0;
            return { date: format(new Date(date), "MM/dd"), revenue: dayRevenue };
          });
        }
      }

      setStats({
        products: productsCount || 0,
        orders: ordersCount || 0,
        stores: storesCount || 0,
        revenue: displayRevenue
      });

      setRevenueData(chartData);

      // 4. Prepare Order Status Data
      const statusCounts = allOrders?.reduce((acc: any, order) => {
        acc[order.status] = (acc[order.status] || 0) + 1;
        return acc;
      }, {}) || {};

      const statusChartData = [
        { name: 'قيد الانتظار', value: statusCounts['pending'] || 0, color: '#fbbf24' }, // Amber
        { name: 'قيد المعالجة', value: statusCounts['processing'] || 0, color: '#3b82f6' }, // Blue
        { name: 'تم الشحن', value: statusCounts['shipped'] || 0, color: '#8b5cf6' }, // Purple
        { name: 'تم التوصيل', value: statusCounts['delivered'] || 0, color: '#22c55e' }, // Green
        { name: 'ملغي', value: statusCounts['cancelled'] || 0, color: '#ef4444' }, // Red
      ].filter(item => item.value > 0);
      setOrderStatusData(statusChartData);

      // 5. Fetch Recent Orders (Detailed)
      let recentOrdersQuery = supabase
        .from("orders")
        .select("*, profiles:user_id(full_name)")
        .order("created_at", { ascending: false })
        .limit(5);

      if (isStoreOwner && storeId) {
        recentOrdersQuery = recentOrdersQuery.eq('store_id', storeId);
      }

      const { data: recentOrdersData } = await recentOrdersQuery;

      if (recentOrdersData) {
        const mappedOrders = recentOrdersData.map((order: any) => ({
          ...order,
          profiles: Array.isArray(order.profiles) ? order.profiles[0] : order.profiles
        }));
        setRecentOrders(mappedOrders);
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

  return (
    <div className="p-8 space-y-8 animate-fade-in">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight text-primary">لوحة التحكم</h2>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{isAdmin ? "أرباح الاشتراكات" : "إجمالي المبيعات"}</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.revenue.toLocaleString()} دج</div>
            <p className="text-xs text-muted-foreground mt-1">{isAdmin ? "إجمالي مداخيل اشتراكات المتاجر" : "إجمالي المبيعات التراكمي"}</p>
          </CardContent>
        </Card>
        <Card className="hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">الطلبات</CardTitle>
            <ShoppingCart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.orders}</div>
            <p className="text-xs text-muted-foreground mt-1">إجمالي الطلبات المستلمة</p>
          </CardContent>
        </Card>
        <Card className="hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">المنتجات</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.products}</div>
            <p className="text-xs text-muted-foreground mt-1">عدد المنتجات النشطة</p>
          </CardContent>
        </Card>
        {isAdmin && (
          <Card className="hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">المحلات النشطة</CardTitle>
              <Store className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.stores}</div>
              <p className="text-xs text-muted-foreground mt-1">متاجر مسجلة في المنصة</p>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Charts Section */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <div className="col-span-4 lg:col-span-4">
          <RevenueChart data={revenueData} />
        </div>
        <div className="col-span-4 lg:col-span-3">
          <OrderStatusChart data={orderStatusData} />
        </div>
      </div>

      {/* Recent Orders Section */}
      <div className="grid gap-4 grid-cols-1">
        <RecentOrders orders={recentOrders} />
      </div>
    </div>
  );
}
