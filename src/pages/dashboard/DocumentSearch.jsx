import React, { useState } from "react";
import {
  Card,
  CardHeader,
  CardBody,
  CardFooter,
  Typography,
  Button,
  Input,
  Alert,
  Spinner,
} from "@material-tailwind/react";
import { MagnifyingGlassIcon } from "@heroicons/react/24/outline";
import { authService } from "@/services/apiService";

export function DocumentSearch() {
  const [referenceNumber, setReferenceNumber] = useState("");
  const [document, setDocument] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleSearch = async () => {
    if (!referenceNumber.trim()) {
      setError("Please enter a reference number");
      return;
    }

    setLoading(true);
    setError("");
    setSuccess("");
    setDocument(null);

    try {
      const response = await authService.searchDocumentByReferenceNumber(referenceNumber);
      if (response.success) {
        setDocument(response.data);
        setSuccess("Document found successfully!");
      } else {
        setError(response.message || "Failed to find document");
      }
    } catch (error) {
      console.error("Search error:", error);
      setError(error.message || "An error occurred while searching");
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getStatusColor = (status) => {
    const colors = {
      pending: "bg-yellow-100 text-yellow-800",
      cost_estimated: "bg-blue-100 text-blue-800",
      in_progress: "bg-orange-100 text-orange-800",
      completed: "bg-green-100 text-green-800",
      rejected: "bg-red-100 text-red-800",
    };
    return colors[status] || "bg-gray-100 text-gray-800";
  };

  return (
    <div className="mt-12 mb-8 flex flex-col gap-12">
      <Card>
        <CardHeader variant="gradient" color="blue" className="mb-8 p-6">
          <Typography variant="h6" color="white">
            Document Search by Reference Number
          </Typography>
        </CardHeader>
        <CardBody className="overflow-x-auto px-0 pt-0 pb-2">
          <div className="p-6">
            <div className="flex gap-4 items-end">
              <div className="flex-1">
                <Typography variant="small" color="blue-gray" className="mb-2 font-medium">
                  Reference Number
                </Typography>
                <Input
                  type="text"
                  placeholder="Enter reference number (e.g., 123456-01-NS)"
                  value={referenceNumber}
                  onChange={(e) => setReferenceNumber(e.target.value)}
                  onKeyPress={handleKeyPress}
                  className="!border !border-gray-300 bg-white text-gray-900 shadow-lg shadow-gray-900/5 ring-4 ring-transparent placeholder:text-gray-500 focus:!border-gray-900 focus:!border-t-gray-900 focus:ring-gray-900/10"
                  labelProps={{
                    className: "hidden",
                  }}
                  containerProps={{ className: "min-w-[100px]" }}
                />
              </div>
              <Button
                onClick={handleSearch}
                disabled={loading}
                className="flex items-center gap-2"
              >
                {loading ? (
                  <Spinner size="sm" />
                ) : (
                  <MagnifyingGlassIcon className="h-4 w-4" />
                )}
                Search
              </Button>
            </div>

            {error && (
              <Alert color="red" className="mt-4">
                {error}
              </Alert>
            )}

            {success && (
              <Alert color="green" className="mt-4">
                {success}
              </Alert>
            )}
          </div>
        </CardBody>
      </Card>

      {document && (
        <Card>
          <CardHeader variant="gradient" color="green" className="mb-8 p-6">
            <Typography variant="h6" color="white">
              Document Details
            </Typography>
          </CardHeader>
          <CardBody className="overflow-x-auto px-0 pt-0 pb-2">
            <div className="p-6 space-y-6">
              {/* Basic Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Typography variant="h6" color="blue-gray" className="mb-4">
                    Basic Information
                  </Typography>
                  <div className="space-y-3">
                    <div>
                      <Typography variant="small" color="blue-gray" className="font-medium">
                        Reference Number
                      </Typography>
                      <Typography variant="paragraph" className="font-mono">
                        {document.reference_number}
                      </Typography>
                    </div>
                    <div>
                      <Typography variant="small" color="blue-gray" className="font-medium">
                        Title
                      </Typography>
                      <Typography variant="paragraph">
                        {document.title}
                      </Typography>
                    </div>
                    <div>
                      <Typography variant="small" color="blue-gray" className="font-medium">
                        Description
                      </Typography>
                      <Typography variant="paragraph">
                        {document.description}
                      </Typography>
                    </div>
                    <div>
                      <Typography variant="small" color="blue-gray" className="font-medium">
                        Status
                      </Typography>
                      <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(document.status)}`}>
                        {document.status.replace('_', ' ').toUpperCase()}
                      </span>
                    </div>
                    <div>
                      <Typography variant="small" color="blue-gray" className="font-medium">
                        Created At
                      </Typography>
                      <Typography variant="paragraph">
                        {formatDate(document.created_at)}
                      </Typography>
                    </div>
                  </div>
                </div>

                <div>
                  <Typography variant="h6" color="blue-gray" className="mb-4">
                    Service & User Information
                  </Typography>
                  <div className="space-y-3">
                    <div>
                      <Typography variant="small" color="blue-gray" className="font-medium">
                        Service
                      </Typography>
                      <Typography variant="paragraph">
                        {document.service?.name}
                      </Typography>
                    </div>
                    <div>
                      <Typography variant="small" color="blue-gray" className="font-medium">
                        Country
                      </Typography>
                      <Typography variant="paragraph">
                        {document.country?.name}
                      </Typography>
                    </div>
                    <div>
                      <Typography variant="small" color="blue-gray" className="font-medium">
                        User
                      </Typography>
                      <Typography variant="paragraph">
                        {document.user?.name} ({document.user?.phone})
                      </Typography>
                    </div>
                    <div>
                      <Typography variant="small" color="blue-gray" className="font-medium">
                        Assigned To
                      </Typography>
                      <Typography variant="paragraph">
                        {document.assignedUser?.name || "Not assigned"}
                      </Typography>
                    </div>
                    <div>
                      <Typography variant="small" color="blue-gray" className="font-medium">
                        Cost
                      </Typography>
                      <Typography variant="paragraph">
                        NRS {document.cost || "Not set"}
                      </Typography>
                    </div>
                  </div>
                </div>
              </div>

              {/* Payment Information */}
              {document.payment && (
                <div>
                  <Typography variant="h6" color="blue-gray" className="mb-4">
                    Payment Information
                  </Typography>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <Typography variant="small" color="blue-gray" className="font-medium">
                        Payment Status
                      </Typography>
                      <Typography variant="paragraph">
                        {document.payment.payment_status.replace('_', ' ').toUpperCase()}
                      </Typography>
                    </div>
                    <div>
                      <Typography variant="small" color="blue-gray" className="font-medium">
                        Total Amount
                      </Typography>
                      <Typography variant="paragraph">
                        NRS {document.payment.total_payment_amount || "Not set"}
                      </Typography>
                    </div>
                    <div>
                      <Typography variant="small" color="blue-gray" className="font-medium">
                        Partial Payment
                      </Typography>
                      <Typography variant="paragraph">
                        NRS {document.payment.partial_payment_amount || "0"}
                      </Typography>
                    </div>
                  </div>
                </div>
              )}

              {/* Chat Messages */}
              {document.chatMessages && document.chatMessages.length > 0 && (
                <div>
                  <Typography variant="h6" color="blue-gray" className="mb-4">
                    Chat History ({document.chatMessages.length} messages)
                  </Typography>
                  <div className="max-h-96 overflow-y-auto space-y-3 border rounded-lg p-4">
                    {document.chatMessages.map((message, index) => (
                      <div key={index} className="border-b pb-3 last:border-b-0">
                        <div className="flex justify-between items-start mb-2">
                          <Typography variant="small" className="font-medium">
                            {message.user?.name || "Unknown User"}
                          </Typography>
                          <Typography variant="small" color="gray">
                            {formatDate(message.created_at)}
                          </Typography>
                        </div>
                        <Typography variant="paragraph" className="text-sm">
                          {message.message}
                        </Typography>
                        {message.file && (
                          <div className="mt-2">
                            <Typography variant="small" color="blue" className="cursor-pointer">
                              📎 Attachment
                            </Typography>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Document History - Temporarily disabled due to database table issues */}
              {/* {document.history && document.history.length > 0 && (
                <div>
                  <Typography variant="h6" color="blue-gray" className="mb-4">
                    Document History ({document.history.length} entries)
                  </Typography>
                  <div className="max-h-64 overflow-y-auto space-y-3 border rounded-lg p-4">
                    {document.history.map((entry, index) => (
                      <div key={index} className="border-b pb-3 last:border-b-0">
                        <div className="flex justify-between items-start mb-2">
                          <Typography variant="small" className="font-medium">
                            {entry.user?.name || "System"}
                          </Typography>
                          <Typography variant="small" color="gray">
                            {formatDate(entry.created_at)}
                          </Typography>
                        </div>
                        <Typography variant="paragraph" className="text-sm">
                          <strong>{entry.action}</strong>
                          {entry.old_status && entry.new_status && (
                            <span>: {entry.old_status} → {entry.new_status}</span>
                          )}
                        </Typography>
                        {entry.notes && (
                          <Typography variant="small" color="gray" className="mt-1">
                            {entry.notes}
                          </Typography>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )} */}

              {/* Feedback - Temporarily disabled due to database table issues */}
              {/* {document.feedback && (
                <div>
                  <Typography variant="h6" color="blue-gray" className="mb-4">
                    User Feedback
                  </Typography>
                  <div className="border rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Typography variant="small" color="blue-gray" className="font-medium">
                        Rating:
                      </Typography>
                      <div className="flex">
                        {[...Array(5)].map((_, i) => (
                          <span key={i} className={i < document.feedback.rating ? "text-yellow-500" : "text-gray-300"}>
                            ★
                          </span>
                        ))}
                      </div>
                    </div>
                    {document.feedback.comment && (
                      <Typography variant="paragraph" className="text-sm">
                        {document.feedback.comment}
                      </Typography>
                    )}
                  </div>
                </div>
              )} */}

              {/* Reports */}
              {document.report && (
                <div>
                  <Typography variant="h6" color="blue-gray" className="mb-4">
                    Problem Report
                  </Typography>
                  <div className="border rounded-lg p-4">
                    <Typography variant="paragraph" className="font-medium mb-2">
                      {document.report.title}
                    </Typography>
                    <Typography variant="paragraph" className="text-sm">
                      {document.report.description}
                    </Typography>
                    <div className="mt-2">
                      <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${
                        document.report.is_solved ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                      }`}>
                        {document.report.is_solved ? "Solved" : "Pending"}
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </CardBody>
        </Card>
      )}
    </div>
  );
}

export default DocumentSearch; 