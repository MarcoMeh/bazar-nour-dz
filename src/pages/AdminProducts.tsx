import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAdmin } from '@/contexts/AdminContext';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from '@/components/ui/dialog';
import { Switch } from '@/components/ui/switch';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { ArrowRight, Plus, Trash2, Edit, Upload, Palette, Ruler, Truck, PackageX } from 'lucide-react';
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

  // UI Toggles
  const [hasColors, setHasColors] = useState(false);
  const [hasSizes, setHasSizes] = useState(false);

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
    is_delivery_desk_available: true,
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
      .select('*, stores(name)')
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
    // stores table contains stores
    const { data, error } = await supabase.from('stores').select('id, name');
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
      is_delivery_desk_available: true,
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
    setHasColors(false);
    setHasSizes(false);
  };

  const handleEdit = (product: any) => {
    setEditingProduct(product);
    const productColors = product.colors ?? [];
    const productSizes = product.sizes ?? [];

    setFormData({
      name: product.name || '',
      name_ar: product.name_ar || '',
      description: product.description || '',
      description_ar: product.description_ar || '',
      price: product.price?.toString() || '',
      category_id: product.category_id?.toString() || '',
      image_url: product.image_url || '',
      supplier_name: product.supplier_name || (product.stores?.name ?? ''),
      is_delivery_home_available: product.is_delivery_home_available ?? true,
      is_delivery_desk_available: product.is_delivery_desk_available ?? true,
      is_sold_out: product.is_sold_out ?? false,
      is_free_delivery: product.is_free_delivery ?? false,
      colors: productColors,
      sizes: productSizes,
    });

    setHasColors(productColors.length > 0);
    setHasSizes(productSizes.length > 0);
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
    if (!formData.name_ar || !formData.price || !formData.category_id) {
      toast.error('الرجاء ملء الاسم، السعر، والفئة');
      return;
    }

    setLoading(true);

    const productData = {
      name: formData.name || formData.name_ar,
      name_ar: formData.name_ar,
      description: formData.description || null,
      description_ar: formData.description_ar || null,
      price: parseFloat(String(formData.price)) || 0,
      category_id: formData.category_id,
      image_url: formData.image_url || null,
      supplier_name: formData.supplier_name || null,
      is_delivery_home_available: !!formData.is_delivery_home_available,
      is_delivery_desk_available: !!formData.is_delivery_desk_available,
      is_sold_out: !!formData.is_sold_out,
      is_free_delivery: !!formData.is_free_delivery,
      colors: hasColors && formData.colors.length ? formData.colors : null,
      sizes: hasSizes && formData.sizes.length ? formData.sizes : null,
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
      toast.error(`حدث خطأ عند الحفظ: ${error.message}`);
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
                <DialogDescription>
                  {editingProduct ? 'قم بتعديل تفاصيل المنتج أدناه.' : 'أدخل تفاصيل المنتج الجديد أدناه.'}
                </DialogDescription>
              </DialogHeader>

              <form onSubmit={handleSubmit} className="space-y-6 mt-4">
                {/* Basic Info */}
                <div className="space-y-4">
                  <h3 className="font-semibold text-lg border-b pb-2">المعلومات الأساسية</h3>
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
                            .map(cat => (<SelectItem key={cat.id} value={String(cat.id)}>{cat.name_ar}</SelectItem>))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div>
                    <Label>اسم المورد</Label>
                    <Select value={formData.supplier_name || "none"} onValueChange={(v) => setFormData(prev => ({ ...prev, supplier_name: v === "none" ? "" : v }))}>
                      <SelectTrigger><SelectValue placeholder="اختر المورد (اختياري)" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">بدون مورد</SelectItem>
                        {stores.map(s => (
                          s.name ? <SelectItem key={s.id} value={s.name}>{s.name}</SelectItem> : null
                        ))}
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
                </div>

                {/* Variants: Colors & Sizes */}
                <div className="space-y-4">
                  <h3 className="font-semibold text-lg border-b pb-2 flex items-center gap-2">
                    <Palette className="w-5 h-5" /> الخيارات (الألوان والمقاسات)
                  </h3>

                  {/* Colors Toggle */}
                  <div className="bg-muted/30 p-4 rounded-lg border">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-2">
                        <Switch checked={hasColors} onCheckedChange={setHasColors} />
                        <Label>تفعيل خيار الألوان</Label>
                      </div>
                    </div>

                    {hasColors && (
                      <div className="animate-in fade-in slide-in-from-top-2">
                        <div className="flex gap-2 mb-2">
                          <select className="border p-2 rounded" value={selectedPresetColor} onChange={(e) => setSelectedPresetColor(e.target.value)}>
                            <option value="">اختر لونًا مسبقًا</option>
                            {PRESET_COLORS.map(c => <option key={c} value={c}>{c}</option>)}
                          </select>
                          <Button type="button" size="sm" onClick={handleAddPresetColor}>أضف</Button>
                          <Input className="w-32" placeholder="لون مخصص" value={customColor} onChange={(e) => setCustomColor(e.target.value)} />
                          <Button type="button" size="sm" onClick={handleAddCustomColor}>أضف</Button>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {formData.colors.map(c => (
                            <Badge key={c} className="flex items-center gap-2">
                              {c}
                              <button onClick={() => handleRemoveColor(c)} className="text-xs px-1 hover:text-destructive">×</button>
                            </Badge>
                          ))}
                          {formData.colors.length === 0 && <span className="text-sm text-muted-foreground">لم يتم إضافة ألوان بعد</span>}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Sizes Toggle */}
                  <div className="bg-muted/30 p-4 rounded-lg border">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-2">
                        <Switch checked={hasSizes} onCheckedChange={setHasSizes} />
                        <Label>تفعيل خيار المقاسات</Label>
                      </div>
                    </div>

                    {hasSizes && (
                      <div className="animate-in fade-in slide-in-from-top-2">
                        <div className="flex gap-2 mb-2">
                          <select className="border p-2 rounded" value={selectedPresetSize} onChange={(e) => setSelectedPresetSize(e.target.value)}>
                            <option value="">اختر مقاسًا مسبقًا</option>
                            {PRESET_SIZES.map(s => <option key={s} value={s}>{s}</option>)}
                          </select>
                          <Button type="button" size="sm" onClick={handleAddPresetSize}>أضف</Button>
                          <Input className="w-32" placeholder="مقاس مخصص" value={customSize} onChange={(e) => setCustomSize(e.target.value)} />
                          <Button type="button" size="sm" onClick={handleAddCustomSize}>أضف</Button>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {formData.sizes.map(s => (
                            <Badge key={s} className="flex items-center gap-2">
                              {s}
                              <button onClick={() => handleRemoveSize(s)} className="text-xs px-1 hover:text-destructive">×</button>
                            </Badge>
                          ))}
                          {formData.sizes.length === 0 && <span className="text-sm text-muted-foreground">لم يتم إضافة مقاسات بعد</span>}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Delivery & Stock */}
                <div className="space-y-4">
                  <h3 className="font-semibold text-lg border-b pb-2 flex items-center gap-2">
                    <Truck className="w-5 h-5" /> التوصيل والمخزون
                  </h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-muted/30 p-4 rounded-lg border">
                    {/* Free Delivery */}
                    <div className="flex items-center justify-between border-b pb-2 md:border-b-0">
                      <Label className="flex flex-col">
                        <span>توصيل مجاني</span>
                        <span className="text-xs text-muted-foreground font-normal">هل هذا المنتج يشمل توصيل مجاني؟</span>
                      </Label>
                      <Switch checked={formData.is_free_delivery} onCheckedChange={(checked) => setFormData(prev => ({ ...prev, is_free_delivery: checked }))} />
                    </div>

                    {/* Home Delivery */}
                    <div className="flex items-center justify-between border-b pb-2 md:border-b-0">
                      <Label className="flex flex-col">
                        <span>التوصيل للمنزل</span>
                        <span className="text-xs text-muted-foreground font-normal">تفعيل خدمة التوصيل للمنزل</span>
                      </Label>
                      <Switch
                        checked={formData.is_delivery_home_available}
                        onCheckedChange={(checked) => setFormData(prev => ({
                          ...prev,
                          is_delivery_home_available: checked,
                          // If home delivery is disabled, typically desk delivery might be disabled too or independent? 
                          // User request: "if delivery avaible in home and delivery availbel in desk"
                          // Let's keep logic: if home is off, desk is off? Or independent?
                          // User said: "then if delivery avaible in home and delivery availbel in desk"
                          // I will keep them somewhat linked but allow desk only if home is enabled based on previous logic, 
                          // OR allow them to be independent. Let's stick to user request flow.
                          is_delivery_desk_available: checked ? prev.is_delivery_desk_available : false
                        }))}
                      />
                    </div>

                    {/* Desk Delivery (Only if Home is ON, or just independent? User said "then if...") */}
                    {formData.is_delivery_home_available && (
                      <div className="flex items-center justify-between animate-in fade-in">
                        <Label className="flex flex-col">
                          <span>الاستلام من المكتب</span>
                          <span className="text-xs text-muted-foreground font-normal">تفعيل خيار الاستلام من المكتب</span>
                        </Label>
                        <Switch
                          checked={formData.is_delivery_desk_available}
                          onCheckedChange={(checked) => setFormData(prev => ({ ...prev, is_delivery_desk_available: checked }))}
                        />
                      </div>
                    )}

                    {/* Sold Out */}
                    <div className="flex items-center justify-between pt-2 md:pt-0">
                      <Label className="flex flex-col text-destructive">
                        <span className="flex items-center gap-2"><PackageX className="w-4 h-4" /> نفد من المخزون</span>
                        <span className="text-xs text-muted-foreground font-normal">علم هذا الخيار إذا انتهت الكمية</span>
                      </Label>
                      <Switch checked={formData.is_sold_out} onCheckedChange={(checked) => setFormData(prev => ({ ...prev, is_sold_out: checked }))} />
                    </div>
                  </div>
                </div>

                <div className="flex gap-2 justify-end pt-6 border-t mt-6">
                  <Button type="button" variant="outline" onClick={() => { setIsDialogOpen(false); resetForm(); }}>إلغاء</Button>
                  <Button type="submit" disabled={loading} className="min-w-[120px]">
                    {loading ? 'جاري الحفظ...' : (editingProduct ? 'تحديث المنتج' : 'إضافة المنتج')}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        <div className="grid gap-4">
          {products.map(product => (
            <Card key={product.id} className="p-4 flex justify-between items-center hover:shadow-md transition-shadow">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-bold text-lg">{product.name_ar}</h3>
                  {product.is_sold_out && <Badge variant="destructive">نفد</Badge>}
                </div>
                <p className="text-sm font-medium text-primary">{product.price} دج</p>
                {product.description_ar && <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{product.description_ar}</p>}

                <div className="mt-3 flex flex-wrap gap-2">
                  {product.is_free_delivery && <Badge variant="secondary" className="bg-green-100 text-green-800 hover:bg-green-200">توصيل مجاني</Badge>}
                  {product.is_delivery_home_available && <Badge variant="outline">توصيل منزل</Badge>}
                  {product.is_delivery_desk_available && <Badge variant="outline">استلام مكتب</Badge>}
                </div>

                {(product.colors?.length > 0 || product.sizes?.length > 0) && (
                  <div className="mt-3 flex gap-4 text-xs text-muted-foreground">
                    {product.colors?.length > 0 && (
                      <div className="flex items-center gap-1">
                        <Palette className="w-3 h-3" />
                        <span>{product.colors.length} ألوان</span>
                      </div>
                    )}
                    {product.sizes?.length > 0 && (
                      <div className="flex items-center gap-1">
                        <Ruler className="w-3 h-3" />
                        <span>{product.sizes.length} مقاسات</span>
                      </div>
                    )}
                  </div>
                )}

                <div className="mt-2 text-xs text-muted-foreground">
                  مورد: {product.supplier_name || product.stores?.name || 'غير محدد'}
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
