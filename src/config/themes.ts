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
        name: 'Classic Professional',
        nameAr: 'النمط الكلاسيكي الاحترافي',
        category: 'default',
        description: 'Clean, trusted and professional look for any business.',
        colors: {
            primary: '#1e40af', // Blue 800
            secondary: '#60a5fa', // Blue 400
            accent: '#f59e0b', // Amber 500
            background: '#ffffff',
            text: '#0f172a',
            cardBg: '#ffffff',
        },
        typography: {
            fontFamily: 'Inter, sans-serif',
            headingFont: 'Outfit, sans-serif',
            baseFontSize: '16px',
        },
        styles: {
            borderRadius: '0.75rem',
            cardShadow: '0 4px 6px -1px rgba(0,0,0,0.1)',
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
        id: 'elegant-rose',
        name: 'Soft Elegance',
        nameAr: 'أناقة ناعمة (رُقي)',
        category: 'women',
        description: 'Sophisticated and gentle style perfect for fashion and beauty.',
        colors: {
            primary: '#9d174d', // Rose 800
            secondary: '#fbcfe8', // Pink 200
            accent: '#be123c', // Rose 700
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
            borderRadius: '2rem',
            cardShadow: '0 20px 25px -5px rgba(157, 23, 77, 0.05)',
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
        id: 'modern-bold',
        name: 'Modern Bold',
        nameAr: 'نمط عصري جريء',
        category: 'sports',
        description: 'Vibrant colors and high contrast for a strong brand presence.',
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
        id: 'luxury-premium',
        name: 'Luxury Dark',
        nameAr: 'فخامة ملكية (داكن)',
        category: 'luxury',
        description: 'Premium dark aesthetic with gold accents for high-end stores.',
        colors: {
            primary: '#ca8a04', // Gold 600
            secondary: '#1a1a1a',
            accent: '#eab308', // Gold 500
            background: '#0a0a0a',
            text: '#ffffff',
            cardBg: '#111111',
        },
        typography: {
            fontFamily: 'Playfair Display, serif',
            headingFont: 'Playfair Display, serif',
            baseFontSize: '16px',
        },
        styles: {
            borderRadius: '0',
            cardShadow: '0 0 20px rgba(202, 138, 4, 0.1)',
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
        id: 'dynamic-playful',
        name: 'Dynamic Playful',
        nameAr: 'حيوي ومرح (أطفال)',
        category: 'kids',
        description: 'Fun, colorful and energetic design for a friendly vibe.',
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
            borderRadius: '1.5rem',
            cardShadow: '0 10px 15px -3px rgba(14, 165, 233, 0.1)',
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
];
