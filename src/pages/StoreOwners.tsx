import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { ArrowRight, Plus, Trash2, Edit, Store, User, KeyRound, Phone } from 'lucide-react';

const StoreOwners = () => {
  const [owners, setOwners] = useState([]);
  const [stores, setStores] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingOwner, setEditingOwner] = useState(null);

  const [formData, setFormData] = useState({
    owner_name: "",
    phone: "",
    email: "",
    address: "",
    subcategory_id: "",
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
      const { data: ourStores } = await supabase
        .from("categories")
        .select("id")
        .eq("slug", "ourstores")
        .single();

      if (ourStores) {
        const { data: subcats } = await supabase
          .from("categories")
          .select("*")
          .eq("parent_id", ourStores.id);
        setStores(subcats || []);
      }
    } catch (error) {
      console.error("Error fetching stores", error);
    }
  };

  // Fetch Existing Owners
  const fetchOwners = async () => {
    setLoading(true);

    const { data, error } = await supabase
      .from("store_owners")
      .select("*, categories(name_ar)")
      .order("created_at", { ascending: false });

    if (error) {
      console.error(error);
      toast.error("فشل تحميل البيانات");
    } else {
      setOwners(data || []);
    }
    setLoading(false);
  };

  const resetForm = () => {
    setFormData({
      owner_name: "",
      phone: "",
      email: "",
      address: "",
      subcategory_id: "",
      username: "",
      password: ""
    });
    setEditingOwner(null);
  };

  // Auto-generate username
  const handleStoreSelect = (storeId) => {
    const store = stores.find((s) => s.id === storeId);

    const autoUsername = store
      ? `${store.name_ar.replace(/\s+/g, "_")}_${Math.floor(Math.random() * 1000)}`
      : "";

    setFormData((prev) => ({
      ...prev,
      subcategory_id: storeId,
      username: autoUsername
    }));
  };

  // Create / Update Owner
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (
      !formData.owner_name ||
      !formData.subcategory_id ||
      !formData.username ||
      (!editingOwner && !formData.password)
    ) {
      toast.error("الرجاء تعبئة الحقول الأساسية وكلمة المرور");
      return;
    }

    setLoading(true);

    const payload = {
      owner_name: formData.owner_name,
      phone: formData.phone,
      email: formData.email,
      address: formData.address,
      subcategory_id: formData.subcategory_id,
      username: formData.username,
      password: formData.password
    };

    try {
      let error;

      if (editingOwner) {
        const updatePayload = { ...payload };
        if (!updatePayload.password) delete updatePayload.password;

        ({ error } = await supabase
          .from("store_owners")
          .update(updatePayload)
          .eq("id", editingOwner.id));
      } else {
        ({ error } = await supabase.from("store_owners").insert([payload]));
      }

      if (error) throw error;

      toast.success(editingOwner ? "تم تحديث البيانات" : "تم إضافة المالك وإنشاء حساب الدخول");

      setIsDialogOpen(false);
      resetForm();
      fetchOwners();
    } catch (error) {
      console.error("Error:", error);
      toast.error("حدث خطأ: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("هل أنت متأكد؟ سيتم حذف حساب الدخول أيضاً.")) return;

    const { error } = await supabase.from("store_owners").delete().eq("id", id);

    if (error) {
      toast.error("فشل الحذف");
    } else {
      toast.success("تم الحذف");
      fetchOwners();
    }
  };

  const handleEdit = (owner) => {
    setEditingOwner(owner);
    setFormData({
      owner_name: owner.owner_name || "",
      phone: owner.phone || "",
      email: owner.email || "",
      address: owner.address || "",
      subcategory_id: owner.subcategory_id || "",
      username: owner.username || "",
      password: ""
    });
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
                    <Select value={formData.subcategory_id} onValueChange={handleStoreSelect}>
                      <SelectTrigger>
                        <SelectValue placeholder="اختر المتجر" />
                      </SelectTrigger>
                      <SelectContent>
                        {stores.map((s) => (
                          <SelectItem key={s.id} value={s.id}>
                            {s.name_ar}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
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
                    <Input value={formData.username} readOnly className="bg-muted font-mono" />
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
