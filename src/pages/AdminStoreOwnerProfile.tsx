import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Save, Loader2 } from 'lucide-react';

const AdminStoreOwnerProfile = () => {
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  
  // حالة لتخزين بيانات النموذج
  const [formData, setFormData] = useState({
    owner_name: '',
    phone: '',
    email: '',
    address: '',
    whatsapp_number: '',
    instagram_link: '',
    facebook_link: '',
    tiktok_link: ''
  });

  // 1. جلب بيانات المالك عند فتح الصفحة
  useEffect(() => {
    fetchOwnerData();
  }, []);

  const fetchOwnerData = async () => {
    try {
      // منطق: نحصل على المستخدم الحالي أولاً
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) return;

      // نفترض أن هناك علاقة بين id المستخدم و id الجدول، أو عمود يربطهم
      // هنا سأفترض أن id المالك هو نفسه id المستخدم (أو يمكنك التعديل للبحث بالبريد)
      const { data, error } = await supabase
        .from('store_owners')
        .select('*')
        .eq('id', user.id) // أو .eq('email', user.email)
        .single();

      if (error) throw error;

      if (data) {
        setFormData({
          owner_name: data.owner_name || '',
          phone: data.phone || '',
          email: data.email || '',
          address: data.address || '',
          whatsapp_number: data.whatsapp_number || '',
          instagram_link: data.instagram_link || '',
          facebook_link: data.facebook_link || '',
          tiktok_link: data.tiktok_link || ''
        });
      }
    } catch (error) {
      console.error('Error:', error);
      toast.error('فشل في جلب البيانات');
    } finally {
      setFetching(false);
    }
  };

  // 2. تحديث البيانات عند الضغط على حفظ
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("No user found");

      const { error } = await supabase
        .from('store_owners')
        .update({
          owner_name: formData.owner_name,
          phone: formData.phone,
          address: formData.address,
          whatsapp_number: formData.whatsapp_number,
          instagram_link: formData.instagram_link,
          facebook_link: formData.facebook_link,
          tiktok_link: formData.tiktok_link
          // لا نحدث البريد الإلكتروني عادةً هنا لأسباب أمنية
        })
        .eq('id', user.id); // شرط التحديث

      if (error) throw error;
      toast.success('تم تحديث المعلومات بنجاح');
    } catch (error) {
      toast.error('حدث خطأ أثناء الحفظ');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  if (fetching) return <div className="flex justify-center p-10"><Loader2 className="animate-spin" /></div>;

  return (
    <div className="container mx-auto px-4 py-8 max-w-3xl">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-center">إعدادات الملف الشخصي للمتجر</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            
            {/* المعلومات الأساسية */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="owner_name">اسم المالك / المتجر</Label>
                <Input
                  id="owner_name"
                  value={formData.owner_name}
                  onChange={(e) => setFormData({ ...formData, owner_name: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">البريد الإلكتروني</Label>
                <Input
                  id="email"
                  value={formData.email}
                  disabled // نجعل البريد للقراءة فقط
                  className="bg-muted"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="address">العنوان التفصيلي</Label>
              <Textarea
                id="address"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                placeholder="الولاية، البلدية، الحي..."
              />
            </div>

            {/* معلومات الاتصال */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="phone">رقم الهاتف</Label>
                <Input
                  id="phone"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="whatsapp">رقم الواتساب</Label>
                <Input
                  id="whatsapp"
                  value={formData.whatsapp_number}
                  onChange={(e) => setFormData({ ...formData, whatsapp_number: e.target.value })}
                  placeholder="مثال: 213660..."
                />
              </div>
            </div>

            {/* روابط التواصل الاجتماعي */}
            <div className="space-y-4 border-t pt-4 mt-4">
              <h3 className="font-semibold text-lg">روابط التواصل الاجتماعي</h3>
              
              <div className="space-y-2">
                <Label htmlFor="facebook">رابط فيسبوك</Label>
                <Input
                  id="facebook"
                  value={formData.facebook_link}
                  onChange={(e) => setFormData({ ...formData, facebook_link: e.target.value })}
                  placeholder="https://facebook.com/..."
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="instagram">رابط انستغرام</Label>
                <Input
                  id="instagram"
                  value={formData.instagram_link}
                  onChange={(e) => setFormData({ ...formData, instagram_link: e.target.value })}
                  placeholder="https://instagram.com/..."
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="tiktok">رابط تيك توك</Label>
                <Input
                  id="tiktok"
                  value={formData.tiktok_link}
                  onChange={(e) => setFormData({ ...formData, tiktok_link: e.target.value })}
                  placeholder="https://tiktok.com/..."
                />
              </div>
            </div>

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  جاري الحفظ...
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  حفظ التغييرات
                </>
              )}
            </Button>

          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminStoreOwnerProfile;