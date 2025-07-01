import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { authService } from '../../services/apiService';
import { 
  FileText, 
  Clock, 
  Check, 
  X, 
  AlertCircle, 
  ChevronLeft, 
  ChevronRight, 
  MessageCircle,
  FileImage,
  Download,
  ChevronDown,
  ChevronUp
} from 'lucide-react';

const API_BASE_URL = 'https://sajilonotary.xyz/';

const DocumentStatusBadge = ({ status }) => {
  const statusConfig = {
    pending: { bgColor: 'bg-yellow-100', textColor: 'text-yellow-800', icon: Clock, label: 'Pending' },
    cost_estimated: { bgColor: 'bg-blue-100', textColor: 'text-blue-800', icon: FileText, label: 'Cost Estimated' },
    payment_pending: { bgColor: 'bg-orange-100', textColor: 'text-orange-800', icon: Clock, label: 'Payment Pending' },
    in_progress: { bgColor: 'bg-indigo-100', textColor: 'text-indigo-800', icon: FileText, label: 'In Progress' },
    completed: { bgColor: 'bg-green-100', textColor: 'text-green-800', icon: Check, label: 'Completed' },
    rejected: { bgColor: 'bg-red-100', textColor: 'text-red-800', icon: X, label: 'Rejected' },
    approved: { bgColor: 'bg-green-100', textColor: 'text-green-800', icon: Check, label: 'Approved' },
    under_review: { bgColor: 'bg-purple-100', textColor: 'text-purple-800', icon: AlertCircle, label: 'Under Review' },
  };

  const config = statusConfig[status] || { 
    bgColor: 'bg-gray-100', 
    textColor: 'text-gray-800', 
    icon: AlertCircle, 
    label: status ? status.replace('_', ' ').toUpperCase() : 'Unknown' 
  };
  const Icon = config.icon;

  return (
    <div className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.bgColor} ${config.textColor}`}>
      <Icon className="w-3 h-3 mr-1" />
      {config.label}
    </div>
  );
};

const PaymentStatusBadge = ({ status }) => {
  const statusConfig = {
    not_paid: { bgColor: 'bg-red-100', textColor: 'text-red-800', label: 'Not Paid' },
    partially_paid: { bgColor: 'bg-yellow-100', textColor: 'text-yellow-800', label: 'Partially Paid' },
    full_paid: { bgColor: 'bg-green-100', textColor: 'text-green-800', label: 'Paid' },
  };

  const config = statusConfig[status] || statusConfig.not_paid;

  return (
    <div className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.bgColor} ${config.textColor}`}>
      {config.label}
    </div>
  );
};

