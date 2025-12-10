import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';

// Common sizes for clothing
const COMMON_SIZES = ['XS', 'S', 'M', 'L', 'XL', 'XXL', 'XXXL'];

interface SizeSelectorProps {
    selectedSizes: string[];
    onSizesChange: (sizes: string[]) => void;
}

export const SizeSelector = ({ selectedSizes, onSizesChange }: SizeSelectorProps) => {
    const toggleSize = (size: string) => {
        if (selectedSizes.includes(size)) {
            onSizesChange(selectedSizes.filter((s) => s !== size));
        } else {
            onSizesChange([...selectedSizes, size]);
        }
    };

    const removeSize = (size: string) => {
        onSizesChange(selectedSizes.filter((s) => s !== size));
    };

    return (
        <div className="space-y-3">
            <div className="flex flex-wrap gap-2">
                {COMMON_SIZES.map((size) => (
                    <Button
                        key={size}
                        type="button"
                        variant={selectedSizes.includes(size) ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => toggleSize(size)}
                        className="min-w-[60px]"
                    >
                        {size}
                    </Button>
                ))}
            </div>

            {selectedSizes.length > 0 && (
                <div className="flex flex-wrap gap-2 p-3 bg-muted rounded-lg">
                    <span className="text-sm text-muted-foreground">المقاسات المختارة:</span>
                    {selectedSizes.map((size) => (
                        <Badge key={size} variant="secondary" className="gap-1">
                            {size}
                            <button
                                type="button"
                                onClick={() => removeSize(size)}
                                className="ml-1 hover:bg-destructive/20 rounded-full"
                            >
                                <X className="h-3 w-3" />
                            </button>
                        </Badge>
                    ))}
                </div>
            )}
        </div>
    );
};
