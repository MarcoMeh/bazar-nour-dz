import { Link, useLocation } from "react-router-dom";
import { Home, Grid, ShoppingCart, User, Heart, Store, ShoppingBag } from "lucide-react";
import { useCart } from "@/contexts/CartContext";
import { useWishlist } from "@/contexts/WishlistContext";
import { motion } from "framer-motion";

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
            name: "المنتجات",
            path: "/products",
            icon: ShoppingBag
        },
        {
            name: "المحلات",
            path: "/stores",
            icon: Store
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
            path: "/profile",
            icon: User
        },
    ];

    return (
        <div className="fixed bottom-4 left-4 right-4 z-50 md:hidden">
            <div className="bg-black/80 backdrop-blur-2xl border border-white/20 shadow-[0_8px_32px_0_rgba(0,0,0,0.5)] rounded-3xl flex justify-around items-center h-20 px-2">
                {navItems.map((item) => (
                    <Link
                        key={item.path}
                        to={item.path}
                        className={`flex flex-col items-center justify-center flex-1 h-full space-y-1 transition-all duration-300 relative ${isActive(item.path)
                            ? "text-primary scale-110"
                            : "text-white/60 hover:text-white"
                            }`}
                    >
                        {isActive(item.path) && (
                            <motion.div
                                layoutId="nav-active"
                                className="absolute inset-x-2 -inset-y-2 bg-white/10 rounded-2xl z-0"
                                transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                            />
                        )}
                        <div className="relative z-10">
                            <item.icon className={`h-6 w-6 transition-transform duration-200`} strokeWidth={isActive(item.path) ? 2.5 : 2} />
                            {item.count !== undefined && item.count > 0 && (
                                <span className="absolute -top-2 -right-2 bg-red-500 text-white text-[10px] font-bold h-4 w-4 rounded-full flex items-center justify-center shadow-lg border border-white/20">
                                    {item.count > 9 ? "9+" : item.count}
                                </span>
                            )}
                        </div>
                        <span className="text-[10px] font-black z-10">{item.name}</span>
                    </Link>
                ))}
            </div>
        </div>
    );
};
