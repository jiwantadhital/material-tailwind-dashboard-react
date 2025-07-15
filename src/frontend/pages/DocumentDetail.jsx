import React, { useState, useEffect, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { authService } from '../../services/apiService';
import { pusherService } from '../../services/pusher_init';
import { 
  FileText, 
  Download, 
  MessageCircle, 
  ArrowLeft, 
  Clock, 
  Check, 
  X, 
  Send,
  Plus,
  Paperclip,
  Loader,
  ThumbsUp,
  ThumbsDown
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
    under_review: { bgColor: 'bg-purple-100', textColor: 'text-purple-800', icon: Clock, label: 'Under Review' },
    awaiting_payment: { bgColor: 'bg-yellow-100', textColor: 'text-yellow-800', icon: Clock, label: 'Awaiting Payment' },
    needs_revision: { bgColor: 'bg-amber-100', textColor: 'text-amber-800', icon: Clock, label: 'Needs Revision' },
    document_processing: { bgColor: 'bg-blue-100', textColor: 'text-blue-800', icon: FileText, label: 'Document Processing' },
    ready_for_pickup: { bgColor: 'bg-green-100', textColor: 'text-green-800', icon: Check, label: 'Ready for Pickup' },
    on_hold: { bgColor: 'bg-gray-100', textColor: 'text-gray-800', icon: Clock, label: 'On Hold' },
  };

  // Helper function to convert status to user-friendly label
  const formatStatusLabel = (status) => {
    if (!status) return 'Unknown';
    
    return status
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ');
  };

  const config = statusConfig[status] || { 
    bgColor: 'bg-gray-100', 
    textColor: 'text-gray-800', 
    icon: Clock, 
    label: formatStatusLabel(status)
  };
  const Icon = config.icon;

  return (
    <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${config.bgColor} ${config.textColor}`}>
      <Icon className="w-4 h-4 mr-1" />
      {config.label}
    </div>
  );
};

const PaymentStatusBadge = ({ paymentStatus }) => {
  const statusConfig = {
    not_paid: { bgColor: 'bg-red-100', textColor: 'text-red-800', icon: X, label: 'Not Paid' },
    partially_paid: { bgColor: 'bg-yellow-100', textColor: 'text-yellow-800', icon: Clock, label: 'Partially Paid' },
    full_paid: { bgColor: 'bg-green-100', textColor: 'text-green-800', icon: Check, label: 'Fully Paid' },
    paid: { bgColor: 'bg-green-100', textColor: 'text-green-800', icon: Check, label: 'Paid' },
  };

  // Helper function to convert payment status to user-friendly label
  const formatPaymentStatusLabel = (status) => {
    if (!status) return 'Unknown';
    
    return status
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ');
  };

  const config = statusConfig[paymentStatus] || { 
    bgColor: 'bg-gray-100', 
    textColor: 'text-gray-800', 
    icon: Clock, 
    label: formatPaymentStatusLabel(paymentStatus)
  };
  const Icon = config.icon;

  return (
    <div className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.bgColor} ${config.textColor}`}>
      <Icon className="w-3 h-3 mr-1" />
      {config.label}
    </div>
  );
};



