import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Save, Loader2 } from 'lucide-react';

const BUCKET = 'store-owner-images';

const AdminStoreOwnerProfile = () => {
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  // default fields empty
  const [formData, setFormData] = useState({
    owner_name: '',
    phone: '',
    store_number: '',
    email: '',
    address: '',
    whatsapp_number: '',
    instagram_link: '',
    facebook_link: '',
    tiktok_link: ''
  });

  useEffect(() => {
    fetchOwnerData();
  }, []);

  const fetchOwnerData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // IMPORTANT: store_owners.user_id links to auth.users.id
      const { data, error } = await supabase
        .from('store_owners')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error) throw error;

      if (data) {
        setFormData({
          owner_name: data.owner_name || '',
          phone: data.phone || '',
          store_number: data.store_number || '',
          email: user.email || '',
          address: data.address || '',
          whatsapp_number: data.whatsapp_number || '',
          instagram_link: data.instagram_link || '',
          facebook_link: data.facebook_link || '',
          tiktok_link: data.tiktok_link || ''
        });
        setPreviewUrl(data.store_image_url ?? null);
      }
    } catch (error) {
      console.error(error);
      toast.error('فشل في جلب البيانات');
    } finally {
      setFetching(false);
    }
  };

  // helper: upload image and return public url (or null)
  const uploadImageAndGetUrl = async (file: File | null, keyPrefix = 'stores') => {
    if (!file) return null;
    try {
      const filePath = `${keyPrefix}/${Date.now()}_${file.name.replace(/\s+/g, '_')}`;
      const { error: uploadError } = await supabase.storage.from(BUCKET).upload(filePath, file, {
        cacheControl: '3600',
        upsert: false
      });
      if (uploadError) throw uploadError;
      const { data: urlData } = supabase.storage.from(BUCKET).getPublicUrl(filePath);
      // @ts-ignore
      return urlData?.publicUrl ?? null;
    } catch (err) {
      console.error('Upload error', err);
      toast.error('فشل رفع صورة المتجر');
      return null;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("User not found");

      const uploadedUrl = await uploadImageAndGetUrl(imageFile, user.id ?? 'stores');

      const updatePayload: any = {
        owner_name: formData.owner_name,
        phone: formData.phone,
        store_number: formData.store_number,
        address: formData.address,
        whatsapp_number: formData.whatsapp_number,
        instagram_link: formData.instagram_link,
        facebook_link: formData.facebook_link,
        tiktok_link: formData.tiktok_link
      };

      if (uploadedUrl) updatePayload.store_image_url = uploadedUrl;

      const { error } = await supabase
        .from('store_owners')
        .update(updatePayload)
        .eq('user_id', user.id);

      if (error) throw error;

      toast.success('تم تحديث المعلومات بنجاح');
      if (uploadedUrl) setPreviewUrl(uploadedUrl);
    } catch (error) {
      toast.error('حدث خطأ أثناء الحفظ');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
    return (
      <div className="flex justify-center p-10">
        <Loader2 className="animate-spin h-10 w-10" />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-3xl">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-center">
            إعدادات الملف الشخصي للمتجر
          </CardTitle>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">

            {/* Basic Info */}
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
                <Input id="email" value={formData.email} disabled className="bg-muted" />
              </div>
            </div>

            {/* Address */}
            <div className="space-y-2">
              <Label htmlFor="address">العنوان</Label>
              <Textarea
                id="address"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                placeholder="الولاية، البلدية، الحي..."
              />
            </div>

            {/* Contact */}
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
                <Label htmlFor="store_number">رقم المتجر</Label>
                <Input
                  id="store_number"
                  value={formData.store_number}
                  onChange={(e) => setFormData({ ...formData, store_number: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="whatsapp">رقم الواتساب</Label>
                <Input
                  id="whatsapp"
                  value={formData.whatsapp_number}
                  onChange={(e) => setFormData({ ...formData, whatsapp_number: e.target.value })}
                  placeholder="مثال: 2136..."
                />
              </div>
            </div>

            {/* Store image */}
            <div className="space-y-2">
              <Label>صورة المتجر</Label>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => {
                  const f = e.target.files?.[0] ?? null;
                  setImageFile(f);
                  if (f) {
                    const url = URL.createObjectURL(f);
                    setPreviewUrl(url);
                  }
                }}
              />
              {previewUrl && (
                <img src={previewUrl} alt="preview" className="mt-2 w-48 h-32 object-cover rounded" />
              )}
            </div>

            {/* Social Links */}
            <div className="space-y-4 border-t pt-4 mt-4">
              <h3 className="font-semibold text-lg">روابط التواصل الاجتماعي</h3>

              <div className="space-y-2">
                <Label htmlFor="facebook">فيسبوك</Label>
                <Input
                  id="facebook"
                  value={formData.facebook_link}
                  onChange={(e) => setFormData({ ...formData, facebook_link: e.target.value })}
                  placeholder="https://facebook.com/..."
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="instagram">انستغرام</Label>
                <Input
                  id="instagram"
                  value={formData.instagram_link}
                  onChange={(e) => setFormData({ ...formData, instagram_link: e.target.value })}
                  placeholder="https://instagram.com/..."
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="tiktok">تيك توك</Label>
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
