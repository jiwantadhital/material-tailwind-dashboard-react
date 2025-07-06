import React, { useState, useEffect } from "react";
import {
  Card,
  CardHeader,
  CardBody,
  Typography,
  Button,
  Input,
  Textarea,
} from "@material-tailwind/react";
import { authService } from "@/services/apiService";
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';

export function InfoMenu() {
  const [formData, setFormData] = useState({
    title: "",
    short_description: "",
    long_description: "",
    status: true
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    fetchMenuInfo();
  }, []);

  const fetchMenuInfo = async () => {
    try {
      const response = await authService.getMobileInfoMenu();
      if (response.data) {
        setFormData(response.data);
      }
    } catch (error) {
      console.error("Error fetching menu info:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async () => {
    try {
      setIsSaving(true);
      await authService.updateMobileInfoMenu(formData);
      alert("Info menu updated successfully!");
    } catch (error) {
      console.error("Error saving menu info:", error);
      alert("Failed to update info menu. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="mt-12 mb-8 flex justify-center items-center">
        <Typography>Loading...</Typography>
      </div>
    );
  }

  return (
    <div className="mt-12 mb-8 flex flex-col gap-12">
      <Card>
        <CardHeader variant="gradient" color="blue" className="mb-8 p-6">
          <Typography variant="h6" color="white">
            Mobile Info Menu Configuration
          </Typography>
        </CardHeader>
        <CardBody className="overflow-x-scroll px-6 pt-0 pb-6">
          <div className="grid gap-6">
            <div>
              <Typography variant="small" color="blue-gray" className="mb-2 font-medium">
                Title
              </Typography>
              <Input
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="!border-t-blue-gray-200 focus:!border-t-gray-900"
                labelProps={{
                  className: "before:content-none after:content-none",
                }}
              />
            </div>

            <div>
              <Typography variant="small" color="blue-gray" className="mb-2 font-medium">
                Short Description
              </Typography>
              <Textarea
                value={formData.short_description}
                onChange={(e) => setFormData({ ...formData, short_description: e.target.value })}
                className="!border-t-blue-gray-200 focus:!border-t-gray-900"
                labelProps={{
                  className: "before:content-none after:content-none",
                }}
              />
            </div>

            <div>
              <Typography variant="small" color="blue-gray" className="mb-2 font-medium">
                Long Description (HTML)
              </Typography>
              <div className="border border-blue-gray-200 rounded-lg">
                <ReactQuill
                  value={formData.long_description}
                  onChange={(value) => setFormData({ ...formData, long_description: value })}
                  className="h-64"
                />
              </div>
            </div>

            <div className="flex justify-end mt-6">
              <Button
                variant="gradient"
                color="blue"
                onClick={handleSubmit}
                disabled={isSaving}
                className="flex items-center gap-2"
              >
                {isSaving ? "Saving..." : "Save Changes"}
              </Button>
            </div>
          </div>
        </CardBody>
      </Card>
    </div>
  );
}

export default InfoMenu; 