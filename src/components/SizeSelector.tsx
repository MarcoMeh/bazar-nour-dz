import { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';
import { Input } from './ui/input';
import { Label } from './ui/label';

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

            <div className="flex overflow-x-auto pb-2 gap-2 scrollbar-none">
                {currentSizes.map((size) => (
                    <Button
                        key={size}
                        type="button"
                        variant={selectedSizes.includes(size) ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => toggleSize(size)}
                        className="min-w-[60px] shrink-0"
                    >
                        {size}
                    </Button>
                ))}
            </div>

            <div className="flex gap-2 items-end">
                <div className="flex-1">
                    <Label className="text-[10px] text-muted-foreground mb-1 block">مقاس مخصص (اكتب ثم اضغط إضافة)</Label>
                    <Input
                        placeholder="مثال: 47 أو Free Size"
                        id="custom-size-input"
                        className="h-9 text-sm"
                        onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                                e.preventDefault();
                                const input = e.currentTarget;
                                if (input.value.trim()) {
                                    toggleSize(input.value.trim());
                                    input.value = '';
                                }
                            }
                        }}
                    />
                </div>
                <Button
                    type="button"
                    variant="secondary"
                    size="sm"
                    className="h-9"
                    onClick={() => {
                        const input = document.getElementById('custom-size-input') as HTMLInputElement;
                        if (input && input.value.trim()) {
                            toggleSize(input.value.trim());
                            input.value = '';
                        }
                    }}
                >
                    إضافة
                </Button>
            </div>

            {selectedSizes.length > 0 && (
                <div className="flex flex-wrap gap-2 p-3 bg-muted/50 rounded-lg border border-dashed">
                    <span className="text-xs text-muted-foreground w-full mb-1">المقاسات المختارة:</span>
                    {selectedSizes.map((size) => (
                        <Badge key={size} variant="secondary" className="gap-1 pl-2">
                            {size}
                            <button
                                type="button"
                                onClick={() => removeSize(size)}
                                className="ml-1 hover:bg-destructive/20 rounded-full p-0.5 transition-colors"
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
