import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Download, Share, PlusSquare, X } from "lucide-react";
import { toast } from "sonner";

export function InstallPWA() {
    const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
    const [isInstallable, setIsInstallable] = useState(false);
    const [showIOSInstructions, setShowIOSInstructions] = useState(false);
    const [isIOS, setIsIOS] = useState(false);
    const [isAppInstalled, setIsAppInstalled] = useState(false);

    useEffect(() => {
        // Check if app is already installed/running in standalone mode
        if (window.matchMedia('(display-mode: standalone)').matches || (window.navigator as any).standalone) {
            setIsAppInstalled(true);
            return;
        }

        const handler = (e: any) => {
            e.preventDefault();
            setDeferredPrompt(e);
            setIsInstallable(true);
        };

        // iOS detection
        const isIOSDevice = /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream;
        setIsIOS(isIOSDevice);

        if (isIOSDevice) {
            // Check if we should show iOS instructions (e.g., first time or after some delay)
            const hasSeenInstructions = localStorage.getItem('pwa_ios_instructions_seen');
            if (!hasSeenInstructions) {
                setIsInstallable(true);
            }
        }

        window.addEventListener("beforeinstallprompt", handler);

        return () => {
            window.removeEventListener("beforeinstallprompt", handler);
        };
    }, []);

    const handleInstallClick = async () => {
        if (isIOS) {
            setShowIOSInstructions(true);
            return;
        }

        if (!deferredPrompt) return;

        deferredPrompt.prompt();
        const { outcome } = await deferredPrompt.userChoice;

        if (outcome === 'accepted') {
            setDeferredPrompt(null);
            setIsInstallable(false);
            toast.success("شكراً لتثبيت التطبيق!");
        }
    };

    const closeIOSInstructions = () => {
        setShowIOSInstructions(false);
        setIsInstallable(false);
        localStorage.setItem('pwa_ios_instructions_seen', 'true');
    };

    if (isAppInstalled || !isInstallable) return null;

    return (
        <>
            <Button
                onClick={handleInstallClick}
                className="fixed bottom-24 left-4 z-50 rounded-full shadow-2xl animate-fade-in bg-primary text-primary-foreground hover:scale-105 transition-transform group overflow-hidden pr-6 pl-5"
                size="lg"
            >
                <div className="absolute inset-0 bg-gradient-to-r from-secondary/20 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000"></div>
                <Download className="ml-2 h-5 w-5 animate-bounce" />
                تثبيت التطبيق
            </Button>

            {/* iOS Instructions Dialog/Overlay */}
            {showIOSInstructions && (
                <div className="fixed inset-0 z-[100] flex items-end justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in transition-all">
                    <div className="bg-white w-full max-w-sm rounded-[2rem] p-8 shadow-2xl flex flex-col items-center gap-6 animate-in slide-in-from-bottom-10">
                        <div className="flex justify-between w-full items-start">
                            <button onClick={closeIOSInstructions} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                                <X className="h-6 w-6 text-gray-400" />
                            </button>
                            <div className="bg-primary/10 p-4 rounded-2xl">
                                <Download className="h-8 w-8 text-primary" />
                            </div>
                            <div className="w-10"></div> {/* Spacer */}
                        </div>

                        <div className="text-center space-y-2">
                            <h3 className="text-2xl font-black text-gray-900 leading-tight">تثبيت بازارنا على iPhone</h3>
                            <p className="text-gray-500 font-medium">اتبع هذه الخطوات البسيطة للوصول السريع للمتجر</p>
                        </div>

                        <div className="w-full space-y-4 bg-gray-50 p-6 rounded-2xl border border-gray-100">
                            <div className="flex items-center gap-4 text-right">
                                <div className="flex-1">
                                    <p className="font-bold text-gray-800">1. اضغط على زر المشاركة</p>
                                    <p className="text-xs text-gray-500">موجود في أسفل المتصفح</p>
                                </div>
                                <div className="bg-white p-2 rounded-lg shadow-sm">
                                    <Share className="h-6 w-6 text-blue-500" />
                                </div>
                            </div>

                            <div className="w-full h-px bg-gray-200"></div>

                            <div className="flex items-center gap-4 text-right">
                                <div className="flex-1">
                                    <p className="font-bold text-gray-800">2. اختر "إضافة إلى الشاشة الرئيسية"</p>
                                    <p className="text-xs text-gray-500">Add to Home Screen</p>
                                </div>
                                <div className="bg-white p-2 rounded-lg shadow-sm">
                                    <PlusSquare className="h-6 w-6 text-gray-800" />
                                </div>
                            </div>
                        </div>

                        <Button
                            onClick={closeIOSInstructions}
                            className="w-full h-14 rounded-2xl font-black text-lg shadow-xl shadow-primary/20"
                        >
                            فهمت ذلك
                        </Button>
                    </div>
                </div>
            )}
        </>
    );
}

