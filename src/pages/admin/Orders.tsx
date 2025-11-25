import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Eye } from "lucide-react";

export default function AdminOrders() {
    return (
        <div className="p-8">
            <h1 className="text-3xl font-bold mb-8 text-primary">إدارة الطلبات</h1>

            <Card>
                <CardHeader>
                    <CardTitle>قائمة الطلبات</CardTitle>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>رقم الطلب</TableHead>
                                <TableHead>العميل</TableHead>
                                <TableHead>المحل</TableHead>
                                <TableHead>الولاية</TableHead>
                                <TableHead>المبلغ</TableHead>
                                <TableHead>الحالة</TableHead>
                                <TableHead>التاريخ</TableHead>
                                <TableHead>الإجراءات</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                                <TableRow key={i}>
                                    <TableCell className="font-medium">#{1000 + i}</TableCell>
                                    <TableCell>عميل {i}</TableCell>
                                    <TableCell>محل {i}</TableCell>
                                    <TableCell>الجزائر</TableCell>
                                    <TableCell>{i * 1500} دج</TableCell>
                                    <TableCell>
                                        <Select defaultValue="pending">
                                            <SelectTrigger className="w-[140px]">
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="pending">قيد الانتظار</SelectItem>
                                                <SelectItem value="processing">قيد المعالجة</SelectItem>
                                                <SelectItem value="shipped">تم الشحن</SelectItem>
                                                <SelectItem value="delivered">تم التوصيل</SelectItem>
                                                <SelectItem value="cancelled">ملغي</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </TableCell>
                                    <TableCell>2025-11-{20 + i}</TableCell>
                                    <TableCell>
                                        <Button variant="ghost" size="icon">
                                            <Eye className="h-4 w-4" />
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    );
}
