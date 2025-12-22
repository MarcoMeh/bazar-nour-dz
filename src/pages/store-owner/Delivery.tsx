import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAdmin } from "@/contexts/AdminContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { Loader2, Save, Truck, Info } from "lucide-react";

interface DeliveryCompany {
    id: string;
    name: string;
    phone1?: string;
    phone2?: string;
    phone3?: string;
    website_url?: string;
    address?: string;
}

interface WilayaData {
    code: string;
    name_ar: string;
    zone_id?: string;
    zone_name?: string;
    base_price_home: number;
    base_price_desk: number;
}

interface OverrideData {
    wilaya_code: string;
    price_home?: number;
    price_desk?: number;
    is_home_enabled: boolean;
    is_desk_enabled: boolean;
    is_modified: boolean;
}

export default function StoreOwnerDelivery() {
    const { storeId } = useAdmin();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    const [companies, setCompanies] = useState<DeliveryCompany[]>([]);
    const [selectedCompanyId, setSelectedCompanyId] = useState<string>("");

    const [tableData, setTableData] = useState<{ wilaya: WilayaData, override: OverrideData }[]>([]);

    useEffect(() => {
        if (storeId) {
            fetchInitialData();
        }
    }, [storeId]);

    useEffect(() => {
        if (selectedCompanyId && storeId) {
            fetchCompanyDetailsAndOverrides();
        }
    }, [selectedCompanyId]);

    const fetchInitialData = async () => {
        setLoading(true);
        try {
            const { data: companiesData } = await supabase.from("delivery_companies").select("*");
            setCompanies(companiesData || []);

            const { data: settings } = await supabase
                .from("store_delivery_settings")
                .select("company_id")
                .eq("store_id", storeId)
                .maybeSingle();

            if (settings?.company_id) {
                setSelectedCompanyId(settings.company_id);
            }
        } catch (error) {
            toast.error("فشل تحميل البيانات");
        } finally {
            setLoading(false);
        }
    };

    const fetchCompanyDetailsAndOverrides = async () => {
        setLoading(true);
        try {
            const { data: zones } = await supabase
                .from("delivery_zones")
                .select("*, zone_wilayas(wilaya_code)")
                .eq("company_id", selectedCompanyId);

            const { data: allWilayas } = await supabase.from("wilayas").select("code, name_ar").order("code");

            const { data: overrides } = await supabase
                .from("store_delivery_overrides")
                .select("*")
                .eq("store_id", storeId);

            if (!zones || !allWilayas) throw new Error("Missing data");

            const wilayaZoneMap = new Map<string, { name: string, price_home: number, price_desk: number }>();
            zones.forEach(zone => {
                zone.zone_wilayas?.forEach(zw => {
                    wilayaZoneMap.set(zw.wilaya_code, {
                        name: zone.name,
                        price_home: zone.price_home,
                        price_desk: zone.price_desk
                    });
                });
            });

            const overrideMap = new Map<string, any>();
            overrides?.forEach(ov => overrideMap.set(ov.wilaya_code, ov));

            const merged = allWilayas.map(w => {
                const zoneInfo = wilayaZoneMap.get(w.code) || { name: "-", price_home: 0, price_desk: 0 };
                const ov = overrideMap.get(w.code);

                return {
                    wilaya: {
                        code: w.code,
                        name_ar: w.name_ar,
                        zone_name: zoneInfo.name,
                        base_price_home: zoneInfo.price_home,
                        base_price_desk: zoneInfo.price_desk
                    },
                    override: {
                        wilaya_code: w.code,
                        price_home: ov?.price_home ?? zoneInfo.price_home,
                        price_desk: ov?.price_desk ?? zoneInfo.price_desk,
                        is_home_enabled: ov?.is_home_enabled ?? true,
                        is_desk_enabled: ov?.is_desk_enabled ?? true,
                        is_modified: false
                    }
                };
            });

            setTableData(merged);
        } catch (error) {
            console.error(error);
            toast.error("فشل تحميل تفاصيل التوصيل");
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        if (!selectedCompanyId) return;
        setSaving(true);
        try {
            const { error: settingsError } = await supabase
                .from("store_delivery_settings")
                .upsert({ store_id: storeId, company_id: selectedCompanyId }, { onConflict: "store_id, company_id" });

            if (settingsError) throw settingsError;

            const overridesPayload = tableData.map(row => ({
                store_id: storeId,
                wilaya_code: row.wilaya.code,
                price_home: row.override.price_home,
                price_desk: row.override.price_desk,
                is_home_enabled: row.override.is_home_enabled,
                is_desk_enabled: row.override.is_desk_enabled
            }));

            const { error: overridesError } = await supabase
                .from("store_delivery_overrides")
                .upsert(overridesPayload, { onConflict: "store_id, wilaya_code" });

            if (overridesError) throw overridesError;

            toast.success("تم حفظ إعدادات التوصيل بنجاح");

        } catch (error) {
            console.error(error);
            toast.error("فشل حفظ التغييرات");
        } finally {
            setSaving(false);
        }
    };

    const updateOverride = (code: string, field: keyof OverrideData, value: any) => {
        setTableData(prev => prev.map(row => {
            if (row.wilaya.code === code) {
                return {
                    ...row,
                    override: {
                        ...row.override,
                        [field]: value,
                        is_modified: true
                    }
                };
            }
            return row;
        }));
    };

    return (
        <div className="p-4 md:p-8 space-y-6" dir="rtl">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">إعدادات التوصيل</h1>
                    <p className="text-muted-foreground mt-2">اختر شركة التوصيل وقم بتخصيص الأسعار لكل ولاية.</p>
                </div>
                <Button onClick={handleSave} disabled={loading || saving || !selectedCompanyId} size="lg" className="min-w-[150px]">
                    {saving ? <Loader2 className="w-4 h-4 animate-spin ml-2" /> : <Save className="w-4 h-4 ml-2" />}
                    حفظ التغييرات
                </Button>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                        <Truck className="w-5 h-5 text-primary" />
                        شركة التوصيل
                    </CardTitle>
                    <CardDescription>اختر الشركة التي تتعامل معها لتحديد أسعار المناطق تلقائياً</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="max-w-md">
                        <Select value={selectedCompanyId} onValueChange={setSelectedCompanyId} disabled={loading && companies.length === 0}>
                            <SelectTrigger>
                                <SelectValue placeholder="اختر شركة توصيل..." />
                            </SelectTrigger>
                            <SelectContent>
                                {companies.map(c => (
                                    <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    {selectedCompanyId && companies.find(c => c.id === selectedCompanyId) && (
                        <div className="mt-6 pt-6 border-t animate-in fade-in slide-in-from-top-4 duration-500">
                            <h3 className="text-sm font-bold mb-4 flex items-center gap-2 text-primary">
                                <Info className="w-4 h-4" />
                                معلومات التواصل مع الشركة
                            </h3>
                            {(() => {
                                const company = companies.find(c => c.id === selectedCompanyId);
                                if (!company) return null;
                                return (
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                        {(company.phone1 || company.phone2 || company.phone3) && (
                                            <div className="p-3 bg-muted/30 rounded-lg border">
                                                <div className="text-[10px] text-muted-foreground mb-1 uppercase tracking-wider font-bold">أرقام الهاتف</div>
                                                <div className="space-y-1">
                                                    {company.phone1 && <div className="text-sm font-medium">{company.phone1}</div>}
                                                    {company.phone2 && <div className="text-sm font-medium">{company.phone2}</div>}
                                                    {company.phone3 && <div className="text-sm font-medium">{company.phone3}</div>}
                                                </div>
                                            </div>
                                        )}
                                        {company.website_url && (
                                            <div className="p-3 bg-muted/30 rounded-lg border">
                                                <div className="text-[10px] text-muted-foreground mb-1 uppercase tracking-wider font-bold">الموقع الإلكتروني</div>
                                                <a
                                                    href={company.website_url.startsWith('http') ? company.website_url : `https://${company.website_url}`}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="text-sm font-medium text-primary hover:underline break-all"
                                                >
                                                    {company.website_url.replace(/^https?:\/\//, '')}
                                                </a>
                                            </div>
                                        )}
                                        {company.address && (
                                            <div className="p-3 bg-muted/30 rounded-lg border lg:col-span-1">
                                                <div className="text-[10px] text-muted-foreground mb-1 uppercase tracking-wider font-bold">العنوان الرئيسي</div>
                                                <div className="text-sm font-medium">{company.address}</div>
                                            </div>
                                        )}
                                    </div>
                                );
                            })()}
                        </div>
                    )}
                </CardContent>
            </Card>

            {selectedCompanyId && (
                <Card>
                    <CardHeader>
                        <CardTitle className="text-lg flex items-center gap-2">
                            <Info className="w-5 h-5 text-primary" />
                            تخصيص الأسعار حسب الولاية
                        </CardTitle>
                        <CardDescription>يمكنك تعديل السعر الافتراضي أو إيقاف التوصيل لولايات محددة</CardDescription>
                    </CardHeader>
                    <CardContent className="p-0">
                        {/* Mobile View (Cards) */}
                        <div className="md:hidden divide-y">
                            {loading ? (
                                <div className="p-8 text-center">
                                    <Loader2 className="w-8 h-8 animate-spin mx-auto text-primary" />
                                </div>
                            ) : (
                                tableData.map((row) => (
                                    <div key={row.wilaya.code} className="p-4 space-y-4">
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <div className="font-semibold">{row.wilaya.code} - {row.wilaya.name_ar}</div>
                                                <div className="text-xs text-muted-foreground">{row.wilaya.zone_name}</div>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-2 gap-4">
                                            {/* Home Delivery Mobile */}
                                            <div className="space-y-2 p-3 bg-muted/30 rounded-lg border">
                                                <div className="flex items-center justify-between">
                                                    <span className="text-sm font-medium">للمنزل</span>
                                                    <Switch
                                                        checked={row.override.is_home_enabled}
                                                        onCheckedChange={(val) => updateOverride(row.wilaya.code, "is_home_enabled", val)}
                                                    />
                                                </div>
                                                <Input
                                                    type="number"
                                                    value={row.override.price_home || 0}
                                                    onChange={(e) => updateOverride(row.wilaya.code, "price_home", Number(e.target.value))}
                                                    disabled={!row.override.is_home_enabled}
                                                    className={`text-center h-8 ${row.override.price_home !== row.wilaya.base_price_home ? "border-primary/50 bg-primary/5 font-semibold" : ""}`}
                                                />
                                                <div className="text-[10px] text-center text-muted-foreground">الافتراضي: {row.wilaya.base_price_home}</div>
                                            </div>

                                            {/* Desk Delivery Mobile */}
                                            <div className="space-y-2 p-3 bg-muted/30 rounded-lg border">
                                                <div className="flex items-center justify-between">
                                                    <span className="text-sm font-medium">للمكتب</span>
                                                    <Switch
                                                        checked={row.override.is_desk_enabled}
                                                        onCheckedChange={(val) => updateOverride(row.wilaya.code, "is_desk_enabled", val)}
                                                    />
                                                </div>
                                                <Input
                                                    type="number"
                                                    value={row.override.price_desk || 0}
                                                    onChange={(e) => updateOverride(row.wilaya.code, "price_desk", Number(e.target.value))}
                                                    disabled={!row.override.is_desk_enabled}
                                                    className={`text-center h-8 ${row.override.price_desk !== row.wilaya.base_price_desk ? "border-primary/50 bg-primary/5 font-semibold" : ""}`}
                                                />
                                                <div className="text-[10px] text-center text-muted-foreground">الافتراضي: {row.wilaya.base_price_desk}</div>
                                            </div>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>

                        {/* Desktop View (Table) */}
                        <Table className="hidden md:table">
                            <TableHeader>
                                <TableRow>
                                    <TableHead className="text-right w-[150px]">الولاية</TableHead>
                                    <TableHead className="text-right hidden md:table-cell">المنطقة</TableHead>
                                    <TableHead className="text-center">للمنزل (تفعيل)</TableHead>
                                    <TableHead className="text-center w-[150px]">سعر المنزل (دج)</TableHead>
                                    <TableHead className="text-center"> للمكتب (تفعيل)</TableHead>
                                    <TableHead className="text-center w-[150px]">سعر المكتب (دج)</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {loading ? (
                                    <TableRow>
                                        <TableCell colSpan={6} className="h-24 text-center">
                                            <Loader2 className="w-6 h-6 animate-spin mx-auto text-primary" />
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    tableData.map((row) => (
                                        <TableRow key={row.wilaya.code} className="hover:bg-muted/50">
                                            <TableCell className="font-medium">
                                                <div className="flex flex-col">
                                                    <span>{row.wilaya.code} - {row.wilaya.name_ar}</span>
                                                    <span className="md:hidden text-xs text-muted-foreground">{row.wilaya.zone_name}</span>
                                                </div>
                                            </TableCell>
                                            <TableCell className="hidden md:table-cell text-muted-foreground">
                                                {row.wilaya.zone_name}
                                            </TableCell>

                                            {/* Home Delivery */}
                                            <TableCell className="text-center">
                                                <Switch
                                                    checked={row.override.is_home_enabled}
                                                    onCheckedChange={(val) => updateOverride(row.wilaya.code, "is_home_enabled", val)}
                                                />
                                            </TableCell>
                                            <TableCell>
                                                <Input
                                                    type="number"
                                                    value={row.override.price_home || 0}
                                                    onChange={(e) => updateOverride(row.wilaya.code, "price_home", Number(e.target.value))}
                                                    disabled={!row.override.is_home_enabled}
                                                    className={`text-center ${row.override.price_home !== row.wilaya.base_price_home ? "border-primary/50 bg-primary/5 font-semibold" : ""}`}
                                                />
                                                <div className="text-[10px] text-center text-muted-foreground mt-1">الافتراضي: {row.wilaya.base_price_home}</div>
                                            </TableCell>

                                            {/* Desk Delivery */}
                                            <TableCell className="text-center">
                                                <Switch
                                                    checked={row.override.is_desk_enabled}
                                                    onCheckedChange={(val) => updateOverride(row.wilaya.code, "is_desk_enabled", val)}
                                                />
                                            </TableCell>
                                            <TableCell>
                                                <Input
                                                    type="number"
                                                    value={row.override.price_desk || 0}
                                                    onChange={(e) => updateOverride(row.wilaya.code, "price_desk", Number(e.target.value))}
                                                    disabled={!row.override.is_desk_enabled}
                                                    className={`text-center ${row.override.price_desk !== row.wilaya.base_price_desk ? "border-primary/50 bg-primary/5 font-semibold" : ""}`}
                                                />
                                                <div className="text-[10px] text-center text-muted-foreground mt-1">الافتراضي: {row.wilaya.base_price_desk}</div>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
            )}
        </div>
    );
}
