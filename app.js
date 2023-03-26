// Registering Service Worker
/*
if (navigator.serviceWorker) {
    navigator.serviceWorker.register('/SecurityApp/service-worker.js', { scope: '/SecurityApp/' });
}
*/
// Delay serviceWorker register
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/SecurityApp/service-worker.js', { scope: '/SecurityApp/' })
            .then(function (registration) {
                const subscribeOptions = {
                    userVisibleOnly: true,
                    applicationServerKey: urlBase64ToUint8Array(
                        'BOhTPMafuHF2MnhTet7TGua1ZBTIQ2BckK4fazZqJpdEfWvaS7tSaRei_f67PJdbURTmHHtvso1CstosLi18SZs',
                    ),
                };

                return registration.pushManager.subscribe(subscribeOptions);
            })
            .then(function (pushSubscription) {
                console.log(
                    'Received PushSubscription: ',
                    JSON.stringify(pushSubscription),
                );
                return pushSubscription;
            });
    });
}