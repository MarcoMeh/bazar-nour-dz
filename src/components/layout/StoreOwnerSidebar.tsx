import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import {
    LayoutDashboard,
    Package,
    ShoppingCart,
    User,
    LogOut,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const StoreOwnerSidebar = () => {
    const location = useLocation();

    const handleLogout = async () => {
        await supabase.auth.signOut();
        toast.success("تم تسجيل الخروج بنجاح");
        window.location.href = "/";
    };

    const navItems = [
        { name: "لوحة التحكم", href: "/store-dashboard", icon: LayoutDashboard },
        { name: "المنتجات", href: "/store-dashboard/products", icon: Package },
        { name: "الطلبات", href: "/store-dashboard/orders", icon: ShoppingCart },
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
                    const isActive = location.pathname === item.href;
                    return (
                        <Link
                            key={item.href}
                            to={item.href}
                            className={cn(
                                "flex items-center gap-3 rounded-lg px-3 py-3 md:py-2 text-base md:text-sm font-medium transition-colors",
                                isActive
                                    ? "bg-primary text-primary-foreground"
                                    : "hover:bg-accent hover:text-accent-foreground"
                            )}
                        >
                            <Icon className="h-5 w-5" />
                            {item.name}
                        </Link>
                    );
                })}
            </nav>
            <div className="border-t p-3 md:p-4">
                <Button variant="ghost" className="w-full justify-start gap-3 text-base md:text-sm py-3 md:py-2" onClick={handleLogout}>
                    <LogOut className="h-5 w-5" />
                    تسجيل الخروج
                </Button>
            </div>
        </div>
    );
};
