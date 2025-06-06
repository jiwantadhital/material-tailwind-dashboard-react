import React, { useEffect, useState } from 'react';
import { ArrowLeft, Shield, FileText, Clock, CheckCircle, ChevronRight } from 'lucide-react';
import { useParams, useNavigate } from 'react-router-dom';
import { authService } from '../../services/apiService';

const ServiceDetailPage = () => {
  const { serviceId } = useParams();
  const navigate = useNavigate();
  const [serviceData, setServiceData] = useState({
    id: '',
    title: 'Service Details',
    description: 'Service details will be loaded dynamically',
    mainImage: '/api/placeholder/400/300',
    content: '',
    pricing: [],
    requirements: []
  });
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Use serviceId from route parameter
    const id = serviceId || 'default';
    
    // Fetch actual service data from API
    fetchServiceData(id);

    // Check if user is logged in
    checkAuthStatus();
  }, [serviceId]);

  const checkAuthStatus = () => {
    // This is a placeholder for actual auth check
    // In a real app, you would check session/token/cookies
    const token = localStorage.getItem('token');
    setIsLoggedIn(!!token);
    
    // If token exists, fetch user data
    if (token) {
      // This is a placeholder for actual user data fetching
      // In a real app, you would make an API call to get user details
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
          // Show KYC required dialog with pure React
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
                <p class="text-gray-600 text-center mb-4">Your KYC is pending. Please complete your KYC verification before proceeding with the service request.</p>
               
              </div>
            </div>
          `;
          document.body.appendChild(dialogDiv);

          // Remove dialog and navigate after delay
          setTimeout(() => {
            document.body.removeChild(dialogDiv);
          }, 2000);
        }
      }else{
        // Show KYC required dialog with pure React
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
              <p class="text-gray-600 text-center mb-4">Please complete your KYC verification before proceeding with the service request.</p>
              <div class="animate-bounce text-sm text-blue-600">
                Redirecting to profile page...
              </div>
            </div>
          </div>
        `;

        document.body.appendChild(dialogDiv);

        // Remove dialog and navigate after delay
        setTimeout(() => {
          document.body.removeChild(dialogDiv);
          navigate('/profile');
        }, 2000);
      }
    }else{
      navigate('/auth/sign-in');
    }
  };

  const fetchServiceData = async (serviceId) => {
    try {
      setLoading(true);
      const response = await authService.getservicebyId(serviceId);
      
      if (response.success && response.data) {
        const apiData = response.data;
        
        // Map API response data to component state structure
        setServiceData({
          id: apiData.id,
          title: apiData.name,
          description: apiData.price_description,
          mainImage: `${apiData.image_url}`,
          content: `<h2>About Our ${apiData.name} Services</h2><p>${apiData.price_description}</p>`,
          // Parse pricing from price_range
          pricing: apiData.price_range ? [
            { name: `${apiData.name} Service`, price: apiData.price_range }
          ] : [],
          // Split requirements string by newlines or use as is
          requirements: apiData.requirements ? 
            apiData.requirements.split('\n').filter(Boolean) : 
            [apiData.requirements],
          // Parse steps from how_it_works or use default
          steps: apiData.how_it_works ? [
            {
              title: "How It Works",
              description: apiData.how_it_works
            }
          ] : [],
          documents: ["Documents will be specified during the service request process"]
        });
      }
    } catch (error) {
      console.error('Error fetching service data:', error);
      // Keep default state in case of error
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-100 text-gray-800">
      {/* Navigation */}
      <nav className="container mx-auto px-4 py-4 flex justify-between items-center backdrop-blur-md bg-white/80 sticky top-0 z-50 border-b border-gray-200 shadow-sm">
        <div className="flex items-center space-x-2" onClick={() => navigate('/')}>
          <svg className="w-7 h-7 text-blue-600" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2L2 19h20L12 2zm0 3l7 14H5l7-14z"/>
          </svg>
          <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-purple-600">Sajilo Notary</span>
        </div>
        
        {isLoggedIn && userData ? (
          <div className="flex items-center space-x-1">
            <span className="text-gray-600 text-sm">Welcome,</span>
            <span className="text-blue-600 text-sm font-medium">{userData.name}</span>
          </div>
        ) : (
          <button 
            className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
            onClick={() => navigate('/auth/sign-in')}
          >
            Sign in
          </button>
        )}
      </nav>

      {/* Breadcrumb */}
      <div className="bg-white border-b border-gray-200">
        <div className="container mx-auto px-4 py-2">
          <div className="flex items-center space-x-2 text-xs">
            <a onClick={() => navigate('/')} className="text-gray-500 hover:text-blue-600 transition-colors cursor-pointer">Home</a>
            <ChevronRight className="w-3 h-3 text-gray-400" />
            <a onClick={() => navigate('/services')} className="text-gray-500 hover:text-blue-600 transition-colors cursor-pointer">Services</a>
            <ChevronRight className="w-3 h-3 text-gray-400" />
            <span className="text-blue-600 font-medium">{serviceData.title}</span>
          </div>
        </div>
      </div>

      {/* Loading indicator */}
      {loading && (
        <div className="container mx-auto px-4 py-8">
          {/* Hero section shimmer */}
          <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm mb-6">
            <div className="flex flex-col md:flex-row md:justify-between md:items-center">
              <div className="max-w-2xl">
                <div className="h-4 w-24 bg-gray-200 rounded animate-pulse mb-4"></div>
                <div className="h-8 w-64 bg-gray-200 rounded animate-pulse mb-4"></div>
                <div className="h-4 w-full bg-gray-200 rounded animate-pulse mb-2"></div>
                <div className="h-4 w-3/4 bg-gray-200 rounded animate-pulse mb-6"></div>
                <div className="h-10 w-32 bg-gray-200 rounded animate-pulse"></div>
              </div>
              <div className="hidden md:block mt-6 md:mt-0">
                <div className="h-48 w-60 bg-gray-200 rounded animate-pulse"></div>
              </div>
            </div>
          </div>
          
          {/* Content shimmer */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-2">
              <div className="h-6 w-48 bg-gray-200 rounded animate-pulse mb-4"></div>
              <div className="h-4 w-full bg-gray-200 rounded animate-pulse mb-2"></div>
              <div className="h-4 w-full bg-gray-200 rounded animate-pulse mb-2"></div>
              <div className="h-4 w-3/4 bg-gray-200 rounded animate-pulse mb-6"></div>
              
              <div className="h-6 w-48 bg-gray-200 rounded animate-pulse mb-4"></div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-8">
                {[1, 2, 3, 4].map((item) => (
                  <div key={item} className="flex items-center space-x-2">
                    <div className="h-4 w-4 bg-gray-200 rounded-full animate-pulse"></div>
                    <div className="h-4 w-40 bg-gray-200 rounded animate-pulse"></div>
                  </div>
                ))}
              </div>
              
              <div className="h-6 w-48 bg-gray-200 rounded animate-pulse mb-4"></div>
              <div className="space-y-4 mb-8">
                {[1, 2].map((item) => (
                  <div key={item} className="flex items-start space-x-3">
                    <div className="h-6 w-6 bg-gray-200 rounded-full animate-pulse"></div>
                    <div>
                      <div className="h-5 w-40 bg-gray-200 rounded animate-pulse mb-2"></div>
                      <div className="h-4 w-full bg-gray-200 rounded animate-pulse"></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="bg-white p-5 rounded-lg border border-gray-200 shadow-md h-fit">
              <div className="h-6 w-32 bg-gray-200 rounded animate-pulse mb-4"></div>
              <div className="space-y-3 mb-6">
                {[1, 2].map((item) => (
                  <div key={item} className="flex justify-between items-center pb-2 border-b border-gray-100">
                    <div className="h-4 w-32 bg-gray-200 rounded animate-pulse"></div>
                    <div className="h-4 w-16 bg-gray-200 rounded animate-pulse"></div>
                  </div>
                ))}
              </div>
              
              <div className="h-6 w-48 bg-gray-200 rounded animate-pulse mb-3"></div>
              <div className="space-y-2 mb-6">
                {[1, 2, 3].map((item) => (
                  <div key={item} className="flex items-start space-x-2">
                    <div className="h-3 w-3 bg-gray-200 rounded-full animate-pulse mt-0.5"></div>
                    <div className="h-3 w-full bg-gray-200 rounded animate-pulse"></div>
                  </div>
                ))}
              </div>
              
              <div className="h-10 w-full bg-gray-200 rounded animate-pulse"></div>
            </div>
          </div>
        </div>
      )}

      {/* Hero Section */}
      {!loading && (
        <div className="bg-white py-8 border-b border-gray-200">
          <div className="container mx-auto px-4">
            <div className="flex flex-col md:flex-row md:justify-between md:items-center">
              <div className="max-w-2xl">
                <button 
                  onClick={() => navigate('/')}
                  className="flex items-center text-blue-600 hover:text-blue-700 transition-colors mb-3 text-sm"
                >
                  <ArrowLeft className="w-3 h-3 mr-1" />
                  Back to services
                </button>
                <h1 className="text-3xl font-bold mb-3 text-gray-900">{serviceData.title}</h1>
                <p className="text-gray-600 text-base mb-4">
                  {serviceData.description}
                </p>
                <button 
                  className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-6 py-2 rounded-lg transition-colors text-sm"
                  onClick={handleStartButtonClick}
                >
                  Let's Start
                </button>
              </div>
              <div className="hidden md:block mt-6 md:mt-0">
                <div className="bg-white p-1 rounded-lg border border-gray-200 shadow-md overflow-hidden">
                  <img src={serviceData.mainImage} alt={`${serviceData.title} illustration`} className="rounded-lg w-60" />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Service Description */}
      {!loading && (
        <section className="py-8">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="md:col-span-2">
                <div dangerouslySetInnerHTML={{ __html: serviceData.content }} className="text-gray-600 mb-6 text-sm leading-relaxed" />

                <h2 className="text-xl font-bold mb-4 text-gray-900">Documents We Handle</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-8">
                  {serviceData.documents && serviceData.documents.map((item, index) => (
                    <div key={index} className="flex items-center space-x-2">
                      <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                      <span className="text-gray-600 text-sm">{item}</span>
                    </div>
                  ))}
                </div>

                <h2 className="text-xl font-bold mb-4 text-gray-900">How It Works</h2>
                <div className="space-y-4 mb-8">
                  {serviceData.steps && serviceData.steps.map((step, index) => (
                    <div key={index} className="flex items-start space-x-3">
                      <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-xs font-semibold flex-shrink-0">{index + 1}</div>
                      <div>
                        <h3 className="text-base font-bold text-gray-800 mb-1">{step.title}</h3>
                        <p className="text-gray-600 text-sm">
                          {step.description}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-white p-5 rounded-lg border border-gray-200 shadow-md h-fit md:sticky md:top-20">
                <h3 className="text-lg font-bold mb-4 text-gray-900">Pricing</h3>
                
                <div className="space-y-3 mb-6">
                  {serviceData.pricing && serviceData.pricing.map((item, index) => (
                    <div key={index} className="flex justify-between items-center pb-2 border-b border-gray-100">
                      <span className="text-gray-600 text-sm">{item.name}</span>
                      <span className="font-medium text-gray-900 text-sm">{item.price}</span>
                    </div>
                  ))}
                </div>

                <h3 className="text-base font-bold mb-3 text-gray-900">Required Documents</h3>
                <ul className="space-y-2 mb-6">
                  {serviceData.requirements && serviceData.requirements.map((item, index) => (
                    <li key={index} className="flex items-start space-x-2">
                      <CheckCircle className="w-3 h-3 text-blue-600 mt-0.5 flex-shrink-0" />
                      <span className="text-gray-600 text-xs">{item}</span>
                    </li>
                  ))}
                </ul>

                <button 
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium px-4 py-2 rounded-lg transition-colors text-sm"
                  onClick={handleStartButtonClick}
                >
                  Let's Start
                </button>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 py-6">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center space-x-2 mb-3 md:mb-0">
              <svg className="w-6 h-6 text-blue-600" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2L2 19h20L12 2zm0 3l7 14H5l7-14z"/>
              </svg>
              <span className="text-base font-bold text-gray-900">Sajilo Notary</span>
            </div>
            <p className="text-gray-500 text-xs">&copy; {new Date().getFullYear()} Sajilo Notary. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default ServiceDetailPage; 