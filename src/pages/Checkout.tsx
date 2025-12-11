// src/pages/Checkout.tsx
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

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
import { Badge } from "@/components/ui/badge";
import { Gift } from "lucide-react";

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
    deliveryType: "home" as "home" | "desktop"
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

  // Check if all items have free delivery
  const hasFreeDelivery = items.length > 0 && items.every(item => item.is_free_delivery);

  // Calculate delivery price (0 if free delivery)
  const deliveryPrice = hasFreeDelivery ? 0 : (selectedWilaya
    ? formData.deliveryType === "home"
      ? selectedWilaya.home_delivery_price
      : selectedWilaya.desk_delivery_price
    : 0);

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
      // Get the store ID from the first item (assuming single store order for now)
      // In a real multi-store app, you'd split orders or have a cart per store.
      // We'll try to find a store_id from the items if available, or use a default/null.
      // Since CartItem doesn't strictly have store_id, we might need to fetch it or rely on ownerId if that maps to store.
      // But orders table expects store_id.
      // Let's assume for now we can't easily get store_id without fetching, so we'll leave it null 
      // OR better, we should have store_id in CartItem.
      // For this fix, I'll use null for store_id to prevent the error, as owner_id column doesn't exist in orders table.

      // Get current user
      const { data: { user } } = await supabase.auth.getUser();

      // Calculate unique store IDs from items
      // We need to ensure CartItem has ownerId (which is store_id)
      const uniqueStoreIds = Array.from(new Set(items.map(item => item.ownerId).filter((id): id is string => !!id)));

      // If single store, use that ID. If multiple or none, use null.
      const orderStoreId = uniqueStoreIds.length === 1 ? uniqueStoreIds[0] : null;

      console.log("Checkout uniqueStoreIds:", uniqueStoreIds);
      console.log("Final Order Store ID:", orderStoreId);

      const orderPayload = {
        store_id: orderStoreId,
        store_ids: uniqueStoreIds, // Send the array of store IDs
        user_id: user?.id || null,
        wilaya_id: selectedWilaya.id,
        full_name: formData.name,
        phone: formData.phone,
        address: formData.address,
        delivery_option: formData.deliveryType,
        total_price: finalTotal,
      };

      const itemsPayload = items.map((it) => ({
        product_id: it.id,
        quantity: it.quantity,
        price: it.price,
        selected_color: it.color ?? null,
        selected_size: it.size ?? null,
        store_id: it.ownerId // Required for splitting orders by store
      }));

      const { error } = await supabase.rpc('create_order', {
        order_payload: orderPayload,
        items_payload: itemsPayload
      });

      if (error) {
        console.error("Order creation error:", error);
        toast.error("فشل إنشاء الطلب: " + error.message);
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

              {hasFreeDelivery && (
                <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg flex items-center gap-2">
                  <Gift className="h-5 w-5 text-green-600" />
                  <span className="text-green-700 font-medium">🎉 جميع المنتجات في سلتك تتمتع بتوصيل مجاني!</span>
                </div>
              )}

              <RadioGroup value={formData.deliveryType} onValueChange={(v) => setFormData({ ...formData, deliveryType: v as "home" | "desktop" })}>
                <div className="flex items-center justify-between p-4 border rounded mb-3">
                  <div>
                    <RadioGroupItem value="home" id="home" />
                    <Label htmlFor="home" className="ml-2">توصيل إلى المنزل</Label>
                  </div>
                  <div className="font-bold">
                    {hasFreeDelivery ? (
                      <Badge variant="secondary" className="bg-green-100 text-green-700">مجاني</Badge>
                    ) : (
                      <>{selectedWilaya ? selectedWilaya.home_delivery_price : "--"} دج</>
                    )}
                  </div>
                </div>

                <div className="flex items-center justify-between p-4 border rounded">
                  <div>
                    <RadioGroupItem value="desktop" id="office" />
                    <Label htmlFor="office" className="ml-2">استلام من المكتب</Label>
                  </div>
                  <div className="font-bold">
                    {hasFreeDelivery ? (
                      <Badge variant="secondary" className="bg-green-100 text-green-700">مجاني</Badge>
                    ) : (
                      <>{selectedWilaya ? selectedWilaya.desk_delivery_price : "--"} دج</>
                    )}
                  </div>
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
                {hasFreeDelivery ? (
                  <Badge variant="secondary" className="bg-green-100 text-green-700">مجاني 🎁</Badge>
                ) : (
                  <strong>{deliveryPrice.toFixed(2)} دج</strong>
                )}
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
