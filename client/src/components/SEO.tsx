import React, { useEffect } from 'react';

interface SEOProps {
  title: string;
  description: string;
  image?: string;
  url?: string;
}

export const SEO: React.FC<SEOProps> = ({ title, description, image, url }) => {
  useEffect(() => {
    // Update Title
    document.title = `${title} | LuxeEstate`;

    // Helper to update or create meta tags
    const updateMeta = (name: string, content: string, attribute = 'name') => {
      let element = document.querySelector(`meta[${attribute}="${name}"]`);
      if (!element) {
        element = document.createElement('meta');
        element.setAttribute(attribute, name);
        document.head.appendChild(element);
      }
      element.setAttribute('content', content);
    };

    // Standard Meta
    updateMeta('description', description);

    // Open Graph / Facebook
    updateMeta('og:title', title, 'property');
    updateMeta('og:description', description, 'property');
    updateMeta('og:type', 'website', 'property');
    if (image) updateMeta('og:image', image, 'property');
    if (url) updateMeta('og:url', url, 'property');

    // Twitter
    updateMeta('twitter:card', 'summary_large_image', 'name');
    updateMeta('twitter:title', title, 'name');
    updateMeta('twitter:description', description, 'name');
    if (image) updateMeta('twitter:image', image, 'name');

    return () => {
      // Cleanup not strictly necessary for SPA titles but good practice to reset if needed
      // document.title = 'LuxeEstate'; 
    };
  }, [title, description, image, url]);

  return null;
};
