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

const navItems = [
    { name: "لوحة التحكم", href: "/store-owner", icon: LayoutDashboard },
    { name: "الملف الشخصي", href: "/store-owner/profile", icon: User },
    { name: "المنتجات", href: "/store-owner/products", icon: Package },
    { name: "الطلبات", href: "/store-owner/orders", icon: ShoppingCart },
];

export const StoreOwnerSidebar = () => {
    const location = useLocation();

    return (
        <div className="flex h-screen w-64 flex-col border-l bg-card">
            <div className="flex h-16 items-center border-b px-6">
                <h2 className="text-xl font-bold text-primary">لوحة المحل</h2>
            </div>
            <nav className="flex-1 space-y-1 p-4">
                {navItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = location.pathname === item.href;
                    return (
                        <Link
                            key={item.href}
                            to={item.href}
                            className={cn(
                                "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
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
            <div className="border-t p-4">
                <Button variant="ghost" className="w-full justify-start gap-3">
                    <LogOut className="h-5 w-5" />
                    تسجيل الخروج
                </Button>
            </div>
        </div>
    );
};
