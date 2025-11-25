import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Package, ShoppingCart, DollarSign } from "lucide-react";

export default function StoreOwnerDashboard() {
    return (
        <div className="p-8">
            <h1 className="text-3xl font-bold mb-8 text-primary">لوحة تحكم المحل</h1>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium">منتجاتي</CardTitle>
                        <Package className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">45</div>
                        <p className="text-xs text-muted-foreground">منتج نشط</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium">الطلبات</CardTitle>
                        <ShoppingCart className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">23</div>
                        <p className="text-xs text-muted-foreground">طلب جديد</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium">المبيعات</CardTitle>
                        <DollarSign className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">125,000 دج</div>
                        <p className="text-xs text-muted-foreground">هذا الشهر</p>
                    </CardContent>
                </Card>
            </div>

            {/* Recent Orders */}
            <Card>
                <CardHeader>
                    <CardTitle>آخر الطلبات</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        {[1, 2, 3, 4, 5].map((i) => (
                            <div key={i} className="flex items-center justify-between border-b pb-4 last:border-0">
                                <div>
                                    <p className="font-medium">طلب #{2000 + i}</p>
                                    <p className="text-sm text-muted-foreground">منذ {i} ساعات</p>
                                </div>
                                <div className="text-left">
                                    <p className="font-medium">{(i * 2000)} دج</p>
                                    <p className="text-sm text-muted-foreground">قيد المعالجة</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
