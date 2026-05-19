import * as React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Smartphone, Download, Share2, Plus, Info, Check, ArrowDown } from "lucide-react";

interface PWAInstallDialogProps {
  isOpen: boolean;
  onClose: () => void;
  deferredPrompt: any;
  onInstallSuccess: () => void;
}

export const PWAInstallDialog: React.FC<PWAInstallDialogProps> = ({
  isOpen,
  onClose,
  deferredPrompt,
  onInstallSuccess,
}) => {
  const [isIOSDevice, setIsIOSDevice] = React.useState(false);
  const [isStandalone, setIsStandalone] = React.useState(false);

  React.useEffect(() => {
    // Detect if running as a standalone PWA
    const checkStandalone = 
      window.matchMedia('(display-mode: standalone)').matches || 
      (window.navigator as any).standalone === true;
    
    setIsStandalone(checkStandalone);

    // Detect if the device is iOS (iPhone/iPad/iPod)
    const checkIOS = () => {
      const userAgent = window.navigator.userAgent.toLowerCase();
      return /iphone|ipad|ipod/.test(userAgent) || 
             (userAgent.includes("mac") && "ontouchend" in document);
    };
    setIsIOSDevice(checkIOS());
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;
    
    // Show native PWA installation prompt
    deferredPrompt.prompt();
    
    // Wait for the user to respond to the prompt
    const { outcome } = await deferredPrompt.userChoice;
    console.log(`User response to install prompt: ${outcome}`);
    
    if (outcome === 'accepted') {
      onInstallSuccess();
    }
    
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-[90%] sm:max-w-md bg-black/90 backdrop-blur-2xl border border-white/10 text-white rounded-2xl p-6">
        <DialogHeader className="text-right pb-4 border-b border-white/10">
          <DialogTitle className="text-xl font-black bg-clip-text text-transparent bg-gradient-to-r from-primary to-indigo-400 flex items-center gap-2 justify-end">
            <span>تحميل تطبيق بازارنا</span>
            <Smartphone className="h-6 w-6 text-primary" />
          </DialogTitle>
          <DialogDescription className="text-white/60 text-xs text-right mt-1">
            استمتع بتجربة تسوق أسرع وأسلس مباشرة من شاشة هاتفك الرئيسية
          </DialogDescription>
        </DialogHeader>

        {isStandalone ? (
          /* Already Installed Screen */
          <div className="flex flex-col items-center justify-center py-8 text-center space-y-4">
            <div className="h-16 w-16 rounded-full bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center">
              <Check className="h-8 w-8 text-emerald-400" />
            </div>
            <h3 className="font-bold text-lg">التطبيق مثبت بالفعل!</h3>
            <p className="text-sm text-white/50 max-w-xs">
              أنت تستخدم تطبيق بازارنا بالفعل على شاشتك الرئيسية. تسوقاً ممتعاً!
            </p>
            <Button onClick={onClose} className="w-full bg-primary hover:bg-primary/95 text-white font-bold rounded-xl mt-4">
              إغلاق
            </Button>
          </div>
        ) : isIOSDevice ? (
          /* iOS Safari Specific Guide */
          <div className="space-y-6 pt-4 text-right" dir="rtl">
            <div className="bg-primary/10 border border-primary/20 rounded-xl p-3 flex items-start gap-3">
              <Info className="h-5 w-5 text-primary shrink-0 mt-0.5" />
              <p className="text-xs text-white/80 leading-relaxed">
                متصفح Safari على هواتف iPhone لا يدعم التحميل المباشر بنقرة واحدة، ولكن يمكنك تثبيته بسهولة بالغة باتباع الخطوات التالية:
              </p>
            </div>

            <div className="space-y-4">
              {/* Step 1 */}
              <div className="flex gap-4 items-start">
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-white/10 text-xs font-bold text-primary border border-white/20">
                  1
                </span>
                <div className="space-y-1">
                  <p className="text-sm font-semibold text-white">اضغط على زر المشاركة (Share)</p>
                  <p className="text-xs text-white/50 flex items-center gap-1.5 justify-end">
                    <span>ابحث عن أيقونة المشاركة في شريط سفاري السفلي</span>
                    <Share2 className="h-3.5 w-3.5 text-primary" />
                  </p>
                </div>
              </div>

              {/* Step 2 */}
              <div className="flex gap-4 items-start">
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-white/10 text-xs font-bold text-primary border border-white/20">
                  2
                </span>
                <div className="space-y-1">
                  <p className="text-sm font-semibold text-white">اختر "إضافة إلى الشاشة الرئيسية"</p>
                  <p className="text-xs text-white/50 flex items-center gap-1.5 justify-end">
                    <span>اسحب قائمة الخيارات لأسفل واضغط على</span>
                    <span className="bg-white/10 px-1.5 py-0.5 rounded text-white text-[10px] font-bold border border-white/10 flex items-center gap-1">
                      إضافة للشاشة الرئيسية <Plus className="h-3 w-3" />
                    </span>
                  </p>
                </div>
              </div>

              {/* Step 3 */}
              <div className="flex gap-4 items-start">
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-white/10 text-xs font-bold text-primary border border-white/20">
                  3
                </span>
                <div className="space-y-1">
                  <p className="text-sm font-semibold text-white">أكّد عملية التثبيت</p>
                  <p className="text-xs text-white/50">
                    اضغط على زر **"إضافة" (Add)** المتواجد في الزاوية العلوية اليمنى.
                  </p>
                </div>
              </div>
            </div>

            <Button onClick={onClose} className="w-full bg-primary hover:bg-primary/95 text-white font-bold rounded-xl mt-4">
              فهمت، سأقوم بالتثبيت الآن
            </Button>
          </div>
        ) : deferredPrompt ? (
          /* Android / Chrome Native Prompt View */
          <div className="space-y-6 pt-4 text-center">
            <div className="flex justify-center py-4">
              <div className="h-20 w-20 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center animate-bounce">
                <Download className="h-10 w-10 text-primary" />
              </div>
            </div>
            <div className="space-y-2">
              <h3 className="font-bold text-lg">تثبيت التطبيق بنقرة واحدة</h3>
              <p className="text-sm text-white/60 max-w-xs mx-auto">
                اضغط على الزر أدناه لتثبيت بازارنا مباشرة على جهازك كـ تطبيق خفيف وسريع.
              </p>
            </div>
            <div className="flex flex-col gap-2 pt-2">
              <Button onClick={handleInstallClick} className="w-full bg-primary hover:bg-primary/95 text-white font-bold rounded-xl py-6 text-base">
                تحميل وتثبيت التطبيق
              </Button>
              <Button onClick={onClose} variant="ghost" className="w-full text-white/50 hover:text-white">
                إلغاء
              </Button>
            </div>
          </div>
        ) : (
          /* Fallback for other browsers when prompt event not available */
          <div className="space-y-6 pt-4 text-right" dir="rtl">
            <div className="bg-primary/10 border border-primary/20 rounded-xl p-3 flex items-start gap-3">
              <Info className="h-5 w-5 text-primary shrink-0 mt-0.5" />
              <p className="text-xs text-white/80 leading-relaxed">
                يبدو أن متصفحك الحالي لا يدعم التثبيت التلقائي بنقرة واحدة، ولكن لا يزال بإمكانك تثبيته يدوياً:
              </p>
            </div>
            
            <div className="space-y-4">
              <div className="flex gap-4 items-start">
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-white/10 text-xs font-bold text-primary border border-white/20">
                  1
                </span>
                <div className="space-y-1">
                  <p className="text-sm font-semibold text-white">افتح قائمة خيارات المتصفح</p>
                  <p className="text-xs text-white/50">اضغط على زر النقاط الثلاث أو الخطوط الثلاثة في متصفحك.</p>
                </div>
              </div>

              <div className="flex gap-4 items-start">
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-white/10 text-xs font-bold text-primary border border-white/20">
                  2
                </span>
                <div className="space-y-1">
                  <p className="text-sm font-semibold text-white">اضغط على خيار التثبيت</p>
                  <p className="text-xs text-white/50 flex items-center gap-1 justify-end">
                    <span>ابحث عن خيار</span>
                    <span className="bg-white/10 px-1 py-0.5 rounded text-[10px] text-white font-bold border border-white/5">تثبيت التطبيق</span>
                    <span>أو</span>
                    <span className="bg-white/10 px-1 py-0.5 rounded text-[10px] text-white font-bold border border-white/5">إضافة للشاشة الرئيسية</span>
                  </p>
                </div>
              </div>
            </div>

            <Button onClick={onClose} className="w-full bg-primary hover:bg-primary/95 text-white font-bold rounded-xl mt-4">
              حسناً
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};
