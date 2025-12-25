import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { X, Plus, ChevronDown, ChevronUp } from 'lucide-react';
import { useState } from 'react';
import { COMMON_COLORS } from '@/lib/colors';

interface ColorSelectorProps {
    selectedColors: string[];
    onColorsChange: (colors: string[]) => void;
}

export const ColorSelector = ({ selectedColors, onColorsChange }: ColorSelectorProps) => {
    const [customColor, setCustomColor] = useState('');
    const [showAllColors, setShowAllColors] = useState(false);

    // Filter colors
    const primaryColors = COMMON_COLORS.filter((c: any) => c.primary);
    const otherColors = COMMON_COLORS.filter((c: any) => !c.primary);

    const toggleColor = (colorName: string) => {
        if (selectedColors.includes(colorName)) {
            onColorsChange(selectedColors.filter((c) => c !== colorName));
        } else {
            onColorsChange([...selectedColors, colorName]);
        }
    };

    const removeColor = (colorName: string) => {
        onColorsChange(selectedColors.filter((c) => c !== colorName));
    };

    const addCustomColor = () => {
        if (customColor.trim() && !selectedColors.includes(customColor.trim())) {
            onColorsChange([...selectedColors, customColor.trim()]);
            setCustomColor('');
        }
    };

    const renderColorButton = (color: any) => (
        <button
            key={color.name}
            type="button"
            onClick={() => toggleColor(color.name)}
            className={`
              flex flex-col items-center gap-1 p-2 rounded-lg border-2 transition-all hover:scale-105 active:scale-95
              ${selectedColors.includes(color.name)
                    ? 'border-primary bg-primary/5 shadow-sm'
                    : 'border-gray-100 hover:border-gray-200 hover:bg-white'
                }
            `}
        >
            <div
                className={`w-8 h-8 rounded-full shadow-sm ${color.border ? 'border border-gray-200' : ''}`}
                style={{ backgroundColor: color.hex }}
            />
            <span className="text-[10px] text-center font-medium text-gray-700 leading-tight">{color.name}</span>
        </button>
    );

    return (
        <div className="space-y-4">
            {/* Primary Colors Grid */}
            <div className="space-y-2">
                <div className="grid grid-cols-3 sm:grid-cols-5 md:grid-cols-6 gap-4">
                    {primaryColors.map(renderColorButton)}
                </div>
            </div>

            {/* Toggle Other Colors */}
            <div className="relative">
                <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowAllColors(!showAllColors)}
                    className="w-full text-muted-foreground hover:text-primary hover:bg-gray-50 flex items-center justify-center gap-2 h-9 border border-dashed border-gray-200"
                >
                    {showAllColors ? (
                        <>
                            <ChevronUp className="h-4 w-4" /> إخفاء الألوان الإضافية
                        </>
                    ) : (
                        <>
                            <ChevronDown className="h-4 w-4" /> عرض المزيد من الألوان
                        </>
                    )}
                </Button>
            </div>

            {/* Other Colors Grid */}
            {showAllColors && (
                <div className="animate-in fade-in slide-in-from-top-2 duration-300">
                    <div className="grid grid-cols-3 sm:grid-cols-5 md:grid-cols-6 gap-4 p-3 bg-gray-50/50 rounded-xl border border-gray-100">
                        {otherColors.map(renderColorButton)}
                    </div>
                </div>
            )}

            {/* Custom Color Input */}
            <div className="flex gap-2 pt-2">
                <Input
                    placeholder="لون مخصص (مثال: أزرق فاتح)"
                    value={customColor}
                    onChange={(e) => setCustomColor(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addCustomColor())}
                    className="flex-1 bg-white"
                />
                <Button
                    type="button"
                    variant="secondary"
                    size="icon"
                    onClick={addCustomColor}
                    disabled={!customColor.trim()}
                >
                    <Plus className="h-4 w-4" />
                </Button>
            </div>

            {/* Selected Colors Tags */}
            {selectedColors.length > 0 && (
                <div className="flex flex-wrap gap-2 p-3 bg-white border rounded-xl shadow-sm">
                    {selectedColors.map((colorName) => {
                        const colorData = COMMON_COLORS.find((c) => c.name === colorName);
                        return (
                            <Badge key={colorName} variant="secondary" className="gap-1.5 py-1 pl-1 bg-gray-100 hover:bg-gray-200 font-normal">
                                {colorData && (
                                    <div
                                        className={`w-3 h-3 rounded-full ${colorData.border ? 'border border-gray-300' : ''}`}
                                        style={{ backgroundColor: colorData.hex }}
                                    />
                                )}
                                {colorName}
                                <button
                                    type="button"
                                    onClick={() => removeColor(colorName)}
                                    className="ml-1 p-0.5 hover:bg-red-100 hover:text-red-500 rounded-full transition-colors"
                                >
                                    <X className="h-3 w-3" />
                                </button>
                            </Badge>
                        );
                    })}
                </div>
            )}
        </div>
    );
};
