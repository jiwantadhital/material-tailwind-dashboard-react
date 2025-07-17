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
          <img src="/img/nlogo.png" alt="Logo" className="h-10 w-10 object-contain" />
          <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-purple-600">Sajilo Notary</span>
        </div>
        
        {/* Desktop Menu */}
        <div className="hidden md:flex items-center space-x-8">
          <a 
            onClick={() => navigate('/all-services')} 
            className="text-blue-600 hover:text-blue-700 transition-colors text-sm font-medium cursor-pointer"
          >All Services</a>
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
              <div key={index} className="bg-white p-6 rounded-xl border border-gray-200 animate-pulse shadow-lg">
                <div className="flex items-center justify-between mb-4">
                  <div className="h-5 bg-gray-200 rounded w-32"></div>
                  <div className="p-3 bg-gray-200 rounded-lg w-14 h-14"></div>
                </div>
                <div className="h-10 bg-gray-200 rounded mb-4"></div>
                <div className="h-10 bg-gray-200 rounded"></div>
              </div>
            ))}
          </div>
        ) : services.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {services.map((service, index) => (
              <div 
                key={index} 
                className="bg-white p-6 rounded-xl border border-gray-200 hover:border-blue-500/20 transition-all duration-300 hover:shadow-xl shadow-lg relative overflow-hidden group cursor-pointer flex flex-col"
                onClick={() => navigate(`/services/${service.id}`)}
              >
                {/* Card gradient overlay */}
                <div className="absolute inset-0 bg-gradient-to-br from-blue-50/50 to-purple-50/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                
                <div className="relative z-10 flex flex-col h-full">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-bold text-gray-800">{service.title}</h3>
                    <div className="p-3 bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg group-hover:from-blue-100 group-hover:to-blue-200 transition-colors w-14 h-14 flex items-center justify-center">
                      {service.image_url ? (
                        <img 
                          src={service.image_url} 
                          alt={service.title}
                          className="w-8 h-8 object-contain"
                        />
                      ) : (
                        getServiceIcon(service.code)
                      )}
                    </div>
                  </div>
                  <p className="text-gray-600 text-sm mb-4 flex-1">
                    {service.description}
                  </p>
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate(`/services/${service.id}`);
                    }} 
                    className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white py-2.5 rounded-lg text-sm font-medium transition-all duration-300 shadow-md hover:shadow-lg transform hover:-translate-y-0.5 mt-auto"
                  >
                    Apply Now
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