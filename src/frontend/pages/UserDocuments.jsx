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
  Download
} from 'lucide-react';

const API_BASE_URL = 'https://sajilonotary.xyz/';

const DocumentStatusBadge = ({ status }) => {
  const statusConfig = {
    pending: { bgColor: 'bg-yellow-100', textColor: 'text-yellow-800', icon: Clock, label: 'Pending' },
    approved: { bgColor: 'bg-green-100', textColor: 'text-green-800', icon: Check, label: 'Approved' },
    rejected: { bgColor: 'bg-red-100', textColor: 'text-red-800', icon: X, label: 'Rejected' },
    in_progress: { bgColor: 'bg-blue-100', textColor: 'text-blue-800', icon: FileText, label: 'In Progress' },
    completed: { bgColor: 'bg-purple-100', textColor: 'text-purple-800', icon: Check, label: 'Completed' },
  };

  const config = statusConfig[status] || statusConfig.pending;
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

const UserDocuments = () => {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [hasNewMessages, setHasNewMessages] = useState({});
  
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

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    }).format(date);
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

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Your Documents</h1>
        
        {documents.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-8 text-center">
            <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h2 className="text-xl font-medium text-gray-800 mb-2">No documents found</h2>
            <p className="text-gray-600 mb-6">You haven't uploaded any documents yet.</p>
            <Link 
              to="/"
              className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Upload New Document
            </Link>
          </div>
        ) : (
          <>
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Title
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Country
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Date
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Payment
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {documents.map((document) => (
                      <tr key={document.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-10 w-10 flex items-center justify-center rounded-full bg-blue-100 text-blue-500">
                              <FileText className="h-5 w-5" />
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900">
                                {document.title}
                                {hasNewMessages[document.id] && (
                                  <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                                    New Message
                                  </span>
                                )}
                              </div>
                              <div className="text-sm text-gray-500 truncate max-w-xs">
                                {document.description}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{document.country?.name || 'Unknown'}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{formatDate(document.created_at)}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <DocumentStatusBadge status={document.status} />
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <PaymentStatusBadge status={document.payment?.payment_status} />
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <div className="flex justify-end space-x-2">
                            <button
                              onClick={() => handleViewDocument(document.id)}
                              className="text-blue-600 hover:text-blue-900 flex items-center"
                            >
                              <FileText className="h-4 w-4 mr-1" />
                              View
                            </button>
                            {document.file_url && (
                              <a
                                href={`${API_BASE_URL}${document.file_url}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-green-600 hover:text-green-900 flex items-center"
                              >
                                <Download className="h-4 w-4 mr-1" />
                                Download
                              </a>
                            )}
                            <button
                              onClick={() => handleViewDocument(document.id)}
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
            </div>
            
            {/* Pagination */}
            {totalPages > 1 && (
              <div className="px-4 py-3 flex items-center justify-between border-t border-gray-200 bg-white rounded-b-lg sm:px-6">
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
                        {Math.min(currentPage * 5, documents.length)}
                      </span>{' '}
                      of <span className="font-medium">{documents.length}</span> results
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
        
        <div className="mt-8 text-center">
          <Link 
            to="/"
            className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Upload New Document
          </Link>
        </div>
      </div>
    </div>
  );
};

export default UserDocuments; 