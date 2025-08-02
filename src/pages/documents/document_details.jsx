import React, { useState, useEffect, useRef } from 'react';
import { format } from 'date-fns';
import { authService } from '../../services/apiService';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import { pusherService } from '../../services/pusher_init';

const LoadingSkeleton = () => (
  <div className="max-w-7xl mx-auto p-6 space-y-8 animate-pulse">
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      {/* Main Content Loading Skeleton */}
      <div className="lg:col-span-2 space-y-8">
        {/* Header Skeleton */}
        <div className="bg-white rounded-xl shadow p-6 border border-gray-100">
          <div className="flex justify-between items-center">
            <div className="space-y-3">
              <div className="h-6 bg-gray-200 rounded w-48"></div>
              <div className="h-4 bg-gray-200 rounded w-32"></div>
            </div>
            <div className="h-8 bg-gray-200 rounded-full w-24"></div>
          </div>
        </div>

        {/* Document Preview Skeleton */}
        <div className="bg-white rounded-xl shadow p-6 border border-gray-100">
          <div className="flex justify-between items-center mb-6">
            <div className="h-6 bg-gray-200 rounded w-36"></div>
            <div className="h-8 bg-gray-200 rounded-lg w-32"></div>
          </div>
          <div className="border border-gray-200 rounded-lg">
            <div className="h-[600px] bg-gray-100"></div>
          </div>
        </div>
      </div>

      {/* Sidebar Loading Skeleton */}
      <div className="space-y-8">
        <div className="bg-white rounded-xl shadow p-6 border border-gray-100">
          <div className="h-6 bg-gray-200 rounded w-36 mb-6"></div>
          <div className="space-y-6">
            {[...Array(4)].map((_, i) => (
              <div key={i}>
                <div className="h-4 bg-gray-200 rounded w-24 mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-48"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  </div>
);

const DocumentDetails = () => {
    const location = useLocation();
    const documentId = location.state?.document?.id;
  const [document, setDocument] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [cost, setCost] = useState('');
  const [documentTypeQuantities, setDocumentTypeQuantities] = useState({});
  const [totalPrice, setTotalPrice] = useState(0);
  const [estimatedDateTime, setEstimatedDateTime] = useState('');
  const [alert, setAlert] = useState({ show: false, message: '', type: '' });
  const [messages, setMessages] = useState([]);
  const [messagePagination, setMessagePagination] = useState({
    currentPage: 1,
    lastPage: 1,
    total: 0
  });
  const [hasNewMessageForAdmin, setHasNewMessageForAdmin] = useState(false);
  const [newMessage, setNewMessage] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const messagesEndRef = useRef(null);
  const [recheckFile, setRecheckFile] = useState(null);
  const [uploadingRecheck, setUploadingRecheck] = useState(false);
  const [uploadingFinal, setUploadingFinal] = useState(false);
  const [finalDocument, setFinalDocument] = useState(null);
  const [finalDocumentZip, setFinalDocumentZip] = useState(null);
  const [sendingStatus, setSendingStatus] = useState(null);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [unreadMessages, setUnreadMessages] = useState(0);
  const [showRejectDialog, setShowRejectDialog] = useState(false);
  const [showReportDialog, setShowReportDialog] = useState(false);
  const [reportReason, setReportReason] = useState('');
  const navigate = useNavigate();
  
  // Custom price functionality
  const [useCustomPrice, setUseCustomPrice] = useState(false);
  const [customPrice, setCustomPrice] = useState('');
  const [customPriceDisplay, setCustomPriceDisplay] = useState('');

  useEffect(() => {
    const fetchDocument = async () => {
      try {
        const response = await authService.getDocumentById(documentId);
        setDocument(response.data);
        // Initialize form values with existing data
        setCost(response.data.payment.total_payment_amount || '');
        setHasNewMessageForAdmin(response.data.document_mark.has_new_message_for_admin);
        // Convert hours to days for display
        setEstimatedDateTime(response.data.estimated_time ? format(new Date(response.data.estimated_time), 'yyyy-MM-ddTHH:mm') : '');
        
        // Initialize document type quantities
        if (response.data.related_doc_types) {
          const initialQuantities = {};
          response.data.related_doc_types.forEach(type => {
            initialQuantities[type.id] = 0;
          });
          setDocumentTypeQuantities(initialQuantities);
        }
      } catch (error) {
        console.error('Error fetching document:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDocument();
  }, [documentId]);

  // Calculate total price when document type quantities change
  useEffect(() => {
    if (document && document.related_doc_types) {
      if (useCustomPrice) {
        // Use custom price when enabled
        const customPriceValue = parseFloat(customPrice) || 0;
        setTotalPrice(customPriceValue);
        setCost(customPriceValue.toString());
      } else {
        // Use automatic calculation based on document types
        let displayTotal = 0; // For admin display (actual_price)
        let backendTotal = 0; // For backend (user_price)
        
        Object.entries(documentTypeQuantities).forEach(([typeId, quantity]) => {
          const docType = document.related_doc_types.find(type => type.id === parseInt(typeId));
          if (docType && quantity > 0) {
            // Use actual_price for admin display
            displayTotal += parseFloat(docType.actual_price) * quantity;
            // Use user_price for backend calculation
            backendTotal += parseFloat(docType.user_price) * quantity;
          }
        });
        
        setTotalPrice(displayTotal); // Show actual_price total to admin
        setCost(backendTotal.toString()); // Send user_price total to backend
      }
    }
  }, [documentTypeQuantities, document, useCustomPrice, customPrice]);

  useEffect(() => {
    const fetchMessages = async () => {
      try {
        const response = await authService.getMessages(documentId);
        // Sort messages by created_at in ascending order (oldest first)
        const sortedMessages = (response.data.messages.data || []).sort((a, b) => 
          new Date(a.created_at) - new Date(b.created_at)
        );
        setMessages(sortedMessages);
        setMessagePagination({
          currentPage: response.data.messages.current_page,
          lastPage: response.data.messages.last_page,
          total: response.data.messages.total
        });
      } catch (error) {
        console.error('Error fetching messages:', error);
        setMessages([]);
      }
    };

    if (documentId) {
      fetchMessages();
    }
  }, [documentId]);

  useEffect(() => {
    // Get saved user data when component mounts
    const { user } = authService.getSavedUserData();
    setCurrentUser(user);
  }, []);

  // Add Pusher subscription when component mounts
  useEffect(() => {
    let channel;
    
    const initializePusher = async () => {
      if (documentId) {
        await pusherService.initPusher();
        channel = pusherService.subscribeToChatChannel(documentId, (data) => {
          // Add the new message to the messages array
          setMessages(prevMessages => {
            const newMessage = data;
            // Check if message already exists to prevent duplicates
            if (prevMessages.some(msg => msg.id === newMessage.id)) {
              return prevMessages;
            }
            // If chat is not open, increment unread count
            if (!isChatOpen) {
              setUnreadMessages(prev => prev + 1);
            }
            // Sort messages by created_at in ascending order
            return [...prevMessages, newMessage].sort((a, b) => 
              new Date(a.created_at) - new Date(b.created_at)
            );
          });
        });
      }
    };

    initializePusher();

    // Cleanup subscription when component unmounts
    return () => {
      if (documentId) {
        pusherService.unsubscribeFromChatChannel(documentId);
      }
    };
  }, [documentId, isChatOpen]);

  // Reset unread count when opening chat
  useEffect(() => {
    if (isChatOpen) {
      setUnreadMessages(0);
    }
  }, [isChatOpen]);

  const handleQuantityChange = (typeId, value) => {
    const quantity = Math.max(0, parseInt(value) || 0);
    setDocumentTypeQuantities(prev => ({
      ...prev,
      [typeId]: quantity
    }));
  };

  const handlePaymentForDocument = async () => {
    // Validation
    if (useCustomPrice && (!customPrice || parseFloat(customPrice) <= 0)) {
      setAlert({
        show: true,
        message: 'Please enter a valid custom price',
        type: 'error'
      });
      return;
    }
    
    if (!useCustomPrice) {
      // Check if any document types are selected
      const hasSelectedTypes = Object.values(documentTypeQuantities).some(quantity => quantity > 0);
      if (!hasSelectedTypes) {
        setAlert({
          show: true,
          message: 'Please select at least one document type and quantity',
          type: 'error'
        });
        return;
      }
    }
    
    setUpdating(true);
    try {
      // Format the date to MySQL datetime format (YYYY-MM-DD HH:mm:ss)
      const estimatedDate = new Date(estimatedDateTime);
      const formattedDate = format(estimatedDate, 'yyyy-MM-dd HH:mm:ss');
      
      // Prepare the request payload based on pricing mode
      const requestPayload = {
        total_payment_amount: cost,
        estimated_time: formattedDate,
        clearAccepted: true,
        status: 'cost_estimated',
        use_custom_price: useCustomPrice
      };
      
      if (useCustomPrice) {
        // When using custom price, don't send document type quantities
        requestPayload.custom_price = customPrice;
      } else {
        // When using automatic pricing, send document type quantities
        const docTypeIds = Object.entries(documentTypeQuantities)
          .filter(([typeId, quantity]) => quantity > 0)
          .map(([typeId, quantity]) => typeId);
        
        requestPayload.document_type_quantities = documentTypeQuantities;
        requestPayload.doc_type_id = docTypeIds;
      }
      
      await authService.paymentForDocument(documentId, requestPayload);
      
      // Refresh document data
      const response = await authService.getDocumentById(documentId);
      setDocument(response.data);
      
      setAlert({
        show: true,
        message: 'Document updated successfully',
        type: 'success'
      });
    } catch (error) {
      console.error('Error updating document:', error);
      setAlert({
        show: true,
        message: 'Failed to update document. Please try again.',
        type: 'error'
      });
    } finally {
      setUpdating(false);
      setTimeout(() => {
        setAlert({ show: false, message: '', type: '' });
      }, 3000);
    }
  };

  const handleCancelChanges = () => {
    setCost(document.cost || '');
    // Convert hours back to days when canceling
    setEstimatedDateTime(document.estimated_time ? format(new Date(document.estimated_time), 'yyyy-MM-ddTHH:mm') : '');
    // Reset custom price state
    setUseCustomPrice(false);
    setCustomPrice('');
    setCustomPriceDisplay('');
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim() && !selectedFile) return;

    // File validation if file is selected
    if (selectedFile) {
      // File type validation
      const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg', 'image/gif', 'image/bmp', 'image/webp', 'application/pdf', 'image/heic', 'image/heif'];
      if (!allowedTypes.includes(selectedFile.type)) {
        alert('Please select a valid file type (JPEG, PNG, JPG, GIF, PDF, HEIC, HEIF)');
        return;
      }
      
      // File size validation (2MB = 2097152 bytes)
      const maxSize = 2 * 1024 * 1024; // 2MB
      if (selectedFile.size > maxSize) {
        alert('File size must be less than 2MB');
        return;
      }
    }

    const messageToSend = newMessage; // Store the message to send
    setNewMessage(''); // Clear the input field immediately
    setSelectedFile(null);

    // Add the message to the messages array with a temporary status
    setMessages(prevMessages => [
        ...prevMessages,
        { id: Date.now(), message: messageToSend, user_id: currentUser.id, created_at: new Date() }
    ]);

    setSendingStatus('Sending Message...');
    try {
        const formData = new FormData();
        formData.append('document_id', documentId);
        formData.append('message', messageToSend);
        formData.append('web', '');
        if (selectedFile) {
            formData.append('file', selectedFile);
        }

        await authService.sendMessage(formData);
        
        // Refresh messages
        const response = await authService.getMessages(documentId);
        // Sort messages by created_at in ascending order (oldest first)
        const sortedMessages = (response.data.messages.data || []).sort((a, b) => 
            new Date(a.created_at) - new Date(b.created_at)
        );
        setMessages(sortedMessages);
        setMessagePagination({
            currentPage: response.data.messages.current_page,
            lastPage: response.data.messages.last_page,
            total: response.data.messages.total
        });
        
        setSendingStatus('Message Sent');
    } catch (error) {
        console.error('Error sending message:', error);
        setSendingStatus('Message Failed');
    } finally {
        // Clear the selected file after sending the message
        setTimeout(() => setSendingStatus(null), 3000);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleStartProgress = async () => {
    setUpdating(true);
    try {
      await authService.updateDocument(documentId, {
        status: 'in_progress'
      });
      
      // Refresh document data
      const response = await authService.getDocumentById(documentId);
      setDocument(response.data);
      
      setAlert({
        show: true,
        message: 'Document status updated to In Progress',
        type: 'success'
      });
    } catch (error) {
      console.error('Error updating document status:', error);
      setAlert({
        show: true,
        message: 'Failed to update document status. Please try again.',
        type: 'error'
      });
    } finally {
      setUpdating(false);
      setTimeout(() => {
        setAlert({ show: false, message: '', type: '' });
      }, 3000);
    }
  };

  const handleRecheckUpload = async () => {
    if (!recheckFile) return;

    setUploadingRecheck(true);
    try {
      const formData = new FormData();
      formData.append('recheck_file_url', recheckFile);
      formData.append('clearAccepted', true);
      
      await authService.uploadRecheckAndFinalFile(documentId, formData);
      
      // Refresh document data
      const response = await authService.getDocumentById(documentId);
      setDocument(response.data);
      
      setAlert({
        show: true,
        message: 'Document uploaded for review successfully',
        type: 'success'
      });
      setRecheckFile(null);
    } catch (error) {
      console.error('Error uploading recheck document:', error);
      setAlert({
        show: true,
        message: 'Failed to upload document. Please try again.',
        type: 'error'
      });
    } finally {
      setUploadingRecheck(false);
      setTimeout(() => {
        setAlert({ show: false, message: '', type: '' });
      }, 3000);
    }
  };

  const handleFinalDocumentUpload = async () => {
    if (!finalDocumentZip) return;

    setUploadingFinal(true);
    try {
      const formData = new FormData();
      formData.append('final_file_zip_url', finalDocumentZip, finalDocumentZip.name);
      formData.append('status', 'completed');
      
      await authService.uploadRecheckAndFinalFile(documentId, formData);
      
      // Refresh document data
      const response = await authService.getDocumentById(documentId);
      setDocument(response.data);
      
      setAlert({
        show: true,
        message: 'Final document uploaded successfully',
        type: 'success'
      });
      setFinalDocumentZip(null);
    } catch (error) {
      console.error('Error uploading final document:', error);
      setAlert({
        show: true,
        message: 'Failed to upload final document. Please try again.',
        type: 'error'
      });
    } finally {
      setUploadingFinal(false);
      setTimeout(() => {
        setAlert({ show: false, message: '', type: '' });
      }, 3000);
    }
  };

  const handleRejectDocument = async () => {
    try {
      await authService.rejectDocument({
        document_id: documentId,
        admin_rejection_reason: reportReason,
      });
      // Navigate back to the previous page
      navigate(-1);
    } catch (error) {
      console.error('Error rejecting document:', error);
      setAlert({
        show: true,
        message: 'Failed to reject document. Please try again.',
        type: 'error',
      });
    }
    setShowRejectDialog(false);
  };

  const handleReportAndRemoveDocument = async () => {
    try {
      await authService.removeDocument({
        document_id: documentId,
        admin_rejection_reason: reportReason,
      });
      // Navigate back to the previous page
      navigate(-1);
    } catch (error) {
      console.error('Error reporting and removing document:', error);
      setAlert({
        show: true,
        message: 'Failed to report and remove document. Please try again.',
        type: 'error',
      });
    }
    setShowReportDialog(false);
    setReportReason('');
  };

  // Replace the existing loading state with the new component
  if (loading) {
    return <LoadingSkeleton />;
  }

  // Show error state if document is null
  if (!document) {
    return <div className="max-w-7xl mx-auto p-6">Document not found</div>;
  }

  const getStatusBadgeColor = (status) => {
    const colors = {
      pending: 'bg-yellow-100 text-yellow-800',
      'cost estimated': 'bg-blue-100 text-blue-800',
      completed: 'bg-green-100 text-green-800',
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-8">
      {alert.show && (
        <div className={`mb-4 p-4 rounded-lg shadow-sm ${
          alert.type === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
        }`}>
          {alert.message}
        </div>
      )}
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Document Content */}
        <div className="lg:col-span-2 space-y-8">
          {/* Document Header Card */}
          <div className="bg-white rounded-xl shadow p-6 border border-gray-100">
            {/* Back to Dashboard Button */}
            <div className="mb-4">
              <button
                onClick={() => navigate('/dashboard/home')}
                className="inline-flex items-center px-4 py-2 text-sm font-medium text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors duration-200"
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                Back to Dashboard
              </button>
            </div>
            
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">{document.title}</h1>
                <p className="text-sm text-gray-500 mt-1">
                  Created on {format(new Date(document.created_at), 'PPP')}
                </p>
              </div>
              <span className={`px-4 py-1.5 rounded-full text-sm font-semibold ${getStatusBadgeColor(document.status)}`}>
                {document.status}
              </span>
            </div>
          </div>

          {/* Document Preview Card */}
          <div className="bg-white rounded-xl shadow p-6 border border-gray-100">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold text-gray-900">Document Preview</h2>
              {console.log(document.file_url_full)}
              <a
                href={JSON.parse(JSON.stringify(document.file_url_full))}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center px-4 py-2 text-sm font-medium text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors duration-200"
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
                Open in New Page
              </a>
            </div>
            <div className="border border-gray-200 rounded-lg overflow-hidden shadow-inner">
              {(() => {
                // Extract the pathname from the URL to check file extension
                const urlPath = document.file_url_full.split('?')[0]; // Remove query parameters
                return urlPath.endsWith('.pdf');
              })() ? (
                <iframe
                  src={JSON.parse(JSON.stringify(document.file_url_full))}
                  className="w-full h-[600px]"
                  title="Document Preview"
                />
              ) : (
                <div className="text-center py-12 bg-gray-50">
                  <span className="text-gray-500">Preview not available for this file type</span>
                </div>
              )}
            </div>
          </div>

          {/* Admin Controls Card */}
          {document.status === 'pending' && (
            <div className="bg-white rounded-xl shadow p-6 border border-gray-100">
              <button
                onClick={() => setShowRejectDialog(true)}
                className="w-full bg-red-600 text-white px-4 py-3 rounded-lg hover:bg-red-700 transition-colors duration-200 font-medium mb-4"
              >
                Reject Document
              </button>

              <button
                onClick={() => setShowReportDialog(true)}
                className="w-full bg-yellow-600 text-white px-4 py-3 rounded-lg hover:bg-yellow-700 transition-colors duration-200 font-medium mb-4"
              >
                Report and Remove Document
              </button>

              {showRejectDialog && (
                <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
                  <div className="bg-white rounded-lg p-6 space-y-4">
                    <h2 className="text-lg font-semibold text-gray-900">Are you sure?</h2>
                    <p className="text-sm text-gray-500">Do you really want to reject this document?</p>
                    <div className="flex justify-end space-x-4">
                      <button
                        onClick={() => setShowRejectDialog(false)}
                        className="bg-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-300 transition-colors duration-200"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={handleRejectDocument}
                        className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors duration-200"
                      >
                        Reject
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {showReportDialog && (
                <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
                  <div className="bg-white rounded-lg p-6 space-y-4">
                    <h2 className="text-lg font-semibold text-gray-900">Report Document</h2>
                    <p className="text-sm text-gray-500">Please provide a reason for reporting this document:</p>
                    <textarea
                      value={reportReason}
                      onChange={(e) => setReportReason(e.target.value)}
                      className="w-full border border-gray-300 rounded-lg p-2"
                      rows="3"
                      placeholder="Enter reason here..."
                    />
                    <div className="flex justify-end space-x-4">
                      <button
                        onClick={() => setShowReportDialog(false)}
                        className="bg-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-300 transition-colors duration-200"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={handleReportAndRemoveDocument}
                        className="bg-yellow-600 text-white px-4 py-2 rounded-lg hover:bg-yellow-700 transition-colors duration-200"
                      >
                        Report
                      </button>
                    </div>
                  </div>
                </div>
              )}

              <h2 className="text-xl font-semibold text-gray-900 mb-8">Admin Controls</h2>
              
              {document.status === 'pending' && (
                <div className="space-y-8">
                  {/* Pricing Mode Selection */}
                  <div className="bg-white border border-gray-200 rounded-lg p-6">
                    <h3 className="text-lg font-medium text-gray-900 mb-4">Pricing Mode</h3>
                    <div className="space-y-4">
                      <div className="flex items-center space-x-4">
                        <label className={`flex items-center p-3 rounded-lg border-2 transition-all ${
                          !useCustomPrice 
                            ? 'border-blue-500 bg-blue-50' 
                            : 'border-gray-200 bg-gray-50'
                        }`}>
                          <input
                            type="radio"
                            name="pricingMode"
                            checked={!useCustomPrice}
                            onChange={() => setUseCustomPrice(false)}
                            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                          />
                          <span className="ml-2 text-sm font-medium text-gray-700">Automatic (Service Type Pricing)</span>
                        </label>
                        <label className={`flex items-center p-3 rounded-lg border-2 transition-all ${
                          useCustomPrice 
                            ? 'border-green-500 bg-green-50' 
                            : 'border-gray-200 bg-gray-50'
                        }`}>
                          <input
                            type="radio"
                            name="pricingMode"
                            checked={useCustomPrice}
                            onChange={() => setUseCustomPrice(true)}
                            className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300"
                          />
                          <span className="ml-2 text-sm font-medium text-gray-700">Custom Price</span>
                        </label>
                      </div>
                      
                      {useCustomPrice && (
                        <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Custom Price (Rs.)
                          </label>
                          <input
                            type="number"
                            min="0"
                            step="0.01"
                            value={customPrice}
                            onChange={(e) => {
                              setCustomPrice(e.target.value);
                              setCustomPriceDisplay(e.target.value);
                            }}
                            placeholder="Enter custom price"
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          />
                          <p className="text-sm text-yellow-700 mt-2">
                            This custom price will override the service type calculations.
                          </p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Document Types Section - Only show when not using custom price */}
                  {!useCustomPrice && (
                  <div>
                    <h3 className="block text-sm font-medium text-gray-700 mb-4">Select Document Types and Quantities</h3>
                    {document.related_doc_types && document.related_doc_types.map((docType) => (
                      <div key={docType.id} className="flex items-center justify-between mb-4 p-3 bg-gray-50 rounded-lg">
                        <div>
                          <p className="font-medium text-gray-900">{docType.name}</p>
                          <p className="text-sm text-gray-500">Price: Rs {docType.actual_price}</p>
                        </div>
                        <div className="flex items-center">
                          <button 
                            type="button"
                            onClick={() => handleQuantityChange(docType.id, (documentTypeQuantities[docType.id] || 0) - 1)}
                            className="inline-flex items-center justify-center p-1 border border-gray-300 rounded-md text-gray-700 bg-white hover:bg-gray-50"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                              <path fillRule="evenodd" d="M3 10a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
                            </svg>
                          </button>
                          <input
                            type="number"
                            min="0"
                            value={documentTypeQuantities[docType.id] || 0}
                            onChange={(e) => handleQuantityChange(docType.id, e.target.value)}
                            className="mx-2 w-16 text-center rounded-md border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                          />
                          <button 
                            type="button"
                            onClick={() => handleQuantityChange(docType.id, (documentTypeQuantities[docType.id] || 0) + 1)}
                            className="inline-flex items-center justify-center p-1 border border-gray-300 rounded-md text-gray-700 bg-white hover:bg-gray-50"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                              <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
                            </svg>
                          </button>
                        </div>
                      </div>
                    ))}
                    <div className="mt-4 p-4 bg-blue-50 rounded-lg flex justify-between items-center">
                      <span className="font-medium text-blue-800">Total Price:</span>
                      <span className="text-lg font-bold text-blue-800">Rs {totalPrice.toFixed(2)}</span>
                    </div>
                  </div>
                  )}

                  {/* Pricing Summary */}
                  <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                    <div className="flex justify-between items-center mb-2">
                      <span className="font-medium text-gray-700">Pricing Mode:</span>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        useCustomPrice 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-blue-100 text-blue-800'
                      }`}>
                        {useCustomPrice ? 'Custom Price' : 'Automatic (Service Types)'}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="font-medium text-gray-700">Total Amount:</span>
                      <span className={`text-lg font-bold ${
                        useCustomPrice ? 'text-green-800' : 'text-blue-800'
                      }`}>
                        Rs {useCustomPrice ? (customPrice || '0.00') : totalPrice.toFixed(2)}
                      </span>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Estimated Completion Date</label>
                    <div className="relative mt-1">
                      <input
                        type="date"
                        value={estimatedDateTime.split('T')[0]}
                        onChange={(e) => setEstimatedDateTime(e.target.value)}
                        className="block w-full rounded-lg border-gray-300 px-4 py-3 focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                        min={new Date().toISOString().split('T')[0]}
                      />
                    </div>
                  </div>

                  <div className="space-y-4 pt-4 border-t">
                    {alert.show && (
                      <div className={`p-4 rounded-lg ${
                        alert.type === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {alert.message}
                      </div>
                    )}
                    <button
                      onClick={handlePaymentForDocument}
                      disabled={updating}
                      className="w-full bg-blue-600 text-white px-4 py-3 rounded-lg hover:bg-blue-700 transition-colors duration-200 font-medium disabled:opacity-50"
                    >
                      {updating ? 'Updating...' : 'Update Document'}
                    </button>
                    <button
                      onClick={handleCancelChanges}
                      disabled={updating}
                      className="w-full bg-white text-gray-700 px-4 py-3 rounded-lg hover:bg-gray-50 transition-colors duration-200 font-medium border border-gray-300"
                    >
                      Cancel Changes
                    </button>
                  </div>
                </div>
              )}

              {document.status === 'paid' && (
                <div className="space-y-4">
                  <button
                    onClick={handleStartProgress}
                    disabled={updating}
                    className="w-full bg-blue-600 text-white px-4 py-3 rounded-lg hover:bg-blue-700 transition-colors duration-200 font-medium disabled:opacity-50"
                  >
                    {updating ? 'Updating...' : 'Start Processing Document'}
                  </button>
                </div>
              )}
            </div>
          )}

          {document.status === 'in_progress' && (
            <div className="bg-white rounded-xl shadow p-6 border border-gray-100">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">Document Review</h2>
              
              {document.recheck_file_url_full && (
                <div className="mb-6">
                  <h3 className="text-sm font-medium text-gray-500 mb-2">Current Review Document</h3>
                  <a
                    href={`${document.recheck_file_url_full}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center px-4 py-2 text-sm font-medium text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors duration-200"
                  >
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                    </svg>
                    View Current Review Document
                  </a>
                </div>
              )}

              {document.isAcceptedByUser !== null && (
                <div className="mb-6">
                  <h3 className="text-sm font-medium text-gray-500 mb-2">Acceptance Status</h3>
                  <p className="text-gray-900">
                    {document.isAcceptedByUser ? 'Accepted' : 'Rejected'}
                  </p>
                  <div className="h-4"></div>
                  <h3 className="text-sm font-medium text-gray-500 mb-2">Rejection Reason</h3>
                  <p className="text-gray-900">{document.rejected_reason || 'No reason provided'}</p>
                </div>
              )}

              {( (document.isAcceptedByUser === null && document.recheck_file_url === null) || (document.isAcceptedByUser === false && document.recheck_file_url !== null))  && (
                <div className="space-y-4">
                  <div className="flex items-center justify-center w-full">
                    <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100">
                      <div className="flex flex-col items-center justify-center pt-5 pb-6">
                        <svg className="w-8 h-8 mb-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                        </svg>
                        <p className="mb-2 text-sm text-gray-500">
                          <span className="font-semibold">Click to upload</span> or drag and drop
                        </p>
                        <p className="text-xs text-gray-500">PDF, DOC, DOCX (MAX. 10MB)</p>
                      </div>
                      <input
                        type="file"
                        className="hidden"
                        onChange={(e) => setRecheckFile(e.target.files[0])}
                        accept=".pdf,.doc,.docx"
                      />
                    </label>
                  </div>

                  {recheckFile && (
                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <span className="text-sm text-gray-600">{recheckFile.name}</span>
                      <button
                        onClick={() => setRecheckFile(null)}
                        className="text-red-500 hover:text-red-700"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                  )}

                  <button
                    onClick={handleRecheckUpload}
                    disabled={!recheckFile || uploadingRecheck}
                    className="w-full bg-blue-600 text-white px-4 py-3 rounded-lg hover:bg-blue-700 transition-colors duration-200 font-medium disabled:opacity-50"
                  >
                    {uploadingRecheck ? 'Uploading...' : 'Upload Document for Review'}
                  </button>
                </div>
              )}
            </div>
          )}
          {document.isAcceptedByUser === true && document.status !== 'completed' && document.payment.remaining_payment_amount.toString() === '0.00' && (
            <div className="bg-green-50 border border-green-200 rounded-xl p-6 mb-6">
              <div className="flex items-center gap-3">
                <div className="flex-shrink-0">
                  <svg className="h-8 w-8 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-green-800">Full Payment Received!</h3>
                  <p className="text-sm text-green-600">You can now upload the final document for this request.</p>
                </div>
              </div>
            </div>
          )}
          {document.isAcceptedByUser === true && document.status !== 'completed' && document.payment.remaining_payment_amount.toString() !== '0.00' && (
                      <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-6 mb-6">
                        <div className="flex items-center gap-3">
                          <div className="flex-shrink-0">
                            <svg className="h-8 w-8 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                            </svg>
                          </div>
                          <div>
                            <h3 className="text-lg font-semibold text-yellow-800">Payment Pending</h3>
                            <p className="text-sm text-yellow-600">Full payment has not been received yet.Waiting for payment.</p>
                          </div>
                        </div>
                      </div>
                    )}
          
          {document.isAcceptedByUser === true && document.status !== 'completed' && document.payment.remaining_payment_amount.toString() === '0.00' && (
            <div className="bg-white rounded-xl shadow p-6 border border-gray-100">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">Final Document Zip Upload</h2>
              <div className="space-y-4">
                <div className="flex items-center justify-center w-full">
                  <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100">
                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                      <svg className="w-8 h-8 mb-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                      </svg>
                      <p className="mb-2 text-sm text-gray-500">
                        <span className="font-semibold">Click to upload</span> or drag and drop
                      </p>
                      <p className="text-xs text-gray-500">ZIP (MAX. 10MB)</p>
                    </div>
                    <input
                      type="file"
                      className="hidden"
                      onChange={(e) => setFinalDocumentZip(e.target.files[0])}
                      accept=".zip"
                    />
                  </label>
                </div>

                {finalDocumentZip && (
                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <span className="text-sm text-gray-600">{finalDocumentZip.name}</span>
                    <button
                      onClick={() => setFinalDocumentZip(null)}
                      className="text-red-500 hover:text-red-700"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                )}

                <button
                  onClick={handleFinalDocumentUpload}
                  disabled={!finalDocumentZip || uploadingFinal}
                  className="w-full bg-blue-600 text-white px-4 py-3 rounded-lg hover:bg-blue-700 transition-colors duration-200 font-medium disabled:opacity-50"
                >
                  {uploadingFinal ? 'Uploading...' : 'Upload Final Document Zip'}
                </button>
              </div>
            </div>
          )}

          {document.status === 'completed' && document.final_file_url_full && (
            <div className="bg-white rounded-xl shadow p-6 border border-gray-100">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">Final Document</h2>
              <a
                href={`${document.final_file_url_full}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center px-4 py-2 text-sm font-medium text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors duration-200"
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
                View Final Document
              </a>
            </div>
          )}
        </div>

        {/* Sidebar Content */}
        <div className="space-y-8">
          {/* Document Details Card */}
          <div className="bg-white rounded-xl shadow p-6 border border-gray-100">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Document Details</h2>
            <div className="space-y-6">
              <div>
                <h3 className="text-sm font-medium text-gray-500">Description</h3>
                <p className="mt-1 text-gray-900">{document.description}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-500">Payment Status</h3>
                <p className={`mt-1 font-medium capitalize ${
                  document.payment.payment_status === 'not_paid' ? 'text-red-600' :
                  document.payment.payment_status === 'partially_paid' ? 'text-yellow-600' :
                  document.payment.payment_status === 'full_paid' ? 'text-green-600' :
                  'text-gray-600'
                }`}>
                  {document.payment.payment_status === 'not_paid' ? 'Not Paid' :
                   document.payment.payment_status === 'partially_paid' ? 'Partially Paid' :
                   document.payment.payment_status === 'full_paid' ? 'Full Paid' :
                   document.payment.payment_status}
                </p>
              </div>
              {document.estimated_time && (
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Estimated Time</h3>
                    <p className="mt-1 text-gray-900">{document.estimated_time}</p>
                </div>
              )}
              {document.assigned_user && (
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Assigned To</h3>
                  <p className="mt-1 text-gray-900">{document.assigned_user.name}</p>
                </div>
              )}
            </div>
          </div>

          {/* Chat Section */}
          {document.status !== 'pending' && document.status !== 'cost_estimated' && (
            <div className="bg-white rounded-xl shadow p-6 border border-gray-100">
              {/* Chat Header - Now acts as toggle */}
              <div 
                className="pb-4 border-b border-gray-200 flex justify-between items-center cursor-pointer"
                onClick={() => {
                  setIsChatOpen(!isChatOpen);
                    if(hasNewMessageForAdmin === true){
                      setHasNewMessageForAdmin(false);
                      authService.markAsReadForAdmin(document.id);
                    }
                    console.log(hasNewMessageForAdmin);

                }}
              >
                <div className="flex items-center">
                  <h2 className="text-xl font-semibold text-gray-900">Discussion</h2>
                  {unreadMessages > 0 && (
                    <span className="ml-2 px-2 py-1 bg-red-500 text-white text-xs font-medium rounded-full">
                      {unreadMessages}
                    </span>
                  )}

                  { hasNewMessageForAdmin === true && <span className="inline-flex items-center px-2.5 py-1 ml-2 rounded-full text-xs font-medium bg-blue-100 text-blue-800 ring-1 ring-inset ring-blue-600/20">
                    {'New Message'}
                  </span>}
                </div>
                <button className="text-gray-500 hover:text-gray-700 transition-colors">
                  <svg 
                    className={`w-6 h-6 transform transition-transform ${isChatOpen ? 'rotate-180' : ''}`} 
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
              </div>
              
              {/* Collapsible Chat Content */}
              <div className={`transition-all duration-300 ease-in-out overflow-hidden ${
                isChatOpen 
                  ? selectedFile != null ? 'h-[700px] opacity-100' : 'h-[600px] opacity-100' 
                  : 'h-0 opacity-0'
              }`}>
                {/* Messages Area */}
                <div className="flex-1 overflow-y-auto py-4 space-y-4 h-[500px]">
                  {messages.map((message, index) => {
                    const isUserMessage = currentUser && message.user_id === currentUser.id;
                    
                    // Add safe date formatting
                    let formattedTime;
                    try {
                      formattedTime = format(new Date(message.created_at), 'h:mm a');
                    } catch (error) {
                      console.error('Invalid date:', message.created_at);
                      formattedTime = 'Invalid date';
                    }

                    return (
                      <div key={message.id} className={`flex gap-3 ${isUserMessage ? 'justify-end' : 'justify-start'}`}>
                        {!isUserMessage && (
                          <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-r from-blue-500 to-blue-600 flex items-center justify-center">
                            <span className="text-sm font-medium text-white">A</span>
                          </div>
                        )}
                        
                        <div className={`group relative max-w-[80%] ${isUserMessage ? 'order-1' : 'order-2'}`}>
                          <div className={`rounded-2xl px-4 py-2 ${
                            isUserMessage 
                              ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white' 
                              : 'bg-gray-100 text-gray-800'
                          }`}>
                            {message.file_url && (
                              <div className="mb-2">
                                {/* Extract filename from the file field or file_url */}
                                {(() => {
                                  let fileName = 'Attached File';
                                  if (message.file) {
                                    // Extract filename from file path like "chat/1752212042.png"
                                    fileName = message.file.split('/').pop();
                                  } else if (message.file_url) {
                                    // Fallback to extract from URL
                                    fileName = message.file_url.split('/').pop().split('?')[0];
                                  }
                                  
                                  const isImage = /\.(jpg|jpeg|png|gif|bmp|webp)$/i.test(fileName);
                                  
                                  return (
                                    <div>
                                      {/* File download link */}
                                      <a 
                                        href={message.file_url} 
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className={`inline-flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                                          isUserMessage 
                                            ? 'bg-white/20 text-white hover:bg-white/30' 
                                            : 'bg-blue-50 text-blue-600 hover:bg-blue-100'
                                        }`}
                                      >
                                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                                        </svg>
                                        {fileName}
                                      </a>
                                      
                                      {/* Show image preview if it's an image */}
                                      {isImage && (
                                        <div className="mt-2 rounded-lg overflow-hidden">
                                          <img 
                                            src={message.file_url} 
                                            alt={fileName}
                                            className="max-w-full max-h-48 object-cover cursor-pointer"
                                            onClick={() => window.open(message.file_url, '_blank')}
                                          />
                                        </div>
                                      )}
                                    </div>
                                  );
                                })()}
                              </div>
                            )}
                            <p className="text-sm">{message.message}</p>
                          </div>
                          <span className={`block text-xs mt-1 ${
                            isUserMessage ? 'text-gray-500 text-right' : 'text-gray-500'
                          }`}>
                            {formattedTime}
                          </span>
                        </div>

                        {isUserMessage && (
                          <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-r from-blue-600 to-blue-700 flex items-center justify-center">
                            <span className="text-sm font-medium text-white">U</span>
                          </div>
                        )}
                      </div>
                    );
                  })}
                  <div ref={messagesEndRef} />
                </div>

                {/* File Preview */}
                {selectedFile && (
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200 mb-4">
                    <div className="flex items-center space-x-3">
                      {selectedFile.type.startsWith('image/') ? (
                        <img 
                          src={URL.createObjectURL(selectedFile)} 
                          alt="Preview" 
                          className="w-12 h-12 object-cover rounded-lg border border-gray-300"
                        />
                      ) : (
                        <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                          <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                          </svg>
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">{selectedFile.name}</p>
                        <p className="text-xs text-gray-500">
                          {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => setSelectedFile(null)}
                      className="p-1 text-gray-400 hover:text-red-500 transition-colors"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                )}

                {/* Chat Input */}
                <div className="pt-4 border-t border-gray-200">
                  <div className="flex gap-3">
                    <div className="flex-1 relative">
                      <textarea
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        rows="1"
                        className="w-full resize-none rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-900 focus:border-blue-500 focus:bg-white focus:ring-1 focus:ring-blue-500 focus:ring-offset-0"
                        placeholder="Type your message..."
                        style={{ minHeight: '44px', maxHeight: '120px' }}
                        onInput={(e) => {
                          e.target.style.height = 'auto';
                          e.target.style.height = Math.min(e.target.scrollHeight, 120) + 'px';
                        }}
                      />
                      <label 
                        htmlFor="file-upload" 
                        className="absolute bottom-2 right-3 cursor-pointer p-1.5 rounded-full hover:bg-gray-200 transition-colors"
                      >
                        <svg className="h-5 w-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                        </svg>
                      </label>
                      <input
                        type="file"
                        id="file-upload"
                        className="hidden"
                        accept=".jpg,.jpeg,.png,.gif,.pdf,.heic,.heif"
                        onChange={(e) => setSelectedFile(e.target.files[0])}
                      />
                    </div>
                    <button 
                      onClick={handleSendMessage}
                      disabled={(!newMessage.trim() && !selectedFile) || sendingStatus === 'Sending Message...'}
                      className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl hover:from-blue-600 hover:to-blue-700 transition-all duration-200 disabled:opacity-50 shadow-sm"
                    >
                      {sendingStatus === 'Sending Message...' ? (
                        <>
                          <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          Sending...
                        </>
                      ) : (
                        <>
                          <span>Send</span>
                          <svg className="ml-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                          </svg>
                        </>
                      )}
                    </button>
                  </div>
                  
                  {/* File upload hint */}
                  <p className="text-xs text-gray-500 mt-2">
                    <span className="inline-flex items-center">
                      <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                      </svg>
                      Click the attachment icon to add files (Max 2MB • Images, PDF, HEIC, HEIF)
                    </span>
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      
    </div>
  );
};

export default DocumentDetails;
