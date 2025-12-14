import { Outlet } from "react-router-dom";
import { StoreOwnerSidebar } from "@/components/layout/StoreOwnerSidebar"; // تأكد أن المسار يطابق مكان ملفك
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Menu } from "lucide-react";
import { useState } from "react";

export const StoreOwnerLayout = () => {
    const [open, setOpen] = useState(false);

    return (
        <div className="flex h-screen w-full">
            {/* Desktop Sidebar */}
            {/* القائمة الثابتة للحاسوب: لا تحتاج لتمرير دالة الإغلاق */}
            <div className="hidden md:block w-64 border-l bg-card">
                <StoreOwnerSidebar />
            </div>

            {/* Mobile Sidebar (Sheet) */}
            <div className="md:hidden fixed top-4 right-4 z-50">
                <Sheet open={open} onOpenChange={setOpen}>
                    <SheetTrigger asChild>
                        <Button variant="outline" size="icon" className="bg-background shadow-sm">
                            <Menu className="h-5 w-5" />
                        </Button>
                    </SheetTrigger>

                    <SheetContent side="right" className="p-0 w-64">
                        {/* هنا نمرر دالة setOpen(false) لإغلاق القائمة عند اختيار رابط */}
                        <StoreOwnerSidebar onLinkClick={() => setOpen(false)} />
                    </SheetContent>
                </Sheet>
            </div>

            {/* Main Content Area */}
            <main className="flex-1 overflow-y-auto bg-accent/30 w-full">
                {/* Spacer for mobile header button area so content isn't hidden behind the button */}
                <div className="md:hidden h-16" />
                <Outlet />
            </main>
        </div>
    );
};