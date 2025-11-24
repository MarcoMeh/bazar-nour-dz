import { Link } from "react-router-dom";
import { useState, useEffect } from "react";
import {
  ShoppingCart,
  Search,
  Menu,
  X,
  ChevronDown,
  ChevronUp,
  Box
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useCart } from "@/contexts/CartContext";
import { supabase } from "@/integrations/supabase/client";
import logo from "@/assets/bazzarna-logo.jpeg";

export const Header = () => {
  const { totalItems } = useCart();
  const [categories, setCategories] = useState([]);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [openCategory, setOpenCategory] = useState<string | null>(null);

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
  const subCategories = (parentId: string) =>
    categories.filter((c) => c.parent_id === parentId);

  return (
<<<<<<< HEAD
    <header className="sticky top-0 z-50 bg-green-600/95 backdrop-blur-md border-b border-green-700 shadow-md transition-all duration-300 ease-in-out">
      <div className="container mx-auto px-4 h-20 flex items-center justify-between">
        {/* Left Section */}
        <div className="flex items-center gap-4 text-white">
          {/* Mobile Menu */}
          <Button variant="ghost" size="icon" className="lg:hidden text-white hover:bg-white/20 transition-colors">
            <Menu className="h-6 w-6 text-white" />
            <span className="sr-only">Open menu</span>
          </Button>

          <Link to="/products" className="hidden lg:block">
            <Button variant="ghost" className="text-lg font-semibold text-white hover:text-gray-200 transition-colors duration-200">
              المنتجات
            </Button>
          </Link>

          <Link to="/about" className="hidden lg:block">
            <Button variant="ghost" className="text-lg font-semibold text-white hover:text-gray-200 transition-colors duration-200">
              من نحن
            </Button>
          </Link>
        </div>

        {/* Center Search */}
        <div className="flex-1 mx-8">
          <div className="relative w-full max-w-2xl mx-auto">
            <input
              type="search"
              placeholder="ابحث عن المنتجات..."
              className="w-full h-12 pr-12 pl-4 rounded-full border border-white bg-transparent text-white placeholder-white/70 focus:outline-none focus:ring-2 focus:ring-white focus:border-transparent transition-all duration-200 shadow-sm"
              aria-label="Search products"
            />
            <Search className="absolute right-4 top-1/2 -translate-y-1/2 h-5 w-5 text-white" />
          </div>
        </div>

        {/* Right Section */}
        <div className="flex items-center gap-4 text-white">
          <Link to="/cart" className="relative ml-4">
            <Button variant="ghost" size="icon" className="relative text-white hover:bg-white/20 transition-colors">
              <ShoppingCart className="h-6 w-6 text-white" />
              {totalItems > 0 && (
                <Badge className="absolute -top-2 -right-2 h-6 w-6 flex items-center justify-center p-0 text-xs font-bold bg-white text-black rounded-full min-w-[24px]">
                  {totalItems}
                </Badge>
              )}
            </Button>
            <span className="sr-only">Shopping Cart</span>
          </Link>

          <Link to="/" className="flex items-center gap-2">
            <img src={logo} alt="Bazzarna" className="h-12 w-auto object-contain" />
          </Link>
        </div>
      </div>
    </header>

=======
    <>
      {/* HEADER */}
      <header className="sticky top-0 z-50 bg-white/90 backdrop-blur border-b border-green-500/40 shadow-sm">
        <div className="container mx-auto px-3">
          <div className="flex items-center justify-between h-16 gap-2">

            {/* LEFT: MENU + LOGO */}
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setMobileOpen(true)}
                className="md:hidden text-green-700 hover:bg-green-100"
              >
                <Menu className="h-5 w-5" />
              </Button>

              <Link to="/" className="flex items-center gap-2 shrink-0">
                <img
                  src={logo}
                  alt="Bazzarna"
                  className="h-9 w-auto rounded-lg shadow-sm"
                />
              </Link>
            </div>

            {/* CENTER DESKTOP NAV */}
            <nav className="hidden md:flex items-center gap-6">
              <Link
                to="/products"
                className="text-green-700 hover:text-green-900 font-semibold"
              >
                المنتجات
              </Link>
              <Link
                to="/productstores"
                className="text-green-700 hover:text-green-900 font-semibold"
              >
                محلاتنا
              </Link>
              <Link
                to="/about"
                className="text-green-700 hover:text-green-900 font-semibold"
              >
                من نحن
              </Link>
            </nav>

            {/* RIGHT: SEARCH + CART */}
            <div className="flex items-center gap-2 shrink-0">
              <Link to="/search">
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-green-700 hover:bg-green-100"
                >
                  <Search className="h-5 w-5" />
                </Button>
              </Link>

              <Link to="/cart" className="relative">
                <Button
                  variant="ghost"
                  size="icon"
                  className="relative text-green-700 hover:bg-green-100"
                >
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

      {/* MOBILE SIDEBAR */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 bg-black/40" onClick={() => setMobileOpen(false)}>
          <div
            className="absolute right-0 top-0 h-full w-72 bg-white shadow-xl p-5 overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* HEADER */}
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-green-700">القائمة</h2>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setMobileOpen(false)}
              >
                <X className="h-6 w-6" />
              </Button>
            </div>

            {/* SEARCH */}
            <div className="mb-4">
              <Input placeholder="ابحث عن منتج..." className="text-right" />
            </div>

            {/* LINKS */}
            <div className="space-y-4">

              <Link
                to="/products"
                className="block text-lg font-semibold text-green-700 text-right"
              >
                كل المنتجات
              </Link>

              {/* CATEGORIES ACCORDION */}
              <div className="border-t pt-3">
                <h3 className="text-green-700 font-bold text-right mb-2">
                  الفئات
                </h3>

                {mainCategories.map((main) => (
                  <div key={main.id} className="mb-2">
                    <button
                      onClick={() =>
                        setOpenCategory(openCategory === main.id ? null : main.id)
                      }
                      className="w-full flex justify-between items-center text-right text-green-800 font-semibold"
                    >
                      {main.name_ar}
                      {openCategory === main.id ? (
                        <ChevronUp className="w-5 h-5" />
                      ) : (
                        <ChevronDown className="w-5 h-5" />
                      )}
                    </button>

                    {openCategory === main.id && (
                      <div className="pl-2 mt-1 space-y-1">
                        {subCategories(main.id).map((sub) => (
                          <Link
                            key={sub.id}
                            to={`/products?category=${sub.slug}`}
                            className="block text-right text-gray-600 pr-2"
                          >
                            {sub.name_ar}
                          </Link>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>

              <Link
                to="/about"
                className="block text-lg font-semibold text-green-700 text-right"
              >
                من نحن
              </Link>
            </div>
          </div>
        </div>
      )}
    </>
>>>>>>> 5c2b0f6ece8db8775ec6c1819f8ec4f67928f520
  );
};
