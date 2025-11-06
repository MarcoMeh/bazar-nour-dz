import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useCart } from '@/contexts/CartContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface Wilaya {
  id: string;
  code: string;
  name_ar: string;
  delivery_price: number;
  home_delivery_price: number;
  desk_delivery_price: number;
  home_delivery_available?: boolean;
  desk_delivery_available?: boolean;
}

const Checkout = () => {
  const navigate = useNavigate();
  const { items, totalPrice, clearCart } = useCart();
  const [wilayas, setWilayas] = useState<Wilaya[]>([]);
  const [loading, setLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    address: '',
    wilaya: '',
    deliveryType: 'home' as 'home' | 'office',
  });

  const selectedWilaya = wilayas.find((w) => w.code === formData.wilaya);
  const deliveryPrice = selectedWilaya 
    ? (formData.deliveryType === 'home' 
        ? (selectedWilaya.home_delivery_price || 0) 
        : (selectedWilaya.desk_delivery_price || 0))
    : 0;
  const finalTotal = totalPrice + deliveryPrice;

  useEffect(() => {
    if (items.length === 0) {
      navigate('/cart');
    }
    fetchWilayas();
  }, [items, navigate]);

  const fetchWilayas = async () => {
    const { data, error } = await supabase
      .from('wilayas')
      .select('*')
      .order('code');

    if (error) {
      toast.error('حدث خطأ في تحميل الولايات');
      return;
    }

    setWilayas(data || []);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.phone || !formData.address || !formData.wilaya) {
      toast.error('يرجى ملء جميع الحقول');
      return;
    }

    setLoading(true);

    const orderData = {
      customer_name: formData.name,
      customer_phone: formData.phone,
      customer_address: formData.address,
      wilaya_code: formData.wilaya,
      delivery_type: formData.deliveryType,
      total_price: finalTotal,
      delivery_price: deliveryPrice,
      items: items as any,
    };

    const { error } = await supabase
      .from('orders')
      .insert([orderData]);

    if (error) {
      toast.error('حدث خطأ في إرسال الطلب');
      setLoading(false);
      return;
    }

    toast.success('تم إرسال طلبك بنجاح! سنتواصل معك قريباً');
    clearCart();
    navigate('/');
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-1 container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">إتمام الطلب</h1>

        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <Card className="p-6 mb-6">
                <h2 className="text-xl font-bold mb-6">معلومات الاتصال</h2>
                
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="name">الاسم الكامل *</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="أدخل اسمك الكامل"
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="phone">رقم الهاتف *</Label>
                    <Input
                      id="phone"
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      placeholder="0555 12 34 56"
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="address">العنوان الكامل *</Label>
                    <Input
                      id="address"
                      value={formData.address}
                      onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                      placeholder="الشارع، الحي، الرقم..."
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="wilaya">الولاية *</Label>
                    <Select value={formData.wilaya} onValueChange={(value) => setFormData({ ...formData, wilaya: value })}>
                      <SelectTrigger>
                        <SelectValue placeholder="اختر الولاية" />
                      </SelectTrigger>
                      <SelectContent>
                        {wilayas.map((wilaya) => (
                          <SelectItem key={wilaya.code} value={wilaya.code}>
                            {wilaya.name_ar}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </Card>

              <Card className="p-6">
                <h2 className="text-xl font-bold mb-6">نوع التوصيل</h2>
                
                <RadioGroup
                  value={formData.deliveryType}
                  onValueChange={(value) => setFormData({ ...formData, deliveryType: value as 'home' | 'office' })}
                >
                  <div className="flex items-center justify-between p-4 rounded-lg border border-muted mb-3 hover:bg-muted/50 transition-colors">
                    <div className="flex items-center space-x-2 space-x-reverse">
                      <RadioGroupItem value="home" id="home" />
                      <Label htmlFor="home" className="cursor-pointer">توصيل إلى المنزل</Label>
                    </div>
                    {selectedWilaya && (
                      <span className="font-bold text-primary">{selectedWilaya.home_delivery_price?.toFixed(2)} دج</span>
                    )}
                  </div>
                  <div className="flex items-center justify-between p-4 rounded-lg border border-muted hover:bg-muted/50 transition-colors">
                    <div className="flex items-center space-x-2 space-x-reverse">
                      <RadioGroupItem value="office" id="office" />
                      <Label htmlFor="office" className="cursor-pointer">توصيل إلى المكتب</Label>
                    </div>
                    {selectedWilaya && (
                      <span className="font-bold text-primary">{selectedWilaya.desk_delivery_price?.toFixed(2)} دج</span>
                    )}
                  </div>
                </RadioGroup>
              </Card>
            </div>

            <div className="lg:col-span-1">
              <Card className="p-6 sticky top-24">
                <h2 className="text-xl font-bold mb-4">ملخص الطلب</h2>
                
                <div className="space-y-2 mb-4 pb-4 border-b">
                  {items.map((item) => (
                    <div key={item.id} className="flex justify-between text-sm">
                      <span>{item.name_ar} × {item.quantity}</span>
                      <span>{(item.price * item.quantity).toFixed(2)} دج</span>
                    </div>
                  ))}
                </div>

                <div className="space-y-2 mb-4">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">المجموع الفرعي:</span>
                    <span className="font-bold">{totalPrice.toFixed(2)} دج</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">رسوم التوصيل:</span>
                    <span className="font-bold">{deliveryPrice.toFixed(2)} دج</span>
                  </div>
                </div>
                
                <div className="border-t pt-4 mb-6">
                  <div className="flex justify-between text-lg font-bold">
                    <span>المجموع النهائي:</span>
                    <span className="text-accent">{finalTotal.toFixed(2)} دج</span>
                  </div>
                </div>

                <div className="bg-muted/50 p-4 rounded-lg mb-6">
                  <p className="text-sm font-medium">طريقة الدفع</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    الدفع عند الاستلام فقط
                  </p>
                </div>
                
                <Button 
                  type="submit" 
                  className="w-full bg-secondary hover:bg-secondary/90" 
                  size="lg"
                  disabled={loading}
                >
                  {loading ? 'جاري الإرسال...' : 'تأكيد الطلب'}
                </Button>
              </Card>
            </div>
          </div>
        </form>
      </main>

      <Footer />
    </div>
  );
};

export default Checkout;
