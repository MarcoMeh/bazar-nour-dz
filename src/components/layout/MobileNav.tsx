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

    // Hide mobile navigation bar on product detail pages to avoid UI stacking issues on iOS
    if (pathname.startsWith("/product/")) return null;

    const navItems = [
        {
            name: "الرئيسية",
            path: "/",
            icon: Home
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
    ];

    return (
        <div className="fixed bottom-[calc(1rem+env(safe-area-inset-bottom,0px))] left-4 right-4 z-50 md:hidden">
            <div className="bg-white/70 backdrop-blur-[30px] border border-white/50 shadow-[0_8px_40px_rgb(0,0,0,0.08)] rounded-[2rem] flex justify-around items-center h-[4.5rem] px-2 pb-safe">
                {navItems.map((item) => (
                    <Link
                        key={item.path}
                        to={item.path}
                        className={`flex flex-col items-center justify-center flex-1 h-full space-y-1 transition-all duration-300 relative ${isActive(item.path)
                            ? "text-primary"
                            : "text-gray-500 hover:text-gray-900"
                            }`}
                    >
                        {isActive(item.path) && (
                            <motion.div
                                layoutId="nav-active"
                                className="absolute inset-x-2 -inset-y-2 bg-primary/10 rounded-2xl z-0"
                                transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                            />
                        )}
                        <motion.div whileTap={{ scale: 0.85 }} className="relative z-10 flex flex-col items-center justify-center space-y-1">
                            <item.icon className={`h-6 w-6 transition-transform duration-200`} strokeWidth={isActive(item.path) ? 2.5 : 2} />
                            {item.count !== undefined && item.count > 0 && (
                                <span className="absolute -top-2 -right-2 bg-red-500 text-white text-[10px] font-bold h-4 w-4 rounded-full flex items-center justify-center shadow-sm border border-white/50">
                                    {item.count > 9 ? "9+" : item.count}
                                </span>
                            )}
                            <span className="text-[10px] font-bold z-10">{item.name}</span>
                        </motion.div>
                    </Link>
                ))}
            </div>
        </div>
    );
};
