# Federal Innovations

[![Cloudflare Pages](https://img.shields.io/badge/Hosted%20on-Cloudflare-orange?logo=cloudflare)](https://federalinnovations.com)
[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

> Driving Innovation in Government Technology

## About

Federal Innovations is a consulting and software development agency focused on modernizing government technology and improving federal services. We serve federal agencies and government contractors across three core areas:

- **Software Engineering** — Custom, scalable, secure software for federal agencies including full-stack architecture and cloud-native development
- **AI Systems & Enablement** — Strategic AI implementation for defense and intelligence, including LLM integration and optimization
- **Technical Advisory** — Government contracting expertise and technical guidance

## Website

Visit our website at [federalinnovations.com](https://federalinnovations.com)

## Tech Stack

- **Vanilla JavaScript** — Single-page application with client-side routing and fragment loading
- **Tailwind CSS** — Utility-first styling via CDN
- **Google Fonts** — Inter and Outfit typefaces
- **Cloudflare Workers** — Edge routing with subdomain-based navigation
- **Service Worker** — Offline-capable with static asset pre-caching

### Features

- Client-side SPA router with history API, link prefetching, and page transitions
- Subdomain routing via Cloudflare Worker (e.g., `software-engineering.federalinnovations.com`)
- Mouse-based parallax effects and scroll-triggered animations
- Glassmorphism UI with dark theme
- Responsive bento-grid layouts
- Card tilt effects on hover

## Project Structure

```
├── index.html              # Main shell / entry point
├── pages/                  # HTML fragments loaded by the SPA router
│   ├── home.html
│   ├── software-engineering.html
│   ├── ai-systems.html
│   ├── technical-advisory.html
│   ├── past-performance.html
│   ├── partners.html
│   └── contact.html
├── js/
│   ├── spa-router.js       # Client-side routing and fragment loading
│   ├── main.js             # Core site logic
│   ├── bg.js               # Background canvas effects
│   ├── bg-interact.js      # Interactive background mouse tracking
│   └── meta-manager.js     # Dynamic meta tag management
├── workers/
│   └── router.js           # Cloudflare Worker for subdomain routing
├── sw.js                   # Service worker for offline caching
└── wrangler.toml           # Cloudflare Workers configuration
```

## Development

### Local Development

Clone the repo and serve the files locally:

```bash
# Using Python
python -m http.server 8000

# Using Node.js
npx serve

# Using Cloudflare Wrangler (for testing worker routing)
npx wrangler dev
```

Then visit `http://localhost:8000` in your browser.

### Deployment

The site deploys to Cloudflare Pages when changes are pushed to the `main` branch. A Cloudflare Worker handles subdomain routing, mapping subdomains like `ai-systems.federalinnovations.com` to the corresponding page fragment.

## Pages

| Page | Route | Description |
|------|-------|-------------|
| Home | `/` | Hero landing with service overview |
| Software Engineering | `/software-engineering` | Full-stack and cloud-native development services |
| AI Systems & Enablement | `/ai-systems` | AI strategy, LLM integration, and optimization |
| Technical Advisory | `/technical-advisory` | Government contracting expertise |
| Past Performance | `/past-performance` | Case studies and portfolio |
| Partners | `/partners` | Partnership and integration information |
| Contact | `/contact` | Inquiry and contact forms |

## Contributing

We welcome contributions! Please see our [Contributing Guidelines](CONTRIBUTING.md) for details.

## Security

For security concerns, please review our [Security Policy](SECURITY.md).

## License

This project is licensed under the MIT License — see the [LICENSE](LICENSE) file for details.

## Contact

- **Email**: [contact@federalinnovations.com](mailto:contact@federalinnovations.com)
- **Website**: [federalinnovations.com](https://federalinnovations.com)
