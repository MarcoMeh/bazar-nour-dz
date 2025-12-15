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
import { Loader2, Plus, Trash2, Edit, Truck, Map, MapPin } from "lucide-react";

interface Company {
  id: string;
  name: string;
  logo_url?: string;
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
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

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

  const handleCreateCompany = async (name: string) => {
    try {
      const { data, error } = await supabase.from("delivery_companies").insert([{ name }]).select().single();
      if (error) throw error;
      setCompanies([...companies, { ...data, delivery_zones: [] }]);
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
          <DialogContent>
            <DialogHeader>
              <DialogTitle>إضافة شركة توصيل جديدة</DialogTitle>
            </DialogHeader>
            <form onSubmit={(e) => {
              e.preventDefault();
              const formData = new FormData(e.currentTarget);
              handleCreateCompany(formData.get("name") as string);
            }} className="space-y-4 pt-4">
              <div className="space-y-2">
                <Label>اسم الشركة</Label>
                <Input name="name" required placeholder="مثال: Yalidine" />
              </div>
              <Button type="submit" className="w-full">حفظ</Button>
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
              setSelectedCompany(company);
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
        <DialogContent className="max-w-4xl h-[90vh] flex flex-col p-0 gap-0">
          <DialogHeader className="p-6 border-b">
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
                // Keep dialog open but refresh data? 
                // Actually simplistic fetchInitialData replaces selectedCompany instance reference
              }}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

function CompanyEditor({ company, wilayas, onUpdate }: { company: Company, wilayas: Wilaya[], onUpdate: () => void }) {
  const [zones, setZones] = useState<Zone[]>(company.delivery_zones || []);
  const [newZoneName, setNewZoneName] = useState("");
  const [activeTab, setActiveTab] = useState("zones");

  // Derived state for available wilayas (not assigned to any zone in this company)
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
      // Optimistic update
      // setZones([...zones, { id: "temp", name: newZoneName, price_home: 0, price_desk: 0, zone_wilayas: [] } as any]);
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
    <div className="flex-1 overflow-hidden flex flex-col">
      <div className="p-4 bg-muted/20 flex gap-4 items-end border-b">
        <div className="flex-1">
          <Label>إضافة منطقة جديدة (Zone)</Label>
          <div className="flex gap-2 mt-2">
            <Input
              value={newZoneName}
              onChange={(e) => setNewZoneName(e.target.value)}
              placeholder="مثال: المنطقة الوسطى"
            />
            <Button onClick={handleAddZone}><Plus className="w-4 h-4 ml-2" /> إضافة</Button>
          </div>
        </div>
      </div>

      <ScrollArea className="flex-1 p-6">
        <div className="space-y-6">
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
    <Card className="border shadow-none">
      <CardHeader className="bg-muted/30 pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-bold flex items-center gap-2">
            <MapPin className="w-5 h-5 text-primary" />
            {zone.name}
            <Badge variant="secondary" className="mr-2 text-xs font-normal">
              {zone.zone_wilayas?.length || 0} ولاية
            </Badge>
          </CardTitle>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" onClick={() => setIsExpanded(!isExpanded)}>
              {isExpanded ? "إخفاء التفاصيل" : "عرض التفاصيل"}
            </Button>
            <Button variant="ghost" size="icon" className="text-destructive hover:bg-destructive/10" onClick={onDelete}>
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4 items-end">
          <div className="space-y-1">
            <Label className="text-xs text-muted-foreground">توصيل للمنزل (دج)</Label>
            <Input
              type="number"
              value={prices.home}
              onChange={(e) => setPrices({ ...prices, home: Number(e.target.value) })}
              className="bg-white"
            />
          </div>
          <div className="space-y-1">
            <Label className="text-xs text-muted-foreground">توصيل للمكتب (دج)</Label>
            <Input
              type="number"
              value={prices.desk}
              onChange={(e) => setPrices({ ...prices, desk: Number(e.target.value) })}
              className="bg-white"
            />
          </div>
          <Button onClick={handleSavePrices} disabled={prices.home === zone.price_home && prices.desk === zone.price_desk}>
            حفظ الأسعار
          </Button>
        </div>
      </CardHeader>
      {isExpanded && (
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Assigned Wilayas */}
            <div>
              <h4 className="font-semibold mb-3 text-sm">الولايات المضافة في هذه المنطقة:</h4>
              <div className="flex flex-wrap gap-2">
                {zone.zone_wilayas?.map((zw) => {
                  const w = allWilayas.find(w => w.code === zw.wilaya_code);
                  return (
                    <Badge key={zw.wilaya_code} variant="outline" className="pl-1 pr-2 py-1 flex items-center gap-2 bg-background">
                      {w?.name_ar || zw.wilaya_code}
                      <button onClick={() => handleRemoveWilaya(zw.wilaya_code)} className="hover:text-destructive">
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </Badge>
                  );
                })}
                {(!zone.zone_wilayas || zone.zone_wilayas.length === 0) && (
                  <p className="text-sm text-muted-foreground italic">لا توجد ولايات</p>
                )}
              </div>
            </div>

            {/* Available Wilayas */}
            <div className="border-t pt-6 md:border-t-0 md:pt-0 md:border-r md:pr-6">
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-semibold text-sm">إضافة ولايات لهذه المنطقة:</h4>
                <input placeholder="بحث..." className="text-xs border rounded p-1" />
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
                    <p className="col-span-2 text-center text-xs text-muted-foreground py-4">جميع الولايات مخصصة لمناطق بالفعل</p>
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
