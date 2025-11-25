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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Pencil, Trash2 } from "lucide-react";

export default function AdminCategories() {
    const [open, setOpen] = useState(false);

    return (
        <div className="p-8">
            <div className="flex items-center justify-between mb-8">
                <h1 className="text-3xl font-bold text-primary">إدارة التصنيفات</h1>
                <Dialog open={open} onOpenChange={setOpen}>
                    <DialogTrigger asChild>
                        <Button>
                            <Plus className="ml-2 h-4 w-4" />
                            إضافة تصنيف
                        </Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>إضافة تصنيف جديد</DialogTitle>
                            <DialogDescription>
                                أدخل تفاصيل التصنيف الجديد
                            </DialogDescription>
                        </DialogHeader>
                        <div className="grid gap-4 py-4">
                            <div className="grid gap-2">
                                <Label htmlFor="cat-name">اسم التصنيف الرئيسي</Label>
                                <Input id="cat-name" placeholder="مثال: ملابس" />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="cat-image">رابط الصورة</Label>
                                <Input id="cat-image" placeholder="https://..." />
                            </div>
                        </div>
                        <DialogFooter>
                            <Button type="submit">حفظ التصنيف</Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>

            <div className="grid gap-6">
                {/* Main Categories */}
                <Card>
                    <CardHeader>
                        <CardTitle>التصنيفات الرئيسية</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>الاسم</TableHead>
                                    <TableHead>عدد الفئات الفرعية</TableHead>
                                    <TableHead>الإجراءات</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {["ملابس", "إلكترونيات", "ديكور", "مواد تجميل"].map((cat, i) => (
                                    <TableRow key={i}>
                                        <TableCell className="font-medium">{cat}</TableCell>
                                        <TableCell>{(i + 1) * 3}</TableCell>
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

                {/* Subcategories */}
                <Card>
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <CardTitle>الفئات الفرعية</CardTitle>
                            <Button variant="outline" size="sm">
                                <Plus className="ml-2 h-4 w-4" />
                                إضافة فئة فرعية
                            </Button>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>الاسم</TableHead>
                                    <TableHead>التصنيف الرئيسي</TableHead>
                                    <TableHead>عدد المنتجات</TableHead>
                                    <TableHead>الإجراءات</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {[
                                    { name: "ملابس رجالية", parent: "ملابس", count: 45 },
                                    { name: "ملابس نسائية", parent: "ملابس", count: 67 },
                                    { name: "هواتف", parent: "إلكترونيات", count: 23 },
                                    { name: "حواسيب", parent: "إلكترونيات", count: 12 },
                                ].map((sub, i) => (
                                    <TableRow key={i}>
                                        <TableCell className="font-medium">{sub.name}</TableCell>
                                        <TableCell>{sub.parent}</TableCell>
                                        <TableCell>{sub.count}</TableCell>
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
        </div>
    );
}
