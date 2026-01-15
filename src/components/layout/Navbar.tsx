import { Link, useNavigate } from "react-router-dom";
import { Search, ShoppingCart, Menu, User, LogOut, Package, Settings, LayoutDashboard, Store } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Sheet,
    SheetContent,
    SheetTrigger,
} from "@/components/ui/sheet";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useCart } from "@/contexts/CartContext";
import { useAuth } from "@/contexts/AuthContext";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useSiteSettings } from "@/hooks/useSiteSettings";

export const Navbar = () => {
    const { data: settings } = useSiteSettings();
    const { totalItems } = useCart();
    const { user, signOut } = useAuth();
    const navigate = useNavigate();
    const [searchQuery, setSearchQuery] = useState("");
    const [isSheetOpen, setIsSheetOpen] = useState(false);
    const [userRole, setUserRole] = useState<string | null>(null);
    const [isScrolled, setIsScrolled] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 60);
        };
        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    useEffect(() => {
        const fetchUserRole = async () => {
            if (!user) {
                setUserRole(null);
                return;
            }
            const { data } = await supabase
                .from('profiles')
                .select('role')
                .eq('id', user.id)
                .single();
            if (data) setUserRole(data.role);
        };
        fetchUserRole();
    }, [user]);

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        if (searchQuery.trim()) {
            navigate(`/products?search=${encodeURIComponent(searchQuery)}`);
            setIsSheetOpen(false);
        }
    };

    const handleLogout = async () => {
        await signOut();
        navigate("/");
    };

    const DashboardIcon = () => {
        if (!userRole || userRole === 'customer') return null;

        const link = userRole === 'admin' ? '/admin' : '/store-dashboard';
        const title = userRole === 'admin' ? 'لوحة التحكم' : 'لوحة المتجر';

        return (
            <Link to={link}>
                <Button variant="ghost" size="icon" className="relative text-primary font-bold bg-primary/10 hover:bg-primary/20">
                    <LayoutDashboard className="h-5 w-5" />
                    <span className="sr-only">{title}</span>
                </Button>
            </Link>
        );
    };

    return (
        <nav className="fixed top-0 left-0 right-0 z-50 transition-all duration-300 px-4 py-2">
            <div className="container mx-auto">
                {/* Main Header Row */}
                <div className={`
                    rounded-2xl px-6 py-3 flex items-center justify-between gap-4 shadow-2xl transition-all duration-300
                    ${isScrolled
                        ? "bg-white/20 backdrop-blur-2xl border-white/30 ring-1 ring-black/5"
                        : "bg-white/2 backdrop-blur-3xl border-white/10 ring-1 ring-black/5"
                    }
                `}>
                    {/* RIGHT: Logo (Appears first in DOM for RTL right-alignment) */}
                    <div className="flex items-center gap-3 shrink-0">
                        <Link to="/" className="flex items-center gap-2 group">
                            {settings?.logo_url ? (
                                <div className={`
                                    relative rounded-full bg-white p-2 shadow-[0_8px_30px_rgb(0,0,0,0.2)] border-2 border-white/50 overflow-hidden flex items-center justify-center transition-all duration-500 group-hover:scale-110
                                    ${isScrolled ? "h-12 w-12" : "h-14 w-14 group-hover:shadow-[0_0_20px_rgba(255,255,255,0.3)]"}
                                `}>
                                    <img src={settings.logo_url} alt={settings.site_name} className="h-full w-full object-contain" />
                                </div>
                            ) : (
                                <span className={`text-2xl font-black bg-clip-text text-transparent bg-gradient-to-r from-primary to-indigo-600 ${isScrolled ? "text-xl" : "text-2xl"}`}>
                                    {settings?.site_name || "بازارنا"}
                                </span>
                            )}
                        </Link>
                    </div>

                    {/* CENTER: Search Bar */}
                    <div className="flex-1 max-w-2xl hidden lg:block">
                        <form onSubmit={handleSearch} className="relative group/search">
                            <div className={`
                                flex items-center rounded-full overflow-hidden transition-all duration-300 border-2
                                ${isScrolled
                                    ? "bg-white/40 border-primary/10"
                                    : "bg-white border-primary/20 shadow-lg"
                                }
                                group-focus-within/search:border-primary group-focus-within/search:ring-4 ring-primary/10
                            `}>
                                <Button
                                    type="submit"
                                    className="h-10 w-10 min-w-[40px] rounded-full bg-primary text-white ml-1 p-0 flex items-center justify-center shadow-md hover:scale-105 transition-transform"
                                >
                                    <Search className="h-5 w-5" />
                                </Button>
                                <Input
                                    type="search"
                                    placeholder="ما الذي تبحث عنه؟"
                                    className={`border-none bg-transparent focus-visible:ring-0 text-right pr-4 pl-2 h-10 w-full font-bold transition-colors ${isScrolled ? "text-gray-900" : "text-black"} placeholder:text-gray-500`}
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                />
                            </div>
                        </form>
                    </div>

                    {/* LEFT: Action Icons */}
                    <div className="flex items-center gap-1 md:gap-3">
                        <Link to="/profile">
                            <Button
                                variant="ghost"
                                size="icon"
                                className={`transition-all rounded-xl h-10 w-10 ${isScrolled ? "text-gray-900 hover:bg-black/5" : "text-white hover:bg-white/20"}`}
                            >
                                <User className="h-6 w-6" />
                                <span className="sr-only">حسابي</span>
                            </Button>
                        </Link>

                        <Link to="/cart">
                            <Button
                                variant="ghost"
                                size="icon"
                                className={`relative transition-all rounded-xl h-10 w-10 ${isScrolled ? "text-gray-900 hover:bg-black/5" : "text-white hover:bg-white/20"}`}
                            >
                                <ShoppingCart className="h-6 w-6" />
                                {totalItems > 0 && (
                                    <span className="absolute -top-1 -right-1 bg-red-600 text-white text-[10px] font-bold h-4 w-4 rounded-full flex items-center justify-center animate-bounce">
                                        {totalItems}
                                    </span>
                                )}
                                <span className="sr-only">السلة</span>
                            </Button>
                        </Link>

                        <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
                            <SheetTrigger asChild>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className={`lg:hidden transition-all rounded-xl h-10 w-10 ${isScrolled ? "text-gray-900 hover:bg-black/5" : "text-white hover:bg-white/20"}`}
                                >
                                    <Menu className="h-6 w-6" />
                                    <span className="sr-only">القائمة</span>
                                </Button>
                            </SheetTrigger>
                            <SheetContent side="right" className="w-[300px] sm:w-[400px] bg-black/40 backdrop-blur-2xl border-none text-white">
                                <nav className="flex flex-col gap-6 mt-12">
                                    <Link to="/" className="text-xl font-bold hover:text-blue-400" onClick={() => setIsSheetOpen(false)}>الرئيسية</Link>
                                    <Link to="/products" className="text-xl font-bold hover:text-blue-400" onClick={() => setIsSheetOpen(false)}>المنتجات</Link>
                                    <Link to="/stores" className="text-xl font-bold hover:text-blue-400" onClick={() => setIsSheetOpen(false)}>المحلات</Link>
                                    <div className="h-px bg-white/10 my-2" />
                                    {user ? (
                                        <button onClick={() => { handleLogout(); setIsSheetOpen(false); }} className="text-xl font-bold text-red-500 flex items-center gap-3">
                                            <LogOut className="h-6 w-6" /> تسجيل الخروج
                                        </button>
                                    ) : (
                                        <Link to="/login" className="text-xl font-bold hover:text-blue-400" onClick={() => setIsSheetOpen(false)}>تسجيل الدخول</Link>
                                    )}
                                </nav>
                            </SheetContent>
                        </Sheet>
                    </div>
                </div>

                {/* Sub Navigation Row */}
                <div className="mt-2 flex justify-center pb-2">
                    <div className={`
                        rounded-2xl px-10 py-2.5 flex items-center gap-8 shadow-xl transition-all duration-300 animate-fade-in
                        ${isScrolled
                            ? "bg-white/20 backdrop-blur-xl border-white/20 ring-1 ring-black/5"
                            : "bg-white/2 backdrop-blur-lg border-white/10 ring-1 ring-black/5"
                        }
                    `}>
                        <Link to="/" className={`font-black text-sm transition-all hover:scale-110 ${isScrolled ? "text-gray-800 hover:text-primary" : "text-white hover:text-white/80"}`}>الرئيسية</Link>
                        <Link to="/stores" className={`font-black text-sm transition-all hover:scale-110 ${isScrolled ? "text-gray-800 hover:text-primary" : "text-white hover:text-white/80"}`}>المحلات</Link>
                        <Link to="/products" className={`font-black text-sm transition-all hover:scale-110 ${isScrolled ? "text-gray-800 hover:text-primary" : "text-white hover:text-white/80"}`}>المنتجات</Link>
                        <Link to="/products?flash_sale=true" className="flex items-center gap-2 font-black text-sm transition-all hover:scale-110 group">
                            <span className="relative flex h-2 w-2">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
                            </span>
                            <span className={isScrolled ? "text-red-600" : "text-red-400"}>العروض</span>
                        </Link>
                        <Link to="/products?sort=trending" className={`font-black text-sm transition-all hover:scale-110 ${isScrolled ? "text-gray-800 hover:text-primary" : "text-white hover:text-white/80"}`}>الأكثر مبيعاً</Link>
                    </div>
                </div>
            </div>
        </nav>
    );
};
