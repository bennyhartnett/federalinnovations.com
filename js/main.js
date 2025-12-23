// Federal Innovations - Shared JavaScript
(function() {
    'use strict';

    // Configuration
    const config = {
        particleCount: 15,
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
    const mouseGlow = document.getElementById('mouseGlow');
    const orb1 = document.getElementById('orb1');
    const orb2 = document.getElementById('orb2');
    const orb3 = document.getElementById('orb3');
    const gridBg = document.getElementById('gridBg');
    const particlesContainer = document.getElementById('particles');
    const parallaxLayers = document.querySelectorAll('.parallax-layer');
    const revealElements = document.querySelectorAll('.reveal');
    const tiltCards = document.querySelectorAll('[data-tilt]');

    // Create floating particles
    function createParticles() {
        if (!particlesContainer) return;
        for (let i = 0; i < config.particleCount; i++) {
            const particle = document.createElement('div');
            particle.className = 'particle';
            const size = Math.random() * 4 + 2;
            const x = Math.random() * 100;
            const y = Math.random() * 100;
            const delay = Math.random() * 8;
            const duration = 8 + Math.random() * 4;
            const opacity = Math.random() * 0.3 + 0.1;

            particle.style.cssText = `
                width: ${size}px;
                height: ${size}px;
                left: ${x}%;
                top: ${y}%;
                background: rgba(var(--dynamic-r), var(--dynamic-g), var(--dynamic-b), ${opacity});
                animation-delay: ${delay}s;
                animation-duration: ${duration}s;
                box-shadow: 0 0 ${size * 2}px rgba(var(--dynamic-r), var(--dynamic-g), var(--dynamic-b), ${opacity});
            `;
            particlesContainer.appendChild(particle);
        }
    }

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
        const scrollFactor = scrollY * config.scrollParallaxIntensity;

        if (orb1) orb1.style.transform = `translateY(${scrollFactor * 0.4}px)`;
        if (orb2) orb2.style.transform = `translateY(${scrollFactor * -0.2}px)`;
        if (orb3) orb3.style.transform = `translate(-50%, calc(-50% + ${scrollFactor * 0.15}px))`;
        if (gridBg) gridBg.style.transform = `translateY(${scrollFactor * 0.1}px)`;

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

        if (mouseGlow) {
            mouseGlow.style.left = `${currentMouseX}px`;
            mouseGlow.style.top = `${currentMouseY}px`;
        }

        const intensity = config.mouseParallaxIntensity;
        if (orb1) {
            const scrollOffset = scrollY * config.scrollParallaxIntensity * 0.4;
            orb1.style.transform = `translate(${offsetX * intensity * 0.8}px, ${offsetY * intensity * 0.8 + scrollOffset}px)`;
        }
        if (orb2) {
            const scrollOffset = scrollY * config.scrollParallaxIntensity * -0.2;
            orb2.style.transform = `translate(${offsetX * intensity * -0.5}px, ${offsetY * intensity * -0.5 + scrollOffset}px)`;
        }
        if (orb3) {
            const scrollOffset = scrollY * config.scrollParallaxIntensity * 0.15;
            orb3.style.transform = `translate(calc(-50% + ${offsetX * intensity * 0.3}px), calc(-50% + ${offsetY * intensity * 0.3 + scrollOffset}px))`;
        }

        parallaxLayers.forEach((layer) => {
            const speed = parseFloat(layer.dataset.parallaxSpeed) || 0.5;
            if (layer !== orb1 && layer !== orb2 && layer !== orb3) {
                layer.style.transform = `translate(${offsetX * intensity * speed * 0.3}px, ${offsetY * intensity * speed * 0.3}px)`;
            }
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
        createParticles();
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

// Three.js Interactive Background
(function() {
    'use strict';

    const canvas = document.getElementById('threeCanvas');
    if (!canvas || typeof THREE === 'undefined') return;

    // Check WebGL support
    function isWebGLAvailable() {
        try {
            const testCanvas = document.createElement('canvas');
            return !!(window.WebGLRenderingContext &&
                (testCanvas.getContext('webgl') || testCanvas.getContext('experimental-webgl')));
        } catch (e) {
            return false;
        }
    }

    if (!isWebGLAvailable()) {
        canvas.style.display = 'none';
        console.warn('WebGL not available, skipping 3D background');
        return;
    }

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);

    let renderer;
    try {
        renderer = new THREE.WebGLRenderer({
            canvas: canvas,
            alpha: true,
            antialias: true,
            powerPreference: 'low-power',
            failIfMajorPerformanceCaveat: false
        });
    } catch (e) {
        canvas.style.display = 'none';
        console.warn('WebGL context creation failed:', e.message);
        return;
    }

    // Handle WebGL context loss
    canvas.addEventListener('webglcontextlost', function(e) {
        e.preventDefault();
        console.warn('WebGL context lost');
    }, false);

    canvas.addEventListener('webglcontextrestored', function() {
        console.log('WebGL context restored');
    }, false);

    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setClearColor(0x000000, 0);

    const config = {
        particleCount: 200,
        particleSize: 3,
        baseOpacity: 0.4,
        connectionDistance: 150,
        mouseInfluence: 80,
        mouseRadius: 250,
        depth: 400,
        smoothingFactor: 0.03,
        scrollInfluence: 0.15,
        cameraSmoothing: 0.015,
        colorTransitionSpeed: 0.0008
    };

    const colorPalette = [
        new THREE.Color(0x8b5cf6),
        new THREE.Color(0x3b82f6),
        new THREE.Color(0xf59e0b)
    ];
    let colorIndex = 0;
    let colorProgress = 0;
    const currentColor = new THREE.Color(colorPalette[0]);

    let targetMouseX = 0, targetMouseY = 0;
    let smoothMouseX = 0, smoothMouseY = 0;
    let targetScrollY = 0;
    let smoothScrollY = 0;
    let lastScrollY = 0;
    let scrollVelocity = 0;

    const particlesGeometry = new THREE.BufferGeometry();
    const particleCount = config.particleCount;
    const positions = new Float32Array(particleCount * 3);
    const velocities = new Float32Array(particleCount * 3);

    for (let i = 0; i < particleCount; i++) {
        const i3 = i * 3;
        positions[i3] = (Math.random() - 0.5) * window.innerWidth;
        positions[i3 + 1] = (Math.random() - 0.5) * window.innerHeight;
        positions[i3 + 2] = (Math.random() - 0.5) * config.depth;
        velocities[i3] = (Math.random() - 0.5) * 0.15;
        velocities[i3 + 1] = (Math.random() - 0.5) * 0.15;
        velocities[i3 + 2] = (Math.random() - 0.5) * 0.05;
    }

    particlesGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));

    const particlesMaterial = new THREE.PointsMaterial({
        color: currentColor,
        size: config.particleSize,
        transparent: true,
        opacity: config.baseOpacity,
        blending: THREE.AdditiveBlending,
        sizeAttenuation: true
    });

    const particles = new THREE.Points(particlesGeometry, particlesMaterial);
    scene.add(particles);

    const linesMaterial = new THREE.LineBasicMaterial({
        color: currentColor,
        transparent: true,
        opacity: 0.15,
        blending: THREE.AdditiveBlending
    });

    let linesGeometry = new THREE.BufferGeometry();
    let lines = new THREE.LineSegments(linesGeometry, linesMaterial);
    scene.add(lines);

    camera.position.z = 400;

    function lerp(start, end, factor) {
        return start + (end - start) * factor;
    }

    function onMouseMove(e) {
        targetMouseX = (e.clientX - window.innerWidth / 2);
        targetMouseY = -(e.clientY - window.innerHeight / 2);
    }

    function onScroll() {
        targetScrollY = window.pageYOffset;
        scrollVelocity = targetScrollY - lastScrollY;
        lastScrollY = targetScrollY;
    }

    function onResize() {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
    }

    let connectionFrame = 0;
    function updateConnections() {
        connectionFrame++;
        if (connectionFrame % 5 !== 0) return;

        const positions = particlesGeometry.attributes.position.array;
        const linePositions = [];

        for (let i = 0; i < particleCount; i++) {
            const i3 = i * 3;
            for (let j = i + 1; j < particleCount; j++) {
                const j3 = j * 3;
                const dx = positions[i3] - positions[j3];
                const dy = positions[i3 + 1] - positions[j3 + 1];
                const dz = positions[i3 + 2] - positions[j3 + 2];
                const dist = Math.sqrt(dx * dx + dy * dy + dz * dz);

                if (dist < config.connectionDistance) {
                    linePositions.push(
                        positions[i3], positions[i3 + 1], positions[i3 + 2],
                        positions[j3], positions[j3 + 1], positions[j3 + 2]
                    );
                }
            }
        }

        linesGeometry.dispose();
        linesGeometry = new THREE.BufferGeometry();
        linesGeometry.setAttribute('position', new THREE.Float32BufferAttribute(linePositions, 3));
        lines.geometry = linesGeometry;
    }

    function animate() {
        requestAnimationFrame(animate);

        smoothMouseX = lerp(smoothMouseX, targetMouseX, config.smoothingFactor);
        smoothMouseY = lerp(smoothMouseY, targetMouseY, config.smoothingFactor);
        smoothScrollY = lerp(smoothScrollY, targetScrollY, config.smoothingFactor * 1.5);
        scrollVelocity *= 0.95;

        colorProgress += config.colorTransitionSpeed;
        if (colorProgress >= 1) {
            colorProgress = 0;
            colorIndex = (colorIndex + 1) % colorPalette.length;
        }
        const nextColorIndex = (colorIndex + 1) % colorPalette.length;
        currentColor.lerpColors(colorPalette[colorIndex], colorPalette[nextColorIndex], colorProgress);
        particlesMaterial.color.copy(currentColor);
        linesMaterial.color.copy(currentColor);

        const r = Math.round(currentColor.r * 255);
        const g = Math.round(currentColor.g * 255);
        const b = Math.round(currentColor.b * 255);
        const hex = '#' + currentColor.getHexString();
        document.documentElement.style.setProperty('--dynamic-r', r);
        document.documentElement.style.setProperty('--dynamic-g', g);
        document.documentElement.style.setProperty('--dynamic-b', b);
        document.documentElement.style.setProperty('--dynamic-color-hex', hex);

        updateFavicon(hex);

        const positions = particlesGeometry.attributes.position.array;
        const scrollOffset = smoothScrollY * config.scrollInfluence;

        for (let i = 0; i < particleCount; i++) {
            const i3 = i * 3;

            positions[i3] += velocities[i3];
            positions[i3 + 1] += velocities[i3 + 1];
            positions[i3 + 2] += velocities[i3 + 2];

            const depthFactor = (positions[i3 + 2] + config.depth / 2) / config.depth;
            positions[i3 + 1] -= scrollVelocity * 0.02 * (0.5 + depthFactor * 0.5);

            const dx = positions[i3] - smoothMouseX;
            const dy = positions[i3 + 1] - smoothMouseY;
            const dist = Math.sqrt(dx * dx + dy * dy);

            if (dist < config.mouseRadius && dist > 0) {
                const force = (config.mouseRadius - dist) / config.mouseRadius;
                const easedForce = force * force * (3 - 2 * force);
                const angle = Math.atan2(dy, dx);
                positions[i3] += Math.cos(angle) * easedForce * config.mouseInfluence * 0.012;
                positions[i3 + 1] += Math.sin(angle) * easedForce * config.mouseInfluence * 0.012;
            }

            const halfWidth = window.innerWidth / 2;
            const halfHeight = window.innerHeight / 2;
            const halfDepth = config.depth / 2;

            if (positions[i3] > halfWidth) positions[i3] = -halfWidth;
            if (positions[i3] < -halfWidth) positions[i3] = halfWidth;
            if (positions[i3 + 1] > halfHeight) positions[i3 + 1] = -halfHeight;
            if (positions[i3 + 1] < -halfHeight) positions[i3 + 1] = halfHeight;
            if (positions[i3 + 2] > halfDepth) positions[i3 + 2] = -halfDepth;
            if (positions[i3 + 2] < -halfDepth) positions[i3 + 2] = halfDepth;
        }

        particlesGeometry.attributes.position.needsUpdate = true;
        updateConnections();

        const scrollRotation = smoothScrollY * 0.0003;
        const targetCamX = smoothMouseX * 0.015;
        const targetCamY = smoothMouseY * 0.015 - scrollOffset * 0.3;
        const targetCamZ = 400 + scrollOffset * 0.5;

        camera.position.x = lerp(camera.position.x, targetCamX, config.cameraSmoothing);
        camera.position.y = lerp(camera.position.y, targetCamY, config.cameraSmoothing);
        camera.position.z = lerp(camera.position.z, targetCamZ, config.cameraSmoothing);
        camera.rotation.x = lerp(camera.rotation.x, scrollRotation, config.cameraSmoothing);
        camera.lookAt(scene.position);

        particles.rotation.y = lerp(particles.rotation.y, scrollRotation * 0.5, config.cameraSmoothing);
        particles.rotation.x = lerp(particles.rotation.x, scrollRotation * 0.3, config.cameraSmoothing);
        lines.rotation.y = particles.rotation.y;
        lines.rotation.x = particles.rotation.x;

        renderer.render(scene, camera);
    }

    document.addEventListener('mousemove', onMouseMove, { passive: true });
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onResize);

    animate();
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
