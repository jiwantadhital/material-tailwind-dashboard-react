import React, { useState, useEffect, useRef } from 'react';
import { format } from 'date-fns';
import { authService } from '../../services/apiService';
import { useParams, useLocation } from 'react-router-dom';
import { pusherService } from '../../services/pusher_init';

const DocumentDetails = () => {
    const location = useLocation();
    const documentId = location.state?.document?.id;
  const [document, setDocument] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [cost, setCost] = useState('');
  const [estimatedTime, setEstimatedTime] = useState('');
  const [alert, setAlert] = useState({ show: false, message: '', type: '' });
  const [messages, setMessages] = useState([]);
  const [messagePagination, setMessagePagination] = useState({
    currentPage: 1,
    lastPage: 1,
    total: 0
  });
  const [newMessage, setNewMessage] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  const [sendingStatus, setSendingStatus] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const messagesEndRef = useRef(null);
  const [recheckFile, setRecheckFile] = useState(null);
  const [uploadingRecheck, setUploadingRecheck] = useState(false);
  const [uploadingFinal, setUploadingFinal] = useState(false);
  const [finalDocument, setFinalDocument] = useState(null);

  useEffect(() => {
    const fetchDocument = async () => {
      try {
        const response = await authService.getDocumentById(documentId);
        setDocument(response.data);
        // Initialize form values with existing data
        setCost(response.data.cost || '');
        setEstimatedTime(response.data.estimated_time || '');
      } catch (error) {
        console.error('Error fetching document:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDocument();
  }, [documentId]);

  useEffect(() => {
    const fetchMessages = async () => {
      try {
        const response = await authService.getMessages(documentId);
        // Sort messages by created_at in ascending order (oldest first)
        const sortedMessages = (response.data.data || []).sort((a, b) => 
          new Date(a.created_at) - new Date(b.created_at)
        );
        setMessages(sortedMessages);
        setMessagePagination({
          currentPage: response.data.current_page,
          lastPage: response.data.last_page,
          total: response.data.total
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
  }, [documentId]);

  const handleUpdateDocument = async () => {
    setUpdating(true);
    try {
      await authService.updateDocument(documentId, {
        cost: cost,
        estimated_time: estimatedTime,
        clearAccepted: true,
        status: 'cost_estimated'
      });
      
      // Refresh document data
      const response = await authService.getDocumentById(documentId);
      setDocument(response.data);
      
      // Show success alert
      setAlert({
        show: true,
        message: 'Document updated successfully',
        type: 'success'
      });
    } catch (error) {
      console.error('Error updating document:', error);
      // Show error alert
      setAlert({
        show: true,
        message: 'Failed to update document. Please try again.',
        type: 'error'
      });
    } finally {
      setUpdating(false);
      // Hide alert after 3 seconds
      setTimeout(() => {
        setAlert({ show: false, message: '', type: '' });
      }, 3000);
    }
  };

  const handleCancelChanges = () => {
    setCost(document.cost || '');
    setEstimatedTime(document.estimated_time || '');
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim() && !selectedFile) return;

    setSendingStatus('Sending Message...');
    try {
      const formData = new FormData();
      formData.append('document_id', documentId);
      formData.append('message', newMessage);
      if (selectedFile) {
        formData.append('file', selectedFile);
      }

      await authService.sendMessage(formData);
      
      // Refresh messages
      const response = await authService.getMessages(documentId);
      // Sort messages by created_at in ascending order (oldest first)
      const sortedMessages = (response.data.data || []).sort((a, b) => 
        new Date(a.created_at) - new Date(b.created_at)
      );
      setMessages(sortedMessages);
      setMessagePagination({
        currentPage: response.data.current_page,
        lastPage: response.data.last_page,
        total: response.data.total
      });
      
      setNewMessage('');
      setSelectedFile(null);
      setSendingStatus('Message Sent');
    } catch (error) {
      console.error('Error sending message:', error);
      setSendingStatus('Message Failed');
    }

    setTimeout(() => setSendingStatus(null), 3000);
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
      
      await authService.updateDocument(documentId, formData);
      
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
    if (!finalDocument) return;

    setUploadingFinal(true);
    try {
      const formData = new FormData();
      formData.append('final_file_url', finalDocument);
      formData.append('status', 'completed');
      
      await authService.updateDocument(documentId, formData);
      
      // Refresh document data
      const response = await authService.getDocumentById(documentId);
      setDocument(response.data);
      
      setAlert({
        show: true,
        message: 'Final document uploaded successfully',
        type: 'success'
      });
      setFinalDocument(null);
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

  // Show loading state while fetching data
  if (loading) {
    return <div className="max-w-7xl mx-auto p-6">Loading...</div>;
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
              <a
                href={`http://localhost:8000/${document.file_url}`}
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
              {document.file_url.endsWith('.pdf') ? (
                <iframe
                  src={`http://localhost:8000/${document.file_url}`}
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
          {(document.status === 'pending' || document.status === 'paid') && (
            <div className="bg-white rounded-xl shadow p-6 border border-gray-100">
              <h2 className="text-xl font-semibold text-gray-900 mb-8">Admin Controls</h2>
              
              {document.status === 'pending' && (
                <div className="space-y-8">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Cost</label>
                    <div className="relative mt-1">
                      <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
                        <span className="text-gray-500 sm:text-sm">$</span>
                      </div>
                      <input
                        type="number"
                        value={cost}
                        onChange={(e) => setCost(e.target.value)}
                        className="block w-full rounded-lg border-gray-300 pl-8 pr-16 py-3 focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                        placeholder="0.00"
                      />
                      <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-4">
                        <span className="text-gray-500 sm:text-sm">USD</span>
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Estimated Time (hours)</label>
                    <div className="relative mt-1">
                      <input
                        type="number"
                        value={estimatedTime}
                        onChange={(e) => setEstimatedTime(e.target.value)}
                        className="block w-full rounded-lg border-gray-300 px-4 py-3 focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                        placeholder="0"
                        min="0"
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
                      onClick={handleUpdateDocument}
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
              
              {document.recheck_file_url && (
                <div className="mb-6">
                  <h3 className="text-sm font-medium text-gray-500 mb-2">Current Review Document</h3>
                  <a
                    href={`http://localhost:8000/${document.recheck_file_url}`}
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

              {document.isAcceptedByUser === false && (
                <div className="mb-6">
                  <h3 className="text-sm font-medium text-gray-500 mb-2">Rejection Reason</h3>
                  <p className="text-gray-900">{document.rejected_reason || 'No reason provided'}</p>
                </div>
              )}

              {(document.isAcceptedByUser === false || document.isAcceptedByUser === null) && (
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

          {document.isAcceptedByUser === true && document.status !== 'completed' && (
            <div className="bg-white rounded-xl shadow p-6 border border-gray-100">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">Final Document Upload</h2>
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
                      onChange={(e) => setFinalDocument(e.target.files[0])}
                      accept=".pdf,.doc,.docx"
                    />
                  </label>
                </div>

                {finalDocument && (
                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <span className="text-sm text-gray-600">{finalDocument.name}</span>
                    <button
                      onClick={() => setFinalDocument(null)}
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
                  disabled={!finalDocument}
                  className="w-full bg-blue-600 text-white px-4 py-3 rounded-lg hover:bg-blue-700 transition-colors duration-200 font-medium disabled:opacity-50"
                >
                  Upload Final Document
                </button>
              </div>
            </div>
          )}

          {document.status === 'completed' && document.final_file_url && (
            <div className="bg-white rounded-xl shadow p-6 border border-gray-100">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">Final Document</h2>
              <a
                href={`http://localhost:8000/${document.final_file_url}`}
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
                <h3 className="text-sm font-medium text-gray-500">Category</h3>
                <p className="mt-1 text-gray-900 capitalize">{document.category}</p>
              </div>
              {document.cost && (
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Cost</h3>
                  <p className="mt-1 text-gray-900">${document.cost}</p>
                </div>
              )}
              {document.estimated_time && (
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Estimated Time</h3>
                  <p className="mt-1 text-gray-900">{document.estimated_time} hours</p>
                </div>
              )}
              {document.assigned_to && (
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Assigned To</h3>
                  <p className="mt-1 text-gray-900">{document.assigned_to}</p>
                </div>
              )}
            </div>
          </div>

          {/* Chat Section */}
          {document.status !== 'pending' && document.status !== 'cost_estimated' && (
            <div className="bg-white rounded-xl shadow p-6 border border-gray-100 h-[700px] flex flex-col">
              {/* Chat Header */}
              <div className="pb-4 border-b border-gray-200">
                <h2 className="text-xl font-semibold text-gray-900">Discussion</h2>
                <p className="text-sm text-gray-500 mt-1">{messages.length} messages</p>
              </div>
              
              {/* Messages Area */}
              <div className="flex-1 overflow-y-auto py-4 space-y-4">
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
                          {message.file && (
                            <div className="mb-2 rounded-lg overflow-hidden">
                              <img 
                                src={`http://localhost:8000/${message.file}`} 
                                alt="Attached file" 
                                className="max-w-full"
                              />
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
                <div className="relative w-24 h-24 mb-4">
                  <img 
                    src={URL.createObjectURL(selectedFile)} 
                    alt="Selected file" 
                    className="w-full h-full object-cover rounded-lg border-2 border-blue-500"
                  />
                  <button
                    onClick={() => setSelectedFile(null)}
                    className="absolute -top-2 -right-2 bg-red-500 rounded-full p-1.5 shadow-lg hover:bg-red-600 transition-colors"
                  >
                    <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
                      onChange={(e) => setSelectedFile(e.target.files[0])}
                    />
                  </div>
                  <button 
                    onClick={handleSendMessage}
                    className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl hover:from-blue-600 hover:to-blue-700 transition-all duration-200 disabled:opacity-50 shadow-sm"
                  >
                    <span>Send</span>
                    <svg className="ml-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                    </svg>
                  </button>
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
