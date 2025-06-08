import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield, FileText, Clock, Search, ArrowRight, ChevronRight, ChevronDown, User, LogOut, Settings } from 'lucide-react';
import { authService } from '../../services/apiService';

const ServicesPage = () => {
  const navigate = useNavigate();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userName, setUserName] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredServices, setFilteredServices] = useState([]);
  const [allServices, setAllServices] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  // Map API services to the format needed for display
  const getServiceIcon = (code) => {
    switch(code.toLowerCase()) {
      case 'notary':
        return <Shield className="w-5 h-5 text-blue-600" />;
      case 'translation':
        return <FileText className="w-5 h-5 text-purple-600" />;
      case 'sop':
        return <Clock className="w-5 h-5 text-blue-600" />;
      default:
        return <FileText className="w-5 h-5 text-blue-600" />;
    }
  };

  useEffect(() => {
    const token = localStorage.getItem('token');
    const user = localStorage.getItem('user');
    
    if (user) {
      const userData = user ? JSON.parse(user) : null;
      if (token) {
        setIsLoggedIn(true);
        setUserName(userData.name || 'User');
      }
    }
    
    // Fetch services from API
    const fetchServices = async () => {
      try {
        setIsLoading(true);
        const response = await authService.getFrontEndData();
        if (response.success && response.data.featuredServices) {
          const servicesData = response.data.featuredServices.map(service => ({
            id: service.id,
            icon: getServiceIcon(service.code),
            title: service.name,
            description: service.price_description,
            category: service.category || 'General', // Add category if available in API
            slug: service.code,
            code: service.code
          }));
          setAllServices(servicesData);
          setFilteredServices(servicesData);
        } else {
          // Fallback to empty array if no services
          setAllServices([]);
          setFilteredServices([]);
        }
        setIsLoading(false);
      } catch (error) {
        console.error('Error fetching services:', error);
        setIsLoading(false);
        // Set empty arrays on error
        setAllServices([]);
        setFilteredServices([]);
      }
    };
    
    fetchServices();
  }, []);

  // Get unique categories for filtering
  const categories = [...new Set(allServices.map(service => service.category))];
  
  const handleSearch = (e) => {
    const term = e.target.value;
    setSearchTerm(term);
    applyFilters(term, selectedCategory);
  };
  
  const filterByCategory = (category) => {
    setSelectedCategory(category);
    applyFilters(searchTerm, category);
  };

  const applyFilters = (searchTerm, category) => {
    let filtered = allServices;

    // Apply category filter
    if (category !== 'All') {
      filtered = filtered.filter(service => service.category === category);
    }

    // Apply search filter
    if (searchTerm.trim() !== '') {
      filtered = filtered.filter(service => 
        service.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
        service.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        service.category.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredServices(filtered);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('kyc_record');
    localStorage.removeItem('services');
    localStorage.removeItem('initAfterLogin');
    setIsLoggedIn(false);
    navigate('/auth/sign-in');
    window.location.reload();
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-100 text-gray-800">
      {/* Navigation */}
      <nav className="container mx-auto px-4 py-4 flex justify-between items-center backdrop-blur-md bg-white/80 sticky top-0 z-50 border-b border-gray-200 shadow-sm">
        <div className="flex items-center space-x-2 cursor-pointer" onClick={() => navigate('/')}>
          <svg className="w-7 h-7 text-blue-600" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2L2 19h20L12 2zm0 3l7 14H5l7-14z"/>
          </svg>
          <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-purple-600">Sajilo Notary</span>
        </div>
        
        {/* Desktop Menu */}
        <div className="hidden md:flex items-center space-x-8">
          <a 
            onClick={() => navigate('/all-services')} 
            className="text-blue-600 hover:text-blue-700 transition-colors text-sm font-medium cursor-pointer"
          >All Services</a>
          <a href="/#pricing" className="text-gray-600 hover:text-blue-600 transition-colors text-sm">Pricing</a>
          {isLoggedIn && (
            <a 
              onClick={() => navigate('/documents')} 
              className="text-gray-600 hover:text-blue-600 transition-colors text-sm cursor-pointer"
            >
              Your Documents
            </a>
          )}
          
          {isLoggedIn ? (
            <div className="relative">
              <button 
                className="flex items-center space-x-2 text-blue-600 text-sm font-medium hover:text-blue-700 transition-colors"
                onClick={() => setIsSettingsOpen(!isSettingsOpen)}
              >
                <span>{userName}</span>
                <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${isSettingsOpen ? 'transform rotate-180' : ''}`} />
              </button>
              
              {isSettingsOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50">
                  <a 
                    onClick={() => navigate('/profile')} 
                    className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-colors cursor-pointer"
                  >
                    <User className="w-4 h-4 mr-2" /> Profile
                  </a>
                  <a 
                    onClick={() => navigate('/documents')} 
                    className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-colors cursor-pointer"
                  >
                    <FileText className="w-4 h-4 mr-2" /> My Documents
                  </a>
                  <a 
                    onClick={() => navigate('/settings')} 
                    className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-colors cursor-pointer"
                  >
                    <Settings className="w-4 h-4 mr-2" /> Settings
                  </a>
                  <div className="border-t border-gray-200 my-1"></div>
                  <button 
                    onClick={handleLogout}
                    className="flex items-center w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                  >
                    <LogOut className="w-4 h-4 mr-2" /> Logout
                  </button>
                </div>
              )}
            </div>
          ) : (
            <button 
              className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
              onClick={() => navigate('/auth/sign-in')}
            >
              Sign in
            </button>
          )}
        </div>
      </nav>

      {/* Hero Section */}
      <section className="bg-gradient-to-r from-blue-50 to-purple-50 py-12">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-3xl md:text-4xl font-bold mb-4 text-gray-900">Our Services</h1>
            <p className="text-gray-600 mb-6">
              Discover our comprehensive range of professional document services designed to meet your needs
            </p>
            
            <div className="relative max-w-xl mx-auto">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Search for services..."
                className="pl-10 pr-4 py-3 w-full rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                value={searchTerm}
                onChange={handleSearch}
              />
            </div>
          </div>
        </div>
      </section>

      {/* Category Filters */}
      {!isLoading && categories.length > 0 && (
        <section className="container mx-auto px-4 py-6">
          <div className="flex flex-wrap justify-center gap-2 mb-6">
            <button
              onClick={() => filterByCategory('All')}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                selectedCategory === 'All' 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              All
            </button>
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => filterByCategory(category)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                  selectedCategory === category 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        </section>
      )}
      
      {/* Services Grid */}
      <section className="container mx-auto px-4 py-8">
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((index) => (
              <div key={index} className="bg-white p-6 rounded-xl border border-gray-200 animate-pulse">
                <div className="flex items-center mb-4">
                  <div className="p-2 bg-gray-200 rounded-lg mr-3 w-8 h-8"></div>
                  <div className="h-5 bg-gray-200 rounded w-32"></div>
                </div>
                <div className="h-16 bg-gray-200 rounded mb-4"></div>
                <div className="h-4 bg-gray-200 rounded w-24"></div>
              </div>
            ))}
          </div>
        ) : filteredServices.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredServices.map((service, index) => (
              <div 
                key={index} 
                className="bg-white p-6 rounded-xl border border-gray-200 hover:border-blue-500/20 transition-all duration-300 hover:shadow-lg cursor-pointer"
                onClick={() => navigate(`/services/${service.id}`)}
              >
                <div className="flex items-center mb-4">
                  <div className="p-2 bg-blue-50 rounded-lg mr-3">
                    {service.icon}
                  </div>
                  <h3 className="text-lg font-bold text-gray-800">{service.title}</h3>
                </div>
                <p className="text-gray-600 text-sm mb-4">
                  {service.description}
                </p>
                <a 
                  onClick={(e) => {
                    e.stopPropagation();
                    navigate(`/services/${service.id}`);
                  }} 
                  className="text-blue-600 hover:text-blue-700 transition-colors text-sm font-medium flex items-center cursor-pointer"
                >
                  Learn more <ArrowRight className="ml-1 w-3 h-3" />
                </a>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="text-gray-400 mb-4">
              <Search className="w-12 h-12 mx-auto" />
            </div>
            <h3 className="text-lg font-semibold text-gray-600 mb-2">No services found</h3>
            <p className="text-gray-500">
              {searchTerm ? `No services match "${searchTerm}"` : 'No services are currently available'}
            </p>
          </div>
        )}
      </section>

      {/* Back to Home */}
      <section className="container mx-auto px-4 py-8">
        <div className="text-center">
          <button 
            onClick={() => navigate('/')}
            className="inline-flex items-center bg-blue-600 text-white px-6 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
          >
            <ChevronRight className="mr-1 w-4 h-4 transform rotate-180" />
            Back to Home
          </button>
        </div>
      </section>
    </div>
  );
};

export default ServicesPage; 