// src/pages/Checkout.tsx
import { useNavigate } from "react-router-dom";
import {
  Gift,
  AlertTriangle,
  Phone,
  User,
  MapPin,
  ChevronRight,
  ShieldCheck,
  Truck,
  MessageCircle
} from "lucide-react";

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
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { QuickWilayaSelector } from "@/components/checkout/QuickWilayaSelector";

const Checkout = () => {
  const navigate = useNavigate();
  const { items, totalPrice, clearCart } = useCart();

  const [wilayas, setWilayas] = useState<Wilaya[]>([]);
  const [loading, setLoading] = useState(false);
  const [calculatingDelivery, setCalculatingDelivery] = useState(false);

  const [formData, setFormData] = useState({
    name: localStorage.getItem('checkout_name') || "",
    phone: localStorage.getItem('checkout_phone') || "",
    address: localStorage.getItem('checkout_address') || "",
    wilayaId: localStorage.getItem('checkout_wilaya_id') || "",
    deliveryType: (localStorage.getItem('checkout_delivery_type') as "home" | "desktop") || "home"
  });

  // Save to localStorage on change
  useEffect(() => {
    localStorage.setItem('checkout_name', formData.name);
    localStorage.setItem('checkout_phone', formData.phone);
    localStorage.setItem('checkout_address', formData.address);
    if (formData.wilayaId) localStorage.setItem('checkout_wilaya_id', formData.wilayaId);
    localStorage.setItem('checkout_delivery_type', formData.deliveryType);
  }, [formData]);

  const [deliveryMethods, setDeliveryMethods] = useState<DeliveryMethods>({
    home: { enabled: true, price: 0 },
    desk: { enabled: true, price: 0 }
  });

  useEffect(() => {
    if (items.length === 0) navigate("/cart");
    loadWilayas();
  }, []);

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
      toast.error("خطأ في تحميل الولايات");
      return;
    }
    setWilayas((data as any) || []);
  };

  const selectedWilaya = wilayas.find((w) => String(w.id) === formData.wilayaId);
  const hasFreeDelivery = items.length > 0 && items.every(item => item.is_free_delivery);

  const calculateDeliveryFees = async () => {
    if (!selectedWilaya) return;
    const storeId = items[0]?.ownerId;
    if (!storeId) return;

    setCalculatingDelivery(true);
    try {
      const { data: overrideData } = await supabase
        .from('store_delivery_overrides')
        .select('*')
        .eq('store_id', storeId)
        .eq('wilaya_code', selectedWilaya.code)
        .single();

      if (overrideData) {
        setDeliveryMethods({
          home: { enabled: overrideData.is_home_enabled !== false, price: overrideData.price_home || 0 },
          desk: { enabled: overrideData.is_desk_enabled !== false, price: overrideData.price_desk || 0 }
        });
        return;
      }

      const { data: settingsData } = await supabase
        .from('store_delivery_settings')
        .select('company_id')
        .eq('store_id', storeId)
        .single();

      if (!settingsData || !settingsData.company_id) {
        setDeliveryMethods({
          home: { enabled: true, price: selectedWilaya.home_delivery_price },
          desk: { enabled: true, price: selectedWilaya.desk_delivery_price }
        });
        return;
      }

      const { data: zoneData } = await supabase
        .from('zone_wilayas')
        .select(`zone_id, delivery_zones!inner (id, price_home, price_desk, company_id)`)
        .eq('wilaya_code', selectedWilaya.code)
        .eq('delivery_zones.company_id', settingsData.company_id)
        .maybeSingle();

      if (zoneData && zoneData.delivery_zones) {
        setDeliveryMethods({
          home: { enabled: true, price: zoneData.delivery_zones.price_home },
          desk: { enabled: true, price: zoneData.delivery_zones.price_desk }
        });
      } else {
        setDeliveryMethods({
          home: { enabled: false, price: 0 },
          desk: { enabled: false, price: 0 },
          error: "التوصيل غير متوفر لهذه الولاية حالياً."
        });
      }
    } catch (err) {
      console.error(err);
    } finally {
      setCalculatingDelivery(false);
    }
  };

  const currentMethod = formData.deliveryType === "home" ? deliveryMethods.home : deliveryMethods.desk;
  const deliveryPriceAmount = hasFreeDelivery ? 0 : currentMethod.price;
  const finalTotal = totalPrice + deliveryPriceAmount;

  const allProductsSupportHome = items.every(it => it.is_delivery_home_available !== false);
  const allProductsSupportDesk = items.every(it => it.is_delivery_desk_available !== false);
  const isDeliveryBlocked = !!deliveryMethods.error || (!deliveryMethods.home.enabled && !deliveryMethods.desk.enabled);

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
    if (!formData.name || !formData.phone || !formData.wilayaId) {
      toast.error("يرجى ملء الاسم ورقم الهاتف واختيار الولاية");
      return;
    }
    if (isDeliveryBlocked) {
      toast.error("التوصيل غير متوفر لهذه الولاية");
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
        wilaya_id: selectedWilaya?.id,
        full_name: formData.name,
        phone: formData.phone,
        address: formData.address || "غير محدد",
        delivery_option: formData.deliveryType,
        total_price: finalTotal,
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

      if (error) throw error;
      toast.success("تم إرسال الطلب بنجاح! شكراً لثقتك.");
      clearCart();
      navigate("/");
    } catch (err: any) {
      toast.error("فشل إرسال الطلب: " + (err.message || "خطأ غير متوقع"));
    } finally {
      setLoading(false);
    }
  };

  const handleOrderViaWhatsApp = () => {
    if (!formData.phone || !formData.name) {
      toast.error("يرجى إدخال الرقام والاسم أولاً");
      return;
    }
    const storePhone = "213600000000"; // Should be dynamic based on storeId
    const message = `مرحباً، أود طلب المنتجات التالية:\n${items.map(it => `- ${it.name_ar} (x${it.quantity})`).join('\n')}\nالاسم: ${formData.name}\nالهاتف: ${formData.phone}\nالولاية: ${selectedWilaya?.name_ar || 'غير محدد'}`;
    window.open(`https://wa.me/${storePhone}?text=${encodeURIComponent(message)}`, '_blank');
  };

  return (
    <div className="min-h-screen bg-[#F8F9FA] pb-24 lg:pb-8">
      {/* Header for Mobile */}
      <div className="lg:hidden bg-white border-b px-4 py-4 sticky top-0 z-50 flex items-center justify-between">
        <button onClick={() => navigate(-1)} className="p-1"><ChevronRight className="h-6 w-6" /></button>
        <h1 className="text-xl font-bold">إتمام الطلب</h1>
        <div className="w-8" />
      </div>

      <main className="container mx-auto py-6 px-4 max-w-5xl">
        <div className="flex items-center gap-2 mb-8 hidden lg:flex">
          <Badge variant="outline" className="text-primary border-primary">خطوة 1 من 1</Badge>
          <h1 className="text-3xl font-black text-gray-900 tracking-tight">إتمام الطلب السريع ⚡</h1>
        </div>

        <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Main Form Fields */}
          <div className="lg:col-span-7 space-y-6">
            <Card className="p-5 md:p-8 border-none shadow-xl shadow-gray-200/50 rounded-2xl md:rounded-3xl overflow-hidden relative">
              <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-bl-full -mr-16 -mt-16 pointer-events-none" />

              <div className="flex items-center gap-3 mb-8">
                <div className="p-2.5 bg-primary/10 rounded-xl text-primary"><Phone className="h-5 w-5" /></div>
                <div>
                  <h2 className="text-xl font-bold">بيانات التوصيل</h2>
                  <p className="text-muted-foreground text-xs">أسرع وأسهل طريقة لطلب منتجاتك</p>
                </div>
              </div>

              <div className="space-y-6">
                {/* 1. Phone Number - MOST IMPORTANT */}
                <div className="space-y-2">
                  <Label className="text-sm font-bold flex items-center gap-2">رقم الهاتف <span className="text-red-500">*</span></Label>
                  <div className="relative group">
                    <Input
                      type="tel"
                      placeholder="06 / 07 / 05 ..."
                      className="h-14 text-lg pr-12 font-bold bg-gray-50/50 border-gray-200 focus:bg-white transition-all rounded-xl md:rounded-2xl"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      required
                      autoFocus
                    />
                    <Phone className="absolute right-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 group-focus-within:text-primary transition-colors" />
                  </div>
                </div>

                {/* 2. Full Name */}
                <div className="space-y-2">
                  <Label className="text-sm font-bold flex items-center gap-2">الاسم الكامل <span className="text-red-500">*</span></Label>
                  <div className="relative group">
                    <Input
                      placeholder="اسمك بالكامل"
                      className="h-14 pr-12 bg-gray-50/50 border-gray-200 focus:bg-white transition-all rounded-xl md:rounded-2xl"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      required
                    />
                    <User className="absolute right-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 group-focus-within:text-primary transition-colors" />
                  </div>
                </div>

                {/* 3. Wilaya Selection */}
                <div className="space-y-4 pt-2">
                  <QuickWilayaSelector
                    wilayas={wilayas}
                    selectedId={formData.wilayaId}
                    onSelect={(id) => setFormData(prev => ({ ...prev, wilayaId: id }))}
                  />

                  <div className="space-y-2">
                    <Label className="text-sm font-bold flex items-center gap-2">أو اختر من القائمة <span className="text-red-500">*</span></Label>
                    <Select value={formData.wilayaId} onValueChange={(v) => setFormData({ ...formData, wilayaId: v })}>
                      <SelectTrigger className="h-14 bg-gray-50/50 border-gray-200 rounded-xl md:rounded-2xl overflow-hidden">
                        <SelectValue placeholder="قائمة الولايات (58 ولاية)" />
                      </SelectTrigger>
                      <SelectContent className="max-h-80">
                        {wilayas.map((w) => (
                          <SelectItem key={w.id} value={String(w.id)}>{w.code} - {w.name_ar}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* 4. Address (Optional but helpful) */}
                <div className="space-y-2">
                  <Label className="text-sm font-bold flex items-center gap-2">العنوان (اختياري)</Label>
                  <div className="relative group">
                    <Input
                      placeholder="اسم البلدية أو الحي..."
                      className="h-14 pr-12 bg-gray-50/50 border-gray-200 focus:bg-white transition-all rounded-xl md:rounded-2xl"
                      value={formData.address}
                      onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    />
                    <MapPin className="absolute right-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 group-focus-within:text-primary transition-colors" />
                  </div>
                </div>
              </div>
            </Card>

            <Card className="p-5 md:p-8 border-none shadow-xl shadow-gray-200/50 rounded-2xl md:rounded-3xl">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2.5 bg-primary/10 rounded-xl text-primary"><Truck className="h-5 w-5" /></div>
                <h2 className="text-xl font-bold">طريقة التوصيل</h2>
              </div>

              {hasFreeDelivery && (
                <div className="mb-6 p-4 bg-green-50 border border-green-100 rounded-2xl flex items-center gap-3 animate-pulse-slow">
                  <div className="bg-green-100 p-2 rounded-full"><Gift className="h-5 w-5 text-green-600" /></div>
                  <span className="text-green-800 text-sm font-bold">مبروك! التوصيل مجاني لطلبك بالكامل 🎁</span>
                </div>
              )}

              {deliveryMethods.error && (
                <Alert variant="destructive" className="mb-6 rounded-2xl border-red-100 bg-red-50 text-red-900">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription className="font-bold">{deliveryMethods.error}</AlertDescription>
                </Alert>
              )}

              {!deliveryMethods.error && (
                <RadioGroup
                  value={formData.deliveryType}
                  onValueChange={(v) => setFormData({ ...formData, deliveryType: v as "home" | "desktop" })}
                  className="grid grid-cols-1 md:grid-cols-2 gap-4"
                >
                  <label
                    className={cn(
                      "relative flex flex-col p-4 border-2 rounded-2xl cursor-pointer transition-all active:scale-95",
                      formData.deliveryType === 'home' ? "border-primary bg-primary/5 shadow-inner" : "border-gray-100 bg-white hover:border-gray-200",
                      (!deliveryMethods.home.enabled || !allProductsSupportHome) && "opacity-50 cursor-not-allowed grayscale"
                    )}
                  >
                    <RadioGroupItem value="home" id="home_opt" className="sr-only" disabled={!deliveryMethods.home.enabled || !allProductsSupportHome} />
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-bold">توصيل للمنزل</span>
                      <Truck className={cn("h-5 w-5", formData.deliveryType === 'home' ? "text-primary" : "text-gray-300")} />
                    </div>
                    <div className="text-xl font-black text-primary">
                      {hasFreeDelivery ? "0 دج" : calculatingDelivery ? "..." : `${deliveryMethods.home.price} دج`}
                    </div>
                    {!deliveryMethods.home.enabled && <span className="text-[10px] text-red-500 font-bold mt-1">غير متوفر لهذه الولاية</span>}
                  </label>

                  <label
                    className={cn(
                      "relative flex flex-col p-4 border-2 rounded-2xl cursor-pointer transition-all active:scale-95",
                      formData.deliveryType === 'desktop' ? "border-primary bg-primary/5 shadow-inner" : "border-gray-100 bg-white hover:border-gray-200",
                      (!deliveryMethods.desk.enabled || !allProductsSupportDesk) && "opacity-50 cursor-not-allowed grayscale"
                    )}
                  >
                    <RadioGroupItem value="desktop" id="desk_opt" className="sr-only" disabled={!deliveryMethods.desk.enabled || !allProductsSupportDesk} />
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-bold">استلام من المكتب</span>
                      <MapPin className={cn("h-5 w-5", formData.deliveryType === 'desktop' ? "text-primary" : "text-gray-300")} />
                    </div>
                    <div className="text-xl font-black text-primary">
                      {hasFreeDelivery ? "0 دج" : calculatingDelivery ? "..." : `${deliveryMethods.desk.price} دج`}
                    </div>
                    {!deliveryMethods.desk.enabled && <span className="text-[10px] text-red-500 font-bold mt-1">غير متوفر لهذه الولاية</span>}
                  </label>
                </RadioGroup>
              )}
            </Card>
          </div>

          {/* Right Sidebar / Summary */}
          <div className="lg:col-span-5 space-y-4">
            <Card className="p-6 md:p-8 border-none shadow-xl shadow-gray-200/50 rounded-2xl md:rounded-3xl sticky top-6">
              <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                ملخص الطلب <Badge variant="secondary" className="rounded-lg">{items.length} قطع</Badge>
              </h2>

              <div className="space-y-4 mb-8">
                {items.map((it) => (
                  <div key={it.id + (it.color ?? "") + (it.size ?? "")} className="flex gap-4">
                    <div className="h-16 w-16 bg-gray-100 rounded-xl flex-shrink-0 overflow-hidden">
                      {it.image && <img src={it.image} alt={it.name_ar} className="h-full w-full object-cover" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-bold text-sm truncate">{it.name_ar}</div>
                      <div className="text-muted-foreground text-[10px] flex gap-1">
                        {it.color && <span className="flex items-center gap-0.5"><div className="w-2 h-2 rounded-full border" style={{ backgroundColor: it.color }}></div> {it.color}</span>}
                        {it.size && <span>| {it.size}</span>}
                        <span>| x{it.quantity}</span>
                      </div>
                      <div className="text-primary font-black text-sm">{(it.price * it.quantity).toFixed(0)} دج</div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="space-y-3 pt-6 border-t border-dashed">
                <div className="flex justify-between text-sm text-gray-500">
                  <span>سعر المنتجات</span>
                  <span>{totalPrice.toFixed(0)} دج</span>
                </div>
                <div className="flex justify-between text-sm text-gray-500">
                  <span>رسوم التوصيل</span>
                  <span className={hasFreeDelivery ? "text-green-600 font-bold" : ""}>
                    {hasFreeDelivery ? "مجاني" : `${deliveryPriceAmount.toFixed(0)} دج`}
                  </span>
                </div>
                <div className="flex justify-between text-2xl font-black pt-4">
                  <span>الإجمالي</span>
                  <span className="text-primary underline decoration-primary/20 underline-offset-8 decoration-4">{finalTotal.toFixed(0)} دج</span>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-3 mt-10">
                <Button
                  type="submit"
                  size="lg"
                  className="h-16 text-xl font-black rounded-2xl shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all w-full"
                  disabled={loading || isDeliveryBlocked}
                >
                  {loading ? "جاري الإرسال..." : "تأكيد الطلب الآن ✨"}
                </Button>

                <Button
                  type="button"
                  variant="outline"
                  size="lg"
                  className="h-14 font-bold rounded-2xl border-green-200 text-green-600 hover:bg-green-50 hover:text-green-700 w-full"
                  onClick={handleOrderViaWhatsApp}
                >
                  <MessageCircle className="h-5 w-5 ml-2" />
                  اطلب عبر الواتساب
                </Button>

                <div className="flex items-center justify-center gap-2 mt-4 text-[10px] text-muted-foreground">
                  <ShieldCheck className="h-4 w-4 text-green-500" />
                  <span>الدفع عند الاستلام • مراجعة الطلب قبل الاستلام</span>
                </div>
              </div>
            </Card>

            {/* Mobile Fixed Confirmation Bar */}
            <div className="lg:hidden fixed bottom-0 inset-x-0 p-4 bg-white/80 backdrop-blur-md border-t z-[60] flex items-center justify-between gap-4">
              <div>
                <div className="text-xs text-muted-foreground">الإجمالي:</div>
                <div className="text-lg font-black text-primary">{finalTotal.toFixed(0)} دج</div>
              </div>
              <Button
                onClick={(e) => handleSubmit(e as any)}
                className="flex-1 h-12 text-lg font-bold rounded-xl"
                disabled={loading || isDeliveryBlocked}
              >
                {loading ? "..." : "تأكيد الطلب"}
              </Button>
            </div>
          </div>
        </form>
      </main>
    </div>
  );
}

export default Checkout;
