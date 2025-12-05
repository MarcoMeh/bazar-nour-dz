import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Heart, ShoppingCart, Star, Truck, Package } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

interface Product {
    id: string;
    name: string;
    description?: string;
    price: number;
    image_url?: string;
    is_sold_out?: boolean;
    is_free_delivery?: boolean;
    home_delivery?: boolean;
    office_delivery?: boolean;
    average_rating?: number;
    view_count?: number;
}

interface QuickViewModalProps {
    product: Product | null;
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onAddToCart?: (productId: string) => void;
    onAddToWishlist?: (productId: string) => void;
}

export function QuickViewModal({
    product,
    open,
    onOpenChange,
    onAddToCart,
    onAddToWishlist,
}: QuickViewModalProps) {
    const [quantity, setQuantity] = useState(1);
    const [isWishlisted, setIsWishlisted] = useState(false);
    const navigate = useNavigate();

    if (!product) return null;

    const handleAddToCart = () => {
        if (onAddToCart) {
            onAddToCart(product.id);
            toast.success("تمت إضافة المنتج إلى السلة");
        }
    };

    const handleWishlist = () => {
        setIsWishlisted(!isWishlisted);
        if (onAddToWishlist) {
            onAddToWishlist(product.id);
        }
        toast.success(isWishlisted ? "تمت الإزالة من المفضلة" : "تمت الإضافة للمفضلة");
    };

    const handleViewFull = () => {
        onOpenChange(false);
        navigate(`/product/${product.id}`);
    };

    const renderStars = (rating: number) => {
        return Array.from({ length: 5 }).map((_, i) => (
            <Star
                key={i}
                className={`h-4 w-4 ${i < Math.floor(rating)
                        ? "fill-yellow-400 text-yellow-400"
                        : "fill-gray-200 text-gray-200"
                    }`}
            />
        ));
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto animate-scale-in">
                <DialogHeader>
                    <DialogTitle className="text-2xl font-bold">{product.name}</DialogTitle>
                </DialogHeader>

                <div className="grid md:grid-cols-2 gap-8">
                    {/* Product Image */}
                    <div className="relative group">
                        <div className="aspect-square rounded-lg overflow-hidden bg-muted">
                            {product.image_url ? (
                                <img
                                    src={product.image_url}
                                    alt={product.name}
                                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                                />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center">
                                    <Package className="h-24 w-24 text-muted-foreground" />
                                </div>
                            )}
                        </div>

                        {/* Quick badges */}
                        <div className="absolute top-4 right-4 flex flex-col gap-2">
                            {product.is_free_delivery && (
                                <Badge className="bg-green-500 text-white shadow-lg">
                                    <Truck className="h-3 w-3 mr-1" />
                                    توصيل مجاني
                                </Badge>
                            )}
                            {product.is_sold_out && (
                                <Badge variant="destructive" className="shadow-lg">
                                    نفد من المخزون
                                </Badge>
                            )}
                        </div>

                        {/* Wishlist button */}
                        <Button
                            variant="ghost"
                            size="icon"
                            className="absolute top-4 left-4 bg-white/90 hover:bg-white shadow-lg"
                            onClick={handleWishlist}
                        >
                            <Heart
                                className={`h-5 w-5 transition-all ${isWishlisted ? "fill-red-500 text-red-500" : ""
                                    }`}
                            />
                        </Button>
                    </div>

                    {/* Product Details */}
                    <div className="flex flex-col gap-4">
                        {/* Rating */}
                        {product.average_rating && product.average_rating > 0 && (
                            <div className="flex items-center gap-2">
                                <div className="flex">{renderStars(product.average_rating)}</div>
                                <span className="text-sm text-muted-foreground">
                                    ({product.average_rating.toFixed(1)})
                                </span>
                            </div>
                        )}

                        {/* Price */}
                        <div className="flex items-baseline gap-2">
                            <span className="text-4xl font-bold text-primary">
                                {product.price.toLocaleString()}
                            </span>
                            <span className="text-xl text-muted-foreground">دج</span>
                        </div>

                        {/* Description */}
                        {product.description && (
                            <p className="text-muted-foreground leading-relaxed">
                                {product.description}
                            </p>
                        )}

                        {/* Delivery Options */}
                        <div className="space-y-2 py-4 border-y">
                            <h4 className="font-semibold">خيارات التوصيل:</h4>
                            <div className="flex flex-wrap gap-2">
                                {product.home_delivery && (
                                    <Badge variant="outline">
                                        <Truck className="h-3 w-3 mr-1" />
                                        توصيل للمنزل
                                    </Badge>
                                )}
                                {product.office_delivery && (
                                    <Badge variant="outline">
                                        <Package className="h-3 w-3 mr-1" />
                                        توصيل للمكتب
                                    </Badge>
                                )}
                            </div>
                        </div>

                        {/* Quantity Selector */}
                        <div className="flex items-center gap-4">
                            <span className="text-sm font-medium">الكمية:</span>
                            <div className="flex items-center border rounded-lg">
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                                    disabled={product.is_sold_out}
                                >
                                    -
                                </Button>
                                <span className="px-4 py-2 min-w-[3rem] text-center">
                                    {quantity}
                                </span>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => setQuantity(quantity + 1)}
                                    disabled={product.is_sold_out}
                                >
                                    +
                                </Button>
                            </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex gap-3 pt-4">
                            <Button
                                className="flex-1"
                                size="lg"
                                onClick={handleAddToCart}
                                disabled={product.is_sold_out}
                            >
                                <ShoppingCart className="ml-2 h-5 w-5" />
                                {product.is_sold_out ? "نفد من المخزون" : "أضف للسلة"}
                            </Button>
                            <Button variant="outline" size="lg" onClick={handleViewFull}>
                                عرض التفاصيل الكاملة
                            </Button>
                        </div>

                        {/* View count */}
                        {product.view_count && product.view_count > 0 && (
                            <p className="text-xs text-muted-foreground text-center pt-2">
                                شاهد هذا المنتج {product.view_count.toLocaleString()} شخص
                            </p>
                        )}
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
