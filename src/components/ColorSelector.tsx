import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { X, Plus } from 'lucide-react';
import { useState } from 'react';
import { COMMON_COLORS } from '@/lib/colors';

interface ColorSelectorProps {
    selectedColors: string[];
    onColorsChange: (colors: string[]) => void;
}

export const ColorSelector = ({ selectedColors, onColorsChange }: ColorSelectorProps) => {
    const [customColor, setCustomColor] = useState('');

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

    return (
        <div className="space-y-3">
            {/* Common Colors Grid */}
            <div className="grid grid-cols-5 gap-2">
                {COMMON_COLORS.map((color) => (
                    <button
                        key={color.name}
                        type="button"
                        onClick={() => toggleColor(color.name)}
                        className={`
              flex flex-col items-center gap-1 p-2 rounded-lg border-2 transition-all hover:scale-105
              ${selectedColors.includes(color.name)
                                ? 'border-primary bg-primary/5'
                                : 'border-gray-200 hover:border-gray-300'
                            }
            `}
                    >
                        <div
                            className={`w-8 h-8 rounded-full ${color.border ? 'border-2 border-gray-300' : ''}`}
                            style={{ backgroundColor: color.hex }}
                        />
                        <span className="text-xs font-medium">{color.name}</span>
                    </button>
                ))}
            </div>

            {/* Custom Color Input */}
            <div className="flex gap-2">
                <Input
                    placeholder="لون مخصص (مثال: أزرق فاتح)"
                    value={customColor}
                    onChange={(e) => setCustomColor(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addCustomColor())}
                />
                <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    onClick={addCustomColor}
                    disabled={!customColor.trim()}
                >
                    <Plus className="h-4 w-4" />
                </Button>
            </div>

            {/* Selected Colors */}
            {selectedColors.length > 0 && (
                <div className="flex flex-wrap gap-2 p-3 bg-muted rounded-lg">
                    <span className="text-sm text-muted-foreground">الألوان المختارة:</span>
                    {selectedColors.map((colorName) => {
                        const colorData = COMMON_COLORS.find((c) => c.name === colorName);
                        return (
                            <Badge key={colorName} variant="secondary" className="gap-2">
                                {colorData && (
                                    <div
                                        className={`w-3 h-3 rounded-full ${colorData.border ? 'border border-gray-400' : ''}`}
                                        style={{ backgroundColor: colorData.hex }}
                                    />
                                )}
                                {colorName}
                                <button
                                    type="button"
                                    onClick={() => removeColor(colorName)}
                                    className="ml-1 hover:bg-destructive/20 rounded-full"
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
