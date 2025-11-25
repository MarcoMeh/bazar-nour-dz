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
import { Switch } from "@/components/ui/switch";

export default function AdminStores() {
    const [open, setOpen] = useState(false);

    return (
        <div className="p-8">
            <div className="flex items-center justify-between mb-8">
                <h1 className="text-3xl font-bold text-primary">إدارة المحلات</h1>
                <Dialog open={open} onOpenChange={setOpen}>
                    <DialogTrigger asChild>
                        <Button>
                            <Plus className="ml-2 h-4 w-4" />
                            إضافة محل
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-2xl">
                        <DialogHeader>
                            <DialogTitle>إضافة محل جديد</DialogTitle>
                            <DialogDescription>
                                أدخل تفاصيل المحل وصاحبه
                            </DialogDescription>
                        </DialogHeader>
                        <div className="grid gap-4 py-4">
                            <div className="grid gap-2">
                                <Label htmlFor="store-name">اسم المحل</Label>
                                <Input id="store-name" placeholder="أدخل اسم المحل" />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="owner-name">اسم صاحب المحل</Label>
                                <Input id="owner-name" placeholder="الاسم الكامل" />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="grid gap-2">
                                    <Label htmlFor="email">البريد الإلكتروني</Label>
                                    <Input id="email" type="email" placeholder="email@example.com" dir="ltr" />
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="phone">رقم الهاتف</Label>
                                    <Input id="phone" placeholder="0555123456" dir="ltr" />
                                </div>
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="password">كلمة المرور</Label>
                                <Input id="password" type="password" dir="ltr" />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="address">العنوان</Label>
                                <Input id="address" placeholder="العنوان الكامل" />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="store-image">رابط صورة المحل</Label>
                                <Input id="store-image" placeholder="https://..." />
                            </div>
                        </div>
                        <DialogFooter>
                            <Button type="submit">حفظ المحل</Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>قائمة المحلات</CardTitle>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>الصورة</TableHead>
                                <TableHead>اسم المحل</TableHead>
                                <TableHead>صاحب المحل</TableHead>
                                <TableHead>البريد الإلكتروني</TableHead>
                                <TableHead>الهاتف</TableHead>
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
                                    <TableCell className="font-medium">محل {i}</TableCell>
                                    <TableCell>صاحب المحل {i}</TableCell>
                                    <TableCell dir="ltr" className="text-right">owner{i}@example.com</TableCell>
                                    <TableCell dir="ltr" className="text-right">0555{i}23456</TableCell>
                                    <TableCell>
                                        <Switch defaultChecked={i % 2 === 0} />
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
