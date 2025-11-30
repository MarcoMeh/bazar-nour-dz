import { Link, useNavigate } from "react-router-dom";
import { Search, ShoppingCart, Menu, User } from "lucide-react";
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
import { useState } from "react";

export const Navbar = () => {
    const { totalItems } = useCart();
    const navigate = useNavigate();
    const [searchQuery, setSearchQuery] = useState("");
    const [isSheetOpen, setIsSheetOpen] = useState(false);

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        if (searchQuery.trim()) {
            navigate(`/products?search=${encodeURIComponent(searchQuery)}`);
            setIsSheetOpen(false);
        }
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
                            </nav>
                        </SheetContent>
                    </Sheet>
                </div>

                {/* Logo */}
                <div className="flex items-center gap-2">
                    <Link to="/" className="flex items-center gap-2">
                        <span className="text-2xl font-bold text-primary">بازارنا</span>
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
                    <Link to="/cart">
                        <Button variant="ghost" size="icon" className="relative">
                            <ShoppingCart className="h-5 w-5" />
                            <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-primary text-[10px] font-bold text-primary-foreground flex items-center justify-center">
                                {totalItems}
                            </span>
                            <span className="sr-only">السلة</span>
                        </Button>
                    </Link>

                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                                <User className="h-5 w-5" />
                                <span className="sr-only">حسابي</span>
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <DropdownMenuLabel>حسابي</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem>
                                <Link to="/my-orders" className="w-full">طلباتي</Link>
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem>
                                <Link to="/login" className="w-full">تسجيل الدخول</Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                                <Link to="/register" className="w-full">إنشاء حساب</Link>
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </div>
        </nav>
    );
};
