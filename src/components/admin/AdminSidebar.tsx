import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  Store,
  FolderTree,
  Settings,
  LogOut,
} from "lucide-react";
import { Button } from "@/components/ui/button";

const navItems = [
  { name: "لوحة التحكم", href: "/admin", icon: LayoutDashboard },
  { name: "المنتجات", href: "/admin/products", icon: Package },
  { name: "التصنيفات", href: "/admin/categories", icon: FolderTree },
  { name: "الطلبات", href: "/admin/orders", icon: ShoppingCart },
  { name: "المحلات", href: "/admin/stores", icon: Store },
  { name: "التحكم", href: "/admin/control", icon: Settings },
];

export const AdminSidebar = () => {
  const location = useLocation();

  return (
    <div className="flex h-screen w-64 flex-col border-l bg-card">
      <div className="flex h-16 items-center border-b px-6">
        <h2 className="text-xl font-bold text-primary">لوحة الإدارة</h2>
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
