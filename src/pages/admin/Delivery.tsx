import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import { Loader2, Plus, Trash2, Edit, Truck, Map, MapPin, Save, Info } from "lucide-react";

interface Company {
  id: string;
  name: string;
  logo_url?: string;
  phone1?: string;
  phone2?: string;
  phone3?: string;
  website_url?: string;
  address?: string;
  delivery_zones?: Zone[];
}

interface Zone {
  id: string;
  name: string;
  price_home: number;
  price_desk: number;
  zone_wilayas?: { wilaya_code: string }[];
}

interface Wilaya {
  code: string;
  name_ar: string;
}

export default function AdminDelivery() {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [wilayas, setWilayas] = useState<Wilaya[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCompanyId, setSelectedCompanyId] = useState<string | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const selectedCompany = companies.find(c => c.id === selectedCompanyId) || null;

  // Initial Fetch
  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    setLoading(true);
    try {
      // Fetch Companies with their Zones
      const { data: companiesData, error: companiesError } = await supabase
        .from("delivery_companies")
        .select("*, delivery_zones(*, zone_wilayas(wilaya_code))");

      if (companiesError) throw companiesError;

      // Fetch Wilayas for reference
      const { data: wilayasData, error: wilayasError } = await supabase
        .from("wilayas")
        .select("code, name_ar")
        .order("code");

      if (wilayasError) throw wilayasError;

      setCompanies(companiesData || []);
      setWilayas(wilayasData || []);
    } catch (error) {
      console.error("Error fetching data:", error);
      toast.error("فشل تحميل بيانات التوصيل");
    } finally {
      setLoading(false);
    }
  };

  const handleCreateCompany = async (formData: FormData) => {
    try {
      const payload = {
        name: formData.get("name") as string,
        phone1: formData.get("phone1") as string,
        phone2: formData.get("phone2") as string,
        phone3: formData.get("phone3") as string,
        website_url: formData.get("website_url") as string,
        address: formData.get("address") as string,
      };

      const { data, error } = await supabase.from("delivery_companies").insert([payload]).select().single();
      if (error) throw error;
      setCompanies(prev => [...prev, { ...data, delivery_zones: [] }]);
      toast.success("تم إضافة شركة التوصيل");
    } catch (error) {
      toast.error("فشل إضافة الشركة");
    }
  };

  return (
    <div className="p-4 md:p-8 space-y-6" dir="rtl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">إدارة شركات التوصيل</h1>
          <p className="text-muted-foreground mt-2">قم بإعداد مناطق وأسعار التوصيل لكل شركة.</p>
        </div>
        <Dialog>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 ml-2" />
              إضافة شركة
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>إضافة شركة توصيل جديدة</DialogTitle>
            </DialogHeader>
            <form onSubmit={(e) => {
              e.preventDefault();
              handleCreateCompany(new FormData(e.currentTarget));
              (e.target as HTMLFormElement).reset(); // Clear form after submit
            }} className="space-y-4 pt-4">
              <div className="space-y-2">
                <Label>اسم الشركة</Label>
                <Input name="name" required placeholder="مثال: Yalidine" />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>الهاتف 1</Label>
                  <Input name="phone1" placeholder="0550..." />
                </div>
                <div className="space-y-2">
                  <Label>الهاتف 2</Label>
                  <Input name="phone2" placeholder="0551..." />
                </div>
                <div className="space-y-2">
                  <Label>الهاتف 3</Label>
                  <Input name="phone3" placeholder="0552..." />
                </div>
              </div>
              <div className="space-y-2">
                <Label>الموقع الإلكتروني</Label>
                <Input name="website_url" type="url" placeholder="https://..." />
              </div>
              <div className="space-y-2">
                <Label>العنوان</Label>
                <Input name="address" placeholder="الجزائر العاصمة..." />
              </div>
              <Button type="submit" className="w-full">حفظ لشركة جديدة</Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {companies.map((company) => (
            <Card key={company.id} className="hover:shadow-lg transition-shadow cursor-pointer relative group" onClick={() => {
              setSelectedCompanyId(company.id);
              setIsDialogOpen(true);
            }}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-xl font-bold flex items-center gap-2">
                  <Truck className="w-5 h-5 text-primary" />
                  {company.name}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-sm text-muted-foreground mt-2">
                  <div className="flex items-center gap-2 mb-1">
                    <Map className="w-4 h-4" />
                    {company.delivery_zones?.length || 0} مناطق توصيل
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4" />
                    تغطية {company.delivery_zones?.reduce((acc, zone) => acc + (zone.zone_wilayas?.length || 0), 0) || 0} ولاية
                  </div>
                </div>
                <div className="absolute top-4 left-4 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Button variant="secondary" size="sm">تعديل</Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Edit Company Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-4xl h-[90vh] flex flex-col p-0 gap-0 overflow-hidden">
          <DialogHeader className="p-6 border-b shrink-0">
            <DialogTitle className="text-2xl flex items-center gap-2">
              <Edit className="w-5 h-5 text-primary" />
              إعدادات {selectedCompany?.name}
            </DialogTitle>
          </DialogHeader>

          {selectedCompany && (
            <CompanyEditor
              company={selectedCompany}
              wilayas={wilayas}
              onUpdate={() => {
                fetchInitialData();
              }}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

function CompanyEditor({ company, wilayas, onUpdate }: { company: Company, wilayas: Wilaya[], onUpdate: () => void }) {
  const [newZoneName, setNewZoneName] = useState("");
  const [isUpdating, setIsUpdating] = useState(false);
  const [editData, setEditData] = useState({
    name: company.name,
    phone1: company.phone1 || "",
    phone2: company.phone2 || "",
    phone3: company.phone3 || "",
    website_url: company.website_url || "",
    address: company.address || ""
  });

  // Sync state when company ID changes (to ensure we're editing the right one)
  useEffect(() => {
    setEditData({
      name: company.name,
      phone1: company.phone1 || "",
      phone2: company.phone2 || "",
      phone3: company.phone3 || "",
      website_url: company.website_url || "",
      address: company.address || ""
    });
  }, [company.id]);

  const handleUpdateInfo = async () => {
    setIsUpdating(true);
    try {
      const { error } = await supabase
        .from("delivery_companies")
        .update(editData)
        .eq("id", company.id);

      if (error) throw error;
      toast.success("تم تحديث معلومات الشركة بنجاح");
      onUpdate();
    } catch (error) {
      console.error(error);
      toast.error("فشل تحديث المعلومات");
    } finally {
      setIsUpdating(false);
    }
  };

  const zones = company.delivery_zones || [];
  const assignedWilayaCodes = new Set(zones.flatMap(z => z.zone_wilayas?.map(zw => zw.wilaya_code) || []));

  const handleAddZone = async () => {
    if (!newZoneName) return;
    try {
      const { error } = await supabase.from("delivery_zones").insert([{
        company_id: company.id,
        name: newZoneName,
        price_home: 0,
        price_desk: 0
      }]);
      if (error) throw error;
      toast.success("تم إضافة المنطقة");
      setNewZoneName("");
      onUpdate();
    } catch (error) {
      toast.error("حدث خطأ");
    }
  };

  const handleDeleteZone = async (zoneId: string) => {
    if (!confirm("هل أنت متأكد من حذف هذه المنطقة؟")) return;
    try {
      const { error } = await supabase.from("delivery_zones").delete().eq("id", zoneId);
      if (error) throw error;
      toast.success("تم حذف المنطقة");
      onUpdate();
    } catch (error) {
      toast.error("حدث خطأ");
    }
  };

  return (
    <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
      <div className="p-6 bg-muted/20 border-b shrink-0">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
          {/* Right Column: Company Info */}
          <div className="space-y-4">
            <h3 className="font-bold text-primary flex items-center gap-2">
              <Info className="w-4 h-4" />
              المعلومات الأساسية
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label className="text-xs">اسم الشركة</Label>
                <Input
                  value={editData.name}
                  onChange={(e) => setEditData({ ...editData, name: e.target.value })}
                  className="h-9"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">الموقع الإلكتروني</Label>
                <Input
                  value={editData.website_url}
                  onChange={(e) => setEditData({ ...editData, website_url: e.target.value })}
                  className="h-9"
                  dir="ltr"
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs">الهاتف 1</Label>
                <Input
                  value={editData.phone1}
                  onChange={(e) => setEditData({ ...editData, phone1: e.target.value })}
                  className="h-9"
                  dir="ltr"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">الهاتف 2</Label>
                <Input
                  value={editData.phone2}
                  onChange={(e) => setEditData({ ...editData, phone2: e.target.value })}
                  className="h-9"
                  dir="ltr"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">الهاتف 3</Label>
                <Input
                  value={editData.phone3}
                  onChange={(e) => setEditData({ ...editData, phone3: e.target.value })}
                  className="h-9"
                  dir="ltr"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs">العنوان الكامل</Label>
              <Input
                value={editData.address}
                onChange={(e) => setEditData({ ...editData, address: e.target.value })}
                className="h-9"
              />
            </div>

            <div className="flex justify-end pt-2">
              <Button onClick={handleUpdateInfo} className="h-9 px-6 bg-primary/90 hover:bg-primary">
                {isUpdating ? <Loader2 className="w-4 h-4 animate-spin ml-2" /> : <Save className="w-4 h-4 ml-2" />}
                حفظ معلومات الشركة
              </Button>
            </div>
          </div>

          {/* Left Column: Add Zone */}
          <div className="space-y-4 lg:border-r lg:pr-8">
            <h3 className="font-bold text-primary flex items-center gap-2">
              <MapPin className="w-4 h-4" />
              إضافة منطقة توصيل (Zone)
            </h3>
            <p className="text-xs text-muted-foreground">قم بتقسيم الولايات إلى مناطق لتحديد أسعار مختلفة (مثال: الشمال، الجنوب، العاصمة...)</p>

            <div className="space-y-4 pt-2">
              <div className="space-y-2">
                <Label className="text-xs">اسم المنطقة</Label>
                <div className="relative">
                  <MapPin className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    value={newZoneName}
                    onChange={(e) => setNewZoneName(e.target.value)}
                    placeholder="مثال: المنطقة الوسطى..."
                    className="pr-10 h-11"
                  />
                </div>
              </div>
              <Button onClick={handleAddZone} className="w-full h-11 text-base shadow-sm" variant="secondary">
                <Plus className="w-5 h-5 ml-2" />
                إضافة المنطقة للقائمة بالأسفل
              </Button>
            </div>
          </div>
        </div>
      </div>

      <ScrollArea className="flex-1 px-6">
        <div className="space-y-4 py-6 pb-24 max-w-5xl mx-auto">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-lg">مناطق التوصيل الحالية</h3>
              <Badge variant="secondary" className="rounded-full px-2.5">{zones.length}</Badge>
            </div>
            <p className="text-xs text-muted-foreground italic">يمكنك تعديل أسعار كل منطقة وإضافة الولايات لها بالضغط على "تعديل"</p>
          </div>
          {zones.map((zone) => (
            <ZoneEditor
              key={zone.id}
              zone={zone}
              allWilayas={wilayas}
              assignedCodes={assignedWilayaCodes}
              onUpdate={onUpdate}
              onDelete={() => handleDeleteZone(zone.id)}
            />
          ))}
          {zones.length === 0 && (
            <div className="text-center py-12 text-muted-foreground border-2 border-dashed rounded-xl">
              لا توجد مناطق مضافة بعد. ابدأ بإضافة منطقة لتقسيم الولايات.
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  );
}

function ZoneEditor({ zone, allWilayas, assignedCodes, onUpdate, onDelete }: {
  zone: Zone,
  allWilayas: Wilaya[],
  assignedCodes: Set<string>,
  onUpdate: () => void,
  onDelete: () => void
}) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [prices, setPrices] = useState({ home: zone.price_home, desk: zone.price_desk });

  // Sync internal price state when zone props change (after onUpdate)
  useEffect(() => {
    setPrices({ home: zone.price_home, desk: zone.price_desk });
  }, [zone.price_home, zone.price_desk]);

  const handleSavePrices = async () => {
    try {
      const { error } = await supabase.from("delivery_zones")
        .update({ price_home: prices.home, price_desk: prices.desk })
        .eq("id", zone.id);
      if (error) throw error;
      toast.success("تم تحديث الأسعار");
      onUpdate();
    } catch (error) {
      toast.error("فشل تحديث الأسعار");
    }
  };

  const handleAddWilaya = async (code: string) => {
    try {
      const { error } = await supabase.from("zone_wilayas").insert([{ zone_id: zone.id, wilaya_code: code }]);
      if (error) throw error;
      onUpdate();
    } catch (e) { toast.error("خطأ") }
  };

  const handleRemoveWilaya = async (code: string) => {
    try {
      const { error } = await supabase.from("zone_wilayas")
        .delete()
        .eq("zone_id", zone.id)
        .eq("wilaya_code", code);
      if (error) throw error;
      onUpdate();
    } catch (e) { toast.error("خطأ") }
  };

  return (
    <Card className="border shadow-sm overflow-hidden transition-all hover:border-primary/30">
      <CardHeader className="bg-muted/30 p-4">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 overflow-hidden">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
              <MapPin className="w-5 h-5 text-primary" />
            </div>
            <div className="overflow-hidden">
              <h4 className="font-bold text-base truncate">{zone.name}</h4>
              <div className="flex items-center gap-2 mt-0.5">
                <Badge variant="secondary" className="text-[10px] h-5 px-1.5 font-normal">
                  {zone.zone_wilayas?.length || 0} ولاية
                </Badge>
                <span className="text-xs text-muted-foreground">
                  {zone.price_home} دج / {zone.price_desk} دج
                </span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <Button
              variant={isExpanded ? "secondary" : "outline"}
              size="sm"
              onClick={() => setIsExpanded(!isExpanded)}
              className="text-xs h-9"
            >
              {isExpanded ? "إخفاء التفاصيل" : "تعديل الأسعار والولايات"}
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="text-destructive hover:bg-destructive/10 h-9 w-9"
              onClick={onDelete}
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      {isExpanded && (
        <CardContent className="pt-6 border-t animate-in slide-in-from-top-2 duration-300">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8 bg-primary/5 p-4 rounded-xl border border-primary/10 items-end">
            <div className="space-y-1.5 md:col-span-1">
              <Label className="text-xs font-bold text-primary">توصيل للمنزل (دج)</Label>
              <Input
                type="number"
                value={prices.home}
                onChange={(e) => setPrices({ ...prices, home: Number(e.target.value) })}
                className="bg-white"
                placeholder="0"
              />
            </div>
            <div className="space-y-1.5 md:col-span-1">
              <Label className="text-xs font-bold text-primary">توصيل للمكتب (دج)</Label>
              <Input
                type="number"
                value={prices.desk}
                onChange={(e) => setPrices({ ...prices, desk: Number(e.target.value) })}
                className="bg-white"
                placeholder="0"
              />
            </div>
            <div className="md:col-span-2">
              <Button
                onClick={handleSavePrices}
                className="w-full"
                disabled={prices.home === zone.price_home && prices.desk === zone.price_desk}
              >
                <Save className="w-4 h-4 ml-2" />
                حفظ تعديلات الأسعار لهذه المنطقة
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Assigned Wilayas */}
            <div>
              <h4 className="font-semibold mb-3 text-sm flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-green-500" />
                الولايات المضافة:
              </h4>
              <div className="flex flex-wrap gap-2">
                {zone.zone_wilayas?.map((zw) => {
                  const w = allWilayas.find(w => w.code === zw.wilaya_code);
                  return (
                    <Badge key={zw.wilaya_code} variant="outline" className="px-2 py-1 flex items-center gap-2 bg-background hover:border-destructive transition-colors">
                      {w?.name_ar || zw.wilaya_code}
                      <button onClick={() => handleRemoveWilaya(zw.wilaya_code)} className="hover:text-destructive opacity-50 hover:opacity-100">
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </Badge>
                  );
                })}
                {(!zone.zone_wilayas || zone.zone_wilayas.length === 0) && (
                  <p className="text-sm text-muted-foreground italic">لا توجد ولايات مخصصة</p>
                )}
              </div>
            </div>

            {/* Available Wilayas */}
            <div className="border-t pt-6 md:border-t-0 md:pt-0 md:border-r md:pr-6">
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-semibold text-sm flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-primary" />
                  إضافة ولايات:
                </h4>
              </div>
              <ScrollArea className="h-48 border rounded-md p-2 bg-muted/10">
                <div className="grid grid-cols-2 gap-1">
                  {allWilayas.filter(w => !assignedCodes.has(w.code)).map((w) => (
                    <button
                      key={w.code}
                      onClick={() => handleAddWilaya(w.code)}
                      className="text-right text-sm px-2 py-1.5 hover:bg-primary/10 rounded cursor-pointer truncate"
                    >
                      <span className="opacity-50 ml-2 text-xs">{w.code}</span>
                      {w.name_ar}
                    </button>
                  ))}
                  {allWilayas.filter(w => !assignedCodes.has(w.code)).length === 0 && (
                    <p className="col-span-2 text-center text-xs text-muted-foreground py-4">جميع الولايات مخصصة</p>
                  )}
                </div>
              </ScrollArea>
            </div>
          </div>
        </CardContent>
      )}
    </Card>
  );
}
