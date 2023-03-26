// Registering Service Worker
if (navigator.serviceWorker) {
    navigator.serviceWorker.register('/SecurityApp/service-worker.js', { scope: '/SecurityApp/'})
  }
