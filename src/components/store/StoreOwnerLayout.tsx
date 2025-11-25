import { Outlet } from "react-router-dom";
import { StoreOwnerSidebar } from "@/components/store/StoreOwnerSidebar";

export const StoreOwnerLayout = () => {
    return (
        <div className="flex h-screen">
            <StoreOwnerSidebar />
            <main className="flex-1 overflow-y-auto bg-accent/30">
                <Outlet />
            </main>
        </div>
    );
};
