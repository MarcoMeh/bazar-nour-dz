import { Outlet } from "react-router-dom";
import { Navbar } from "./Navbar";
import { Footer } from "./Footer";
import { InstallPWA } from "@/components/InstallPWA";
import { MobileNav } from "./MobileNav";

export const Layout = () => {
    return (
        <div className="flex min-h-screen flex-col pb-16 md:pb-0">
            <Navbar />
            <main className="flex-1">
                <Outlet />
            </main>
            <Footer />
            <InstallPWA />
            <MobileNav />
        </div>
    );
};
