import React, { useEffect } from 'react';
import { STORE_THEMES, StoreTheme } from '@/config/themes';

interface StoreThemeWrapperProps {
  themeId: string;
  customColors?: {
    primary?: string;
    secondary?: string;
    background?: string;
    text?: string;
  };
  children: React.ReactNode;
}

export const StoreThemeWrapper: React.FC<StoreThemeWrapperProps> = ({ themeId, customColors, children }) => {
  const theme = STORE_THEMES.find((t) => t.id === themeId) || STORE_THEMES[0];

  useEffect(() => {
    const root = document.documentElement;
    // Start with default theme colors
    const colors = { ...theme.colors };

    // Override with custom colors if provided
    // Override with custom colors if provided
    if (customColors?.primary) colors.primary = customColors.primary;
    if (customColors?.secondary) {
      colors.secondary = customColors.secondary;
      colors.cardBg = customColors.secondary;
    }
    if (customColors?.background) colors.background = customColors.background;
    if (customColors?.text) colors.text = customColors.text;

    const styles = theme.styles;

    // Core Colors
    root.style.setProperty('--store-primary', colors.primary);
    root.style.setProperty('--store-secondary', colors.secondary);
    root.style.setProperty('--store-accent', colors.accent);
    root.style.setProperty('--store-background', colors.background);
    root.style.setProperty('--store-text', colors.text);
    root.style.setProperty('--store-card-bg', colors.cardBg);

    // Style Variables
    root.style.setProperty('--store-radius', styles.borderRadius);
    root.style.setProperty('--store-shadow', styles.cardShadow);

    // Font Variables
    root.style.setProperty('--store-font', theme.typography.fontFamily);
    root.style.setProperty('--store-heading-font', theme.typography.headingFont);

    // Component Styles
    root.style.setProperty('--store-nav-style', styles.navStyle);
    root.style.setProperty('--store-header-style', styles.headerStyle);
    root.style.setProperty('--store-card-style', styles.cardStyle);
    root.style.setProperty('--store-layout', styles.layoutType);

    // Load Fonts Dynamically
    const fontFamilies = [theme.typography.fontFamily, theme.typography.headingFont];
    fontFamilies.forEach(font => {
      if (font && !font.includes('sans-serif') && !font.includes('serif')) {
        const fontName = font.split(',')[0].replace(/['"]/g, '').replace(/ /g, '+');
        if (!document.getElementById(`font-${fontName}`)) {
          const link = document.createElement('link');
          link.id = `font-${fontName}`;
          link.rel = 'stylesheet';
          link.href = `https://fonts.googleapis.com/css2?family=${fontName}:wght@400;500;600;700;800;900&display=swap`;
          document.head.appendChild(link);
        }
      }
    });

    // Special case for Anton and Playfair
    ['Anton', 'Playfair+Display'].forEach(fontName => {
      if ((theme.typography.fontFamily.includes(fontName.replace('+', ' ')) || theme.typography.headingFont.includes(fontName.replace('+', ' '))) && !document.getElementById(`font-${fontName}`)) {
        const link = document.createElement('link');
        link.id = `font-${fontName}`;
        link.rel = 'stylesheet';
        link.href = `https://fonts.googleapis.com/css2?family=${fontName}:wght@400;700;900&display=swap`;
        document.head.appendChild(link);
      }
    });

  }, [theme, customColors]);

  const getActiveColors = () => {
    const colors = { ...theme.colors };
    if (customColors?.primary) colors.primary = customColors.primary;
    if (customColors?.secondary) {
      colors.secondary = customColors.secondary;
      // User requested secondary color to replace white backgrounds
      colors.cardBg = customColors.secondary;
    }
    if (customColors?.background) colors.background = customColors.background;
    if (customColors?.text) colors.text = customColors.text;
    return colors;
  };

  const activeColors = getActiveColors();

  return (
    <div
      className={`min-h-screen transition-all duration-700 ease-in-out theme-anim-${theme.styles.animations}`}
      style={{
        backgroundColor: activeColors.background,
        color: activeColors.text,
        fontFamily: theme.typography.fontFamily
      }}
    >
      <style dangerouslySetInnerHTML={{
        __html: `
        :root {
          --primary: var(--store-primary);
          --primary-foreground: ${activeColors.background === '#ffffff' || activeColors.background === '#f8fafc' ? 'white' : 'var(--store-background)'};
        }
        
        h1, h2, h3, h4, h5, h6 {
          font-family: var(--store-heading-font);
        }

        /* Button Styles */
        .store-btn {
          border-radius: var(--store-radius);
          background-color: var(--store-primary);
          color: white;
          transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
          border: none;
        }

        ${theme.styles.buttonStyle === 'pill' ? '.store-btn { border-radius: 9999px; }' : ''}
        ${theme.styles.buttonStyle === 'sharp' ? '.store-btn { border-radius: 0px; }' : ''}
        ${theme.styles.buttonStyle === 'neo' ? `
          .store-btn { 
            border-radius: var(--store-radius); 
            border: 2px solid var(--store-text);
            box-shadow: 4px 4px 0px var(--store-text);
            transform: translate(-2px, -2px);
          }
          .store-btn:active {
            box-shadow: 0px 0px 0px var(--store-text);
            transform: translate(2px, 2px);
          }
        ` : ''}

        /* Card Styles */
        .store-card {
          background-color: var(--store-card-bg);
          border-radius: var(--store-radius);
          box-shadow: var(--store-shadow);
          transition: all 0.5s cubic-bezier(0.4, 0, 0.2, 1);
          border: 1px solid transparent;
        }

        ${(theme.styles.cardStyle === 'minimalist' && !customColors?.secondary) ? '.store-card { border: none; box-shadow: none; background: transparent; }' : ''}
        ${theme.styles.cardStyle === 'bordered' ? '.store-card { border: 2px solid var(--store-text); box-shadow: 6px 6px 0px var(--store-text); }' : ''}
        ${theme.styles.cardStyle === 'glass' ? `
          .store-card { 
            background: rgba(255, 255, 255, 0.05); 
            backdrop-filter: blur(12px); 
            border: 1px solid rgba(255, 255, 255, 0.1); 
          }
        ` : ''}

        .store-card:hover {
          ${theme.styles.cardStyle !== 'bordered' ? 'transform: translateY(-8px);' : 'transform: translate(-2px, -2px); box-shadow: 8px 8px 0px var(--store-text);'}
        }

        /* Navigation Styles */
        .store-nav {
          ${theme.styles.navStyle === 'glass' ? 'background: rgba(255, 255, 255, 0.7); backdrop-filter: blur(10px); border-bottom: 1px solid rgba(0,0,0,0.05);' : ''}
          ${theme.styles.navStyle === 'transparent' ? 'background: transparent;' : ''}
          ${theme.styles.navStyle === 'centered' ? 'text-align: center;' : ''}
        }

        /* Animations */
        .theme-anim-fade { animation: fadeIn 0.8s ease-out; }
        .theme-anim-slide { animation: slideUp 0.8s cubic-bezier(0.2, 0.8, 0.2, 1); }
        .theme-anim-pop { animation: popIn 0.6s cubic-bezier(0.175, 0.885, 0.32, 1.275); }

        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes slideUp { from { opacity: 0; transform: translateY(30px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes popIn { from { opacity: 0; transform: scale(0.9); } to { opacity: 1; transform: scale(1); } }

        /* Custom Scrollbar */
        ::-webkit-scrollbar { width: 8px; }
        ::-webkit-scrollbar-track { background: var(--store-background); }
        ::-webkit-scrollbar-thumb { 
          background: var(--store-primary); 
          border-radius: 10px; 
          border: 2px solid var(--store-background);
        }
      `}} />
      {children}
    </div>
  );
};
