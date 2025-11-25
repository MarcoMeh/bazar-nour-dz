import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";

export default function Checkout() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [deliveryOption, setDeliveryOption] = useState("home");
  const [wilaya, setWilaya] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast({
      title: "تم إرسال الطلب بنجاح",
      description: "سيتم التواصل معك قريباً لتأكيد الطلب",
    });
    navigate("/");
  };

  return (
    <div className="container py-8">
      <h1 className="text-3xl font-bold mb-8 text-primary">إتمام الطلب</h1>

      <form onSubmit={handleSubmit}>
        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            {/* Customer Information */}
            <Card>
              <CardHeader>
                <CardTitle>معلومات العميل</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-2">
                  <Label htmlFor="fullname">الاسم الكامل</Label>
                  <Input id="fullname" required placeholder="أدخل اسمك الكامل" />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="phone">رقم الهاتف</Label>
                  <Input id="phone" required placeholder="0555123456" dir="ltr" />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="address">العنوان الكامل</Label>
                  <Input id="address" required placeholder="العنوان التفصيلي" />
                </div>
              </CardContent>
            </Card>

            {/* Delivery Information */}
            <Card>
              <CardHeader>
                <CardTitle>معلومات التوصيل</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-2">
                  <Label htmlFor="wilaya">الولاية</Label>
                  <Select value={wilaya} onValueChange={setWilaya} required>
                    <SelectTrigger>
                      <SelectValue placeholder="اختر الولاية" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="16">الجزائر</SelectItem>
                      <SelectItem value="31">وهران</SelectItem>
                      <SelectItem value="25">قسنطينة</SelectItem>
                      <SelectItem value="9">البليدة</SelectItem>
                      <SelectItem value="6">بجاية</SelectItem>
                      <SelectItem value="19">سطيف</SelectItem>
                      <SelectItem value="23">عنابة</SelectItem>
                      <SelectItem value="13">تلمسان</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label>خيار التوصيل</Label>
                  <RadioGroup value={deliveryOption} onValueChange={setDeliveryOption}>
                    <div className="flex items-center space-x-2 space-x-reverse">
                      <RadioGroupItem value="home" id="home" />
                      <Label htmlFor="home" className="cursor-pointer">
                        توصيل إلى المنزل
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2 space-x-reverse">
                      <RadioGroupItem value="desktop" id="desktop" />
                      <Label htmlFor="desktop" className="cursor-pointer">
                        توصيل إلى المكتب
                      </Label>
                    </div>
                  </RadioGroup>
                </div>
              </CardContent>
            </Card>

            {/* Payment Method */}
            <Card>
              <CardHeader>
                <CardTitle>طريقة الدفع</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2 p-4 bg-accent rounded-lg">
                  <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-primary-foreground">
                    ✓
                  </div>
                  <div>
                    <p className="font-semibold">الدفع عند الاستلام</p>
                    <p className="text-sm text-muted-foreground">
                      ادفع نقداً عند استلام طلبك
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Order Summary */}
          <div>
            <Card className="sticky top-4">
              <CardHeader>
                <CardTitle>ملخص الطلب</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">المنتجات (2)</span>
                    <span className="font-medium">5,000 دج</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">التوصيل</span>
                    <span className="font-medium">400 دج</span>
                  </div>
                </div>
                <div className="border-t pt-4">
                  <div className="flex justify-between text-lg font-bold">
                    <span>المجموع الكلي</span>
                    <span className="text-primary">5,400 دج</span>
                  </div>
                </div>
                <Button type="submit" className="w-full" size="lg">
                  تأكيد الطلب
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </form>
    </div>
  );
}
