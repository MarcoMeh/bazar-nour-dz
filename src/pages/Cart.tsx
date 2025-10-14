import { Link } from 'react-router-dom';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useCart } from '@/contexts/CartContext';
import { Trash2, Plus, Minus, ShoppingBag } from 'lucide-react';

const Cart = () => {
  const { items, removeItem, updateQuantity, totalPrice, clearCart } = useCart();

  if (items.length === 0) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 container mx-auto px-4 py-16">
          <div className="text-center">
            <ShoppingBag className="h-24 w-24 mx-auto mb-4 text-muted-foreground" />
            <h1 className="text-2xl font-bold mb-4">السلة فارغة</h1>
            <p className="text-muted-foreground mb-8">
              لم تقم بإضافة أي منتجات بعد
            </p>
            <Link to="/products">
              <Button>تصفح المنتجات</Button>
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">سلة التسوق</h1>
          <Button variant="outline" onClick={clearCart} size="sm">
            تفريغ السلة
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-4">
            {items.map((item) => (
              <Card key={item.id} className="p-4">
                <div className="flex gap-4">
                  <div className="w-24 h-24 rounded-lg overflow-hidden bg-muted flex-shrink-0">
                    {item.image_url ? (
                      <img
                        src={item.image_url}
                        alt={item.name_ar}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <span className="text-3xl opacity-20">📦</span>
                      </div>
                    )}
                  </div>
                  
                  <div className="flex-1">
                    <h3 className="font-bold text-lg mb-1">{item.name_ar}</h3>
                    <p className="text-accent font-bold">
                      {item.price.toFixed(2)} دج
                    </p>
                    
                    <div className="flex items-center gap-2 mt-4">
                      <Button
                        size="icon"
                        variant="outline"
                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                      >
                        <Minus className="h-4 w-4" />
                      </Button>
                      <span className="w-12 text-center font-bold">
                        {item.quantity}
                      </span>
                      <Button
                        size="icon"
                        variant="outline"
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                      
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => removeItem(item.id)}
                        className="mr-auto text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>

          <div className="lg:col-span-1">
            <Card className="p-6 sticky top-24">
              <h2 className="text-xl font-bold mb-4">ملخص الطلب</h2>
              
              <div className="space-y-2 mb-4">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">المجموع الفرعي:</span>
                  <span className="font-bold">{totalPrice.toFixed(2)} دج</span>
                </div>
              </div>
              
              <div className="border-t pt-4 mb-6">
                <div className="flex justify-between text-lg font-bold">
                  <span>المجموع:</span>
                  <span className="text-accent">{totalPrice.toFixed(2)} دج</span>
                </div>
                <p className="text-sm text-muted-foreground mt-2">
                  سيتم إضافة رسوم التوصيل في الخطوة التالية
                </p>
              </div>
              
              <Link to="/checkout">
                <Button className="w-full bg-secondary hover:bg-secondary/90" size="lg">
                  متابعة إلى الدفع
                </Button>
              </Link>
            </Card>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Cart;
