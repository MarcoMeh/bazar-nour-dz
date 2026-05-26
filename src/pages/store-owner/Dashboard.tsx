import { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
    Package, ShoppingCart, DollarSign, Loader2,
    ExternalLink, Sparkles, Sun, Moon, Share2,
    Plus, Phone, Copy, Check, Clock, ShieldCheck, Truck, User, ChevronLeft
} from "lucide-react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { subDays, format } from "date-fns";
import { ar } from "date-fns/locale";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip, Cell, Pie, PieChart, Legend } from "recharts";

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
    const [storeSlug, setStoreSlug] = useState<string | null>(null);
    const [storeInfo, setStoreInfo] = useState<{ name: string; image_url: string | null } | null>(null);
    
    // Theme support: 'light' | 'dark' | 'glass'
    const [dashboardTheme, setDashboardTheme] = useState<'light' | 'dark' | 'glass'>('light');

    // Get theme classes for dynamic styling
    const getThemeClass = (element: 'wrapper' | 'card' | 'text' | 'subtext' | 'border' | 'headerBg') => {
        if (dashboardTheme === 'dark') {
            switch (element) {
                case 'wrapper': return 'bg-[#121212] text-[#F5F5F5] min-h-screen p-4 md:p-8 space-y-6 transition-all duration-300';
                case 'card': return 'bg-[#1e1e1e] border-zinc-800 text-[#F5F5F5] shadow-none';
                case 'text': return 'text-[#F5F5F5]';
                case 'subtext': return 'text-zinc-400';
                case 'border': return 'border-zinc-800';
                case 'headerBg': return 'bg-[#1e1e1e]/60 border-zinc-800';
            }
        }
        if (dashboardTheme === 'glass') {
            switch (element) {
                case 'wrapper': return 'bg-gradient-to-br from-indigo-500/10 via-purple-500/5 to-pink-500/10 min-h-screen p-4 md:p-8 space-y-6 transition-all duration-300';
                case 'card': return 'bg-white/40 backdrop-blur-md border border-white/50 text-slate-800 shadow-lg';
                case 'text': return 'text-slate-800';
                case 'subtext': return 'text-slate-600';
                case 'border': return 'border-white/50';
                case 'headerBg': return 'bg-white/30 backdrop-blur-lg border-white/50';
            }
        }
        // Light (default)
        switch (element) {
            case 'wrapper': return 'bg-[#F5F5F5] min-h-screen p-4 md:p-8 space-y-6 transition-all duration-300';
            case 'card': return 'bg-white border-gray-200/80 text-gray-900 shadow-sm';
            case 'text': return 'text-gray-900';
            case 'subtext': return 'text-gray-500';
            case 'border': return 'border-gray-200/80';
            case 'headerBg': return 'bg-white border-gray-200/80';
        }
    };

    const fetchStoreId = async () => {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const { data: store } = await supabase
            .from("stores")
            .select("id, name, slug, image_url")
            .eq("owner_id", user.id)
            .single();

        if (store) {
            setStoreId(store.id);
            setStoreSlug(store.slug);
            setStoreInfo({
                name: store.name,
                image_url: store.image_url || null
            });
        }
    };

    const fetchDashboardData = useCallback(async () => {
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
    }, [storeId]);

    // Handle copying store link
    const handleCopyStoreLink = () => {
        const storeLink = `${window.location.origin}/store/${storeSlug || storeId}`;
        navigator.clipboard.writeText(storeLink);
        toast.success("تم نسخ رابط متجرك بنجاح! يمكنك الآن مشاركته.");
    };

    // Customer WhatsApp interaction
    const handleWhatsAppClick = (phone: string, orderId: string, totalPrice: number) => {
        const formattedPhone = phone.replace(/[^0-9]/g, '');
        const message = encodeURIComponent(`مرحباً، أنا صاحب المتجر في بازارنا. بخصوص طلبكم رقم #${orderId.slice(0, 8)} بقيمة ${totalPrice} دج، نود تأكيد وتجهيز الطلب معكم.`);
        window.open(`https://wa.me/${formattedPhone}?text=${message}`, '_blank');
    };

    const getStatusBadgeVariant = (status: string) => {
        switch (status) {
            case 'delivered': return 'default';
            case 'cancelled': return 'destructive';
            case 'processing': return 'secondary';
            case 'shipped': return 'secondary';
            default: return 'outline';
        }
    };

    const getStatusLabel = (status: string) => {
        const labels: Record<string, string> = {
            pending: 'قيد الانتظار',
            processing: 'قيد المعالجة',
            shipped: 'تم الشحن',
            delivered: 'تم التوصيل',
            cancelled: 'ملغي'
        };
        return labels[status] || status;
    };

    const getGreeting = () => {
        const hour = new Date().getHours();
        if (hour < 12) return "صباح الخير ☀️";
        if (hour < 18) return "مساء الخير ☕";
        return "طاب مساؤك 🌙";
    };

    // React hooks useEffect placed at bottom to prevent TDZ (Temporal Dead Zone) Reference Errors
    useEffect(() => {
        fetchStoreId();
    }, []);

    useEffect(() => {
        if (storeId) {
            fetchDashboardData();
        }
    }, [storeId, fetchDashboardData]);

    if (loading) {
        return (
            <div className="p-8 flex justify-center items-center h-[60vh]">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    if (!storeId) {
        return (
            <div className="p-8 flex justify-center items-center h-[60vh]">
                <p className="text-muted-foreground">لا يوجد محل مرتبط بحسابك</p>
            </div>
        );
    }

    return (
        <div className={getThemeClass('wrapper')}>
            {/* Header Section with Welcome and Theme Switcher */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div className="flex items-center gap-3">
                    {storeInfo?.image_url ? (
                        <img
                            src={storeInfo.image_url}
                            alt={storeInfo.name}
                            className="w-12 h-12 rounded-xl object-cover border-2 border-primary/20 shadow-md"
                        />
                    ) : (
                        <div className="w-12 h-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center font-black text-lg border border-primary/20">
                            {storeInfo?.name ? storeInfo.name[0] : <User className="w-6 h-6" />}
                        </div>
                    )}
                    <div>
                        <h2 className="text-xl md:text-2xl font-black tracking-tight">{getGreeting()}، {storeInfo?.name || "شريكنا العزيز"}</h2>
                        <p className={`text-xs ${getThemeClass('subtext')} flex items-center gap-1.5`}>
                            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                            لوحة الإدارة نشطة الآن
                        </p>
                    </div>
                </div>

                {/* Theme Selector UI */}
                <div className="flex items-center gap-1.5 bg-muted/40 p-1 rounded-xl self-end sm:self-center border backdrop-blur-sm">
                    <button
                        onClick={() => setDashboardTheme('light')}
                        className={`p-2 rounded-lg flex items-center gap-1 text-xs font-bold transition-all ${
                            dashboardTheme === 'light' ? 'bg-white shadow-sm text-primary' : 'text-muted-foreground hover:text-foreground'
                        }`}
                    >
                        <Sun className="w-4 h-4" />
                        <span className="hidden xs:inline">فاتح</span>
                    </button>
                    <button
                        onClick={() => setDashboardTheme('dark')}
                        className={`p-2 rounded-lg flex items-center gap-1 text-xs font-bold transition-all ${
                            dashboardTheme === 'dark' ? 'bg-zinc-800 shadow-sm text-[#F5F5F5]' : 'text-muted-foreground hover:text-foreground'
                        }`}
                    >
                        <Moon className="w-4 h-4" />
                        <span className="hidden xs:inline">داكن</span>
                    </button>
                    <button
                        onClick={() => setDashboardTheme('glass')}
                        className={`p-2 rounded-lg flex items-center gap-1 text-xs font-bold transition-all ${
                            dashboardTheme === 'glass' ? 'bg-white/30 backdrop-blur-md shadow-sm text-slate-800 border-white/50 border' : 'text-slate-500 hover:text-slate-800'
                        }`}
                    >
                        <Sparkles className="w-4 h-4" />
                        <span className="hidden xs:inline">زجاجي</span>
                    </button>
                </div>
            </div>

            {/* Quick Stats Grid */}
            <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
                {/* Revenue Card */}
                <div className={`p-5 rounded-2xl border transition-all duration-300 hover:-translate-y-1 hover:shadow-md relative overflow-hidden flex flex-col justify-between h-32 ${getThemeClass('card')}`}>
                    <div className="absolute top-0 right-0 w-24 h-24 bg-amber-500/5 rounded-full blur-2xl pointer-events-none"></div>
                    <div className="flex justify-between items-start">
                        <div>
                            <span className={`text-xs font-bold ${getThemeClass('subtext')}`}>إجمالي المبيعات</span>
                            <h3 className="text-2xl font-black mt-1">{stats.revenue.toLocaleString()} دج</h3>
                        </div>
                        <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-500 border border-amber-500/20">
                            <DollarSign className="w-5 h-5" />
                        </div>
                    </div>
                    <p className={`text-[10px] ${getThemeClass('subtext')} flex items-center gap-1`}>
                        <span className="text-emerald-500 font-bold">نشط</span>
                        <span>مبيعات المحل المؤكدة</span>
                    </p>
                </div>

                {/* Orders Card */}
                <div className={`p-5 rounded-2xl border transition-all duration-300 hover:-translate-y-1 hover:shadow-md relative overflow-hidden flex flex-col justify-between h-32 ${getThemeClass('card')}`}>
                    <div className="absolute top-0 right-0 w-24 h-24 bg-blue-500/5 rounded-full blur-2xl pointer-events-none"></div>
                    <div className="flex justify-between items-start">
                        <div>
                            <span className={`text-xs font-bold ${getThemeClass('subtext')}`}>الطلبات الواردة</span>
                            <h3 className="text-2xl font-black mt-1">{stats.orders}</h3>
                        </div>
                        <div className="p-2.5 rounded-xl bg-blue-500/10 text-blue-500 border border-blue-500/20">
                            <ShoppingCart className="w-5 h-5" />
                        </div>
                    </div>
                    <p className={`text-[10px] ${getThemeClass('subtext')} flex items-center gap-1`}>
                        <span>إجمالي الطلبات المستلمة</span>
                    </p>
                </div>

                {/* Products Card */}
                <div className={`p-5 rounded-2xl border transition-all duration-300 hover:-translate-y-1 hover:shadow-md relative overflow-hidden flex flex-col justify-between h-32 ${getThemeClass('card')}`}>
                    <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/5 rounded-full blur-2xl pointer-events-none"></div>
                    <div className="flex justify-between items-start">
                        <div>
                            <span className={`text-xs font-bold ${getThemeClass('subtext')}`}>المنتجات النشطة</span>
                            <h3 className="text-2xl font-black mt-1">{stats.products}</h3>
                        </div>
                        <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
                            <Package className="w-5 h-5" />
                        </div>
                    </div>
                    <p className={`text-[10px] ${getThemeClass('subtext')} flex items-center gap-1`}>
                        <span>المنتجات المعروضة في المتجر</span>
                    </p>
                </div>
            </div>

            {/* Quick Actions Panel */}
            <div className={`p-5 rounded-2xl border ${getThemeClass('card')}`}>
                <h3 className="text-sm font-black mb-4 flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-primary animate-pulse" />
                    الوصول السريع والإجراءات
                </h3>
                <div className="grid grid-cols-2 xs:grid-cols-3 md:grid-cols-5 gap-3">
                    <Link
                        to="/store-dashboard/products"
                        className="flex flex-col items-center justify-center p-3 rounded-xl bg-primary/5 border border-primary/10 hover:bg-primary hover:text-white transition-all text-center group"
                    >
                        <Plus className="w-5 h-5 text-primary group-hover:text-white transition-all mb-1.5" />
                        <span className="text-xs font-bold">إضافة منتج</span>
                    </Link>
                    <Link
                        to="/store-dashboard/orders"
                        className="flex flex-col items-center justify-center p-3 rounded-xl bg-primary/5 border border-primary/10 hover:bg-primary hover:text-white transition-all text-center group"
                    >
                        <ShoppingCart className="w-5 h-5 text-primary group-hover:text-white transition-all mb-1.5" />
                        <span className="text-xs font-bold">الطلبات</span>
                    </Link>
                    <Link
                        to="/store-dashboard/delivery"
                        className="flex flex-col items-center justify-center p-3 rounded-xl bg-primary/5 border border-primary/10 hover:bg-primary hover:text-white transition-all text-center group"
                    >
                        <Truck className="w-5 h-5 text-primary group-hover:text-white transition-all mb-1.5" />
                        <span className="text-xs font-bold">التوصيل</span>
                    </Link>
                    <Link
                        to="/store-dashboard/profile"
                        className="flex flex-col items-center justify-center p-3 rounded-xl bg-primary/5 border border-primary/10 hover:bg-primary hover:text-white transition-all text-center group"
                    >
                        <User className="w-5 h-5 text-primary group-hover:text-white transition-all mb-1.5" />
                        <span className="text-xs font-bold">الملف الشخصي</span>
                    </Link>
                    <button
                        onClick={handleCopyStoreLink}
                        className="flex flex-col items-center justify-center p-3 rounded-xl bg-primary/5 border border-primary/10 hover:bg-primary hover:text-white transition-all text-center group col-span-2 xs:col-span-1"
                    >
                        <Share2 className="w-5 h-5 text-primary group-hover:text-white transition-all mb-1.5" />
                        <span className="text-xs font-bold">رابط المتجر</span>
                    </button>
                </div>
            </div>

            {/* Smart Tips Advisor Panel */}
            <div className={`p-4 rounded-xl border border-primary/20 bg-gradient-to-l from-primary/5 via-transparent to-transparent flex flex-col md:flex-row md:items-center justify-between gap-4 ${getThemeClass('border')}`}>
                <div className="flex items-start gap-3">
                    <div className="p-2 rounded-lg bg-primary/15 text-primary shrink-0 mt-0.5 animate-pulse">
                        <Sparkles className="w-4 h-4" />
                    </div>
                    <div>
                        <h4 className="text-xs font-black text-primary">مستشار بازارنا الذكي (نصيحة اليوم)</h4>
                        <p className={`text-xs mt-1 leading-relaxed ${getThemeClass('subtext')}`}>
                            {stats.orders > 0 
                                ? "قم بمتابعة حالات الشحن والتوصيل وتحديثها باستمرار لإرسال تنبيهات تلقائية للعملاء ورفع ثقة المشترين في متجرك." 
                                : "المنتجات التي تحتوي على صور واضحة بخلفية بيضاء وعنوان ووصف مكتوبين باللغة العربية الفصحى تحقق مبيعات أفضل في الجزائر بـ 40%."}
                        </p>
                    </div>
                </div>
                <a
                    href={`/store/${storeSlug || storeId}`}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-1 px-3 py-1.5 rounded-lg border text-xs font-black text-primary bg-white/50 hover:bg-primary hover:text-white transition-all w-fit shrink-0"
                >
                    معاينة المتجر كزائر
                    <ExternalLink className="w-3 h-3" />
                </a>
            </div>

            {/* Charts Section - Responsive Grid */}
            <div className="grid gap-4 grid-cols-1 lg:grid-cols-4">
                {/* Revenue Chart Container */}
                <div className={`lg:col-span-3 p-5 rounded-2xl border ${getThemeClass('card')}`}>
                    <h3 className="text-sm font-black mb-4 flex items-center gap-2">
                        <DollarSign className="w-4 h-4 text-emerald-500" />
                        نظرة عامة على الإيرادات (آخر 7 أيام)
                    </h3>
                    <div className="h-[260px] w-full">
                        {revenueData.length > 0 ? (
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={revenueData}>
                                    <XAxis
                                        dataKey="date"
                                        stroke="#888888"
                                        fontSize={10}
                                        tickLine={false}
                                        axisLine={false}
                                    />
                                    <YAxis
                                        stroke="#888888"
                                        fontSize={10}
                                        tickLine={false}
                                        axisLine={false}
                                        tickFormatter={(value) => `${value} دج`}
                                    />
                                    <Tooltip
                                        formatter={(value) => [`${value} دج`, 'الإيرادات']}
                                        contentStyle={{
                                            borderRadius: '12px',
                                            border: 'none',
                                            backgroundColor: dashboardTheme === 'dark' ? '#1e1e1e' : '#ffffff',
                                            color: dashboardTheme === 'dark' ? '#ffffff' : '#000000',
                                            boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)'
                                        }}
                                    />
                                    <Bar
                                        dataKey="revenue"
                                        fill="#3b82f6"
                                        radius={[6, 6, 0, 0]}
                                        barSize={32}
                                    >
                                        {revenueData.map((_, index) => (
                                            <Cell key={`cell-${index}`} fill="#3b82f6" />
                                        ))}
                                    </Bar>
                                </BarChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className="flex h-full items-center justify-center text-xs text-muted-foreground">
                                لا توجد بيانات كافية لعرض الرسم البياني للإيرادات
                            </div>
                        )}
                    </div>
                </div>

                {/* Order Status Chart Container */}
                <div className={`p-5 rounded-2xl border ${getThemeClass('card')}`}>
                    <h3 className="text-sm font-black mb-4 flex items-center gap-2">
                        <ShoppingCart className="w-4 h-4 text-primary" />
                        حالات الطلبات
                    </h3>
                    <div className="h-[260px] w-full flex items-center justify-center">
                        {orderStatusData.length > 0 ? (
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={orderStatusData}
                                        cx="50%"
                                        cy="45%"
                                        innerRadius={50}
                                        outerRadius={70}
                                        paddingAngle={4}
                                        dataKey="value"
                                    >
                                        {orderStatusData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={entry.color} />
                                        ))}
                                    </Pie>
                                    <Tooltip
                                        contentStyle={{
                                            borderRadius: '12px',
                                            border: 'none',
                                            backgroundColor: dashboardTheme === 'dark' ? '#1e1e1e' : '#ffffff',
                                            boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)'
                                        }}
                                    />
                                    <Legend 
                                        iconType="circle" 
                                        layout="horizontal" 
                                        verticalAlign="bottom" 
                                        align="center"
                                        wrapperStyle={{ fontSize: '10px', paddingTop: '10px' }}
                                    />
                                </PieChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className="text-xs text-muted-foreground">
                                لا توجد طلبات لعرض حالتها
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Recent Orders Section - Desktop-First and Mobile-Responsive list */}
            <div className={`p-5 rounded-2xl border ${getThemeClass('card')}`}>
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-sm font-black flex items-center gap-2">
                        <ShoppingCart className="w-4 h-4 text-primary" />
                        أحدث الطلبات المستلمة
                    </h3>
                    <Link
                        to="/store-dashboard/orders"
                        className="text-xs font-black text-primary hover:underline flex items-center gap-0.5"
                    >
                        عرض جميع الطلبات
                        <ChevronLeft className="w-3.5 h-3.5" />
                    </Link>
                </div>

                {/* Mobile View: Responsive Card List (hidden md) */}
                <div className="block md:hidden space-y-3">
                    {recentOrders.length === 0 ? (
                        <div className="text-center py-8 text-xs text-muted-foreground">
                            لا توجد طلبات حديثة
                        </div>
                    ) : (
                        recentOrders.map((order) => (
                            <div
                                key={order.id}
                                className={`p-4 rounded-xl border flex flex-col gap-3 transition-all ${getThemeClass('border')} ${
                                    dashboardTheme === 'dark' ? 'bg-[#27272a]/40' : dashboardTheme === 'glass' ? 'bg-white/20' : 'bg-slate-50/50'
                                }`}
                            >
                                <div className="flex items-center justify-between">
                                    <span className="font-bold text-xs">#{order.id.slice(0, 8)}</span>
                                    <Badge variant={getStatusBadgeVariant(order.status)}>
                                        {getStatusLabel(order.status)}
                                    </Badge>
                                </div>

                                <div className="flex items-center justify-between gap-2">
                                    <div className="flex items-center gap-2">
                                        <div className="w-7 h-7 rounded-full bg-primary/10 text-primary flex items-center justify-center font-black text-xs">
                                            {(order.full_name || order.profiles?.full_name || "ز")[0]}
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-xs">{order.full_name || order.profiles?.full_name || "زبون زائر"}</h4>
                                            <p className={`text-[10px] ${getThemeClass('subtext')}`}>
                                                {format(new Date(order.created_at), "dd MMMM yyyy", { locale: ar })}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <span className="font-black text-xs text-primary">{order.total_price.toLocaleString()} دج</span>
                                    </div>
                                </div>

                                {order.phone && (
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => handleWhatsAppClick(order.phone, order.id, order.total_price)}
                                            className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-bold transition-all active:scale-95 shadow-sm shadow-emerald-500/10"
                                        >
                                            <Phone className="w-3.5 h-3.5" />
                                            واتساب العميل
                                        </button>
                                    </div>
                                )}
                            </div>
                        ))
                    )}
                </div>

                {/* Desktop View: Styled HTML Table (hidden sm) */}
                <div className="hidden md:block overflow-x-auto">
                    <table className="w-full text-right text-xs">
                        <thead>
                            <tr className={`border-b ${getThemeClass('border')} pb-3 text-muted-foreground font-bold`}>
                                <th className="pb-3 text-right">رقم الطلب</th>
                                <th className="pb-3 text-right">العميل</th>
                                <th className="pb-3 text-right">الحالة</th>
                                <th className="pb-3 text-right">السعر الإجمالي</th>
                                <th className="pb-3 text-right">التاريخ</th>
                                <th className="pb-3 text-left">الإجراءات</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100/10">
                            {recentOrders.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="text-center py-8 text-muted-foreground">
                                        لا توجد طلبات حديثة
                                    </td>
                                </tr>
                            ) : (
                                recentOrders.map((order) => (
                                    <tr key={order.id} className="hover:bg-muted/10 transition-colors">
                                        <td className="py-3.5 font-bold">#{order.id.slice(0, 8)}</td>
                                        <td className="py-3.5">{order.full_name || order.profiles?.full_name || 'زبون زائر'}</td>
                                        <td className="py-3.5">
                                            <Badge variant={getStatusBadgeVariant(order.status)}>
                                                {getStatusLabel(order.status)}
                                            </Badge>
                                        </td>
                                        <td className="py-3.5 font-black">{order.total_price.toLocaleString()} دج</td>
                                        <td className={`py-3.5 ${getThemeClass('subtext')}`}>
                                            {format(new Date(order.created_at), "dd MMMM yyyy", { locale: ar })}
                                        </td>
                                        <td className="py-3.5 text-left">
                                            {order.phone ? (
                                                <button
                                                    onClick={() => handleWhatsAppClick(order.phone, order.id, order.total_price)}
                                                    className="inline-flex items-center gap-1.5 py-1 px-2.5 rounded-md bg-emerald-500 hover:bg-emerald-600 text-white font-bold transition-all text-[10px]"
                                                >
                                                    <Phone className="w-3 h-3" />
                                                    واتساب
                                                </button>
                                            ) : (
                                                <span className="text-[10px] text-muted-foreground">لا يتوفر هاتف</span>
                                            )}
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
