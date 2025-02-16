import React, { useState } from 'react';
import {
  Card,
  CardHeader,
  CardBody,
  Typography,
  Switch,
  Button
} from "@material-tailwind/react";

export function ReportDetails() {
  // This would typically come from an API or props
  const [report, setReport] = useState({
    id: 1,
    reporterName: "John Doe",
    title: "Login Authentication Failed",
    description: "Unable to login to the system after multiple attempts. The system keeps showing invalid credentials error even with correct password.",
    documentName: "Authentication System Documentation",
    status: "pending",
    date: "2024-03-20"
  });

  const handleStatusChange = () => {
    setReport(prev => ({
      ...prev,
      status: prev.status === "pending" ? "resolved" : "pending"
    }));
    // Here you would typically make an API call to update the status
  };

  return (
    <div className="mt-12 mb-8 flex flex-col gap-12">
      <Card>
        <CardHeader variant="gradient" color="blue" className="mb-8 p-6">
          <Typography variant="h6" color="white">
            Report Details
          </Typography>
        </CardHeader>
        <CardBody className="p-6">
          <div className="grid gap-6">
            <div>
              <Typography variant="h6" color="blue-gray" className="mb-2">
                Reporter Information
              </Typography>
              <Typography variant="small" className="font-normal text-blue-gray-600">
                {report.reporterName}
              </Typography>
            </div>

            <div>
              <Typography variant="h6" color="blue-gray" className="mb-2">
                Report Title
              </Typography>
              <Typography variant="small" className="font-normal text-blue-gray-600">
                {report.title}
              </Typography>
            </div>

            <div>
              <Typography variant="h6" color="blue-gray" className="mb-2">
                Description
              </Typography>
              <Typography variant="small" className="font-normal text-blue-gray-600">
                {report.description}
              </Typography>
            </div>

            <div>
              <Typography variant="h6" color="blue-gray" className="mb-2">
                Related Document
              </Typography>
              <Typography variant="small" className="font-normal text-blue-gray-600">
                {report.documentName}
              </Typography>
            </div>

            <div>
              <Typography variant="h6" color="blue-gray" className="mb-2">
                Date Submitted
              </Typography>
              <Typography variant="small" className="font-normal text-blue-gray-600">
                {report.date}
              </Typography>
            </div>

            <div className="flex items-center gap-4">
              <Typography variant="h6" color="blue-gray">
                Status: {report.status}
              </Typography>
              <Switch
                color="green"
                checked={report.status === "resolved"}
                onChange={handleStatusChange}
                label={report.status === "resolved" ? "Resolved" : "Pending"}
              />
            </div>

            <div className="flex justify-end">
              <Button
                variant="gradient"
                color="blue"
                onClick={() => window.history.back()}
              >
                Back to Reports
              </Button>
              
            </div>

            <div className="flex justify-end">
              <Button
                variant="gradient"
                color="purple"
                onClick={() => window.history.back()}
              >
                View Related Document
              </Button>
              
            </div>
          </div>
        </CardBody>
      </Card>
    </div>
  );
}

export default ReportDetails;
