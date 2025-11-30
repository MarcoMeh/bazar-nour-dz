import { Outlet } from "react-router-dom";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Menu } from "lucide-react";
import { useState } from "react";

export const AdminLayout = () => {
  const [open, setOpen] = useState(false);

  return (
    <div className="flex h-screen w-full">
      {/* Desktop Sidebar */}
      <div className="hidden md:block w-64 border-l bg-card">
        <AdminSidebar />
      </div>

      {/* Mobile Sidebar (Sheet) */}
      <div className="md:hidden fixed top-4 right-4 z-50">
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger asChild>
            <Button variant="outline" size="icon" className="bg-background">
              <Menu className="h-5 w-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side="right" className="p-0 w-64">
            <AdminSidebar />
          </SheetContent>
        </Sheet>
      </div>

      <main className="flex-1 overflow-y-auto bg-accent/30 w-full">
        <div className="md:hidden h-16" /> {/* Spacer for mobile header button */}
        <Outlet />
      </main>
    </div>
  );
};
