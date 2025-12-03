import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Package, DollarSign, ShoppingCart } from "lucide-react";
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

            setStats((prev) => ({
                ...prev,
                totalProducts: productCount || 0,
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
        <div className="space-y-8">
            <div>
                <h1 className="text-3xl font-bold mb-2">مرحباً بك في لوحة التحكم</h1>
                <p className="text-muted-foreground">إدارة منتجاتك وطلباتك بكل سهولة</p>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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

            {/* Quick Actions */}
            <Card>
                <CardHeader>
                    <CardTitle>البدء السريع</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        <p className="text-muted-foreground">
                            إبدأ بإضافة منتجاتك من صفحة المنتجات
                        </p>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
