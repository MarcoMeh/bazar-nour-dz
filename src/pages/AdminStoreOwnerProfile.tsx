import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Save, Loader2, Upload } from 'lucide-react';

const BUCKET = 'store-images';

const AdminStoreOwnerProfile = () => {
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    store_name: '',
    owner_name: '',
    phone: '',
    email: '',
    address: '',
    description: '',
    // Removed unsupported fields for now: store_number, whatsapp_number, socials
  });

  const [storeId, setStoreId] = useState<string | null>(null);

  useEffect(() => {
    fetchOwnerData();
  }, []);

  const fetchOwnerData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // 1. Fetch Profile Data
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (profileError) throw profileError;

      // 2. Fetch Store Data
      const { data: store, error: storeError } = await supabase
        .from('stores')
        .select('*')
        .eq('owner_id', user.id)
        .single();

      // Store might not exist yet or error if not found (though it should exist for store owner)
      if (storeError && storeError.code !== 'PGRST116') {
        console.error("Error fetching store:", storeError);
      }

      setFormData({
        store_name: store?.name || '',
        owner_name: profile?.full_name || '',
        phone: profile?.phone || '',
        email: user.email || '',
        address: profile?.address || '',
        description: store?.description || '',
      });

      if (store) {
        setStoreId(store.id);
        setPreviewUrl(store.image_url ?? null);
      }

    } catch (error) {
      console.error(error);
      toast.error('فشل في جلب البيانات');
    } finally {
      setFetching(false);
    }
  };

  // helper: upload image and return public url (or null)
  const uploadImageAndGetUrl = async (file: File | null) => {
    if (!file) return null;
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}.${fileExt}`;
      const filePath = `${fileName}`;

      const { error: uploadError } = await supabase.storage.from(BUCKET).upload(filePath, file, {
        cacheControl: '3600',
        upsert: false
      });
      if (uploadError) throw uploadError;

      const { data: urlData } = supabase.storage.from(BUCKET).getPublicUrl(filePath);
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

      const uploadedUrl = await uploadImageAndGetUrl(imageFile);

      // 1. Update Profile
      const { error: profileError } = await supabase
        .from('profiles')
        .update({
          full_name: formData.owner_name,
          phone: formData.phone,
          address: formData.address
        })
        .eq('id', user.id);

      if (profileError) throw profileError;

      // 2. Update Store
      if (storeId) {
        const storeUpdatePayload: any = {
          name: formData.store_name,
          description: formData.description
        };
        if (uploadedUrl) storeUpdatePayload.image_url = uploadedUrl;

        const { error: storeError } = await supabase
          .from('stores')
          .update(storeUpdatePayload)
          .eq('id', storeId);

        if (storeError) throw storeError;
      } else {
        // Create store if it doesn't exist (unlikely for store owner role but possible)
        // For now assume it exists or we skip
      }

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
                <Label htmlFor="store_name">اسم المتجر</Label>
                <Input
                  id="store_name"
                  value={formData.store_name}
                  onChange={(e) => setFormData({ ...formData, store_name: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="owner_name">اسم المالك</Label>
                <Input
                  id="owner_name"
                  value={formData.owner_name}
                  onChange={(e) => setFormData({ ...formData, owner_name: e.target.value })}
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="email">البريد الإلكتروني</Label>
                <Input id="email" value={formData.email} disabled className="bg-muted" dir="ltr" />
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">رقم الهاتف</Label>
                <Input
                  id="phone"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  dir="ltr"
                />
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

            <div className="space-y-2">
              <Label htmlFor="description">وصف المتجر</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="وصف مختصر للمتجر..."
              />
            </div>

            {/* Store image */}
            <div className="space-y-2">
              <Label>صورة المتجر</Label>
              <div className="flex flex-col items-center gap-4 border-2 border-dashed rounded-lg p-4">
                {previewUrl ? (
                  <img src={previewUrl} alt="preview" className="w-48 h-32 object-cover rounded" />
                ) : (
                  <div className="text-muted-foreground">لا توجد صورة</div>
                )}

                <div className="flex items-center gap-2">
                  <Input
                    id="image-upload"
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                      const f = e.target.files?.[0] ?? null;
                      setImageFile(f);
                      if (f) {
                        const url = URL.createObjectURL(f);
                        setPreviewUrl(url);
                      }
                    }}
                  />
                  <Label
                    htmlFor="image-upload"
                    className="cursor-pointer bg-secondary text-secondary-foreground hover:bg-secondary/90 h-9 px-4 py-2 rounded-md text-sm font-medium flex items-center"
                  >
                    <Upload className="w-4 h-4 ml-2" />
                    رفع صورة
                  </Label>
                </div>
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
