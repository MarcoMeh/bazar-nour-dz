import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface Wilaya {
    id: number;
    code: string;
    name: string;
    name_ar: string;
}

interface QuickWilayaSelectorProps {
    wilayas: Wilaya[];
    selectedId: string;
    onSelect: (id: string) => void;
}

const POPULAR_WILAYAS = [
    { code: "16", name: "الجزائر" },
    { code: "09", name: "البليدة" },
    { code: "31", name: "وهران" },
    { code: "25", name: "قسنطينة" },
    { code: "19", name: "سطيف" },
    { code: "06", name: "بجاية" },
];

export const QuickWilayaSelector = ({ wilayas, selectedId, onSelect }: QuickWilayaSelectorProps) => {
    const popularList = POPULAR_WILAYAS.map(p => {
        return wilayas.find(w => w.code === p.code);
    }).filter(Boolean) as Wilaya[];

    return (
        <div className="space-y-3">
            <p className="text-xs text-muted-foreground font-medium mb-2">ولايات شائعة:</p>
            <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                {popularList.map((w) => (
                    <Button
                        key={w.id}
                        type="button"
                        variant={selectedId === String(w.id) ? "default" : "outline"}
                        className={cn(
                            "h-auto py-2 px-1 text-xs sm:text-sm font-bold transition-all",
                            selectedId === String(w.id) && "ring-2 ring-primary ring-offset-1"
                        )}
                        onClick={() => onSelect(String(w.id))}
                    >
                        {w.name_ar}
                    </Button>
                ))}
            </div>
        </div>
    );
};
