// [START initialize_firebase_in_sw]
// Give the service worker access to Firebase Messaging.
// Note that you can only use Firebase Messaging here, other Firebase libraries
// are not available in the service worker.
importScripts('https://www.gstatic.com/firebasejs/4.8.1/firebase-app.js');
importScripts('https://www.gstatic.com/firebasejs/4.8.1/firebase-messaging.js');

// We pass in our config through URL params
const urlObj = new URL(location);
const messagingSenderId = urlObj.searchParams.get('messagingSenderId');
const url = urlObj.origin;

// Initialize the Firebase app in the service worker by passing in the
// messagingSenderId.
firebase.initializeApp({messagingSenderId});
// Retrieve an instance of Firebase Messaging so that it can handle background
// messages.
const messaging = firebase.messaging();
// [END initialize_firebase_in_sw]

// If you would like to customize notifications that are received in the
// background (Web app is closed or not in browser focus) then you should
// implement this optional method.
// [START background_handler]
messaging.setBackgroundMessageHandler(function(payload) {
    console.log('[firebase-messaging-sw.js] Received background message ', payload);
    // Customize notification here
    var notificationTitle = payload.data.title;
    var notificationOptions = {
      body: payload.data.userName,
      icon: payload.data.imageSrc,
    };

    return self.registration.showNotification(notificationTitle,
      notificationOptions);
});
// [END background_handler]

self.addEventListener('notificationclick', function(event) {
    event.notification.close(); // Android needs explicit close.
    event.waitUntil(
        clients.matchAll({ includeUncontrolled: true, type: 'window' }).then( windowClients => {
            // Check if there is already a window/tab open with the target URL
            for (var i = 0; i < windowClients.length; i++) {
                var client = windowClients[i];
                // If so, just focus it.
                if (client.url === url && 'focus' in client) {
                    return client.focus();
                }
            }
            // If not, then open the target URL in a new window/tab.
            if (clients.openWindow) {
                return clients.openWindow(url);
            }
        })
    );
});