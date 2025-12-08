import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import { toast } from "sonner";

export function InstallPWA() {
    const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
    const [isInstallable, setIsInstallable] = useState(false);

    useEffect(() => {
        const handler = (e: any) => {
            e.preventDefault();
            setDeferredPrompt(e);
            setIsInstallable(true);
        };

        window.addEventListener("beforeinstallprompt", handler);

        return () => {
            window.removeEventListener("beforeinstallprompt", handler);
        };
    }, []);

    const handleInstallClick = async () => {
        if (!deferredPrompt) return;

        deferredPrompt.prompt();
        const { outcome } = await deferredPrompt.userChoice;

        if (outcome === 'accepted') {
            setDeferredPrompt(null);
            setIsInstallable(false);
            toast.success("شكراً لتثبيت التطبيق!");
        }
    };

    if (!isInstallable) return null;

    return (
        <Button
            onClick={handleInstallClick}
            className="fixed bottom-24 left-4 z-50 rounded-full shadow-2xl animate-fade-in bg-primary text-primary-foreground hover:scale-105 transition-transform"
            size="lg"
        >
            <Download className="ml-2 h-5 w-5" />
            تثبيت التطبيق
        </Button>
    );
}
