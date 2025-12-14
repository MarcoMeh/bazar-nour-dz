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
    <div className={cn("group flex flex-col space-y-3 relative", className)}>
      <Link to={`/product/${id}`} className="block relative group-hover:-translate-y-1 transition-transform duration-300">
        <div className="relative aspect-[4/5] md:aspect-square w-full overflow-hidden rounded-2xl bg-gray-50 border border-gray-100 shadow-sm">

          {image_url ? (
            <img
              src={image_url}
              alt={name_ar}
              loading="lazy"
              className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-gray-200">
              <ShoppingBag className="h-10 w-10" />
            </div>
          )}

          {/* STATUS BADGES */}
          <div className="absolute top-2.5 left-2.5 flex flex-col gap-1.5 z-10">
            {is_sold_out ? (
              <span className="bg-red-500/90 backdrop-blur-sm text-white text-[10px] font-bold px-2 py-1 rounded-full">
                نفد
              </span>
            ) : is_free_delivery && (
              <span className="bg-emerald-500/90 backdrop-blur-sm text-white text-[10px] font-bold px-2 py-1 rounded-full">
                توصيل مجاني
              </span>
            )}
          </div>

          {/* WISHLIST BUTTON - FIXED CENTERING */}
          <button
            onClick={handleWishlistToggle}
            className="absolute top-2.5 right-2.5 h-9 w-9 flex items-center justify-center rounded-full bg-white/90 backdrop-blur-sm text-gray-400 hover:text-red-500 hover:bg-white shadow-sm border border-gray-100/50 transition-all active:scale-95 z-20"
          >
            {/* لاحظ هنا: fill-current للتحكم الكامل في اللون */}
            <Heart
              className={cn("h-5 w-5 transition-transform", isWishlisted && "fill-red-500 text-red-500 scale-110")}
              strokeWidth={isWishlisted ? 0 : 2}
            />
          </button>
        </div>
      </Link>

      {/* PRODUCT INFO */}
      <div className="px-1 space-y-1">
        <div className="flex justify-between items-start gap-2">
          <Link to={`/product/${id}`}>
            <h3 className="font-bold text-gray-800 text-sm leading-snug line-clamp-2 min-h-[2.5em] hover:text-black transition-colors">
              {name_ar}
            </h3>
          </Link>

          {/* ADD BUTTON */}
          <Button
            size="icon"
            disabled={is_sold_out}
            onClick={handleAddToCart}
            className={cn(
              "h-8 w-8 rounded-full shrink-0 shadow-sm transition-all active:scale-90",
              is_sold_out ? "bg-gray-100 text-gray-300" : "bg-black text-white hover:bg-gray-800 hover:shadow-md"
            )}
          >
            {is_sold_out ? <span className="text-xs font-bold">×</span> : <Plus className="h-4 w-4" />}
          </Button>
        </div>

        <div className="flex items-center gap-2">
          <span className="font-black text-gray-900 text-base">
            {price.toLocaleString()} <span className="text-[10px] font-normal text-gray-500">دج</span>
          </span>
          {brand && <span className="text-[9px] bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded-md">{brand}</span>}
        </div>
      </div>
    </div>
  );
};