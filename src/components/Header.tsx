import { Link } from "react-router-dom";
import { useState, useEffect } from "react";
import { ShoppingCart, Search, Menu, User, Heart, Box, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { useCart } from "@/contexts/CartContext";
import { supabase } from "@/integrations/supabase/client";
import logo from "@/assets/bazzarna-logo.jpeg";

export const Header = () => {
  const { totalItems } = useCart();
  const [categories, setCategories] = useState([]);
  const [isAuthenticated, setIsAuthenticated] = useState(true); // Replace with real auth

  useEffect(() => {
    const loadCategories = async () => {
      const { data, error } = await supabase
        .from("categories")
        .select("id, name_ar, slug, parent_id")
        .order("name_ar", { ascending: true });

      if (!error && data) setCategories(data);
    };
    loadCategories();
  }, []);

  const mainCategories = categories.filter((c) => c.parent_id === null);
  const subCategories = (parentId: string) => categories.filter((c) => c.parent_id === parentId);

  return (
    <header className="sticky top-0 z-50 bg-white/90 backdrop-blur border-b border-green-500/40 shadow-sm">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16 gap-2 md:gap-4">

          {/* Left Section: Logo & Mobile Menu */}
          <div className="flex items-center gap-2 md:gap-4">
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden text-green-700 hover:bg-green-100 transition-colors"
            >
              <Menu className="h-5 w-5" />
            </Button>
            <Link to="/" className="flex items-center gap-2 shrink-0">
              <img src={logo} alt="Bazzarna" className="h-10 w-auto rounded-lg shadow-sm" />
            </Link>
          </div>

          {/* Center Section: Search & Navigation */}
          <div className="flex-1 flex items-center justify-center gap-6 px-2">
            <div className="hidden md:flex flex-grow max-w-lg relative">
              <Input
                type="search"
                placeholder="ابحث عن المنتجات..."
                className="pr-10 text-right border-green-300 focus:border-green-500 transition-colors duration-200"
              />
              <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-green-500" />
            </div>

            <nav className="hidden md:flex items-center gap-4">
              {/* Categories Dropdown */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    className="text-green-700 hover:text-green-900 font-semibold text-base transition-colors duration-200 flex items-center gap-1"
                  >
                    <Box className="ml-2 h-4 w-4" />
                    الفئات
                    <ChevronDown className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-60">
                  {mainCategories.map((main) => (
                    <div key={main.id} className="flex flex-col text-right">
                      <div className="px-3 py-2 font-bold text-green-700 border-b">{main.name_ar}</div>
                      {subCategories(main.id).map((sub) => (
                        <DropdownMenuItem key={sub.id} asChild>
                          <Link
                            to={`/products?category=${sub.slug}`}
                            className="flex justify-end text-right pr-4"
                          >
                            {sub.name_ar}
                          </Link>
                        </DropdownMenuItem>
                      ))}
                    </div>
                  ))}
                  <DropdownMenuItem asChild>
                    <Link
                      to="/products"
                      className="flex justify-end text-right font-bold text-primary mt-1"
                    >
                      عرض كل المنتجات
                    </Link>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              <Link to="/products">
                <Button variant="ghost" className="text-green-700 hover:text-green-900 font-semibold text-base">
                  المنتجات
                </Button>
              </Link>
              <Link to="/about">
                <Button variant="ghost" className="text-green-700 hover:text-green-900 font-semibold text-base">
                  من نحن
                </Button>
              </Link>
            </nav>
          </div>

          {/* Right Section: User, Wishlist, Cart */}
          <div className="flex items-center gap-2 md:gap-4 shrink-0">
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden text-green-700 hover:bg-green-100 transition-colors"
            >
              <Search className="h-5 w-5" />
            </Button>

            {isAuthenticated ? (
              <Button
                variant="ghost"
                size="icon"
                className="text-green-700 hover:bg-green-100 transition-colors"
              >
                <User className="h-5 w-5" />
              </Button>
            ) : (
              <>
                <Link to="/login" className="hidden sm:block">
                  <Button variant="ghost" className="text-green-700 hover:text-green-900 font-semibold text-base">
                    تسجيل الدخول
                  </Button>
                </Link>
                <Link to="/register" className="hidden sm:block">
                  <Button variant="ghost" className="text-green-700 hover:text-green-900 font-semibold text-base">
                    إنشاء حساب
                  </Button>
                </Link>
                <Link to="/login" className="sm:hidden">
                  <Button variant="ghost" size="icon" className="text-green-700 hover:bg-green-100 transition-colors">
                    <User className="h-5 w-5" />
                  </Button>
                </Link>
              </>
            )}

            <Link to="/wishlist" className="relative">
              <Button variant="ghost" size="icon" className="relative text-green-700 hover:bg-green-100 transition-colors">
                <Heart className="h-5 w-5" />
              </Button>
            </Link>

            <Link to="/cart" className="relative">
              <Button variant="ghost" size="icon" className="relative text-green-700 hover:bg-green-100 transition-colors">
                <ShoppingCart className="h-5 w-5" />
                {totalItems > 0 && (
                  <span className="absolute -top-2 -right-2 bg-green-600 text-white text-xs px-2 py-0.5 rounded-full">
                    {totalItems}
                  </span>
                )}
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
};
