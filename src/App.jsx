import { Routes, Route, Navigate } from "react-router-dom";
import { Dashboard, Auth } from "@/layouts";
import { Users, User_details } from "@/pages/dashboard";
import { Documents } from "@/layouts/documents";
import { DocumentDetails } from "@/pages/documents";
import { Mobile } from "@/layouts/mobile";
import { BasicSettings } from "@/layouts/basicSettings";
import HomePage from "@/frontend/home_page";

function App() {
  return (
    <Routes>
      <Route path="/dashboard/*" element={<Dashboard />} />
      <Route path="/auth/*" element={<Auth />} />
      <Route path="/user_details/*" element={<User_details />} />
      <Route path="/users/*" element={<Users />} />
      <Route path="/mobile/*" element={<Mobile />} />
      <Route path="/documents/*" element={<Documents />} />
      <Route path="/document_details/*" element={<DocumentDetails />} />
      <Route path="/basicSettings/*" element={<BasicSettings />} />
      <Route path="/home" element={<HomePage />} />
      <Route path="*" element={<Navigate to="/home" replace />} />
    </Routes>
  );
}

export default App;
