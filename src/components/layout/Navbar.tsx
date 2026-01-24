import { Link, useNavigate, useLocation } from "react-router-dom";
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
    const location = useLocation();
    const [searchQuery, setSearchQuery] = useState("");
    const [isSheetOpen, setIsSheetOpen] = useState(false);
    const [userRole, setUserRole] = useState<string | null>(null);
    const [isScrolled, setIsScrolled] = useState(false);

    const isHomePage = location.pathname === "/";
    // Use dark text if scrolled OR if not on home page
    const useDarkText = isScrolled || !isHomePage;

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
        try {
            await signOut();
            navigate("/");
            // Force reload to ensure all states are cleared
            // window.location.reload(); 
        } catch (error) {
            console.error("Logout error", error);
            navigate("/");
        }
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
                    rounded-2xl px-4 md:px-6 py-2 md:py-3 flex items-center justify-between gap-3 md:gap-4 shadow-2xl transition-all duration-300
                    ${isScrolled
                        ? "bg-black/30 lg:bg-white/10 backdrop-blur-md border-white/20 ring-1 ring-black/5 shadow-lg"
                        : "bg-black/10 lg:bg-white/5 backdrop-blur-sm border-white/10 ring-1 ring-black/5 shadow-none"
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
                    <div className="flex-1 max-w-2xl lg:block">
                        <form onSubmit={handleSearch} className="relative group/search">
                            <div className={`
                                flex items-center rounded-full overflow-hidden transition-all duration-300 border-2
                                ${isScrolled
                                    ? "bg-white/40 border-primary/10"
                                    : "bg-white/80 lg:bg-white border-primary/20 shadow-lg"
                                }
                                group-focus-within/search:border-primary group-focus-within/search:ring-4 ring-primary/10
                            `}>
                                <Button
                                    type="submit"
                                    className={`
                                        rounded-full bg-primary text-white ml-2 p-0 flex items-center justify-center shadow-lg hover:scale-105 transition-all
                                        ${isScrolled ? "h-8 w-8 md:h-10 md:w-10 min-w-[32px] md:min-w-[40px]" : "h-9 w-9 md:h-10 md:w-10 min-w-[36px] md:min-w-[40px]"}
                                    `}
                                >
                                    <Search className={`${isScrolled ? "h-4 w-4" : "h-5 w-5"}`} />
                                </Button>
                                <Input
                                    type="search"
                                    placeholder="ما الذي تبحث عنه؟"
                                    className={`border-none bg-transparent focus-visible:ring-0 text-right pr-4 pl-2 font-bold transition-all ${isScrolled ? "text-gray-900 h-8 text-sm" : "text-black h-10 w-full"} placeholder:text-gray-500`}
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                />
                            </div>
                        </form>
                    </div>

                    {/* LEFT: Action Icons */}
                    <div className="flex items-center gap-1 md:gap-3">
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className={`hidden lg:flex transition-all rounded-xl h-10 w-10 ${useDarkText ? "text-gray-900 hover:bg-black/5" : "text-white hover:bg-white/20"}`}
                                >
                                    <User className="h-6 w-6" strokeWidth={2.5} />
                                    <span className="sr-only">قائمة المستخدم</span>
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-56 font-bold">
                                <DropdownMenuLabel className="text-right">حسابي</DropdownMenuLabel>
                                <DropdownMenuSeparator />

                                {(userRole === 'admin' || userRole === 'store_owner') && (
                                    <>
                                        <DropdownMenuItem className="flex items-center gap-2 justify-end cursor-pointer" onClick={() => navigate(userRole === 'admin' ? '/admin' : '/store-dashboard')}>
                                            <span>{userRole === 'admin' ? 'لوحة التحكم' : 'لوحة المتجر'}</span>
                                            <LayoutDashboard className="h-4 w-4" />
                                        </DropdownMenuItem>

                                        {userRole === 'store_owner' && (
                                            <DropdownMenuItem className="flex items-center gap-2 justify-end cursor-pointer" onClick={() => navigate('/store-dashboard/profile')}>
                                                <span>الملف الشخصي</span>
                                                <Store className="h-4 w-4" />
                                            </DropdownMenuItem>
                                        )}
                                    </>
                                )}

                                {/* Customer Links */}
                                {userRole === 'customer' && (
                                    <DropdownMenuItem className="flex items-center gap-2 justify-end cursor-pointer" onClick={() => navigate('/my-orders')}>
                                        <span>طلباتي</span>
                                        <Package className="h-4 w-4" />
                                    </DropdownMenuItem>
                                )}

                                <DropdownMenuSeparator />

                                <DropdownMenuItem className="flex items-center gap-2 justify-end cursor-pointer text-red-500 focus:text-red-600 focus:bg-red-50" onClick={handleLogout}>
                                    <span>تسجيل الخروج</span>
                                    <LogOut className="h-4 w-4" />
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>

                        <Link to="/cart" className="hidden lg:block">
                            <Button
                                variant="ghost"
                                size="icon"
                                className={`relative transition-all rounded-xl h-10 w-10 ${useDarkText ? "text-gray-900 hover:bg-black/5" : "text-white hover:bg-white/20"}`}
                            >
                                <ShoppingCart className="h-6 w-6" strokeWidth={2.5} />
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
                                    className={`hidden lg:flex transition-all rounded-xl h-10 w-10 ${useDarkText ? "text-gray-900 hover:bg-black/5" : "text-white hover:bg-white/20"}`}
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

                <div className="mt-2 hidden lg:flex justify-center pb-2">
                    <div className={`
                        rounded-2xl px-10 py-2.5 flex items-center gap-8 shadow-xl transition-all duration-300 animate-fade-in
                        ${isScrolled
                            ? "bg-white/10 backdrop-blur-md border-white/10 ring-1 ring-black/5"
                            : "bg-white/5 backdrop-blur-sm border-white/5 ring-1 ring-black/5"
                        }
                    `}>
                        <Link to="/" className={`font-black text-sm transition-all hover:scale-110 ${useDarkText ? "text-gray-800 hover:text-primary" : "text-white hover:text-white/80"}`}>الرئيسية</Link>
                        <Link to="/stores" className={`font-black text-sm transition-all hover:scale-110 ${useDarkText ? "text-gray-800 hover:text-primary" : "text-white hover:text-white/80"}`}>المحلات</Link>
                        <Link to="/products" className={`font-black text-sm transition-all hover:scale-110 ${useDarkText ? "text-gray-800 hover:text-primary" : "text-white hover:text-white/80"}`}>المنتجات</Link>
                        <Link to="/products?flash_sale=true" className="flex items-center gap-2 font-black text-sm transition-all hover:scale-110 group">
                            <span className="relative flex h-2 w-2">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
                            </span>
                            <span className={isScrolled ? "text-red-600" : "text-red-400"}>العروض</span>
                        </Link>
                        <Link to="/products?sort=trending" className={`font-black text-sm transition-all hover:scale-110 ${useDarkText ? "text-gray-800 hover:text-primary" : "text-white hover:text-white/80"}`}>الأكثر مبيعاً</Link>
                    </div>
                </div>
            </div>
        </nav>
    );
};
