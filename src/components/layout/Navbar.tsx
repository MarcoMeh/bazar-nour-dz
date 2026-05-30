import { Link, useNavigate, useLocation } from "react-router-dom";
import { Search, ShoppingCart, Menu, User, LogOut, Package, Settings, LayoutDashboard, Store, Heart, Home, ShoppingBag, Info, Flame, PhoneCall, Grid, Download, Smartphone } from "lucide-react";
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
import { CartDrawer } from "@/components/CartDrawer";
import { PWAInstallDialog } from "./PWAInstallDialog";

export const Navbar = () => {
    const { data: settings } = useSiteSettings();
    const { totalItems } = useCart();
    const { user, signOut } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const [searchQuery, setSearchQuery] = useState("");
    const [isSheetOpen, setIsSheetOpen] = useState(false);
    const [userRole, setUserRole] = useState<string | null>(null);
    const [loadingRole, setLoadingRole] = useState(false);
    const [isScrolled, setIsScrolled] = useState(false);
    const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
    const [isInstallDialogOpen, setIsInstallDialogOpen] = useState(false);

    useEffect(() => {
        const handleBeforeInstallPrompt = (e: Event) => {
            e.preventDefault();
            setDeferredPrompt(e);
        };
        window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
        return () => window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    }, []);

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

    // Sync URL search param with the input field
    useEffect(() => {
        const params = new URLSearchParams(location.search);
        const query = params.get("search");
        if (query !== null) {
            setSearchQuery(query);
        } else if (location.pathname !== "/products") {
            setSearchQuery("");
        }
    }, [location.search, location.pathname]);

    // Auto-search when typing (debounce)
    useEffect(() => {
        // Skip if it's just the initial load or URL sync setting the state
        const params = new URLSearchParams(location.search);
        const currentQuery = params.get("search") || "";
        
        if (searchQuery === currentQuery) return;

        const timeoutId = setTimeout(() => {
            if (searchQuery.trim()) {
                navigate(`/products?search=${encodeURIComponent(searchQuery.trim())}`);
            } else if (location.pathname === "/products") {
                navigate(`/products`);
            }
        }, 500); // 500ms debounce

        return () => clearTimeout(timeoutId);
    }, [searchQuery, navigate, location.pathname, location.search]);

    useEffect(() => {
        const fetchUserRole = async () => {
            if (!user) {
                setUserRole(null);
                setLoadingRole(false);
                return;
            }

            setLoadingRole(true);
            // 1. Try to get role from metadata first for instant responsiveness
            const metaRole = user.user_metadata?.role || user.app_metadata?.role;
            if (metaRole) {
                setUserRole(metaRole);
                setLoadingRole(false);
            }

            // 2. Fetch/Confirm from profiles table
            try {
                const { data, error } = await supabase
                    .from('profiles')
                    .select('role')
                    .eq('id', user.id)
                    .single();
                
                if (data && data.role) {
                    setUserRole(data.role);
                } else {
                    setUserRole('customer');
                }
            } catch (err) {
                console.error("Critical error fetching user role:", err);
                setUserRole('customer');
            } finally {
                setLoadingRole(false);
            }
        };

        if (user) {
            fetchUserRole();
        } else {
            setUserRole(null);
            setLoadingRole(false);
        }
    }, [user, isSheetOpen]);

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        if (searchQuery.trim()) {
            navigate(`/products?search=${encodeURIComponent(searchQuery.trim())}`);
        } else {
            navigate(`/products`);
        }
        setIsSheetOpen(false);
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

        const isAdminOrSub = userRole === 'admin' || userRole === 'sub_admin';
        const link = isAdminOrSub ? '/admin' : '/store-dashboard';
        const title = isAdminOrSub ? 'لوحة التحكم' : 'لوحة المتجر';

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
                    {/* ACTION ICONS */}
                    <div className="flex items-center gap-1 md:gap-3 shrink-0">
                        <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
                            <SheetTrigger asChild>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className={`flex transition-all rounded-xl h-10 w-10 ${useDarkText ? "text-gray-900 hover:bg-black/5" : "text-white hover:bg-white/20"}`}
                                >
                                    <Menu className="h-6 w-6" />
                                    <span className="sr-only">القائمة</span>
                                </Button>
                            </SheetTrigger>
                            <SheetContent side="right" className="w-[300px] sm:w-[350px] bg-black/80 backdrop-blur-2xl border-l border-white/10 text-white p-6 flex flex-col justify-between">
                                <div className="space-y-8 mt-8">
                                    {/* Brand Logo/Header inside drawer */}
                                    <div className="flex items-center gap-3 pb-6 border-b border-white/10">
                                        {settings?.logo_url ? (
                                            <div className="h-10 w-10 rounded-full bg-white p-1.5 overflow-hidden flex items-center justify-center shadow-lg">
                                                <img src={settings.logo_url} alt={settings.site_name} className="h-full w-full object-contain" />
                                            </div>
                                        ) : null}
                                        <div>
                                            <h3 className="font-black text-lg bg-clip-text text-transparent bg-gradient-to-r from-primary to-indigo-400">
                                                {settings?.site_name || "بازارنا"}
                                            </h3>
                                            <p className="text-[10px] text-white/50">أكبر مول ملابس في الجزائر</p>
                                        </div>
                                    </div>

                                    {/* Navigation Links */}
                                    <nav className="flex flex-col gap-1">
                                        <Link 
                                            to="/" 
                                            className="flex items-center gap-3 px-3 py-3 rounded-xl hover:bg-white/10 transition-all text-sm font-semibold"
                                            onClick={() => setIsSheetOpen(false)}
                                        >
                                            <Home className="h-5 w-5 text-white/70" />
                                            الرئيسية
                                        </Link>
                                        
                                        <Link 
                                            to="/products" 
                                            className="flex items-center gap-3 px-3 py-3 rounded-xl hover:bg-white/10 transition-all text-sm font-semibold"
                                            onClick={() => setIsSheetOpen(false)}
                                        >
                                            <ShoppingBag className="h-5 w-5 text-white/70" />
                                            المنتجات
                                        </Link>

                                        <Link 
                                            to="/stores" 
                                            className="flex items-center gap-3 px-3 py-3 rounded-xl hover:bg-white/10 transition-all text-sm font-semibold"
                                            onClick={() => setIsSheetOpen(false)}
                                        >
                                            <Store className="h-5 w-5 text-white/70" />
                                            المحلات
                                        </Link>

                                        <Link 
                                            to="/wishlist" 
                                            className="flex items-center gap-3 px-3 py-3 rounded-xl hover:bg-white/10 transition-all text-sm font-semibold"
                                            onClick={() => setIsSheetOpen(false)}
                                        >
                                            <Heart className="h-5 w-5 text-white/70" />
                                            المفضلة
                                        </Link>

                                        {/* User Account / Login Section directly under Wishlist */}
                                        {user ? (
                                            <div className="flex flex-col gap-1 mt-1 pt-1 border-t border-white/5">
                                                {loadingRole && (
                                                    <div className="flex items-center gap-2 text-white/40 text-xs py-2 px-3 animate-pulse bg-white/5 rounded-xl">
                                                        <span className="h-2 w-2 rounded-full bg-blue-400 animate-ping"></span>
                                                        <span>جاري تحميل البيانات...</span>
                                                    </div>
                                                )}

                                                {userRole === 'customer' && (
                                                    <Link 
                                                        to="/my-orders" 
                                                        className="flex items-center gap-3 px-3 py-3 rounded-xl hover:bg-white/10 transition-all text-sm font-semibold"
                                                        onClick={() => setIsSheetOpen(false)}
                                                    >
                                                        <Package className="h-5 w-5 text-white/70" />
                                                        طلباتي
                                                    </Link>
                                                )}

                                                {(userRole === 'admin' || userRole === 'sub_admin' || userRole === 'store_owner') && (
                                                    <>
                                                        <Link 
                                                            to={(userRole === 'admin' || userRole === 'sub_admin') ? '/admin' : '/store-dashboard'} 
                                                            className="flex items-center gap-3 px-3 py-3 rounded-xl bg-primary/20 hover:bg-primary/30 transition-all text-sm font-bold text-primary" 
                                                            onClick={() => setIsSheetOpen(false)}
                                                        >
                                                            <LayoutDashboard className="h-5 w-5" />
                                                            {(userRole === 'admin' || userRole === 'sub_admin') ? 'لوحة التحكم' : 'لوحة المتجر'}
                                                        </Link>
                                                        {userRole === 'store_owner' && (
                                                            <Link 
                                                                to="/store-dashboard/profile" 
                                                                className="flex items-center gap-3 px-3 py-3 rounded-xl hover:bg-white/10 transition-all text-sm font-semibold"
                                                                onClick={() => setIsSheetOpen(false)}
                                                            >
                                                                <User className="h-5 w-5 text-white/70" />
                                                                الملف الشخصي
                                                            </Link>
                                                        )}
                                                    </>
                                                )}

                                                <button 
                                                    onClick={() => { handleLogout(); setIsSheetOpen(false); }} 
                                                    className="flex items-center gap-3 px-3 py-3 rounded-xl hover:bg-red-500/10 transition-all text-sm font-bold text-red-500 w-full text-right"
                                                >
                                                    <LogOut className="h-5 w-5" />
                                                    تسجيل الخروج
                                                </button>
                                            </div>
                                        ) : (
                                            <Link 
                                                to="/login" 
                                                className="flex items-center gap-3 px-3 py-3 rounded-xl bg-white/10 hover:bg-white/20 transition-all text-sm font-semibold mt-1"
                                                onClick={() => setIsSheetOpen(false)}
                                            >
                                                <User className="h-5 w-5 text-white/70" />
                                                تسجيل الدخول
                                            </Link>
                                        )}
                                    </nav>
                                </div>

                                {/* Drawer Footer */}
                                <div className="pt-6 border-t border-white/10 space-y-4">
                                    {/* Primary CTAs at the bottom with high contrast */}
                                    <div className="flex flex-col gap-2 px-1 pb-2">
                                        <Link 
                                            to="/seller-register" 
                                            className="flex items-center justify-center gap-3 px-4 py-3 rounded-xl bg-gradient-to-r from-emerald-500/20 to-teal-500/20 text-emerald-400 hover:from-emerald-500/30 hover:to-teal-500/30 border border-emerald-500/20 transition-all text-sm font-bold w-full"
                                            onClick={() => setIsSheetOpen(false)}
                                        >
                                            <Store className="h-5 w-5 text-emerald-400 animate-pulse" />
                                            سجل الآن كتاجر
                                        </Link>

                                        <button 
                                            onClick={() => {
                                                setIsInstallDialogOpen(true);
                                                setIsSheetOpen(false);
                                            }}
                                            className="flex items-center justify-center gap-3 px-4 py-3 rounded-xl bg-gradient-to-r from-primary to-indigo-600 hover:from-primary/90 hover:to-indigo-600/90 text-white font-bold transition-all shadow-[0_4px_20px_rgba(124,58,237,0.3)] w-full text-center"
                                        >
                                            <Smartphone className="h-5 w-5 text-white" />
                                            تحميل تطبيق بازارنا
                                        </button>
                                    </div>

                                    <div className="flex flex-col gap-1 px-3">
                                        <Link 
                                            to="/about" 
                                            className="flex items-center gap-2 text-xs text-white/60 hover:text-white transition-colors"
                                            onClick={() => setIsSheetOpen(false)}
                                        >
                                            <Info className="h-4 w-4" />
                                            من نحن؟
                                        </Link>
                                        <Link 
                                            to="/contact" 
                                            className="flex items-center gap-2 text-xs text-white/60 hover:text-white transition-colors"
                                            onClick={() => setIsSheetOpen(false)}
                                        >
                                            <PhoneCall className="h-4 w-4" />
                                            اتصل بنا / الدعم الفني
                                        </Link>
                                    </div>
                                    <p className="text-[10px] text-white/30 text-center">© بازارنا 2026. كل الحقوق محفوظة.</p>
                                </div>
                            </SheetContent>
                        </Sheet>

                        <CartDrawer useDarkText={useDarkText} />
                    </div>

                    {/* CENTER: Search Bar */}
                    <div className="flex-1 max-w-2xl hidden lg:block">
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

                    {/* RIGHT: Logo (Now Last in DOM -> Renders on physical LEFT in RTL) */}
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
            
            <PWAInstallDialog 
                isOpen={isInstallDialogOpen}
                onClose={() => setIsInstallDialogOpen(false)}
                deferredPrompt={deferredPrompt}
                onInstallSuccess={() => setDeferredPrompt(null)}
            />
        </nav>
    );
};
