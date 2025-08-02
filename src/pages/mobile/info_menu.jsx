import React, { useState, useEffect } from "react";
import {
  Card,
  CardHeader,
  CardBody,
  Typography,
  Button,
  Input,
  Textarea,
  Alert,
} from "@material-tailwind/react";
import { authService } from "@/services/apiService";
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import { CheckCircleIcon, ExclamationTriangleIcon } from "@heroicons/react/24/solid";

export function InfoMenu() {
  const [formData, setFormData] = useState({
    title: "",
    short_description: "",
    long_description: "",
    status: true
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [alert, setAlert] = useState({
    show: false,
    message: "",
    type: "success" // success or error
  });

  useEffect(() => {
    fetchMenuInfo();
  }, []);

  // Auto-hide alert after 5 seconds
  useEffect(() => {
    if (alert.show) {
      const timer = setTimeout(() => {
        setAlert({ ...alert, show: false });
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [alert.show]);

  const fetchMenuInfo = async () => {
    try {
      const response = await authService.getMobileInfoMenu();
      if (response.data) {
        setFormData(response.data);
      }
    } catch (error) {
      console.error("Error fetching menu info:", error);
      setAlert({
        show: true,
        message: "Failed to load menu information. Please refresh the page.",
        type: "error"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async () => {
    // Validation
    if (!formData.title.trim()) {
      setAlert({
        show: true,
        message: "Title is required. Please enter a title.",
        type: "error"
      });
      return;
    }

    if (!formData.short_description.trim()) {
      setAlert({
        show: true,
        message: "Short description is required. Please enter a short description.",
        type: "error"
      });
      return;
    }

    try {
      setIsSaving(true);
      setAlert({ ...alert, show: false }); // Hide any existing alert
      
      await authService.updateMobileInfoMenu(formData);
      
      setAlert({
        show: true,
        message: "Info menu updated successfully! Changes have been saved.",
        type: "success"
      });
    } catch (error) {
      console.error("Error saving menu info:", error);
      setAlert({
        show: true,
        message: "Failed to update info menu. Please check your connection and try again.",
        type: "error"
      });
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="mt-12 mb-8 flex justify-center items-center min-h-[400px]">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <Typography color="blue-gray">Loading menu information...</Typography>
        </div>
      </div>
    );
  }

  return (
    <div className="mt-12 mb-8 flex flex-col gap-12">
      {/* Alert Message */}
      {alert.show && (
        <Alert
          icon={
            alert.type === "success" ? (
              <CheckCircleIcon className="h-6 w-6" />
            ) : (
              <ExclamationTriangleIcon className="h-6 w-6" />
            )
          }
          className={`rounded-lg ${
            alert.type === "success" 
              ? "border-l-4 border-l-green-500 bg-green-50 text-green-900" 
              : "border-l-4 border-l-red-500 bg-red-50 text-red-900"
          }`}
          dismissible={{
            onClose: () => setAlert({ ...alert, show: false }),
          }}
        >
          <Typography className="font-medium">
            {alert.type === "success" ? "Success!" : "Error!"}
          </Typography>
          <Typography className="mt-1 text-sm opacity-80">
            {alert.message}
          </Typography>
        </Alert>
      )}

      <Card>
        <CardHeader variant="gradient" color="blue" className="mb-8 p-6">
          <Typography variant="h6" color="white">
            Mobile Info Menu Configuration
          </Typography>
          <Typography variant="small" color="white" className="opacity-80 mt-1">
            Manage the information displayed in the mobile app's info menu
          </Typography>
        </CardHeader>
        <CardBody className="overflow-x-scroll px-6 pt-0 pb-6">
          <div className="grid gap-6">
            <div>
              <Typography variant="small" color="blue-gray" className="mb-2 font-medium">
                Title *
              </Typography>
              <Input
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="!border-t-blue-gray-200 focus:!border-t-gray-900"
                labelProps={{
                  className: "before:content-none after:content-none",
                }}
                placeholder="Enter menu title"
              />
            </div>

            <div>
              <Typography variant="small" color="blue-gray" className="mb-2 font-medium">
                Short Description *
              </Typography>
              <Textarea
                value={formData.short_description}
                onChange={(e) => setFormData({ ...formData, short_description: e.target.value })}
                className="!border-t-blue-gray-200 focus:!border-t-gray-900"
                labelProps={{
                  className: "before:content-none after:content-none",
                }}
                placeholder="Enter a brief description for the menu"
                rows={3}
              />
            </div>

            <div>
              <Typography variant="small" color="blue-gray" className="mb-2 font-medium">
                Long Description (HTML)
              </Typography>
              <Typography variant="small" color="gray" className="mb-3">
                Use the rich text editor below to format your detailed description
              </Typography>
              <div className="border border-blue-gray-200 rounded-lg">
                <ReactQuill
                  value={formData.long_description}
                  onChange={(value) => setFormData({ ...formData, long_description: value })}
                  className="h-64"
                  placeholder="Enter detailed description with formatting..."
                />
              </div>
            </div>

            <div className="flex justify-between items-center mt-8 pt-4 border-t border-blue-gray-100">
              <Typography variant="small" color="gray">
                * Required fields
              </Typography>
              <Button
                variant="gradient"
                color="blue"
                onClick={handleSubmit}
                disabled={isSaving}
                className="flex items-center gap-2 min-w-[140px] justify-center"
              >
                {isSaving ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Saving...
                  </>
                ) : (
                  <>
                    <CheckCircleIcon className="h-4 w-4" />
                    Save Changes
                  </>
                )}
              </Button>
            </div>
          </div>
        </CardBody>
      </Card>
    </div>
  );
}

export default InfoMenu; 