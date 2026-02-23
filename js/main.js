// Federal Innovations - Shared JavaScript
(function() {
    'use strict';

    // Configuration
    const config = {
        mouseParallaxIntensity: 30,
        scrollParallaxIntensity: 0.5,
        smoothing: 0.1
    };

    // State
    let mouseX = 0, mouseY = 0;
    let currentMouseX = 0, currentMouseY = 0;
    let scrollY = 0;
    let ticking = false;

    // Elements
    const parallaxLayers = document.querySelectorAll('.parallax-layer');
    const revealElements = document.querySelectorAll('.reveal');
    const tiltCards = document.querySelectorAll('[data-tilt]');

    // Smooth lerp function
    function lerp(start, end, factor) {
        return start + (end - start) * factor;
    }

    // Handle mouse movement
    function handleMouseMove(e) {
        mouseX = e.clientX;
        mouseY = e.clientY;
    }

    // Handle scroll
    function handleScroll() {
        scrollY = window.pageYOffset;
        if (!ticking) {
            requestAnimationFrame(updateScrollParallax);
            ticking = true;
        }
    }

    // Update scroll-based parallax
    function updateScrollParallax() {
        revealElements.forEach((el) => {
            const rect = el.getBoundingClientRect();
            const windowHeight = window.innerHeight;
            if (rect.top < windowHeight * 0.85) {
                el.classList.add('active');
            }
        });

        ticking = false;
    }

    // Update mouse-based parallax
    function updateMouseParallax() {
        currentMouseX = lerp(currentMouseX, mouseX, config.smoothing);
        currentMouseY = lerp(currentMouseY, mouseY, config.smoothing);

        const centerX = window.innerWidth / 2;
        const centerY = window.innerHeight / 2;
        const offsetX = (currentMouseX - centerX) / centerX;
        const offsetY = (currentMouseY - centerY) / centerY;

        const intensity = config.mouseParallaxIntensity;
        parallaxLayers.forEach((layer) => {
            const speed = parseFloat(layer.dataset.parallaxSpeed) || 0.5;
            layer.style.transform = `translate(${offsetX * intensity * speed * 0.3}px, ${offsetY * intensity * speed * 0.3}px)`;
        });

        requestAnimationFrame(updateMouseParallax);
    }

    // Initialize 3D tilt effect for cards
    function initTiltEffect() {
        tiltCards.forEach((card) => {
            card.addEventListener('mousemove', (e) => {
                const rect = card.getBoundingClientRect();
                const x = e.clientX - rect.left;
                const y = e.clientY - rect.top;
                const centerX = rect.width / 2;
                const centerY = rect.height / 2;
                const rotateX = (y - centerY) / centerY * -8;
                const rotateY = (x - centerX) / centerX * 8;

                card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateZ(10px)`;
            });

            card.addEventListener('mouseleave', () => {
                card.style.transform = 'perspective(1000px) rotateX(0) rotateY(0) translateZ(0)';
            });
        });
    }

    // Initialize
    function init() {
        initTiltEffect();

        document.addEventListener('mousemove', handleMouseMove);
        window.addEventListener('scroll', handleScroll, { passive: true });

        requestAnimationFrame(updateMouseParallax);
        handleScroll();

        setTimeout(() => {
            revealElements.forEach((el) => {
                const rect = el.getBoundingClientRect();
                if (rect.top < window.innerHeight) {
                    el.classList.add('active');
                }
            });
        }, 100);
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();

// Dynamic favicon update function
let lastFaviconColor = '';
function updateFavicon(hexColor) {
    if (lastFaviconColor === hexColor) return;
    lastFaviconColor = hexColor;

    const darkerHex = shadeColor(hexColor, -20);

    const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32">
  <defs>
    <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:${hexColor}"/>
      <stop offset="100%" style="stop-color:${darkerHex}"/>
    </linearGradient>
  </defs>
  <rect width="32" height="32" rx="6" fill="url(#grad)"/>
  <path d="M17.5 6L9 18h6l-1.5 8L22 14h-6l1.5-8z" fill="white"/>
</svg>`;

    const blob = new Blob([svg], { type: 'image/svg+xml' });
    const url = URL.createObjectURL(blob);
    let link = document.querySelector("link[rel*='icon']");
    if (link) {
        URL.revokeObjectURL(link.href);
        link.href = url;
    }
}

function shadeColor(color, percent) {
    const num = parseInt(color.replace('#', ''), 16);
    const amt = Math.round(2.55 * percent);
    const R = Math.max(0, Math.min(255, (num >> 16) + amt));
    const G = Math.max(0, Math.min(255, ((num >> 8) & 0x00FF) + amt));
    const B = Math.max(0, Math.min(255, (num & 0x0000FF) + amt));
    return '#' + (0x1000000 + R * 0x10000 + G * 0x100 + B).toString(16).slice(1);
}

// Accent Color Cycling
(function() {
    'use strict';

    const colorPalette = [
        { r: 139, g: 92, b: 246 },  // #8b5cf6 purple
        { r: 59,  g: 130, b: 246 }, // #3b82f6 blue
        { r: 245, g: 158, b: 11 }   // #f59e0b amber
    ];

    let colorIndex = 0;
    let colorProgress = 0;
    const transitionSpeed = 0.0008;

    function lerpColor(a, b, t) {
        return {
            r: Math.round(a.r + (b.r - a.r) * t),
            g: Math.round(a.g + (b.g - a.g) * t),
            b: Math.round(a.b + (b.b - a.b) * t)
        };
    }

    function toHex(c) {
        return '#' + ((1 << 24) + (c.r << 16) + (c.g << 8) + c.b).toString(16).slice(1);
    }

    function animate() {
        colorProgress += transitionSpeed;
        if (colorProgress >= 1) {
            colorProgress = 0;
            colorIndex = (colorIndex + 1) % colorPalette.length;
        }

        const nextIndex = (colorIndex + 1) % colorPalette.length;
        const color = lerpColor(colorPalette[colorIndex], colorPalette[nextIndex], colorProgress);
        const hex = toHex(color);

        document.documentElement.style.setProperty('--dynamic-r', color.r);
        document.documentElement.style.setProperty('--dynamic-g', color.g);
        document.documentElement.style.setProperty('--dynamic-b', color.b);
        document.documentElement.style.setProperty('--dynamic-color-hex', hex);

        updateFavicon(hex);

        requestAnimationFrame(animate);
    }

    requestAnimationFrame(animate);
})();

// Mobile Menu JavaScript
(function() {
    'use strict';

    const mobileMenuBtn = document.getElementById('mobileMenuBtn');
    const mobileMenu = document.getElementById('mobileMenu');
    const mobileServicesBtn = document.getElementById('mobileServicesBtn');
    const mobileServicesContent = document.getElementById('mobileServicesContent');
    const mobileNavLinks = document.querySelectorAll('.mobile-nav-link:not(#mobileServicesBtn)');
    const mobileDropdownItems = document.querySelectorAll('.mobile-dropdown-item');

    if (mobileMenuBtn && mobileMenu) {
        mobileMenuBtn.addEventListener('click', function() {
            this.classList.toggle('active');
            mobileMenu.classList.toggle('active');
            document.body.style.overflow = mobileMenu.classList.contains('active') ? 'hidden' : '';
        });
    }

    if (mobileServicesBtn && mobileServicesContent) {
        mobileServicesBtn.addEventListener('click', function() {
            mobileServicesContent.classList.toggle('active');
            const chevron = this.querySelector('.dropdown-chevron');
            if (chevron) {
                chevron.style.transform = mobileServicesContent.classList.contains('active') ? 'rotate(180deg)' : '';
            }
        });
    }

    mobileNavLinks.forEach(link => {
        link.addEventListener('click', function() {
            if (mobileMenuBtn && mobileMenu) {
                mobileMenuBtn.classList.remove('active');
                mobileMenu.classList.remove('active');
                document.body.style.overflow = '';
            }
        });
    });

    mobileDropdownItems.forEach(item => {
        item.addEventListener('click', function() {
            if (mobileMenuBtn && mobileMenu) {
                mobileMenuBtn.classList.remove('active');
                mobileMenu.classList.remove('active');
                document.body.style.overflow = '';
            }
        });
    });

    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape' && mobileMenu && mobileMenu.classList.contains('active')) {
            mobileMenuBtn.classList.remove('active');
            mobileMenu.classList.remove('active');
            document.body.style.overflow = '';
        }
    });
})();
