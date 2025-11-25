import { useState } from "react";
import { useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Minus, Plus, ShoppingCart } from "lucide-react";

export default function ProductDetail() {
  const { id } = useParams();
  const [quantity, setQuantity] = useState(1);
  const [selectedColor, setSelectedColor] = useState("");
  const [selectedSize, setSelectedSize] = useState("");

  // Mock product data - will be replaced with Supabase data
  const product = {
    id,
    name: "منتج تجريبي",
    description: "وصف تفصيلي للمنتج. هذا منتج رائع بجودة عالية ومناسب لجميع الاستخدامات.",
    price: 2500,
    image: "",
    colors: ["أحمر", "أزرق", "أخضر"],
    sizes: ["S", "M", "L", "XL"],
    hasColors: true,
    hasSizes: true,
    store: "محل تجريبي",
  };

  return (
    <div className="container py-8">
      <div className="grid md:grid-cols-2 gap-8">
        {/* Product Image */}
        <div>
          <div className="aspect-square bg-muted rounded-lg"></div>
        </div>

        {/* Product Info */}
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold mb-2">{product.name}</h1>
            <p className="text-sm text-muted-foreground">من: {product.store}</p>
          </div>

          <div className="text-3xl font-bold text-primary">{product.price} دج</div>

          <p className="text-muted-foreground">{product.description}</p>

          {/* Colors */}
          {product.hasColors && (
            <div className="space-y-3">
              <Label>اللون</Label>
              <RadioGroup value={selectedColor} onValueChange={setSelectedColor}>
                <div className="flex gap-2">
                  {product.colors.map((color) => (
                    <div key={color} className="flex items-center">
                      <RadioGroupItem value={color} id={color} className="peer sr-only" />
                      <Label
                        htmlFor={color}
                        className="flex items-center justify-center rounded-md border-2 border-muted bg-popover px-4 py-2 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary cursor-pointer"
                      >
                        {color}
                      </Label>
                    </div>
                  ))}
                </div>
              </RadioGroup>
            </div>
          )}

          {/* Sizes */}
          {product.hasSizes && (
            <div className="space-y-3">
              <Label>المقاس</Label>
              <RadioGroup value={selectedSize} onValueChange={setSelectedSize}>
                <div className="flex gap-2">
                  {product.sizes.map((size) => (
                    <div key={size} className="flex items-center">
                      <RadioGroupItem value={size} id={size} className="peer sr-only" />
                      <Label
                        htmlFor={size}
                        className="flex items-center justify-center rounded-md border-2 border-muted bg-popover w-12 h-12 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary cursor-pointer font-semibold"
                      >
                        {size}
                      </Label>
                    </div>
                  ))}
                </div>
              </RadioGroup>
            </div>
          )}

          {/* Quantity */}
          <div className="space-y-3">
            <Label>الكمية</Label>
            <div className="flex items-center gap-4">
              <Button
                variant="outline"
                size="icon"
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
              >
                <Minus className="h-4 w-4" />
              </Button>
              <span className="w-16 text-center font-semibold text-lg">{quantity}</span>
              <Button
                variant="outline"
                size="icon"
                onClick={() => setQuantity(quantity + 1)}
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Add to Cart */}
          <Button size="lg" className="w-full">
            <ShoppingCart className="ml-2 h-5 w-5" />
            أضف إلى السلة
          </Button>

          {/* Product Details */}
          <Card>
            <CardContent className="pt-6">
              <h3 className="font-semibold mb-4">تفاصيل المنتج</h3>
              <dl className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <dt className="text-muted-foreground">التوصيل</dt>
                  <dd className="font-medium">متاح لجميع الولايات</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-muted-foreground">الدفع</dt>
                  <dd className="font-medium">عند الاستلام</dd>
                </div>
              </dl>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