const DocumentDetail = () => {
  const { id } = useParams();
  const [document, setDocument] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [messages, setMessages] = useState([]);
  const [messagesLoading, setMessagesLoading] = useState(false);
  const [newMessage, setNewMessage] = useState('');
  const [attachment, setAttachment] = useState(null);
  const [sendingMessage, setSendingMessage] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');
  const [processingAction, setProcessingAction] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(true);
  const [unreadMessages, setUnreadMessages] = useState(0);
  const messagesEndRef = useRef(null);
  const [messagePagination, setMessagePagination] = useState({
    currentPage: 1,
    lastPage: 1,
    total: 0
  });
  const [showReportProblemForm, setShowReportProblemForm] = useState(false);
  const [problemReport, setProblemReport] = useState('');
  const [sendingProblemReport, setSendingProblemReport] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentLoading, setPaymentLoading] = useState(false);
  const [paymentStep, setPaymentStep] = useState('init'); // init, processing, success, error
  const [paymentError, setPaymentError] = useState('');
  const [paymentData, setPaymentData] = useState(null);
  const [availablePaymentInstruments, setAvailablePaymentInstruments] = useState([]);
  const [selectedPaymentInstrument, setSelectedPaymentInstrument] = useState(null);
  const [showPaymentSelection, setShowPaymentSelection] = useState(false);
  const [activePaymentTab, setActivePaymentTab] = useState('wallets');

  const fetchMessages = async () => {
    try {
      setMessagesLoading(true);
      console.log('current user id',authService.getCurrentUserId());
      const response = await authService.getMessages(id);
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
    } finally {
      setMessagesLoading(false);
    }
  };

  useEffect(() => {
    const fetchDocument = async () => {
      try {
        setLoading(true);
        const response = await authService.getDocumentById(id);
        
        if (response.success) {
          setDocument(response.data);
          
          // Fire-and-forget API calls (don't wait for responses)
          if (response.data.document_mark?.is_new) {
            authService.markAsRead(id)
              .then(() => console.log('Document marked as read (new update cleared)'))
              .catch(error => console.error('Error marking document as read:', error));
          }

          if (response.data.document_mark?.has_new_message_for_user) {
            authService.markAsReadForAdmin(id)
              .then(() => console.log('Messages marked as read (new message cleared)'))
              .catch(error => console.error('Error marking messages as read:', error));
          }
          
          // Fetch messages
          fetchMessages();
        } else {
          throw new Error(response.message || 'Failed to fetch document details');
        }
      } catch (err) {
        setError(err.message || 'An error occurred while fetching the document');
        console.error('Error fetching document:', err);
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchDocument();
    }
  }, [id]);

  // Check for payment status in URL parameters (when returning from payment gateway)
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const status = urlParams.get('status');
    const transactionId = urlParams.get('TransactionId');
    const processId = urlParams.get('ProcessId');
    
    if (status && transactionId && processId) {
      // Clean up URL parameters
      window.history.replaceState({}, document.title, window.location.pathname);
      
      if (status === 'success') {
        setPaymentStep('success');
        setShowPaymentModal(true);
        // Refresh document data
        setTimeout(() => {
          window.location.reload();
        }, 2000);
      } else if (status === 'failed') {
        setPaymentStep('error');
        setPaymentError('Payment failed. Please try again.');
        setShowPaymentModal(true);
      }
    }
  }, []);

  // Scroll to bottom of messages when new messages arrive
  useEffect(() => {
    if (isChatOpen && messages.length > 0) {
      scrollToBottom();
    }
  }, [messages, isChatOpen]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // Initialize Pusher and subscribe to chat channel
  useEffect(() => {
    let channel;
    
    const initializePusher = async () => {
      if (id) {
        try {
          await pusherService.initPusher();
          channel = pusherService.subscribeToChatChannel(id, (data) => {
            // Handle new message from Pusher
            setMessages(prevMessages => {
              // Check if message already exists to prevent duplicates
              if (prevMessages.some(msg => msg.id === data.id)) {
                return prevMessages;
              }
              
              // If chat is not in focus, increment unread count
              if (!isChatOpen) {
                setUnreadMessages(prev => prev + 1);
              }
              
              // Add the new message to the list
              return [...prevMessages, data].sort((a, b) => 
                new Date(a.created_at) - new Date(b.created_at)
              );
            });
          });
          
          console.log('Successfully subscribed to Pusher chat channel');
        } catch (error) {
          console.error('Error initializing Pusher:', error);
        }
      }
    };

    initializePusher();

    // Cleanup subscription when component unmounts
    return () => {
      if (id) {
        pusherService.unsubscribeFromChatChannel(id);
      }
    };
  }, [id, isChatOpen]);

  // Reset unread count when opening chat
  useEffect(() => {
    if (isChatOpen) {
      setUnreadMessages(0);
    }
  }, [isChatOpen]);

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  const formatDateOnly = (dateString) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    }).format(date);
  };

  const handleAttachmentChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      
      // File type validation
      const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg', 'image/gif', 'image/bmp', 'image/webp', 'application/pdf', 'image/heic', 'image/heif'];
      if (!allowedTypes.includes(file.type)) {
        alert('Please select a valid file type (JPEG, PNG, JPG, GIF, PDF, HEIC, HEIF)');
        return;
      }
      
      // File size validation (2MB = 2097152 bytes)
      const maxSize = 2 * 1024 * 1024; // 2MB
      if (file.size > maxSize) {
        alert('File size must be less than 2MB');
        return;
      }
      
      setAttachment(file);
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    
    if (!newMessage.trim() && !attachment) {
      return; // Don't send empty messages
    }
    
    try {
      setSendingMessage(true);
      
      const formData = new FormData();
      formData.append('document_id', id);
      formData.append('message', newMessage);
      formData.append('mobile', '');
      
      if (attachment) {
        formData.append('file', attachment); // Changed from 'attachment' to 'file'
      }
      
      const response = await authService.sendMessage(formData);
      
      if (response.success) {
        // Clear form and refresh messages
        setNewMessage('');
        setAttachment(null);
        
        // Message will be added by Pusher, but we can optimistically update UI
        const tempMessage = {
          id: Date.now().toString(), // Temporary ID until Pusher delivers real message
          document_id: id,
          user_id: authService.getCurrentUserId(),
          message: newMessage,
          file_url: attachment ? URL.createObjectURL(attachment) : null,
          created_at: new Date().toISOString(),
          user: { name: 'You' }
        };
        
        setMessages(prevMessages => [...prevMessages, tempMessage]);
      }
    } catch (error) {
      console.error('Error sending message:', error);
      alert('Failed to send message. Please try again.');
    } finally {
      setSendingMessage(false);
    }
  };

  const handleAcceptFile = async () => {
    try {
      setProcessingAction(true);
      const response = await authService.acceptRejectByUser({
        document_id: id,
        isAcceptedByUser: true
      });
      
      if (response.success) {
        // Send a message about acceptance
        const messageData = new FormData();
        messageData.append('document_id', id);
        messageData.append('message', 'I have accepted the reviewed document.');
        await authService.sendMessage(messageData);
        
        // Reload the page to reflect all changes
        window.location.reload();
      } else {
        throw new Error(response.message || 'Failed to accept the document');
      }
    } catch (err) {
      console.error('Error accepting document:', err);
      alert('Failed to accept the document. Please try again.');
    } finally {
      setProcessingAction(false);
    }
  };

  const handleRejectFile = async () => {
    if (!rejectionReason.trim()) {
      alert('Please provide a reason for rejection');
      return;
    }
    
    try {
      setProcessingAction(true);
      const response = await authService.acceptRejectByUser(
        {
          document_id: id,
          isAcceptedByUser: false,
          rejected_reason: rejectionReason
        }
      );
      
      if (response.success) {
        // Send a message about rejection with reason
        const messageData = new FormData();
        messageData.append('document_id', id);
        messageData.append('message', `I have rejected the reviewed document. Reason: ${rejectionReason}`);
        await authService.sendMessage(messageData);
        
        // Reload the page to reflect all changes
        window.location.reload();
      } else {
        throw new Error(response.message || 'Failed to reject the document');
      }
    } catch (err) {
      console.error('Error rejecting document:', err);
      alert('Failed to reject the document. Please try again.');
    } finally {
      setProcessingAction(false);
    }
  };

  const handleSubmitProblem = async (e) => {
    e.preventDefault();
    
    if (!problemReport.trim()) {
      alert('Please provide a description of the problem');
      return;
    }
    
    try {
      setSendingProblemReport(true);
      const response = await authService.reportProblem({
        document_id: id,
        problem_description: problemReport
      });
      
      if (response.success) {
        // Reset form and show success message
        setProblemReport('');
        alert('Problem reported successfully');
      } else {
        throw new Error(response.message || 'Failed to report the problem');
      }
    } catch (error) {
      console.error('Error reporting problem:', error);
      alert('Failed to report the problem. Please try again.');
    } finally {
      setSendingProblemReport(false);
    }
  };

  const handleInitiatePayment = async (amount, paymentType = 'initial') => {
    try {
      setPaymentLoading(true);
      setPaymentStep('processing');
      setPaymentError('');
      setShowPaymentModal(true);

      // Configuration based on the provided credentials
      const MERCHANT_ID = '7530';
      const MERCHANT_NAME = 'dbridge';

      // Step 1: Get Payment Instrument Details
      console.log('Step 1: Getting payment instrument details...');
      const merchantData = {
        MerchantId: MERCHANT_ID,
        MerchantName: MERCHANT_NAME,
      };

      const instrumentResponse = await authService.getPaymentInstrumentDetails(merchantData);
      
      if (!instrumentResponse.success) {
        throw new Error(instrumentResponse.message || 'Failed to get payment instruments');
      }

      console.log('Available payment instruments:', instrumentResponse.data);

      // Parse the available payment instruments
      if (instrumentResponse.data && instrumentResponse.data.data) {
        setAvailablePaymentInstruments(instrumentResponse.data.data);
        setPaymentStep('selectPayment');
        setPaymentData({ amount, paymentType, documentId: document.id });
        setShowPaymentSelection(true);
      } else {
        throw new Error('No payment instruments available');
      }

    } catch (error) {
      console.error('Payment initiation error:', error);
      const errorMessage = typeof error === 'string' ? error : error.message || 'Failed to get payment instruments';
      setPaymentError(errorMessage);
      setPaymentStep('error');
    } finally {
      setPaymentLoading(false);
    }
  };

  const handlePaymentInstrumentSelected = async (instrument) => {
    try {
      setSelectedPaymentInstrument(instrument);
      setPaymentLoading(true);
      setPaymentStep('processing');
      setShowPaymentSelection(false);

      const MERCHANT_ID = '7530';
      const MERCHANT_NAME = 'dbridge';
      const { amount, paymentType } = paymentData;

      console.log('Selected payment instrument:', instrument);

      // Step 2: Get Service Charge
      console.log('Step 2: Getting service charge...');
      const serviceChargeData = {
        MerchantId: MERCHANT_ID,
        MerchantName: MERCHANT_NAME,
        Amount: amount.toString(),
        InstrumentCode: instrument.InstrumentCode || instrument.instrumentCode,
      };

      const serviceChargeResponse = await authService.getServiceCharge(serviceChargeData);
      
      if (!serviceChargeResponse.success) {
        throw new Error(serviceChargeResponse.message || 'Failed to get service charge');
      }

      console.log('Service charge response:', serviceChargeResponse);

      // Step 3: Get Process ID
      console.log('Step 3: Getting process ID...');
      const merchantTxnId = `TXN_${Date.now()}_${document.id}`;
      const processIdData = {
        MerchantId: MERCHANT_ID,
        MerchantName: MERCHANT_NAME,
        Amount: amount.toString(),
        MerchantTxnId: merchantTxnId,
      };

      const processIdResponse = await authService.getProcessId(processIdData);
      
      if (!processIdResponse.success) {
        throw new Error(processIdResponse.message || 'Failed to get process ID');
      }

      console.log('Full Process ID Response:', processIdResponse);
      console.log('Process ID Response Data:', processIdResponse.data);

      // Check the nested data structure for ProcessId
      let processId = null;
      
      // Try different possible locations for ProcessId
      if (processIdResponse.data?.data?.ProcessId) {
        processId = processIdResponse.data.data.ProcessId;
      } else if (processIdResponse.data?.data?.processId) {
        processId = processIdResponse.data.data.processId;
      } else if (processIdResponse.data?.data?.process_id) {
        processId = processIdResponse.data.data.process_id;
      } else if (processIdResponse.data?.ProcessId) {
        processId = processIdResponse.data.ProcessId;
      } else if (processIdResponse.data?.processId) {
        processId = processIdResponse.data.processId;
      } else if (processIdResponse.data?.process_id) {
        processId = processIdResponse.data.process_id;
      }

      console.log('Extracted ProcessId:', processId);
      console.log('Nested data structure:', processIdResponse.data?.data);
      
      if (!processId) {
        const availableFields = Object.keys(processIdResponse.data || {});
        const nestedFields = processIdResponse.data?.data ? Object.keys(processIdResponse.data.data) : [];
        throw new Error(`Process ID not found in response. Top-level fields: ${availableFields.join(', ')}. Nested data fields: ${nestedFields.join(', ')}`);
      }

      setPaymentData(prev => ({
        ...prev,
        processId: processId,
        merchantTxnId: merchantTxnId,
        selectedInstrument: instrument
      }));

      console.log('Payment data updated:', {
        processId: processId,
        merchantTxnId: merchantTxnId,
        amount: amount,
        paymentType: paymentType,
        instrument: instrument
      });

      // Step 4: Redirect to OnePG Gateway using form POST
      console.log('Step 4: Redirecting to OnePG Gateway...');
      redirectToOnePGGateway({
        merchantId: MERCHANT_ID,
        merchantName: MERCHANT_NAME,
        merchantTxnId: merchantTxnId,
        amount: amount.toString(),
        processId: processId,
        instrumentCode: instrument.InstrumentCode || instrument.instrumentCode,
        documentId: document.id
      });

    } catch (error) {
      console.error('Payment processing error:', error);
      const errorMessage = typeof error === 'string' ? error : error.message || 'Failed to process payment';
      setPaymentError(errorMessage);
      setPaymentStep('error');
      setShowPaymentSelection(false);
    } finally {
      setPaymentLoading(false);
    }
  };

  const handleCheckPaymentStatus = async (processId, merchantTxnId) => {
    try {
      console.log('Checking payment status...', { processId, merchantTxnId });
      
      const statusData = {
        MerchantId: '7530',
        MerchantName: 'dbridge',
        ProcessId: processId,
        MerchantTxnId: merchantTxnId,
      };

      const statusResponse = await authService.checkTransactionStatus(statusData);
      
      console.log('Payment status response:', statusResponse);
      
      if (statusResponse.success && statusResponse.data.Status === 'SUCCESS') {
        setPaymentStep('success');
        
        // Update document payment status on backend
        try {
          const paymentUpdateData = {
            merchant_txn_id: merchantTxnId,
            process_id: processId,
            payment_status: 'paid',
            amount: paymentData.amount,
            payment_type: paymentData.paymentType
          };
          
          await authService.processDocumentPayment(document.id, paymentUpdateData);
        } catch (updateError) {
          console.error('Failed to update payment status:', updateError);
        }
        
        // Refresh document data after a short delay
        setTimeout(() => {
          window.location.reload();
        }, 2000);
      } else {
        const errorMsg = statusResponse.data?.Message || 'Payment verification failed';
        setPaymentError(errorMsg);
        setPaymentStep('error');
      }
    } catch (error) {
      console.error('Payment status check error:', error);
      const errorMessage = typeof error === 'string' ? error : error.message || 'Failed to verify payment status';
      setPaymentError(errorMessage);
      setPaymentStep('error');
    }
  };

  const handlePayInitial20Percent = () => {
    const amount = parseFloat(document.payment.total_payment_amount) * 0.2;
    handleInitiatePayment(amount, 'initial');
  };

  const handlePayRemaining = () => {
    const amount = parseFloat(document.payment.remaining_payment_amount);
    handleInitiatePayment(amount, 'final');
  };

  const redirectToOnePGGateway = (paymentParams) => {
    try {
      console.log('Creating OnePG payment form with params:', paymentParams);
      
      // Check if we're in browser environment
      if (typeof window === 'undefined' || typeof document === 'undefined') {
        throw new Error('Not in browser environment');
      }

      console.log('Document object available:', typeof document);
      console.log('Document createElement available:', typeof document.createElement);
      
      // Create form element
      const form = window.document.createElement('form');
      form.method = 'POST';
      form.action = 'https://gatewaysandbox.nepalpayment.com/Payment/Index';
      form.style.display = 'none';
      form.target = '_self';

      // Add form fields
      const fields = {
        MerchantId: paymentParams.merchantId,
        MerchantName: paymentParams.merchantName,
        MerchantTxnId: paymentParams.merchantTxnId,
        Amount: paymentParams.amount,
        ProcessId: paymentParams.processId,
        InstrumentCode: paymentParams.instrumentCode || '',
        TransactionRemarks: `Document payment for Doc ID: ${paymentParams.documentId}`,
        ResponseUrl: `${window.location.origin}/api/payment-response?docId=${paymentParams.documentId}`
      };

      console.log('Form fields to be added:', fields);

      Object.keys(fields).forEach(key => {
        const input = window.document.createElement('input');
        input.type = 'hidden';
        input.name = key;
        input.value = fields[key];
        form.appendChild(input);
        console.log(`Added field: ${key} = ${fields[key]}`);
      });

      // Add form to page
      window.document.body.appendChild(form);
      console.log('Form added to document body');
      
      console.log('Submitting OnePG payment form...');
      form.submit();
      
      // Clean up - remove form after submission
      setTimeout(() => {
        try {
          if (form.parentNode) {
            window.document.body.removeChild(form);
            console.log('Form cleaned up successfully');
          }
        } catch (cleanupError) {
          console.log('Form cleanup error (not critical):', cleanupError);
        }
      }, 2000);

    } catch (error) {
      console.error('Error creating OnePG payment form:', error);
      console.error('Error stack:', error.stack);
      
      // Fallback: try a different approach using innerHTML
      try {
        console.log('Trying fallback approach with innerHTML...');
        redirectToOnePGGatewayFallback(paymentParams);
      } catch (fallbackError) {
        console.error('Fallback approach also failed:', fallbackError);
        throw new Error(`Failed to redirect to payment gateway. Original error: ${error.message}`);
      }
    }
  };

  const redirectToOnePGGatewayFallback = (paymentParams) => {
    // Fallback method using innerHTML
    console.log('Using fallback method to create payment form');
    
    const formHtml = `
      <form id="onepg-payment-form" method="POST" action="https://gatewaysandbox.nepalpayment.com/Payment/Index" style="display: none;">
        <input type="hidden" name="MerchantId" value="${paymentParams.merchantId}" />
        <input type="hidden" name="MerchantName" value="${paymentParams.merchantName}" />
        <input type="hidden" name="MerchantTxnId" value="${paymentParams.merchantTxnId}" />
        <input type="hidden" name="Amount" value="${paymentParams.amount}" />
        <input type="hidden" name="ProcessId" value="${paymentParams.processId}" />
        <input type="hidden" name="InstrumentCode" value="${paymentParams.instrumentCode || ''}" />
        <input type="hidden" name="TransactionRemarks" value="Document payment for Doc ID: ${paymentParams.documentId}" />
        <input type="hidden" name="ResponseUrl" value="${window.location.origin}/api/payment-response?docId=${paymentParams.documentId}" />
      </form>
    `;

    // Create a temporary container
    const tempDiv = window.document.createElement('div');
    tempDiv.innerHTML = formHtml;
    const form = tempDiv.querySelector('#onepg-payment-form');
    
    // Add to body and submit
    window.document.body.appendChild(form);
    console.log('Fallback form added and submitting...');
    form.submit();
    
    // Cleanup
    setTimeout(() => {
      try {
        if (form.parentNode) {
          window.document.body.removeChild(form);
        }
      } catch (e) {
        console.log('Fallback cleanup error (not critical):', e);
      }
    }, 2000);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (error || !document) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center">
        <div className="text-red-500 text-5xl mb-4">⚠️</div>
        <h1 className="text-2xl font-bold text-gray-800 mb-2">Error</h1>
        <p className="text-gray-600">{error || 'Document not found'}</p>
        <Link to="/documents" className="mt-6 text-blue-600 hover:text-blue-800 underline">Return to documents</Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-100">
      {/* Navigation */}
      <nav className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <Link to="/documents" className="flex items-center text-blue-600 hover:text-blue-800">
                <ArrowLeft className="w-5 h-5 mr-1" />
                Back to Documents
              </Link>
            </div>
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Link 
                  to="/"
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Home
                </Link>
              </div>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          {/* Document Header */}
          <div className="p-6 border-b border-gray-200">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">{document.title}</h1>
                <p className="mt-1 text-sm text-gray-500">
                  Submitted on {formatDate(document.created_at)}
                </p>
              </div>
              <div className="mt-4 md:mt-0 flex flex-wrap gap-2">
                <DocumentStatusBadge status={document.status} />
                
                <PaymentStatusBadge paymentStatus={document.payment?.payment_status} />
              </div>
            </div>
          </div>
          
          {/* Document Content */}
          <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-6 min-h-[800px]">
            {/* Left Column - Details */}
            <div className="md:col-span-2 space-y-6">
              <div>
                <h2 className="text-lg font-medium text-gray-900 mb-2">Document Details</h2>
                <div className="bg-gray-50 rounded-lg p-4">
                  <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-4">
                    <div>
                      <dt className="text-sm font-medium text-gray-500">Country</dt>
                      <dd className="mt-1 text-sm text-gray-900">{document.country?.name || 'N/A'}</dd>
                    </div>
                    <div>
                      <dt className="text-sm font-medium text-gray-500">Status</dt>
                      <dd className="mt-1 text-sm text-gray-900">
                        <DocumentStatusBadge status={document.status} />
                      </dd>
                    </div>
                    {document.estimated_time && (
                      <div>
                        <dt className="text-sm font-medium text-gray-500">Estimated Completion</dt>
                        <dd className="mt-1 text-sm text-gray-900">{formatDateOnly(document.estimated_time)}</dd>
                      </div>
                    )}
                    {document.completed_at && (
                      <div>
                        <dt className="text-sm font-medium text-gray-500">Completed Date</dt>
                        <dd className="mt-1 text-sm text-gray-900">{formatDate(document.completed_at)}</dd>
                      </div>
                    )}
                  </dl>
                </div>
              </div>
              
              {/* Payment Information */}
              {document.payment && (
                <div>
                  <h2 className="text-lg font-medium text-gray-900 mb-2">Payment Information</h2>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-4">
                      <div>
                        <dt className="text-sm font-medium text-gray-500">Payment Status</dt>
                        <dd className="mt-1 text-sm">
                          <PaymentStatusBadge paymentStatus={document.payment.payment_status} />
                        </dd>
                      </div>
                      <div>
                        <dt className="text-sm font-medium text-gray-500">Total Amount</dt>
                        <dd className="mt-1 text-sm text-gray-900">
                          Rs{parseFloat(document.payment.total_payment_amount || 0).toFixed(2)}
                        </dd>
                      </div>
                      <div>
                        <dt className="text-sm font-medium text-gray-500">Amount Paid</dt>
                        <dd className="mt-1 text-sm text-gray-900">
                          Rs{parseFloat(document.payment.partial_payment_amount || 0).toFixed(2)}
                        </dd>
                      </div>
                      <div>
                        <dt className="text-sm font-medium text-gray-500">Remaining Amount</dt>
                        <dd className={`mt-1 text-sm font-medium ${
                          parseFloat(document.payment.total_amount || 0) - parseFloat(document.payment.paid_amount || 0) > 0 
                            ? 'text-red-600' 
                            : 'text-green-600'
                        }`}>
                          Rs{(parseFloat(document.payment.remaining_payment_amount)).toFixed(2)}
                        </dd>
                      </div>
                      {document.payment.payment_date && (
                        <div>
                          <dt className="text-sm font-medium text-gray-500">Payment Date</dt>
                          <dd className="mt-1 text-sm text-gray-900">
                            {formatDate(document.payment.payment_date)}
                          </dd>
                        </div>
                      )}
                      {document.payment.payment_method && (
                        <div>
                          <dt className="text-sm font-medium text-gray-500">Payment Method</dt>
                          <dd className="mt-1 text-sm text-gray-900">
                            {document.payment.payment_method}
                          </dd>
                        </div>
                      )}
                    </dl>
                    
                    {/* Add payment prompt for cost_estimated status */}
                    {document.status === 'cost_estimated' && document.payment.payment_status !== 'paid' && (
                      <div className="mt-4 p-3 bg-blue-50 border border-blue-100 rounded-md">
                        <p className="text-sm text-blue-800 mb-3">
                          <strong>Initial Payment Required:</strong> Please pay 20% of the total amount (Rs{(parseFloat(document.payment.total_payment_amount) * 0.2).toFixed(2)}) to proceed with document processing and receive your recheck file.
                        </p>
                        <button 
                          onClick={handlePayInitial20Percent}
                          disabled={paymentLoading}
                          className="inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {paymentLoading ? (
                            <>
                              <Loader className="h-4 w-4 mr-1 animate-spin" />
                              Processing...
                            </>
                          ) : (
                            `Pay Initial 20% - Rs${(parseFloat(document.payment.total_payment_amount) * 0.2).toFixed(2)}`
                          )}
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              )}
              
              <div>
                <h2 className="text-lg font-medium text-gray-900 mb-2">Description</h2>
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-sm text-gray-900">{document.description}</p>
                </div>
              </div>
              
              {/* Document Files */}
              <div>
                <h2 className="text-lg font-medium text-gray-900 mb-2">Files</h2>
                <div className="space-y-3">
                  {document.file_url && (
                    <div className="flex items-center justify-between bg-gray-50 rounded-lg p-3">
                      <div className="flex items-center">
                        <FileText className="h-5 w-5 text-blue-500 mr-2" />
                        <span className="text-sm text-gray-900">Original Document</span>
                      </div>
                      <a 
                        href={`${document.file_url_full}`}
                        target="_blank"
                        rel="noopener noreferrer" 
                        className="inline-flex items-center px-3 py-1 border border-transparent text-xs font-medium rounded shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                      >
                        <Download className="h-4 w-4 mr-1" />
                        Download
                      </a>
                    </div>
                  )}
                  
                  {document.recheck_file_url && (
                    <div className="flex flex-col bg-gray-50 rounded-lg p-3">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center">
                          <FileText className="h-5 w-5 text-green-500 mr-2" />
                          <span className="text-sm text-gray-900">Review Document</span>
                        </div>
                        {(document.status !== 'cost_estimated' || (document.payment && document.payment.partial_payment_amount > 0)) ? (
                          <a 
                            href={`${document.recheck_file_url_full}`}
                            target="_blank"
                            rel="noopener noreferrer" 
                            className="inline-flex items-center px-3 py-1 border border-transparent text-xs font-medium rounded shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                          >
                            <Download className="h-4 w-4 mr-1" />
                            Download
                          </a>
                        ) : (
                          <button
                            disabled
                            className="inline-flex items-center px-3 py-1 border border-transparent text-xs font-medium rounded shadow-sm text-white bg-gray-400 cursor-not-allowed"
                            title="Payment required to download"
                          >
                            <Download className="h-4 w-4 mr-1" />
                            Pay to Unlock
                          </button>
                        )}
                      </div>
                      
                      {document.recheck_file_url !== null && document.isAcceptedByUser === null && (
                        <div className="flex items-center space-x-2 pt-2 border-t border-gray-200">
                          <button 
                            onClick={handleAcceptFile}
                            disabled={processingAction}
                            className="inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            {processingAction ? (
                              <Loader className="h-4 w-4 mr-1 animate-spin" />
                            ) : (
                              <ThumbsUp className="h-4 w-4 mr-1" />
                            )}
                            Accept
                          </button>
                          <button 
                            onClick={() => setShowRejectModal(true)}
                            disabled={processingAction}
                            className="inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            <ThumbsDown className="h-4 w-4 mr-1" />
                            Reject
                          </button>
                        </div>
                      )}
                      
                      {document.recheck_file_url !== null && document.isAcceptedByUser === true && document.payment?.remaining_payment_amount > 0 && (
                        <div className="mt-3 p-3 bg-blue-50 border border-blue-100 rounded-md">
                          <p className="text-sm text-blue-800 mb-3">
                            You have accepted the recheck file, now please pay the final payment and your document will be available.
                          </p>
                          <button 
                            onClick={handlePayRemaining}
                            disabled={paymentLoading}
                            className="inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            {paymentLoading ? (
                              <>
                                <Loader className="h-4 w-4 mr-1 animate-spin" />
                                Processing...
                              </>
                            ) : (
                              `Pay Now - Rs${parseFloat(document.payment.remaining_payment_amount).toFixed(2)}`
                            )}
                          </button>
                        </div>
                      )}
                      {document.recheck_file_url !== null && document.isAcceptedByUser === false && (
                        <div className="mt-3 p-3 bg-orange-50 border border-orange-100 rounded-md">
                          <p className="text-sm text-orange-800 mb-2">
                            You have rejected the recheck file. Reason: {document.rejection_reason}
                          </p>
                          <p className="text-sm text-orange-700 font-medium">
                            Please wait for another recheck file from our team.
                          </p>
                        </div>
                      )}
                    </div>
                  )}
                  
                  {document.final_file_zip_url_full && (
                    <div className="flex items-center justify-between bg-gray-50 rounded-lg p-3">
                      <div className="flex items-center">
                        <FileText className="h-5 w-5 text-purple-500 mr-2" />
                        <span className="text-sm text-gray-900">Final Document</span>
                      </div>
                      <a 
                        href={`${document.final_file_zip_url_full}`}
                        target="_blank"
                        rel="noopener noreferrer" 
                        className="inline-flex items-center px-3 py-1 border border-transparent text-xs font-medium rounded shadow-sm text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
                      >
                        <Download className="h-4 w-4 mr-1" />
                        Download
                      </a>
                    </div>
                  )}

                  {/* Report Problem section for final document */}
                  {document.final_file_zip_url && (
                    <div className="mt-3">
                      <button 
                        onClick={() => setShowReportProblemForm(!showReportProblemForm)}
                        className="inline-flex items-center px-3 py-2 text-sm font-medium text-red-600 hover:text-red-800 focus:outline-none"
                      >
                        <MessageCircle className="h-4 w-4 mr-1" />
                        {showReportProblemForm ? 'Cancel Report' : 'Report any Problem'}
                      </button>
                      
                      {showReportProblemForm && (
                        <div className="mt-2 p-4 bg-red-50 rounded-lg border border-red-100">
                          <h3 className="text-sm font-medium text-red-800 mb-2">Report a Problem with the Final Document</h3>
                          <textarea
                            value={problemReport}
                            onChange={(e) => setProblemReport(e.target.value)}
                            placeholder="Please describe the issue you're experiencing with the final document..."
                            className="w-full px-3 py-2 text-sm border border-red-200 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 mb-3"
                            rows="3"
                          ></textarea>
                          <button
                            onClick={handleSubmitProblem}
                            disabled={!problemReport.trim() || sendingProblemReport}
                            className="inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            {sendingProblemReport ? (
                              <Loader className="h-4 w-4 mr-1 animate-spin" />
                            ) : (
                              <Send className="h-4 w-4 mr-1" />
                            )}
                            Submit Report
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
            
            {/* Right Column - Communication */}
            <div className="md:col-span-1">
              {(document.status === 'in_progress' || document.status === 'completed') ? (
                <div className="bg-gray-50 rounded-lg overflow-hidden shadow-sm h-full flex flex-col">
                  <div 
                    className="bg-gradient-to-r from-blue-500 to-blue-600 text-white p-4 flex justify-between items-center cursor-pointer shadow-sm"
                    onClick={() => {
                      setIsChatOpen(!isChatOpen);
                      setUnreadMessages(0);
                    }}
                  >
                    <h2 className="text-lg font-medium flex items-center">
                      <MessageCircle className="h-5 w-5 mr-2" />
                      Messages
                      {unreadMessages > 0 && (
                        <span className="ml-2 px-2 py-0.5 bg-white text-blue-600 text-xs font-semibold rounded-full shadow-sm">
                          {unreadMessages}
                        </span>
                      )}
                    </h2>
                    <button className="text-white/80 hover:text-white transition-colors p-1 rounded-full hover:bg-blue-700">
                      <svg 
                        className={`w-5 h-5 transform transition-transform ${isChatOpen ? 'rotate-180' : ''}`}
                        fill="none" 
                        stroke="currentColor" 
                        viewBox="0 0 24 24"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>
                  </div>
                  
                  {/* Messages List with transition */}
                  <div className={`transition-all duration-300 ease-in-out ${
                    isChatOpen ? 'max-h-[600px] opacity-100' : 'max-h-0 opacity-0 overflow-hidden'
                  }`}>
                    <div className="flex-grow overflow-y-auto p-4 space-y-6 max-h-[600px] bg-gradient-to-b from-gray-50 to-white">
                      {messagesLoading ? (
                        <div className="flex justify-center py-4">
                          <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                        </div>
                      ) : (!messages || !Array.isArray(messages) || messages.length === 0) ? (
                        <div className="text-center py-8 text-gray-500">
                          <MessageCircle className="h-10 w-10 mx-auto text-gray-400 mb-3" />
                          <p className="font-medium">No messages yet</p>
                          <p className="text-xs mt-1">Start the conversation!</p>
                        </div>
                      ) : (
                        messages.map((message, index) => {
                          const isUserMessage = message.user_id?.toString() === authService.getCurrentUserId()?.toString();
                          const showAvatar = index === 0 || 
                            messages[index-1]?.user_id?.toString() !== message.user_id?.toString();
                          
                          return (
                            <div key={message.id} className="space-y-1">
                              <div 
                                className={`flex ${isUserMessage ? 'justify-end' : 'justify-start'}`}
                              >
                                {!isUserMessage && showAvatar && (
                                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-r from-blue-500 to-blue-600 flex items-center justify-center mr-2 shadow-sm">
                                    <span className="text-sm font-medium text-white">A</span>
                                  </div>
                                )}
                                
                                {!isUserMessage && !showAvatar && (
                                  <div className="w-8 mr-2"></div>
                                )}
                                
                                <div 
                                  className={`rounded-2xl px-4 py-2.5 max-w-[85%] shadow-sm ${
                                    isUserMessage 
                                      ? 'bg-blue-600 text-white rounded-tr-none' 
                                      : 'bg-white border border-gray-200 text-gray-900 rounded-tl-none'
                                  }`}
                                >
                                  {showAvatar && (
                                    <div className="text-xs font-semibold mb-1">
                                      {isUserMessage ? 'You' : message.user?.name || 'Admin'}
                                    </div>
                                  )}
                                  <div className="text-sm mb-1 break-words">{message.message}</div>
                                  {message.file_url && (
                                    <div className="mt-2">
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
                                                  ? 'bg-blue-700 text-blue-100 hover:bg-blue-800' 
                                                  : 'bg-gray-100 text-blue-600 hover:bg-gray-200'
                                              }`}
                                            >
                                              <Paperclip className="h-4 w-4 mr-2" />
                                              {fileName}
                                            </a>
                                            
                                            {/* Show image preview if it's an image */}
                                            {isImage && (
                                              <div className="mt-2 rounded-lg overflow-hidden">
                                                <img 
                                                  src={message.file_url} 
                                                  alt={fileName}
                                                  className="max-w-full max-h-48 object-cover cursor-pointer rounded-lg"
                                                  onClick={() => window.open(message.file_url, '_blank')}
                                                />
                                              </div>
                                            )}
                                          </div>
                                        );
                                      })()}
                                    </div>
                                  )}
                                  <div className={`text-xs mt-1 ${isUserMessage ? 'text-blue-200' : 'text-gray-500'}`}>
                                    {formatDate(message.created_at)}
                                  </div>
                                </div>
                                
                                {isUserMessage && showAvatar && (
                                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-r from-blue-600 to-blue-700 flex items-center justify-center ml-2 shadow-sm">
                                    <span className="text-sm font-medium text-white">U</span>
                                  </div>
                                )}
                                
                                {isUserMessage && !showAvatar && (
                                  <div className="w-8 ml-2"></div>
                                )}
                              </div>
                            </div>
                          );
                        })
                      )}
                      <div ref={messagesEndRef} /> {/* Empty div for scrolling to bottom */}
                    </div>
                  </div>
                  
                  {/* Message Input */}
                  <div className={`p-4 border-t border-gray-200 bg-white ${!isChatOpen && 'hidden'}`}>
                    <form onSubmit={handleSendMessage} className="space-y-3">
                      {/* File Preview */}
                      {attachment && (
                        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200">
                          <div className="flex items-center space-x-3">
                            {attachment.type.startsWith('image/') ? (
                              <img 
                                src={URL.createObjectURL(attachment)} 
                                alt="Preview" 
                                className="w-12 h-12 object-cover rounded-lg border border-gray-300"
                              />
                            ) : (
                              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                                <FileText className="h-6 w-6 text-blue-600" />
                              </div>
                            )}
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-gray-900 truncate">{attachment.name}</p>
                              <p className="text-xs text-gray-500">
                                {(attachment.size / 1024 / 1024).toFixed(2)} MB
                              </p>
                            </div>
                          </div>
                          <button 
                            type="button"
                            onClick={() => setAttachment(null)}
                            className="p-1 text-gray-400 hover:text-red-500 transition-colors"
                          >
                            <X className="h-5 w-5" />
                          </button>
                        </div>
                      )}
                      
                      <div className="relative">
                        <textarea
                          value={newMessage}
                          onChange={(e) => setNewMessage(e.target.value)}
                          placeholder="Type your message..."
                          className="w-full px-4 py-3 text-sm border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 pr-12 resize-none"
                          rows="2"
                          style={{ maxHeight: '120px' }}
                          onInput={(e) => {
                            e.target.style.height = 'auto';
                            e.target.style.height = Math.min(e.target.scrollHeight, 120) + 'px';
                          }}
                        />
                        <button
                          type="submit"
                          disabled={sendingMessage || (!newMessage.trim() && !attachment)}
                          className="absolute right-2 bottom-2 inline-flex items-center justify-center w-8 h-8 rounded-full shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {sendingMessage ? (
                            <Loader className="h-4 w-4 animate-spin" />
                          ) : (
                            <Send className="h-4 w-4" />
                          )}
                        </button>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div className="relative">
                          <input 
                            type="file" 
                            id="attachment" 
                            onChange={handleAttachmentChange}
                            accept=".jpg,.jpeg,.png,.gif,.pdf,.heic,.heif"
                            className="hidden" 
                          />
                          <label 
                            htmlFor="attachment" 
                            className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 cursor-pointer transition-colors"
                          >
                            <Paperclip className="h-4 w-4 mr-2" />
                            Attach File
                          </label>
                          <p className="text-xs text-gray-500 mt-1">
                            Max 2MB • Images, PDF, HEIC, HEIF
                          </p>
                        </div>
                        
                        {sendingMessage && (
                          <div className="flex items-center text-sm text-gray-500">
                            <Loader className="h-4 w-4 mr-2 animate-spin" />
                            Sending...
                          </div>
                        )}
                      </div>
                    </form>
                  </div>
                </div>
              ) : (
                <div className="bg-gray-50 rounded-lg overflow-hidden shadow-sm h-full flex flex-col">
                  <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white p-4 flex justify-between items-center shadow-sm">
                    <h2 className="text-lg font-medium flex items-center">
                      <MessageCircle className="h-5 w-5 mr-2" />
                      Messages
                    </h2>
                  </div>
                  <div className="p-8 text-center flex-1 flex flex-col items-center justify-center">
                    <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                      <MessageCircle className="h-8 w-8 text-blue-500" />
                    </div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">Chat Unavailable</h3>
                    <p className="text-sm text-gray-500 max-w-xs">
                      Communication will be available once your document status changes to "In Progress".
                    </p>
                    <div className="mt-6 px-4 py-2 bg-blue-50 rounded-lg text-xs text-blue-700 inline-flex items-center">
                      <Clock className="w-4 h-4 mr-1.5" />
                      We'll notify you when chat is ready
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      
      {/* Rejection Modal */}
      {showRejectModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Reject Document</h3>
            <p className="text-sm text-gray-500 mb-4">
              Please provide a reason for rejecting this document:
            </p>
            <textarea 
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              placeholder="Enter your reason for rejection..."
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 mb-4"
              rows="4"
            ></textarea>
            <div className="flex justify-end space-x-2">
              <button
                onClick={() => {
                  setShowRejectModal(false);
                  setRejectionReason('');
                }}
                className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Cancel
              </button>
              <button
                onClick={handleRejectFile}
                disabled={!rejectionReason.trim() || processingAction}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {processingAction ? (
                  <>
                    <Loader className="h-4 w-4 mr-1 animate-spin" />
                    Processing...
                  </>
                ) : (
                  "Submit Rejection"
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Payment Modal */}
      {showPaymentModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl mx-4 max-h-[90vh] overflow-hidden flex flex-col">
            <div className="text-center">
              {paymentStep === 'processing' && (
                <>
                  <div className="w-16 h-16 mx-auto mb-4 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Processing Payment</h3>
                  <p className="text-sm text-gray-500">
                    Please wait while we set up your payment...
                  </p>
                </>
              )}

              {paymentStep === 'selectPayment' && (
                <>
                  <h3 className="text-xl font-medium text-gray-900 mb-4">Select Payment Method</h3>
                  <p className="text-sm text-gray-500 mb-4">
                    Choose your preferred payment method from the options below:
                  </p>
                  
                  {/* Payment method counter */}
                  <div className="flex items-center justify-between mb-4 px-2">
                    <span className="text-sm font-medium text-gray-700">
                      {availablePaymentInstruments.length} payment methods available
                    </span>
                    {availablePaymentInstruments.length > 6 && (
                      <span className="text-xs text-blue-600 flex items-center">
                        <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                        </svg>
                        Scroll to see all
                      </span>
                    )}
                  </div>
                  
                  {/* 2-column grid layout with scroll indicators - reduced height */}
                  <div className="relative flex-1 min-h-0">
                    <div className="max-h-[45vh] overflow-y-auto border rounded-lg p-4 bg-gray-50 scroll-smooth" id="payment-methods-container">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {availablePaymentInstruments.map((instrument, index) => (
                          <button
                            key={index}
                            onClick={() => handlePaymentInstrumentSelected(instrument)}
                            disabled={paymentLoading}
                            className="w-full p-4 text-left border border-gray-200 rounded-lg hover:border-blue-500 hover:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors bg-white shadow-sm"
                          >
                            <div className="flex items-center space-x-3">
                              {/* Logo */}
                              <div className="flex-shrink-0 w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center overflow-hidden">
                                {instrument.LogoUrl && instrument.LogoUrl !== 'https://apisandbox.nepalpayment.com/UploadedImages/PaymentInstitution/' ? (
                                  <img 
                                    src={instrument.LogoUrl} 
                                    alt={instrument.InstrumentName}
                                    className="w-full h-full object-contain"
                                  />
                                ) : (
                                  <div className="text-sm text-gray-500 font-medium text-center">
                                    {instrument.InstrumentName?.charAt(0) || 'P'}
                                  </div>
                                )}
                              </div>
                              
                              {/* Payment method info */}
                              <div className="flex-1 min-w-0">
                                <p className="font-semibold text-gray-900 text-sm truncate">
                                  {instrument.InstrumentName}
                                </p>
                                <p className="text-xs text-blue-600 font-mono">
                                  {instrument.InstrumentCode}
                                </p>
                                <p className="text-xs text-gray-500 mt-1">
                                  {instrument.BankType}
                                </p>
                              </div>
                              
                              {/* Arrow */}
                              <div className="flex-shrink-0">
                                <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                                </svg>
                              </div>
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>
                    
                    {/* Fade gradient at bottom to indicate scrollable content */}
                    {availablePaymentInstruments.length > 6 && (
                      <div className="absolute bottom-0 left-0 right-0 h-8 bg-gradient-to-t from-white via-white/80 to-transparent pointer-events-none rounded-b-lg"></div>
                    )}
                  </div>
                  
                  {/* Scroll hint for many payment methods - moved above button */}
                  {availablePaymentInstruments.length > 8 && (
                    <div className="text-center mt-3 mb-4">
                      <p className="text-xs text-gray-500">
                        💡 Tip: Use mouse wheel or scroll bar to see all {availablePaymentInstruments.length} payment options
                      </p>
                    </div>
                  )}
                  
                  {/* Fixed cancel button area */}
                  <div className="text-center mt-4 flex-shrink-0">
                    <button
                      onClick={() => {
                        setShowPaymentModal(false);
                        setPaymentStep('init');
                        setShowPaymentSelection(false);
                      }}
                      className="inline-flex items-center px-6 py-3 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                      Cancel
                    </button>
                  </div>
                </>
              )}
              
              {paymentStep === 'success' && (
                <>
                  <div className="w-16 h-16 mx-auto mb-4 bg-green-100 rounded-full flex items-center justify-center">
                    <Check className="w-8 h-8 text-green-600" />
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Payment Successful</h3>
                  <p className="text-sm text-gray-500 mb-4">
                    Your payment has been processed successfully.
                  </p>
                  <button
                    onClick={() => {
                      setShowPaymentModal(false);
                      setPaymentStep('init');
                    }}
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                  >
                    Close
                  </button>
                </>
              )}
              
              {paymentStep === 'error' && (
                <>
                  <div className="w-16 h-16 mx-auto mb-4 bg-red-100 rounded-full flex items-center justify-center">
                    <X className="w-8 h-8 text-red-600" />
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Payment Error</h3>
                  <p className="text-sm text-gray-500 mb-4">
                    {paymentError || 'An error occurred while processing your payment.'}
                  </p>
                  <div className="flex justify-center space-x-2">
                    <button
                      onClick={() => {
                        setShowPaymentModal(false);
                        setPaymentStep('init');
                        setPaymentError('');
                      }}
                      className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                      Close
                    </button>
                    {paymentData && paymentData.processId && (
                      <button
                        onClick={() => handleCheckPaymentStatus(paymentData.processId, paymentData.merchantTxnId)}
                        className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                      >
                        Check Status
                      </button>
                    )}
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DocumentDetail; 