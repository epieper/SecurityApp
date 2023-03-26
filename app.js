// Registering Service Worker
/*
if (navigator.serviceWorker) {
    navigator.serviceWorker.register('/SecurityApp/service-worker.js', { scope: '/SecurityApp/' });
}
*/

askPermission();
// Delay serviceWorker register
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/service-worker.js', { scope: '/' })
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
                sendSubscriptionToBackEnd(pushSubscription);
                return pushSubscription;
            });
    });
}

function askPermission() {
    return new Promise(function (resolve, reject) {
        const permissionResult = Notification.requestPermission(function (result) {
            resolve(result);
        });

        if (permissionResult) {
            permissionResult.then(resolve, reject);
        }
    }).then(function (permissionResult) {
        if (permissionResult !== 'granted') {
            throw new Error("We weren't granted permission.");
        }
    });
}

function sendSubscriptionToBackEnd(subscription) {
    return fetch('/api/save-subscription/', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(subscription),
    })
        .then(function (response) {
            if (!response.ok) {
                throw new Error('Bad status code from server.');
            }

            return response.json();
        })
        .then(function (responseData) {
            if (!(responseData.data && responseData.data.success)) {
                throw new Error('Bad response from server.');
            }
        });
}