import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Minus, Plus, Trash2 } from "lucide-react";
import { Link } from "react-router-dom";

export default function Cart() {
  // This will be replaced with actual cart state management
  const cartItems = [
    { id: 1, name: "منتج 1", price: 1500, quantity: 2, image: "" },
    { id: 2, name: "منتج 2", price: 2000, quantity: 1, image: "" },
  ];

  const total = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);

  return (
    <div className="container py-8">
      <h1 className="text-3xl font-bold mb-8 text-primary">سلة التسوق</h1>

      {cartItems.length === 0 ? (
        <Card>
          <CardContent className="py-16 text-center">
            <p className="text-xl text-muted-foreground mb-4">سلة التسوق فارغة</p>
            <Button asChild>
              <Link to="/products">تصفح المنتجات</Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-4">
            {cartItems.map((item) => (
              <Card key={item.id}>
                <CardContent className="p-6">
                  <div className="flex gap-4">
                    <div className="w-24 h-24 bg-muted rounded"></div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg mb-2">{item.name}</h3>
                      <p className="text-primary font-bold mb-4">{item.price} دج</p>
                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2">
                          <Button variant="outline" size="icon" className="h-8 w-8">
                            <Minus className="h-4 w-4" />
                          </Button>
                          <span className="w-12 text-center font-medium">{item.quantity}</span>
                          <Button variant="outline" size="icon" className="h-8 w-8">
                            <Plus className="h-4 w-4" />
                          </Button>
                        </div>
                        <Button variant="ghost" size="icon" className="text-destructive">
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
            <Card>
              <CardHeader>
                <CardTitle>ملخص الطلب</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">المجموع الفرعي</span>
                  <span className="font-medium">{total} دج</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">التوصيل</span>
                  <span className="font-medium">400 دج</span>
                </div>
                <div className="border-t pt-4">
                  <div className="flex justify-between text-lg font-bold">
                    <span>المجموع الكلي</span>
                    <span className="text-primary">{total + 400} دج</span>
                  </div>
                </div>
                <Button asChild className="w-full" size="lg">
                  <Link to="/checkout">إتمام الطلب</Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
}
