// src/pages/Checkout.tsx
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Header } from "@/components/Header";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import { useCart } from "@/contexts/CartContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface Wilaya {
  id: number;
  name: string;
  name_ar: string;
  home_delivery_price: number;
  desk_delivery_price: number;
  created_at?: string;
}

const Checkout = () => {
  const navigate = useNavigate();
  const { items, totalPrice, clearCart, ownerId } = useCart();

  const [wilayas, setWilayas] = useState<Wilaya[]>([]);
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    address: "",
    wilayaId: "", // store as string for Select; convert to number on submit
    deliveryType: "home" as "home" | "office"
  });

  useEffect(() => {
    if (items.length === 0) navigate("/cart");
    loadWilayas();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadWilayas = async () => {
    const { data, error } = await supabase
      .from("wilayas")
      .select("*")
      .order("id", { ascending: true });

    if (error) {
      console.error(error);
      toast.error("خطأ في تحميل الولايات");
      return;
    }

    // data items may not contain 'code' — we expect id,name,name_ar,home_delivery_price,desk_delivery_price
    setWilayas((data as any) || []);
  };

  const selectedWilaya = wilayas.find((w) => String(w.id) === formData.wilayaId);
  const deliveryPrice = selectedWilaya
    ? formData.deliveryType === "home"
      ? selectedWilaya.home_delivery_price
      : selectedWilaya.desk_delivery_price
    : 0;

  const finalTotal = totalPrice + deliveryPrice;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name || !formData.phone || !formData.address || !formData.wilayaId) {
      toast.error("يرجى ملء جميع الحقول");
      return;
    }

    if (!selectedWilaya) {
      toast.error("اختر ولاية صحيحة");
      return;
    }

    setLoading(true);

    try {
      // prepare order payload
      const orderPayload = {
        owner_id: ownerId || null, // nullable
        customer_name: formData.name,
        customer_phone: formData.phone,
        wilaya_id: selectedWilaya.id, // number
        address: formData.address,
        delivery_type: formData.deliveryType,
        delivery_price: deliveryPrice,
        total_price: finalTotal,
        items: items.map((it) => ({
          id: it.id,
          name_ar: it.name_ar,
          price: it.price,
          quantity: it.quantity,
          color: it.color ?? null,
          size: it.size ?? null,
          image_url: it.image_url ?? null,
          ownerId: it.ownerId ?? null
        })) // snapshot
      };

      // Insert order — use array form and cast to any to satisfy TS
      // Insert order
      const { data: orderData, error: orderError } = await supabase
        .from("orders")
        .insert([orderPayload])
        .select("id")
        .single();

      if (orderError || !orderData) {
        console.error("order insert error:", orderError);
        toast.error("فشل إنشاء الطلب");
        setLoading(false);
        return;
      }

      const orderId = orderData.id;

      // Prepare order_items payload
      const orderItemsPayload = items.map((it) => ({
        order_id: orderId,
        product_id: it.id,
        quantity: it.quantity,
        unit_price: it.price,
        color: it.color ?? null,
        size: it.size ?? null
      }));

      const { error: itemsError } = await supabase
        .from("order_items")
        .insert(orderItemsPayload);

      if (itemsError) {
        console.error("order_items insert error:", itemsError);
        toast.error("فشل حفظ عناصر الطلب");
        setLoading(false);
        return;
      }

      toast.success("تم إرسال الطلب بنجاح!");
      clearCart();
      navigate("/");
    } catch (err) {
      console.error(err);
      toast.error("حصل خطأ غير متوقع");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1 container mx-auto py-8 px-4">
        <h1 className="text-3xl font-bold mb-6">إتمام الطلب</h1>

        <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* LEFT */}
          <div className="lg:col-span-2 space-y-6">
            <Card className="p-6">
              <h2 className="text-xl font-semibold mb-4">معلومات العميل</h2>

              <div className="space-y-4">
                <div>
                  <Label>الاسم</Label>
                  <Input value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} />
                </div>

                <div>
                  <Label>الهاتف</Label>
                  <Input value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} />
                </div>

                <div>
                  <Label>العنوان</Label>
                  <Input value={formData.address} onChange={(e) => setFormData({ ...formData, address: e.target.value })} />
                </div>

                <div>
                  <Label>الولاية</Label>
                  <Select value={formData.wilayaId} onValueChange={(v) => setFormData({ ...formData, wilayaId: v })}>
                    <SelectTrigger>
                      <SelectValue placeholder="اختر الولاية" />
                    </SelectTrigger>
                    <SelectContent>
                      {wilayas.map((w) => (
                        <SelectItem key={w.id} value={String(w.id)}>
                          {w.name_ar || w.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <h2 className="text-xl font-semibold mb-4">طريقة التوصيل</h2>

              <RadioGroup value={formData.deliveryType} onValueChange={(v) => setFormData({ ...formData, deliveryType: v as "home" | "office" })}>
                <div className="flex items-center justify-between p-4 border rounded mb-3">
                  <div>
                    <RadioGroupItem value="home" id="home" />
                    <Label htmlFor="home" className="ml-2">توصيل إلى المنزل</Label>
                  </div>
                  <div className="font-bold">{selectedWilaya ? selectedWilaya.home_delivery_price : "--"} دج</div>
                </div>

                <div className="flex items-center justify-between p-4 border rounded">
                  <div>
                    <RadioGroupItem value="office" id="office" />
                    <Label htmlFor="office" className="ml-2">استلام من المكتب</Label>
                  </div>
                  <div className="font-bold">{selectedWilaya ? selectedWilaya.desk_delivery_price : "--"} دج</div>
                </div>
              </RadioGroup>
            </Card>
          </div>

          {/* RIGHT */}
          <div>
            <Card className="p-6 sticky top-28">
              <h2 className="text-xl font-semibold mb-4">ملخص الطلب</h2>

              <div className="space-y-3 mb-4 border-b pb-4">
                {items.map((it) => (
                  <div key={it.id + (it.color ?? "") + (it.size ?? "")} className="flex justify-between text-sm">
                    <div>
                      <div className="font-medium">{it.name_ar}</div>
                      <div className="text-muted-foreground text-xs">
                        {it.color && <>لون: {it.color} </>}
                        {it.size && <>• مقاس: {it.size}</>}
                      </div>
                      <div className="text-muted-foreground text-xs">كمية: {it.quantity}</div>
                    </div>
                    <div className="font-medium">{(it.price * it.quantity).toFixed(2)} دج</div>
                  </div>
                ))}
              </div>

              <div className="flex justify-between">
                <span>المجموع الفرعي</span>
                <strong>{totalPrice.toFixed(2)} دج</strong>
              </div>

              <div className="flex justify-between">
                <span>رسوم التوصيل</span>
                <strong>{deliveryPrice.toFixed(2)} دج</strong>
              </div>

              <hr className="my-4" />

              <div className="flex justify-between text-lg font-bold">
                <span>الإجمالي</span>
                <span>{finalTotal.toFixed(2)} دج</span>
              </div>

              <Button type="submit" className="mt-6 w-full" disabled={loading}>
                {loading ? "جاري الإرسال..." : "تأكيد الطلب"}
              </Button>
            </Card>
          </div>

        </form>
      </main>

    </div>
  );
}

export default Checkout;
