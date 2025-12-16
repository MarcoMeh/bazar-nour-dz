import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Minus, Plus, Trash2, ShoppingBag, Store, AlertTriangle } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useCart } from "@/contexts/CartContext";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export default function Cart() {
  const { items, removeItem, updateQuantity, totalPrice } = useCart();
  const navigate = useNavigate();
  const [isErrorOpen, setIsErrorOpen] = useState(false);

  const handleCheckout = () => {
    // 1. Extract unique owners
    const owners = new Set(items.map(item => item.ownerId).filter(Boolean));

    // 2. Check if more than 1 owner
    if (owners.size > 1) {
      setIsErrorOpen(true);
    } else {
      navigate("/checkout");
    }
  };

  return (
    <div className="container py-8" dir="rtl">
      <h1 className="text-3xl font-bold mb-8 text-primary">سلة التسوق</h1>

      {items.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="py-16 flex flex-col items-center justify-center text-center">
            <div className="bg-primary/10 p-6 rounded-full mb-6">
              <ShoppingBag className="h-12 w-12 text-primary" />
            </div>
            <h2 className="text-2xl font-semibold mb-2">سلة التسوق فارغة</h2>
            <p className="text-muted-foreground mb-8 max-w-sm mx-auto">
              يبدو أنك لم تضف أي منتجات إلى سلة التسوق الخاصة بك بعد.
            </p>
            <Button asChild size="lg">
              <Link to="/products">تصفح المنتجات</Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-4">
            {items.map((item) => (
              <Card key={item.cartItemId}>
                <CardContent className="p-6">
                  <div className="flex gap-4">
                    <div className="w-24 h-24 bg-muted rounded overflow-hidden">
                      {item.image_url ? (
                        <img src={item.image_url} alt={item.name_ar} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full bg-gray-200 flex items-center justify-center text-gray-400">
                          No Image
                        </div>
                      )}
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg mb-2">{item.name_ar}</h3>
                      <p className="text-primary font-bold mb-4">{item.price} دج</p>
                      <div className="text-sm text-muted-foreground mb-2 space-y-1">
                        {item.color && (
                          <div className="flex items-center gap-2">
                            <span className="text-muted-foreground">اللون:</span>
                            <span>{item.color}</span>
                          </div>
                        )}
                        {item.size && (
                          <div className="flex items-center gap-2">
                            <span className="text-muted-foreground">المقاس:</span>
                            <span>{item.size}</span>
                          </div>
                        )}
                      </div>
                      <div className="flex items-center gap-4 mt-4">
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => updateQuantity(item.cartItemId, item.quantity - 1)}
                          >
                            <Minus className="h-4 w-4" />
                          </Button>
                          <span className="w-12 text-center font-medium">{item.quantity}</span>
                          <Button
                            variant="outline"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => updateQuantity(item.cartItemId, item.quantity + 1)}
                          >
                            <Plus className="h-4 w-4" />
                          </Button>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-destructive hover:bg-destructive/10"
                          onClick={() => removeItem(item.cartItemId)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                    <div className="text-left">
                      <p className="font-bold text-lg">{item.price * item.quantity} دج</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <div>
            <Card className="sticky top-24">
              <CardHeader>
                <CardTitle>ملخص الطلب</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">المجموع الفرعي</span>
                  <span className="font-medium">{totalPrice} دج</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">التوصيل</span>
                  <span className="font-medium">يتم حسابه عند الدفع</span>
                </div>
                <div className="border-t pt-4">
                  <div className="flex justify-between text-lg font-bold">
                    <span>المجموع الكلي (تقريبي)</span>
                    <span className="text-primary">{totalPrice} دج</span>
                  </div>
                </div>
                <Button onClick={handleCheckout} className="w-full" size="lg">
                  إتمام الطلب
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {/* Multi-Store Restriction Dialog */}
      <Dialog open={isErrorOpen} onOpenChange={setIsErrorOpen}>
        <DialogContent className="sm:max-w-md" dir="rtl">
          <DialogHeader className="gap-2">
            <div className="mx-auto w-12 h-12 rounded-full bg-orange-100 flex items-center justify-center mb-2">
              <Store className="h-6 w-6 text-orange-600" />
            </div>
            <DialogTitle className="text-center text-xl">تنبيه هام حول الشحن</DialogTitle>
            <DialogDescription className="text-center text-base leading-relaxed pt-2">
              حرصاً منا على سرعة توصيل طلباتكم، ونظراً لأن المنتجات مختارة من متاجر مختلفة، يرجى إتمام عملية شراء منتجات كل متجر على حدة.
              <br /><br />
              نعتذر عن الإزعاج ونعمل على تحديث النظام لخدمتكم بشكل أفضل.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="sm:justify-center">
            <Button type="button" variant="secondary" onClick={() => setIsErrorOpen(false)} className="w-full sm:w-auto min-w-[120px]">
              إغلاق
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
