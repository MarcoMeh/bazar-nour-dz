import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Package, ShoppingCart, Store, DollarSign, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    products: 0,
    orders: 0,
    stores: 0,
    revenue: 0
  });
  interface RecentOrder {
    id: string;
    created_at: string;
    total_price: number;
    status: string;
    profiles?: { full_name: string } | null;
  }
  const [recentOrders, setRecentOrders] = useState<RecentOrder[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      // Fetch counts
      const { count: productsCount } = await supabase.from("products").select("*", { count: "exact", head: true });
      const { count: ordersCount } = await supabase.from("orders").select("*", { count: "exact", head: true });
      const { count: storesCount } = await supabase.from("store_owners").select("*", { count: "exact", head: true });

      // Fetch revenue (sum of total_price for non-cancelled orders)
      const { data: ordersData } = await supabase
        .from("orders")
        .select("total_price")
        .neq("status", "cancelled");

      const revenue = ordersData?.reduce((sum, order) => sum + (order.total_price || 0), 0) || 0;

      setStats({
        products: productsCount || 0,
        orders: ordersCount || 0,
        stores: storesCount || 0,
        revenue
      });

      // Fetch recent orders
      const { data: recentOrdersData } = await supabase
        .from("orders")
        .select("*, profiles:owner_id(full_name)")
        .order("created_at", { ascending: false })
        .limit(5);

      if (recentOrdersData) {
        // Map to ensure type safety if needed, or just cast if shape is correct
        const mappedOrders: RecentOrder[] = recentOrdersData.map((order: any) => ({
          ...order,
          profiles: Array.isArray(order.profiles) ? order.profiles[0] : order.profiles
        }));
        setRecentOrders(mappedOrders);
      } else {
        setRecentOrders([]);
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
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-8 text-primary">لوحة التحكم</h1>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">إجمالي المنتجات</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.products}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">الطلبات</CardTitle>
            <ShoppingCart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.orders}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">المحلات</CardTitle>
            <Store className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.stores}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">الإيرادات</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.revenue.toLocaleString()} دج</div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Orders */}
      <Card>
        <CardHeader>
          <CardTitle>آخر الطلبات</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {recentOrders.length === 0 ? (
              <p className="text-center text-muted-foreground py-4">لا توجد طلبات حديثة</p>
            ) : (
              recentOrders.map((order) => (
                <div key={order.id} className="flex items-center justify-between border-b pb-4 last:border-0">
                  <div>
                    <p className="font-medium">طلب #{order.id.slice(0, 8)}</p>
                    <p className="text-sm text-muted-foreground">
                      {format(new Date(order.created_at), "yyyy-MM-dd HH:mm")}
                    </p>
                  </div>
                  <div className="text-left">
                    <p className="font-medium">{order.total_price} دج</p>
                    <p className="text-sm text-muted-foreground">
                      {order.status === 'pending' ? 'قيد الانتظار' :
                        order.status === 'processing' ? 'قيد المعالجة' :
                          order.status === 'shipped' ? 'تم الشحن' :
                            order.status === 'delivered' ? 'تم التوصيل' :
                              order.status === 'cancelled' ? 'ملغي' : order.status}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
