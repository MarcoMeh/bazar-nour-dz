import { Outlet } from "react-router-dom";
import { StoreOwnerSidebar } from "@/components/layout/StoreOwnerSidebar";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Menu, AlertTriangle, Lock, Clock } from "lucide-react";
import { useState, useEffect } from "react";
import { useAdmin } from "@/contexts/AdminContext";
import { supabase } from "@/integrations/supabase/client";
import { NotificationCenter } from "@/components/store-owner/NotificationCenter";

export const StoreOwnerLayout = () => {
    const [open, setOpen] = useState(false);
    const { storeId } = useAdmin();
    const [storeStatus, setStoreStatus] = useState<{
        endDate: string | null;
        isSuspended: boolean;
        loading: boolean;
    }>({ endDate: null, isSuspended: false, loading: true });

    useEffect(() => {
        if (!storeId) return;
        const fetchStatus = async () => {
            const { data } = await supabase
                .from('stores')
                .select('subscription_end_date, is_manually_suspended')
                .eq('id', storeId)
                .single();

            if (data) {
                setStoreStatus({
                    endDate: data.subscription_end_date,
                    isSuspended: data.is_manually_suspended || false,
                    loading: false
                });
            }
        };
        fetchStatus();
    }, [storeId]);

    // Calculate Status
    const now = new Date();
    const endDate = storeStatus.endDate ? new Date(storeStatus.endDate) : null;

    // Suspended
    if (!storeStatus.loading && storeStatus.isSuspended) {
        return (
            <div className="flex h-screen w-full items-center justify-center bg-destructive/10 p-4">
                <div className="text-center max-w-md bg-white p-8 rounded-lg shadow-xl border-2 border-destructive">
                    <div className="bg-destructive/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Lock className="h-8 w-8 text-destructive" />
                    </div>
                    <h1 className="text-2xl font-bold text-destructive mb-2">الحساب مجمد</h1>
                    <p className="text-muted-foreground mb-6">
                        تم إيقاف حساب المتجر الخاص بك لأسباب إدارية. يرجى التواصل مع الإدارة للاستفسار.
                    </p>
                </div>
            </div>
        );
    }

    // Expired
    const isExpired = endDate && endDate < now;

    if (!storeStatus.loading && isExpired) {
        return (
            <div className="flex h-screen w-full items-center justify-center bg-orange-50 p-4">
                <div className="text-center max-w-md bg-white p-8 rounded-lg shadow-xl border-2 border-orange-500">
                    <div className="bg-orange-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Clock className="h-8 w-8 text-orange-600" />
                    </div>
                    <h1 className="text-2xl font-bold text-orange-700 mb-2">اشتراكك منتهي</h1>
                    <p className="text-muted-foreground mb-6">
                        انتهت فترة اشتراكك في المنصة. يرجى تجديد الاشتراك للاستمرار في عرض منتجاتك واستقبال الطلبات.
                    </p>
                    <div className="text-sm bg-gray-100 p-3 rounded mb-4">
                        للتجديد، يرجى التواصل مع الإدارة أو الدفع عبر الطرق المتاحة.
                    </div>
                </div>
            </div>
        );
    }

    // Warning Banner (< 3 days)
    let warningBanner = null;
    if (endDate && !isExpired) {
        const diffTime = Math.abs(endDate.getTime() - now.getTime());
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        if (diffDays <= 3) {
            const isCritical = diffDays <= 1;
            warningBanner = (
                <div className={`${isCritical ? "bg-red-600" : "bg-orange-500"} text-white px-4 py-2 text-center text-sm font-medium flex items-center justify-center gap-2`}>
                    <Clock className="h-4 w-4" />
                    {isCritical
                        ? `تنبيه: اشتراكك ينتهي خلال أقل من 24 ساعة!`
                        : `تنبيه: باقي على انتهاء اشتراكك ${diffDays} أيام.`
                    }
                </div>
            );
        }
    }

    return (
        <div className="flex h-screen w-full flex-col">
            {/* Warning Banner Positioned at very top */}
            {warningBanner}

            <div className="flex flex-1 overflow-hidden">
                {/* Desktop Sidebar */}
                <div className="hidden md:block w-64 border-l bg-card shrink-0 overflow-y-auto">
                    <StoreOwnerSidebar />
                </div>

                <div className="flex flex-1 flex-col overflow-hidden">
                    {/* Top Header Bar */}
                    <header className="h-16 border-b bg-background flex items-center justify-between px-4 md:px-8 shrink-0">
                        <div className="flex items-center gap-4">
                            {/* Mobile Sidebar Trigger (moved inside header) */}
                            <div className="md:hidden">
                                <Sheet open={open} onOpenChange={setOpen}>
                                    <SheetTrigger asChild>
                                        <Button variant="outline" size="icon" className="shadow-sm">
                                            <Menu className="h-5 w-5" />
                                        </Button>
                                    </SheetTrigger>

                                    <SheetContent side="right" className="p-0 w-64">
                                        <StoreOwnerSidebar onLinkClick={() => setOpen(false)} />
                                    </SheetContent>
                                </Sheet>
                            </div>
                            <h1 className="text-lg font-bold text-primary hidden md:block">لوحة إدارة المتجر</h1>
                        </div>

                        <div className="flex items-center gap-4">
                            <NotificationCenter />
                        </div>
                    </header>

                    {/* Main Content Area */}
                    <main className="flex-1 overflow-y-auto bg-accent/30 p-4 md:p-8">
                        <Outlet />
                    </main>
                </div>
            </div>
        </div>
    );
};
