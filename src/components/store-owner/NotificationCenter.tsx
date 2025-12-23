import { useState, useEffect } from "react";
import { Bell, Check, Trash2, Package } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAdmin } from "@/contexts/AdminContext";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { formatDistanceToNow } from "date-fns";
import { arDZ } from "date-fns/locale";
import { toast } from "sonner";

interface Notification {
    id: string;
    type: string;
    title: string;
    message: string;
    is_read: boolean;
    created_at: string;
    order_id?: string;
}

export const NotificationCenter = () => {
    const navigate = useNavigate();
    const { storeId } = useAdmin();
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [unreadCount, setUnreadCount] = useState(0);

    const fetchNotifications = async () => {
        if (!storeId) return;
        const { data, error } = await supabase
            .from("notifications")
            .select("*")
            .eq("store_id", storeId)
            .order("created_at", { ascending: false })
            .limit(20);

        if (error) {
            console.error("Error fetching notifications:", error);
            return;
        }

        setNotifications(data || []);
        setUnreadCount(data?.filter(n => !n.is_read).length || 0);
    };

    useEffect(() => {
        fetchNotifications();

        if (!storeId) return;

        // Subscribe to real-time notifications
        const channel = supabase
            .channel(`notifications-${storeId}`)
            .on(
                "postgres_changes",
                {
                    event: "INSERT",
                    schema: "public",
                    table: "notifications",
                    filter: `store_id=eq.${storeId}`,
                },
                (payload) => {
                    const newNotification = payload.new as Notification;
                    setNotifications(prev => [newNotification, ...prev].slice(0, 20));
                    setUnreadCount(prev => prev + 1);

                    // Show toast for new order
                    if (newNotification.type === 'new_order') {
                        toast("طلب جديد! 📦", {
                            description: newNotification.message,
                            action: {
                                label: "عرض",
                                onClick: () => navigate("/store-dashboard/orders"),
                            },
                        });
                        // Play a subtle sound if possible
                        try {
                            const audio = new Audio('https://assets.mixkit.co/active_storage/sfx/2358/2358-preview.mp3');
                            audio.play();
                        } catch (e) {
                            console.log("Audio play blocked");
                        }
                    }
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [storeId]);

    const markAsRead = async (id: string) => {
        const { error } = await supabase
            .from("notifications")
            .update({ is_read: true })
            .eq("id", id);

        if (!error) {
            setNotifications(prev =>
                prev.map(n => n.id === id ? { ...n, is_read: true } : n)
            );
            setUnreadCount(prev => Math.max(0, prev - 1));
        }
    };

    const markAllAsRead = async () => {
        if (!storeId) return;
        const { error } = await supabase
            .from("notifications")
            .update({ is_read: true })
            .eq("store_id", storeId)
            .eq("is_read", false);

        if (!error) {
            setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
            setUnreadCount(0);
            toast.success("تم تحديد الجميع كمقروء");
        }
    };

    const deleteNotification = async (id: string, e: React.MouseEvent) => {
        e.stopPropagation();
        const { error } = await supabase
            .from("notifications")
            .delete()
            .eq("id", id);

        if (!error) {
            setNotifications(prev => prev.filter(n => n.id !== id));
            // Recalculate unread if needed, but filter takes care of it visually
            fetchNotifications();
        }
    };

    return (
        <Popover>
            <PopoverTrigger asChild>
                <Button variant="ghost" size="icon" className="relative">
                    <Bell className="h-5 w-5" />
                    {unreadCount > 0 && (
                        <Badge
                            variant="destructive"
                            className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 rounded-full animate-pulse-slow"
                        >
                            {unreadCount}
                        </Badge>
                    )}
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80 p-0" align="end">
                <div className="flex items-center justify-between p-4 border-b">
                    <h3 className="font-bold">الإشعارات</h3>
                    {unreadCount > 0 && (
                        <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 text-xs text-primary"
                            onClick={markAllAsRead}
                        >
                            تحديد الكل كمقروء
                        </Button>
                    )}
                </div>
                <ScrollArea className="h-80">
                    {notifications.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-full p-8 text-muted-foreground opacity-50">
                            <Bell className="h-10 w-10 mb-2" />
                            <p className="text-sm">لا توجد إشعارات حالياً</p>
                        </div>
                    ) : (
                        <div className="flex flex-col">
                            {notifications.map((n) => (
                                <div
                                    key={n.id}
                                    className={cn(
                                        "p-4 border-b transition-colors cursor-pointer hover:bg-accent/50 relative group",
                                        !n.is_read && "bg-primary/5"
                                    )}
                                    onClick={() => {
                                        if (!n.is_read) markAsRead(n.id);
                                        navigate("/store-dashboard/orders");
                                    }}
                                >
                                    <div className="flex gap-3">
                                        <div className={cn(
                                            "mt-1 p-2 rounded-full",
                                            n.type === 'new_order' ? "bg-green-100 text-green-600" : "bg-blue-100 text-blue-600"
                                        )}>
                                            <Package className="h-4 w-4" />
                                        </div>
                                        <div className="flex-1 space-y-1">
                                            <div className="flex items-center justify-between">
                                                <p className={cn("text-sm font-bold", !n.is_read && "text-primary")}>
                                                    {n.title}
                                                </p>
                                                <span className="text-[10px] text-muted-foreground">
                                                    {formatDistanceToNow(new Date(n.created_at), { addSuffix: true, locale: arDZ })}
                                                </span>
                                            </div>
                                            <p className="text-xs text-muted-foreground line-clamp-2">
                                                {n.message}
                                            </p>
                                        </div>
                                    </div>
                                    <button
                                        onClick={(e) => deleteNotification(n.id, e)}
                                        className="absolute top-2 left-2 p-1 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity hover:text-destructive"
                                    >
                                        <Trash2 className="h-3 w-3" />
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                </ScrollArea>
                <div className="p-2 border-t text-center">
                    <Button variant="ghost" className="w-full h-8 text-xs text-muted-foreground" disabled>
                        مشاهدة جميع الإشعارات
                    </Button>
                </div>
            </PopoverContent>
        </Popover>
    );
};
