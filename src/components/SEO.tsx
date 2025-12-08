import { Helmet } from 'react-helmet-async';

interface SEOProps {
    title: string;
    description: string;
    url?: string;
    image?: string;
    type?: string;
}

export default function SEO({ title, description, url, image, type = 'website' }: SEOProps) {
    const siteName = 'Bazzarna';
    const fullTitle = `${title} | ${siteName}`;
    const defaultImage = 'https://bazzarna.dz/assets/og-image.webp';
    const siteUrl = 'https://bazzarna.dz';
    const currentUrl = url || siteUrl;
    const currentImage = image || defaultImage;

    return (
        <Helmet>
            {/* Standard Metadata */}
            <title>{fullTitle}</title>
            <meta name="description" content={description} />
            <link rel="canonical" href={currentUrl} />

            {/* Open Graph */}
            <meta property="og:title" content={fullTitle} />
            <meta property="og:description" content={description} />
            <meta property="og:type" content={type} />
            <meta property="og:url" content={currentUrl} />
            <meta property="og:image" content={currentImage} />
            <meta property="og:site_name" content={siteName} />

            {/* Twitter Cards */}
            <meta name="twitter:card" content="summary_large_image" />
            <meta name="twitter:title" content={fullTitle} />
            <meta name="twitter:description" content={description} />
            <meta name="twitter:image" content={currentImage} />
        </Helmet>
    );
}
