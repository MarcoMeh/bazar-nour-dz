import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Package, DollarSign, ShoppingCart, User } from "lucide-react";
import { LoadingSpinner } from "@/components/LoadingSpinner";

export default function StoreOwnerDashboard() {
    const [stats, setStats] = useState({
        totalProducts: 0,
        totalOrders: 0,
        totalRevenue: 0,
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchStats();
    }, []);

    const fetchStats = async () => {
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

            // Get user's store_id
            const { data: profile } = await supabase
                .from("profiles")
                .select("store_id")
                .eq("id", user.id)
                .single();

            if (!(profile as any)?.store_id) {
                setLoading(false);
                return;
            }

            // Count products
            const { count: productCount } = await supabase
                .from("products")
                .select("*", { count: "exact", head: true })
                .eq("store_id", (profile as any).store_id);

            // Fetch orders statistics
            // We get all order items for this store's products
            const { data: orderItems, error: ordersError } = await supabase
                .from('order_items')
                .select(`
                    order_id,
                    price,
                    quantity,
                    products!inner (
                        store_id
                    )
                `)
                .eq('products.store_id', (profile as any).store_id);

            let totalOrders = 0;
            let totalRevenue = 0;

            if (!ordersError && orderItems) {
                // Count unique orders
                const uniqueOrderIds = new Set(orderItems.map(item => item.order_id));
                totalOrders = uniqueOrderIds.size;

                // Calculate revenue
                totalRevenue = orderItems.reduce((sum, item) => sum + (Number(item.price) * item.quantity), 0);
            }

            setStats((prev) => ({
                ...prev,
                totalProducts: productCount || 0,
                totalOrders,
                totalRevenue,
            }));
        } catch (error) {
            console.error("Error fetching stats:", error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return <LoadingSpinner fullScreen message="جاري تحميل الإحصائيات..." />;
    }

    return (
        <div>
            <h1 className="text-3xl font-bold mb-8">لوحة التحكم</h1>

            {/* Stats Cards - Keeping these as they are useful */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">إجمالي المنتجات</CardTitle>
                        <Package className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.totalProducts}</div>
                        <p className="text-xs text-muted-foreground">المنتجات المتاحة</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">الطلبات</CardTitle>
                        <ShoppingCart className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.totalOrders}</div>
                        <p className="text-xs text-muted-foreground">طلبات جديدة</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">الإيرادات</CardTitle>
                        <DollarSign className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.totalRevenue} دج</div>
                        <p className="text-xs text-muted-foreground">إجمالي المبيعات</p>
                    </CardContent>
                </Card>
            </div>

            {/* Navigation Cards - Admin Style */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <Link to="/store-dashboard/products">
                    <Card className="p-6 hover:shadow-lg transition-shadow cursor-pointer h-full">
                        <Package className="h-12 w-12 text-primary mb-4" />
                        <h2 className="text-xl font-bold mb-2">إدارة المنتجات</h2>
                        <p className="text-muted-foreground">إضافة وتعديل وحذف منتجات متجرك</p>
                    </Card>
                </Link>

                <Link to="/store-dashboard/orders">
                    <Card className="p-6 hover:shadow-lg transition-shadow cursor-pointer h-full">
                        <ShoppingCart className="h-12 w-12 text-accent mb-4" />
                        <h2 className="text-xl font-bold mb-2">الطلبات</h2>
                        <p className="text-muted-foreground">متابعة ومعالجة طلبات الزبائن</p>
                    </Card>
                </Link>

                <Link to="/store-dashboard/profile">
                    <Card className="p-6 hover:shadow-lg transition-shadow cursor-pointer h-full">
                        <User className="h-12 w-12 text-secondary mb-4" />
                        <h2 className="text-xl font-bold mb-2">الملف الشخصي</h2>
                        <p className="text-muted-foreground">تعديل معلومات المتجر والشعار</p>
                    </Card>
                </Link>
            </div>
        </div>
    );
}
