import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAdmin } from '@/contexts/AdminContext';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Switch } from '@/components/ui/switch';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { ArrowRight, Plus, Trash2, Edit, Upload } from 'lucide-react';
import logo from '@/assets/bazzarna-logo.jpeg';
import { Badge } from '@/components/ui/badge';

const PRESET_COLORS = ['Black', 'White', 'Red', 'Blue', 'Green', 'Gold', 'Silver'];
const PRESET_SIZES = ['XS', 'S', 'M', 'L', 'XL', 'XXL', '37', '38', '39', '40', '41', '42'];

const AdminProducts = () => {
  const navigate = useNavigate();
  const { isAdmin } = useAdmin();

  const [products, setProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [stores, setStores] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<any>(null);
  const [uploading, setUploading] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    name_ar: '',
    description: '',
    description_ar: '',
    price: '',
    category_id: '',
    image_url: '',
    supplier_name: '',
    is_delivery_home_available: true,
    is_delivery_desktop_available: true,
    is_sold_out: false,
    is_free_delivery: false,
    colors: [] as string[],
    sizes: [] as string[],
  });

  // temp inputs for adding custom color/size
  const [customColor, setCustomColor] = useState('');
  const [customSize, setCustomSize] = useState('');
  const [selectedPresetColor, setSelectedPresetColor] = useState('');
  const [selectedPresetSize, setSelectedPresetSize] = useState('');

  useEffect(() => {
    if (!isAdmin) {
      navigate('/admin/login');
      return;
    }
    fetchProducts();
    fetchCategories();
    fetchStores();
  }, [isAdmin, navigate]);

  const fetchProducts = async () => {
    const { data, error } = await supabase
      .from('products')
      .select('*, store_owners(owner_name, username)')
      .order('created_at', { ascending: false });

    if (error) {
      console.error(error);
      toast.error('فشل تحميل المنتجات');
      return;
    }
    setProducts(data || []);
  };

  const fetchCategories = async () => {
    const { data, error } = await supabase.from('categories').select('*');
    if (error) {
      console.error(error);
      return;
    }
    setCategories(data || []);
  };

  const fetchStores = async () => {
    // store_owners table contains owners; supplier_name usually matches username
    const { data, error } = await supabase.from('store_owners').select('id, username, owner_name');
    if (!error) setStores(data || []);
  };

  const resetForm = () => {
    setFormData({
      name: '',
      name_ar: '',
      description: '',
      description_ar: '',
      price: '',
      category_id: '',
      image_url: '',
      supplier_name: '',
      is_delivery_home_available: true,
      is_delivery_desktop_available: true,
      is_sold_out: false,
      is_free_delivery: false,
      colors: [],
      sizes: [],
    });
    setEditingProduct(null);
    setCustomColor('');
    setCustomSize('');
    setSelectedPresetColor('');
    setSelectedPresetSize('');
  };

  const handleEdit = (product: any) => {
    setEditingProduct(product);
    setFormData({
      name: product.name || '',
      name_ar: product.name_ar || '',
      description: product.description || '',
      description_ar: product.description_ar || '',
      price: product.price?.toString() || '',
      category_id: product.category_id || '',
      image_url: product.image_url || '',
      supplier_name: product.supplier_name || (product.store_owners?.username ?? ''),
      is_delivery_home_available: product.is_delivery_home_available ?? true,
      is_delivery_desktop_available: product.is_delivery_desk_available ?? product.is_delivery_desktop_available ?? true,
      is_sold_out: product.is_sold_out ?? false,
      is_free_delivery: product.is_free_delivery ?? false,
      colors: product.colors ?? [],
      sizes: product.sizes ?? [],
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('هل أنت متأكد من حذف هذا المنتج؟')) return;
    setLoading(true);
    const { error } = await supabase.from('products').delete().eq('id', id);
    setLoading(false);
    if (error) {
      toast.error('حدث خطأ');
      return;
    }
    toast.success('تم الحذف');
    fetchProducts();
  };

  const handleAddPresetColor = () => {
    if (!selectedPresetColor) return;
    if (!formData.colors.includes(selectedPresetColor)) {
      setFormData(prev => ({ ...prev, colors: [...prev.colors, selectedPresetColor] }));
    }
    setSelectedPresetColor('');
  };

  const handleAddPresetSize = () => {
    if (!selectedPresetSize) return;
    if (!formData.sizes.includes(selectedPresetSize)) {
      setFormData(prev => ({ ...prev, sizes: [...prev.sizes, selectedPresetSize] }));
    }
    setSelectedPresetSize('');
  };

  const handleAddCustomColor = () => {
    const v = customColor.trim();
    if (!v) return;
    if (!formData.colors.includes(v)) {
      setFormData(prev => ({ ...prev, colors: [...prev.colors, v] }));
    }
    setCustomColor('');
  };

  const handleAddCustomSize = () => {
    const v = customSize.trim();
    if (!v) return;
    if (!formData.sizes.includes(v)) {
      setFormData(prev => ({ ...prev, sizes: [...prev.sizes, v] }));
    }
    setCustomSize('');
  };

  const handleRemoveColor = (c: string) => {
    setFormData(prev => ({ ...prev, colors: prev.colors.filter(x => x !== c) }));
  };
  const handleRemoveSize = (s: string) => {
    setFormData(prev => ({ ...prev, sizes: prev.sizes.filter(x => x !== s) }));
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);

    const fileExt = file.name.split('.').pop();
    const fileName = `${Date.now()}-${Math.random().toString(36).slice(2)}.${fileExt}`;

    const { error: uploadError } = await supabase.storage
      .from('product-images')
      .upload(fileName, file);

    if (uploadError) {
      console.error(uploadError);
      toast.error('فشل رفع الصورة');
      setUploading(false);
      return;
    }

    const { data: { publicUrl } } = supabase.storage.from('product-images').getPublicUrl(fileName);
    setFormData(prev => ({ ...prev, image_url: publicUrl }));
    toast.success('تم رفع الصورة');
    setUploading(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // validation
    if (!formData.name_ar || !formData.price) {
      toast.error('الرجاء ملء الاسم والسعر بالعربية/الأرقام');
      return;
    }

    setLoading(true);

    const productData = {
      name: formData.name || formData.name_ar,
      name_ar: formData.name_ar,
      description: formData.description || null,
      description_ar: formData.description_ar || null,
      price: parseFloat(String(formData.price)) || 0,
      category_id: formData.category_id || null,
      image_url: formData.image_url || null,
      supplier_name: formData.supplier_name || null,
      is_delivery_home_available: !!formData.is_delivery_home_available,
      is_delivery_desktop_available: !!formData.is_delivery_desktop_available,
      is_sold_out: !!formData.is_sold_out,
      is_free_delivery: !!formData.is_free_delivery,
      colors: formData.colors.length ? formData.colors : null,
      sizes: formData.sizes.length ? formData.sizes : null,
      updated_at: new Date().toISOString(),
    };

    let error;
    if (editingProduct) {
      ({ error } = await supabase.from('products').update(productData).eq('id', editingProduct.id));
    } else {
      ({ error } = await supabase.from('products').insert([productData]));
    }

    setLoading(false);

    if (error) {
      console.error(error);
      toast.error('حدث خطأ عند الحفظ');
      return;
    }

    toast.success(editingProduct ? 'تم التحديث' : 'تم الإضافة');
    setIsDialogOpen(false);
    resetForm();
    fetchProducts();
  };

  if (!isAdmin) return null;

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <Link to="/admin">
            <Button variant="ghost">
              <ArrowRight className="ml-2 h-4 w-4" />
              العودة
            </Button>
          </Link>
          <img src={logo} alt="Bazzarna" className="h-12" />
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">إدارة المنتجات</h1>

          <Dialog open={isDialogOpen} onOpenChange={(open) => { setIsDialogOpen(open); if (!open) resetForm(); }}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="ml-2 h-4 w-4" />
                إضافة منتج
              </Button>
            </DialogTrigger>

            <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>{editingProduct ? 'تعديل المنتج' : 'إضافة منتج جديد'}</DialogTitle>
              </DialogHeader>

              <form onSubmit={handleSubmit} className="space-y-4 mt-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>الاسم بالعربية</Label>
                    <Input value={formData.name_ar} onChange={(e) => setFormData(prev => ({ ...prev, name_ar: e.target.value }))} required />
                  </div>
                  <div>
                    <Label>الاسم بالإنجليزية</Label>
                    <Input value={formData.name} onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))} />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>الوصف بالعربية</Label>
                    <Textarea value={formData.description_ar} onChange={(e) => setFormData(prev => ({ ...prev, description_ar: e.target.value }))} />
                  </div>
                  <div>
                    <Label>الوصف بالإنجليزية</Label>
                    <Textarea value={formData.description} onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))} />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>السعر (دج)</Label>
                    <Input type="number" step="0.01" value={formData.price} onChange={(e) => setFormData(prev => ({ ...prev, price: e.target.value }))} required />
                  </div>
                  <div>
                    <Label>الفئة</Label>
                    <Select value={formData.category_id} onValueChange={(v) => setFormData(prev => ({ ...prev, category_id: v }))}>
                      <SelectTrigger><SelectValue placeholder="اختر الفئة" /></SelectTrigger>
                      <SelectContent>
                        {categories
                          .filter(cat => cat.parent_id !== null) // subcategories only
                          .filter(cat => {
                            const parent = categories.find(p => p.id === cat.parent_id);
                            return parent?.name_ar !== 'محلاتنا';
                          })
                          .map(cat => (<SelectItem key={cat.id} value={cat.id}>{cat.name_ar}</SelectItem>))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div>
                  <Label>اسم المورد</Label>
                  <Select value={formData.supplier_name} onValueChange={(v) => setFormData(prev => ({ ...prev, supplier_name: v }))}>
                    <SelectTrigger><SelectValue placeholder="اختر المورد (اختياري)" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">بدون مورد</SelectItem>
                      {stores.map(s => (<SelectItem key={s.id} value={s.username}>{s.owner_name} ({s.username})</SelectItem>))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>صورة المنتج</Label>
                  <div className="flex items-center gap-3">
                    <input id="image-upload" type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
                    <label htmlFor="image-upload">
                      <Button type="button" variant="outline" asChild>
                        <span><Upload className="ml-2 h-4 w-4" />{uploading ? 'جاري الرفع...' : 'رفع صورة'}</span>
                      </Button>
                    </label>
                    <Input placeholder="أو ضع رابط الصورة" value={formData.image_url} onChange={(e) => setFormData(prev => ({ ...prev, image_url: e.target.value }))} />
                  </div>
                  {formData.image_url && <img src={formData.image_url} alt="preview" className="h-32 w-32 object-cover rounded mt-2" onError={(e) => (e.currentTarget.style.display = 'none')} />}
                </div>

                {/* colors */}
                <div>
                  <Label>الألوان</Label>
                  <div className="flex gap-2 mb-2">
                    <select className="border p-2 rounded" value={selectedPresetColor} onChange={(e) => setSelectedPresetColor(e.target.value)}>
                      <option value="">اختر لونًا مسبقًا</option>
                      {PRESET_COLORS.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                    <Button type="button" onClick={handleAddPresetColor}>أضف</Button>
                    <Input placeholder="أو لون مخصص" value={customColor} onChange={(e) => setCustomColor(e.target.value)} />
                    <Button type="button" onClick={handleAddCustomColor}>أضف</Button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {formData.colors.map(c => (
                      <Badge key={c} className="flex items-center gap-2">
                        {c}
                        <button onClick={() => handleRemoveColor(c)} className="text-xs px-1">×</button>
                      </Badge>
                    ))}
                  </div>
                </div>

                {/* sizes */}
                <div>
                  <Label>المقاسات</Label>
                  <div className="flex gap-2 mb-2">
                    <select className="border p-2 rounded" value={selectedPresetSize} onChange={(e) => setSelectedPresetSize(e.target.value)}>
                      <option value="">اختر مقاسًا مسبقًا</option>
                      {PRESET_SIZES.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                    <Button type="button" onClick={handleAddPresetSize}>أضف</Button>
                    <Input placeholder="أو مقاس مخصص" value={customSize} onChange={(e) => setCustomSize(e.target.value)} />
                    <Button type="button" onClick={handleAddCustomSize}>أضف</Button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {formData.sizes.map(s => (
                      <Badge key={s} className="flex items-center gap-2">
                        {s}
                        <button onClick={() => handleRemoveSize(s)} className="text-xs px-1">×</button>
                      </Badge>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 mt-4">
                  <div className="flex items-center gap-2">
                    <Switch checked={formData.is_delivery_home_available} onCheckedChange={(checked) => setFormData(prev => ({ ...prev, is_delivery_home_available: checked, is_delivery_desktop_available: checked ? prev.is_delivery_desktop_available : false }))} />
                    <Label>التوصيل للمنزل متاح</Label>
                  </div>
                  <div className="flex items-center gap-2">
                    <Switch checked={formData.is_delivery_desktop_available} onCheckedChange={(checked) => setFormData(prev => ({ ...prev, is_delivery_desktop_available: checked }))} disabled={!formData.is_delivery_home_available} />
                    <Label>الاستلام من المكتب متاح</Label>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 mt-2">
                  <div className="flex items-center gap-2">
                    <Switch checked={formData.is_sold_out} onCheckedChange={(checked) => setFormData(prev => ({ ...prev, is_sold_out: checked }))} />
                    <Label>المنتج نفد</Label>
                  </div>
                  <div className="flex items-center gap-2">
                    <Switch checked={formData.is_free_delivery} onCheckedChange={(checked) => setFormData(prev => ({ ...prev, is_free_delivery: checked }))} />
                    <Label>توصيل مجاني</Label>
                  </div>
                </div>

                <div className="flex gap-2 justify-end pt-4">
                  <Button type="button" variant="outline" onClick={() => { setIsDialogOpen(false); resetForm(); }}>إلغاء</Button>
                  <Button type="submit" disabled={loading}>{loading ? 'جاري الحفظ...' : (editingProduct ? 'تحديث' : 'إضافة')}</Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        <div className="grid gap-4">
          {products.map(product => (
            <Card key={product.id} className="p-4 flex justify-between items-center">
              <div className="flex-1">
                <h3 className="font-bold">{product.name_ar}</h3>
                <p className="text-sm text-muted-foreground">{product.price} دج</p>
                {product.description_ar && <p className="text-sm text-muted-foreground mt-1">{product.description_ar}</p>}
                <div className="mt-2 text-xs flex flex-wrap gap-2">
                  {product.is_sold_out && <span className="px-2 py-1 bg-red-100 text-red-700 rounded-full">نفد</span>}
                  {product.is_free_delivery && <span className="px-2 py-1 bg-green-100 text-green-700 rounded-full">توصيل مجاني</span>}
                  {product.is_delivery_home_available && <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded-full">توصيل للمنزل</span>}
                  {product.is_delivery_desktop_available && <span className="px-2 py-1 bg-purple-100 text-purple-700 rounded-full">استلام من المكتب</span>}
                </div>

                <div className="mt-2 text-xs flex gap-2 flex-wrap">
                  {(product.colors || []).slice(0,6).map((c: string) => <Badge key={c}>{c}</Badge>)}
                  {(product.sizes || []).slice(0,6).map((s: string) => <Badge key={s}>{s}</Badge>)}
                </div>

                <div className="mt-2 text-xs text-muted-foreground">
                  مورد: {product.supplier_name || product.store_owners?.username || 'غير محدد'}
                </div>
              </div>

              <div className="flex gap-2">
                <Button variant="outline" size="icon" onClick={() => handleEdit(product)}><Edit className="h-4 w-4" /></Button>
                <Button variant="destructive" size="icon" onClick={() => handleDelete(product.id)}><Trash2 className="h-4 w-4" /></Button>
              </div>
            </Card>
          ))}
        </div>
      </main>
    </div>
  );
};

export default AdminProducts;
