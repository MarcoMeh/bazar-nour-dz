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
  Globe,
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
    { name: "أكواد برومو", href: "/admin/promo-codes", icon: Tags, show: isAdmin },
    { name: "إعدادات الموقع", href: "/admin/settings", icon: Globe, show: isAdmin },
    { name: "التحكم", href: "/admin/control", icon: Settings, show: isAdmin },
  ];

  return (
    <div className="flex h-full flex-col bg-white/5 backdrop-blur-3xl border-l border-white/20 shadow-2xl relative overflow-hidden">
      {/* Decorative Gradient Glow */}
      <div className="absolute -top-20 -right-20 w-40 h-40 bg-primary/10 rounded-full blur-3xl pointer-events-none"></div>

      <div className="flex h-16 items-center border-b border-white/10 px-6 relative z-10">
        <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center mr-3">
          <Settings className="w-4 h-4 text-primary animate-spin-slow" />
        </div>
        <h2 className="text-xl font-black bg-gradient-to-l from-primary to-primary-dark bg-clip-text text-transparent">لوحة الإدارة</h2>
      </div>

      <nav className="flex-1 space-y-1.5 p-4 relative z-10 overflow-y-auto">
        {navItems.filter(item => item.show).map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.href;
          return (
            <Link
              key={item.href}
              to={item.href}
              className={cn(
                "flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-bold transition-all duration-300 group",
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

      <div className="border-t border-white/10 p-4 space-y-3 relative z-10 bg-white/10">
        <Link
          to="/"
          className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-bold transition-all hover:bg-white/50 hover:text-primary group"
        >
          <Store className="h-5 w-5 text-primary/70 group-hover:scale-110" />
          الرئيسية
        </Link>
        <Button
          variant="ghost"
          className="w-full justify-start gap-3 text-sm font-bold px-4 py-3 h-auto rounded-xl text-red-500 hover:text-red-600 hover:bg-red-500/10 transition-all group"
          onClick={handleLogout}
        >
          <LogOut className="h-5 w-5 transition-transform group-hover:-translate-x-1" />
          تسجيل الخروج
        </Button>
      </div>
    </div>
  );
};
