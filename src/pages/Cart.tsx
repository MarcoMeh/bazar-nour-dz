import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Minus,
  Plus,
  Trash2,
  ShoppingBag,
  Store,
  Phone,
  User,
  MapPin,
  Truck,
  MessageCircle,
  ShieldCheck,
  Gift,
  AlertTriangle
} from "lucide-react";
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
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { QuickWilayaSelector } from "@/components/checkout/QuickWilayaSelector";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface Wilaya {
  id: number;
  code: string;
  name: string;
  name_ar: string;
  home_delivery_price: number;
  desk_delivery_price: number;
}

interface DeliveryMethods {
  home: { enabled: boolean; price: number };
  desk: { enabled: boolean; price: number };
  error?: string;
}

export default function Cart() {
  const { items, removeItem, updateQuantity, totalPrice, clearCart } = useCart();
  const navigate = useNavigate();
  const [isErrorOpen, setIsErrorOpen] = useState(false);

  // --- Checkout Logic Integration ---
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

    // 1. Check multi-store
    const owners = new Set(items.map(item => item.ownerId).filter(Boolean));
    if (owners.size > 1) {
      setIsErrorOpen(true);
      return;
    }

    // 2. Validate form
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
      window.scrollTo(0, 0);
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
        <form onSubmit={handleSubmit} className="grid lg:grid-cols-12 gap-8">
          <div className="lg:col-span-7 space-y-6">
            <h2 className="text-xl font-bold flex items-center gap-2 mb-2">
              <ShoppingBag className="h-5 w-5 text-primary" />
              المنتجات المختارة ({items.length})
            </h2>
            <div className="space-y-4">
              {items.map((item) => (
                <Card key={item.cartItemId} className="overflow-hidden border-none shadow-sm hover:shadow-md transition-shadow">
                  <CardContent className="p-4 sm:p-6">
                    <div className="flex gap-4 sm:gap-6">
                      <div className="w-20 h-20 sm:w-28 sm:h-28 bg-gray-50 rounded-xl overflow-hidden flex-shrink-0 border border-gray-100">
                        {item.image_url ? (
                          <img src={item.image_url} alt={item.name_ar} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full bg-gray-100 flex items-center justify-center text-gray-400">
                            <ShoppingBag className="h-8 w-8 opacity-20" />
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-bold text-base sm:text-lg mb-1 truncate">{item.name_ar}</h3>
                        <p className="text-primary font-black text-lg mb-3">{item.price} دج</p>

                        <div className="flex flex-wrap gap-2 mb-4">
                          {item.color && (
                            <Badge variant="outline" className="bg-gray-50 text-[10px] sm:text-xs py-0.5 px-2">
                              اللون: {item.color}
                            </Badge>
                          )}
                          {item.size && (
                            <Badge variant="outline" className="bg-gray-50 text-[10px] sm:text-xs py-0.5 px-2">
                              المقاس: {item.size}
                            </Badge>
                          )}
                        </div>

                        <div className="flex items-center justify-between mt-auto">
                          <div className="flex items-center bg-gray-100 rounded-lg p-1">
                            <Button
                              variant="ghost"
                              size="icon"
                              type="button"
                              className="h-7 w-7 sm:h-8 sm:w-8 hover:bg-white hover:shadow-sm"
                              onClick={() => updateQuantity(item.cartItemId, Math.max(1, item.quantity - 1))}
                            >
                              <Minus className="h-3 w-3 sm:h-4 sm:w-4" />
                            </Button>
                            <span className="w-8 sm:w-10 text-center font-bold text-sm sm:text-base">{item.quantity}</span>
                            <Button
                              variant="ghost"
                              size="icon"
                              type="button"
                              className="h-7 w-7 sm:h-8 sm:w-8 hover:bg-white hover:shadow-sm"
                              onClick={() => updateQuantity(item.cartItemId, item.quantity + 1)}
                            >
                              <Plus className="h-3 w-3 sm:h-4 sm:w-4" />
                            </Button>
                          </div>
                          <Button
                            variant="ghost"
                            size="icon"
                            type="button"
                            className="text-gray-400 hover:text-destructive hover:bg-destructive/5"
                            onClick={() => removeItem(item.cartItemId)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Delivery Form */}
            <div className="space-y-6 pt-4">
              <h2 className="text-xl font-bold flex items-center gap-2">
                <Truck className="h-5 w-5 text-primary" />
                بيانات التوصيل
              </h2>

              <Card className="p-6 md:p-8 border-none shadow-xl shadow-gray-200/50 rounded-2xl md:rounded-3xl">
                <div className="space-y-6">
                  {/* Phone */}
                  <div className="space-y-2">
                    <Label className="text-sm font-bold">رقم الهاتف <span className="text-red-500">*</span></Label>
                    <div className="relative group">
                      <Input
                        type="tel"
                        placeholder="06 / 07 / 05 ..."
                        className="h-14 text-lg pr-12 font-bold bg-gray-50/50 border-gray-200 focus:bg-white transition-all rounded-xl"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        required
                      />
                      <Phone className="absolute right-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                    </div>
                  </div>

                  {/* Name */}
                  <div className="space-y-2">
                    <Label className="text-sm font-bold">الاسم الكامل <span className="text-red-500">*</span></Label>
                    <div className="relative group">
                      <Input
                        placeholder="اسمك بالكامل"
                        className="h-14 pr-12 bg-gray-50/50 border-gray-200 focus:bg-white transition-all rounded-xl"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        required
                      />
                      <User className="absolute right-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                    </div>
                  </div>

                  {/* Wilaya */}
                  <div className="space-y-4 pt-2">
                    <QuickWilayaSelector
                      wilayas={wilayas}
                      selectedId={formData.wilayaId}
                      onSelect={(id) => setFormData(prev => ({ ...prev, wilayaId: id }))}
                    />

                    <div className="space-y-2">
                      <Label className="text-sm font-bold">أو اختر من القائمة <span className="text-red-500">*</span></Label>
                      <Select value={formData.wilayaId} onValueChange={(v) => setFormData({ ...formData, wilayaId: v })}>
                        <SelectTrigger className="h-14 bg-gray-50/50 border-gray-200 rounded-xl">
                          <SelectValue placeholder="قائمة الولايات (69 ولاية)" />
                        </SelectTrigger>
                        <SelectContent className="max-h-80">
                          {wilayas.map((w) => (
                            <SelectItem key={w.id} value={String(w.id)}>{w.code} - {w.name_ar}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  {/* Address */}
                  <div className="space-y-2">
                    <Label className="text-sm font-bold">العنوان (اختياري)</Label>
                    <div className="relative group">
                      <Input
                        placeholder="اسم البلدية أو الحي..."
                        className="h-14 pr-12 bg-gray-50/50 border-gray-200 focus:bg-white transition-all rounded-xl"
                        value={formData.address}
                        onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                      />
                      <MapPin className="absolute right-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                    </div>
                  </div>
                </div>
              </Card>

              {/* Delivery Methods */}
              <Card className="p-6 md:p-8 border-none shadow-xl shadow-gray-200/50 rounded-2xl md:rounded-3xl">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-2.5 bg-primary/10 rounded-xl text-primary"><Truck className="h-5 w-5" /></div>
                  <h2 className="text-xl font-bold">طريقة التوصيل</h2>
                </div>

                {hasFreeDelivery && (
                  <div className="mb-6 p-4 bg-green-50 border border-green-100 rounded-2xl flex items-center gap-3">
                    <div className="bg-green-100 p-2 rounded-full"><Gift className="h-5 w-5 text-green-600" /></div>
                    <span className="text-green-800 text-sm font-bold">مبروك! التوصيل مجاني لطلبك بالكامل 🎁</span>
                  </div>
                )}

                {deliveryMethods.error && (
                  <Alert variant="destructive" className="mb-6 rounded-2xl">
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
                    <Label
                      className={cn(
                        "relative flex flex-col p-4 border-2 rounded-2xl cursor-pointer transition-all",
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
                    </Label>

                    <Label
                      className={cn(
                        "relative flex flex-col p-4 border-2 rounded-2xl cursor-pointer transition-all",
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
                    </Label>
                  </RadioGroup>
                )}
              </Card>
            </div>
          </div>

          <div className="lg:col-span-5">
            <Card className="sticky top-24 p-6 md:p-8 border-none shadow-xl shadow-gray-200/50 rounded-2xl md:rounded-3xl">
              <h2 className="text-xl font-bold mb-6">ملخص الطلب</h2>
              <CardContent className="p-0 space-y-4">
                <div className="flex justify-between text-sm text-gray-500">
                  <span>سعر المنتجات</span>
                  <span className="font-bold text-gray-900">{totalPrice} دج</span>
                </div>
                <div className="flex justify-between text-sm text-gray-500">
                  <span>رسوم التوصيل</span>
                  <span className={cn("font-bold text-gray-900", hasFreeDelivery && "text-green-600")}>
                    {hasFreeDelivery ? "مجاني" : calculatingDelivery ? "..." : `${deliveryPriceAmount} دج`}
                  </span>
                </div>

                <div className="border-t border-dashed pt-4 mt-4">
                  <div className="flex justify-between text-2xl font-black">
                    <span>الإجمالي</span>
                    <span className="text-primary">{finalTotal} دج</span>
                  </div>
                </div>

                <div className="pt-6 space-y-3">
                  <Button
                    type="submit"
                    className="w-full h-16 text-xl font-black rounded-2xl shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all"
                    size="lg"
                    disabled={loading || isDeliveryBlocked}
                  >
                    {loading ? "جاري الإرسال..." : "تأكيد الطلب الآن ✨"}
                  </Button>

                  <Button
                    type="button"
                    variant="outline"
                    className="w-full h-14 font-bold rounded-2xl border-green-200 text-green-600 hover:bg-green-50"
                    size="lg"
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
              </CardContent>
            </Card>
          </div>
        </form>
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
