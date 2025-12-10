import { useState, useEffect } from 'react';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { X } from 'lucide-react';

interface Category {
    id: string;
    name: string;
    slug: string;
    parent_id: string | null;
}

interface MultiCategorySelectorProps {
    selectedCategoryIds: string[];
    onCategoriesChange: (categoryIds: string[]) => void;
    categories: Category[];
}

export const MultiCategorySelector = ({
    selectedCategoryIds,
    onCategoriesChange,
    categories,
}: MultiCategorySelectorProps) => {
    const mainCategories = categories.filter((c) => c.parent_id === null);

    const toggleCategory = (categoryId: string) => {
        if (selectedCategoryIds.includes(categoryId)) {
            onCategoriesChange(selectedCategoryIds.filter((id) => id !== categoryId));
        } else {
            onCategoriesChange([...selectedCategoryIds, categoryId]);
        }
    };

    const removeCategory = (categoryId: string) => {
        onCategoriesChange(selectedCategoryIds.filter((id) => id !== categoryId));
    };

    const getSelectedCategories = () => {
        return categories.filter((c) => selectedCategoryIds.includes(c.id));
    };

    return (
        <div className="space-y-4">
            {/* Category Checkboxes */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3 max-h-[300px] overflow-y-auto p-4 border rounded-lg bg-muted/30">
                {mainCategories.map((category) => (
                    <div key={category.id} className="flex items-center space-x-2 space-x-reverse">
                        <Checkbox
                            id={`category-${category.id}`}
                            checked={selectedCategoryIds.includes(category.id)}
                            onCheckedChange={() => toggleCategory(category.id)}
                        />
                        <Label
                            htmlFor={`category-${category.id}`}
                            className="text-sm font-medium cursor-pointer"
                        >
                            {category.name}
                        </Label>
                    </div>
                ))}
            </div>

            {/* Selected Categories */}
            {selectedCategoryIds.length > 0 && (
                <div className="space-y-2">
                    <Label className="text-sm text-muted-foreground">
                        التصنيفات المختارة ({selectedCategoryIds.length}):
                    </Label>
                    <div className="flex flex-wrap gap-2">
                        {getSelectedCategories().map((category) => (
                            <Badge key={category.id} variant="secondary" className="gap-2">
                                {category.name}
                                <button
                                    type="button"
                                    onClick={() => removeCategory(category.id)}
                                    className="hover:bg-destructive/20 rounded-full"
                                >
                                    <X className="h-3 w-3" />
                                </button>
                            </Badge>
                        ))}
                    </div>
                </div>
            )}

            {selectedCategoryIds.length === 0 && (
                <p className="text-sm text-muted-foreground text-center py-4">
                    لم يتم اختيار أي تصنيف بعد
                </p>
            )}
        </div>
    );
};
