/**
 * SPA Router - Client-side routing for Federal Innovations
 * Handles subdomain detection, fragment loading, history management,
 * link interception, prefetching, and page transition animations.
 */
(function () {
  'use strict';

  // ---------------------------------------------------------------------------
  // Page mapping: subdomain name → fragment file
  // ---------------------------------------------------------------------------
  var PAGE_MAP = {
    '':                   'pages/home.html',
    'home':               'pages/home.html',
    'contact':            'pages/contact.html',
    'partners':           'pages/partners.html',
    'past-performance':   'pages/past-performance.html',
    'software-engineering': 'pages/software-engineering.html',
    'ai-systems':         'pages/ai-systems.html',
    'technical-advisory': 'pages/technical-advisory.html'
  };

  // Known page names for link interception matching
  var PAGE_NAMES = [
    'contact', 'partners', 'past-performance',
    'software-engineering', 'ai-systems', 'technical-advisory'
  ];

  // Paths that should be left to default browser behaviour
  var EXCLUDED_PREFIXES = ['/assets', '/css', '/js', '/pages', '/images'];

  // Prefetch cache
  var prefetchCache = new Map();

  // ---------------------------------------------------------------------------
  // Utility: map a name to its fragment file
  // ---------------------------------------------------------------------------
  function nameToPage(name) {
    // Strip leading/trailing slashes, .html extension, whitespace
    name = (name || '').replace(/^\/+|\/+$/g, '').replace(/\.html$/, '').trim();
    if (PAGE_MAP.hasOwnProperty(name)) {
      return PAGE_MAP[name];
    }
    // Fallback: try constructing the path directly
    return 'pages/' + name + '.html';
  }

  // ---------------------------------------------------------------------------
  // getInitialPage – determine which page to load on first visit
  // ---------------------------------------------------------------------------
  function getInitialPage() {
    // 1. Subdomain detection
    var hostname = location.hostname;
    if (hostname.endsWith('.federalinnovations.com') && hostname !== 'www.federalinnovations.com') {
      var subdomain = hostname.replace('.federalinnovations.com', '');
      return nameToPage(subdomain);
    }

    // 2. Session storage redirect (set by 404.html)
    var redirect = sessionStorage.getItem('spa-redirect');
    if (redirect) {
      sessionStorage.removeItem('spa-redirect');
      return nameToPage(redirect);
    }

    // 3. URL pathname (e.g. /contact)
    var pathname = location.pathname;
    if (pathname && pathname !== '/') {
      var segment = pathname.split('/').filter(Boolean)[0];
      if (segment) {
        return nameToPage(segment);
      }
    }

    // 4. URL hash (e.g. #contact)
    var hash = location.hash.replace(/^#\/?/, '');
    if (hash) {
      return nameToPage(hash);
    }

    // 5. Default
    return 'pages/home.html';
  }

  // ---------------------------------------------------------------------------
  // loadContent – fetch and inject a page fragment
  // ---------------------------------------------------------------------------
  function loadContent(url, pushState) {
    if (typeof pushState === 'undefined') pushState = true;

    // Resolve from prefetch cache or network
    var htmlPromise;
    if (prefetchCache.has(url)) {
      htmlPromise = Promise.resolve(prefetchCache.get(url));
    } else {
      htmlPromise = fetch(url).then(function (res) {
        if (!res.ok) throw new Error('Failed to load ' + url + ' (' + res.status + ')');
        return res.text();
      });
    }

    htmlPromise.then(function (html) {
      var main = document.getElementById('main-content');
      if (!main) return;

      // Exit animation
      main.classList.add('page-exit');

      return new Promise(function (resolve) {
        setTimeout(function () {
          resolve(html);
        }, 200);
      });
    }).then(function (html) {
      if (!html) return;

      var main = document.getElementById('main-content');
      if (!main) return;

      // Inject content
      main.innerHTML = html;
      main.classList.remove('page-exit');

      // Re-execute script tags
      var scripts = main.querySelectorAll('script');
      scripts.forEach(function (oldScript) {
        var newScript = document.createElement('script');
        // Copy attributes
        Array.from(oldScript.attributes).forEach(function (attr) {
          newScript.setAttribute(attr.name, attr.value);
        });
        newScript.textContent = oldScript.textContent;
        oldScript.parentNode.replaceChild(newScript, oldScript);
      });

      // Update meta tags
      if (typeof window.updateMeta === 'function') {
        window.updateMeta(url);
      }

      // Reinitialize page effects (scroll reveals, tilt, etc.)
      initPageEffects();

      // Push or replace history state
      var cleanUrl = url === 'pages/home.html'
        ? '/'
        : '/' + url.replace('pages/', '').replace('.html', '');

      if (pushState) {
        history.pushState({ url: url }, '', cleanUrl);
      }

      // Google Analytics page view
      if (typeof gtag !== 'undefined') {
        gtag('config', 'G-8GKDJGEP1Q', { page_path: cleanUrl });
      }

      // Scroll to top on navigation
      window.scrollTo(0, 0);
    }).catch(function (err) {
      console.error('[SPA Router] Load error:', err);
    });
  }

  // ---------------------------------------------------------------------------
  // Link interception – delegated click handler on document.body
  // ---------------------------------------------------------------------------
  function handleLinkClick(e) {
    // Walk up from target to find nearest <a>
    var link = e.target.closest('a');
    if (!link) return;

    // External links
    if (link.getAttribute('data-external') === 'true') {
      e.preventDefault();
      window.open(link.href, '_blank');
      return;
    }

    var href = link.getAttribute('data-href') || link.getAttribute('href');
    if (!href) return;

    // mailto:, tel:, and absolute http(s) links – default behaviour
    if (href.startsWith('mailto:') || href.startsWith('tel:') || href.startsWith('http')) {
      return;
    }

    // Excluded static-asset paths – default behaviour
    for (var i = 0; i < EXCLUDED_PREFIXES.length; i++) {
      if (href.startsWith(EXCLUDED_PREFIXES[i])) {
        return;
      }
    }

    // Home links
    if (href === '/' || href === '/home') {
      e.preventDefault();
      window.location.href = 'https://federalinnovations.com';
      return;
    }

    // Service sub-pages → redirect to subdomain
    if (href.startsWith('/services/')) {
      e.preventDefault();
      var serviceName = href.replace('/services/', '').replace('.html', '');
      window.location.href = 'https://' + serviceName + '.federalinnovations.com';
      return;
    }

    // Known page paths → redirect to subdomain
    var strippedHref = href.replace(/^\//, '').replace(/\.html$/, '');
    if (PAGE_NAMES.indexOf(strippedHref) !== -1) {
      e.preventDefault();
      window.location.href = 'https://' + strippedHref + '.federalinnovations.com';
      return;
    }
  }

  // ---------------------------------------------------------------------------
  // History API – popstate handler
  // ---------------------------------------------------------------------------
  function handlePopState(e) {
    if (e.state && e.state.url) {
      loadContent(e.state.url, false);
    }
  }

  // ---------------------------------------------------------------------------
  // Prefetching – load common pages during idle time
  // ---------------------------------------------------------------------------
  function startPrefetching() {
    var prefetchTargets = [
      'pages/home.html',
      'pages/contact.html',
      'pages/software-engineering.html',
      'pages/ai-systems.html',
      'pages/technical-advisory.html'
    ];

    var schedule = typeof requestIdleCallback === 'function'
      ? requestIdleCallback
      : function (cb) { setTimeout(cb, 200); };

    prefetchTargets.forEach(function (target) {
      schedule(function () {
        if (prefetchCache.has(target)) return;
        fetch(target)
          .then(function (res) {
            if (res.ok) return res.text();
          })
          .then(function (html) {
            if (html) prefetchCache.set(target, html);
          })
          .catch(function () {
            // Silently ignore prefetch failures
          });
      });
    });
  }

  // ---------------------------------------------------------------------------
  // initPageEffects – reinitialize reveal animations and tilt effects
  // ---------------------------------------------------------------------------
  function initPageEffects() {
    // Scroll reveal animations
    var revealElements = document.querySelectorAll('.reveal');
    revealElements.forEach(function (el) {
      var rect = el.getBoundingClientRect();
      if (rect.top < window.innerHeight * 0.85) {
        el.classList.add('active');
      }
    });

    // Observe future reveals on scroll
    var onScroll = function () {
      var els = document.querySelectorAll('.reveal:not(.active)');
      els.forEach(function (el) {
        var rect = el.getBoundingClientRect();
        if (rect.top < window.innerHeight * 0.85) {
          el.classList.add('active');
        }
      });
    };
    window.removeEventListener('scroll', onScroll);
    window.addEventListener('scroll', onScroll, { passive: true });

    // Card tilt effects
    var tiltCards = document.querySelectorAll('[data-tilt]');
    tiltCards.forEach(function (card) {
      card.addEventListener('mousemove', function (e) {
        var rect = card.getBoundingClientRect();
        var x = e.clientX - rect.left;
        var y = e.clientY - rect.top;
        var centerX = rect.width / 2;
        var centerY = rect.height / 2;
        var rotateX = (y - centerY) / centerY * -8;
        var rotateY = (x - centerX) / centerX * 8;
        card.style.transform = 'perspective(1000px) rotateX(' + rotateX + 'deg) rotateY(' + rotateY + 'deg) translateZ(10px)';
      });

      card.addEventListener('mouseleave', function () {
        card.style.transform = 'perspective(1000px) rotateX(0) rotateY(0) translateZ(0)';
      });
    });

    // Trigger reveals after a short delay for newly injected content
    setTimeout(function () {
      var els = document.querySelectorAll('.reveal:not(.active)');
      els.forEach(function (el) {
        var rect = el.getBoundingClientRect();
        if (rect.top < window.innerHeight) {
          el.classList.add('active');
        }
      });
    }, 100);
  }

  // ---------------------------------------------------------------------------
  // Init – bootstrap the SPA
  // ---------------------------------------------------------------------------
  function init() {
    var initialPage = getInitialPage();

    // Load initial page content without pushing a new history entry
    loadContent(initialPage, false);

    // Replace current history state with the initial page info
    var cleanUrl = initialPage === 'pages/home.html'
      ? '/'
      : '/' + initialPage.replace('pages/', '').replace('.html', '');
    history.replaceState({ url: initialPage }, '', cleanUrl);

    // Listen for back/forward navigation
    window.addEventListener('popstate', handlePopState);

    // Delegated link click interception
    document.body.addEventListener('click', handleLinkClick);

    // Start prefetching common pages
    startPrefetching();
  }

  // Run when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
