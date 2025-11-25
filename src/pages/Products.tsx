import { useState } from "react";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function Products() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");

  return (
    <div className="container py-8">
      <h1 className="text-3xl md:text-4xl font-bold mb-8 text-primary">المنتجات</h1>

      {/* Search and Filter */}
      <div className="flex flex-col md:flex-row gap-4 mb-8">
        <div className="relative flex-1">
          <Search className="absolute right-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="ابحث عن منتج..."
            className="pr-10"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <Select value={selectedCategory} onValueChange={setSelectedCategory}>
          <SelectTrigger className="w-full md:w-[200px]">
            <SelectValue placeholder="اختر الفئة" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">جميع الفئات</SelectItem>
            <SelectItem value="clothes">ملابس</SelectItem>
            <SelectItem value="electronics">إلكترونيات</SelectItem>
            <SelectItem value="decor">ديكور</SelectItem>
            <SelectItem value="beauty">مواد تجميل</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Products Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Placeholder products - will be replaced with real data from Supabase */}
        {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
          <Card key={i} className="overflow-hidden hover:shadow-lg transition-shadow cursor-pointer">
            <div className="aspect-square bg-muted"></div>
            <CardContent className="p-4">
              <h3 className="font-semibold mb-2">منتج {i}</h3>
              <p className="text-sm text-muted-foreground mb-2">وصف المنتج هنا</p>
              <div className="flex items-center justify-between mb-3">
                <span className="text-lg font-bold text-primary">1,500 دج</span>
              </div>
              <Button className="w-full">أضف للسلة</Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
