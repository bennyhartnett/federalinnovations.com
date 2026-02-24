// Background Interaction - Cursor & Scroll Responsiveness
(function () {
    'use strict';

    // Wait for the particle renderer to be available
    var checkInterval = setInterval(function () {
        if (typeof ii !== 'undefined' && ii.particleSystem) {
            clearInterval(checkInterval);
            initInteraction(ii);
        }
    }, 100);

    function initInteraction(renderer) {
        var ps = renderer.particleSystem;
        var canvas = document.getElementById('canvas');
        if (!ps || !canvas) return;

        // State
        var targetX = 0;
        var targetY = 0;
        var currentX = 0;
        var currentY = 0;
        var scrollOffset = 0;
        var isMouseOnPage = false;
        var smoothing = 0.06;

        // Convert screen coordinates to WebGL clip space (-1 to 1)
        function screenToClip(clientX, clientY) {
            var rect = canvas.getBoundingClientRect();
            var x = ((clientX - rect.left) / rect.width) * 2 - 1;
            var y = -(((clientY - rect.top) / rect.height) * 2 - 1);
            return { x: x, y: y };
        }

        // Lerp
        function lerp(a, b, t) {
            return a + (b - a) * t;
        }

        // Mouse move handler
        document.addEventListener('mousemove', function (e) {
            isMouseOnPage = true;
            var clip = screenToClip(e.clientX, e.clientY);
            targetX = clip.x * 0.85; // Scale down slightly to keep within bounds
            targetY = clip.y * 0.85;
        });

        // Mouse leave - drift back toward center
        document.addEventListener('mouseleave', function () {
            isMouseOnPage = false;
            targetX = 0;
            targetY = 0;
        });

        // Touch support for mobile
        document.addEventListener('touchmove', function (e) {
            if (e.touches.length > 0) {
                var touch = e.touches[0];
                var clip = screenToClip(touch.clientX, touch.clientY);
                targetX = clip.x * 0.85;
                targetY = clip.y * 0.85;
                isMouseOnPage = true;
            }
        }, { passive: true });

        document.addEventListener('touchend', function () {
            isMouseOnPage = false;
            targetX = 0;
            targetY = 0;
        });

        // Scroll handler - shift attractor vertically based on scroll
        var maxScroll = 1;
        function updateMaxScroll() {
            maxScroll = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
        }
        updateMaxScroll();
        window.addEventListener('resize', updateMaxScroll);

        window.addEventListener('scroll', function () {
            var scrollFraction = window.pageYOffset / maxScroll;
            // Map scroll to a vertical offset: top of page = slight upward bias, bottom = downward
            scrollOffset = (scrollFraction - 0.5) * -0.6;
        }, { passive: true });

        // Animation loop - smoothly interpolate attractor position
        function tick() {
            var finalTargetY = targetY + scrollOffset;

            currentX = lerp(currentX, targetX, smoothing);
            currentY = lerp(currentY, finalTargetY, smoothing);

            ps.attractorPos.x = currentX;
            ps.attractorPos.y = currentY;

            requestAnimationFrame(tick);
        }

        requestAnimationFrame(tick);
    }
})();
