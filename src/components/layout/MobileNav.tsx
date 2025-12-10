import { Link, useLocation } from "react-router-dom";
import { Home, Grid, ShoppingCart, User, Heart } from "lucide-react";
import { useCart } from "@/contexts/CartContext";
import { useWishlist } from "@/contexts/WishlistContext";

export const MobileNav = () => {
    const { pathname } = useLocation();
    const { totalItems } = useCart();
    const { wishlistCount } = useWishlist();

    const isActive = (path: string) => {
        if (path === "/" && pathname === "/") return true;
        if (path !== "/" && pathname.startsWith(path)) return true;
        return false;
    };

    const navItems = [
        {
            name: "الرئيسية",
            path: "/",
            icon: Home
        },
        {
            name: "الأقسام",
            path: "/products", // Can link to a dedicated categories page or products with filters
            icon: Grid
        },
        {
            name: "المفضلة",
            path: "/wishlist",
            icon: Heart,
            count: wishlistCount
        },
        {
            name: "السلة",
            path: "/cart",
            icon: ShoppingCart,
            count: totalItems
        },
        {
            name: "حسابي",
            path: "/profile", // Or /login if not logged in, but /profile usually redirects
            icon: User
        }
    ];

    return (
        <div className="fixed bottom-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-md border-t border-gray-200 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)] md:hidden pb-safe">
            <div className="flex justify-around items-center h-16">
                {navItems.map((item) => (
                    <Link
                        key={item.path}
                        to={item.path}
                        className={`flex flex-col items-center justify-center w-full h-full space-y-1 ${isActive(item.path)
                                ? "text-primary font-bold"
                                : "text-gray-500 hover:text-gray-900"
                            }`}
                    >
                        <div className="relative">
                            <item.icon className={`h-6 w-6 transition-transform duration-200 ${isActive(item.path) ? "scale-110" : ""}`} />
                            {item.count !== undefined && item.count > 0 && (
                                <span className="absolute -top-2 -right-2 bg-red-500 text-white text-[10px] font-bold h-4 w-4 rounded-full flex items-center justify-center shadow-sm">
                                    {item.count > 9 ? "9+" : item.count}
                                </span>
                            )}
                        </div>
                        <span className="text-[10px]">{item.name}</span>
                    </Link>
                ))}
            </div>
        </div>
    );
};
