import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { useCart } from '@/contexts/CartContext';
import { ShoppingCart } from 'lucide-react';

interface ProductCardProps {
  id: string;
  name_ar: string;
  description_ar?: string;
  price: number;
  image_url?: string;
}

export const ProductCard = ({
  id,
  name_ar,
  description_ar,
  price,
  image_url,
}: ProductCardProps) => {
  const { addItem } = useCart();

  const handleAddToCart = () => {
    addItem({ id, name_ar, price, image_url });
  };

  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow group">
      <div className="aspect-square overflow-hidden bg-muted">
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
      
      <CardContent className="p-4">
        <h3 className="font-bold text-lg mb-1 line-clamp-1">{name_ar}</h3>
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
        <Button
          onClick={handleAddToCart}
          className="w-full bg-secondary hover:bg-secondary/90"
        >
          <ShoppingCart className="ml-2 h-4 w-4" />
          إضافة إلى السلة
        </Button>
      </CardFooter>
    </Card>
  );
};
