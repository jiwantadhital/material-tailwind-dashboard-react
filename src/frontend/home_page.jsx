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
        return <FileText className="w-5 h-5 text-blue-600" />;
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
        return <Shield className="w-5 h-5 text-blue-600" />;
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
                        description: service.short_description,
        slug: service.code,
        code: service.code,
        price_range: service.price_range,
        image_url: service.image_url
      }))
    : defaultServices;

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-100 text-gray-800">
      {/* Navigation */}
      <nav className="container mx-auto px-4 py-3 flex justify-between items-center backdrop-blur-md bg-white/80 sticky top-0 z-50 border-b border-gray-200 shadow-sm">
        <div className="flex items-center space-x-2">
          <img src="/img/nlogo.png" alt="Logo" className="h-10 w-10 object-contain" />
          <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-purple-600">Sajilo Notary</span>
        </div>
        
        {/* Desktop Menu */}
        <div className="hidden md:flex items-center space-x-8">
          <a 
            onClick={() => navigate('/all-services')} 
            className="text-gray-600 hover:text-blue-600 transition-colors text-sm cursor-pointer"
          >Our Services</a>
        
          {isLoggedIn && (
            <a 
              onClick={() => navigate('/documents')} 
              className="text-gray-600 hover:text-blue-600 transition-colors text-sm cursor-pointer"
            >
              My Documents
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
              <a href="#customers" className="text-gray-600 hover:text-blue-600 transition-colors py-2 text-sm cursor-pointer">Testimonials</a>
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
      <section className="container mx-auto px-4 py-12 md:py-16 text-center reveal relative overflow-hidden">
        {/* Decorative background elements */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-purple-50 to-blue-50 opacity-50 rounded-3xl"></div>
        <div className="absolute top-10 left-10 w-20 h-20 bg-blue-200 rounded-full opacity-20 animate-pulse"></div>
        <div className="absolute bottom-10 right-10 w-32 h-32 bg-purple-200 rounded-full opacity-20 animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/4 w-16 h-16 bg-gradient-to-r from-blue-300 to-purple-300 rounded-full opacity-30 animate-bounce"></div>
        
        <div className="max-w-4xl mx-auto relative z-10">
          {homepageLoading ? (
            <div className="animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-64 mx-auto mb-4"></div>
              <div className="h-12 bg-gray-200 rounded w-full mb-4"></div>
              <div className="h-4 bg-gray-200 rounded w-3/4 mx-auto mb-6"></div>
            </div>
          ) : (
            <>
              <div className="text-sm font-semibold text-blue-600 mb-4 flex items-center justify-center">
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
              <p className="text-gray-600 text-base mb-6 max-w-2xl mx-auto">
                {heroContent.description}
              </p>
            </>
          )}
          
          {!homepageLoading && (
            <div className="flex justify-center">
              <button 
                onClick={() => !isLoggedIn ? navigate('/auth/sign-up') : navigate('/all-services')}
                className="bg-blue-600 hover:bg-blue-700 text-white px-12 py-4 rounded-lg text-base font-medium transition-colors shadow-lg hover:shadow-xl min-w-[280px]"
              >
                {heroContent.primary_button_text} <ArrowRight className="ml-2 w-5 h-5 inline-block" />
              </button>
            </div>
          )}
        </div>
      </section>

      {/* Statistics Section */}
      <section className="container mx-auto px-4 py-6 reveal">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
          <div>
            <h3 className="text-2xl font-bold text-blue-600 mb-1">10,000+</h3>
            <p className="text-gray-600 text-sm">Documents Processed</p>
          </div>
          <div>
            <h3 className="text-2xl font-bold text-blue-600 mb-1">95%</h3>
            <p className="text-gray-600 text-sm">Success Rate</p>
          </div>
          <div>
            <h3 className="text-2xl font-bold text-blue-600 mb-1">50+</h3>
            <p className="text-gray-600 text-sm">Countries</p>
          </div>
          <div>
            <h3 className="text-2xl font-bold text-blue-600 mb-1">24/7</h3>
            <p className="text-gray-600 text-sm">Customer Support</p>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section id="services" className="py-10 reveal relative">
        {/* Pattern background */}
        <div className="absolute inset-0 bg-gradient-to-r from-gray-50 to-blue-50 opacity-60"></div>
        <div className="absolute inset-0" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%236366f1' fill-opacity='0.05'%3E%3Ccircle cx='7' cy='7' r='5'/%3E%3Ccircle cx='53' cy='53' r='5'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }}></div>
        
        <div className="container mx-auto px-4 relative z-10">
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
                <div key={index} className="bg-white p-6 rounded-xl border border-gray-200 animate-pulse shadow-lg">
                  <div className="flex items-center justify-between mb-4">
                    <div className="h-5 bg-gray-200 rounded w-32"></div>
                    <div className="p-3 bg-gray-200 rounded-lg w-14 h-14"></div>
                  </div>
                  <div className="h-10 bg-gray-200 rounded mb-4"></div>
                  <div className="h-10 bg-gray-200 rounded"></div>
                </div>
              ))
            ) : (
              servicesToDisplay.slice(0, 3).map((service, index) => (
                <div key={index} className="bg-white p-6 rounded-xl border border-gray-200 hover:border-blue-500/20 transition-all duration-300 hover:shadow-xl shadow-lg relative overflow-hidden group">
                  {/* Card gradient overlay */}
                  <div className="absolute inset-0 bg-gradient-to-br from-blue-50/50 to-purple-50/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  
                  <div className="relative z-10">
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
                    <p className="text-gray-600 text-sm mb-4">
                      {service.description}
                    </p>
                    <button 
                      onClick={() => navigate(`/services/${service.id}`)}
                      className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white py-2.5 rounded-lg text-sm font-medium transition-all duration-300 shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
                    >
                      Apply Now
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
          <div className="text-center mt-6">
            <button 
              onClick={() => navigate('/all-services')}
              className="inline-flex items-center bg-white border-2 border-blue-600 text-blue-600 px-6 py-2 rounded-lg text-sm font-medium hover:bg-blue-50 transition-colors shadow-md hover:shadow-lg"
            >
              View All Services <ChevronRight className="ml-1 w-4 h-4" />
            </button>
          </div>
        </div>
      </section>

      {/* Features Highlights Section */}
      <section id="features" className="container mx-auto px-4 py-8 reveal">
        <div>
          <div className="text-center max-w-2xl mx-auto mb-6">
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
                <div key={index} className="flex p-4 rounded-xl bg-white border border-gray-200 animate-pulse shadow-md">
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
                <div key={feature.id || index} className="flex p-4 rounded-lg bg-white border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
                  <div className="p-2 bg-blue-100 rounded-lg mr-3 h-fit">
                    {getFeatureIcon(feature.icon_type)}
                  </div>
                  <div>
                    <h3 className="text-lg font-bold mb-2">{feature.title}</h3>
                    <p className="text-gray-600 text-sm">
                      {feature.description}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-10 my-6 reveal relative overflow-hidden">
        {/* Gradient background with geometric shapes */}
        <div className="absolute inset-0 bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-50"></div>
        <div className="absolute top-0 left-0 w-full h-full opacity-30">
          <div className="absolute top-10 left-10 w-24 h-24 bg-blue-300 rounded-full blur-xl"></div>
          <div className="absolute bottom-10 right-10 w-32 h-32 bg-purple-300 rounded-full blur-xl"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-40 h-40 bg-indigo-200 rounded-full blur-2xl"></div>
        </div>
        
        <div className="container mx-auto px-4 relative z-10">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold mb-4 text-gray-900">
              How It Works
            </h2>
            <p className="text-gray-600">
              Simple steps to get your documents processed quickly and securely
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="text-center group">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg group-hover:shadow-xl transition-shadow duration-300">
                <span className="text-white font-bold text-lg">1</span>
              </div>
              <div className="bg-white/80 backdrop-blur-sm p-4 rounded-lg shadow-md hover:shadow-lg transition-all duration-300 group-hover:-translate-y-1">
                <h4 className="font-bold text-base mb-2 text-gray-900">Upload Document</h4>
                <p className="text-gray-600 text-sm">
                  Upload your document securely through our platform. We support multiple file formats.
                </p>
              </div>
            </div>
            
            <div className="text-center group">
              <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-green-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg group-hover:shadow-xl transition-shadow duration-300">
                <span className="text-white font-bold text-lg">2</span>
              </div>
              <div className="bg-white/80 backdrop-blur-sm p-4 rounded-lg shadow-md hover:shadow-lg transition-all duration-300 group-hover:-translate-y-1">
                <h4 className="font-bold text-base mb-2 text-gray-900">Cost Estimation</h4>
                <p className="text-gray-600 text-sm">
                  Get an instant cost estimate based on your document type and service requirements.
                </p>
              </div>
            </div>
            
            <div className="text-center group">
              <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg group-hover:shadow-xl transition-shadow duration-300">
                <span className="text-white font-bold text-lg">3</span>
              </div>
              <div className="bg-white/80 backdrop-blur-sm p-4 rounded-lg shadow-md hover:shadow-lg transition-all duration-300 group-hover:-translate-y-1">
                <h4 className="font-bold text-base mb-2 text-gray-900">Pay 20% Advance</h4>
                <p className="text-gray-600 text-sm">
                  Make a 20% advance payment to initiate the processing of your document.
                </p>
              </div>
            </div>
            
            <div className="text-center group">
              <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg group-hover:shadow-xl transition-shadow duration-300">
                <span className="text-white font-bold text-lg">4</span>
              </div>
              <div className="bg-white/80 backdrop-blur-sm p-4 rounded-lg shadow-md hover:shadow-lg transition-all duration-300 group-hover:-translate-y-1">
                <h4 className="font-bold text-base mb-2 text-gray-900">Get Completed</h4>
                <p className="text-gray-600 text-sm">
                  Receive your processed document and complete the remaining payment upon satisfaction.
                </p>
              </div>
            </div>
          </div>
          

        </div>
      </section>

      {/* Success Stories Section */}
      <section id="customers" className="container mx-auto px-4 py-8 reveal">
        <div>
          <div className="text-center max-w-2xl mx-auto mb-8">
            <h2 className="text-3xl font-bold mb-4 text-gray-900">
              {testimonialsContent.title}
            </h2>
            <p className="text-gray-600">
              See what our clients say about how Sajilo Notary has transformed their document workflows.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 reveal">
            {homepageLoading ? (
              // Loading placeholders
              [1, 2, 3].map((index) => (
                <div key={index} className="bg-white p-5 rounded-xl border border-gray-200 animate-pulse shadow-lg">
                  <div className="flex space-x-1 mb-4">
                    {[1, 2, 3, 4, 5].map(star => (
                      <div key={star} className="w-4 h-4 bg-gray-200 rounded"></div>
                    ))}
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
              <div key={testimonial.id || index} className="bg-white p-5 rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex space-x-1 mb-4">
                  {[1, 2, 3, 4, 5].map(star => (
                    <svg key={star} className="w-4 h-4 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>
                <p className="text-gray-600 text-sm mb-4">
                  "{testimonial.testimonial_text}"
                </p>
                <div className="border-t border-gray-100 pt-3">
                  <h4 className="font-bold text-sm">{testimonial.name}</h4>
                  <p className="text-blue-600 text-xs">{testimonial.role}, {testimonial.company}</p>
                </div>
              </div>
              ))
            )}
          </div>
        </div>
      </section>

     

      {/* Call to Action Section */}
      <section id="cta" className="py-8 bg-blue-50 reveal">
        <div className="container mx-auto px-4">
          <div className="bg-white rounded-lg p-6 shadow-md">
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
                            onClick={() => navigate('/auth/sign-in')}
                            className="border-2 border-blue-600 text-blue-600 hover:bg-blue-50 px-6 py-2.5 rounded-lg text-sm font-medium transition-colors backdrop-blur-sm"
                          >
                            Sign In
                          </button>
                        </>
                      ) : (
                        <>
                          <input
                            type="email"
                            placeholder={ctaContent.email_placeholder}
                            className="bg-white/80 backdrop-blur-sm px-4 py-2.5 rounded-lg border border-gray-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-sm shadow-sm"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                          />
                          <button className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-6 py-2.5 rounded-lg text-sm font-medium transition-all duration-300 flex items-center justify-center shadow-lg hover:shadow-xl transform hover:-translate-y-0.5">
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
                <div className="text-center">
                  <h4 className="text-2xl font-bold text-blue-600">98%</h4>
                  <p className="text-gray-600 text-sm">Satisfaction</p>
                </div>
                <div className="text-center">
                  <h4 className="text-2xl font-bold text-blue-600">4x</h4>
                  <p className="text-gray-600 text-sm">Faster</p>
                </div>
                <div className="text-center">
                  <h4 className="text-2xl font-bold text-blue-600">40%</h4>
                  <p className="text-gray-600 text-sm">Cost saved</p>
                </div>
                <div className="text-center">
                  <h4 className="text-2xl font-bold text-blue-600">100%</h4>
                  <p className="text-gray-600 text-sm">Compliant</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-50 py-6 border-t border-gray-200">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
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
                  <a key={social} href="#" className="text-gray-600 hover:text-blue-600">
                    <span className="sr-only">{social}</span>
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 2C6.477 2 2 6.477 2 12s4.477 10 10 10 10-4.477 10-10S17.523 2 12 2zm0 18c-4.411 0-8-3.589-8-8s3.589-8 8-8 8 3.589 8 8-3.589 8-8 8z" />
                    </svg>
                  </a>
                ))}
              </div>
            </div>
            
            <div>
              <h4 className="font-semibold text-base mb-3 text-gray-900">Product</h4>
              <ul className="space-y-2">
                {['Features', 'Security', 'API'].map(item => (
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
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;