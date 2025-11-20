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
// You might need to import your logo if you want it in the header, otherwise I removed it to keep it generic
// import logo from '@/assets/bazzarna-logo.jpeg'; 

const StoreOwners = () => {
  const navigate = useNavigate();
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

  const fetchOwners = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("store_owners")
      .select("*, categories(name_ar)")
      .order("created_at", { ascending: false });

    if (error) toast.error("فشل تحميل البيانات");
    setOwners(data || []);
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

  const handleStoreSelect = (storeId) => {
    const store = stores.find((s) => s.id === storeId);
    setFormData(prev => ({
      ...prev,
      subcategory_id: storeId,
      username: store ? store.name_ar : ""
    }));
  };

  const handleSubmit = async (e) => {
  e.preventDefault();

  // التحقق الأساسي
  if (!formData.owner_name || !formData.subcategory_id || !formData.username || !formData.password || !formData.email) {
    toast.error("الرجاء تعبئة جميع الحقول الأساسية");
    return;
  }

  setLoading(true);

  // 1) إنشاء حساب auth جديد لصاحب المحل
  const { data: newUser, error: signUpError } = await supabase.auth.signUp({
    email: formData.email,
    password: formData.password
  });

  console.log("New user:", newUser, "Signup error:", signUpError);

  if (signUpError) {
    toast.error("فشل إنشاء حساب المستخدم");
    setLoading(false);
    return;
  }

  const authUserId = newUser?.user?.id;
  if (!authUserId) {
    toast.error("لم يتم الحصول على معرف المستخدم");
    setLoading(false);
    return;
  }

  // 2) تجهيز البيانات لحفظها في store_owners
  const payload = {
    owner_name: formData.owner_name,
    phone: formData.phone,
    email: formData.email,
    address: formData.address,
    subcategory_id: formData.subcategory_id,
    username: formData.username,
    auth_user_id: authUserId, // مهم!
    password: formData.password  // لو تريد حفظه (غير آمن لكنه حسب اختيارك)
  };

  let error;

  // 3) التعديل أو الإضافة
  if (editingOwner) {
    ({ error } = await supabase.from('store_owners').update(payload).eq('id', editingOwner.id));
  } else {
    ({ error } = await supabase.from('store_owners').insert([payload]));
  }

  setLoading(false);

  if (error) {
    console.log(error);
    toast.error('حدث خطأ أثناء الحفظ');
    return;
  }

  toast.success(editingOwner ? 'تم تحديث البيانات' : 'تم إضافة المالك');

  setIsDialogOpen(false);
  resetForm();
  fetchOwners();
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
      password: owner.password || ""
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (id) => {
    if (!confirm("هل أنت متأكد من حذف هذا المالك؟")) return;
    
    const { error } = await supabase.from("store_owners").delete().eq("id", id);
    
    if (error) {
      toast.error("فشل الحذف");
      return;
    }
    
    toast.success("تم الحذف بنجاح");
    fetchOwners();
  };

  return (
    <div className="min-h-screen bg-background" dir="rtl">
      {/* Header */}
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <Link to="/admin">
            <Button variant="ghost">
              <ArrowRight className="ml-2 h-4 w-4" />
              العودة
            </Button>
          </Link>
          <h1 className="text-xl font-bold">لوحة التحكم</h1>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {/* Page Title & Action Button */}
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">إدارة أصحاب المحلات</h1>
          
          <Dialog open={isDialogOpen} onOpenChange={(open) => {
            setIsDialogOpen(open);
            if (!open) resetForm();
          }}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="ml-2 h-4 w-4" />
                إضافة مالك
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>{editingOwner ? 'تعديل بيانات المالك' : 'إضافة مالك جديد'}</DialogTitle>
              </DialogHeader>
              
              <form onSubmit={handleSubmit} className="space-y-4 mt-4">
                {/* Row 1: Store & Owner Name */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="store">المحل التابع له</Label>
                    <Select 
                      value={formData.subcategory_id} 
                      onValueChange={(value) => handleStoreSelect(value)}
                    >
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
                    <Label htmlFor="owner_name">اسم المالك</Label>
                    <Input
                      id="owner_name"
                      value={formData.owner_name}
                      onChange={(e) => setFormData({ ...formData, owner_name: e.target.value })}
                      placeholder="الاسم الثلاثي"
                      required
                    />
                  </div>
                </div>

                {/* Row 2: Credentials */}
                <div className="bg-muted/50 p-4 rounded-lg border border-dashed">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="username">اسم المستخدم (تلقائي)</Label>
                      <Input
                        id="username"
                        value={formData.username}
                        disabled
                        className="bg-muted cursor-not-allowed font-mono"
                        placeholder="يظهر بعد اختيار المتجر"
                      />
                    </div>
                    <div>
                      <Label htmlFor="password">كلمة المرور</Label>
                      <Input
                        id="password"
                        value={formData.password}
                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                        placeholder="تعيين كلمة مرور"
                      />
                    </div>
                  </div>
                </div>

                {/* Row 3: Phone & Email */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="phone">رقم الهاتف</Label>
                    <Input
                      id="phone"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      placeholder="05xxxxxxxx"
                      className="text-right"
                      dir="ltr"
                    />
                  </div>
                  <div>
                    <Label htmlFor="email">البريد الإلكتروني</Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      placeholder="example@mail.com"
                      className="text-right"
                      dir="ltr"
                    />
                  </div>
                </div>

                {/* Row 4: Address */}
                <div>
                  <Label htmlFor="address">العنوان</Label>
                  <Input
                    id="address"
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    placeholder="المدينة، الحي، الشارع"
                  />
                </div>

                <div className="flex gap-2 justify-end pt-4">
                  <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                    إلغاء
                  </Button>
                  <Button type="submit" disabled={loading}>
                    {loading ? 'جاري الحفظ...' : editingOwner ? 'تحديث' : 'إضافة'}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Products Grid/List */}
        <div className="grid gap-4">
          {loading ? (
            <p className="text-center text-muted-foreground">جاري التحميل...</p>
          ) : owners.length === 0 ? (
            <div className="text-center py-10 border-2 border-dashed rounded-lg">
              <p className="text-muted-foreground">لا يوجد أصحاب محلات حالياً.</p>
            </div>
          ) : (
            owners.map((owner) => (
              <Card key={owner.id} className="p-4 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div className="flex-1 space-y-1">
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-lg">{owner.owner_name}</h3>
                    <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full flex items-center gap-1">
                      <Store className="w-3 h-3" />
                      {owner.categories?.name_ar}
                    </span>
                  </div>
                  
                  <div className="flex flex-wrap gap-4 text-sm text-muted-foreground mt-2">
                    <div className="flex items-center gap-1">
                       <User className="w-3 h-3" />
                       <span className="font-mono text-foreground">{owner.username}</span>
                    </div>
                    <div className="flex items-center gap-1">
                       <KeyRound className="w-3 h-3" />
                       <span className="font-mono text-foreground">{owner.password}</span>
                    </div>
                    {owner.phone && (
                      <div className="flex items-center gap-1">
                        <Phone className="w-3 h-3" />
                        <span dir="ltr">{owner.phone}</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex gap-2 w-full md:w-auto justify-end">
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