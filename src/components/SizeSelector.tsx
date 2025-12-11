import { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';

const LETTER_SIZES = ['XS', 'S', 'M', 'L', 'XL', 'XXL', 'XXXL'];
const NUMERIC_SIZES = ['36', '37', '38', '39', '40', '41', '42', '43', '44', '45', '46'];

interface SizeSelectorProps {
    selectedSizes: string[];
    onSizesChange: (sizes: string[]) => void;
}

export const SizeSelector = ({ selectedSizes, onSizesChange }: SizeSelectorProps) => {
    const [activeTab, setActiveTab] = useState<'letters' | 'numbers'>('letters');

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

    const currentSizes = activeTab === 'letters' ? LETTER_SIZES : NUMERIC_SIZES;

    return (
        <div className="space-y-3">
            <div className="flex bg-muted p-1 rounded-lg w-fit mb-2">
                <button
                    type="button"
                    onClick={() => setActiveTab('letters')}
                    className={`px-3 py-1 text-sm font-medium rounded-md transition-all ${activeTab === 'letters'
                            ? 'bg-background text-foreground shadow-sm'
                            : 'text-muted-foreground hover:text-foreground'
                        }`}
                >
                    أحرف
                </button>
                <button
                    type="button"
                    onClick={() => setActiveTab('numbers')}
                    className={`px-3 py-1 text-sm font-medium rounded-md transition-all ${activeTab === 'numbers'
                            ? 'bg-background text-foreground shadow-sm'
                            : 'text-muted-foreground hover:text-foreground'
                        }`}
                >
                    أرقام
                </button>
            </div>

            <div className="flex flex-wrap gap-2">
                {currentSizes.map((size) => (
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
