import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  FolderTree,
  Settings,
  LogOut,
  Truck,
  Tags,
  Star,
  UserPlus,
  ImageIcon,
  DollarSign,
  Store,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useAdmin } from "@/contexts/AdminContext";

export const AdminSidebar = () => {
  const location = useLocation();
  const { isAdmin, isStoreOwner } = useAdmin();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    window.location.href = "/";
  };

  const navItems = [
    { name: "لوحة التحكم", href: "/admin", icon: LayoutDashboard, show: true },
    { name: "المنتجات", href: "/admin/products", icon: Package, show: true },
    { name: "التقييمات", href: "/admin/reviews", icon: Star, show: true },
    { name: "تصنيفات المنتجات", href: "/admin/categories", icon: FolderTree, show: isAdmin },

    { name: "الطلبات", href: "/admin/orders", icon: ShoppingCart, show: true },
    { name: "المحلات", href: "/admin/stores", icon: Store, show: true },
    { name: "طلبات تسجيل المحلات", href: "/admin/store-registrations", icon: UserPlus, show: isAdmin },
    { name: "الإدارة المالية", href: "/admin/finance", icon: DollarSign, show: isAdmin },
    { name: "رسوم التوصيل", href: "/admin/delivery", icon: Truck, show: isAdmin },
    { name: "خلفيات الصفحات", href: "/admin/backgrounds", icon: ImageIcon, show: isAdmin },
    { name: "التحكم", href: "/admin/control", icon: Settings, show: isAdmin },
  ];

  return (
    <div className="flex h-full flex-col bg-card">
      <div className="flex h-16 items-center border-b px-6">
        <h2 className="text-xl font-bold text-primary">لوحة الإدارة</h2>
      </div>
      <nav className="flex-1 space-y-1 p-4">
        {navItems.filter(item => item.show).map((item) => {
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
      <div className="border-t p-4 space-y-2">
        <Link to="/">
          <Button variant="outline" className="w-full justify-start gap-3">
            <Store className="h-5 w-5" />
            الرئيسية
          </Button>
        </Link>
        <Button variant="ghost" className="w-full justify-start gap-3 text-destructive hover:text-destructive hover:bg-destructive/10" onClick={handleLogout}>
          <LogOut className="h-5 w-5" />
          تسجيل الخروج
        </Button>
      </div>
    </div>
  );
};
