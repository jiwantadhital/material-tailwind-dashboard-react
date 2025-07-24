import { useState, useEffect } from 'react';
import { Tab } from '@headlessui/react';
import { authService } from '../../services/apiService';
import { Button } from "@material-tailwind/react";
import { useNavigate } from 'react-router-dom';
import { 
  DocumentIcon, 
  ClockIcon, 
  BanknotesIcon,
  UserIcon,
  CalendarIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  DocumentArrowDownIcon,
  EyeIcon,
  MagnifyingGlassIcon
} from '@heroicons/react/24/outline';

function classNames(...classes) {
  return classes.filter(Boolean).join(' ');
}

export default function UserDocuments({ code, serviceId }) {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [pagination, setPagination] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [showStartedOnly, setShowStartedOnly] = useState('all');
  const [serviceName, setServiceName] = useState('');
  const [selectedDocuments, setSelectedDocuments] = useState([]);
  const [sortBy, setSortBy] = useState('created_at');
  const [sortOrder, setSortOrder] = useState('desc');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedIndex, setSelectedIndex] = useState(2);
  const [pageSize, setPageSize] = useState(5);
  const [documentCounts, setDocumentCounts] = useState({
    pending: 0,
    cost_estimated: 0,
    in_progress: 0,
    completed: 0
  });

  const [categories, setCategories] = useState({
    'Pending': [],
    'Cost Estimated': [],
    'In Progress': [],
    'Completed': []
  });

  // Get service name based on code
  useEffect(() => {
    try {
      const servicesData = localStorage.getItem('services');
      if (servicesData) {
        const parsedServices = JSON.parse(servicesData);
        const services = parsedServices.data || [];
        const service = services.find(s => s.code === code) || {};
        setServiceName(service.name || '');
      }
    } catch (error) {
      console.error('Error parsing services from localStorage:', error);
    }
  }, [code]);



  const getCategoryStyle = (status) => {
    const styles = {
      pending: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      cost_estimated: 'bg-purple-100 text-purple-800 border-purple-200',
      in_progress: 'bg-blue-100 text-blue-800 border-blue-200',
      completed: 'bg-green-100 text-green-800 border-green-200',
    };
    return styles[status] || 'bg-gray-100 text-gray-800 border-gray-200';
  };

  const getPriorityStyle = (priority) => {
    const styles = {
      high: 'bg-red-100 text-red-800 border-red-200',
      medium: 'bg-orange-100 text-orange-800 border-orange-200',
      low: 'bg-green-100 text-green-800 border-green-200',
    };
    return styles[priority] || 'bg-gray-100 text-gray-800 border-gray-200';
  };

  const getCategoryIcon = (category) => {
    const icons = {
      affidavit: "⚖️",
      contract: "📄",
      other: "📎"
    };
    return icons[category] || "📎";
  };

  const formatTime = (estimatedTime) => {
    if (!estimatedTime) return '';
    const deadline = new Date(estimatedTime);
    const totalHours = Math.abs(deadline - new Date()) / (1000 * 60 * 60);
    const days = Math.floor(totalHours / 24);
    const hours = Math.floor(totalHours % 24);
    if (days === 0) return `${hours} hours`;
    if (hours === 0) return `${days} days`;
    return `${days} days, ${hours} hours`;
  };

  const getRemainingTime = (estimatedTime) => {
    if (!estimatedTime) return '';
    
    const deadline = new Date(estimatedTime);
    const now = new Date();
    const diffInHours = (deadline - now) / (1000 * 60 * 60);
    
    if (diffInHours < 0) return 'Expired';
    
    const days = Math.floor(diffInHours / 24);
    const hours = Math.floor(diffInHours % 24);
    
    if (days === 0) return `${hours} hours remaining`;
    if (hours === 0) return `${days} days remaining`;
    return `${days} days, ${hours} hours remaining`;
  };

  const handleDocumentSelect = (documentId) => {
    setSelectedDocuments(prev => 
      prev.includes(documentId) 
        ? prev.filter(id => id !== documentId)
        : [...prev, documentId]
    );
  };

  const handleSelectAll = (documents) => {
    const allIds = documents.map(doc => doc.id);
    setSelectedDocuments(prev => 
      prev.length === allIds.length ? [] : allIds
    );
  };

  const handlePageSizeChange = (newPageSize) => {
    setPageSize(newPageSize);
    setCurrentPage(1); // Reset to first page when changing page size
  };

  const fetchDocumentCounts = async () => {
    try {
      const response = await authService.getDocumentCountsByStatus(code);
      if (response.success) {
        setDocumentCounts(response.data);
      }
    } catch (error) {
      console.error('Error fetching document counts:', error);
    }
  };







  const renderDocumentList = (document) => (
    <tr key={document.id} className="hover:bg-gray-50">
      <td className="px-6 py-4 whitespace-nowrap">
        <input
          type="checkbox"
          checked={selectedDocuments.includes(document.id)}
          onChange={() => handleDocumentSelect(document.id)}
          className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
        />
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="flex items-center">
          <span className="text-lg mr-3">{getCategoryIcon(document.category)}</span>
          <div>
            <div className="text-sm font-medium text-gray-900">{document.title}</div>
            <div className="text-sm text-gray-500">{document.user?.name}</div>
          </div>
        </div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getCategoryStyle(document.status)}`}>
          {document.status.replace('_', ' ').toUpperCase()}
        </span>
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
        Rs {document.payment?.total_payment_amount || 0}
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
        {document.estimated_time ? formatTime(document.estimated_time) : '-'}
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
        {document.created_at ? new Date(document.created_at).toLocaleDateString() : '-'}
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
        <div className="flex items-center gap-2">
          <Button
            variant="outlined"
            color="blue"
            size="sm"
            onClick={() => {
              if (document.document_mark?.is_new) {
                authService.markAsRead(document.id);
              }
              if (document.document_mark?.has_new_message_for_admin || document.document_mark?.has_new_message_for_user) {
                authService.markAsReadForAdmin(document.id);
              }
              navigate("/document_details", { state: { document } });
            }}
          >
            View
          </Button>
        </div>
      </td>
    </tr>
  );

  const fetchDocuments = async (page = 1, selectedStatus = "in_progress", code = 'NO', progress_status = 'all', size = 5) => {
    try {
      setLoading(true);
      const apiStatus = selectedStatus?.toLowerCase().replace(' ', '_');
      const response = await authService.getDocuments(page, apiStatus, code, progress_status, size);
      
      console.log('API Response:', response); // Debug log
      
      // Check if response has the expected structure
      if (!response.data || !response.data.data) {
        console.error('Invalid response structure:', response);
        setError('Invalid data format received');
        return;
      }

      const documents = response.data.data;
      
      // Set pagination data
      setPagination({
        currentPage: response.data.current_page || 1,
        lastPage: response.data.last_page || 1,
        total: response.data.total || 0,
        links: response.data.links || []
      });
      
      if (!Array.isArray(documents)) {
        console.error('Documents is not an array:', documents);
        setError('Invalid data format received');
        return;
      }
      
      // For now, let's just show the documents for the current status
      // instead of trying to categorize them
      const statusKey = selectedStatus === 'in_progress' ? 'In Progress' : 
                       selectedStatus === 'pending' ? 'Pending' :
                       selectedStatus === 'cost_estimated' ? 'Cost Estimated' :
                       selectedStatus === 'completed' ? 'Completed' : 'In Progress';
      
      const documentsByStatus = {
        'Pending': selectedStatus === 'pending' ? documents : [],
        'Cost Estimated': selectedStatus === 'cost_estimated' ? documents : [],
        'In Progress': selectedStatus === 'in_progress' ? documents : [],
        'Completed': selectedStatus === 'completed' ? documents : []
      };

      setCategories(documentsByStatus);
      setError(null);
    } catch (err) {
      setError('Failed to fetch documents');
      console.error('Error fetching documents:', err);
    } finally {
      setLoading(false);
    }
    
    // Refresh document counts after fetching documents
    fetchDocumentCounts();
  };

  useEffect(() => {
    setCurrentPage(1);
    fetchDocuments(1, "in_progress", code, showStartedOnly, pageSize);
    fetchDocumentCounts(); // Fetch document counts on mount and when code changes
  }, [code, serviceId]);

  useEffect(() => {
    const statusMap = ['pending', 'cost_estimated', 'in_progress', 'completed'];
    const currentStatus = statusMap[selectedIndex] || 'in_progress';
    fetchDocuments(currentPage, currentStatus, code, showStartedOnly, pageSize);
    // Note: fetchDocumentCounts is already called within fetchDocuments
  }, [currentPage, selectedIndex, pageSize]);

  const PaginationControls = () => (
    <div className="mt-6 flex items-center justify-between border-t border-gray-200 bg-white px-4 py-3 sm:px-6">
      <div className="flex flex-1 justify-between sm:hidden">
        <button
          onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
          disabled={currentPage === 1}
          className="relative inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
        >
          Previous
        </button>
        <button
          onClick={() => setCurrentPage(prev => Math.min(prev + 1, pagination?.lastPage || 1))}
          disabled={currentPage === pagination?.lastPage}
          className="relative ml-3 inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
        >
          Next
        </button>
      </div>
      <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
        <div>
          <p className="text-sm text-gray-700">
            Showing page <span className="font-medium">{currentPage}</span> of{' '}
            <span className="font-medium">{pagination?.lastPage}</span>
            {' '}({pagination?.total} total documents)
          </p>
        </div>
        <div>
          <nav className="isolate inline-flex -space-x-px rounded-md shadow-sm" aria-label="Pagination">
            <button
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="relative inline-flex items-center rounded-l-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0 disabled:opacity-50"
            >
              <ChevronLeftIcon className="h-5 w-5" aria-hidden="true" />
            </button>
            <button
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, pagination?.lastPage || 1))}
              disabled={currentPage === pagination?.lastPage}
              className="relative inline-flex items-center rounded-r-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0 disabled:opacity-50"
            >
              <ChevronRightIcon className="h-5 w-5" aria-hidden="true" />
            </button>
          </nav>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-xl font-semibold text-gray-900">
            {serviceName ? `${serviceName} Documents` : 'Document Management'}
          </h1>
        </div>



        {/* Filters and Actions */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-8">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1 relative">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search documents..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            
            {/* Page Size Selector - Always visible */}
            <div className="flex items-center gap-2">
              <label className="text-sm font-medium text-gray-700">Show:</label>
              <select
                value={pageSize}
                onChange={(e) => handlePageSizeChange(Number(e.target.value))}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
              >
                <option value={5}>5 per page</option>
                <option value={10}>10 per page</option>
                <option value={20}>20 per page</option>
                <option value={50}>50 per page</option>
              </select>
            </div>

            {/* Only show additional filters when "In Progress" tab is selected */}
            {selectedIndex === 2 && (
              <div className="flex items-center gap-4">
                <select
                  value={showStartedOnly}
                  onChange={(e) => {
                    setShowStartedOnly(e.target.value);
                    fetchDocuments(1, 'in_progress', code, e.target.value, pageSize);
                  }}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="all">All Documents</option>
                  <option value="not_started">Not Started</option>
                  <option value="rejected">Rejected</option>
                  <option value="full_payment_made">Full Payment Made</option>
                </select>
                
                <Button
                  variant="outlined"
                  color="blue"
                  size="sm"
                  className="flex items-center gap-2"
                >
                  <DocumentArrowDownIcon className="h-4 w-4" />
                  Export
                </Button>
              </div>
            )}
          </div>
          

        </div>

        {/* Document Tabs */}
        <div className="bg-white rounded-xl shadow-sm">
          <Tab.Group defaultIndex={2} onChange={(index) => {
            setCurrentPage(1);
            setSelectedIndex(index);
            const statusMap = ['pending', 'cost_estimated', 'in_progress', 'completed'];
            const selectedStatus = statusMap[index] || 'in_progress';
            fetchDocuments(1, selectedStatus, code, showStartedOnly, pageSize);
          }}>
            {({ selectedIndex }) => (
              <>
                <Tab.List className="flex bg-gradient-to-r from-gray-50 to-gray-100 rounded-t-xl border-b border-gray-200 p-1">
                  {Object.entries(categories).map(([category, documents]) => (
                    <Tab
                      key={category}
                      className={({ selected }) =>
                        classNames(
                          'group relative px-6 py-3 text-sm font-semibold transition-all duration-300 transform',
                          'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2',
                          'rounded-lg mx-1 shadow-sm',
                          selected
                            ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white scale-105 shadow-lg'
                            : 'text-gray-600 hover:text-gray-800 hover:bg-white hover:shadow-md hover:-translate-y-0.5'
                        )
                      }
                    >
                      {({ selected }) => (
                        <div className="flex items-center gap-3">
                          <div className="flex items-center gap-2">
                            <span className={`w-2 h-2 rounded-full transition-all duration-300 ${
                              selected 
                                ? 'bg-white shadow-sm' 
                                : category === 'Pending' 
                                  ? 'bg-yellow-400' 
                                  : category === 'Cost Estimated' 
                                    ? 'bg-purple-400' 
                                    : category === 'In Progress' 
                                      ? 'bg-blue-400' 
                                      : 'bg-green-400'
                            }`}></span>
                            <span className="whitespace-nowrap">{category}</span>
                          </div>
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold transition-all duration-300 ${
                            selected 
                              ? 'bg-white/20 text-white backdrop-blur-sm' 
                              : 'bg-gray-200 text-gray-700 group-hover:bg-gray-300'
                          }`}>
                            {(() => {
                              const statusKey = category === 'Pending' ? 'pending' : 
                                               category === 'Cost Estimated' ? 'cost_estimated' : 
                                               category === 'In Progress' ? 'in_progress' : 
                                               category === 'Completed' ? 'completed' : 'in_progress';
                              return selected ? (pagination?.total || documentCounts[statusKey]) : documentCounts[statusKey];
                            })()}
                          </span>
                        </div>
                      )}
                    </Tab>
                  ))}
                </Tab.List>
                
                <Tab.Panels>
                  {Object.entries(categories).map(([category, documents], idx) => (
                    <Tab.Panel key={idx} className="p-6">
                      {loading ? (
                        <div className="flex items-center justify-center py-12">
                          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                        </div>
                      ) : (
                        <>
                          {documents.length === 0 ? (
                            <div className="text-center py-12">
                              <DocumentIcon className="mx-auto h-16 w-16 text-gray-400" />
                              <h3 className="mt-4 text-lg font-medium text-gray-900">No documents found</h3>
                              <p className="mt-2 text-sm text-gray-500">
                                No documents match your current filters.
                              </p>
                            </div>
                          ) : (
                            <>
                              {/* Select All Checkbox */}
                              <div className="flex items-center justify-between mb-6">
                                <div className="flex items-center">
                                  <input
                                    type="checkbox"
                                    checked={selectedDocuments.length === documents.length && documents.length > 0}
                                    onChange={() => handleSelectAll(documents)}
                                    className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                                  />
                                  <label className="ml-2 text-sm font-medium text-gray-700">
                                    Select all ({documents.length} documents)
                                  </label>
                                </div>
                                                            <div className="text-sm text-gray-500">
                              Showing {documents.length} of {pagination?.total || 0} documents (Page {pagination?.currentPage || 1} of {pagination?.lastPage || 1})
                            </div>
                              </div>

                              {/* Document List - Always show list view */}
                              <div className="overflow-x-auto">
                                <table className="min-w-full divide-y divide-gray-200">
                                  <thead className="bg-gray-50">
                                    <tr>
                                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        <input
                                          type="checkbox"
                                          checked={selectedDocuments.length === documents.length && documents.length > 0}
                                          onChange={() => handleSelectAll(documents)}
                                          className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                                        />
                                      </th>
                                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Document
                                      </th>
                                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Status
                                      </th>
                                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Amount
                                      </th>
                                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Time
                                      </th>
                                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Created
                                      </th>
                                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Actions
                                      </th>
                                    </tr>
                                  </thead>
                                  <tbody className="bg-white divide-y divide-gray-200">
                                    {documents.map((document) => renderDocumentList(document))}
                                  </tbody>
                                </table>
                              </div>
                            </>
                          )}
                          
                          {pagination && pagination.total > 0 && <PaginationControls />}
                        </>
                      )}
                    </Tab.Panel>
                  ))}
                </Tab.Panels>
              </>
            )}
          </Tab.Group>
        </div>
      </div>
    </div>
  );
}
