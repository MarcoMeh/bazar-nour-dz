import { Link } from 'react-router-dom';
import { ShoppingCart, Search, Menu } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useCart } from '@/contexts/CartContext';
import { Badge } from '@/components/ui/badge';
import logo from '@/assets/bazzarna-logo.jpeg';

export const Header = () => {
  const { totalItems } = useCart();

  return (
    <header className="sticky top-0 z-50 bg-card/95 backdrop-blur-md border-b shadow-md">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16 gap-4">
          {/* Cart Button */}
          <Link to="/cart" className="relative">
            <Button variant="ghost" size="icon" className="relative">
              <ShoppingCart className="h-5 w-5" />
              {totalItems > 0 && (
                <Badge className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 bg-accent text-accent-foreground">
                  {totalItems}
                </Badge>
              )}
            </Button>
          </Link>

          {/* Products Button */}
          <Link to="/products">
            <Button variant="ghost">المنتجات</Button>
          </Link>

          {/* Search Bar */}
          <div className="flex-1 max-w-md"> {/* Changed from Link to div as the Link is now the button */}
            <div className="relative">
              <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input
                type="search"
                placeholder="ابحث عن المنتجات..."
                className="w-full h-10 pr-10 pl-4 rounded-lg border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>
          </div>

          {/* Logo */}
          <Link to="/" className="flex items-center gap-2">
            <img src={logo} alt="Bazzarna" className="h-10 w-auto" />
          </Link>
        </div>
      </div>
    </header>
  );
};