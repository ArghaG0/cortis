import React, { useEffect, useState } from 'react';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';
import { useSwipeable } from 'react-swipeable';

const Lightbox = ({ images, initialIndex = 0, isOpen, onClose }) => {
    const [currentIndex, setCurrentIndex] = useState(initialIndex);

    useEffect(() => {
        if (isOpen) {
            setCurrentIndex(initialIndex);
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [isOpen, initialIndex]);

    useEffect(() => {
        const handleKeyDown = (e) => {
            if (!isOpen) return;
            if (e.key === 'Escape') onClose();
            if (e.key === 'ArrowRight') handleNext();
            if (e.key === 'ArrowLeft') handlePrev();
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isOpen, currentIndex, images]);

    const handleNext = () => {
        if (images && currentIndex < images.length - 1) {
            setCurrentIndex(prev => prev + 1);
        }
    };

    const handlePrev = () => {
        if (images && currentIndex > 0) {
            setCurrentIndex(prev => prev - 1);
        }
    };

    const handlers = useSwipeable({
        onSwipedLeft: handleNext,
        onSwipedRight: handlePrev,
        preventDefaultTouchmoveEvent: true,
        trackMouse: true
    });

    if (!isOpen || !images || images.length === 0) return null;

    // support both { url, fileId } and legacy string formats
    const imgUrl = typeof images[currentIndex] === 'string' ? images[currentIndex] : images[currentIndex].url;

    return (
        <div 
            className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black/20 backdrop-blur-xl select-none"
            onClick={onClose}
        >
            <button 
                className="absolute top-4 right-4 text-gray-800 bg-white/50 hover:bg-white/80 rounded-full p-2 shadow-lg transition z-10 cursor-pointer select-none"
                onClick={(e) => { e.stopPropagation(); onClose(); }}
            >
                <X className="w-8 h-8" />
            </button>
            
            {images.length > 1 && (
                <div 
                    className="absolute top-4 left-1/2 -translate-x-1/2 bg-white/50 text-gray-800 px-3 py-1 rounded-full text-sm shadow-lg font-medium select-none"
                    onClick={(e) => e.stopPropagation()}
                >
                    {currentIndex + 1} / {images.length}
                </div>
            )}

            {images.length > 1 && currentIndex > 0 && (
                <button 
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-800 bg-white/50 hover:bg-white/80 rounded-full p-2 shadow-lg transition cursor-pointer select-none"
                    onClick={(e) => { e.stopPropagation(); handlePrev(); }}
                >
                    <ChevronLeft className="w-8 h-8" />
                </button>
            )}

            <div 
                {...handlers} 
                className="w-full h-full flex items-center justify-center p-6 max-w-5xl max-h-screen"
                onClick={(e) => e.stopPropagation()}
            >
                <img 
                    src={imgUrl} 
                    alt="" 
                    className="max-h-[90vh] max-w-[90vw] object-contain rounded-2xl shadow-2xl select-none"
                    onClick={(e) => e.stopPropagation()}
                />
            </div>

            {images.length > 1 && currentIndex < images.length - 1 && (
                <button 
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-800 bg-white/50 hover:bg-white/80 rounded-full p-2 shadow-lg transition cursor-pointer select-none"
                    onClick={(e) => { e.stopPropagation(); handleNext(); }}
                >
                    <ChevronRight className="w-8 h-8" />
                </button>
            )}
        </div>
    );
};

export default Lightbox;
