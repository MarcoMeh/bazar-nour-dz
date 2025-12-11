export const COMMON_COLORS = [
    { name: 'أبيض', hex: '#FFFFFF', border: true },
    { name: 'أسود', hex: '#000000' },
    { name: 'أحمر', hex: '#EF4444' },
    { name: 'أزرق', hex: '#3B82F6' },
    { name: 'أخضر', hex: '#10B981' },
    { name: 'أصفر', hex: '#EAB308' },
    { name: 'برتقالي', hex: '#F97316' },
    { name: 'وردي', hex: '#EC4899' },
    { name: 'بنفسجي', hex: '#A855F7' },
    { name: 'بني', hex: '#92400E' },
    { name: 'رمادي', hex: '#6B7280' },
    { name: 'بيج', hex: '#D4A574' },
    { name: 'كحلي', hex: '#1E3A8A' },
    { name: 'ذهبي', hex: '#FFD700' },
    { name: 'فضي', hex: '#C0C0C0' },
];

export const getColorHex = (colorName: string): string => {
    const color = COMMON_COLORS.find(c => c.name === colorName);
    return color ? color.hex : colorName; // Fallback to original if not found (in case it's already a valid color/hex)
};

export const isPearlColor = (colorName: string): boolean => {
    const color = COMMON_COLORS.find(c => c.name === colorName);
    return color?.border || false;
};
