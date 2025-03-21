import { useEffect } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { Dashboard, Auth } from "@/layouts";
import { Users, User_details } from "@/pages/dashboard";
import { Documents } from "@/layouts/documents";
import { DocumentDetails } from "@/pages/documents";
import { Mobile } from "@/layouts/mobile";
import { BasicSettings } from "@/layouts/basicSettings";
import HomePage from "@/frontend/home_page";
import { requestNotificationPermission, messaging } from "@/firebase"; // Import notification function
import { onMessage } from "firebase/messaging";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Notifications from "@/pages/notifications";
import { Reports } from "@/layouts/reports";
import { ReportDetails } from "@/pages/reports/report_details";
function App() {
  useEffect(() => {
    // Request permission for notifications
    requestNotificationPermission();

    // Register the service worker
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker
        .register("/firebase-messaging-sw.js")
        .then((registration) => {
          console.log("Service Worker registered successfully:", registration);
        })
        .catch((error) => console.error("Service Worker registration failed:", error));
    }

    // Listen for foreground push notifications
    const unsubscribe = onMessage(messaging, (payload) => {
  const { title, body } = payload.notification;

      const notificationOptions = {
        body: JSON.parse(body).message,
        icon: "/img/nlogo.png",
        requireInteraction: true, // Keeps the notification open until the user interacts with it
      };
      console.log("Foreground Notification Rec:", payload);
      toast.info(`${title}: ${JSON.parse(body).message}`, {
        position: "top-right",
        autoClose: 8000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        onClick: () => {
          window.location.href = `/document_details/${documentId}`;
        }
      });
      
      // Show a native browser notification
      new Notification(title, notificationOptions);
      
    });

    return () => unsubscribe(); // Cleanup on unmount
  }, []);
  const token = localStorage.getItem('token'); // Check for token

  return (
    <>
    <ToastContainer />
    <Routes>
      {token != null ? <Route path="/dashboard/*" element={<Dashboard />} /> : <Route path="/auth/*" element={<Auth />} />}
      <Route path="/notifications" element={<Notifications />} />
      <Route path="/auth/*" element={<Auth />} />
      <Route path="/user_details/*" element={<User_details />} />
      <Route path="/users/*" element={<Users />} />
      <Route path="/mobile/*" element={<Mobile />} />
      <Route path="/documents/*" element={<Documents />} />
      <Route path="/document_details/*" element={<DocumentDetails />} />
      <Route path="/basicSettings/*" element={<BasicSettings />} />
      <Route path="/home" element={<HomePage />} />
      <Route path="/reports/*" element={<Reports />} />
      <Route path="/reports/report_details/*" element={<ReportDetails />} />
      {token != null ? <Route path="*" element= {<Navigate to="/dashboard/home" replace />} /> : <Route path="*" element= {<Navigate to="/home" replace />} />}
    </Routes>
    </>
  );
}

export default App;