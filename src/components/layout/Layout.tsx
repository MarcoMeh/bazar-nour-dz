import { Outlet } from "react-router-dom";
import { Navbar } from "./Navbar";
import { Footer } from "./Footer";
import { MobileNav } from "./MobileNav";

export const Layout = () => {
    return (
        <div className="flex min-h-screen flex-col pb-16 md:pb-0 overflow-x-hidden max-w-full">
            <Navbar />
            <main className="flex-1 w-full max-w-full overflow-x-hidden">
                <Outlet />
            </main>
            <Footer />
            <MobileNav />
        </div>
    );
};
