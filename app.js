// Registering Service Worker
if (navigator.serviceWorker) {
    navigator.serviceWorker.register('./SecuirtyApp/service-worker.js', {scope: './SecurityApp/'})
  }
