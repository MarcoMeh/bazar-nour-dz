import { Outlet, Link, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { LogOut, Package, ShoppingBag, User } from "lucide-react";
import { toast } from "sonner";
import logo from "@/assets/bazzarna-logo.jpeg";

export const StoreOwnerLayout = () => {
    const navigate = useNavigate();
    const [storeName, setStoreName] = useState<string>("");

    useEffect(() => {
        fetchStoreInfo();
    }, []);

    const fetchStoreInfo = async () => {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const { data: profile } = await supabase
            .from("profiles")
            .select("store_id, stores(name)")
            .eq("id", user.id)
            .single();

        if ((profile as any)?.stores) {
            setStoreName(((profile as any).stores as any).name || "محلي");
        }
    };

    const handleLogout = async () => {
        await supabase.auth.signOut();
        toast.success("تم تسجيل الخروج بنجاح");
        navigate("/login");
    };

    return (
        <div className="min-h-screen bg-background">
            {/* Header */}
            <header className="border-b bg-card sticky top-0 z-50">
                <div className="container mx-auto px-4 py-4 flex justify-between items-center">
                    <div className="flex items-center gap-4">
                        <img src={logo} alt="Bazzarna" className="h-12" />
                        <div>
                            <h1 className="text-xl font-bold">{storeName}</h1>
                            <p className="text-sm text-muted-foreground">لوحة تحكم المحل</p>
                        </div>
                    </div>
                    <Button variant="ghost" onClick={handleLogout}>
                        <LogOut className="ml-2 h-4 w-4" />
                        تسجيل الخروج
                    </Button>
                </div>
            </header>

            {/* Navigation */}
            <nav className="border-b bg-card">
                <div className="container mx-auto px-4">
                    <div className="flex gap-6">
                        <Link
                            to="/store-dashboard"
                            className="py-4 px-2 border-b-2 border-transparent hover:border-primary transition-colors"
                        >
                            <div className="flex items-center gap-2">
                                <ShoppingBag className="h-4 w-4" />
                                <span>لوحة التحكم</span>
                            </div>
                        </Link>
                        <Link
                            to="/store-dashboard/products"
                            className="py-4 px-2 border-b-2 border-transparent hover:border-primary transition-colors"
                        >
                            <div className="flex items-center gap-2">
                                <Package className="h-4 w-4" />
                                <span>المنتجات</span>
                            </div>
                        </Link>
                        <Link
                            to="/store-dashboard/orders"
                            className="py-4 px-2 border-b-2 border-transparent hover:border-primary transition-colors"
                        >
                            <div className="flex items-center gap-2">
                                <ShoppingBag className="h-4 w-4" />
                                <span>الطلبات</span>
                            </div>
                        </Link>
                        <Link
                            to="/store-dashboard/profile"
                            className="py-4 px-2 border-b-2 border-transparent hover:border-primary transition-colors"
                        >
                            <div className="flex items-center gap-2">
                                <User className="h-4 w-4" />
                                <span>الملف الشخصي</span>
                            </div>
                        </Link>
                    </div>
                </div>
            </nav>

            {/* Main Content */}
            <main className="container mx-auto px-4 py-8">
                <Outlet />
            </main>
        </div>
    );
};
