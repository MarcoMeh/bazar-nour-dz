import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { ArrowRight, Plus, Trash2, Edit, Store, User, KeyRound } from 'lucide-react';

const BUCKET = 'store-owner-images';

const StoreOwners = () => {
  const [owners, setOwners] = useState<any[]>([]);
  const [stores, setStores] = useState<any[]>([]);
  const [parentCategoryId, setParentCategoryId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingOwner, setEditingOwner] = useState<any | null>(null);

  const [imageFile, setImageFile] = useState<File | null>(null);

  const [formData, setFormData] = useState({
    owner_name: "",
    phone: "",
    email: "",
    address: "",
    store_name: "", // Changed from category_id to store_name
    username: "",
    password: ""
  });

  useEffect(() => {
    fetchStores();
    fetchOwners();
  }, []);

  // Fetch Categories (Stores)
  const fetchStores = async () => {
    try {
      const { data: ourStores, error: err1 } = await supabase
        .from("categories")
        .select("id")
        .eq("slug", "ourstores")
        .single();

      if (err1) {
        // it's okay if not found
        return;
      }

      if (ourStores) {
        setParentCategoryId(ourStores.id);
        const { data: subcats, error } = await supabase
          .from("categories")
          .select("*")
          .eq("parent_id", ourStores.id);
        if (error) throw error;
        setStores(subcats || []);
      }
    } catch (error) {
      console.error("Error fetching stores", error);
    }
  };

  // Fetch Existing Owners
  const fetchOwners = async () => {
    setLoading(true);

    try {
      const { data, error } = await supabase
        .from("store_owners")
        // include related category name if category_id is present
        .select("*, categories(name_ar)")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setOwners(data || []);
    } catch (error) {
      console.error(error);
      toast.error("فشل تحميل البيانات");
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      owner_name: "",
      phone: "",
      email: "",
      address: "",
      store_name: "",
      username: "",
      password: ""
    });
    setEditingOwner(null);
    setImageFile(null);
  };

  // Auto-generate username based on store name
  const handleStoreNameChange = (name: string) => {
    setFormData((prev) => ({
      ...prev,
      store_name: name,
      username: name // User requested username same as store name
    }));
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

  // Create / Update Owner
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (
      !formData.owner_name ||
      !formData.store_name ||
      !formData.username ||
      (!editingOwner && !formData.password)
    ) {
      toast.error("الرجاء تعبئة الحقول الأساسية وكلمة المرور");
      return;
    }

    // Check for duplicate store name
    const trimmedStoreName = formData.store_name.trim();
    const existingStore = stores.find(s => s.name_ar === trimmedStoreName);

    if (existingStore) {
      // If creating, or if editing and changing to a DIFFERENT existing store (which shouldn't happen if we want 1:1, but let's be safe)
      // Actually, if editing and the name matches the CURRENT owner's store, it's fine.
      if (!editingOwner || (editingOwner && existingStore.id !== editingOwner.category_id)) {
        toast.error("هذا المتجر موجود بالفعل. يرجى اختيار اسم آخر.");
        return;
      }
    }

    setLoading(true);

    try {
      let categoryId = editingOwner?.category_id;

      // 1. Handle Category (Store) Creation/Update
      if (editingOwner) {
        // Update existing category name if changed
        if (existingStore && existingStore.id === editingOwner.category_id) {
          // Name didn't change effectively, or changed case/spacing but matched same ID? 
          // If we are here, it means we found the store by name.
          // If the name is exactly the same, no update needed.
          if (existingStore.name_ar !== trimmedStoreName) {
            await supabase.from('categories').update({ name_ar: trimmedStoreName, name: trimmedStoreName }).eq('id', categoryId);
          }
        } else {
          // This case (editingOwner but no existingStore found) means we are renaming to a NEW name
          // So we update the existing category
          await supabase.from('categories').update({
            name_ar: trimmedStoreName,
            name: trimmedStoreName,
            // slug: ... maybe update slug too? let's keep it simple for now
          }).eq('id', categoryId);
        }
      } else {
        // Create new category
        // User requested to remove requirement for parent category
        // if (!parentCategoryId) {
        //   toast.error("فشل العثور على الفئة الرئيسية للمتاجر");
        //   setLoading(false);
        //   return;
        // }

        const slug = `${trimmedStoreName.replace(/\s+/g, '-').toLowerCase()}-${Date.now()}`;
        const { data: newCat, error: catError } = await supabase
          .from('categories')
          .insert([{
            name_ar: trimmedStoreName,
            name: trimmedStoreName,
            parent_id: parentCategoryId || null, // Allow null if not found
            slug: slug
          }])
          .select()
          .single();

        if (catError) throw catError;
        categoryId = newCat.id;
      }

      // 2. Handle Image Upload
      const uploadedUrl = await uploadImageAndGetUrl(imageFile, formData.username || 'stores');

      // 3. Create/Update Owner
      const payload: any = {
        owner_name: formData.owner_name,
        phone: formData.phone,
        email: formData.email,
        address: formData.address,
        category_id: categoryId,
        username: formData.username
      };

      if (formData.password) payload.password = formData.password;
      if (uploadedUrl) payload.store_image_url = uploadedUrl;

      let error: any = null;

      if (editingOwner) {
        const updatePayload = { ...payload };
        if (!updatePayload.password) delete updatePayload.password;

        const res = await supabase
          .from("store_owners")
          .update(updatePayload)
          .eq("id", editingOwner.id);
        error = res.error;
      } else {
        const res = await supabase.from("store_owners").insert([payload]);
        error = res.error;
      }

      if (error) throw error;

      toast.success(editingOwner ? "تم تحديث البيانات" : "تم إضافة المالك وإنشاء المتجر");

      setIsDialogOpen(false);
      resetForm();
      fetchOwners();
      fetchStores(); // Refresh stores list as we might have added/renamed one
    } catch (error: any) {
      console.error("Error:", error);
      toast.error("حدث خطأ: " + (error?.message ?? error));
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("هل أنت متأكد؟ سيتم حذف حساب الدخول أيضاً.")) return;

    const { error } = await supabase.from("store_owners").delete().eq("id", id);

    if (error) {
      toast.error("فشل الحذف");
    } else {
      toast.success("تم الحذف");
      fetchOwners();
    }
  };

  const handleEdit = (owner: any) => {
    setEditingOwner(owner);
    setFormData({
      owner_name: owner.owner_name || "",
      phone: owner.phone || "",
      email: owner.email || "",
      address: owner.address || "",
      store_name: owner.categories?.name_ar || "",
      username: owner.username || "",
      password: ""
    });
    setImageFile(null);
    setIsDialogOpen(true);
  };

  return (
    <div className="min-h-screen bg-background" dir="rtl">
      <header className="border-b bg-card p-4">
        <div className="container mx-auto flex justify-between items-center">
          <Link to="/admin">
            <Button variant="ghost">
              <ArrowRight className="ml-2 h-4 w-4" />
              العودة
            </Button>
          </Link>
          <h1 className="text-xl font-bold">لوحة التحكم</h1>
        </div>
      </header>

      <main className="container mx-auto p-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">إدارة أصحاب المحلات</h1>

          <Dialog
            open={isDialogOpen}
            onOpenChange={(open) => {
              setIsDialogOpen(open);
              if (!open) resetForm();
            }}
          >
            <DialogTrigger asChild>
              <Button>
                <Plus className="ml-2 h-4 w-4" /> إضافة مالك
              </Button>
            </DialogTrigger>

            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>{editingOwner ? "تعديل المالك" : "إضافة مالك جديد"}</DialogTitle>
              </DialogHeader>

              <form onSubmit={handleSubmit} className="space-y-4 mt-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>المحل التابع له</Label>
                    <Input
                      value={formData.store_name}
                      onChange={(e) => handleStoreNameChange(e.target.value)}
                      placeholder="أدخل اسم المتجر الجديد"
                      required
                    />
                  </div>

                  <div>
                    <Label>اسم المالك</Label>
                    <Input
                      value={formData.owner_name}
                      onChange={(e) =>
                        setFormData({ ...formData, owner_name: e.target.value })
                      }
                      required
                    />
                  </div>
                </div>

                <div className="bg-muted/50 p-4 rounded border border-dashed grid grid-cols-2 gap-4">
                  <div>
                    <Label>اسم المستخدم (Login ID)</Label>
                    <Input
                      value={formData.username}
                      onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                    />
                  </div>

                  <div>
                    <Label>كلمة المرور {editingOwner && "(اتركها فارغة لعدم التغيير)"}</Label>
                    <Input
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      placeholder="******"
                      required={!editingOwner}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>رقم الهاتف</Label>
                    <Input
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      dir="ltr"
                      className="text-right"
                    />
                  </div>

                  <div>
                    <Label>البريد الإلكتروني (للدخول)</Label>
                    <Input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      required
                      dir="ltr"
                      className="text-right"
                    />
                  </div>
                </div>

                <div>
                  <Label>العنوان</Label>
                  <Input
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  />
                </div>

                {/* Store image */}
                <div>
                  <Label>صورة المتجر (اختياري)</Label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => setImageFile(e.target.files?.[0] ?? null)}
                  />
                  {editingOwner?.store_image_url && !imageFile && (
                    <img src={editingOwner.store_image_url} alt="store" className="mt-2 w-36 h-24 object-cover rounded" />
                  )}
                  {imageFile && (
                    <p className="mt-2 text-sm">Selected: {imageFile.name}</p>
                  )}
                </div>

                <div className="flex gap-2 justify-end pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsDialogOpen(false)}
                  >
                    إلغاء
                  </Button>

                  <Button type="submit" disabled={loading}>
                    {loading ? "جاري الحفظ..." : "حفظ"}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* LIST OF OWNERS */}
        <div className="grid gap-4">
          {loading ? (
            <p>جاري التحميل...</p>
          ) : (
            owners.map((owner) => (
              <Card
                key={owner.id}
                className="p-4 flex flex-col md:flex-row justify-between items-center gap-4"
              >
                <div className="flex items-center gap-4">
                  <div>
                    {owner.store_image_url ? (
                      <img src={owner.store_image_url} alt="store" className="w-20 h-14 object-cover rounded" />
                    ) : (
                      <div className="w-20 h-14 bg-muted/30 rounded flex items-center justify-center text-sm">لا صورة</div>
                    )}
                  </div>

                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-bold text-lg">{owner.owner_name}</h3>

                      <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded-full flex items-center gap-1">
                        <Store className="w-3 h-3" /> {owner.categories?.name_ar}
                      </span>
                    </div>

                    <div className="text-sm text-muted-foreground mt-1 flex gap-4">
                      <span>
                        <User className="inline w-3 h-3" /> {owner.username}
                      </span>

                      <span>
                        <KeyRound className="inline w-3 h-3" /> {owner.email}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button variant="outline" size="icon" onClick={() => handleEdit(owner)}>
                    <Edit className="h-4 w-4" />
                  </Button>

                  <Button variant="destructive" size="icon" onClick={() => handleDelete(owner.id)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </Card>
            ))
          )}
        </div>
      </main>
    </div>
  );
};

export default StoreOwners;
