import React, { useEffect, useState } from 'react';
import { ArrowLeft, FileText, Home, ChevronRight } from 'lucide-react';
import { useParams, useNavigate } from 'react-router-dom';
import { authService } from '../../services/apiService';

const ServiceDetailPage = () => {
  const { serviceId } = useParams();
  const navigate = useNavigate();
  const [serviceData, setServiceData] = useState(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const id = serviceId || 'default';
    fetchServiceData(id);
    checkAuthStatus();
  }, [serviceId]);

  const checkAuthStatus = () => {
    const token = localStorage.getItem('token');
    setIsLoggedIn(!!token);
    
    if (token) {
      const userData = JSON.parse(localStorage.getItem('user'));
      setUserData(userData);
    }
  };

  const handleStartButtonClick = () => {
    if(isLoggedIn){
      const userData = JSON.parse(localStorage.getItem('initAfterLogin'));
      if(userData.kyc_record !== null){
        if(userData.kyc_record.kyc_status === 'approved'){
        navigate(`/service-form?id=${serviceId || serviceData.id}`);
        }else{
          showKYCDialog('Your KYC is pending. Please complete your KYC verification before proceeding with the service request.');
        }
      }else{
        showKYCDialog('Please complete your KYC verification before proceeding with the service request.', true);
      }
    }else{
      navigate('/auth/sign-in');
    }
  };

  const showKYCDialog = (message, redirectToProfile = false) => {
    const dialogDiv = document.createElement('div');
    dialogDiv.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50';
    dialogDiv.innerHTML = `
      <div class="bg-white rounded-lg p-6 max-w-sm mx-auto animate-fade-in">
        <div class="flex flex-col items-center">
          <div class="w-16 h-16 mb-4 text-yellow-400">
            <svg class="w-full h-full" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
          </div>
          <h2 class="text-xl font-semibold mb-2">KYC Required</h2>
          <p class="text-gray-600 text-center mb-4">${message}</p>
          ${redirectToProfile ? '<div class="animate-bounce text-sm text-blue-600">Redirecting to profile page...</div>' : ''}
        </div>
      </div>
    `;
    document.body.appendChild(dialogDiv);

    setTimeout(() => {
      document.body.removeChild(dialogDiv);
      if (redirectToProfile) {
        navigate('/profile');
      }
    }, 2000);
  };

  const fetchServiceData = async (serviceId) => {
    try {
      setLoading(true);
      const response = await authService.getservicebyId(serviceId);
      
      if (response.success && response.data) {
        setServiceData(response.data);
      }
    } catch (error) {
      console.error('Error fetching service data:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <nav className="container mx-auto px-4 py-4 flex justify-between items-center bg-white sticky top-0 z-50 border-b border-gray-200 shadow-sm">
        <div className="flex items-center space-x-2 cursor-pointer" onClick={() => navigate('/')}>
          <img src="/img/nlogo.png" alt="Logo" className="h-10 w-10 object-contain" />
          <span className="text-xl font-bold text-gray-900">Sajilo Notary</span>
        </div>
        
        {isLoggedIn && userData ? (
          <div className="flex items-center space-x-2 bg-gray-100 px-3 py-1.5 rounded-lg border border-gray-200">
            <div className="w-7 h-7 bg-blue-600 rounded-full flex items-center justify-center">
              <span className="text-white text-xs font-medium">{userData.name?.charAt(0)}</span>
            </div>
            <div className="flex flex-col">
              <span className="text-gray-500 text-xs">Welcome back,</span>
              <span className="text-gray-900 text-sm font-semibold">{userData.name}</span>
            </div>
          </div>
        ) : (
          <button 
            className="bg-blue-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-blue-700 transition-colors shadow-md text-sm"
            onClick={() => navigate('/auth/sign-in')}
          >
            Sign in
          </button>
        )}
      </nav>

      {/* Loading indicator */}
      {loading && (
        <div className="container mx-auto px-4 py-8">
          <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm mb-6">
            <div className="flex flex-col lg:flex-row lg:justify-between lg:items-center gap-6">
              <div className="flex-1 max-w-3xl">
                <div className="h-5 w-32 bg-gray-200 rounded animate-pulse mb-4"></div>
                <div className="h-10 w-80 bg-gray-200 rounded animate-pulse mb-4"></div>
                <div className="space-y-2 mb-6">
                  <div className="h-4 w-full bg-gray-200 rounded animate-pulse"></div>
                  <div className="h-4 w-4/5 bg-gray-200 rounded animate-pulse"></div>
                </div>
                <div className="h-12 w-48 bg-gray-200 rounded animate-pulse"></div>
              </div>
              <div className="hidden lg:block">
                <div className="h-56 w-72 bg-gray-200 rounded animate-pulse"></div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Hero Section */}
      {!loading && serviceData && (
        <div className="container mx-auto px-4 py-8">
          <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm mb-6">
            <div className="flex flex-col lg:flex-row lg:justify-between lg:items-center gap-6">
              <div className="flex-1 max-w-3xl">
                <button 
                  onClick={() => navigate('/')}
                  className="inline-flex items-center space-x-2 text-blue-600 hover:text-blue-700 transition-colors mb-4 group bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-lg text-sm"
                >
                  <Home className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
                  <span className="font-medium">Back to Homepage</span>
                </button>
                
                <h1 className="text-3xl lg:text-4xl font-bold mb-4 text-gray-900 leading-tight">
                  {serviceData.name}
                </h1>
                <p className="text-gray-600 text-base leading-relaxed mb-6 max-w-2xl">
                  {serviceData.price_description}
                </p>
                
                <div className="flex flex-col sm:flex-row gap-3">
                  <button 
                    className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-3 rounded-lg transition-colors shadow-md flex items-center justify-center space-x-2"
                    onClick={handleStartButtonClick}
                  >
                    <span>Get Started Now</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
              
              <div className="hidden lg:block">
                <div className="bg-white p-2 rounded-lg border border-gray-200 shadow-md overflow-hidden">
                  <img 
                    src={serviceData.image_url} 
                    alt={`${serviceData.name} illustration`} 
                    className="rounded-lg w-72 h-56 object-cover" 
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Service Details */}
      {!loading && serviceData && (
        <section className="container mx-auto px-4 pb-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              {/* How It Works Section */}
              {serviceData.how_it_works && (
                <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
                  <div className="flex items-center space-x-2 mb-4">
                    <div className="p-1.5 bg-blue-100 rounded-lg">
                      <FileText className="w-5 h-5 text-blue-600" />
                    </div>
                    <h2 className="text-xl font-bold text-gray-900">How It Works</h2>
                  </div>
                  <p className="text-gray-600 leading-relaxed text-sm">
                    {serviceData.how_it_works}
                  </p>
                </div>
              )}

              {/* Requirements Section */}
              {serviceData.requirements && (
                <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
                  <h3 className="text-lg font-bold mb-3 text-gray-900">Requirements</h3>
                  <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                    <p className="text-gray-600 text-sm leading-relaxed">
                      {serviceData.requirements}
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Sidebar */}
            <div className="space-y-4">
              {/* Pricing Card */}
              <div className="bg-white p-5 rounded-lg border border-gray-200 shadow-sm sticky top-20">
                <div className="flex items-center space-x-2 mb-4">
                  <div className="p-1.5 bg-blue-100 rounded-lg">
                    <span className="text-blue-600 font-bold text-base">₹</span>
                  </div>
                  <h3 className="text-lg font-bold text-gray-900">Pricing</h3>
                </div>
                
                <div className="mb-5">
                  <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-blue-600 mb-1">
                        Rs. {serviceData.price_range}
                      </div>
                      <div className="text-gray-600 text-sm">
                        {serviceData.name} Service
                      </div>
                    </div>
                  </div>
                </div>

                <button 
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold px-5 py-3 rounded-lg transition-colors shadow-md flex items-center justify-center space-x-2"
                  onClick={handleStartButtonClick}
                >
                  <span>Start Your Service</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-8 mt-12">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center space-x-2 mb-4 md:mb-0">
              <div className="p-1.5 bg-blue-600 rounded-lg shadow-lg">
                <svg className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2L2 19h20L12 2zm0 3l7 14H5l7-14z"/>
                </svg>
              </div>
              <span className="text-lg font-bold">Sajilo Notary</span>
            </div>
            <div className="text-center md:text-right">
              <p className="text-gray-300 mb-1 text-sm">Making notarization simple and accessible</p>
              <p className="text-gray-400 text-xs">&copy; {new Date().getFullYear()} Sajilo Notary. All rights reserved.</p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default ServiceDetailPage; 