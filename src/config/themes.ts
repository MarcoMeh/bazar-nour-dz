export interface StoreTheme {
    id: string;
    name: string;
    nameAr: string;
    category: 'women' | 'men' | 'kids' | 'luxury' | 'sports' | 'default';
    description: string;
    colors: {
        primary: string;
        secondary: string;
        accent: string;
        background: string;
        text: string;
        cardBg: string;
    };
    typography: {
        fontFamily: string;
        headingFont: string;
        baseFontSize: string;
    };
    styles: {
        borderRadius: string;
        cardShadow: string;
        buttonStyle: 'rounded' | 'sharp' | 'pill' | 'neo';
        navStyle: 'classic' | 'transparent' | 'centered' | 'glass';
        layoutType: 'grid' | 'masonry' | 'modern' | 'compact';
        headerStyle: 'standard' | 'minimal' | 'elegant' | 'bold';
        cardStyle: 'standard' | 'minimalist' | 'bordered' | 'glass';
        animations: 'fade' | 'slide' | 'none' | 'pop';
        logoAlignment: 'left' | 'center' | 'right';
        productImageAspect: 'square' | 'portrait' | 'video';
        descriptionAlignment: 'left' | 'center' | 'right';
    };
}

export const STORE_THEMES: StoreTheme[] = [
    {
        id: 'default',
        name: 'Classic Blue',
        nameAr: 'النمط الكلاسيكي',
        category: 'default',
        description: 'The standard professional look.',
        colors: {
            primary: '#1e40af',
            secondary: '#60a5fa',
            accent: '#f59e0b',
            background: '#f8fafc',
            text: '#0f172a',
            cardBg: '#ffffff',
        },
        typography: {
            fontFamily: 'Inter, sans-serif',
            headingFont: 'Outfit, sans-serif',
            baseFontSize: '16px',
        },
        styles: {
            borderRadius: '0.5rem',
            cardShadow: '0 1px 3px rgba(0,0,0,0.1)',
            buttonStyle: 'rounded',
            navStyle: 'classic',
            layoutType: 'grid',
            headerStyle: 'standard',
            cardStyle: 'standard',
            animations: 'fade',
            logoAlignment: 'right',
            productImageAspect: 'square',
            descriptionAlignment: 'right',
        },
    },
    {
        id: 'women-soft',
        name: 'Soft Elegance (Women)',
        nameAr: 'أناقة ناعمة (نسائي)',
        category: 'women',
        description: 'Pastel colors and elegant typography for women\'s fashion.',
        colors: {
            primary: '#9d174d', // Rose 800
            secondary: '#fbcfe8', // Pink 200
            accent: '#db2777', // Pink 600
            background: '#fff1f2', // Rose 50
            text: '#4c0519', // Rose 950
            cardBg: '#ffffff',
        },
        typography: {
            fontFamily: 'Outfit, sans-serif',
            headingFont: 'Playfair Display, serif',
            baseFontSize: '15px',
        },
        styles: {
            borderRadius: '1.5rem',
            cardShadow: '0 10px 25px -5px rgba(157, 23, 77, 0.05)',
            buttonStyle: 'pill',
            navStyle: 'glass',
            layoutType: 'masonry',
            headerStyle: 'elegant',
            cardStyle: 'minimalist',
            animations: 'slide',
            logoAlignment: 'center',
            productImageAspect: 'portrait',
            descriptionAlignment: 'center',
        },
    },
    {
        id: 'women-modern',
        name: 'Modern Chic (Women)',
        nameAr: 'مودرن شيك (نسائي)',
        category: 'women',
        description: 'Vibrant and bold for modern trends.',
        colors: {
            primary: '#e11d48', // Rose 600
            secondary: '#fb7185', // Rose 400
            accent: '#000000',
            background: '#ffffff',
            text: '#111827',
            cardBg: '#fafafa',
        },
        typography: {
            fontFamily: 'Inter, sans-serif',
            headingFont: 'Outfit, sans-serif',
            baseFontSize: '17px',
        },
        styles: {
            borderRadius: '0.25rem',
            cardShadow: '0 4px 0px rgba(0,0,0,1)',
            buttonStyle: 'neo',
            navStyle: 'classic',
            layoutType: 'grid',
            headerStyle: 'bold',
            cardStyle: 'bordered',
            animations: 'pop',
            logoAlignment: 'right',
            productImageAspect: 'square',
            descriptionAlignment: 'right',
        },
    },
    {
        id: 'men-minimal',
        name: 'Industrial Minimal (Men)',
        nameAr: 'مينيمال صناعي (رجالي)',
        category: 'men',
        description: 'Clean lines, dark accents, and practical layout.',
        colors: {
            primary: '#111827', // Gray 900
            secondary: '#4b5563', // Gray 600
            accent: '#2563eb', // Blue 600
            background: '#f3f4f6',
            text: '#111827',
            cardBg: '#ffffff',
        },
        typography: {
            fontFamily: 'Inter, sans-serif',
            headingFont: 'Inter, sans-serif',
            baseFontSize: '14px',
        },
        styles: {
            borderRadius: '0',
            cardShadow: 'none',
            buttonStyle: 'sharp',
            navStyle: 'classic',
            layoutType: 'compact',
            headerStyle: 'minimal',
            cardStyle: 'standard',
            animations: 'none',
            logoAlignment: 'left',
            productImageAspect: 'square',
            descriptionAlignment: 'left',
        },
    },
    {
        id: 'men-classic',
        name: 'Earth Tones (Men)',
        nameAr: 'ألوان ترابية (رجالي)',
        category: 'men',
        description: 'Warm and classic for a timeless look.',
        colors: {
            primary: '#78350f', // Amber 900
            secondary: '#d97706', // Amber 600
            accent: '#b45309', // Amber 700
            background: '#fffbeb',
            text: '#451a03',
            cardBg: '#ffffff',
        },
        typography: {
            fontFamily: 'Outfit, sans-serif',
            headingFont: 'Outfit, sans-serif',
            baseFontSize: '16px',
        },
        styles: {
            borderRadius: '0.5rem',
            cardShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
            buttonStyle: 'rounded',
            navStyle: 'centered',
            layoutType: 'grid',
            headerStyle: 'standard',
            cardStyle: 'standard',
            animations: 'fade',
            logoAlignment: 'right',
            productImageAspect: 'portrait',
            descriptionAlignment: 'right',
        },
    },
    {
        id: 'kids-playful',
        name: 'Kids Playful',
        nameAr: 'عالم الأطفال',
        category: 'kids',
        description: 'Bright colors and fun shapes.',
        colors: {
            primary: '#0ea5e9', // Sky 500
            secondary: '#fbbf24', // Amber 400
            accent: '#f43f5e', // Rose 500
            background: '#f0f9ff',
            text: '#0c4a6e',
            cardBg: '#ffffff',
        },
        typography: {
            fontFamily: 'Outfit, sans-serif',
            headingFont: 'Outfit, sans-serif',
            baseFontSize: '18px',
        },
        styles: {
            borderRadius: '2rem',
            cardShadow: '0 10px 15px -3px rgba(14, 165, 233, 0.2)',
            buttonStyle: 'pill',
            navStyle: 'centered',
            layoutType: 'modern',
            headerStyle: 'standard',
            cardStyle: 'minimalist',
            animations: 'pop',
            logoAlignment: 'center',
            productImageAspect: 'square',
            descriptionAlignment: 'center',
        },
    },
    {
        id: 'luxury-gold',
        name: 'Luxury Gold (Men)',
        nameAr: 'فخامة ذهبية (رجالي)',
        category: 'luxury',
        description: 'Black and gold for a premium feel.',
        colors: {
            primary: '#000000',
            secondary: '#ca8a04', // Gold 600
            accent: '#eab308', // Gold 500
            background: '#0a0a0a',
            text: '#ffffff',
            cardBg: '#1a1a1a',
        },
        typography: {
            fontFamily: 'Playfair Display, serif',
            headingFont: 'Playfair Display, serif',
            baseFontSize: '16px',
        },
        styles: {
            borderRadius: '0',
            cardShadow: '0 0 20px rgba(202, 138, 4, 0.15)',
            buttonStyle: 'sharp',
            navStyle: 'transparent',
            layoutType: 'modern',
            headerStyle: 'elegant',
            cardStyle: 'glass',
            animations: 'fade',
            logoAlignment: 'center',
            productImageAspect: 'portrait',
            descriptionAlignment: 'center',
        },
    },
    {
        id: 'luxury-rose',
        name: 'Premium Rose (Women)',
        nameAr: 'فخامة وردية (نسائي)',
        category: 'luxury',
        description: 'Sophisticated rose gold with white minimalist backdrop.',
        colors: {
            primary: '#be123c', // Rose 700
            secondary: '#fef2f2',
            accent: '#fb7185',
            background: '#ffffff',
            text: '#4c0519',
            cardBg: '#fffafa',
        },
        typography: {
            fontFamily: 'Outfit, sans-serif',
            headingFont: 'Playfair Display, serif',
            baseFontSize: '15px',
        },
        styles: {
            borderRadius: '0',
            cardShadow: '0 20px 25px -5px rgba(0,0,0,0.02)',
            buttonStyle: 'sharp',
            navStyle: 'glass',
            layoutType: 'masonry',
            headerStyle: 'elegant',
            cardStyle: 'minimalist',
            animations: 'slide',
            logoAlignment: 'center',
            productImageAspect: 'portrait',
            descriptionAlignment: 'center',
        },
    },
    {
        id: 'sports-dynamic',
        name: 'Sports Dynamic',
        nameAr: 'رياضي حيوي',
        category: 'sports',
        description: 'High energy and high contrast.',
        colors: {
            primary: '#000000',
            secondary: '#4ade80', // Green 400
            accent: '#22c55e', // Green 500
            background: '#ffffff',
            text: '#000000',
            cardBg: '#f8fafc',
        },
        typography: {
            fontFamily: 'Inter, sans-serif',
            headingFont: 'Anton, sans-serif',
            baseFontSize: '17px',
        },
        styles: {
            borderRadius: '0.75rem',
            cardShadow: '4px 4px 0px #000000',
            buttonStyle: 'neo',
            navStyle: 'classic',
            layoutType: 'grid',
            headerStyle: 'bold',
            cardStyle: 'bordered',
            animations: 'pop',
            logoAlignment: 'right',
            productImageAspect: 'video',
            descriptionAlignment: 'right',
        },
    },
];
