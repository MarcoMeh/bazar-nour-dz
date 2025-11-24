import { Link } from 'react-router-dom';
import { ShoppingCart, Search, Menu } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useCart } from '@/contexts/CartContext';
import { Badge } from '@/components/ui/badge';
import logo from '@/assets/bazzarna-logo.jpeg';

export const Header = () => {
  const { totalItems } = useCart();

  return (
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

  );
};
