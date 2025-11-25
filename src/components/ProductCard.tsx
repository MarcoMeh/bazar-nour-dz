import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { useCart } from '@/contexts/CartContext';
import { ShoppingCart } from 'lucide-react';

// Updated ProductCardProps to include new fields
interface ProductCardProps {
  id: string;
  name_ar: string;
  description_ar?: string;
  price: number;
  image_url?: string;
  is_delivery_home_available: boolean; // New
  is_delivery_desktop_available: boolean; // New
  is_sold_out: boolean; // New
  is_free_delivery: boolean; // New
}

export const ProductCard = ({
  id,
  name_ar,
  description_ar,
  price,
  image_url,
  is_delivery_home_available, // Destructure new props
  is_delivery_desktop_available,
  is_sold_out,
  is_free_delivery,
}: ProductCardProps) => {
  const { addItem } = useCart();

  const handleAddToCart = () => {
    // Only allow adding to cart if not sold out
    if (!is_sold_out) {
      addItem({ id, name_ar, price, image_url });
    }
  };

  return (
    <Card className="card-3d overflow-hidden hover:shadow-xl transition-all duration-300 group border-muted hover:border-accent/30 relative"> {/* Added 'relative' for badge positioning */}
      <Link to={`/product/${id}`}>
        <div className="aspect-square overflow-hidden bg-gradient-to-br from-muted to-muted/50">
          {image_url ? (
            <img
              src={image_url}
              alt={name_ar}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-muted to-accent/10">
              <span className="text-6xl opacity-20">📦</span>
            </div>
          )}
        </div>
      </Link>
      
      {/* Badges for status and delivery */}
      <div className="absolute top-2 left-2 flex flex-col gap-1 z-10">
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