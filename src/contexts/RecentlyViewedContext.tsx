import React, { createContext, useContext, useState, useEffect } from 'react';

interface RecentlyViewedContextType {
    recentlyViewed: string[];
    addToRecentlyViewed: (productId: string) => void;
    clearRecentlyViewed: () => void;
}

const RecentlyViewedContext = createContext<RecentlyViewedContextType | undefined>(undefined);

const STORAGE_KEY = 'bazar_recently_viewed';
const MAX_ITEMS = 12;

export const RecentlyViewedProvider = ({ children }: { children: React.ReactNode }) => {
    const [recentlyViewed, setRecentlyViewed] = useState<string[]>([]);

    // Load from localStorage on mount
    useEffect(() => {
        try {
            const stored = localStorage.getItem(STORAGE_KEY);
            if (stored) {
                setRecentlyViewed(JSON.parse(stored));
            }
        } catch (error) {
            console.error('Error loading recently viewed:', error);
        }
    }, []);

    // Save to localStorage whenever it changes
    useEffect(() => {
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(recentlyViewed));
        } catch (error) {
            console.error('Error saving recently viewed:', error);
        }
    }, [recentlyViewed]);

    const addToRecentlyViewed = (productId: string) => {
        setRecentlyViewed((prev) => {
            // Remove if already exists
            const filtered = prev.filter((id) => id !== productId);
            // Add to beginning
            const updated = [productId, ...filtered];
            // Keep only MAX_ITEMS
            return updated.slice(0, MAX_ITEMS);
        });
    };

    const clearRecentlyViewed = () => {
        setRecentlyViewed([]);
        localStorage.removeItem(STORAGE_KEY);
    };

    return (
        <RecentlyViewedContext.Provider
            value={{
                recentlyViewed,
                addToRecentlyViewed,
                clearRecentlyViewed,
            }}
        >
            {children}
        </RecentlyViewedContext.Provider>
    );
};

export const useRecentlyViewed = () => {
    const context = useContext(RecentlyViewedContext);
    if (!context) {
        throw new Error('useRecentlyViewed must be used within RecentlyViewedProvider');
    }
    return context;
};
