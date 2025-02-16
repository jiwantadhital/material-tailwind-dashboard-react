import { initializeApp } from "firebase/app";
import { getMessaging, getToken, onMessage } from "firebase/messaging";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const firebaseConfig = {
  apiKey: "AIzaSyBRZkqEPwis-H4_-9i1uVGsu4Lp6gdO5V8",
  authDomain: "notary-e1138.firebaseapp.com",
  projectId: "notary-e1138",
  storageBucket: "notary-e1138.appspot.com",
  messagingSenderId: "1016003643540",
  appId: "1:1016003643540:web:69ba24f6c1d33942268c81",
  measurementId: "G-JQ9SELYJK7"
};

const app = initializeApp(firebaseConfig);
const messaging = getMessaging(app);

// Function to request notification permission and retrieve FCM token
export const requestNotificationPermission = async () => {
  try {
    const permission = await Notification.requestPermission();
    console.log(Notification.permission);
    if (permission === "granted") {
      const token = await getToken(messaging, {
        vapidKey: "BDZTXUa-bN5KijnEv5V6zFHxd65X6s3EZPGwT2ZpsoxYho8KBw2lw8wuy0hOpk3cz7pSLO6ng19YldoRivWo2IY", 
      });
      console.log("FCM Token:", token);
      localStorage.setItem('fcm_token', token);

    } else {
      console.error("Notification permission denied");
    }
  } catch (error) {
    console.error("Error getting permission:", error);
  }
};

// Listen for foreground notifications
onMessage(messaging, (payload) => {
  toast.info(`${title}: ${body}`, {
    position: "top-right",
    autoClose: 5000,
    hideProgressBar: false,
    closeOnClick: true,
    pauseOnHover: true,
    draggable: true,
    progress: undefined,
  });
  
  // Show a native browser notification
  new Notification(title, notificationOptions);
  console.log("Foreground notification received:", payload);
  
});

export { messaging };
export default app;