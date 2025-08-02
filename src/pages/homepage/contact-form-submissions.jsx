import React, { useState, useEffect } from 'react';
import { authService } from '@/services/apiService';
import { Card, CardBody, Typography, Button, IconButton, Badge } from "@material-tailwind/react";
import { Eye, Trash2, CheckCircle, XCircle, Clock, MessageCircle } from 'lucide-react';

const ContactFormSubmissions = () => {
  const [submissions, setSubmissions] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedSubmission, setSelectedSubmission] = useState(null);
  const [showDetails, setShowDetails] = useState(false);

  useEffect(() => {
    fetchSubmissions();
  }, []);

  const fetchSubmissions = async () => {
    setIsLoading(true);
    try {
      const response = await authService.getContactFormSubmissions();
      if (response.success) {
        setSubmissions(response.data);
      }
    } catch (error) {
      console.error('Error fetching submissions:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleStatusUpdate = async (id, newStatus) => {
    try {
      await authService.updateContactFormSubmission(id, { status: newStatus });
      fetchSubmissions();
    } catch (error) {
      console.error('Error updating submission status:', error);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this submission?')) {
      try {
        await authService.deleteContactFormSubmission(id);
        fetchSubmissions();
      } catch (error) {
        console.error('Error deleting submission:', error);
      }
    }
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      new: { color: 'blue', icon: Clock, text: 'New' },
      read: { color: 'yellow', icon: Eye, text: 'Read' },
      replied: { color: 'green', icon: MessageCircle, text: 'Replied' },
      closed: { color: 'gray', icon: CheckCircle, text: 'Closed' }
    };

    const config = statusConfig[status] || statusConfig.new;
    const IconComponent = config.icon;

    return (
      <Badge color={config.color} className="flex items-center gap-1">
        <IconComponent size={12} />
        {config.text}
      </Badge>
    );
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-6">
        <Typography variant="h3" color="blue-gray">
          Contact Form Submissions
        </Typography>
        <Button
          onClick={fetchSubmissions}
          color="blue"
          variant="gradient"
          disabled={isLoading}
        >
          {isLoading ? "Refreshing..." : "Refresh"}
        </Button>
      </div>

      {/* Submission Details Modal */}
      {showDetails && selectedSubmission && (
        <Card className="mb-6">
          <CardBody>
            <div className="flex justify-between items-center mb-4">
              <Typography variant="h5" color="blue-gray">
                Submission Details
              </Typography>
              <IconButton variant="text" onClick={() => setShowDetails(false)}>
                <XCircle size={20} />
              </IconButton>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <Typography variant="h6" color="blue-gray" className="mb-2">
                  Contact Information
                </Typography>
                <div className="space-y-2">
                  <p><strong>Name:</strong> {selectedSubmission.first_name} {selectedSubmission.last_name}</p>
                  <p><strong>Email:</strong> {selectedSubmission.email}</p>
                  <p><strong>Phone:</strong> {selectedSubmission.phone || 'Not provided'}</p>
                  <p><strong>Service Type:</strong> {selectedSubmission.service_type || 'Not specified'}</p>
                </div>
              </div>
              
              <div>
                <Typography variant="h6" color="blue-gray" className="mb-2">
                  Submission Details
                </Typography>
                <div className="space-y-2">
                  <p><strong>Status:</strong> {getStatusBadge(selectedSubmission.status)}</p>
                  <p><strong>Submitted:</strong> {formatDate(selectedSubmission.created_at)}</p>
                  <p><strong>Last Updated:</strong> {formatDate(selectedSubmission.updated_at)}</p>
                </div>
              </div>
            </div>
            
            <div className="mt-6">
              <Typography variant="h6" color="blue-gray" className="mb-2">
                Message
              </Typography>
              <div className="bg-gray-50 p-4 rounded-lg">
                <Typography variant="paragraph" color="gray">
                  {selectedSubmission.message}
                </Typography>
              </div>
            </div>
            
            {selectedSubmission.admin_notes && (
              <div className="mt-6">
                <Typography variant="h6" color="blue-gray" className="mb-2">
                  Admin Notes
                </Typography>
                <div className="bg-blue-50 p-4 rounded-lg">
                  <Typography variant="paragraph" color="gray">
                    {selectedSubmission.admin_notes}
                  </Typography>
                </div>
              </div>
            )}
            
            <div className="flex gap-2 mt-6">
              <Button
                color="green"
                variant="gradient"
                onClick={() => handleStatusUpdate(selectedSubmission.id, 'replied')}
                disabled={selectedSubmission.status === 'replied'}
              >
                Mark as Replied
              </Button>
              <Button
                color="gray"
                variant="gradient"
                onClick={() => handleStatusUpdate(selectedSubmission.id, 'closed')}
                disabled={selectedSubmission.status === 'closed'}
              >
                Close Submission
              </Button>
            </div>
          </CardBody>
        </Card>
      )}

      {/* Submissions List */}
      <div className="space-y-4">
        {isLoading ? (
          // Loading placeholders
          [1, 2, 3, 4, 5].map((index) => (
            <Card key={index} className="animate-pulse">
              <CardBody>
                <div className="h-6 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2 mb-3"></div>
                <div className="h-4 bg-gray-200 rounded w-full mb-1"></div>
                <div className="h-4 bg-gray-200 rounded w-5/6"></div>
              </CardBody>
            </Card>
          ))
        ) : submissions.length > 0 ? (
          submissions.map((submission) => (
            <Card key={submission.id} className="hover:shadow-lg transition-shadow">
              <CardBody>
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <Typography variant="h6" color="blue-gray">
                        {submission.first_name} {submission.last_name}
                      </Typography>
                      {getStatusBadge(submission.status)}
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-3 text-sm">
                      <div>
                        <strong>Email:</strong> {submission.email}
                      </div>
                      <div>
                        <strong>Phone:</strong> {submission.phone || 'Not provided'}
                      </div>
                      <div>
                        <strong>Service:</strong> {submission.service_type || 'Not specified'}
                      </div>
                    </div>
                    
                    <Typography variant="paragraph" color="gray" className="mb-3">
                      {submission.message.length > 150 
                        ? `${submission.message.substring(0, 150)}...` 
                        : submission.message
                      }
                    </Typography>
                    
                    <div className="flex justify-between items-center text-sm text-gray-500">
                      <span>Submitted: {formatDate(submission.created_at)}</span>
                      <span>ID: #{submission.id}</span>
                    </div>
                  </div>
                  
                  <div className="flex gap-1 ml-4">
                    <IconButton
                      variant="text"
                      size="sm"
                      onClick={() => {
                        setSelectedSubmission(submission);
                        setShowDetails(true);
                      }}
                    >
                      <Eye size={16} />
                    </IconButton>
                    <IconButton
                      variant="text"
                      size="sm"
                      color="red"
                      onClick={() => handleDelete(submission.id)}
                    >
                      <Trash2 size={16} />
                    </IconButton>
                  </div>
                </div>
              </CardBody>
            </Card>
          ))
        ) : (
          <div className="text-center py-8">
            <Typography variant="h6" color="gray">
              No contact form submissions found.
            </Typography>
          </div>
        )}
      </div>
    </div>
  );
};

export default ContactFormSubmissions; 