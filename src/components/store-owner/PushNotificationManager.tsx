import { useState, useEffect } from "react";
import { Bell, BellOff, ShieldCheck, Sparkles, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAdmin } from "@/contexts/AdminContext";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Card, CardContent } from "@/components/ui/card";

const VAPID_PUBLIC_KEY = "BLzppK5cluGLwCWeyfCkia3Hpq7ATXpuMocuMR5iiooHpzIB18B087RKorUZZUUbM1oQxLygrhQCQoXbqekCvkU";

// Helper function to convert VAPID key
function urlBase64ToUint8Array(base64String: string) {
    const padding = '='.repeat((4 - base64String.length % 4) % 4);
    const base64 = (base64String + padding)
        .replace(/\-/g, '+')
        .replace(/_/g, '/');

    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);

    for (let i = 0; i < rawData.length; ++i) {
        outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
}

interface PushNotificationManagerProps {
    theme?: 'light' | 'dark' | 'glass';
}

export const PushNotificationManager = ({ theme = 'light' }: PushNotificationManagerProps) => {
    const { storeId, user } = useAdmin();
    const [isSupported, setIsSupported] = useState(false);
    const [isSubscribed, setIsSubscribed] = useState(false);
    const [permissionState, setPermissionState] = useState<NotificationPermission>('default');
    const [loading, setLoading] = useState(false);
    const [testing, setTesting] = useState(false);

    // Get theme classes matching TikTech UI standards
    const getCardClass = () => {
        if (theme === 'dark') {
            return 'bg-[#1e1e1e] border-zinc-800 text-[#F5F5F5] shadow-none';
        }
        if (theme === 'glass') {
            return 'bg-white/40 backdrop-blur-md border border-white/50 text-slate-800 shadow-lg';
        }
        return 'bg-white border-gray-100 text-gray-900 shadow-sm';
    };

    const getSubtextClass = () => {
        if (theme === 'dark') return 'text-zinc-400';
        if (theme === 'glass') return 'text-slate-600';
        return 'text-gray-500';
    };

    useEffect(() => {
        // Check if Push API and Service Workers are supported
        const supported = 'PushManager' in window && 'serviceWorker' in navigator;
        setIsSupported(supported);

        if (supported) {
            setPermissionState(Notification.permission);
            checkSubscription();
        }
    }, []);

    const checkSubscription = async () => {
        try {
            const registration = await navigator.serviceWorker.ready;
            const subscription = await registration.pushManager.getSubscription();
            setIsSubscribed(!!subscription);
        } catch (e) {
            console.error("Error checking push subscription:", e);
        }
    };

    const handleSubscribe = async () => {
        if (!isSupported || !storeId || !user) return;
        setLoading(true);

        try {
            // 1. Request notification permission
            const permission = await Notification.requestPermission();
            setPermissionState(permission);

            if (permission !== 'granted') {
                toast.error("تم رفض صلاحية الإشعارات. يرجى تفعيلها من إعدادات المتصفح.");
                setLoading(false);
                return;
            }

            // 2. Get Service Worker registration
            const registration = await navigator.serviceWorker.ready;

            // 3. Subscribe to push manager
            const applicationServerKey = urlBase64ToUint8Array(VAPID_PUBLIC_KEY);
            const subscription = await registration.pushManager.subscribe({
                userVisibleOnly: true,
                applicationServerKey: applicationServerKey
            });

            // 4. Extract push credentials
            const p256dh = btoa(String.fromCharCode(...new Uint8Array(subscription.getKey('p256dh')!)));
            const authKey = btoa(String.fromCharCode(...new Uint8Array(subscription.getKey('auth')!)));
            const endpoint = subscription.endpoint;

            // 5. Save/Upsert to Supabase database
            const { error } = await supabase
                .from('store_push_subscriptions')
                .upsert({
                    store_id: storeId,
                    user_id: user.id,
                    endpoint: endpoint,
                    p256dh: p256dh,
                    auth_key: authKey
                }, {
                    onConflict: 'endpoint'
                });

            if (error) throw error;

            setIsSubscribed(true);
            toast.success("تم تفعيل إشعارات الخلفية المسموعة بنجاح! 🔔");
        } catch (err: any) {
            console.error("Push subscription failed:", err);
            toast.error("فشل تفعيل الإشعارات: " + (err.message || "خطأ غير متوقع"));
        } finally {
            setLoading(false);
        }
    };

    const handleUnsubscribe = async () => {
        if (!isSupported) return;
        setLoading(true);

        try {
            const registration = await navigator.serviceWorker.ready;
            const subscription = await registration.pushManager.getSubscription();

            if (subscription) {
                // Remove from browser
                await subscription.unsubscribe();
                
                // Remove from Supabase
                const { error } = await supabase
                    .from('store_push_subscriptions')
                    .delete()
                    .eq('endpoint', subscription.endpoint);

                if (error) console.error("Database deletion failed:", error);
            }

            setIsSubscribed(false);
            toast.success("تم إيقاف إشعارات الخلفية.");
        } catch (err: any) {
            console.error("Push unsubscription failed:", err);
            toast.error("فشل إلغاء الاشتراك: " + (err.message || "خطأ غير متوقع"));
        } finally {
            setLoading(false);
        }
    };

    const handleTestNotification = async () => {
        if (!isSubscribed || !storeId) return;
        setTesting(true);

        try {
            // Trigger push via Edge Function
            const { data, error } = await supabase.functions.invoke('send-push-notification', {
                body: {
                    store_id: storeId,
                    type: 'new_order', // Simulates a new order notification structure
                    title: 'تجربة تنبيهات بازارنا! 🔔',
                    message: 'نجاح! نظام الإشعارات الفورية المسموعة يعمل بشكل ممتاز في الخلفية.'
                }
            });

            if (error) throw error;
            
            toast.success("تم إرسال إشعار تجريبي لهاتفك/جهازك. يرجى التحقق.");
        } catch (err: any) {
            console.error("Test push invocation failed:", err);
            toast.error("فشل إرسال الإشعار التجريبي: " + (err.message || "خطأ غير متوقع"));
        } finally {
            setTesting(false);
        }
    };

    if (!isSupported) {
        return null; // Don't show anything if push is not supported by current browser
    }

    return (
        <Card className={`overflow-hidden border transition-all duration-300 ${getCardClass()}`}>
            <CardContent className="p-4 md:p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-start gap-4">
                    <div className={`p-3 rounded-2xl ${
                        isSubscribed 
                            ? 'bg-emerald-500/10 text-emerald-500' 
                            : 'bg-amber-500/10 text-amber-500'
                    }`}>
                        {isSubscribed ? <ShieldCheck className="h-6 w-6" /> : <Bell className="h-6 w-6" />}
                    </div>
                    <div className="space-y-1">
                        <div className="flex items-center gap-2">
                            <h3 className="font-bold text-lg">إشعارات الطلبات الفورية (رنين الخلفية)</h3>
                            {isSubscribed && (
                                <span className="flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-500">
                                    <Sparkles className="h-3 w-3" /> نشط
                                </span>
                            )}
                        </div>
                        <p className={`text-sm ${getSubtextClass()}`}>
                            {isSubscribed 
                                ? "سيتلقى جهازك رنيناً وتنبيهات منبثقة عند استلام طلبية جديدة حتى لو كان مغلقاً." 
                                : "فعّل التنبيهات المسموعة لتصلك الطلبيات الجديدة فوراً وتنبيهك حتى لو كان هاتفك على الطاولة."}
                        </p>
                    </div>
                </div>

                <div className="flex flex-wrap items-center gap-3 shrink-0">
                    {isSubscribed ? (
                        <>
                            <Button 
                                variant="outline" 
                                onClick={handleTestNotification} 
                                disabled={testing}
                                className="font-bold border-gray-200"
                            >
                                {testing ? (
                                    <Loader2 className="h-4 w-4 animate-spin ml-2" />
                                ) : (
                                    <Bell className="h-4 w-4 ml-2" />
                                )}
                                تجربة التنبيه
                            </Button>
                            <Button 
                                variant="destructive" 
                                onClick={handleUnsubscribe} 
                                disabled={loading}
                                className="font-bold bg-red-500 hover:bg-red-600 text-white border-none"
                            >
                                {loading && <Loader2 className="h-4 w-4 animate-spin ml-2" />}
                                إيقاف التنبيهات
                            </Button>
                        </>
                    ) : (
                        <Button 
                            onClick={handleSubscribe} 
                            disabled={loading}
                            className="font-bold bg-primary hover:bg-primary/90 text-white"
                        >
                            {loading ? (
                                <Loader2 className="h-4 w-4 animate-spin ml-2" />
                            ) : (
                                <Bell className="h-4 w-4 ml-2" />
                            )}
                            تفعيل التنبيهات المسموعة
                        </Button>
                    )}
                </div>
            </CardContent>
        </Card>
    );
};
