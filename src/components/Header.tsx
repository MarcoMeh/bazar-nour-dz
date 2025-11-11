import { Link } from 'react-router-dom';
import { ShoppingCart, Search, Menu } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useCart } from '@/contexts/CartContext';
import { Badge } from '@/components/ui/badge';
import logo from '@/assets/bazzarna-logo.jpeg';

export const Header = () => {
  const { totalItems } = useCart();

  return (
    <header className="sticky top-0 z-50 bg-white/90 backdrop-blur border-b border-green-500/40 shadow-sm">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16 gap-4">
          {/* Cart button */}
            <Link to="/cart" className="relative">
              <Button
                variant="ghost"
                size="icon"
                className="relative text-green-700 hover:bg-green-100 transition-colors"
              >
                <ShoppingCart className="h-5 w-5" />
                {totalItems > 0 && (
                  <Badge className="absolute -top-2 -right-2 h-5 w-5 flex items-center justify-center p-0 bg-green-600 text-white rounded-full">
                    {totalItems}
                  </Badge>
                )}
              </Button>
            </Link>

          {/* Left Section: Navigation Links */}
          <div className="hidden md:flex items-center gap-6">
            <Link to="/products">
              <Button
                variant="ghost"
                className="text-green-700 hover:text-green-900 font-semibold text-base transition-colors duration-200"
              >
                منتجاتنا
              </Button>
            </Link>

            <Link to="/about">
              <Button
                variant="ghost"
                className="text-green-700 hover:text-green-900 font-semibold text-base transition-colors duration-200"
              >
                من نحن
              </Button>
            </Link>
            <div className="hidden md:block relative w-64">
              <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
              <input
                type="search"
                placeholder="ابحث عن المنتجات..."
                className="w-full h-10 pr-10 pl-4 rounded-full border border-green-400/50 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-green-500 transition-all"
              />
            </div>
          </div>

          {/* Right: Search and Cart */}
          <div className="flex items-center gap-4">
            {/* Search bar (visible on md and larger screens) */}
            

            
            {/* Center: Logo */}
          <Link to="/" className="flex items-center gap-2">
            <img src={logo} alt="Bazzarna" className="h-12 w-auto rounded-lg shadow-sm" />
          </Link>

            {/* Mobile menu button */}
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden text-green-700 hover:bg-green-100 transition-colors"
            >
              <Menu className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
};
