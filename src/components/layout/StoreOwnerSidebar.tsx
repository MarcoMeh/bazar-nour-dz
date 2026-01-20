import { Link, useLocation, useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import {
    LayoutDashboard,
    Package,
    ShoppingCart,
    User,
    LogOut,
    Truck,
    Store,
    Clock,
    ShieldCheck,
    Ban,
} from "lucide-react";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

// تعريف الواجهة لاستقبال دالة الإغلاق
interface StoreOwnerSidebarProps {
    onLinkClick?: () => void;
}

import { useAdmin } from "@/contexts/AdminContext";

export const StoreOwnerSidebar = ({ onLinkClick }: StoreOwnerSidebarProps) => {
    const location = useLocation();
    const navigate = useNavigate();
    const { storeId } = useAdmin();
    const [storeStatus, setStoreStatus] = useState<string | null>(null);
    const [subscriptionDaysLeft, setSubscriptionDaysLeft] = useState<number | null>(null);

    useEffect(() => {
        const fetchStoreStatus = async () => {
            if (!storeId) return;

            const { data, error } = await supabase
                .from('stores')
                .select('is_active, subscription_end_date')
                .eq('id', storeId)
                .single();

            if (data && !error) {
                // Cast data to any to avoid type errors if table types aren't updated
                const storeData = data as any;
                setStoreStatus(storeData.is_active ? 'active' : 'inactive');

                if (storeData.subscription_end_date) {
                    const end = new Date(storeData.subscription_end_date);
                    const now = new Date();
                    const diffTime = end.getTime() - now.getTime();
                    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                    setSubscriptionDaysLeft(diffDays > 0 ? diffDays : 0);
                }
            }
        };

        fetchStoreStatus();
    }, [storeId]);

    const handleLogout = async () => {
        try {
            await supabase.auth.signOut();
            toast.success("تم تسجيل الخروج بنجاح");
            navigate("/"); // إعادة التوجيه للصفحة الرئيسية
        } catch (error) {
            toast.error("حدث خطأ أثناء تسجيل الخروج");
        }
    };

    const navItems = [
        { name: "لوحة التحكم", href: "/store-dashboard", icon: LayoutDashboard },
        { name: "المنتجات", href: "/store-dashboard/products", icon: Package },
        { name: "الطلبات", href: "/store-dashboard/orders", icon: ShoppingCart },
        { name: "طرق التوصيل", href: "/store-dashboard/delivery", icon: Truck },
        { name: "الملف الشخصي", href: "/store-dashboard/profile", icon: User },
    ];

    return (
        <div className="flex h-full flex-col bg-white/5 backdrop-blur-3xl border-l border-white/20 shadow-2xl relative overflow-hidden">
            {/* Soft Ambient Glow */}
            <div className="absolute -top-10 -right-10 w-32 h-32 bg-primary/10 rounded-full blur-3xl pointer-events-none"></div>

            <div className="flex h-14 md:h-16 items-center border-b border-white/10 px-4 md:px-6 relative z-10">
                <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center mr-3">
                    <LayoutDashboard className="w-4 h-4 text-primary animate-pulse" />
                </div>
                <h2 className="text-lg md:text-xl font-black bg-gradient-to-l from-primary to-primary-dark bg-clip-text text-transparent">إدارة المتجر</h2>
            </div>

            <nav className="flex-1 space-y-2 p-3 md:p-4 mt-2 relative z-10 overflow-y-auto">
                {navItems.map((item) => {
                    const Icon = item.icon;
                    const isActive =
                        item.href === "/store-dashboard"
                            ? location.pathname === item.href
                            : location.pathname.startsWith(item.href);

                    return (
                        <Link
                            key={item.href}
                            to={item.href}
                            onClick={onLinkClick}
                            className={cn(
                                "flex items-center gap-3 rounded-xl px-4 py-3 md:py-2.5 text-base md:text-sm font-bold transition-all duration-300 group",
                                isActive
                                    ? "bg-gradient-to-l from-primary to-primary-dark text-white shadow-lg shadow-primary/20 translate-x-1"
                                    : "text-gray-500 hover:bg-white/40 hover:text-primary hover:translate-x-1"
                            )}
                        >
                            <Icon className={cn("h-5 w-5 transition-transform group-hover:scale-110", isActive ? "text-white" : "text-primary/70")} />
                            {item.name}
                            {isActive && <div className="ml-auto w-1.5 h-1.5 rounded-full bg-white shadow-glow animate-pulse"></div>}
                        </Link>
                    );
                })}
            </nav>

            <div className="border-t border-white/10 p-4 mt-auto space-y-3 relative z-10 bg-white/10">
                {/* Subscription Status Card */}
                {storeStatus && (
                    <div className={cn(
                        "rounded-xl p-3 border backdrop-blur-sm transition-all duration-300",
                        storeStatus === 'active'
                            ? "bg-emerald-500/10 border-emerald-500/20"
                            : "bg-red-500/10 border-red-500/20"
                    )}>
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-xs font-bold text-gray-500">حالة الاشتراك</span>
                            <div className={cn(
                                "flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-black",
                                storeStatus === 'active'
                                    ? "bg-emerald-500 text-white shadow-lg shadow-emerald-500/20"
                                    : "bg-red-500 text-white shadow-lg shadow-red-500/20"
                            )}>
                                {storeStatus === 'active' ? (
                                    <>
                                        <ShieldCheck className="h-3 w-3" />
                                        <span>مفعل</span>
                                    </>
                                ) : (
                                    <>
                                        <Ban className="h-3 w-3" />
                                        <span>غير مفعل</span>
                                    </>
                                )}
                            </div>
                        </div>

                        {subscriptionDaysLeft !== null && (
                            <div className="flex items-center gap-2 text-xs font-medium text-gray-600">
                                <Clock className="h-3.5 w-3.5 text-primary" />
                                <span>متبقي:</span>
                                <span className={cn(
                                    "font-black text-sm",
                                    subscriptionDaysLeft <= 7 ? "text-red-500 animate-pulse" : "text-primary"
                                )}>
                                    {subscriptionDaysLeft} يوم
                                </span>
                            </div>
                        )}
                    </div>
                )}

                <Link
                    to="/"
                    onClick={onLinkClick}
                    className="flex items-center gap-3 rounded-xl px-4 py-3 md:py-2.5 text-base md:text-sm font-bold text-gray-500 hover:bg-white/50 hover:text-primary transition-all group"
                >
                    <Store className="h-5 w-5 text-primary/70 group-hover:scale-110" />
                    الرئيسية
                </Link>

                <Button
                    variant="ghost"
                    className="w-full justify-start gap-4 text-base md:text-sm py-3 md:py-2.5 h-auto rounded-xl font-bold text-red-500 hover:text-red-600 hover:bg-red-500/10 transition-all group"
                    onClick={handleLogout}
                >
                    <LogOut className="h-5 w-5 transition-transform group-hover:-translate-x-1" />
                    تسجيل الخروج
                </Button>
            </div>
        </div>
    );
};