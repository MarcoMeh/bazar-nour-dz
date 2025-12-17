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
        <nav className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <div className="container flex h-16 items-center justify-between">
                {/* Mobile Menu */}
                <div className="flex items-center md:hidden">
                    <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
                        <SheetTrigger asChild>
                            <Button variant="ghost" size="icon" className="mr-2">
                                <Menu className="h-5 w-5" />
                                <span className="sr-only">القائمة</span>
                            </Button>
                        </SheetTrigger>
                        <SheetContent side="right" className="w-[300px] sm:w-[400px]">
                            <nav className="flex flex-col gap-4 mt-8">
                                <form onSubmit={handleSearch} className="relative w-full mb-4">
                                    <Search className="absolute right-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                                    <Input
                                        type="search"
                                        placeholder="ابحث عن منتج..."
                                        className="w-full bg-background pr-8 pl-4"
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                    />
                                </form>
                                <Link to="/" className="text-lg font-semibold hover:text-primary" onClick={() => setIsSheetOpen(false)}>
                                    الرئيسية
                                </Link>
                                <Link to="/products" className="text-lg font-semibold hover:text-primary" onClick={() => setIsSheetOpen(false)}>
                                    المنتجات
                                </Link>
                                <Link to="/stores" className="text-lg font-semibold hover:text-primary" onClick={() => setIsSheetOpen(false)}>
                                    المحلات
                                </Link>
                                {user ? (
                                    <>
                                        <div className="h-px bg-border my-2" />
                                        {(userRole === 'admin' || userRole === 'store_owner') && (
                                            <Link
                                                to={userRole === 'admin' ? '/admin' : '/store-dashboard'}
                                                className="text-lg font-bold text-primary flex items-center gap-2 bg-primary/5 p-2 rounded-lg"
                                                onClick={() => setIsSheetOpen(false)}
                                            >
                                                <LayoutDashboard className="h-5 w-5" />
                                                {userRole === 'admin' ? 'لوحة التحكم' : 'لوحة المتجر'}
                                            </Link>
                                        )}
                                        <Link to="/my-orders" className="text-lg font-semibold hover:text-primary flex items-center gap-2" onClick={() => setIsSheetOpen(false)}>
                                            <Package className="h-5 w-5" />
                                            طلباتي
                                        </Link>
                                        <Link to={userRole === 'store_owner' ? "/store-dashboard/profile" : "/profile"} className="text-lg font-semibold hover:text-primary flex items-center gap-2" onClick={() => setIsSheetOpen(false)}>
                                            <Settings className="h-5 w-5" />
                                            الإعدادات
                                        </Link>
                                        <button onClick={() => { handleLogout(); setIsSheetOpen(false); }} className="text-lg font-semibold hover:text-destructive flex items-center gap-2 text-right w-full">
                                            <LogOut className="h-5 w-5" />
                                            تسجيل الخروج
                                        </button>
                                    </>
                                ) : (
                                    <>
                                        <div className="h-px bg-border my-2" />
                                        <Link to="/login" className="text-lg font-semibold hover:text-primary" onClick={() => setIsSheetOpen(false)}>
                                            تسجيل الدخول
                                        </Link>
                                    </>
                                )}
                            </nav>
                        </SheetContent>
                    </Sheet>
                </div>

                {/* Logo */}
                <div className="flex items-center gap-2">
                    <Link to="/" className="flex items-center gap-2">
                        {settings?.logo_url ? (
                            <img src={settings.logo_url} alt={settings.site_name} className="h-10 w-auto object-contain" />
                        ) : (
                            <span className="text-2xl font-bold text-primary">{settings?.site_name || "بازارنا"}</span>
                        )}
                    </Link>
                </div>

                {/* Desktop Navigation */}
                <div className="hidden md:flex items-center gap-6 mx-6">
                    <Link to="/" className="text-sm font-medium transition-colors hover:text-primary">
                        الرئيسية
                    </Link>
                    <Link to="/products" className="text-sm font-medium transition-colors hover:text-primary">
                        المنتجات
                    </Link>
                    <Link to="/stores" className="text-sm font-medium transition-colors hover:text-primary">
                        المحلات
                    </Link>
                </div>

                {/* Search Bar */}
                <div className="hidden md:flex flex-1 max-w-sm items-center gap-2">
                    <form onSubmit={handleSearch} className="relative w-full">
                        <Search className="absolute right-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                            type="search"
                            placeholder="ابحث عن منتج..."
                            className="w-full bg-background pr-8 pl-4"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </form>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2">
                    {/* Dashboard Icon - Clear but hidden (Only for authorized users) */}
                    <DashboardIcon />

                    <Link to="/cart">
                        <Button variant="ghost" size="icon" className="relative">
                            <ShoppingCart className="h-5 w-5" />
                            <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-primary text-[10px] font-bold text-primary-foreground flex items-center justify-center">
                                {totalItems}
                            </span>
                            <span className="sr-only">السلة</span>
                        </Button>
                    </Link>

                    {user ? (
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon">
                                    <User className="h-5 w-5" />
                                    <span className="sr-only">حسابي</span>
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-56">
                                <DropdownMenuLabel>حسابي</DropdownMenuLabel>
                                <DropdownMenuSeparator />

                                {userRole === 'store_owner' ? (
                                    <>
                                        <DropdownMenuItem asChild>
                                            <Link to="/store-dashboard" className="cursor-pointer flex items-center gap-2">
                                                <LayoutDashboard className="h-4 w-4" />
                                                <span>لوحة التحكم</span>
                                            </Link>
                                        </DropdownMenuItem>
                                        <DropdownMenuItem asChild>
                                            <Link to="/store-dashboard/products" className="cursor-pointer flex items-center gap-2">
                                                <Package className="h-4 w-4" />
                                                <span>المنتجات</span>
                                            </Link>
                                        </DropdownMenuItem>
                                        <DropdownMenuItem asChild>
                                            <Link to="/store-dashboard/orders" className="cursor-pointer flex items-center gap-2">
                                                <ShoppingCart className="h-4 w-4" />
                                                <span>الطلبات</span>
                                            </Link>
                                        </DropdownMenuItem>
                                        <DropdownMenuItem asChild>
                                            <Link to="/store-dashboard/profile" className="cursor-pointer flex items-center gap-2">
                                                <Settings className="h-4 w-4" />
                                                <span>الإعدادات</span>
                                            </Link>
                                        </DropdownMenuItem>
                                    </>
                                ) : userRole === 'admin' ? (
                                    <>
                                        <DropdownMenuItem asChild>
                                            <Link to="/admin" className="cursor-pointer flex items-center gap-2">
                                                <LayoutDashboard className="h-4 w-4" />
                                                <span>لوحة الإدارة</span>
                                            </Link>
                                        </DropdownMenuItem>
                                        <DropdownMenuItem asChild>
                                            <Link to="/admin/control" className="cursor-pointer flex items-center gap-2">
                                                <Settings className="h-4 w-4" />
                                                <span>التحكم بالموقع</span>
                                            </Link>
                                        </DropdownMenuItem>
                                        <DropdownMenuItem asChild>
                                            <Link to="/admin/settings" className="cursor-pointer flex items-center gap-2">
                                                <User className="h-4 w-4" />
                                                <span>إعدادات الحساب</span>
                                            </Link>
                                        </DropdownMenuItem>
                                    </>
                                ) : (
                                    <>
                                        <DropdownMenuItem asChild>
                                            <Link to="/my-orders" className="cursor-pointer flex items-center gap-2">
                                                <Package className="h-4 w-4" />
                                                <span>طلباتي</span>
                                            </Link>
                                        </DropdownMenuItem>
                                        <DropdownMenuItem asChild>
                                            <Link to="/profile" className="cursor-pointer flex items-center gap-2">
                                                <Settings className="h-4 w-4" />
                                                <span>الإعدادات</span>
                                            </Link>
                                        </DropdownMenuItem>
                                    </>
                                )}

                                <DropdownMenuSeparator />
                                <DropdownMenuItem onClick={handleLogout} className="cursor-pointer text-destructive focus:text-destructive flex items-center gap-2">
                                    <LogOut className="h-4 w-4" />
                                    <span>تسجيل الخروج</span>
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    ) : (
                        <Link to="/login">
                            <Button variant="ghost" size="icon">
                                <User className="h-5 w-5" />
                                <span className="sr-only">تسجيل الدخول</span>
                            </Button>
                        </Link>
                    )}
                </div>
            </div>
        </nav >
    );
};
