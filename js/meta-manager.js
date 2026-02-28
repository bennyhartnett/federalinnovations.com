/**
 * Meta Manager - Dynamic meta tag management for Federal Innovations SPA
 * Updates document title, description, canonical URL, Open Graph, and Twitter meta tags
 * based on the current page being displayed.
 */
(function () {
  'use strict';

  const META = {
    'pages/home.html': {
      title: 'Federal Innovations',
      description: 'Software development, AI modernization and optimization, and government contracting advisory',
      canonical: 'https://federalinnovations.com/',
      ogUrl: 'https://federalinnovations.com/'
    },
    'pages/contact.html': {
      title: 'Contact | Federal Innovations',
      description: 'Contact Federal Innovations - Get in touch for software development, AI, and government contracting services',
      canonical: 'https://contact.federalinnovations.com/',
      ogUrl: 'https://contact.federalinnovations.com/'
    },
    'pages/partners.html': {
      title: 'Partners | Federal Innovations',
      description: 'Federal Innovations - Our technology and teaming partners in the federal marketplace',
      canonical: 'https://partners.federalinnovations.com/',
      ogUrl: 'https://partners.federalinnovations.com/'
    },
    'pages/past-performance.html': {
      title: 'Past Performance | Federal Innovations',
      description: 'Federal Innovations - Our past performance and successful federal projects',
      canonical: 'https://past-performance.federalinnovations.com/',
      ogUrl: 'https://past-performance.federalinnovations.com/'
    },
    'pages/software-engineering.html': {
      title: 'Software Engineering | Federal Innovations',
      description: 'Custom software engineering solutions for federal agencies and government contractors',
      canonical: 'https://software-engineering.federalinnovations.com/',
      ogUrl: 'https://software-engineering.federalinnovations.com/'
    },
    'pages/ai-systems.html': {
      title: 'AI Systems & Enablement | Federal Innovations',
      description: 'AI strategy, implementation and optimization for federal agencies and government contractors',
      canonical: 'https://ai-systems.federalinnovations.com/',
      ogUrl: 'https://ai-systems.federalinnovations.com/'
    },
    'pages/technical-advisory.html': {
      title: 'Technical Advisory | Federal Innovations',
      description: 'Technical advisory services for software, AI, and government contracting',
      canonical: 'https://technical-advisory.federalinnovations.com/',
      ogUrl: 'https://technical-advisory.federalinnovations.com/'
    },
    'pages/resume.html': {
      title: 'Benny Hartnett | R\u00e9sum\u00e9',
      description: 'Benny Hartnett - Software engineer, AI practitioner, and federal technology consultant in Washington, D.C.',
      canonical: 'https://resume.bennyhartnett.com/',
      ogUrl: 'https://resume.bennyhartnett.com/'
    }
  };

  /**
   * Update all meta tags for the given page URL.
   * @param {string} pageUrl - The page key, e.g. "pages/contact.html"
   */
  function updateMeta(pageUrl) {
    var data = META[pageUrl];
    if (!data) return;

    // Document title
    document.title = data.title;

    // Standard meta description
    var descriptionTag = document.querySelector('meta[name="description"]');
    if (descriptionTag) descriptionTag.setAttribute('content', data.description);

    // Canonical link
    var canonicalTag = document.querySelector('link[rel="canonical"]');
    if (canonicalTag) canonicalTag.setAttribute('href', data.canonical);

    // Open Graph tags
    var ogUrl = document.querySelector('meta[property="og:url"]');
    if (ogUrl) ogUrl.setAttribute('content', data.ogUrl);

    var ogTitle = document.querySelector('meta[property="og:title"]');
    if (ogTitle) ogTitle.setAttribute('content', data.title);

    var ogDescription = document.querySelector('meta[property="og:description"]');
    if (ogDescription) ogDescription.setAttribute('content', data.description);

    // Twitter tags
    var twitterUrl = document.querySelector('meta[name="twitter:url"]');
    if (twitterUrl) twitterUrl.setAttribute('content', data.ogUrl);

    var twitterTitle = document.querySelector('meta[name="twitter:title"]');
    if (twitterTitle) twitterTitle.setAttribute('content', data.title);

    var twitterDescription = document.querySelector('meta[name="twitter:description"]');
    if (twitterDescription) twitterDescription.setAttribute('content', data.description);
  }

  // Expose globally so the SPA router can call it
  window.updateMeta = updateMeta;
})();
