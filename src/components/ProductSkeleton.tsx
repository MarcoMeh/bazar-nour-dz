import { cn } from "@/lib/utils";

export const ProductSkeleton = ({ className }: { className?: string }) => {
  return (
    <div
      className={cn(
        "group flex flex-col space-y-4 relative p-3 store-card",
        "bg-white/5 backdrop-blur-2xl border border-white/10",
        className
      )}
      style={{ borderRadius: 'var(--store-radius, 1rem)' }}
    >
      <div className="block relative">
        <div
          className="relative w-full aspect-[4/5] overflow-hidden bg-gray-200/50 animate-pulse"
          style={{ borderRadius: 'calc(var(--store-radius, 1rem) * 0.8)' }}
        >
        </div>
      </div>

      <div className="px-2 pb-1 space-y-3">
        <div className="flex justify-between items-start gap-3">
          <div className="flex-1 space-y-2 w-full">
            <div className="h-4 w-3/4 bg-gray-200/50 rounded-md animate-pulse"></div>
            <div className="h-4 w-1/2 bg-gray-200/50 rounded-md animate-pulse"></div>
            <div className="mt-2 flex items-center gap-2 pt-2">
              <div className="h-6 w-20 bg-gray-200/50 rounded-md animate-pulse"></div>
            </div>
          </div>

          <div className="h-12 w-12 shrink-0 rounded-2xl bg-gray-200/50 animate-pulse"></div>
        </div>
      </div>
    </div>
  );
};
