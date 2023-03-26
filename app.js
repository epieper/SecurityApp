// Registering Service Worker
if (navigator.serviceWorker) {
    navigator.serviceWorker.register('/SecurityApp/service-worker.js', { scope: '/SecurityApp/' });
}

/*
// Delay serviceWorker register
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/SecurityApp/service-worker.js', { scope: '/SecurityApp/' });
    });
}
*/