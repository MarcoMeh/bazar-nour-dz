import { useState } from 'react';
import { X, ZoomIn } from 'lucide-react';
import { Dialog, DialogContent } from '@/components/ui/dialog';

interface ImageZoomProps {
    images: string[];
    currentIndex: number;
    onIndexChange: (index: number) => void;
}

export const ImageZoom = ({ images, currentIndex, onIndexChange }: ImageZoomProps) => {
    const [isOpen, setIsOpen] = useState(false);
    const [scale, setScale] = useState(1);

    const handleNext = () => {
        if (currentIndex < images.length - 1) {
            onIndexChange(currentIndex + 1);
            setScale(1);
        }
    };

    const handlePrev = () => {
        if (currentIndex > 0) {
            onIndexChange(currentIndex - 1);
            setScale(1);
        }
    };

    const handleZoomIn = () => {
        setScale((prev) => Math.min(prev + 0.5, 3));
    };

    const handleZoomOut = () => {
        setScale((prev) => Math.max(prev - 0.5, 1));
    };

    return (
        <div className="relative group">
            {/* Main Image with Hover Zoom */}
            <div
                className="relative overflow-hidden rounded-lg cursor-zoom-in"
                onClick={() => setIsOpen(true)}
            >
                <img
                    src={images[currentIndex]}
                    alt={`Product ${currentIndex + 1}`}
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors flex items-center justify-center">
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity bg-white/90 rounded-full p-3">
                        <ZoomIn className="h-6 w-6 text-gray-800" />
                    </div>
                </div>
            </div>

            {/* Fullscreen Dialog */}
            <Dialog open={isOpen} onOpenChange={setIsOpen}>
                <DialogContent className="max-w-7xl w-full h-[90vh] p-0 bg-black/95">
                    <div className="relative h-full flex items-center justify-center">
                        {/* Close Button */}
                        <button
                            onClick={() => setIsOpen(false)}
                            className="absolute top-4 right-4 z-50 bg-white/10 hover:bg-white/20 rounded-full p-2 transition-colors"
                        >
                            <X className="h-6 w-6 text-white" />
                        </button>

                        {/* Zoom Controls */}
                        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 z-50 flex gap-2 bg-white/10 rounded-full p-2">
                            <button
                                onClick={handleZoomOut}
                                disabled={scale <= 1}
                                className="px-4 py-2 bg-white/20 hover:bg-white/30 rounded-full text-white disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                -
                            </button>
                            <span className="px-4 py-2 text-white font-medium">
                                {Math.round(scale * 100)}%
                            </span>
                            <button
                                onClick={handleZoomIn}
                                disabled={scale >= 3}
                                className="px-4 py-2 bg-white/20 hover:bg-white/30 rounded-full text-white disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                +
                            </button>
                        </div>

                        {/* Navigation Arrows */}
                        {images.length > 1 && (
                            <>
                                <button
                                    onClick={handlePrev}
                                    disabled={currentIndex === 0}
                                    className="absolute left-4 z-50 bg-white/10 hover:bg-white/20 rounded-full p-3 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    <span className="text-white text-2xl">‹</span>
                                </button>
                                <button
                                    onClick={handleNext}
                                    disabled={currentIndex === images.length - 1}
                                    className="absolute right-4 z-50 bg-white/10 hover:bg-white/20 rounded-full p-3 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    <span className="text-white text-2xl">›</span>
                                </button>
                            </>
                        )}

                        {/* Zoomed Image */}
                        <div className="overflow-auto max-h-full max-w-full p-8">
                            <img
                                src={images[currentIndex]}
                                alt={`Product ${currentIndex + 1}`}
                                style={{
                                    transform: `scale(${scale})`,
                                    transition: 'transform 0.3s ease',
                                }}
                                className="max-w-none"
                            />
                        </div>

                        {/* Thumbnails */}
                        {images.length > 1 && (
                            <div className="absolute bottom-20 left-1/2 transform -translate-x-1/2 flex gap-2 bg-black/50 p-2 rounded-lg">
                                {images.map((img, idx) => (
                                    <button
                                        key={idx}
                                        onClick={() => { onIndexChange(idx); setScale(1); }}
                                        className={`w-16 h-16 rounded overflow-hidden border-2 ${idx === currentIndex ? 'border-white' : 'border-transparent'
                                            }`}
                                    >
                                        <img
                                            src={img}
                                            alt={`Thumbnail ${idx + 1}`}
                                            className="w-full h-full object-cover"
                                        />
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
};
