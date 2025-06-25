import React, { useEffect, useState } from 'react';
import { ChevronRight, Menu, X, Check, ArrowRight, ExternalLink, Shield, Clock, FileText, User, LogOut, MessageSquare, Settings, ChevronDown } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { authService } from '../services/apiService';

const LandingPage = () => {
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [activeTab, setActiveTab] = useState(0);
  const [email, setEmail] = useState('');
  const [userName, setUserName] = useState('');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [featuredServices, setFeaturedServices] = useState([]);
  const [allServices, setAllServices] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Homepage content states
  const [heroContent, setHeroContent] = useState({
    title: 'Notarize Documents Securely & Seamlessly',
    subtitle: 'SECURE & STREAMLINED NOTARY SERVICES',
    description: 'Sajilo Notary brings the power of digital transformation to notarial services, making document authentication faster, secure, and convenient for everyone.',
    primary_button_text: 'Get Started',
    email_placeholder: 'Your email',
    is_active: true
  });
  const [featuresContent, setFeaturesContent] = useState({
    title: 'Why Choose Sajilo Notary?',
    description: 'Our platform offers a seamless notarization experience with powerful features designed for businesses and individuals alike.',
    features: [
      {
        title: 'Time-Saving Process',
        description: 'Complete notarizations in minutes, not days. Our streamlined digital process eliminates the need for in-person meetings.',
        icon_type: 'clock'
      },
      {
        title: 'Enhanced Security',
        description: 'Advanced encryption and authentication protocols ensure your documents remain secure and tamper-proof throughout the process.',
        icon_type: 'shield'
      },
      {
        title: 'Legal Compliance',
        description: 'Our platform is fully compliant with all relevant regulations and laws governing digital notarization services.',
        icon_type: 'document'
      }
    ]
  });
  const [testimonialsContent, setTestimonialsContent] = useState({
    title: 'Trusted by industry leaders',
    description: 'See what our clients say about how Sajilo Notary has transformed their document workflows.',
    testimonials: [
      {
        company: 'Microsoft',
        testimonial: 'Sajilo Notary completely transformed our document processing workflow. What used to take days now takes minutes.',
        name: 'Andrew Mitchell',
        role: 'Legal Director'
      },
      {
        company: 'Airbnb',
        testimonial: 'Sajilo Notary\'s platform has significantly reduced our document processing time and improved our client experience.',
        name: 'Sarah Johnson',
        role: 'Head of Real Estate Operations'
      },
      {
        company: 'Goldman Sachs',
        testimonial: 'Security and compliance are non-negotiable in our industry. Sajilo Notary delivers on both fronts.',
        name: 'Michael Chen',
        role: 'VP of Legal Affairs'
      }
    ]
  });
  const [ctaContent, setCtaContent] = useState({
    title: 'Ready to streamline your document workflows?',
    description: 'Join thousands of businesses and professionals who are saving time and resources with Sajilo Notary\'s secure platform.',
    primary_button_text: 'Get Started',
    email_placeholder: 'Your email',
    statistics_text: 'Join 2,500+ businesses already using Sajilo Notary'
  });
  const [homepageLoading, setHomepageLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const user = localStorage.getItem('user');
    
    if (user) {
      const userData = user ? JSON.parse(user) : null;
      const userRole = userData?.role || null;
      
      if (token) {
        if (userRole !== "user") {
          window.location.href = '/dashboard/home';
        } else {
          setIsLoggedIn(true);
          setUserName(userData.name || 'User');
        }
      }
    }

    //init after login for frontend
    const fetchInitAfterLoginIfLoggedIn = async () => {
      const token = localStorage.getItem('token');
      if (token) {
        const response = await authService.initAfterLogin();
        if (response.success) {
          localStorage.setItem('initAfterLogin', JSON.stringify(response.data));
          console.log(localStorage.getItem('initAfterLogin'));
        }
      }
    };
    
    // Fetch featured services data
    const fetchFeaturedServices = async () => {
      try {
        setIsLoading(true);
        const response = await authService.getFrontEndData();
        if (response.success && response.data.featuredServices) {
          setFeaturedServices(response.data.featuredServices);
        }
        setIsLoading(false);
      } catch (error) {
        console.error('Error fetching featured services:', error);
        setIsLoading(false);
      }
    };

    // Fetch all services data
    const fetchAllServices = async () => {
      try {
        const response = await authService.getAllServicesPublic();
        if (response.success && response.data) {
          setAllServices(response.data);
        }
      } catch (error) {
        console.error('Error fetching all services:', error);
      }
    };

    // Fetch homepage content
    const fetchHomepageContent = async () => {
      try {
        setHomepageLoading(true);
        
        // Fetch all homepage sections
        const [heroResponse, featuresResponse, testimonialsResponse, ctaResponse] = await Promise.all([
          authService.getHeroSection().catch(err => ({ success: false, error: err })),
          authService.getFeaturesSection().catch(err => ({ success: false, error: err })),
          authService.getTestimonialsSection().catch(err => ({ success: false, error: err })),
          authService.getCallToActionSection().catch(err => ({ success: false, error: err }))
        ]);

        // Update hero section if API call succeeded
        if (heroResponse.success && heroResponse.data) {
          setHeroContent(heroResponse.data);
        }

        // Update features section if API call succeeded
        if (featuresResponse.success && featuresResponse.data) {
          setFeaturesContent({
            title: featuresResponse.data.section?.title || featuresContent.title,
            description: featuresResponse.data.section?.description || featuresContent.description,
            features: featuresResponse.data.features && featuresResponse.data.features.length > 0 
              ? featuresResponse.data.features 
              : featuresContent.features
          });
        }

        // Update testimonials section if API call succeeded
        if (testimonialsResponse.success && testimonialsResponse.data) {
          setTestimonialsContent({
            title: testimonialsResponse.data.section?.title || testimonialsContent.title,
            description: testimonialsResponse.data.section?.description || testimonialsContent.description,
            testimonials: testimonialsResponse.data.testimonials && testimonialsResponse.data.testimonials.length > 0
              ? testimonialsResponse.data.testimonials
              : testimonialsContent.testimonials
          });
        }

        // Update call to action section if API call succeeded
        if (ctaResponse.success && ctaResponse.data) {
          setCtaContent(ctaResponse.data);
        }

        setHomepageLoading(false);
      } catch (error) {
        console.error('Error fetching homepage content:', error);
        setHomepageLoading(false);
        // Keep default content if API calls fail
      }
    };
    
    fetchFeaturedServices();
    fetchAllServices();
    fetchHomepageContent();
    fetchInitAfterLoginIfLoggedIn();
    // Add scroll reveal animations
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('animate-fadeIn');
        }
      });
    }, { threshold: 0.2, rootMargin: "0px 0px -100px 0px" });
    
    document.querySelectorAll('.reveal').forEach(el => observer.observe(el));
    
    return () => observer.disconnect();
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

  // Default services to use if API fails or returns empty
  const defaultServices = [
    
  ];

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

  // Map feature icon types to actual icons
  const getFeatureIcon = (iconType) => {
    switch(iconType?.toLowerCase()) {
      case 'clock':
        return <Clock className="w-5 h-5 text-blue-600" />;
      case 'shield':
        return <Shield className="w-5 h-5 text-purple-600" />;
      case 'document':
        return <FileText className="w-5 h-5 text-blue-600" />;
      case 'check':
        return <Check className="w-5 h-5 text-green-600" />;
      default:
        return <FileText className="w-5 h-5 text-blue-600" />;
    }
  };

  // Services to display - use API data if available, otherwise fallback to defaults
  const servicesToDisplay = featuredServices.length > 0 
    ? featuredServices.map(service => ({
        id: service.id,
        icon: getServiceIcon(service.code),
        title: service.name,
        description: service.price_description,
        slug: service.code,
        code: service.code
      }))
    : defaultServices;

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-100 text-gray-800">
      {/* Navigation */}
      <nav className="container mx-auto px-4 py-4 flex justify-between items-center backdrop-blur-md bg-white/80 sticky top-0 z-50 border-b border-gray-200 shadow-sm">
        <div className="flex items-center space-x-2">
          <svg className="w-7 h-7 text-blue-600" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2L2 19h20L12 2zm0 3l7 14H5l7-14z"/>
          </svg>
          <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-purple-600">Sajilo Notary</span>
        </div>
        
        {/* Desktop Menu */}
        <div className="hidden md:flex items-center space-x-8">
          <a 
            onClick={() => navigate('/all-services')} 
            className="text-gray-600 hover:text-blue-600 transition-colors text-sm cursor-pointer"
          >All Services</a>
          <a href="#pricing" className="text-gray-600 hover:text-blue-600 transition-colors text-sm">Pricing</a>
          {isLoggedIn && (
            <a 
              onClick={() => navigate('/documents')} 
              className="text-gray-600 hover:text-blue-600 transition-colors text-sm cursor-pointer"
            >
              Requested Documents
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
            <div className="flex items-center space-x-3">
              <button 
                className="text-blue-600 hover:text-blue-700 transition-colors text-sm font-medium"
                onClick={() => navigate('/auth/sign-in')}
              >
                Sign in
              </button>
              <button 
                className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
                onClick={() => navigate('/auth/sign-up')}
              >
                Sign Up
              </button>
            </div>
          )}
        </div>
        
        {/* Mobile Menu Button */}
        <button className="md:hidden text-gray-800 p-2 rounded-lg bg-gray-100 hover:bg-gray-200 transition-colors" onClick={() => setIsMenuOpen(!isMenuOpen)}>
          {isMenuOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
        
        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="absolute top-16 left-0 right-0 bg-white shadow-lg p-4 md:hidden z-50 border-b border-gray-200">
            <div className="flex flex-col space-y-3">
              <a 
                onClick={() => {
                  navigate('/all-services');
                  setIsMenuOpen(false);
                }} 
                className="text-gray-600 hover:text-blue-600 transition-colors py-2 text-sm cursor-pointer"
              >All Services</a>
              <a href="#pricing" className="text-gray-600 hover:text-blue-600 transition-colors py-2 text-sm" onClick={() => setIsMenuOpen(false)}>Pricing</a>
              {isLoggedIn && (
                <a
                  onClick={() => {
                    navigate('/documents');
                    setIsMenuOpen(false);
                  }} 
                  className="text-gray-600 hover:text-blue-600 transition-colors py-2 text-sm cursor-pointer"
                >
                  My Documents
                </a>
              )}
              
              {isLoggedIn ? (
                <div className="border-t border-gray-200 pt-2">
                  <p className="text-blue-600 font-medium py-2 text-sm">Welcome, {userName}</p>
                  <a 
                    onClick={() => {
                      navigate('/profile');
                      setIsMenuOpen(false);
                    }} 
                    className="text-gray-600 hover:text-blue-600 transition-colors py-2 text-sm flex items-center cursor-pointer"
                  >
                    <User className="w-4 h-4 mr-2" /> Profile
                  </a>
                  <a 
                    onClick={() => {
                      navigate('/documents');
                      setIsMenuOpen(false);
                    }} 
                    className="text-gray-600 hover:text-blue-600 transition-colors py-2 text-sm flex items-center cursor-pointer"
                  >
                    <FileText className="w-4 h-4 mr-2" /> My Documents
                  </a>
                  <a 
                    onClick={() => {
                      navigate('/settings');
                      setIsMenuOpen(false);
                    }} 
                    className="text-gray-600 hover:text-blue-600 transition-colors py-2 text-sm flex items-center cursor-pointer"
                  >
                    <Settings className="w-4 h-4 mr-2" /> Settings
                  </a>
                  <button 
                    onClick={() => {
                      handleLogout();
                      setIsMenuOpen(false);
                    }}
                    className="text-red-600 hover:text-red-700 transition-colors py-2 text-sm flex items-center"
                  >
                    <LogOut className="w-4 h-4 mr-2" /> Logout
                  </button>
                </div>
              ) : (
                <div className="border-t border-gray-200 pt-2 flex flex-col space-y-2">
                  <button 
                    className="text-blue-600 hover:text-blue-700 transition-colors py-2 text-sm font-medium text-left"
                    onClick={() => {
                      navigate('/auth/sign-in');
                      setIsMenuOpen(false);
                    }}
                  >
                    Sign in
                  </button>
                  <button 
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
                    onClick={() => {
                      navigate('/auth/sign-up');
                      setIsMenuOpen(false);
                    }}
                  >
                    Sign Up
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </nav>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-12 md:py-16 relative">
        <div className="flex flex-col md:flex-row justify-between items-center reveal">
          <div className="max-w-xl mb-12 md:mb-0">
            {homepageLoading ? (
              <div className="animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-64 mb-4"></div>
                <div className="h-12 bg-gray-200 rounded w-full mb-4"></div>
                <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-8"></div>
              </div>
            ) : (
              <>
                <div className="text-sm font-semibold text-blue-600 mb-4 flex items-center">
                  <Shield className="w-4 h-4 text-blue-600 mr-2" />
                  {heroContent.subtitle}
                </div>
                <h1 className="text-4xl md:text-5xl font-bold mb-4 leading-tight text-gray-900">
                  {heroContent.title.split(' ').map((word, index, words) => {
                    // Make the last two words gradient colored
                    if (index >= words.length - 2) {
                      return <span key={index} className="bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-purple-600">{word} </span>;
                    }
                    return word + ' ';
                  })}
                </h1>
                <p className="text-gray-600 text-base mb-8">
                  {heroContent.description}
                </p>
              </>
            )}
            
            <div className="grid grid-cols-3 gap-4 mb-8">
              <div className="flex items-center space-x-2">
                <Clock className="w-4 h-4 text-blue-600" />
                <p className="text-gray-600 text-sm">Fast service</p>
              </div>
              <div className="flex items-center space-x-2">
                <Shield className="w-4 h-4 text-blue-600" />
                <p className="text-gray-600 text-sm">Secure</p>
              </div>
              <div className="flex items-center space-x-2">
                <FileText className="w-4 h-4 text-blue-600" />
                <p className="text-gray-600 text-sm">Compliant</p>
              </div>
            </div>
            
            {!homepageLoading && (
              <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-3">
                {!isLoggedIn ? (
                  <>
                    <button 
                      onClick={() => navigate('/auth/sign-up')}
                      className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-lg text-sm font-medium transition-colors"
                    >
                      {heroContent.primary_button_text} <ArrowRight className="ml-1 w-4 h-4 inline-block" />
                    </button>
                    <button 
                      onClick={() => navigate('/all-services')}
                      className="border border-blue-600 text-blue-600 hover:bg-blue-50 px-6 py-2.5 rounded-lg text-sm font-medium transition-colors"
                    >
                      View All Services
                    </button>
                  </>
                ) : (
                  <>
                    <input
                      type="email"
                      placeholder={heroContent.email_placeholder}
                      className="bg-white px-4 py-2.5 rounded-lg w-full sm:w-64 border border-gray-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-sm"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                    <button className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-lg text-sm font-medium transition-colors">
                      {heroContent.primary_button_text} <ArrowRight className="ml-1 w-4 h-4 inline-block" />
                    </button>
                  </>
                )}
              </div>
            )}
          </div>
          <div className="bg-white p-4 rounded-xl shadow-lg border border-gray-200 max-w-md">
            <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-6 rounded-lg">
              <h3 className="text-xl font-bold mb-3 text-gray-900">Document Verification</h3>
              <p className="text-gray-600 mb-4 text-sm">Secure, tamper-proof verification with digital signatures</p>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-700">Identity verification</span>
                  <span className="flex items-center text-green-600 text-sm">
                    <Check className="w-4 h-4 mr-1" /> Complete
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-1">
                  <div className="bg-green-600 h-1 rounded-full w-full"></div>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-700">Document processing</span>
                  <span className="text-blue-600 text-sm">80%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-1">
                  <div className="bg-blue-600 h-1 rounded-full w-4/5"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section id="services" className="container mx-auto px-4 py-12 border-t border-gray-200 reveal">
        <div className="text-center max-w-2xl mx-auto mb-8">
          <h2 className="text-3xl font-bold mb-4 text-gray-900">
            Popular Services
          </h2>
          <p className="text-gray-600">
            We offer a range of professional services to meet all your document authentication and preparation needs
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 reveal">
          {isLoading ? (
            // Show loading placeholders
            [1, 2, 3].map((index) => (
              <div key={index} className="bg-white p-6 rounded-xl border border-gray-200 animate-pulse">
                <div className="flex items-center mb-4">
                  <div className="p-2 bg-gray-200 rounded-lg mr-3 w-8 h-8"></div>
                  <div className="h-5 bg-gray-200 rounded w-32"></div>
                </div>
                <div className="h-10 bg-gray-200 rounded mb-4"></div>
                <div className="h-4 bg-gray-200 rounded w-24"></div>
              </div>
            ))
          ) : (
            servicesToDisplay.map((service, index) => (
              <div key={index} className="bg-white p-6 rounded-xl border border-gray-200 hover:border-blue-500/20 transition-all duration-300 hover:shadow-md cursor-pointer" onClick={() => navigate(`/services/${service.id}`)}>
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
            ))
          )}
        </div>
        <div className="text-center mt-8">
          <button 
            onClick={() => navigate('/all-services')}
            className="inline-flex items-center bg-white border border-blue-600 text-blue-600 px-6 py-2 rounded-lg text-sm font-medium hover:bg-blue-50 transition-colors"
          >
            View All Services <ChevronRight className="ml-1 w-4 h-4" />
          </button>
        </div>
      </section>

      {/* Features Highlights Section */}
      <section id="features" className="container mx-auto px-4 py-12 bg-gray-50 rounded-xl my-8 reveal">
        <div className="text-center max-w-2xl mx-auto mb-8">
          {homepageLoading ? (
            <div className="animate-pulse">
              <div className="h-8 bg-gray-200 rounded w-64 mx-auto mb-4"></div>
              <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
              <div className="h-4 bg-gray-200 rounded w-3/4 mx-auto"></div>
            </div>
          ) : (
            <>
              <h2 className="text-3xl font-bold mb-4 text-gray-900">
                {featuresContent.title}
              </h2>
              <p className="text-gray-600">
                {featuresContent.description}
              </p>
            </>
          )}
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 reveal">
          {homepageLoading ? (
            // Loading placeholders
            [1, 2, 3].map((index) => (
              <div key={index} className="flex p-5 rounded-xl bg-white border border-gray-200 animate-pulse">
                <div className="p-2 bg-gray-200 rounded-lg mr-3 h-fit w-9 h-9"></div>
                <div className="flex-1">
                  <div className="h-5 bg-gray-200 rounded w-32 mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded w-full mb-1"></div>
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                </div>
              </div>
            ))
          ) : (
            featuresContent.features.filter(feature => feature.is_active !== false).map((feature, index) => (
              <div key={feature.id || index} className="flex p-5 rounded-xl bg-white border border-gray-200">
                <div className="p-2 bg-blue-50 rounded-lg mr-3 h-fit">
                  {getFeatureIcon(feature.icon_type)}
                </div>
                <div>
                  <h3 className="text-lg font-bold mb-2 text-gray-800">{feature.title}</h3>
                  <p className="text-gray-600 text-sm">
                    {feature.description}
                  </p>
                </div>
              </div>
            ))
          )}
        </div>
      </section>

      {/* Services We Provide Section - Improved */}
      <section className="container mx-auto px-4 py-12 bg-white rounded-xl border border-gray-200 my-8 reveal">
        <div className="text-center max-w-2xl mx-auto mb-6">
          <h2 className="text-3xl font-bold mb-4 text-gray-900">
            Service we provide
          </h2>
          <p className="text-gray-600">
            Sajilo Notary scales with your business needs, providing enterprise-grade features that streamline workflows.
          </p>
        </div>
        
        <div className="flex justify-center space-x-2 mb-10 flex-wrap gap-2">
          {(allServices.length > 0 ? allServices : [
            { name: 'Notary Services', id: 0 },
            { name: 'Document Translation', id: 1 },
            { name: 'Legal Assistance', id: 2 }
          ]).map((service, index) => (
            <button 
              key={service.id || index}
              onClick={() => setActiveTab(index)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                activeTab === index 
                  ? "bg-blue-600 text-white" 
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              {service.name}
            </button>
          ))}
        </div>

        {/* Service Steps Section */}
        <div className="mt-8">
          <div className="text-center mb-8">
            <h3 className="text-2xl font-bold mb-4 text-gray-900">
              How it works
            </h3>
            <p className="text-gray-600">
              Simple steps to get your documents processed quickly and securely
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-blue-600 font-bold text-lg">1</span>
              </div>
              <div className="p-4 bg-gray-50 rounded-lg">
                <h4 className="font-bold text-lg mb-2 text-gray-900">Upload Document</h4>
                <p className="text-gray-600 text-sm">
                  Upload your document securely through our platform. We support multiple file formats.
                </p>
              </div>
            </div>
            
            <div className="text-center">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-blue-600 font-bold text-lg">2</span>
              </div>
              <div className="p-4 bg-gray-50 rounded-lg">
                <h4 className="font-bold text-lg mb-2 text-gray-900">Cost Estimation</h4>
                <p className="text-gray-600 text-sm">
                  Get an instant cost estimate based on your document type and service requirements.
                </p>
              </div>
            </div>
            
            <div className="text-center">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-blue-600 font-bold text-lg">3</span>
              </div>
              <div className="p-4 bg-gray-50 rounded-lg">
                <h4 className="font-bold text-lg mb-2 text-gray-900">Pay 20% Advance</h4>
                <p className="text-gray-600 text-sm">
                  Make a 20% advance payment to initiate the processing of your document.
                </p>
              </div>
            </div>
            
            <div className="text-center">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-green-600 font-bold text-lg">4</span>
              </div>
              <div className="p-4 bg-gray-50 rounded-lg">
                <h4 className="font-bold text-lg mb-2 text-gray-900">Get Completed</h4>
                <p className="text-gray-600 text-sm">
                  Receive your processed document and complete the remaining payment upon satisfaction.
                </p>
              </div>
            </div>
          </div>
          
          <div className="text-center mt-8">
            <div className="inline-flex items-center space-x-4 text-sm text-gray-600">
              <div className="flex items-center">
                <Clock className="w-4 h-4 mr-1 text-blue-600" />
                <span>Processing: 1-3 business days</span>
              </div>
              <div className="flex items-center">
                <Shield className="w-4 h-4 mr-1 text-green-600" />
                <span>100% Secure & Confidential</span>
              </div>
              <div className="flex items-center">
                <Check className="w-4 h-4 mr-1 text-purple-600" />
                <span>Money-back guarantee</span>
              </div>
            </div>
          </div>
        </div>


      </section>

      {/* Simplified Developer Section */}
      <section className="container mx-auto px-4 py-12 bg-gray-50 rounded-xl my-8 reveal">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
          <div>
            <h2 className="text-3xl font-bold mb-4 text-gray-900">
              Development by passionate experts
            </h2>
            <p className="text-gray-600 mb-6">
              Our team of dedicated developers ensures the platform is secure, reliable, and intuitive, providing the best possible experience for our users.
            </p>
            <button className="bg-blue-600 text-white px-6 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors">
              Get started
            </button>
          </div>
          <div className="bg-white p-6 rounded-xl border border-gray-200">
            <div className="flex justify-between items-center mb-6">
              <div className="flex items-center">
                <div className="w-8 h-8 bg-blue-600 rounded-full mr-2"></div>
                <h4 className="font-bold">Development Metrics</h4>
              </div>
            </div>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-sm text-gray-600">System Reliability</span>
                  <span className="text-sm font-medium">99.9%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-1.5">
                  <div className="bg-blue-600 h-1.5 rounded-full w-[99.9%]"></div>
                </div>
              </div>
              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-sm text-gray-600">Response Time</span>
                  <span className="text-sm font-medium">280ms</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-1.5">
                  <div className="bg-green-600 h-1.5 rounded-full w-[85%]"></div>
                </div>
              </div>
              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-sm text-gray-600">Code Quality</span>
                  <span className="text-sm font-medium">A+</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-1.5">
                  <div className="bg-purple-600 h-1.5 rounded-full w-[95%]"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section id="customers" className="container mx-auto px-4 py-12 reveal">
        <div className="text-center max-w-2xl mx-auto mb-8">
          {homepageLoading ? (
            <div className="animate-pulse">
              <div className="h-8 bg-gray-200 rounded w-64 mx-auto mb-4"></div>
              <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
              <div className="h-4 bg-gray-200 rounded w-3/4 mx-auto"></div>
            </div>
          ) : (
            <>
              <h2 className="text-3xl font-bold mb-4 text-gray-900">
                {testimonialsContent.title}
              </h2>
              <p className="text-gray-600">
                {testimonialsContent.description}
              </p>
            </>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 reveal">
          {homepageLoading ? (
            // Loading placeholders
            [1, 2, 3].map((index) => (
              <div key={index} className="bg-white p-5 rounded-xl border border-gray-200 animate-pulse">
                <div className="flex items-center mb-4">
                  <div className="w-9 h-9 bg-gray-200 rounded-lg mr-3"></div>
                  <div className="flex-1">
                    <div className="flex space-x-1">
                      {[1, 2, 3, 4, 5].map(star => (
                        <div key={star} className="w-4 h-4 bg-gray-200 rounded"></div>
                      ))}
                    </div>
                  </div>
                </div>
                <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
                <div className="border-t border-gray-100 pt-3">
                  <div className="h-4 bg-gray-200 rounded w-24 mb-1"></div>
                  <div className="h-3 bg-gray-200 rounded w-32"></div>
                </div>
              </div>
            ))
          ) : (
            testimonialsContent.testimonials.filter(testimonial => testimonial.is_active !== false).map((testimonial, index) => (
            <div key={testimonial.id || index} className="bg-white p-5 rounded-xl border border-gray-200 hover:shadow-md transition-all">
              <div className="flex items-center mb-4">
                <div className="p-2 bg-blue-50 rounded-lg mr-3 flex-shrink-0">
                  <svg className="w-5 h-5 text-blue-600" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z" />
                  </svg>
                </div>
                <div className="flex items-center">
                  {[1, 2, 3, 4, 5].map(star => (
                    <svg key={star} className="w-4 h-4 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>
              </div>
              <p className="text-gray-600 text-sm mb-4">
                "{testimonial.testimonial}"
              </p>
              <div className="border-t border-gray-100 pt-3">
                <h4 className="font-bold text-sm text-gray-900">{testimonial.name}</h4>
                <p className="text-blue-600 text-xs">{testimonial.role}, {testimonial.company}</p>
              </div>
            </div>
            ))
          )}
        </div>
      </section>

      {/* Call to Action Section */}
      <section id="pricing" className="container mx-auto px-4 py-12 my-8 reveal">
        <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-8 border border-gray-200">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
            <div>
              {homepageLoading ? (
                <div className="animate-pulse">
                  <div className="h-8 bg-gray-200 rounded w-3/4 mb-4"></div>
                  <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded w-5/6 mb-6"></div>
                  <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-3 mb-6">
                    <div className="h-10 bg-gray-200 rounded w-full sm:w-64"></div>
                    <div className="h-10 bg-gray-200 rounded w-32"></div>
                  </div>
                  <div className="h-4 bg-gray-200 rounded w-48"></div>
                </div>
              ) : (
                <>
                  <h2 className="text-3xl font-bold mb-4 text-gray-900">
                    {ctaContent.title}
                  </h2>
                  <p className="text-gray-600 text-sm mb-6">
                    {ctaContent.description}
                  </p>
                  
                  <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-3">
                    {!isLoggedIn ? (
                      <>
                        <button 
                          onClick={() => navigate('/auth/sign-up')}
                          className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-lg text-sm font-medium transition-colors flex items-center justify-center"
                        >
                          {ctaContent.primary_button_text}
                          <ArrowRight className="ml-2 w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => navigate('/auth/sign-in')}
                          className="border border-blue-600 text-blue-600 hover:bg-blue-50 px-6 py-2.5 rounded-lg text-sm font-medium transition-colors"
                        >
                          Sign In
                        </button>
                      </>
                    ) : (
                      <>
                        <input
                          type="email"
                          placeholder={ctaContent.email_placeholder}
                          className="bg-white px-4 py-2.5 rounded-lg border border-gray-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-sm"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                        />
                        <button className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-lg text-sm font-medium transition-colors flex items-center justify-center">
                          {ctaContent.primary_button_text}
                          <ArrowRight className="ml-2 w-4 h-4" />
                        </button>
                      </>
                    )}
                  </div>
                  
                  <div className="mt-6">
                    <p className="text-blue-600 text-sm font-medium">{ctaContent.statistics_text}</p>
                  </div>
                </>
              )}
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white p-4 rounded-xl border border-gray-200">
                <div className="flex items-center mb-2">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-2">
                    <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                    </svg>
                  </div>
                  <div>
                    <h4 className="text-lg font-bold text-gray-900">98%</h4>
                    <p className="text-gray-500 text-xs">Satisfaction</p>
                  </div>
                </div>
              </div>
              
              <div className="bg-white p-4 rounded-xl border border-gray-200">
                <div className="flex items-center mb-2">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-2">
                    <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                    </svg>
                  </div>
                  <div>
                    <h4 className="text-lg font-bold text-gray-900">4x</h4>
                    <p className="text-gray-500 text-xs">Faster</p>
                  </div>
                </div>
              </div>
              
              <div className="bg-white p-4 rounded-xl border border-gray-200">
                <div className="flex items-center mb-2">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-2">
                    <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z"></path>
                    </svg>
                  </div>
                  <div>
                    <h4 className="text-lg font-bold text-gray-900">40%</h4>
                    <p className="text-gray-500 text-xs">Cost saved</p>
                  </div>
                </div>
              </div>
              
              <div className="bg-white p-4 rounded-xl border border-gray-200">
                <div className="flex items-center mb-2">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-2">
                    <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3"></path>
                    </svg>
                  </div>
                  <div>
                    <h4 className="text-lg font-bold text-gray-900">100%</h4>
                    <p className="text-gray-500 text-xs">Compliant</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="container mx-auto px-4 py-8 border-t border-gray-200 mt-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="md:col-span-1">
            <div className="flex items-center space-x-2 mb-4">
              <svg className="w-6 h-6 text-blue-600" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2L2 19h20L12 2zm0 3l7 14H5l7-14z"/>
              </svg>
              <span className="text-xl font-bold text-gray-900">Sajilo Notary</span>
            </div>
            <p className="text-gray-600 text-sm mb-4">
              Secure, efficient notarization services for businesses and individuals.
            </p>
            <div className="flex space-x-3">
              {['twitter', 'facebook', 'linkedin'].map(social => (
                <a key={social} href="#" className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center hover:bg-blue-50 hover:text-blue-600 transition-colors">
                  <span className="sr-only">{social}</span>
                  <svg className="w-4 h-4 text-gray-600" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2C6.477 2 2 6.477 2 12s4.477 10 10 10 10-4.477 10-10S17.523 2 12 2zm0 18c-4.411 0-8-3.589-8-8s3.589-8 8-8 8 3.589 8 8-3.589 8-8 8z" />
                  </svg>
                </a>
              ))}
            </div>
          </div>
          
          <div>
            <h4 className="font-semibold text-base mb-3 text-gray-900">Product</h4>
            <ul className="space-y-2">
              {['Features', 'Pricing', 'Security', 'API'].map(item => (
                <li key={item}><a href="#" className="text-gray-600 hover:text-blue-600 transition-colors text-sm">{item}</a></li>
              ))}
            </ul>
          </div>
          
          <div>
            <h4 className="font-semibold text-base mb-3 text-gray-900">Company</h4>
            <ul className="space-y-2">
              {['About', 'Customers', 'Contact', 'Legal'].map(item => (
                <li key={item}><a href="#" className="text-gray-600 hover:text-blue-600 transition-colors text-sm">{item}</a></li>
              ))}
            </ul>
          </div>
          
          <div>
            <h4 className="font-semibold text-base mb-3 text-gray-900">Resources</h4>
            <ul className="space-y-2">
              {['Blog', 'Help Center', 'Guides', 'Support'].map(item => (
                <li key={item}><a href="#" className="text-gray-600 hover:text-blue-600 transition-colors text-sm">{item}</a></li>
              ))}
            </ul>
          </div>
        </div>
        
        <div className="border-t border-gray-200 pt-4 flex flex-col md:flex-row justify-between items-center">
          <p className="text-gray-500 text-xs">&copy; {new Date().getFullYear()} Sajilo Notary. All rights reserved.</p>
          <div className="flex space-x-4 mt-3 md:mt-0">
            <a href="#" className="text-gray-500 hover:text-blue-600 text-xs">Privacy</a>
            <a href="#" className="text-gray-500 hover:text-blue-600 text-xs">Terms</a>
            <a href="#" className="text-gray-500 hover:text-blue-600 text-xs">Cookies</a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;