import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '@/components/ui/carousel';
import { supabase } from '@/integrations/supabase/client';
import { useCart } from '@/contexts/CartContext';
import { toast } from 'sonner';
import { ArrowRight, ShoppingCart, Truck, Shield, Home, Package } from 'lucide-react'; // Added Home and Package for delivery icons
import { PostgrestError } from '@supabase/supabase-js'; // Make sure this import is present

// Updated Product interface to include new fields
interface Product {
  id: string;
  name_ar: string;
  description_ar?: string;
  price: number;
  image_url?: string;
  images?: string[];
  category_id?: string;

  is_delivery_home_available: boolean;
  is_delivery_desk_available: boolean; // <-- الصحيح
  is_sold_out: boolean;
  is_free_delivery: boolean;
}


const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addItem } = useCart();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(0);

  useEffect(() => {
    if (id) {
      fetchProduct();
    }
  }, [id]);

  const fetchProduct = async () => {
    setLoading(true);
    // Updated select statement to include all new columns
    // --- CRITICAL CHANGE HERE ---
    const { data, error } = (await supabase
      .from('products')
      .select('*, is_delivery_home_available, is_delivery_desk_available, is_sold_out, is_free_delivery')
      .eq('id', id)
      .maybeSingle()) as { data: Product | null; error: PostgrestError | null }; // Notice Product | null for maybeSingle()
    // --- END CRITICAL CHANGE ---

    if (error) {
      toast.error('حدث خطأ في تحميل المنتج: ' + error.message); // Added error.message for better debugging
      setLoading(false);
      return;
    }

    if (!data) {
      toast.error('المنتج غير موجود');
      navigate('/products');
      return;
    }

    setProduct(data);
    setLoading(false);
  };

  const handleAddToCart = () => {
    if (product && !product.is_sold_out) { // Prevent adding to cart if sold out
      addItem({
        id: product.id,
        name_ar: product.name_ar,
        price: product.price,
        image_url: product.image_url,
      });
      toast.success('تمت إضافة المنتج إلى السلة!'); // Optional: Add a success toast
    } else if (product?.is_sold_out) {
      toast.error('عذراً، هذا المنتج نفد من المخزون.'); // Optional: Inform user if trying to add sold-out item
    }
  };

  const getAllImages = () => {
    if (!product) return [];
    const images = [];
    if (product.image_url) images.push(product.image_url);
    if (product.images && Array.isArray(product.images)) {
      images.push(...product.images);
    }
    return images;
  };

  const allImages = getAllImages();

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 container mx-auto px-4 py-8">
          <div className="animate-pulse">
            <div className="h-96 bg-muted rounded-lg mb-8" />
            <div className="h-8 bg-muted rounded w-3/4 mb-4" />
            <div className="h-4 bg-muted rounded w-1/2 mb-8" />
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (!product) return null;

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

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
          <div className="space-y-4 relative"> {/* Added relative for "Sold Out" badge */}
            {product.is_sold_out && ( // <-- FIXED
              <div className="absolute top-4 left-4 bg-red-600 text-white text-lg px-4 py-2 rounded-full shadow-xl z-10 font-bold">
                نفد
              </div>
            )}
            {allImages.length > 1 ? (
              <Carousel className="w-full">
                <CarouselContent>
                  {allImages.map((image, index) => (
                    <CarouselItem key={index}>
                      <Card className="overflow-hidden border-muted">
                        <img
                          src={image}
                          alt={`${product.name_ar} - ${index + 1}`}
                          className="w-full h-96 object-cover"
                        />
                      </Card>
                    </CarouselItem>
                  ))}
                </CarouselContent>
                <CarouselPrevious />
                <CarouselNext />
              </Carousel>
            ) : (
              <Card className="overflow-hidden border-muted">
                <img
                  src={product.image_url || '/placeholder.svg'}
                  alt={product.name_ar}
                  className="w-full h-96 object-cover"
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
                      alt={`${product.name_ar} thumbnail ${index + 1}`}
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
                {product.name_ar}
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
                  <Home className="h-4 w-4" /> توصيل للمنزل
                </span>
              )}
              {product.is_delivery_desk_available && (
                <span className="inline-flex items-center gap-1 bg-purple-100 text-purple-700 text-sm px-3 py-1.5 rounded-full font-medium">
                  <Package className="h-4 w-4" /> استلام من المكتب
                </span>
              )}
            </div>

            {product.description_ar && (
              <Card className="p-6 bg-muted/50 border-muted">
                <h2 className="text-xl font-semibold mb-3">وصف المنتج</h2>
                <p className="text-muted-foreground leading-relaxed whitespace-pre-line">
                  {product.description_ar}
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
      </main>
      <Footer />
    </div>
  );
};

export default ProductDetail;
