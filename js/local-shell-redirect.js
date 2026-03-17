(function () {
    'use strict';

    var host = window.location.hostname;
    var isLocalPreview =
        host === 'localhost' ||
        host === '127.0.0.1' ||
        host === '[::1]' ||
        host === '0.0.0.0';

    if (!isLocalPreview) {
        return;
    }

    var params = new URLSearchParams(window.location.search);
    if (params.get('standalone') === '1') {
        return;
    }

    var pageMeta = document.querySelector('meta[name="fi-spa-page"]');
    if (!pageMeta) {
        return;
    }

    var page = pageMeta.getAttribute('content');
    if (!page) {
        return;
    }

    var shellUrl = new URL('/', window.location.origin);

    params.delete('standalone');
    var search = params.toString();
    shellUrl.search = search ? '?' + search : '';
    shellUrl.hash = page;

    if (shellUrl.href !== window.location.href) {
        window.location.replace(shellUrl.toString());
    }
})();
