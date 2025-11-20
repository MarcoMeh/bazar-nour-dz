import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { 
  Store, User, Phone, Mail, MapPin, Lock, 
  Edit2, Trash2, Plus, Save, Loader2, KeyRound, ShieldCheck ,ArrowRight
} from "lucide-react";
import { toast } from "sonner";
import { useNavigate, Link } from 'react-router-dom';

const StoreOwners = () => {
  const [owners, setOwners] = useState([]);
  const [stores, setStores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [form, setForm] = useState({
    id: null,
    owner_name: "",
    phone: "",
    email: "",
    address: "",
    subcategory_id: "",
    username: "",
    password: ""
  });

  const [editing, setEditing] = useState(false);

  useEffect(() => {
    fetchStores();
    fetchOwners();
  }, []);

  // --- Data Fetching ---
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
      console.error("Error", error);
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

  // --- Handlers ---
  const resetForm = () => {
    setForm({
      id: null,
      owner_name: "",
      phone: "",
      email: "",
      address: "",
      subcategory_id: "",
      username: "",
      password: ""
    });
    setEditing(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.owner_name || !form.subcategory_id || !form.username) {
      toast.error("الرجاء تعبئة الحقول الأساسية (المحل، الاسم، المستخدم)");
      return;
    }

    setSubmitting(true);
    const payload = {
      owner_name: form.owner_name,
      phone: form.phone,
      email: form.email,
      address: form.address,
      subcategory_id: form.subcategory_id,
      username: form.username,
      password: form.password
    };

    try {
      if (editing) {
        await supabase.from("store_owners").update(payload).eq("id", form.id);
        toast.success("تم التحديث بنجاح 🚀");
      } else {
        await supabase.from("store_owners").insert([payload]);
        toast.success("تمت الإضافة بنجاح 🎉");
      }
      fetchOwners();
      resetForm();
    } catch (error) {
      toast.error("حدث خطأ، حاول مرة أخرى");
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (owner) => {
    setForm(owner);
    setEditing(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (id) => {
    if (!confirm("هل أنت متأكد من حذف هذا المالك؟")) return;
    const { error } = await supabase.from("store_owners").delete().eq("id", id);
    if (!error) {
      toast.success("تم الحذف");
      fetchOwners();
    }
  };

  const handleStoreSelect = (storeId) => {
    const store = stores.find((s) => s.id === storeId);
    setForm({
      ...form,
      subcategory_id: storeId,
      username: store ? store.name_ar : ""
    });
  };

  // --- Custom Colorful Input Component ---
  const ColorfulInput = ({ label, icon: Icon, colorClass, ...props }) => (
    <div className="space-y-2">
      <label className="text-sm font-semibold text-gray-700">{label}</label>
      <div className="relative group">
        {/* Icon Container */}
        <div className={`absolute right-3 top-1/2 -translate-y-1/2 ${colorClass} bg-opacity-10 p-1.5 rounded-full transition-colors group-hover:bg-opacity-20`}>
          <Icon className={`w-4 h-4 ${colorClass.replace('bg-', 'text-')}`} />
        </div>
        {/* Input Field */}
        <input
          className="flex h-11 w-full rounded-xl border border-gray-200 bg-white px-4 py-2 pr-12 text-sm shadow-sm transition-all focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none disabled:bg-gray-50 disabled:text-gray-500"
          {...props}
        />
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50/50" dir="rtl">
      {/* Header Background */}
      <div className="bg-gradient-to-r from-indigo-600 to-violet-600 h-48 w-full absolute top-0 left-0 z-0 shadow-lg" />

      <div className="container mx-auto px-4 py-8 relative z-10 max-w-7xl">
        
        {/* Page Title */}
        <div className="flex flex-col md:flex-row items-center justify-between mb-8 text-white">
          <div className="flex items-center gap-4 mb-4 md:mb-0">
            <Link to="/admin">
              <Button variant="ghost">
                <ArrowRight className="ml-2 h-4 w-4" />
                العودة
              </Button>
            </Link>
            <div className="bg-white/20 p-3 rounded-2xl backdrop-blur-sm">
              <ShieldCheck className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">إدارة أصحاب المحلات</h1>
              <p className="text-indigo-100 opacity-90">التحكم في صلاحيات الدخول وبيانات الملاك</p>
            </div>
          </div>
        </div>

        {/* FORM SECTION */}
        <div className="bg-white rounded-2xl shadow-xl border-t-4 border-indigo-500 overflow-hidden mb-10">
          <div className="bg-indigo-50/50 p-4 border-b border-indigo-100 flex items-center gap-2">
            {editing ? <Edit2 className="text-indigo-600 w-5 h-5" /> : <Plus className="text-indigo-600 w-5 h-5" />}
            <h2 className="text-lg font-bold text-indigo-900">
              {editing ? "تعديل بيانات المالك" : "إضافة مالك جديد"}
            </h2>
          </div>

          <form onSubmit={handleSubmit} className="p-6 md:p-8">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              
              {/* Store Select */}
              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700">المحل التابع له <span className="text-red-500">*</span></label>
                <div className="relative">
                  <Store className="absolute right-3 top-1/2 -translate-y-1/2 text-indigo-500 w-5 h-5" />
                  <select
                    className="flex h-11 w-full rounded-xl border border-gray-200 bg-white px-4 py-2 pr-12 text-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none appearance-none"
                    value={form.subcategory_id}
                    onChange={(e) => handleStoreSelect(e.target.value)}
                  >
                    <option value="">-- اختر المتجر --</option>
                    {stores.map((s) => (
                      <option key={s.id} value={s.id}>{s.name_ar}</option>
                    ))}
                  </select>
                </div>
              </div>

              <ColorfulInput 
                label="اسم المالك" 
                icon={User} 
                colorClass="bg-blue-500"
                value={form.owner_name}
                onChange={(e) => setForm({ ...form, owner_name: e.target.value })}
                placeholder="الاسم الكامل..."
              />

              <ColorfulInput 
                label="رقم الهاتف" 
                icon={Phone} 
                colorClass="bg-green-500"
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                placeholder="05xxxxxxxx"
              />

              {/* Credentials Box */}
              <div className="lg:col-span-3 bg-amber-50 border border-amber-200 rounded-xl p-4 grid grid-cols-1 md:grid-cols-2 gap-6 relative overflow-hidden">
                <div className="absolute top-0 left-0 w-2 h-full bg-amber-400" />
                
                <div className="space-y-2">
                  <label className="text-sm font-bold text-amber-800 flex items-center gap-2">
                    <User className="w-4 h-4" /> اسم المستخدم (تلقائي)
                  </label>
                  <input
                    readOnly
                    disabled
                    className="w-full bg-white/50 border border-amber-200 rounded-lg px-3 py-2 text-gray-600 font-mono text-sm cursor-not-allowed"
                    value={form.username}
                    placeholder="يظهر بعد اختيار المتجر..."
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-bold text-amber-800 flex items-center gap-2">
                    <KeyRound className="w-4 h-4" /> كلمة المرور
                  </label>
                  <input
                    type="text"
                    className="w-full bg-white border border-amber-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-amber-300 outline-none font-mono text-sm"
                    value={form.password}
                    onChange={(e) => setForm({ ...form, password: e.target.value })}
                    placeholder="تعيين كلمة مرور..."
                  />
                </div>
              </div>

              <ColorfulInput 
                label="البريد الإلكتروني" 
                icon={Mail} 
                colorClass="bg-purple-500"
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                placeholder="example@mail.com"
              />

              <div className="md:col-span-2 lg:col-span-2">
                <ColorfulInput 
                  label="العنوان" 
                  icon={MapPin} 
                  colorClass="bg-red-500"
                  value={form.address}
                  onChange={(e) => setForm({ ...form, address: e.target.value })}
                  placeholder="المدينة - الحي..."
                />
              </div>

            </div>

            {/* Actions */}
            <div className="mt-8 flex gap-3">
              <Button 
                type="submit" 
                disabled={submitting}
                className={`h-11 px-8 text-base shadow-lg transition-all hover:-translate-y-0.5 ${
                  editing 
                    ? "bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600" 
                    : "bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700"
                }`}
              >
                {submitting ? <Loader2 className="animate-spin ml-2" /> : (editing ? <Save className="ml-2 w-5 h-5" /> : <Plus className="ml-2 w-5 h-5" />)}
                {editing ? "حفظ التغييرات" : "إضافة المالك"}
              </Button>

              {editing && (
                <Button 
                  type="button" 
                  variant="outline" 
                  className="h-11 px-6 border-gray-300 text-gray-600 hover:bg-gray-50"
                  onClick={resetForm}
                >
                  إلغاء
                </Button>
              )}
            </div>
          </form>
        </div>

        {/* LIST SECTION */}
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-800 border-r-4 border-violet-500 pr-3">
            قائمة المالكين المسجلين
          </h2>
          <span className="bg-violet-100 text-violet-700 px-3 py-1 rounded-full text-sm font-bold">
            {owners.length}
          </span>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 text-gray-400">
            <Loader2 className="w-12 h-12 animate-spin text-indigo-500 mb-4" />
            <p>جاري تحميل البيانات...</p>
          </div>
        ) : owners.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-xl border border-dashed border-gray-300">
            <p className="text-gray-500 text-lg">لا يوجد أصحاب محلات مضافين حالياً.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {owners.map((o) => (
              <div 
                key={o.id} 
                className="bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100 overflow-hidden group"
              >
                {/* Card Header */}
                <div className="p-5 border-b border-gray-50 bg-gradient-to-b from-white to-gray-50/50">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-lg font-bold text-gray-900 group-hover:text-indigo-600 transition-colors">
                        {o.owner_name}
                      </h3>
                      <div className="flex items-center gap-1 mt-1 text-sm text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-md w-fit">
                        <Store className="w-3 h-3" />
                        <span>{o.categories?.name_ar}</span>
                      </div>
                    </div>
                    <div className="bg-gray-100 p-2 rounded-full text-gray-500 group-hover:bg-indigo-100 group-hover:text-indigo-600 transition-colors">
                      <User className="w-5 h-5" />
                    </div>
                  </div>
                </div>

                {/* Card Body */}
                <div className="p-5 space-y-3">
                  <div className="bg-slate-800 rounded-lg p-3 text-slate-200 text-sm font-mono space-y-2 shadow-inner relative overflow-hidden">
                     <div className="absolute top-0 right-0 w-1 h-full bg-emerald-500" />
                     <div className="flex justify-between items-center">
                        <span className="text-slate-400 text-xs">User:</span>
                        <span className="select-all font-bold text-white">{o.username}</span>
                     </div>
                     <div className="border-t border-slate-700 pt-2 flex justify-between items-center">
                        <span className="text-slate-400 text-xs">Pass:</span>
                        <span className="select-all font-bold text-emerald-400">{o.password}</span>
                     </div>
                  </div>

                  <div className="space-y-2 pt-2">
                    {o.phone && (
                      <div className="flex items-center gap-3 text-sm text-gray-600">
                        <div className="bg-green-100 p-1.5 rounded-full text-green-600">
                          <Phone className="w-3 h-3" />
                        </div>
                        <span dir="ltr">{o.phone}</span>
                      </div>
                    )}
                    {o.email && (
                      <div className="flex items-center gap-3 text-sm text-gray-600">
                        <div className="bg-purple-100 p-1.5 rounded-full text-purple-600">
                          <Mail className="w-3 h-3" />
                        </div>
                        <span className="truncate">{o.email}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Card Footer */}
                <div className="px-5 py-4 bg-gray-50 border-t border-gray-100 flex justify-between items-center">
                   <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => handleEdit(o)}
                    className="text-gray-600 hover:text-indigo-600 hover:bg-indigo-50"
                   >
                     <Edit2 className="w-4 h-4 ml-1" /> تعديل
                   </Button>
                   
                   <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => handleDelete(o.id)}
                    className="text-gray-600 hover:text-red-600 hover:bg-red-50"
                   >
                     <Trash2 className="w-4 h-4 ml-1" /> حذف
                   </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default StoreOwners;