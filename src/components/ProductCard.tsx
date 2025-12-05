import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { useCart } from '@/contexts/CartContext';
import { ShoppingCart, Eye, Heart } from 'lucide-react';
import { useState } from 'react';

interface ProductCardProps {
  id: string;
  name_ar: string;
  description_ar?: string;
  price: number;
  image_url?: string;
  additional_images?: string[];
  is_delivery_home_available: boolean;
  is_delivery_desktop_available: boolean;
  is_sold_out: boolean;
  is_free_delivery: boolean;
  store_id: string;
  colors?: string[];
  sizes?: string[];
  onQuickView?: (product: any) => void;
  onAddToWishlist?: (productId: string) => void;
}

export const ProductCard = ({
  id,
  name_ar,
  description_ar,
  price,
  image_url,
  additional_images,
  is_delivery_home_available,
  is_delivery_desktop_available,
  is_sold_out,
  is_free_delivery,
  store_id,
  colors,
  sizes,
  onQuickView,
  onAddToWishlist,
}: ProductCardProps) => {
  const { addItem } = useCart();
  const navigate = useNavigate();
  const [isWishlisted, setIsWishlisted] = useState(false);

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    // If product has options, redirect to detail page
    if ((colors && colors.length > 0) || (sizes && sizes.length > 0)) {
      navigate(`/product/${id}`);
      return;
    }

    // Only allow adding to cart if not sold out
    if (!is_sold_out) {
      console.log("Adding from card with store_id:", store_id);
      addItem({
        id,
        name_ar,
        price,
        image_url,
        ownerId: store_id
      });
    }
  };

  const handleQuickView = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (onQuickView) {
      onQuickView({
        id,
        name: name_ar,
        description: description_ar,
        price,
        image_url,
        is_delivery_home_available,
        is_delivery_desktop_available,
        is_sold_out,
        is_free_delivery,
        store_id,
        colors,
        sizes
      });
    }
  };

  const handleWishlist = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsWishlisted(!isWishlisted);
    if (onAddToWishlist) {
      onAddToWishlist(id);
    }
  };

  return (
    <Card className="card-3d overflow-hidden hover:shadow-xl transition-all duration-300 group border-muted hover:border-accent/30 relative">
      <Link to={`/product/${id}`}>
        <div className="aspect-square overflow-hidden bg-gradient-to-br from-muted to-muted/50 relative">
          {image_url ? (
            <>
              <img
                src={image_url}
                alt={name_ar}
                loading="lazy"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
              {additional_images && additional_images.length > 0 && (
                <img
                  src={additional_images[0]}
                  alt={name_ar}
                  loading="lazy"
                  className="absolute inset-0 w-full h-full object-cover opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                />
              )}
            </>
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-muted to-accent/10">
              <span className="text-6xl opacity-20">📦</span>
            </div>
          )}

          {/* Quick Actions Overlay */}
          <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center gap-2">
            {onQuickView && (
              <Button
                size="icon"
                variant="secondary"
                className="rounded-full shadow-lg hover:scale-110 transition-transform"
                onClick={handleQuickView}
              >
                <Eye className="h-5 w-5" />
              </Button>
            )}
          </div>
        </div>
      </Link>

      {/* Wishlist Button */}
      {onAddToWishlist && (
        <Button
          size="icon"
          variant="ghost"
          className="absolute top-2 right-2 z-20 bg-white/80 hover:bg-white rounded-full shadow-sm opacity-0 group-hover:opacity-100 transition-all duration-300"
          onClick={handleWishlist}
        >
          <Heart className={`h-5 w-5 ${isWishlisted ? "fill-red-500 text-red-500" : ""}`} />
        </Button>
      )}

      {/* Badges for status and delivery */}
      <div className="absolute top-2 left-2 flex flex-col gap-1 z-10 pointer-events-none">
        {is_free_delivery && (
          <span className="bg-green-600 text-white text-xs px-2 py-1 rounded-full shadow-md">
            توصيل مجاني
          </span>
        )}
        {is_delivery_home_available && (
          <span className="bg-blue-600 text-white text-xs px-2 py-1 rounded-full shadow-md">
            توصيل للمنزل
          </span>
        )}
        {is_delivery_desktop_available && (
          <span className="bg-purple-600 text-white text-xs px-2 py-1 rounded-full shadow-md">
            استلام من المكتب
          </span>
        )}
      </div>

      {is_sold_out && (
        <div className="absolute top-2 right-2 bg-red-600 text-white text-sm px-3 py-1 rounded-full shadow-lg z-10">
          نفد
        </div>
      )}

      <CardContent className="p-4">
        <Link to={`/product/${id}`}>
          <h3 className="font-bold text-lg mb-1 line-clamp-1 hover:text-primary transition-colors">{name_ar}</h3>
        </Link>
        {description_ar && (
          <p className="text-sm text-muted-foreground line-clamp-2 mb-2">
            {description_ar}
          </p>
        )}
        <p className="text-accent font-bold text-xl">
          {price.toFixed(2)} <span className="text-sm">دج</span>
        </p>
      </CardContent>

      <CardFooter className="p-4 pt-0">
        {is_sold_out ? (
          <Button
            disabled
            className="w-full bg-red-500 text-black cursor-not-allowed button-3d"
          >
            Sold out
          </Button>
        ) : (
          <Button
            onClick={handleAddToCart}
            className="button-3d w-full bg-secondary hover:bg-secondary/90 hover:shadow-lg transition-all duration-300"
          >
            <ShoppingCart className="ml-2 h-4 w-4" />
            إضافة إلى السلة
          </Button>
        )}
      </CardFooter>
    </Card>
  );
};