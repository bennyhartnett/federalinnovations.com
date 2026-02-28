const ORIGIN_DOMAIN = 'federalinnovations.com';
const INTERNAL_HEADER = 'X-CF-Worker-Internal';
const EXCLUDED_PATHS = [
  'index.html', 'sw.js', 'manifest.json', 'favicon',
  'assets', 'images', 'css', 'js', 'pages', '.well-known'
];
const STATIC_ASSET_REGEX = /\.(js|css|png|jpg|jpeg|gif|svg|ico|woff|woff2|ttf|eot|json|pdf|webp|html)$/i;

// All domains routed through this worker
const KNOWN_DOMAINS = ['federalinnovations.com', 'bennyhartnett.com'];

// IDN punycode → ASCII alias mapping
const IDN_ALIASES = {
  'xn--rsum-bpad': 'resume'   // résumé → resume
};

function getRootDomain(hostname) {
  for (const domain of KNOWN_DOMAINS) {
    if (hostname === domain || hostname === `www.${domain}` || hostname.endsWith(`.${domain}`)) {
      return domain;
    }
  }
  return null;
}

function normalizeSubdomain(subdomain) {
  return IDN_ALIASES[subdomain] || subdomain;
}

export default {
  async fetch(request, env, ctx) {
    if (request.headers.get(INTERNAL_HEADER)) {
      return fetch(request);
    }

    const url = new URL(request.url);
    const hostname = url.hostname;
    const rootDomain = getRootDomain(hostname);

    if (!rootDomain) {
      return fetch(request);
    }

    // Subdomain routing (not www)
    if (hostname.endsWith(`.${rootDomain}`) && hostname !== `www.${rootDomain}`) {
      return handleSubdomain(request, url, hostname, rootDomain);
    }

    // Main domain or www
    if (hostname === rootDomain || hostname === `www.${rootDomain}`) {
      return handleMainDomain(request, url, rootDomain);
    }

    return fetch(request);
  }
};

async function handleSubdomain(request, url, hostname, rootDomain) {
  const rawSubdomain = hostname.replace(`.${rootDomain}`, '');
  const subdomain = normalizeSubdomain(rawSubdomain);

  // If IDN alias resolved to a different name, 301 redirect to the canonical subdomain
  if (subdomain !== rawSubdomain) {
    const canonicalUrl = new URL(url.toString());
    canonicalUrl.hostname = `${subdomain}.${rootDomain}`;
    return Response.redirect(canonicalUrl.toString(), 301);
  }

  // Static assets: rewrite hostname to origin domain and fetch with internal header
  if (STATIC_ASSET_REGEX.test(url.pathname)) {
    const rewrittenUrl = new URL(url.toString());
    rewrittenUrl.hostname = ORIGIN_DOMAIN;

    const modifiedRequest = new Request(rewrittenUrl.toString(), {
      method: request.method,
      headers: new Headers(request.headers),
      body: request.body,
      redirect: request.redirect
    });
    modifiedRequest.headers.set(INTERNAL_HEADER, 'true');

    return fetch(modifiedRequest);
  }

  // Non-static: fetch root index.html from origin (SPA handles routing)
  const indexRequest = new Request(`https://${ORIGIN_DOMAIN}/`, {
    method: 'GET',
    headers: new Headers(request.headers)
  });
  indexRequest.headers.set(INTERNAL_HEADER, 'true');

  return fetch(indexRequest);
}

async function handleMainDomain(request, url, rootDomain) {
  // Root path
  if (url.pathname === '/') {
    if (rootDomain !== ORIGIN_DOMAIN) {
      return Response.redirect(`https://${ORIGIN_DOMAIN}/`, 301);
    }
    return fetch(request);
  }

  // Extract first path segment
  const pathParts = url.pathname.split('/').filter(Boolean);
  const firstSegment = pathParts[0];

  // Excluded paths: pass through to origin
  if (EXCLUDED_PATHS.some(excluded => firstSegment === excluded || firstSegment.startsWith(excluded))) {
    if (rootDomain !== ORIGIN_DOMAIN) {
      const rewrittenUrl = new URL(url.toString());
      rewrittenUrl.hostname = ORIGIN_DOMAIN;
      const modifiedRequest = new Request(rewrittenUrl.toString(), {
        method: request.method,
        headers: new Headers(request.headers),
        body: request.body,
        redirect: request.redirect
      });
      modifiedRequest.headers.set(INTERNAL_HEADER, 'true');
      return fetch(modifiedRequest);
    }
    return fetch(request);
  }

  // Services path: /services/software-engineering → software-engineering.rootDomain
  if (firstSegment === 'services' && pathParts.length > 1) {
    const serviceName = pathParts[1].replace(/\.html$/, '');
    const redirectUrl = `https://${serviceName}.${rootDomain}/`;
    return Response.redirect(redirectUrl, 301);
  }

  // .html extension: strip it and redirect to subdomain
  if (firstSegment.endsWith('.html')) {
    const subdomain = firstSegment.replace(/\.html$/, '');
    const remainingPath = pathParts.slice(1).join('/');
    const redirectUrl = `https://${subdomain}.${rootDomain}${remainingPath ? '/' + remainingPath : ''}`;
    return Response.redirect(redirectUrl, 301);
  }

  // Other file extensions (contains a dot but not .html): pass through
  if (firstSegment.includes('.')) {
    if (rootDomain !== ORIGIN_DOMAIN) {
      const rewrittenUrl = new URL(url.toString());
      rewrittenUrl.hostname = ORIGIN_DOMAIN;
      const modifiedRequest = new Request(rewrittenUrl.toString(), {
        method: request.method,
        headers: new Headers(request.headers),
        body: request.body,
        redirect: request.redirect
      });
      modifiedRequest.headers.set(INTERNAL_HEADER, 'true');
      return fetch(modifiedRequest);
    }
    return fetch(request);
  }

  // Default: 301 redirect to subdomain, preserving remaining path
  const remainingPath = pathParts.slice(1).join('/');
  const redirectUrl = `https://${firstSegment}.${rootDomain}${remainingPath ? '/' + remainingPath : ''}`;
  return Response.redirect(redirectUrl, 301);
}
