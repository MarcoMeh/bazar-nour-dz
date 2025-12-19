export const COMMON_COLORS = [
    // Basics
    { name: 'أبيض', hex: '#FFFFFF', border: true, primary: true },
    { name: 'أسود', hex: '#000000', primary: true },
    { name: 'رمادي', hex: '#6B7280', primary: true },
    { name: 'رمادي فاتح', hex: '#D1D5DB', border: true },
    { name: 'رمادي غامق', hex: '#374151' },
    { name: 'فضي', hex: '#C0C0C0', border: true },

    // Reds
    { name: 'أحمر', hex: '#EF4444', primary: true },
    { name: 'أحمر فاتح', hex: '#FCA5A5' },
    { name: 'أحمر غامق', hex: '#991B1B' },
    { name: 'بوردو', hex: '#800020' },
    { name: 'نبيذي', hex: '#722F37' },
    { name: 'زهري', hex: '#FFC0CB', border: true },
    { name: 'وردي', hex: '#EC4899', primary: true },
    { name: 'وردي فاتح', hex: '#FBCFE8', border: true },
    { name: 'فوشيا', hex: '#FF00FF' },

    // Oranges & Browns
    { name: 'برتقالي', hex: '#F97316', primary: true },
    { name: 'برتقالي فاتح', hex: '#FDBA74' },
    { name: 'مشمشي', hex: '#FBCEB1', border: true },
    { name: 'بني', hex: '#92400E', primary: true },
    { name: 'بني فاتح', hex: '#D4A574' },
    { name: 'بني غامق', hex: '#451a03' },
    { name: 'بيج', hex: '#F5F5DC', border: true, primary: true },
    { name: 'جملي', hex: '#C19A6B' },
    { name: 'هافان', hex: '#C46210' },
    { name: 'كاكي', hex: '#C3B091' },
    { name: 'عسلي', hex: '#D4AF37' },

    // Yellows
    { name: 'أصفر', hex: '#EAB308', primary: true },
    { name: 'أصفر فاتح', hex: '#FEF08A', border: true },
    { name: 'ليموني', hex: '#FFF700' },
    { name: 'ذهبي', hex: '#FFD700' },
    { name: 'خردلي', hex: '#FFDB58' },

    // Greens
    { name: 'أخضر', hex: '#10B981', primary: true },
    { name: 'أخضر فاتح', hex: '#86EFAC' },
    { name: 'أخضر غامق', hex: '#064E3B' },
    { name: 'أخضر ملكي', hex: '#006400' },
    { name: 'زيتوني', hex: '#808000' },
    { name: 'فستقي', hex: '#93C572' },
    { name: 'فيروزي', hex: '#40E0D0' },
    { name: 'تيفاني', hex: '#0ABAB5' },

    // Blues
    { name: 'أزرق', hex: '#3B82F6', primary: true },
    { name: 'أزرق فاتح', hex: '#93C5FD' },
    { name: 'سماوي', hex: '#87CEEB' },
    { name: 'أزرق غامق', hex: '#1E3A8A' },
    { name: 'كحلي', hex: '#000080', primary: true },
    { name: 'نيلي', hex: '#4B0082' },
    { name: 'بترولي', hex: '#005F6B' },
    { name: 'جينز', hex: '#5D8AA8' },

    // Purples
    { name: 'بنفسجي', hex: '#A855F7', primary: true },
    { name: 'بنفسجي فاتح', hex: '#E9D5FF', border: true },
    { name: 'بنفسجي غامق', hex: '#581C87' },
    { name: 'موف', hex: '#E0B0FF', border: true },
    { name: 'ارجواني', hex: '#800080' },
    { name: 'باذنجاني', hex: '#4B3621' },
];

export const getColorHex = (colorName: string): string => {
    const color = COMMON_COLORS.find(c => c.name === colorName);
    return color ? color.hex : colorName; // Fallback to original if not found (in case it's already a valid color/hex)
};

export const isPearlColor = (colorName: string): boolean => {
    const color = COMMON_COLORS.find(c => c.name === colorName);
    return color?.border || false;
};