const ServiceSection = ({ serviceName, serviceCode, serviceImage, documents, hasNewMessages, onViewDocument }) => {
  const [isExpanded, setIsExpanded] = useState(true);

  // Count documents with updates
  const newUpdatesCount = documents.filter(doc => doc.document_mark?.is_new).length;
  const newMessagesCount = documents.filter(doc => hasNewMessages[doc.id]).length;

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    }).format(date);
  };

  const formatDateTime = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden mb-6">
      {/* Service Header */}
      <div 
        className="bg-gradient-to-r from-blue-50 to-indigo-50 px-6 py-4 border-b cursor-pointer hover:from-blue-100 hover:to-indigo-100 transition-colors"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            {serviceImage && (
              <img 
                src={serviceImage} 
                alt={serviceName}
                className="w-12 h-12 rounded-lg object-cover"
              />
            )}
            <div>
              <h3 className="text-lg font-semibold text-gray-900">{serviceName}</h3>
              <p className="text-sm text-gray-600">Code: {serviceCode}</p>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
              {documents.length} document{documents.length !== 1 ? 's' : ''}
            </span>
            {newUpdatesCount > 0 && (
              <span className="bg-orange-100 text-orange-800 px-2 py-1 rounded-full text-sm font-medium">
                {newUpdatesCount} new update{newUpdatesCount !== 1 ? 's' : ''}
              </span>
            )}
            {newMessagesCount > 0 && (
              <span className="bg-red-100 text-red-800 px-2 py-1 rounded-full text-sm font-medium">
                {newMessagesCount} new message{newMessagesCount !== 1 ? 's' : ''}
              </span>
            )}
            {isExpanded ? (
              <ChevronUp className="w-5 h-5 text-gray-500" />
            ) : (
              <ChevronDown className="w-5 h-5 text-gray-500" />
            )}
          </div>
        </div>
      </div>

      {/* Documents Table */}
      {isExpanded && (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Document
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Country
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Payment Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date Submitted
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {documents.map((document) => (
                <tr key={document.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10 flex items-center justify-center rounded-full bg-blue-100 text-blue-500">
                        <FileText className="h-5 w-5" />
                      </div>
                      <div className="ml-4 min-w-0 flex-1">
                        <div className="text-sm font-medium text-gray-900 flex items-center flex-wrap gap-2">
                          {document.title}
                          {/* New Update Badge */}
                          {document.document_mark?.is_new && (
                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
                              New Update
                            </span>
                          )}
                          {/* New Message Badge */}
                          {hasNewMessages[document.id] && (
                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                              New Message
                            </span>
                          )}
                        </div>
                        <div className="text-sm text-gray-500 truncate">
                          {document.description}
                        </div>
                        {document.estimated_time && (
                          <div className="text-xs text-blue-600 mt-1">
                            Est. completion: {formatDateTime(document.estimated_time)}
                          </div>
                        )}
                        {/* Additional status indicators */}
                        <div className="flex items-center gap-2 mt-1">
                          {document.payment?.payment_status === 'full_paid' && (
                            <span className="inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium bg-green-100 text-green-700">
                              Paid
                            </span>
                          )}
                          {document.recheck_file_url_full && (
                            <span className="inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-700">
                              Revised
                            </span>
                          )}
                          {document.isAcceptedByUser === true && (
                            <span className="inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium bg-purple-100 text-purple-700">
                              Accepted
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{document.country?.name || 'Unknown'}</div>
                    <div className="text-xs text-gray-500">{document.country?.code}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <DocumentStatusBadge status={document.status} />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <PaymentStatusBadge status={document.payment?.payment_status} />
                    {document.payment?.total_payment_amount && (
                      <div className="text-xs text-gray-600 mt-1">
                        NPR {parseFloat(document.payment.total_payment_amount).toLocaleString()}
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{formatDate(document.created_at)}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex justify-end space-x-2">
                      <button
                        onClick={() => onViewDocument(document.id)}
                        className="text-blue-600 hover:text-blue-900 flex items-center"
                      >
                        <FileText className="h-4 w-4 mr-1" />
                        View
                      </button>
                      {document.file_url_full && (
                        <a
                          href={document.file_url_full}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-green-600 hover:text-green-900 flex items-center"
                        >
                          <Download className="h-4 w-4 mr-1" />
                          Download
                        </a>
                      )}
                      <button
                        onClick={() => onViewDocument(document.id)}
                        className="text-indigo-600 hover:text-indigo-900 flex items-center"
                      >
                        <MessageCircle className="h-4 w-4 mr-1" />
                        Message
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

const UserDocuments = () => {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [hasNewMessages, setHasNewMessages] = useState({});
  const [groupedDocuments, setGroupedDocuments] = useState({});
  
  useEffect(() => {
    const fetchDocuments = async () => {
      try {
        setLoading(true);
        const userId = authService.getCurrentUserId();
        
        const response = await authService.getUserDocuments(userId, currentPage);
        
        if (response.success) {
          setDocuments(response.data.data);
          setTotalPages(response.data.last_page);
          
          // Check for new messages
          const newMessageStatus = {};
          response.data.data.forEach(doc => {
            newMessageStatus[doc.id] = doc.document_mark.has_new_message_for_user;
          });
          setHasNewMessages(newMessageStatus);

          // Group documents by service using the service data from API
          const grouped = {};
          response.data.data.forEach(doc => {
            const serviceKey = doc.service?.id || 'unknown';
            const serviceName = doc.service?.name || 'Unknown Service';
            const serviceCode = doc.service?.code || 'N/A';
            const serviceImage = doc.service?.image_url || null;
            
            if (!grouped[serviceKey]) {
              grouped[serviceKey] = {
                serviceName,
                serviceCode,
                serviceImage,
                documents: []
              };
            }
            grouped[serviceKey].documents.push(doc);
          });
          
          setGroupedDocuments(grouped);
        } else {
          throw new Error(response.message || 'Failed to fetch documents');
        }
      } catch (err) {
        setError(err.message || 'An error occurred while fetching your documents');
        console.error('Error fetching documents:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchDocuments();
  }, [currentPage]);

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const handleViewDocument = async (documentId) => {
    try {
      // Mark document as read if it has new messages
      if (hasNewMessages[documentId]) {
        // await authService.markAsRead(documentId);
        setHasNewMessages(prev => ({
          ...prev,
          [documentId]: false
        }));
      }
      
      // Navigate to document details page
      window.location.href = `/document/${documentId}`;
    } catch (error) {
      console.error('Error marking document as read:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center">
        <AlertCircle className="w-16 h-16 text-red-500 mb-4" />
        <h1 className="text-2xl font-bold text-gray-800 mb-2">Error</h1>
        <p className="text-gray-600">{error}</p>
        <Link to="/" className="mt-6 text-blue-600 hover:text-blue-800 underline">Return to home</Link>
      </div>
    );
  }

  const totalDocuments = Object.values(groupedDocuments).reduce((total, group) => total + group.documents.length, 0);

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <Link 
            to="/"
            className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <ChevronLeft className="w-4 h-4 mr-2" />
            Back to Home
          </Link>
          <div className="text-center">
            <h1 className="text-3xl font-bold text-gray-900">Requested Documents</h1>
            <p className="text-gray-600 mt-1">Organized by service type</p>
          </div>
          <div></div> {/* Spacer for centering */}
        </div>
        
        {totalDocuments === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-8 text-center">
            <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h2 className="text-xl font-medium text-gray-800 mb-2">No documents found</h2>
            <p className="text-gray-600 mb-6">You haven't uploaded any documents yet.</p>
            <Link 
              to="/all-services"
              className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Upload New Document
            </Link>
          </div>
        ) : (
          <>
            {/* Service Sections */}
            {Object.entries(groupedDocuments).map(([serviceKey, serviceGroup]) => (
              <ServiceSection
                key={serviceKey}
                serviceName={serviceGroup.serviceName}
                serviceCode={serviceGroup.serviceCode}
                serviceImage={serviceGroup.serviceImage}
                documents={serviceGroup.documents}
                hasNewMessages={hasNewMessages}
                onViewDocument={handleViewDocument}
              />
            ))}
            
            {/* Pagination */}
            {totalPages > 1 && (
              <div className="px-4 py-3 flex items-center justify-between border-t border-gray-200 bg-white rounded-lg shadow-md sm:px-6">
                <div className="flex-1 flex justify-between sm:hidden">
                  <button
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className={`relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md ${
                      currentPage === 1 ? 'bg-gray-100 text-gray-400' : 'bg-white text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    Previous
                  </button>
                  <button
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className={`ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md ${
                      currentPage === totalPages ? 'bg-gray-100 text-gray-400' : 'bg-white text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    Next
                  </button>
                </div>
                <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                  <div>
                    <p className="text-sm text-gray-700">
                      Showing <span className="font-medium">{(currentPage - 1) * 5 + 1}</span> to{' '}
                      <span className="font-medium">
                        {Math.min(currentPage * 5, totalDocuments)}
                      </span>{' '}
                      of <span className="font-medium">{totalDocuments}</span> results
                    </p>
                  </div>
                  <div>
                    <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                      <button
                        onClick={() => handlePageChange(currentPage - 1)}
                        disabled={currentPage === 1}
                        className={`relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 ${
                          currentPage === 1 ? 'bg-gray-100 text-gray-400' : 'bg-white text-gray-500 hover:bg-gray-50'
                        }`}
                      >
                        <span className="sr-only">Previous</span>
                        <ChevronLeft className="h-5 w-5" />
                      </button>
                      {[...Array(totalPages).keys()].map(page => (
                        <button
                          key={page + 1}
                          onClick={() => handlePageChange(page + 1)}
                          className={`relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium ${
                            currentPage === page + 1
                              ? 'z-10 bg-blue-50 border-blue-500 text-blue-600'
                              : 'bg-white text-gray-500 hover:bg-gray-50'
                          }`}
                        >
                          {page + 1}
                        </button>
                      ))}
                      <button
                        onClick={() => handlePageChange(currentPage + 1)}
                        disabled={currentPage === totalPages}
                        className={`relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 ${
                          currentPage === totalPages ? 'bg-gray-100 text-gray-400' : 'bg-white text-gray-500 hover:bg-gray-50'
                        }`}
                      >
                        <span className="sr-only">Next</span>
                        <ChevronRight className="h-5 w-5" />
                      </button>
                    </nav>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
        
        {totalDocuments > 0 && (
          <div className="mt-8 text-center">
            <Link 
              to="/all-services"
              className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Upload New Document
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default UserDocuments; 