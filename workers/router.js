const ROOT_DOMAIN = 'federalinnovations.com';
// Trigger redeploy
const INTERNAL_HEADER = 'X-CF-Worker-Internal';
const EXCLUDED_PATHS = [
  'index.html', 'sw.js', 'manifest.json', 'favicon',
  'assets', 'images', 'css', 'js', 'pages', '.well-known'
];
const STATIC_ASSET_REGEX = /\.(js|css|png|jpg|jpeg|gif|svg|ico|woff|woff2|ttf|eot|json|pdf|webp|html)$/i;

export default {
  async fetch(request, env, ctx) {
    // If request has internal header, pass through to origin
    if (request.headers.get(INTERNAL_HEADER)) {
      return fetch(request);
    }

    const url = new URL(request.url);
    const hostname = url.hostname;

    // Subdomain routing (not www)
    if (hostname.endsWith(`.${ROOT_DOMAIN}`) && hostname !== `www.${ROOT_DOMAIN}`) {
      return handleSubdomain(request, url, hostname);
    }

    // Main domain or www
    if (hostname === ROOT_DOMAIN || hostname === `www.${ROOT_DOMAIN}`) {
      return handleMainDomain(request, url);
    }

    // Otherwise pass through
    return fetch(request);
  }
};

async function handleSubdomain(request, url, hostname) {
  const subdomain = hostname.replace(`.${ROOT_DOMAIN}`, '');

  // Static assets: rewrite hostname to root domain and fetch with internal header
  if (STATIC_ASSET_REGEX.test(url.pathname)) {
    const rewrittenUrl = new URL(url.toString());
    rewrittenUrl.hostname = ROOT_DOMAIN;

    const modifiedRequest = new Request(rewrittenUrl.toString(), {
      method: request.method,
      headers: new Headers(request.headers),
      body: request.body,
      redirect: request.redirect
    });
    modifiedRequest.headers.set(INTERNAL_HEADER, 'true');

    return fetch(modifiedRequest);
  }

  // Non-static: fetch root index.html (SPA handles routing)
  const indexRequest = new Request(`https://${ROOT_DOMAIN}/`, {
    method: 'GET',
    headers: new Headers(request.headers)
  });
  indexRequest.headers.set(INTERNAL_HEADER, 'true');

  return fetch(indexRequest);
}

async function handleMainDomain(request, url) {
  // Root path: pass through
  if (url.pathname === '/') {
    return fetch(request);
  }

  // Extract first path segment
  const pathParts = url.pathname.split('/').filter(Boolean);
  const firstSegment = pathParts[0];

  // Excluded paths: pass through
  if (EXCLUDED_PATHS.some(excluded => firstSegment === excluded || firstSegment.startsWith(excluded))) {
    return fetch(request);
  }

  // Services path: /services/software-engineering → software-engineering.federalinnovations.com
  if (firstSegment === 'services' && pathParts.length > 1) {
    const serviceName = pathParts[1].replace(/\.html$/, '');
    const redirectUrl = `https://${serviceName}.${ROOT_DOMAIN}/`;
    return Response.redirect(redirectUrl, 301);
  }

  // .html extension: strip it and redirect to subdomain
  if (firstSegment.endsWith('.html')) {
    const subdomain = firstSegment.replace(/\.html$/, '');
    const remainingPath = pathParts.slice(1).join('/');
    const redirectUrl = `https://${subdomain}.${ROOT_DOMAIN}${remainingPath ? '/' + remainingPath : ''}`;
    return Response.redirect(redirectUrl, 301);
  }

  // Other file extensions (contains a dot but not .html): pass through
  if (firstSegment.includes('.')) {
    return fetch(request);
  }

  // Default: 301 redirect to subdomain, preserving remaining path
  const remainingPath = pathParts.slice(1).join('/');
  const redirectUrl = `https://${firstSegment}.${ROOT_DOMAIN}${remainingPath ? '/' + remainingPath : ''}`;
  return Response.redirect(redirectUrl, 301);
}
