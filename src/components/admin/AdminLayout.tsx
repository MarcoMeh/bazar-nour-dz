import { Outlet } from "react-router-dom";
import { AdminSidebar } from "@/components/admin/AdminSidebar";

export const AdminLayout = () => {
  return (
    <div className="flex h-screen">
      <AdminSidebar />
      <main className="flex-1 overflow-y-auto bg-accent/30">
        <Outlet />
      </main>
    </div>
  );
};
