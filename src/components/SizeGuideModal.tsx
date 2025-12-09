import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";
import { Ruler } from "lucide-react";

interface SizeGuideModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    category?: 'mens' | 'womens' | 'kids' | 'shoes';
}

export const SizeGuideModal = ({ open, onOpenChange, category = 'mens' }: SizeGuideModalProps) => {
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2 text-2xl">
                        <Ruler className="h-6 w-6" />
                        دليل المقاسات
                    </DialogTitle>
                </DialogHeader>

                <Tabs defaultValue={category} className="w-full">
                    <TabsList className="grid w-full grid-cols-4">
                        <TabsTrigger value="mens">رجالي</TabsTrigger>
                        <TabsTrigger value="womens">نسائي</TabsTrigger>
                        <TabsTrigger value="kids">أطفال</TabsTrigger>
                        <TabsTrigger value="shoes">أحذية</TabsTrigger>
                    </TabsList>

                    {/* ملابس رجالية */}
                    <TabsContent value="mens" className="space-y-6">
                        <Card className="p-6">
                            <h3 className="text-lg font-bold mb-4">جدول المقاسات - ملابس رجالية</h3>
                            <div className="overflow-x-auto">
                                <table className="w-full border-collapse">
                                    <thead>
                                        <tr className="bg-muted">
                                            <th className="border p-3 text-right">المقاس</th>
                                            <th className="border p-3 text-right">الصدر (سم)</th>
                                            <th className="border p-3 text-right">الخصر (سم)</th>
                                            <th className="border p-3 text-right">الطول (سم)</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        <tr><td className="border p-3 font-semibold">XS</td><td className="border p-3">86-91</td><td className="border p-3">71-76</td><td className="border p-3">165-170</td></tr>
                                        <tr className="bg-muted/30"><td className="border p-3 font-semibold">S</td><td className="border p-3">91-96</td><td className="border p-3">76-81</td><td className="border p-3">170-175</td></tr>
                                        <tr><td className="border p-3 font-semibold">M</td><td className="border p-3">96-101</td><td className="border p-3">81-86</td><td className="border p-3">175-180</td></tr>
                                        <tr className="bg-muted/30"><td className="border p-3 font-semibold">L</td><td className="border p-3">101-106</td><td className="border p-3">86-91</td><td className="border p-3">180-185</td></tr>
                                        <tr><td className="border p-3 font-semibold">XL</td><td className="border p-3">106-111</td><td className="border p-3">91-97</td><td className="border p-3">185-190</td></tr>
                                        <tr className="bg-muted/30"><td className="border p-3 font-semibold">XXL</td><td className="border p-3">111-117</td><td className="border p-3">97-103</td><td className="border p-3">190-195</td></tr>
                                        <tr><td className="border p-3 font-semibold">XXXL</td><td className="border p-3">117-124</td><td className="border p-3">103-109</td><td className="border p-3">195-200</td></tr>
                                    </tbody>
                                </table>
                            </div>
                        </Card>

                        <Card className="p-6 bg-blue-50">
                            <h4 className="font-bold mb-3 flex items-center gap-2">
                                <Ruler className="h-5 w-5" />
                                كيفية أخذ القياسات
                            </h4>
                            <ul className="space-y-2 text-sm">
                                <li className="flex gap-2"><span className="font-bold">الصدر:</span> قس حول أوسع جزء من الصدر تحت الإبطين</li>
                                <li className="flex gap-2"><span className="font-bold">الخصر:</span> قس حول الخصر الطبيعي (فوق السرة قليلاً)</li>
                                <li className="flex gap-2"><span className="font-bold">الطول:</span> من أعلى الكتف إلى أسفل القدم</li>
                            </ul>
                        </Card>
                    </TabsContent>

                    {/* ملابس نسائية */}
                    <TabsContent value="womens" className="space-y-6">
                        <Card className="p-6">
                            <h3 className="text-lg font-bold mb-4">جدول المقاسات - ملابس نسائية</h3>
                            <div className="overflow-x-auto">
                                <table className="w-full border-collapse">
                                    <thead>
                                        <tr className="bg-muted">
                                            <th className="border p-3 text-right">المقاس</th>
                                            <th className="border p-3 text-right">الصدر (سم)</th>
                                            <th className="border p-3 text-right">الخصر (سم)</th>
                                            <th className="border p-3 text-right">الأرداف (سم)</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        <tr><td className="border p-3 font-semibold">XS</td><td className="border p-3">78-82</td><td className="border p-3">58-62</td><td className="border p-3">84-88</td></tr>
                                        <tr className="bg-muted/30"><td className="border p-3 font-semibold">S</td><td className="border p-3">82-86</td><td className="border p-3">62-66</td><td className="border p-3">88-92</td></tr>
                                        <tr><td className="border p-3 font-semibold">M</td><td className="border p-3">86-90</td><td className="border p-3">66-70</td><td className="border p-3">92-96</td></tr>
                                        <tr className="bg-muted/30"><td className="border p-3 font-semibold">L</td><td className="border p-3">90-94</td><td className="border p-3">70-75</td><td className="border p-3">96-100</td></tr>
                                        <tr><td className="border p-3 font-semibold">XL</td><td className="border p-3">94-99</td><td className="border p-3">75-80</td><td className="border p-3">100-105</td></tr>
                                        <tr className="bg-muted/30"><td className="border p-3 font-semibold">XXL</td><td className="border p-3">99-105</td><td className="border p-3">80-86</td><td className="border p-3">105-111</td></tr>
                                    </tbody>
                                </table>
                            </div>
                        </Card>

                        <Card className="p-6 bg-pink-50">
                            <h4 className="font-bold mb-3 flex items-center gap-2">
                                <Ruler className="h-5 w-5" />
                                كيفية أخذ القياسات
                            </h4>
                            <ul className="space-y-2 text-sm">
                                <li className="flex gap-2"><span className="font-bold">الصدر:</span> قسي حول أوسع جزء من الصدر</li>
                                <li className="flex gap-2"><span className="font-bold">الخصر:</span> قسي حول أضيق جزء من الخصر</li>
                                <li className="flex gap-2"><span className="font-bold">الأرداف:</span> قسي حول أوسع جزء من الأرداف</li>
                            </ul>
                        </Card>
                    </TabsContent>

                    {/* ملابس أطفال */}
                    <TabsContent value="kids" className="space-y-6">
                        <Card className="p-6">
                            <h3 className="text-lg font-bold mb-4">جدول المقاسات - ملابس أطفال</h3>
                            <div className="overflow-x-auto">
                                <table className="w-full border-collapse">
                                    <thead>
                                        <tr className="bg-muted">
                                            <th className="border p-3 text-right">العمر</th>
                                            <th className="border p-3 text-right">المقاس</th>
                                            <th className="border p-3 text-right">الطول (سم)</th>
                                            <th className="border p-3 text-right">الوزن (كغ)</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        <tr><td className="border p-3">0-3 أشهر</td><td className="border p-3 font-semibold">0-3M</td><td className="border p-3">50-62</td><td className="border p-3">3-6</td></tr>
                                        <tr className="bg-muted/30"><td className="border p-3">3-6 أشهر</td><td className="border p-3 font-semibold">3-6M</td><td className="border p-3">62-68</td><td className="border p-3">6-8</td></tr>
                                        <tr><td className="border p-3">6-12 شهر</td><td className="border p-3 font-semibold">6-12M</td><td className="border p-3">68-80</td><td className="border p-3">8-10</td></tr>
                                        <tr className="bg-muted/30"><td className="border p-3">1-2 سنة</td><td className="border p-3 font-semibold">1-2Y</td><td className="border p-3">80-92</td><td className="border p-3">10-13</td></tr>
                                        <tr><td className="border p-3">3-4 سنوات</td><td className="border p-3 font-semibold">3-4Y</td><td className="border p-3">92-104</td><td className="border p-3">13-17</td></tr>
                                        <tr className="bg-muted/30"><td className="border p-3">5-6 سنوات</td><td className="border p-3 font-semibold">5-6Y</td><td className="border p-3">104-116</td><td className="border p-3">17-21</td></tr>
                                        <tr><td className="border p-3">7-8 سنوات</td><td className="border p-3 font-semibold">7-8Y</td><td className="border p-3">116-128</td><td className="border p-3">21-26</td></tr>
                                        <tr className="bg-muted/30"><td className="border p-3">9-10 سنوات</td><td className="border p-3 font-semibold">9-10Y</td><td className="border p-3">128-140</td><td className="border p-3">26-32</td></tr>
                                        <tr><td className="border p-3">11-12 سنة</td><td className="border p-3 font-semibold">11-12Y</td><td className="border p-3">140-152</td><td className="border p-3">32-40</td></tr>
                                    </tbody>
                                </table>
                            </div>
                        </Card>

                        <Card className="p-6 bg-green-50">
                            <p className="text-sm text-muted-foreground">
                                💡 <span className="font-bold">نصيحة:</span> المقاسات تقريبية وقد تختلف حسب العلامة التجارية.
                                في حالة الشك، اختر المقاس الأكبر للسماح بالنمو.
                            </p>
                        </Card>
                    </TabsContent>

                    {/* أحذية */}
                    <TabsContent value="shoes" className="space-y-6">
                        <Card className="p-6">
                            <h3 className="text-lg font-bold mb-4">جدول مقاسات الأحذية</h3>
                            <div className="grid md:grid-cols-2 gap-6">
                                {/* رجالي ونسائي */}
                                <div>
                                    <h4 className="font-semibold mb-3">رجالي / نسائي</h4>
                                    <div className="overflow-x-auto">
                                        <table className="w-full border-collapse text-sm">
                                            <thead>
                                                <tr className="bg-muted">
                                                    <th className="border p-2 text-right">EU</th>
                                                    <th className="border p-2 text-right">UK</th>
                                                    <th className="border p-2 text-right">US</th>
                                                    <th className="border p-2 text-right">سم</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                <tr><td className="border p-2 font-semibold">36</td><td className="border p-2">3.5</td><td className="border p-2">5</td><td className="border p-2">23</td></tr>
                                                <tr className="bg-muted/30"><td className="border p-2 font-semibold">37</td><td className="border p-2">4</td><td className="border p-2">5.5</td><td className="border p-2">23.5</td></tr>
                                                <tr><td className="border p-2 font-semibold">38</td><td className="border p-2">5</td><td className="border p-2">6.5</td><td className="border p-2">24</td></tr>
                                                <tr className="bg-muted/30"><td className="border p-2 font-semibold">39</td><td className="border p-2">6</td><td className="border p-2">7</td><td className="border p-2">25</td></tr>
                                                <tr><td className="border p-2 font-semibold">40</td><td className="border p-2">6.5</td><td className="border p-2">8</td><td className="border p-2">25.5</td></tr>
                                                <tr className="bg-muted/30"><td className="border p-2 font-semibold">41</td><td className="border p-2">7.5</td><td className="border p-2">8.5</td><td className="border p-2">26</td></tr>
                                                <tr><td className="border p-2 font-semibold">42</td><td className="border p-2">8</td><td className="border p-2">9</td><td className="border p-2">27</td></tr>
                                                <tr className="bg-muted/30"><td className="border p-2 font-semibold">43</td><td className="border p-2">9</td><td className="border p-2">10</td><td className="border p-2">27.5</td></tr>
                                                <tr><td className="border p-2 font-semibold">44</td><td className="border p-2">9.5</td><td className="border p-2">10.5</td><td className="border p-2">28</td></tr>
                                                <tr className="bg-muted/30"><td className="border p-2 font-semibold">45</td><td className="border p-2">10.5</td><td className="border p-2">11.5</td><td className="border p-2">29</td></tr>
                                            </tbody>
                                        </table>
                                    </div>
                                </div>

                                {/* أطفال */}
                                <div>
                                    <h4 className="font-semibold mb-3">أطفال</h4>
                                    <div className="overflow-x-auto">
                                        <table className="w-full border-collapse text-sm">
                                            <thead>
                                                <tr className="bg-muted">
                                                    <th className="border p-2 text-right">EU</th>
                                                    <th className="border p-2 text-right">UK</th>
                                                    <th className="border p-2 text-right">سم</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                <tr><td className="border p-2 font-semibold">20</td><td className="border p-2">4</td><td className="border p-2">12.5</td></tr>
                                                <tr className="bg-muted/30"><td className="border p-2 font-semibold">22</td><td className="border p-2">5.5</td><td className="border p-2">13.5</td></tr>
                                                <tr><td className="border p-2 font-semibold">24</td><td className="border p-2">7</td><td className="border p-2">15</td></tr>
                                                <tr className="bg-muted/30"><td className="border p-2 font-semibold">26</td><td className="border p-2">8.5</td><td className="border p-2">16</td></tr>
                                                <tr><td className="border p-2 font-semibold">28</td><td className="border p-2">10</td><td className="border p-2">17.5</td></tr>
                                                <tr className="bg-muted/30"><td className="border p-2 font-semibold">30</td><td className="border p-2">11.5</td><td className="border p-2">19</td></tr>
                                                <tr><td className="border p-2 font-semibold">32</td><td className="border p-2">13</td><td className="border p-2">20</td></tr>
                                                <tr className="bg-muted/30"><td className="border p-2 font-semibold">34</td><td className="border p-2">2</td><td className="border p-2">21.5</td></tr>
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            </div>
                        </Card>

                        <Card className="p-6 bg-purple-50">
                            <h4 className="font-bold mb-3">كيفية قياس القدم</h4>
                            <ol className="list-decimal list-inside space-y-2 text-sm">
                                <li>قف على ورقة بيضاء مع ظهرك على الحائط</li>
                                <li>ارسم خطاً عند أطول نقطة من إصبع القدم</li>
                                <li>قس المسافة بين الحائط والخط بالسنتيمترات</li>
                                <li>قارن القياس مع الجدول أعلاه</li>
                            </ol>
                        </Card>
                    </TabsContent>
                </Tabs>

                <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <p className="text-sm text-center text-yellow-800">
                        <span className="font-bold">ملاحظة هامة:</span> المقاسات قد تختلف قليلاً حسب العلامة التجارية.
                        تحقق دائماً من تفاصيل المنتج أو اتصل بالبائع للتأكد.
                    </p>
                </div>
            </DialogContent>
        </Dialog>
    );
};
