// public/firebase-messaging-sw.js
importScripts("https://www.gstatic.com/firebasejs/10.7.1/firebase-app-compat.js");
importScripts("https://www.gstatic.com/firebasejs/10.7.1/firebase-messaging-compat.js");

firebase.initializeApp({
  apiKey: "AIzaSyBRZkqEPwis-H4_-9i1uVGsu4Lp6gdO5V8",
  authDomain: "notary-e1138.firebaseapp.com",
  projectId: "notary-e1138",
  storageBucket: "notary-e1138.appspot.com",
  messagingSenderId: "1016003643540",
  appId: "1:1016003643540:web:69ba24f6c1d33942268c81",
  measurementId: "G-JQ9SELYJK7"
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  console.log("Background message received:", payload);
  self.registration.showNotification(payload.notification.title, {
    body: payload.notification.body,
    icon: "/firebase-logo.png", // You can customize this icon
  });
});