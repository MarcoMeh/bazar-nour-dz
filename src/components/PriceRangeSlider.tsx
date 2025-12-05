import { useState, useEffect } from "react";
import { Label } from "@/components/ui/label";

interface PriceRangeSliderProps {
    min: number;
    max: number;
    value: [number, number];
    onChange: (value: [number, number]) => void;
}

export function PriceRangeSlider({ min, max, value, onChange }: PriceRangeSliderProps) {
    const [minValue, setMinValue] = useState(value[0]);
    const [maxValue, setMaxValue] = useState(value[1]);

    useEffect(() => {
        setMinValue(value[0]);
        setMaxValue(value[1]);
    }, [value]);

    const handleMinChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newMin = Number(e.target.value);
        if (newMin <= maxValue) {
            setMinValue(newMin);
            onChange([newMin, maxValue]);
        }
    };

    const handleMaxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newMax = Number(e.target.value);
        if (newMax >= minValue) {
            setMaxValue(newMax);
            onChange([minValue, newMax]);
        }
    };

    const percentage = ((maxValue - min) / (max - min)) * 100;

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <Label className="text-sm font-medium">نطاق السعر</Label>
                <span className="text-sm text-muted-foreground">
                    {minValue} - {maxValue} دج
                </span>
            </div>

            <div className="relative pt-2">
                <input
                    type="range"
                    min={min}
                    max={max}
                    value={minValue}
                    onChange={handleMinChange}
                    className="absolute w-full pointer-events-none appearance-none z-20 h-2 opacity-0"
                    style={{
                        background: `linear-gradient(to right, transparent ${((minValue - min) / (max - min)) * 100}%, hsl(var(--primary)) ${((minValue - min) / (max - min)) * 100}%, hsl(var(--primary)) ${percentage}%, transparent ${percentage}%)`
                    }}
                />
                <input
                    type="range"
                    min={min}
                    max={max}
                    value={maxValue}
                    onChange={handleMaxChange}
                    className="absolute w-full pointer-events-none appearance-none z-20 h-2 opacity-0"
                />
                <div className="relative z-10 h-2 bg-muted rounded-full">
                    <div
                        className="absolute h-full bg-primary rounded-full"
                        style={{
                            left: `${((minValue - min) / (max - min)) * 100}%`,
                            right: `${100 - percentage}%`
                        }}
                    />
                </div>
            </div>

            <div className="flex items-center gap-4">
                <div className="flex-1">
                    <Label className="text-xs text-muted-foreground">الأدنى</Label>
                    <input
                        type="number"
                        value={minValue}
                        onChange={(e) => handleMinChange(e as any)}
                        className="w-full px-3 py-2 text-sm border rounded-md"
                        min={min}
                        max={maxValue}
                    />
                </div>
                <div className="flex-1">
                    <Label className="text-xs text-muted-foreground">الأقصى</Label>
                    <input
                        type="number"
                        value={maxValue}
                        onChange={(e) => handleMaxChange(e as any)}
                        className="w-full px-3 py-2 text-sm border rounded-md"
                        min={minValue}
                        max={max}
                    />
                </div>
            </div>
        </div>
    );
}
