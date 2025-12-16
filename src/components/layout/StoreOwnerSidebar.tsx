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
} from "lucide-react";
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
        <div className="flex h-full flex-col bg-card">
            <div className="flex h-14 md:h-16 items-center border-b px-4 md:px-6">
                <h2 className="text-lg md:text-xl font-bold text-primary">لوحة إدارة المتجر</h2>
            </div>

            <nav className="flex-1 space-y-1 p-3 md:p-4">
                {navItems.map((item) => {
                    const Icon = item.icon;
                    // تحسين منطق الرابط النشط ليشمل الصفحات الفرعية
                    const isActive =
                        item.href === "/store-dashboard"
                            ? location.pathname === item.href
                            : location.pathname.startsWith(item.href);

                    return (
                        <Link
                            key={item.href}
                            to={item.href}
                            onClick={onLinkClick} // تنفيذ دالة الإغلاق عند الضغط
                            className={cn(
                                "flex items-center gap-3 rounded-lg px-3 py-3 md:py-2 text-base md:text-sm font-medium transition-all duration-200",
                                isActive
                                    ? "bg-primary text-primary-foreground shadow-sm"
                                    : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                            )}
                        >
                            <Icon className="h-5 w-5" />
                            {item.name}
                        </Link>
                    );
                })}
            </nav>

            <div className="border-t p-3 md:p-4 mt-auto space-y-2">
                <Link to="/">
                    <Button variant="outline" className="w-full justify-start gap-3 text-base md:text-sm">
                        <Store className="h-5 w-5" />
                        الرئيسية
                    </Button>
                </Link>

                {/* View Store Button - visible only if storeId is resolved (or logic to fetch it) */}
                {/*  Since retrieving storeId might be complex here without prop drilling or context, 
                      I will stick to Home button first as requested "Main Page or his page".
                      Actually I can easily add it if I use useAdmin() hook assuming verified context. 
                 */}

                <Button
                    variant="ghost"
                    className="w-full justify-start gap-3 text-base md:text-sm py-3 md:py-2 text-red-500 hover:text-red-600 hover:bg-red-50"
                    onClick={handleLogout}
                >
                    <LogOut className="h-5 w-5" />
                    تسجيل الخروج
                </Button>
            </div>
        </div>
    );
};