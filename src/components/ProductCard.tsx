import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useCart } from '@/contexts/CartContext';
import { useWishlist } from '@/contexts/WishlistContext';
import { ShoppingBag, Eye, Heart, Plus } from 'lucide-react';
import { cn } from "@/lib/utils";

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
  brand?: string;
  onQuickView?: (product: any) => void;
  onAddToWishlist?: (productId: string) => void;
  className?: string;
}

export const ProductCard = ({
  id,
  name_ar,
  price,
  image_url,
  additional_images,
  is_sold_out,
  is_free_delivery,
  store_id,
  colors,
  sizes,
  brand,
  onQuickView,
  className,
}: ProductCardProps) => {
  const { addItem } = useCart();
  const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist();
  const navigate = useNavigate();
  const isWishlisted = isInWishlist(id);

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if ((colors && colors.length > 0) || (sizes && sizes.length > 0)) {
      navigate(`/product/${id}`);
      return;
    }
    if (!is_sold_out) {
      addItem({ id, name_ar, price, image_url, ownerId: store_id, is_free_delivery });
    }
  };

  const handleWishlistToggle = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (isWishlisted) removeFromWishlist(id);
    else addToWishlist({ id, name_ar, price, image_url, store_id });
  };

  const handleQuickView = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (onQuickView) {
      onQuickView({ id, name: name_ar, price, image_url, is_sold_out, store_id });
    }
  };

  return (
    <div
      className={cn(
        "group flex flex-col space-y-4 relative p-3 rounded-[2rem] transition-all duration-500",
        "bg-white/10 backdrop-blur-2xl border border-white/20 shadow-2xl hover:shadow-[0_20px_60px_-15px_rgba(37,99,235,0.2)]",
        "hover:-translate-y-2 hover:bg-white/20",
        className
      )}
    >
      <Link to={`/product/${id}`} className="block relative">
        <div
          className="relative aspect-[4/5] md:aspect-square w-full overflow-hidden shadow-inner bg-gray-50/10"
          style={{ borderRadius: '1.5rem' }}
        >
          {image_url ? (
            <img
              src={image_url}
              alt={name_ar}
              loading="lazy"
              className="h-full w-full object-cover transition-transform duration-1000 group-hover:scale-110"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-gray-400">
              <ShoppingBag className="h-10 w-10" />
            </div>
          )}

          {/* GLASSY OVERLAY SHINE */}
          <div className="absolute inset-0 bg-gradient-to-tr from-white/10 via-transparent to-transparent pointer-events-none transition-opacity duration-500 group-hover:opacity-100 opacity-0"></div>

          {/* STATUS BADGES */}
          <div className="absolute top-3 left-3 flex flex-col gap-2 z-10">
            {is_sold_out ? (
              <span className="bg-red-500/80 backdrop-blur-md text-white text-[10px] font-black px-3 py-1 rounded-full shadow-lg border border-white/10">
                نفد
              </span>
            ) : is_free_delivery && (
              <span className="bg-primary/80 backdrop-blur-md text-white text-[10px] font-black px-3 py-1 rounded-full shadow-lg border border-white/10">
                توصيل مجاني
              </span>
            )}
          </div>

          {/* WISHLIST BUTTON - CRYSTAL STYLE */}
          <button
            onClick={handleWishlistToggle}
            className="absolute top-3 right-3 h-10 w-10 flex items-center justify-center rounded-full bg-white/40 backdrop-blur-xl text-gray-600 hover:text-red-500 hover:bg-white/80 shadow-xl border border-white/20 transition-all active:scale-75 z-20"
          >
            <Heart
              className={cn("h-5 w-5 transition-transform duration-300", isWishlisted && "fill-red-500 text-red-500 scale-125")}
              strokeWidth={isWishlisted ? 0 : 2.5}
            />
          </button>
        </div>
      </Link>

      {/* PRODUCT INFO */}
      <div className="px-2 pb-1 space-y-2">
        <div className="flex justify-between items-start gap-3">
          <div className="flex-1">
            <Link to={`/product/${id}`}>
              <h3 className="font-bold text-sm md:text-base leading-tight line-clamp-2 min-h-[2.4em] text-gray-800 hover:text-primary transition-colors">
                {name_ar}
              </h3>
            </Link>
            <div className="mt-2 flex items-center gap-2">
              <span className="font-black text-gray-900 text-lg">
                {price.toLocaleString()} <span className="text-xs font-medium opacity-60">دج</span>
              </span>
            </div>
          </div>

          {/* ADD BUTTON - PREMIUM 3D STYLE */}
          <Button
            size="icon"
            disabled={is_sold_out}
            onClick={handleAddToCart}
            className={cn(
              "h-12 w-12 shrink-0 rounded-2xl transition-all active:scale-95 duration-300 shadow-xl",
              is_sold_out
                ? "bg-gray-200 text-gray-400"
                : "bg-gradient-to-b from-primary to-primary-dark text-white hover:shadow-primary/30 hover:shadow-2xl hover:-translate-y-1"
            )}
          >
            {is_sold_out ? <span className="text-sm font-black">×</span> : <Plus className="h-6 w-6" />}
          </Button>
        </div>

        {brand && (
          <div className="flex items-center gap-1 opacity-60 text-[10px] font-bold">
            <span className="bg-gray-200/50 px-2 py-0.5 rounded-md border border-black/5">{brand}</span>
          </div>
        )}
      </div>
    </div>
  );
};