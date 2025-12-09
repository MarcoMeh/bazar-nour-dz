import { Link } from 'react-router-dom';
import { useWishlist } from '@/contexts/WishlistContext';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Trash2, ShoppingCart, Heart } from 'lucide-react';
import { useCart } from '@/contexts/CartContext';
import { toast } from 'sonner';
import SEO from '@/components/SEO';

const Wishlist = () => {
    const { wishlist, removeFromWishlist, clearWishlist, wishlistCount } = useWishlist();
    const { addItem } = useCart();

    const handleAddToCart = (item: any) => {
        addItem({
            id: item.id,
            name_ar: item.name_ar,
            price: item.price,
            image_url: item.image_url,
            ownerId: item.store_id,
            is_free_delivery: false,
        });
    };

    if (wishlistCount === 0) {
        return (
            <div className="min-h-screen flex flex-col">
                <SEO
                    title="المفضلة"
                    description="قائمة المنتجات المفضلة لديك في بازارنا"
                />

                <main className="flex-1 container mx-auto px-4 py-16">
                    <Card className="p-12 text-center max-w-2xl mx-auto">
                        <div className="mb-6 flex justify-center">
                            <div className="w-24 h-24 rounded-full bg-muted flex items-center justify-center">
                                <Heart className="h-12 w-12 text-muted-foreground" />
                            </div>
                        </div>

                        <h1 className="text-3xl font-bold mb-4">قائمة المفضلة فارغة</h1>
                        <p className="text-muted-foreground mb-8 text-lg">
                            لم تقم بإضافة أي منتجات إلى المفضلة بعد.
                            ابدأ بتصفح منتجاتنا واحفظ ما يعجبك!
                        </p>

                        <Link to="/products">
                            <Button size="lg" className="rounded-full px-8">
                                تصفح المنتجات
                            </Button>
                        </Link>
                    </Card>
                </main>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex flex-col bg-[#FAFAFA]">
            <SEO
                title={`المفضلة (${wishlistCount})`}
                description="قائمة المنتجات المفضلة لديك في بازارنا"
            />

            <main className="flex-1 container mx-auto px-4 py-8">
                {/* Header */}
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h1 className="text-3xl md:text-4xl font-bold mb-2">
                            <Heart className="inline h-8 w-8 text-red-500 fill-red-500 ml-2" />
                            قائمة المفضلة
                        </h1>
                        <p className="text-muted-foreground">
                            لديك {wishlistCount} {wishlistCount === 1 ? 'منتج' : 'منتجات'} في المفضلة
                        </p>
                    </div>

                    {wishlistCount > 0 && (
                        <Button
                            variant="outline"
                            onClick={clearWishlist}
                            className="gap-2"
                        >
                            <Trash2 className="h-4 w-4" />
                            مسح الكل
                        </Button>
                    )}
                </div>

                {/* Products Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {wishlist.map((item) => (
                        <Card key={item.id} className="overflow-hidden hover:shadow-lg transition-all group">
                            <Link to={`/product/${item.id}`}>
                                <div className="aspect-square relative bg-muted">
                                    {item.image_url ? (
                                        <img
                                            src={item.image_url}
                                            alt={item.name_ar}
                                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                        />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center">
                                            <span className="text-6xl opacity-20">📦</span>
                                        </div>
                                    )}

                                    {/* Remove Button */}
                                    <Button
                                        size="icon"
                                        variant="ghost"
                                        className="absolute top-2 right-2 bg-white/90 hover:bg-white rounded-full shadow-md"
                                        onClick={(e) => {
                                            e.preventDefault();
                                            e.stopPropagation();
                                            removeFromWishlist(item.id);
                                        }}
                                    >
                                        <Trash2 className="h-4 w-4 text-red-500" />
                                    </Button>
                                </div>
                            </Link>

                            <div className="p-4 space-y-3">
                                <Link to={`/product/${item.id}`}>
                                    <h3 className="font-semibold text-lg hover:text-primary transition-colors line-clamp-2">
                                        {item.name_ar}
                                    </h3>
                                </Link>

                                <div className="flex items-center justify-between">
                                    <span className="text-2xl font-bold text-primary">
                                        {item.price.toFixed(2)} دج
                                    </span>
                                </div>

                                <Button
                                    className="w-full gap-2"
                                    onClick={() => handleAddToCart(item)}
                                >
                                    <ShoppingCart className="h-4 w-4" />
                                    إضافة للسلة
                                </Button>
                            </div>
                        </Card>
                    ))}
                </div>

                {/* Continue Shopping */}
                <div className="mt-12 text-center">
                    <Link to="/products">
                        <Button variant="outline" size="lg" className="rounded-full px-8">
                            متابعة التسوق
                        </Button>
                    </Link>
                </div>
            </main>
        </div>
    );
};

export default Wishlist;
