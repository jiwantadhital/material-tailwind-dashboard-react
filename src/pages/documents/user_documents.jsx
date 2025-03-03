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
  ChevronRightIcon
} from '@heroicons/react/24/outline';

function classNames(...classes) {
  return classes.filter(Boolean).join(' ');
}

export default function UserDocuments({ code }) {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [pagination, setPagination] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [showStartedOnly, setShowStartedOnly] = useState('all');

  const [categories, setCategories] = useState({
    'Pending': [],
    'Cost Estimated': [],
    'In Progress': [],
    'Completed': []
  });

  const getCategoryStyle = (status) => {
    const styles = {
      pending: 'bg-yellow-100 text-yellow-800',
      cost_estimated: 'bg-purple-100 text-purple-800',
      in_progress: 'bg-indigo-100 text-indigo-800',
      completed: 'bg-green-100 text-green-800',
    };
    return styles[status] || 'bg-gray-100 text-gray-800';
  };

  const getCategoryIcon = (category) => {
    const icons = {
      affidavit: "⚖️",
      contract: "📄",
      other: "📎"
    };
    return icons[category] || "📎";
  };

  const filterDocuments = (documents) => {
    return documents.filter(doc => {
      const matchesSearch = doc.title.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStartedFilter = 
        showStartedOnly === 'all' || 
        (showStartedOnly === 'started' && doc.started_at) || 
        (showStartedOnly === 'not_started' && !doc.started_at);
      return matchesSearch && matchesStartedFilter;
    });
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

  const renderDocumentCard = (document) => (
    <div key={document.id} className="bg-white rounded-xl shadow-sm p-6 mb-4 hover:shadow-xl transition-all duration-200 border border-gray-100">
      <div className="flex justify-between items-start gap-4">
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <span className="text-2xl">{getCategoryIcon(document.category)}</span>
            <h3 className="text-lg font-semibold text-gray-900 tracking-tight">{document.title}</h3>
          </div>
          <p className="mt-2 text-sm text-gray-600 leading-relaxed">{document.description}</p>
          
          <div className="mt-5 grid grid-cols-2 gap-5">
            {document.payment.total_payment_amount && (
              <div className="flex items-center text-sm text-gray-700 bg-gray-50 rounded-lg p-3">
                <BanknotesIcon className="h-5 w-5 mr-2 text-gray-500" />
                <span className="font-medium">Rs {document.payment.total_payment_amount}</span>
              </div>
            )}
            
            {document.estimated_time && (
              <div className="flex items-center text-sm text-gray-700 bg-gray-50 rounded-lg p-3">
                <ClockIcon className="h-5 w-5 mr-2 text-gray-500" />
                <div className="flex flex-col">
                  <span className="font-medium">
                    {formatTime(document.estimated_time)}
                  </span>
                  {document.estimated_time && (
                    <span className="text-xs text-gray-500">
                      {getRemainingTime(document.estimated_time)}
                    </span>
                  )}
                </div>
              </div>
            )}
            
            {document.user && (
              <div className="flex items-center text-sm text-gray-700 bg-gray-50 rounded-lg p-3">
                <UserIcon className="h-5 w-5 mr-2 text-gray-500" />
                <span className="font-medium">{document.user.name}</span>
              </div>
            )}
            
            {document.completed_at && (
              <div className="flex items-center text-sm text-gray-700 bg-gray-50 rounded-lg p-3">
                <CalendarIcon className="h-5 w-5 mr-2 text-gray-500" />
                <span className="font-medium">Completed: {new Date(document.completed_at).toLocaleDateString()}</span>
              </div>
            )}
          </div>

          <div className="mt-5 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <div className={`px-4 py-1.5 rounded-full text-xs font-medium tracking-wide ${getCategoryStyle(document.status)}`}>
                {document.status.replace('_', ' ').toUpperCase()}
              </div>
              {document.document_mark?.is_new && document.document_mark?.user_id !== authService.getCurrentUserId() && (
                <div className="px-3 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                  NEW
                </div>
              )}
            </div>
            
            <Button
              variant="gradient"
              color="blue"
              size="sm"
              className="py-1 px-2 text-[11px] font-medium"
              onClick={() => {
                if(document.document_mark.is_new === true){
                  authService.markAsRead(document.id);
                }
                navigate("/document_details", { state: { document } });
              }}
            >
              View Details
            </Button>
          </div>
        </div>
        
        <DocumentIcon className="h-10 w-10 text-gray-400" />
      </div>
    </div>
  );

  const fetchDocuments = async (page = 1, selectedStatus = "in_progress",code = 'NO') => {
    try {
      setLoading(true);
      const apiStatus = selectedStatus?.toLowerCase().replace(' ', '_');
      const response = await authService.getDocuments(page, apiStatus, code);
      
      const documentsByStatus = {
        'Pending': [],
        'Cost Estimated': [],
        'In Progress': [],
        'Completed': []
      };

      const documents = response.data.data;
      setPagination({
        currentPage: response.data.data.current_page,
        lastPage: response.data.data.last_page,
        total: response.data.data.total,
        links: response.data.data.links
      });
      
      if (!Array.isArray(documents)) {
        console.error('Documents is not an array:', documents);
        setError('Invalid data format received');
        return;
      }
      
      documents.forEach(doc => {
        const status = doc.status
          .split('_')
          .map(word => word.charAt(0).toUpperCase() + word.slice(1))
          .join(' ');
          
        if (documentsByStatus[status]) {
          documentsByStatus[status].push(doc);
        }
      });

      setCategories(documentsByStatus);
      setError(null);
    } catch (err) {
      setError('Failed to fetch documents');
      console.error('Error fetching documents:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDocuments(currentPage,"in_progress", code);
  }, [currentPage]);

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
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-3xl font-bold text-gray-900 mb-10 tracking-tight">My Documents</h1>
      
      <Tab.Group defaultIndex={2} onChange={(index) => {
        setCurrentPage(1);
        const selectedStatus = Object.keys(categories)[index];
        console.log(selectedStatus);
        fetchDocuments(1, selectedStatus, code);
      }}>
        <Tab.List className="flex space-x-1 rounded-2xl bg-gray-100/80 p-1.5">
          {Object.keys(categories).map((category) => (
            <Tab
              key={category}
              className={({ selected }) =>
                classNames(
                  'w-full rounded-xl py-3 text-sm font-medium leading-5 transition-all duration-200',
                  'ring-white ring-opacity-60 ring-offset-2 focus:outline-none focus:ring-2',
                  selected
                    ? 'bg-white shadow-sm text-blue-700'
                    : 'text-gray-600 hover:bg-white/[0.12] hover:text-gray-800'
                )
              }
            >
              {category}
            </Tab>
          ))}
        </Tab.List>
        
        <Tab.Panels className="mt-8">
          {Object.entries(categories).map(([category, documents], idx) => (
            <Tab.Panel
              key={idx}
              className={classNames(
                'rounded-xl bg-white p-3',
                'ring-white ring-opacity-60 ring-offset-2 focus:outline-none focus:ring-2'
              )}
            >
              {loading ? (
                <div className="flex items-center justify-center py-12">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-700"></div>
                </div>
              ) : (
                <>
                  {category === 'In Progress' && (
                    <div className="mb-6 space-y-4">
                      <div className="flex items-center gap-4">
                        <div className="flex-1">
                          <input
                            type="text"
                            placeholder="Search by document name..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          />
                        </div>
                        <div className="flex items-center gap-2">
                          <select
                            value={showStartedOnly}
                            onChange={(e) => setShowStartedOnly(e.target.value)}
                            className="px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm text-gray-700"
                          >
                            <option value="all">All Documents</option>
                            <option value="started">Started Only</option>
                            <option value="not_started">Not Started Only</option>
                          </select>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  <div className="space-y-4">
                    {documents.length === 0 ? (
                      <div className="text-center py-12">
                        <DocumentIcon className="mx-auto h-12 w-12 text-gray-400" />
                        <h3 className="mt-2 text-sm font-medium text-gray-900">No documents</h3>
                        <p className="mt-1 text-sm text-gray-500">
                          No documents found in this category.
                        </p>
                      </div>
                    ) : (
                      (category === 'In Progress' ? filterDocuments(documents) : documents)
                        .map((document) => renderDocumentCard(document))
                    )}
                  </div>
                  {pagination && <PaginationControls />}
                </>
              )}
            </Tab.Panel>
          ))}
        </Tab.Panels>
      </Tab.Group>
    </div>
  );
}
