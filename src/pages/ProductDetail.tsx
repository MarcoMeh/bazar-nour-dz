import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Skeleton } from "@/components/ui/skeleton";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
  type CarouselApi,
} from '@/components/ui/carousel';
import { supabase } from '@/integrations/supabase/client';
import { useCart } from '@/contexts/CartContext';
import { toast } from 'sonner';
import { ArrowRight, ShoppingCart, Truck, Shield, Home, Ruler } from 'lucide-react';
import { PostgrestError } from '@supabase/supabase-js';
import SEO from '@/components/SEO';
import { ReviewsSection } from '@/components/reviews/ReviewsSection';
import { SizeGuideModal } from '@/components/SizeGuideModal';
import { getColorHex, isPearlColor } from '@/lib/colors';

interface Product {
  id: string;
  name: string; // Changed from name_ar
  description?: string; // Changed from description_ar
  price: number;
  image_url?: string;
  additional_images?: string[];
  images?: string[]; // Keep for backward compatibility
  category_id?: string;

  is_delivery_home_available: boolean;
  is_delivery_desk_available: boolean;
  is_sold_out: boolean;
  is_free_delivery: boolean;
  store_id: string;
  colors?: string[];
  sizes?: string[];
}


const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addItem } = useCart();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(0);
  const [selectedColor, setSelectedColor] = useState<string | null>(null);
  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const [api, setApi] = useState<CarouselApi>();
  const [sizeGuideOpen, setSizeGuideOpen] = useState(false);

  useEffect(() => {
    if (id) {
      fetchProduct();
    }
  }, [id]);

  useEffect(() => {
    if (!api) {
      return;
    }

    api.on("select", () => {
      setSelectedImage(api.selectedScrollSnap());
    });
  }, [api]);

  useEffect(() => {
    if (!api) {
      return;
    }
    api.scrollTo(selectedImage);
  }, [selectedImage, api]);

  const fetchProduct = async () => {
    setLoading(true);
    // Explicitly select fields to be safe, including store_id
    const { data, error } = (await supabase
      .from('products')
      .select('*, store_id, is_delivery_home_available, is_delivery_desk_available, is_sold_out, is_free_delivery, colors, sizes, additional_images')
      .eq('id', id)
      .maybeSingle()) as { data: Product | null; error: PostgrestError | null };

    if (error) {
      toast.error('حدث خطأ في تحميل المنتج: ' + error.message);
      setLoading(false);
      return;
    }

    if (!data) {
      toast.error('المنتج غير موجود');
      navigate('/products');
      return;
    }

    console.log("Fetched Product (Raw):", JSON.stringify(data, null, 2));
    console.log("Product Store ID:", data.store_id);
    setProduct(data);
    setLoading(false);
  };

  const handleAddToCart = () => {
    if (product && !product.is_sold_out) {
      // Validate Color Selection
      if (product.colors && product.colors.length > 0 && !selectedColor) {
        toast.error('الرجاء اختيار اللون');
        return;
      }

      // Validate Size Selection
      if (product.sizes && product.sizes.length > 0 && !selectedSize) {
        toast.error('الرجاء اختيار المقاس');
        return;
      }

      console.log("Adding to cart with store_id:", product.store_id);
      addItem({
        id: product.id,
        name_ar: product.name, // Map name to name_ar for CartContext
        price: product.price,
        image_url: product.image_url,
        ownerId: product.store_id,
        color: selectedColor,
        size: selectedSize,
        is_free_delivery: product.is_free_delivery,
        is_delivery_home_available: product.is_delivery_home_available,
        is_delivery_desk_available: product.is_delivery_desk_available,
      });
      toast.success('تمت إضافة المنتج إلى السلة!');
    } else if (product?.is_sold_out) {
      toast.error('عذراً، هذا المنتج نفد من المخزون.');
    }
  };

  const getAllImages = () => {
    if (!product) return [];
    const images = [];
    if (product.image_url) images.push(product.image_url);
    if (product.additional_images && Array.isArray(product.additional_images)) {
      images.push(...product.additional_images);
    } else if (product.images && Array.isArray(product.images)) {
      images.push(...product.images);
    }
    return images;
  };

  const allImages = getAllImages();

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col">
        <main className="flex-1 container mx-auto px-4 py-8">
          <div className="grid md:grid-cols-2 gap-8 mb-12">
            {/* Image Skeleton */}
            <div className="space-y-4">
              <Skeleton className="w-full h-96 rounded-lg" />
              <div className="grid grid-cols-4 gap-2">
                {[1, 2, 3, 4].map((i) => (
                  <Skeleton key={i} className="w-full h-20 rounded-lg" />
                ))}
              </div>
            </div>

            {/* Info Skeleton */}
            <div className="space-y-6">
              <div>
                <Skeleton className="h-10 w-3/4 mb-4" />
                <Skeleton className="h-8 w-1/4 mb-6" />
              </div>

              <div className="flex gap-2 mb-4">
                <Skeleton className="h-8 w-24 rounded-full" />
                <Skeleton className="h-8 w-24 rounded-full" />
              </div>

              <div className="mb-6">
                <Skeleton className="h-6 w-16 mb-3" />
                <div className="flex gap-3">
                  {[1, 2, 3].map((i) => (
                    <Skeleton key={i} className="w-8 h-8 rounded-full" />
                  ))}
                </div>
              </div>

              <div className="mb-6">
                <Skeleton className="h-6 w-16 mb-3" />
                <div className="flex gap-3">
                  {[1, 2, 3].map((i) => (
                    <Skeleton key={i} className="w-12 h-10 rounded-lg" />
                  ))}
                </div>
              </div>

              <Skeleton className="h-32 w-full rounded-lg" />
              <Skeleton className="h-12 w-full rounded-lg" />
            </div>
          </div>
        </main>
      </div>
    );
  }

  if (!product) return null;

  return (
    <div className="min-h-screen flex flex-col">
      <SEO
        title={product.name}
        description={product.description || `تسوق ${product.name} الآن بسعر ${product.price} دج. أفضل جودة وتوصيل سريع.`}
        image={product.image_url}
        type="product"
      />

      <main className="flex-1 container mx-auto px-4 py-8">
        <Button
          variant="ghost"
          onClick={() => navigate(-1)}
          className="mb-6"
        >
          <ArrowRight className="ml-2 h-4 w-4" />
          العودة
        </Button>

        <div className="grid md:grid-cols-2 gap-8 mb-12">
          {/* Images Section */}
          <div className="space-y-4 relative">
            {product.is_sold_out && (
              <div className="absolute top-4 left-4 bg-red-600 text-white text-lg px-4 py-2 rounded-full shadow-xl z-10 font-bold">
                نفد
              </div>
            )}
            {allImages.length > 1 ? (
              <Carousel setApi={setApi} className="w-full">
                <CarouselContent>
                  {allImages.map((image, index) => (
                    <CarouselItem key={index}>
                      <Card className="overflow-hidden border-muted bg-gray-50">
                        <img
                          src={image}
                          alt={`${product.name} - ${index + 1}`}
                          className="w-full aspect-[3/4] object-contain"
                        />
                      </Card>
                    </CarouselItem>
                  ))}
                </CarouselContent>
                <CarouselPrevious />
                <CarouselNext />
              </Carousel>
            ) : (
              <Card className="overflow-hidden border-muted bg-gray-50">
                <img
                  src={product.image_url || '/placeholder.svg'}
                  alt={product.name}
                  className="w-full aspect-[3/4] object-contain"
                />
              </Card>
            )}

            {/* Thumbnail Gallery */}
            {allImages.length > 1 && (
              <div className="grid grid-cols-4 gap-2">
                {allImages.map((image, index) => (
                  <Card
                    key={index}
                    className={`cursor-pointer overflow-hidden transition-all duration-300 ${selectedImage === index
                      ? 'ring-2 ring-primary shadow-lg'
                      : 'opacity-60 hover:opacity-100'
                      }`}
                    onClick={() => setSelectedImage(index)}
                  >
                    <img
                      src={image}
                      alt={`${product.name} thumbnail ${index + 1}`}
                      className="w-full h-20 object-cover"
                    />
                  </Card>
                ))}
              </div>
            )}
          </div>

          {/* Product Info Section */}
          <div className="space-y-6">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold mb-4">
                {product.name}
              </h1>
              <div className="text-3xl font-bold text-primary mb-6">
                {product.price.toFixed(2)} دج
              </div>
            </div>

            {/* Product Status / Delivery Info */}
            <div className="flex flex-wrap gap-2 mb-4">
              {product.is_free_delivery && (
                <span className="inline-flex items-center gap-1 bg-green-100 text-green-700 text-sm px-3 py-1.5 rounded-full font-medium">
                  <Truck className="h-4 w-4" /> توصيل مجاني
                </span>
              )}
              {product.is_delivery_home_available && (
                <span className="inline-flex items-center gap-1 bg-blue-100 text-blue-700 text-sm px-3 py-1.5 rounded-full font-medium">
                  <Truck className="h-4 w-4" /> توصيل للمنزل
                </span>
              )}
              {product.is_delivery_desk_available && (
                <span className="inline-flex items-center gap-1 bg-purple-100 text-purple-700 text-sm px-3 py-1.5 rounded-full font-medium">
                  <Home className="h-4 w-4" /> استلام من المكتب
                </span>
              )}
            </div>

            {/* Color Selection */}
            {product.colors && product.colors.length > 0 && (
              <div className="mb-6">
                <h3 className="font-semibold mb-3">اللون:</h3>
                <div className="flex flex-wrap gap-3">
                  {product.colors.map((color) => (
                    <button
                      key={color}
                      onClick={() => setSelectedColor(color)}
                      className={`w-8 h-8 rounded-full transition-all ${isPearlColor(color) ? 'border-2 border-gray-300' : 'border-2'
                        } ${selectedColor === color
                          ? 'border-primary ring-2 ring-primary ring-offset-2'
                          : 'border-gray-300 hover:border-gray-400'
                        }`}
                      style={{ backgroundColor: getColorHex(color) }}
                      title={color}
                    />
                  ))}
                </div>
                {selectedColor && <p className="text-sm text-muted-foreground mt-1">تم اختيار: {selectedColor}</p>}
              </div>
            )}

            {/* Size Selection */}
            {product.sizes && product.sizes.length > 0 && (
              <div className="mb-6">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-semibold">المقاس:</h3>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setSizeGuideOpen(true)}
                    className="text-primary hover:text-primary/80 gap-2"
                  >
                    <Ruler className="h-4 w-4" />
                    دليل المقاسات
                  </Button>
                </div>
                <div className="flex flex-wrap gap-3">
                  {product.sizes.map((size) => (
                    <button
                      key={size}
                      onClick={() => setSelectedSize(size)}
                      className={`min-w-[3rem] h-10 px-3 rounded-lg border-2 font-medium transition-all ${selectedSize === size
                        ? 'border-primary bg-primary/5 text-primary'
                        : 'border-gray-200 hover:border-gray-300'
                        }`}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {product.description && (
              <Card className="p-6 bg-muted/50 border-muted">
                <h2 className="text-xl font-semibold mb-3">وصف المنتج</h2>
                <p className="text-muted-foreground leading-relaxed whitespace-pre-line">
                  {product.description}
                </p>
              </Card>
            )}

            {/* Add to Cart / Sold Out Button */}
            {product.is_sold_out ? (
              <Button
                size="lg"
                disabled
                className="w-full bg-red-500 text-white cursor-not-allowed shadow-lg"
              >
                نفد
              </Button>
            ) : (
              <Button
                size="lg"
                onClick={handleAddToCart}
                className="w-full shadow-lg hover:shadow-xl transition-all duration-300"
              >
                <ShoppingCart className="ml-2 h-5 w-5" />
                إضافة إلى السلة
              </Button>
            )}

            {/* Features (Original) */}
            <div className="grid grid-cols-2 gap-4">
              <Card className="p-4 text-center border-muted hover:border-accent/40 transition-all duration-300">
                <Truck className="h-8 w-8 mx-auto mb-2 text-primary" />
                <p className="font-semibold">توصيل سريع</p>
                <p className="text-sm text-muted-foreground">لكل الولايات</p>
              </Card>
              <Card className="p-4 text-center border-muted hover:border-accent/40 transition-all duration-300">
                <Shield className="h-8 w-8 mx-auto mb-2 text-primary" />
                <p className="font-semibold">جودة مضمونة</p>
                <p className="text-sm text-muted-foreground">منتجات أصلية</p>
              </Card>
            </div>
          </div>
        </div>

        {/* Reviews Section */}
        <ReviewsSection productId={product.id} />
      </main>

      {/* Size Guide Modal */}
      <SizeGuideModal
        open={sizeGuideOpen}
        onOpenChange={setSizeGuideOpen}
        category="mens"
      />

      {/* Mobile Sticky Add to Cart Bar */}
      <div className="fixed bottom-[64px] left-0 right-0 p-4 bg-white/80 backdrop-blur-md border-t border-gray-200 md:hidden z-40 animate-slide-up">
        {product.is_sold_out ? (
          <Button
            size="lg"
            disabled
            className="w-full bg-red-500 text-white cursor-not-allowed shadow-lg rounded-full"
          >
            نفد
          </Button>
        ) : (
          <Button
            size="lg"
            onClick={handleAddToCart}
            className="w-full shadow-lg hover:shadow-xl transition-all duration-300 rounded-full bg-gradient-to-r from-primary to-secondary"
          >
            <ShoppingCart className="ml-2 h-5 w-5" />
            إضافة إلى السلة
          </Button>
        )}
      </div>

    </div>
  );
};

export default ProductDetail;
