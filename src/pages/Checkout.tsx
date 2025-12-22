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
import { Gift, AlertTriangle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

interface Wilaya {
  id: number;
  code: string;
  name: string;
  name_ar: string;
  home_delivery_price: number;
  desk_delivery_price: number;
  created_at?: string;
}

interface DeliveryMethod {
  enabled: boolean;
  price: number;
}

interface DeliveryMethods {
  home: DeliveryMethod;
  desk: DeliveryMethod;
  error?: string;
}

const Checkout = () => {
  const navigate = useNavigate();
  const { items, totalPrice, clearCart, ownerId } = useCart();

  const [wilayas, setWilayas] = useState<Wilaya[]>([]);
  const [loading, setLoading] = useState(false);
  const [calculatingDelivery, setCalculatingDelivery] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    address: "",
    wilayaId: "", // store as string for Select; convert to number on submit
    deliveryType: "home" as "home" | "desktop" // kept as "desktop" for compatibility with existing DB enum if needed, though usually "office" or "desk"
  });

  const [deliveryMethods, setDeliveryMethods] = useState<DeliveryMethods>({
    home: { enabled: true, price: 0 },
    desk: { enabled: true, price: 0 }
  });

  useEffect(() => {
    if (items.length === 0) navigate("/cart");
    loadWilayas();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Recalculate delivery whenever Wilaya or Cart Items (Store) change
  useEffect(() => {
    if (formData.wilayaId && items.length > 0) {
      calculateDeliveryFees();
    }
  }, [formData.wilayaId, items]);

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

    setWilayas((data as any) || []);
  };

  const selectedWilaya = wilayas.find((w) => String(w.id) === formData.wilayaId);

  // Check if all items have free delivery
  const hasFreeDelivery = items.length > 0 && items.every(item => item.is_free_delivery);

  const calculateDeliveryFees = async () => {
    if (!selectedWilaya) return;

    // Assuming single-store cart for now
    const storeId = items[0]?.ownerId;
    if (!storeId) return;

    setCalculatingDelivery(true);
    setDeliveryMethods({
      home: { enabled: false, price: 0 },
      desk: { enabled: false, price: 0 },
      error: undefined
    });

    try {
      // 1. Check for Overrides first (Specific Store + Wilaya rule)
      const { data: overrideData } = await supabase
        .from('store_delivery_overrides')
        .select('*')
        .eq('store_id', storeId)
        .eq('wilaya_code', selectedWilaya.code) // Assuming wilayas table has 'code' column matching override
        .single();

      if (overrideData) {
        setDeliveryMethods({
          home: {
            enabled: overrideData.is_home_enabled !== false, // Default true if null, but explicit false disables
            price: overrideData.price_home || 0
          },
          desk: {
            enabled: overrideData.is_desk_enabled !== false,
            price: overrideData.price_desk || 0
          }
        });
        setCalculatingDelivery(false);
        return;
      }

      // 2. If no override, check Company Configuration
      const { data: settingsData } = await supabase
        .from('store_delivery_settings')
        .select('company_id')
        .eq('store_id', storeId)
        .single();

      if (!settingsData || !settingsData.company_id) {
        // Fallback to default Wilaya prices if no company set (Legacy behavior)
        setDeliveryMethods({
          home: { enabled: true, price: selectedWilaya.home_delivery_price },
          desk: { enabled: true, price: selectedWilaya.desk_delivery_price }
        });
        setCalculatingDelivery(false);
        return;
      }

      // 3. Find Zone for this Company & Wilaya
      // Join: delivery_zones -> zone_wilayas
      const { data: zoneData, error: zoneError } = await supabase
        .from('zone_wilayas')
        .select(`
                zone_id,
                delivery_zones!inner (
                    id,
                    price_home,
                    price_desk,
                    company_id
                )
            `)
        .eq('wilaya_code', selectedWilaya.code)
        .eq('delivery_zones.company_id', settingsData.company_id)
        .maybeSingle(); // Use maybeSingle to handle "no zone found" gracefully

      if (zoneData && zoneData.delivery_zones) {
        setDeliveryMethods({
          home: { enabled: true, price: zoneData.delivery_zones.price_home },
          desk: { enabled: true, price: zoneData.delivery_zones.price_desk }
        });
      } else {
        // 4. No Zone found for this Company & Wilaya => Delivery Not Supported
        setDeliveryMethods({
          home: { enabled: false, price: 0 },
          desk: { enabled: false, price: 0 },
          error: "نعتذر، التوصيل غير متوفر لهذه الولاية حالياً."
        });
      }

    } catch (err) {
      console.error("Error calculating delivery:", err);
      // Fallback or keep error state
    } finally {
      setCalculatingDelivery(false);
    }
  };

  // Determine effective price based on selected type and calculation
  const currentMethod = formData.deliveryType === "home" ? deliveryMethods.home : deliveryMethods.desk;
  const deliveryPriceAmount = hasFreeDelivery ? 0 : currentMethod.price;

  const finalTotal = totalPrice + deliveryPriceAmount;

  // Product-level availability check
  const allProductsSupportHome = items.every(it => it.is_delivery_home_available !== false);
  const allProductsSupportDesk = items.every(it => it.is_delivery_desk_available !== false);

  const isDeliveryBlocked = !!deliveryMethods.error ||
    (!deliveryMethods.home.enabled && !deliveryMethods.desk.enabled) ||
    (formData.deliveryType === 'home' && !allProductsSupportHome) ||
    (formData.deliveryType === 'desktop' && !allProductsSupportDesk);

  // Auto-switch delivery type if current is disabled or unsupported by products
  useEffect(() => {
    const homeDisabled = !deliveryMethods.home.enabled || !allProductsSupportHome;
    const deskDisabled = !deliveryMethods.desk.enabled || !allProductsSupportDesk;

    if (formData.deliveryType === 'home' && homeDisabled && !deskDisabled) {
      setFormData(prev => ({ ...prev, deliveryType: 'desktop' }));
    } else if (formData.deliveryType === 'desktop' && deskDisabled && !homeDisabled) {
      setFormData(prev => ({ ...prev, deliveryType: 'home' }));
    }
  }, [deliveryMethods, allProductsSupportHome, allProductsSupportDesk, formData.deliveryType]);


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

    // Final check for blocked delivery
    if (isDeliveryBlocked) {
      toast.error("التوصيل غير متوفر لهذه الولاية");
      return;
    }

    // Check if selected specific method is enabled
    if (formData.deliveryType === 'home' && (!deliveryMethods.home.enabled || !allProductsSupportHome)) {
      toast.error("التوصيل للمنزل غير متوفر");
      return;
    }
    if (formData.deliveryType === 'desktop' && (!deliveryMethods.desk.enabled || !allProductsSupportDesk)) {
      toast.error("التوصيل للمكتب غير متوفر");
      return;
    }

    setLoading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();

      const uniqueStoreIds = Array.from(new Set(items.map(item => item.ownerId).filter((id): id is string => !!id)));
      const orderStoreId = uniqueStoreIds.length === 1 ? uniqueStoreIds[0] : null;

      const orderPayload = {
        store_id: orderStoreId,
        store_ids: uniqueStoreIds,
        user_id: user?.id || null,
        wilaya_id: selectedWilaya.id,
        full_name: formData.name,
        phone: formData.phone,
        address: formData.address,
        delivery_option: formData.deliveryType,
        total_price: finalTotal,
        // We might want to save the actual delivery price used
        delivery_price: deliveryPriceAmount
      };

      const itemsPayload = items.map((it) => ({
        product_id: it.id,
        quantity: it.quantity,
        price: it.price,
        selected_color: it.color ?? null,
        selected_size: it.size ?? null,
        store_id: it.ownerId
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

              {deliveryMethods.error && (
                <Alert variant="destructive" className="mb-4">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertTitle>تنبيه</AlertTitle>
                  <AlertDescription>
                    {deliveryMethods.error}
                  </AlertDescription>
                </Alert>
              )}

              {/* ... existing code ... */}
              {!deliveryMethods.error && (
                <RadioGroup value={formData.deliveryType} onValueChange={(v) => setFormData({ ...formData, deliveryType: v as "home" | "desktop" })}>
                  <div className={`flex flex-col sm:flex-row items-start sm:items-center justify-between p-3 sm:p-4 border rounded mb-3 transition-colors ${(!deliveryMethods.home.enabled || !allProductsSupportHome) ? 'opacity-50 bg-gray-50' : ''}`}>
                    <div className="flex items-center mb-2 sm:mb-0">
                      <RadioGroupItem value="home" id="home" disabled={!deliveryMethods.home.enabled || !allProductsSupportHome} />
                      <Label htmlFor="home" className="ml-2 cursor-pointer text-sm sm:text-base">
                        توصيل إلى المنزل
                        {!deliveryMethods.home.enabled && <span className="block sm:inline text-xs text-red-500 mr-2 sm:mr-1 mt-1 sm:mt-0">(غير متوفر للولاية)</span>}
                        {deliveryMethods.home.enabled && !allProductsSupportHome && <span className="block sm:inline text-xs text-red-500 mr-2 sm:mr-1 mt-1 sm:mt-0">(غير متوفر لبعض المنتجات)</span>}
                      </Label>
                    </div>
                    <div className="font-bold text-sm sm:text-base w-full sm:w-auto text-left sm:text-right pl-6 sm:pl-0">
                      {hasFreeDelivery ? (
                        <Badge variant="secondary" className="bg-green-100 text-green-700">مجاني</Badge>
                      ) : (
                        <>{calculatingDelivery ? "..." : deliveryMethods.home.enabled ? `${deliveryMethods.home.price} دج` : "--"}</>
                      )}
                    </div>
                  </div>

                  <div className={`flex flex-col sm:flex-row items-start sm:items-center justify-between p-3 sm:p-4 border rounded transition-colors ${(!deliveryMethods.desk.enabled || !allProductsSupportDesk) ? 'opacity-50 bg-gray-50' : ''}`}>
                    <div className="flex items-center mb-2 sm:mb-0">
                      <RadioGroupItem value="desktop" id="office" disabled={!deliveryMethods.desk.enabled || !allProductsSupportDesk} />
                      <Label htmlFor="office" className="ml-2 cursor-pointer text-sm sm:text-base">
                        استلام من المكتب
                        {!deliveryMethods.desk.enabled && <span className="block sm:inline text-xs text-red-500 mr-2 sm:mr-1 mt-1 sm:mt-0">(غير متوفر للولاية)</span>}
                        {deliveryMethods.desk.enabled && !allProductsSupportDesk && <span className="block sm:inline text-xs text-red-500 mr-2 sm:mr-1 mt-1 sm:mt-0">(غير متوفر لبعض المنتجات)</span>}
                      </Label>
                    </div>
                    <div className="font-bold text-sm sm:text-base w-full sm:w-auto text-left sm:text-right pl-6 sm:pl-0">
                      {hasFreeDelivery ? (
                        <Badge variant="secondary" className="bg-green-100 text-green-700">مجاني</Badge>
                      ) : (
                        <>{calculatingDelivery ? "..." : deliveryMethods.desk.enabled ? `${deliveryMethods.desk.price} دج` : "--"}</>
                      )}
                    </div>
                  </div>
                </RadioGroup>
              )}
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

                      {/* Delivery Availability Warning per Product */}
                      {formData.deliveryType === 'home' && it.is_delivery_home_available === false && (
                        <div className="text-red-500 text-[10px] font-bold mt-1">لا يوجد توصيل للمنزل لهذا المنتج</div>
                      )}
                      {formData.deliveryType === 'desktop' && it.is_delivery_desk_available === false && (
                        <div className="text-red-500 text-[10px] font-bold mt-1">لا يوجد استلام من المكتب لهذا المنتج</div>
                      )}
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
                  <strong>{deliveryPriceAmount.toFixed(2)} دج</strong>
                )}
              </div>

              <hr className="my-4" />

              <div className="flex justify-between text-lg font-bold">
                <span>الإجمالي</span>
                <span>{finalTotal.toFixed(2)} دج</span>
              </div>

              <Button type="submit" className="mt-6 w-full" disabled={loading || isDeliveryBlocked}>
                {loading ? "جاري الإرسال..." : isDeliveryBlocked ? "التوصيل غير متوفر" : "تأكيد الطلب"}
              </Button>
            </Card>
          </div>

        </form>
      </main>

    </div>
  );
}

export default Checkout;
