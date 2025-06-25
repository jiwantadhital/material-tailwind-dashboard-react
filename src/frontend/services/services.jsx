import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield, FileText, Clock, ArrowRight, ChevronRight, ChevronDown, User, LogOut, Settings, DollarSign, Star } from 'lucide-react';
import { authService } from '../../services/apiService';

const ServicesPage = () => {
  const navigate = useNavigate();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userName, setUserName] = useState('');
  const [services, setServices] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  // Map API services to the format needed for display
  const getServiceIcon = (code) => {
    switch(code.toLowerCase()) {
      case 'notary':
      case 'no':
        return <Shield className="w-5 h-5 text-blue-600" />;
      case 'translation':
        return <FileText className="w-5 h-5 text-purple-600" />;
      case 'sop':
        return <Clock className="w-5 h-5 text-green-600" />;
      case 'property':
      case 'po':
        return <FileText className="w-5 h-5 text-orange-600" />;
      default:
        return <FileText className="w-5 h-5 text-blue-600" />;
    }
  };

  // Get service category based on code
  const getServiceCategory = (code) => {
    switch(code.toLowerCase()) {
      case 'notary':
      case 'no':
        return 'Legal Services';
      case 'sop':
        return 'Documentation';
      case 'property':
      case 'po':
        return 'Property Services';
      default:
        return 'General';
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
        // Use the correct API for all services (not just featured ones)
        const response = await authService.getAllServicesPublic();
        if (response.success && response.data) {
          const servicesData = response.data.map(service => ({
            id: service.id,
            icon: getServiceIcon(service.code),
            title: service.name,
            description: service.price_description || service.description || 'Professional service',
            category: getServiceCategory(service.code),
            slug: service.code,
            code: service.code,
            is_active: service.is_active,
            is_featured: service.is_featured,
            price_range: service.price_range,
            image_url: service.image_url,
            how_it_works: service.how_it_works,
            requirements: service.requirements,
            percentage_of_price: service.percentage_of_price
          }));
          
          // Filter only active services for public display
          const activeServices = servicesData.filter(service => service.is_active);
          setServices(activeServices);
        } else {
          // Fallback to empty array if no services
          setServices([]);
        }
        setIsLoading(false);
      } catch (error) {
        console.error('Error fetching all services:', error);
        setIsLoading(false);
        // Set empty arrays on error
        setServices([]);
      }
    };
    
    fetchServices();
  }, []);

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
      <section className="bg-gradient-to-r from-blue-50 to-purple-50 py-8">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-2xl md:text-3xl font-bold mb-2 text-gray-900">Our Services</h1>
            <p className="text-gray-600 text-sm">
              Professional document services designed to meet your needs
            </p>
          </div>
        </div>
      </section>
      
      {/* Services Grid */}
      <section className="container mx-auto px-4 py-8">
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1, 2, 3, 4, 5, 6].map((index) => (
              <div key={index} className="bg-white rounded-2xl border border-gray-200 overflow-hidden animate-pulse">
                <div className="p-4">
                  <div className="flex items-center mb-3">
                    <div className="w-12 h-12 bg-gray-200 rounded-lg mr-3 flex-shrink-0"></div>
                    <div>
                      <div className="h-5 bg-gray-200 rounded w-24 mb-2"></div>
                      <div className="h-3 bg-gray-200 rounded w-16"></div>
                    </div>
                  </div>
                  <div className="h-12 bg-gray-200 rounded mb-3"></div>
                  <div className="h-6 bg-gray-200 rounded w-20 mb-3"></div>
                  <div className="h-8 bg-gray-200 rounded w-full"></div>
                </div>
              </div>
            ))}
          </div>
        ) : services.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {services.map((service, index) => (
              <div 
                key={index} 
                className="bg-white rounded-2xl border border-gray-200 hover:border-blue-500/20 transition-all duration-300 hover:shadow-xl hover:-translate-y-1 cursor-pointer group relative"
                onClick={() => navigate(`/services/${service.id}`)}
              >
                {/* Featured Badge */}
                {service.is_featured && (
                  <div className="absolute top-3 right-3 z-10">
                    <div className="bg-yellow-500 text-white px-2 py-1 rounded-full flex items-center text-xs font-medium">
                      <Star className="w-3 h-3 mr-1" />
                      Featured
                    </div>
                  </div>
                )}

                {/* Service Content */}
                <div className="p-4">
                  {/* Service Header with Icon Image */}
                  <div className="flex items-center mb-3">
                    <div className="w-12 h-12 rounded-lg mr-3 flex-shrink-0 overflow-hidden border border-gray-200">
                      {service.image_url ? (
                        <img 
                          src={service.image_url} 
                          alt={service.title}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            // Fallback to gradient background if image fails to load
                            e.target.style.display = 'none';
                            e.target.nextElementSibling.style.display = 'flex';
                          }}
                        />
                      ) : null}
                      <div 
                        className={`w-full h-full bg-gradient-to-br from-blue-500 to-purple-600 ${service.image_url ? 'hidden' : 'flex'} items-center justify-center`}
                        style={{ display: service.image_url ? 'none' : 'flex' }}
                      >
                        <div className="text-white">
                          {service.icon}
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex-1">
                      <h3 className="text-lg font-bold text-gray-900 group-hover:text-blue-600 transition-colors">
                        {service.title}
                      </h3>
                      <div className="text-xs text-gray-500 font-medium">
                        {service.category}
                      </div>
                    </div>
                  </div>
                  
                  <p className="text-gray-600 text-xs mb-3 line-clamp-2">
                    {service.description}
                  </p>
                  
                  {/* Price Range */}
                  {service.price_range && (
                    <div className="flex items-center mb-3 p-2 bg-green-50 rounded-lg">
                      <DollarSign className="w-3 h-3 text-green-600 mr-1" />
                      <span className="text-green-700 font-semibold text-xs">
                        NPR {service.price_range}
                      </span>
                    </div>
                  )}
                  
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate(`/services/${service.id}`);
                    }} 
                    className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-2 px-3 rounded-lg text-sm font-medium hover:from-blue-700 hover:to-purple-700 transition-all duration-300 flex items-center justify-center group-hover:shadow-lg"
                  >
                    Get Started
                    <ArrowRight className="ml-1 w-3 h-3 group-hover:translate-x-1 transition-transform" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="text-gray-400 mb-4">
              <FileText className="w-12 h-12 mx-auto" />
            </div>
            <h3 className="text-lg font-semibold text-gray-600 mb-2">No services available</h3>
            <p className="text-gray-500">
              No services are currently available
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