import React, { useState, useEffect } from 'react';
import { XCircleIcon, DocumentTextIcon, ExclamationCircleIcon } from '@heroicons/react/24/outline';
import { authService } from '../../services/apiService';
import { useNavigate } from 'react-router-dom';

const RejectedDocuments = () => {
  const navigate = useNavigate();
  const [rejectedDocs, setRejectedDocs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeService, setActiveService] = useState('all');
  const [services, setServices] = useState([]);
  
  useEffect(() => {
    fetchServices();
    fetchRejectedDocuments();
  }, [activeService]);

  const fetchServices = async () => {
    try {
      // First try to get services from localStorage
      const storedServices = localStorage.getItem('services');
      if (storedServices) {
        const parsedServices = JSON.parse(storedServices);
        const servicesArray = parsedServices.data || [];
        const activeServices = servicesArray.filter(service => service.is_active);
        setServices(activeServices);
      } else {
        // Fetch from API if not in localStorage
        const response = await authService.getAllServicesPublic();
        if (response.success && response.data) {
          const activeServices = response.data.filter(service => service.is_active);
          setServices(activeServices);
        }
      }
    } catch (error) {
      console.error('Error fetching services:', error);
      setServices([]);
    }
  };
  
  const fetchRejectedDocuments = async () => {
    try {
      setLoading(true);
      // Fetch documents with status 'rejection_pending_admin' for admin review
      const code = activeService !== 'all' ? activeService : 'all';
      const response = await authService.getDocuments(1, "rejection_pending_admin", code, "all");
      setRejectedDocs(response.data.data);
    } catch (err) {
      console.error("Error fetching rejected documents:", err);
      setError("Failed to load rejected documents. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  // Admin actions
  const handleApprove = async (docId) => {
    try {
      setLoading(true);
      await authService.rejectDocumentWithReason({ document_id: docId, admin_rejection_reason: "Rejected by admin" });
      fetchRejectedDocuments();
    } catch (err) {
      setError("Failed to approve rejection.");
    } finally {
      setLoading(false);
    }
  };

  const handleDisagree = async (docId) => {
    try {
      setLoading(true);
      await authService.adminDisagreeRejection({ document_id: docId });
      fetchRejectedDocuments();
    } catch (err) {
      setError("Failed to disagree with rejection.");
    } finally {
      setLoading(false);
    }
  };

  const handleViewDocument = (document) => {
    // Mark as read if needed
    if (document.document_mark?.is_new) {
      authService.markAsRead(document.id);
    }
    if (document.document_mark?.has_new_message_for_admin || document.document_mark?.has_new_message_for_user) {
      authService.markAsReadForAdmin(document.id);
    }
    // Navigate to document details
    navigate("/document_details", { state: { document } });
  };

  // Function to get document icon based on type
  const getDocumentIcon = (type) => {
    return <DocumentTextIcon className="h-8 w-8 text-gray-400" />;
  };

  // Create dynamic services list
  const getServicesOptions = () => {
    const defaultServices = [{ name: 'All Services', value: 'all' }];
    const dynamicServices = services.map(service => ({
      name: service.name,
      value: service.code
    }));
    return [...defaultServices, ...dynamicServices];
  };

  // Show loading state
  if (loading) {
    return (
      <div className="max-w-7xl mx-auto p-6">
        <div className="text-center py-10">
          <p className="text-gray-500">Loading rejected documents...</p>
        </div>
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className="max-w-7xl mx-auto p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-600">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Rejected Documents</h1>
        <p className="text-sm text-gray-500 mt-1">
          Documents that require corrections or updates
        </p>
      </div>

      {/* Service Tab Bar */}
      <div className="mb-6">
        <div className="sm:hidden">
          <select
            id="service-tabs"
            className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
            value={activeService}
            onChange={(e) => setActiveService(e.target.value)}
          >
            {getServicesOptions().map((service) => (
              <option key={service.value} value={service.value}>
                {service.name}
              </option>
            ))}
          </select>
        </div>
        <div className="hidden sm:block">
          <nav className="flex space-x-4 border-b border-gray-200 pb-2" aria-label="Service tabs">
            {getServicesOptions().map((service) => (
              <button
                key={service.value}
                onClick={() => setActiveService(service.value)}
                className={`
                  px-3 py-2 text-sm font-medium rounded-md whitespace-nowrap
                  ${
                    activeService === service.value
                      ? 'bg-indigo-100 text-indigo-700'
                      : 'text-gray-500 hover:text-gray-700'
                  }
                `}
                aria-current={activeService === service.value ? 'page' : undefined}
              >
                {service.name}
              </button>
            ))}
          </nav>
        </div>
      </div>

      {rejectedDocs.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-6 text-center">
          <XCircleIcon className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-lg font-medium text-gray-900">No rejected documents</h3>
          <p className="mt-1 text-sm text-gray-500">
            {activeService === 'all' 
              ? 'There are no rejected documents to display at this time.' 
              : `There are no rejected ${services.find(s => s.code === activeService)?.name || activeService} documents to display at this time.`}
          </p>
        </div>
      ) : (
        <div className="bg-white shadow overflow-hidden sm:rounded-lg">
          <ul className="divide-y divide-gray-200">
            {rejectedDocs.map((doc) => (
              <li key={doc.id} className="hover:bg-gray-50 transition-colors duration-150">
                <div className="px-6 py-5 flex items-start">
                  <div className="flex-shrink-0">
                    {getDocumentIcon(doc.document_type || 'PDF')}
                  </div>
                  <div className="ml-4 flex-1">
                    <div className="flex justify-between">
                      <div>
                        <h3 className="text-lg font-semibold text-indigo-600">{doc.title || doc.code}</h3>
                        {doc.reference_number && (
                          <p className="text-sm text-gray-600 mt-1">
                            <span className="font-medium">Ref:</span> {doc.reference_number}
                          </p>
                        )}
                      </div>
                      <span className="text-sm text-gray-500">{new Date(doc.created_at).toLocaleDateString()}</span>
                    </div>
                    <div className="mt-2 flex items-start">
                      <ExclamationCircleIcon className="h-5 w-5 text-red-500 flex-shrink-0 mr-1.5 mt-0.5" />
                      <p className="text-sm text-red-600">{doc.admin_rejection_reason || 'Rejected by admin'}</p>
                    </div>
                    <div className="mt-3 flex space-x-3">
                      <button
                        type="button"
                        className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                        onClick={() => handleViewDocument(doc)}
                      >
                        View Document
                      </button>
                      <button
                        type="button"
                        className="inline-flex items-center px-3 py-1.5 border border-gray-300 shadow-sm text-xs font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                        onClick={() => handleApprove(doc.id)}
                      >
                        Approve Rejection
                      </button>
                      <button
                        type="button"
                        className="inline-flex items-center px-3 py-1.5 border border-gray-300 shadow-sm text-xs font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                        onClick={() => handleDisagree(doc.id)}
                      >
                        Disagree
                      </button>
                    </div>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default RejectedDocuments;

 