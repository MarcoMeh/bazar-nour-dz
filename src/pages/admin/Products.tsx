import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";

export default function AdminProducts() {
    const [open, setOpen] = useState(false);

    return (
        <div className="p-8">
            <div className="flex items-center justify-between mb-8">
                <h1 className="text-3xl font-bold text-primary">إدارة المنتجات</h1>
                <Dialog open={open} onOpenChange={setOpen}>
                    <DialogTrigger asChild>
                        <Button>
                            <Plus className="ml-2 h-4 w-4" />
                            إضافة منتج
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                        <DialogHeader>
                            <DialogTitle>إضافة منتج جديد</DialogTitle>
                            <DialogDescription>
                                أدخل تفاصيل المنتج الجديد
                            </DialogDescription>
                        </DialogHeader>
                        <div className="grid gap-4 py-4">
                            <div className="grid gap-2">
                                <Label htmlFor="name">اسم المنتج</Label>
                                <Input id="name" placeholder="أدخل اسم المنتج" />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="description">الوصف</Label>
                                <Textarea id="description" placeholder="أدخل وصف المنتج" />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="grid gap-2">
                                    <Label htmlFor="price">السعر (دج)</Label>
                                    <Input id="price" type="number" placeholder="0" />
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="category">الفئة الفرعية</Label>
                                    <Select>
                                        <SelectTrigger>
                                            <SelectValue placeholder="اختر الفئة" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="1">ملابس رجالية</SelectItem>
                                            <SelectItem value="2">ملابس نسائية</SelectItem>
                                            <SelectItem value="3">هواتف</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="supplier">المورد (المحل)</Label>
                                <Select>
                                    <SelectTrigger>
                                        <SelectValue placeholder="اختر المحل" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="none">بدون مورد</SelectItem>
                                        <SelectItem value="1">محل 1</SelectItem>
                                        <SelectItem value="2">محل 2</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="image">رابط الصورة</Label>
                                <Input id="image" placeholder="https://..." />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="flex items-center justify-between">
                                    <Label htmlFor="has-colors">تفعيل الألوان</Label>
                                    <Switch id="has-colors" />
                                </div>
                                <div className="flex items-center justify-between">
                                    <Label htmlFor="has-sizes">تفعيل المقاسات</Label>
                                    <Switch id="has-sizes" />
                                </div>
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="delivery">نوع التوصيل</Label>
                                <Select>
                                    <SelectTrigger>
                                        <SelectValue placeholder="اختر نوع التوصيل" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="free">مجاني</SelectItem>
                                        <SelectItem value="home">متاح للمنزل</SelectItem>
                                        <SelectItem value="desktop">متاح للمكتب</SelectItem>
                                        <SelectItem value="sold-out">نفذت الكمية</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                        <DialogFooter>
                            <Button type="submit">حفظ المنتج</Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>قائمة المنتجات</CardTitle>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>الصورة</TableHead>
                                <TableHead>الاسم</TableHead>
                                <TableHead>الفئة</TableHead>
                                <TableHead>السعر</TableHead>
                                <TableHead>المحل</TableHead>
                                <TableHead>الحالة</TableHead>
                                <TableHead>الإجراءات</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {[1, 2, 3, 4, 5].map((i) => (
                                <TableRow key={i}>
                                    <TableCell>
                                        <div className="w-12 h-12 bg-muted rounded"></div>
                                    </TableCell>
                                    <TableCell className="font-medium">منتج {i}</TableCell>
                                    <TableCell>ملابس</TableCell>
                                    <TableCell>{i * 1000} دج</TableCell>
                                    <TableCell>محل {i}</TableCell>
                                    <TableCell>
                                        <span className="inline-flex items-center rounded-full px-2 py-1 text-xs font-medium bg-green-100 text-green-700">
                                            نشط
                                        </span>
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex gap-2">
                                            <Button variant="ghost" size="icon">
                                                <Pencil className="h-4 w-4" />
                                            </Button>
                                            <Button variant="ghost" size="icon">
                                                <Trash2 className="h-4 w-4 text-destructive" />
                                            </Button>
                                        </div>
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
