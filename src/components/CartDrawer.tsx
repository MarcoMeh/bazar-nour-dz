import { Link } from "react-router-dom";
import { ShoppingCart, Plus, Minus, Trash2, ArrowLeft, Store, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
} from "@/components/ui/sheet";
import { useCart } from "@/contexts/CartContext";

interface CartDrawerProps {
    useDarkText: boolean;
}

export function CartDrawer({ useDarkText }: CartDrawerProps) {
    const { items, totalItems, totalPrice, updateQuantity, removeItem } = useCart();

    return (
        <Sheet>
            <SheetTrigger asChild>
                <Button
                    variant="ghost"
                    size="icon"
                    className={`relative transition-all rounded-xl h-10 w-10 ${useDarkText ? "text-gray-900 hover:bg-black/5" : "text-white hover:bg-white/20"}`}
                >
                    <ShoppingCart className="h-6 w-6" strokeWidth={2.5} />
                    {totalItems > 0 && (
                        <span className="absolute -top-1 -right-1 bg-red-600 text-white text-[10px] font-bold h-4 w-4 rounded-full flex items-center justify-center animate-bounce">
                            {totalItems}
                        </span>
                    )}
                    <span className="sr-only">السلة</span>
                </Button>
            </SheetTrigger>
            
            <SheetContent side="right" className="w-full sm:max-w-md p-0 flex flex-col bg-slate-50 border-r-0">
                <SheetHeader className="p-6 bg-white border-b border-slate-100 shadow-sm z-10">
                    <SheetTitle className="flex items-center gap-2 text-2xl font-black text-slate-900">
                        <ShoppingCart className="h-6 w-6 text-primary" />
                        سلة المشتريات ({totalItems})
                    </SheetTitle>
                </SheetHeader>

                {/* Cart Items */}
                <div className="flex-1 overflow-y-auto p-6 space-y-4">
                    {items.length === 0 ? (
                        <div className="h-full flex flex-col items-center justify-center text-slate-400 space-y-4">
                            <ShoppingCart className="w-24 h-24 opacity-20" />
                            <p className="text-lg font-bold">السلة فارغة حالياً</p>
                        </div>
                    ) : (
                        items.map((item) => (
                            <div key={item.cartItemId} className="flex gap-4 bg-white p-4 rounded-2xl shadow-sm border border-slate-100 relative group transition-all hover:shadow-md">
                                {/* Image */}
                                <div className="h-24 w-24 rounded-xl overflow-hidden bg-slate-50 shrink-0">
                                    {item.image_url ? (
                                        <img src={item.image_url} alt={item.name_ar} className="h-full w-full object-cover" />
                                    ) : (
                                        <div className="h-full w-full flex items-center justify-center">
                                            <ShoppingCart className="h-8 w-8 text-slate-300" />
                                        </div>
                                    )}
                                </div>

                                {/* Info */}
                                <div className="flex-1 flex flex-col justify-between">
                                    <div>
                                        <h4 className="font-bold text-slate-900 line-clamp-2 leading-tight">{item.name_ar}</h4>
                                        {item.storeName && (
                                            <p className="text-xs text-slate-500 mt-1 flex items-center gap-1">
                                                <Store className="w-3 h-3" /> {item.storeName}
                                            </p>
                                        )}
                                        {/* Variants */}
                                        <div className="flex gap-2 mt-1">
                                            {item.size && <span className="text-[10px] bg-slate-100 px-2 py-0.5 rounded-md font-bold text-slate-600">{item.size}</span>}
                                            {item.color && <span className="text-[10px] bg-slate-100 px-2 py-0.5 rounded-md font-bold text-slate-600">{item.color}</span>}
                                        </div>
                                    </div>
                                    
                                    <div className="flex items-center justify-between mt-2">
                                        <p className="font-black text-slate-900 text-lg">
                                            {item.price.toLocaleString()} <span className="text-xs opacity-60">دج</span>
                                        </p>
                                        
                                        {/* Quantity Controls */}
                                        <div className="flex items-center gap-3 bg-slate-50 rounded-lg p-1 border border-slate-100">
                                            <button 
                                                onClick={() => updateQuantity(item.cartItemId, item.quantity - 1)}
                                                className="w-6 h-6 flex items-center justify-center rounded-md bg-white shadow-sm text-slate-600 hover:text-red-500 hover:bg-red-50 transition-colors active:scale-90"
                                            >
                                                {item.quantity <= 1 ? <Trash2 className="w-3 h-3" /> : <Minus className="w-3 h-3" />}
                                            </button>
                                            <span className="text-sm font-bold w-4 text-center">{item.quantity}</span>
                                            <button 
                                                onClick={() => updateQuantity(item.cartItemId, item.quantity + 1)}
                                                className="w-6 h-6 flex items-center justify-center rounded-md bg-white shadow-sm text-slate-600 hover:text-green-600 hover:bg-green-50 transition-colors active:scale-90"
                                            >
                                                <Plus className="w-3 h-3" />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>

                {/* Footer */}
                {items.length > 0 && (
                    <div className="bg-white p-6 border-t border-slate-100 shadow-[0_-10px_40px_rgba(0,0,0,0.05)] z-10">
                        <div className="flex items-center justify-between mb-4">
                            <span className="text-slate-500 font-bold">المجموع الكلي:</span>
                            <span className="text-2xl font-black text-slate-900">
                                {totalPrice.toLocaleString()} <span className="text-sm opacity-60">دج</span>
                            </span>
                        </div>
                        <div className="grid grid-cols-1 gap-3">
                            <Link to="/cart">
                                <Button className="w-full h-12 font-bold rounded-xl bg-indigo-600 hover:bg-indigo-700 shadow-lg shadow-indigo-200 gap-2 text-lg">
                                    تأكيد الطلب (الدفع) <ArrowLeft className="w-5 h-5" />
                                </Button>
                            </Link>
                        </div>
                    </div>
                )}
            </SheetContent>
        </Sheet>
    );
}
