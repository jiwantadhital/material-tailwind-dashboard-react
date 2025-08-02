import React, { useEffect, useState } from 'react';
import { ChevronRight, Menu, X, Check, ArrowRight, ExternalLink, Shield, Clock, FileText, User, LogOut, MessageSquare, Settings, ChevronDown, Award, Users, Globe, Target, Heart, Zap, Star } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { authService } from '../../services/apiService';

const AboutUs = () => {
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userName, setUserName] = useState('');
  
  // About Us dynamic content states
  const [aboutUsData, setAboutUsData] = useState({
    section: {
      title: 'Our Mission & Vision',
      description: 'We\'re on a mission to make document authentication faster, more secure, and more accessible than ever before.',
      mission_title: 'Our Mission',
      mission_description: 'To provide secure, efficient, and accessible document authentication services.',
      vision_title: 'Our Vision',
      vision_description: 'To become the global standard for digital document authentication.',
      is_active: true
    },
    contact_info: {
      phone_primary: '+1 (555) 123-4567',
      phone_secondary: '+1 (555) 987-6543',
      email_primary: 'info@sajilonotary.com',
      email_secondary: 'support@sajilonotary.com',
      address_line_1: '123 Business Street',
      address_line_2: 'Suite 100',
      city: 'City',
      state: 'State',
      zip_code: '12345',
      country: 'United States',
      office_hours: 'By appointment only',
      is_active: true
    },
    team_members: [],
    core_values: []
  });
  const [aboutUsLoading, setAboutUsLoading] = useState(true);
  const [contactFormData, setContactFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    service_type: '',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [submitError, setSubmitError] = useState('');

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

    // Fetch About Us data
    const fetchAboutUsData = async () => {
      try {
        setAboutUsLoading(true);
        const response = await authService.getAboutUsData();
        if (response.success && response.data) {
          setAboutUsData(response.data);
          
          // Process core values to include icon components
          if (response.data.core_values && response.data.core_values.length > 0) {
            const processedValues = response.data.core_values.map(coreValue => {
              // Map icon names to actual icon components
              const iconMap = {
                'Shield': Shield,
                'Zap': Zap,
                'Heart': Heart,
                'Target': Target,
                'Star': Star,
                'Users': Users,
                'Globe': Globe,
                'Award': Award,
                'Clock': Clock,
                'FileText': FileText
              };
              
              return {
                icon: iconMap[coreValue.icon_name] || Shield,
                title: coreValue.title,
                description: coreValue.description
              };
            });
            setValues(processedValues);
          }
        }
      } catch (error) {
        console.error('Error fetching about us data:', error);
        // Keep default content if API call fails
      } finally {
        setAboutUsLoading(false);
      }
    };

    fetchAboutUsData();

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

  const handleContactFormSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitError('');
    
    try {
      const response = await authService.submitContactForm(contactFormData);
      if (response.success) {
        setSubmitSuccess(true);
        setContactFormData({
          first_name: '',
          last_name: '',
          email: '',
          phone: '',
          service_type: '',
          message: ''
        });
        // Reset success message after 5 seconds
        setTimeout(() => setSubmitSuccess(false), 5000);
      }
    } catch (error) {
      setSubmitError(error.message || 'Failed to submit form. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleContactFormChange = (e) => {
    const { name, value } = e.target;
    setContactFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };



  // Dynamic core values - will be populated from API
  const [values, setValues] = useState([
    {
      icon: Shield,
      title: 'Security First',
      description: 'We prioritize the security and confidentiality of your documents with enterprise-grade encryption and compliance standards.'
    },
    {
      icon: Zap,
      title: 'Speed & Efficiency',
      description: 'Our streamlined processes ensure your documents are processed quickly without compromising quality or security.'
    },
    {
      icon: Heart,
      title: 'Customer Focused',
      description: 'Every decision we make is centered around providing the best possible experience for our customers.'
    },
    {
      icon: Target,
      title: 'Reliability',
      description: 'You can count on us to deliver consistent, high-quality results every time, no matter the complexity.'
    }
  ]);





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
          <a 
            onClick={() => navigate('/about')} 
            className="text-blue-600 font-medium text-sm cursor-pointer"
          >About Us</a>
        
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
              <a 
                onClick={() => {
                  navigate('/about');
                  setIsMenuOpen(false);
                }} 
                className="text-blue-600 font-medium py-2 text-sm cursor-pointer"
              >About Us</a>
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

      {/* Mission & Vision Section - Dynamic */}
      <section className="py-16 bg-gradient-to-br from-purple-50 via-white to-blue-50 reveal relative overflow-hidden">
        <div className="absolute inset-0 opacity-30">
          <div className="absolute top-10 left-10 w-32 h-32 bg-purple-200 rounded-full blur-3xl"></div>
          <div className="absolute bottom-10 right-10 w-40 h-40 bg-blue-200 rounded-full blur-3xl"></div>
        </div>
        
        <div className="container mx-auto px-4 relative z-10">
          <div className="text-center mb-12">
            <div className="text-sm font-semibold text-blue-600 mb-4 flex items-center justify-center">
              <Shield className="w-4 h-4 text-blue-600 mr-2" />
              ABOUT SAJILO NOTARY
            </div>
            {aboutUsLoading ? (
              <div className="animate-pulse">
                <div className="h-12 bg-gray-200 rounded w-96 mx-auto mb-6"></div>
                <div className="h-4 bg-gray-200 rounded w-full mb-4"></div>
                <div className="h-4 bg-gray-200 rounded w-3/4 mx-auto"></div>
              </div>
            ) : (
              <>
                <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight text-gray-900">
                  {aboutUsData.section?.title || 'Our Mission & Vision'}
                </h1>
                <p className="text-gray-600 text-lg max-w-3xl mx-auto leading-relaxed">
                  {aboutUsData.section?.description || 'We\'re on a mission to make document authentication faster, more secure, and more accessible than ever before.'}
                </p>
              </>
            )}
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="space-y-6">
                <div>
                  <h3 className="text-2xl font-bold mb-4 text-blue-600">
                    {aboutUsData.section?.mission_title || 'Our Mission'}
                  </h3>
                  <p className="text-gray-600 leading-relaxed text-lg">
                    {aboutUsData.section?.mission_description || 'To provide secure, efficient, and accessible document authentication services.'}
                  </p>
                </div>
                <div>
                  <h3 className="text-2xl font-bold mb-4 text-purple-600">
                    {aboutUsData.section?.vision_title || 'Our Vision'}
                  </h3>
                  <p className="text-gray-600 leading-relaxed text-lg">
                    {aboutUsData.section?.vision_description || 'To become the global standard for digital document authentication.'}
                  </p>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-2xl p-8 shadow-xl border border-gray-100">
              <div className="space-y-6">
                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <Target className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <h4 className="font-bold text-lg mb-2">Global Accessibility</h4>
                    <p className="text-gray-600 text-sm">Making notarization services available worldwide through our digital platform.</p>
                  </div>
                </div>
                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <Shield className="w-6 h-6 text-green-600" />
                  </div>
                  <div>
                    <h4 className="font-bold text-lg mb-2">Security Excellence</h4>
                    <p className="text-gray-600 text-sm">Implementing the highest security standards to protect your sensitive documents.</p>
                  </div>
                </div>
                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <Zap className="w-6 h-6 text-purple-600" />
                  </div>
                  <div>
                    <h4 className="font-bold text-lg mb-2">Innovation Driven</h4>
                    <p className="text-gray-600 text-sm">Continuously improving our technology to provide the best user experience.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <div className="text-center mt-12">
            <button 
              onClick={() => navigate('/all-services')}
              className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-lg text-base font-medium transition-colors shadow-lg hover:shadow-xl"
            >
              Explore Our Services <ArrowRight className="ml-2 w-5 h-5 inline-block" />
            </button>
          </div>
        </div>
      </section>



      {/* Get in Touch Section - Improved */}
      <section id="contact" className="py-20 bg-gradient-to-br from-blue-50 via-white to-purple-50 reveal relative overflow-hidden">
        {/* Background decorative elements */}
        <div className="absolute inset-0 opacity-30">
          <div className="absolute top-10 left-10 w-32 h-32 bg-blue-200 rounded-full blur-3xl"></div>
          <div className="absolute bottom-10 right-10 w-40 h-40 bg-purple-200 rounded-full blur-3xl"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-60 h-60 bg-indigo-100 rounded-full blur-3xl"></div>
        </div>
        
        <div className="container mx-auto px-4 relative z-10">
          <div className="text-center mb-16">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-6">
              <MessageSquare className="w-8 h-8 text-blue-600" />
            </div>
            <h2 className="text-4xl md:text-5xl font-bold mb-6 text-gray-900">
              Let's Start Your Project
            </h2>
            <p className="text-gray-600 max-w-3xl mx-auto text-lg leading-relaxed">
              Ready to get your documents authenticated? Our expert team is here to guide you through every step of the process. 
              Get in touch today and experience the future of secure document processing.
            </p>
          </div>
          
          <div className="max-w-6xl mx-auto">
            {/* Main Contact Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-16">
              {/* Contact Information */}
              <div className="space-y-8">
                <div>
                  <h3 className="text-2xl font-bold mb-6 text-gray-900">Contact Information</h3>
                  <p className="text-gray-600 mb-8">
                    Choose the most convenient way to reach us. We're here to help with all your document authentication needs.
                  </p>
                </div>
                
                <div className="space-y-6">
                  {/* Phone */}
                  <div className="flex items-start space-x-4 p-6 bg-white rounded-xl shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300">
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center flex-shrink-0">
                      <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                      </svg>
                    </div>
                    <div>
                      <h4 className="text-lg font-bold text-gray-900 mb-2">Phone Support</h4>
                      <p className="text-blue-600 text-lg font-semibold mb-1">{aboutUsData.contact_info?.phone_primary || '+1 (555) 123-4567'}</p>
                      {aboutUsData.contact_info?.phone_secondary && (
                        <p className="text-blue-600 text-lg font-semibold mb-2">{aboutUsData.contact_info.phone_secondary}</p>
                      )}
                      <p className="text-gray-600 text-sm">Available 24/7 for urgent matters</p>
                    </div>
                  </div>
                  
                  {/* Email */}
                  <div className="flex items-start space-x-4 p-6 bg-white rounded-xl shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300">
                    <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-green-600 rounded-full flex items-center justify-center flex-shrink-0">
                      <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <div>
                      <h4 className="text-lg font-bold text-gray-900 mb-2">Email Support</h4>
                      <p className="text-green-600 text-lg font-semibold mb-1">{aboutUsData.contact_info?.email_primary || 'info@sajilonotary.com'}</p>
                      {aboutUsData.contact_info?.email_secondary && (
                        <p className="text-green-600 text-lg font-semibold mb-2">{aboutUsData.contact_info.email_secondary}</p>
                      )}
                      <p className="text-gray-600 text-sm">We'll respond within 24 hours</p>
                    </div>
                  </div>
                  
                  {/* Address */}
                  <div className="flex items-start space-x-4 p-6 bg-white rounded-xl shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300">
                    <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-full flex items-center justify-center flex-shrink-0">
                      <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                    </div>
                    <div>
                      <h4 className="text-lg font-bold text-gray-900 mb-2">Office Location</h4>
                      <p className="text-gray-700 text-base mb-1">{aboutUsData.contact_info?.address_line_1 || '123 Business Street'}</p>
                      <p className="text-gray-700 text-base mb-2">
                        {aboutUsData.contact_info?.address_line_2 && `${aboutUsData.contact_info.address_line_2}, `}
                        {aboutUsData.contact_info?.city || 'City'}, {aboutUsData.contact_info?.state || 'State'} {aboutUsData.contact_info?.zip_code || '12345'}
                      </p>
                      <p className="text-gray-600 text-sm">{aboutUsData.contact_info?.office_hours || 'By appointment only'}</p>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Quick Contact Form */}
              <div className="bg-white rounded-2xl p-8 shadow-xl border border-gray-100">
                <h3 className="text-2xl font-bold mb-6 text-gray-900">Send us a Message</h3>
                <p className="text-gray-600 mb-8">
                  Fill out the form below and we'll get back to you as soon as possible.
                </p>
                
                {submitSuccess && (
                  <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg">
                    <p className="text-green-800 font-medium">Thank you! Your message has been sent successfully. We'll get back to you soon.</p>
                  </div>
                )}
                
                {submitError && (
                  <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                    <p className="text-red-800 font-medium">{submitError}</p>
                  </div>
                )}
                
                <form onSubmit={handleContactFormSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">First Name</label>
                      <input 
                        type="text" 
                        name="first_name"
                        value={contactFormData.first_name}
                        onChange={handleContactFormChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                        placeholder="Your first name"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Last Name</label>
                      <input 
                        type="text" 
                        name="last_name"
                        value={contactFormData.last_name}
                        onChange={handleContactFormChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                        placeholder="Your last name"
                        required
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
                    <input 
                      type="email" 
                      name="email"
                      value={contactFormData.email}
                      onChange={handleContactFormChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                      placeholder="your.email@example.com"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number</label>
                    <input 
                      type="tel" 
                      name="phone"
                      value={contactFormData.phone}
                      onChange={handleContactFormChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                      placeholder="+1 (555) 123-4567"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Service Type</label>
                    <select 
                      name="service_type"
                      value={contactFormData.service_type}
                      onChange={handleContactFormChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                    >
                      <option value="">Select a service</option>
                      <option value="notary">Document Notarization</option>
                      <option value="translation">Document Translation</option>
                      <option value="sop">Statement of Purpose</option>
                      <option value="other">Other Services</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Message</label>
                    <textarea 
                      name="message"
                      value={contactFormData.message}
                      onChange={handleContactFormChange}
                      rows="4"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors resize-none"
                      placeholder="Tell us about your project requirements..."
                      required
                    ></textarea>
                  </div>
                  
                  <button 
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white py-4 rounded-lg font-semibold transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSubmitting ? 'Sending...' : 'Send Message'}
                  </button>
                </form>
              </div>
            </div>
            
            {/* Urgent Assistance Banner */}
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-8 text-white text-center">
              <div className="max-w-3xl mx-auto">
                <h3 className="text-2xl font-bold mb-4">Need Immediate Assistance?</h3>
                <p className="text-lg mb-6 text-blue-100">
                  For urgent document authentication needs, our team is available around the clock. 
                  Don't hesitate to reach out - we're here to help you get your documents processed quickly and securely.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <button className="bg-white text-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5">
                    Call Now: +1 (555) 123-4567
                  </button>
                  <button className="border-2 border-white text-white px-8 py-3 rounded-lg font-semibold hover:bg-white hover:text-blue-600 transition-all duration-300">
                    Send Urgent Email
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>



      {/* Values Section */}
      <section className="container mx-auto px-4 py-16 reveal">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold mb-4 text-gray-900">
            Our Core Values
          </h2>
          <p className="text-gray-600 text-lg max-w-2xl mx-auto">
            These principles guide everything we do and shape how we serve our customers
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {values.map((value, index) => (
            <div key={index} className="bg-white p-6 rounded-xl border border-gray-200 hover:border-blue-500/20 transition-all duration-300 hover:shadow-xl shadow-lg group">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-50 to-blue-100 rounded-full flex items-center justify-center mb-6 group-hover:from-blue-100 group-hover:to-blue-200 transition-colors">
                <value.icon className="w-8 h-8 text-blue-600" />
              </div>
              <h3 className="text-xl font-bold mb-3 text-gray-900">{value.title}</h3>
              <p className="text-gray-600 text-sm leading-relaxed">{value.description}</p>
            </div>
          ))}
        </div>
      </section>



      {/* Team Section */}
      <section className="container mx-auto px-4 py-16 reveal">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold mb-4 text-gray-900">
            Meet Our Leadership Team
          </h2>
          <p className="text-gray-600 text-lg max-w-2xl mx-auto">
            The passionate individuals driving innovation and growth at Sajilo Notary
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {aboutUsLoading ? (
            // Loading placeholders
            [1, 2, 3, 4].map((index) => (
              <div key={index} className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden animate-pulse">
                <div className="w-full h-48 bg-gray-200"></div>
                <div className="p-6">
                  <div className="h-6 bg-gray-200 rounded w-3/4 mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/2 mb-3"></div>
                  <div className="h-4 bg-gray-200 rounded w-full mb-1"></div>
                  <div className="h-4 bg-gray-200 rounded w-5/6"></div>
                </div>
              </div>
            ))
          ) : aboutUsData.team_members && aboutUsData.team_members.length > 0 ? (
            aboutUsData.team_members.filter(member => member.is_active !== false).map((member, index) => (
              <div key={member.id || index} className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden hover:shadow-xl transition-shadow duration-300 group">
                <div className="relative overflow-hidden">
                  <img 
                    src={member.image_url || '/img/team-1.jpeg'} 
                    alt={member.name}
                    className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                </div>
                <div className="p-6">
                  <h3 className="text-xl font-bold mb-1 text-gray-900">{member.name}</h3>
                  <p className="text-blue-600 font-medium mb-3">{member.role}</p>
                  <p className="text-gray-600 text-sm leading-relaxed">{member.bio}</p>
                </div>
              </div>
            ))
          ) : (
            // Default team members if none exist
            [
              {
                name: 'Sarah Johnson',
                role: 'CEO & Founder',
                image_url: '/img/team-1.jpeg',
                bio: 'Former legal professional with 15+ years experience in document authentication and digital transformation.'
              },
              {
                name: 'Michael Chen',
                role: 'CTO',
                image_url: '/img/team-2.jpeg',
                bio: 'Technology leader with expertise in building secure, scalable platforms for legal services.'
              },
              {
                name: 'Emily Rodriguez',
                role: 'Head of Operations',
                image_url: '/img/team-3.jpeg',
                bio: 'Operations specialist focused on delivering exceptional customer experiences and process optimization.'
              },
              {
                name: 'David Kim',
                role: 'Legal Director',
                image_url: '/img/team-4.jpeg',
                bio: 'Legal expert ensuring all our services meet the highest standards of compliance and regulatory requirements.'
              }
            ].map((member, index) => (
              <div key={index} className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden hover:shadow-xl transition-shadow duration-300 group">
                <div className="relative overflow-hidden">
                  <img 
                    src={member.image_url} 
                    alt={member.name}
                    className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                </div>
                <div className="p-6">
                  <h3 className="text-xl font-bold mb-1 text-gray-900">{member.name}</h3>
                  <p className="text-blue-600 font-medium mb-3">{member.role}</p>
                  <p className="text-gray-600 text-sm leading-relaxed">{member.bio}</p>
                </div>
              </div>
            ))
          )}
        </div>
      </section>



      {/* CTA Section */}
      <section className="py-16 bg-gradient-to-br from-blue-600 to-purple-600 text-white reveal relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-10 left-10 w-32 h-32 bg-white rounded-full blur-3xl"></div>
          <div className="absolute bottom-10 right-10 w-40 h-40 bg-white rounded-full blur-3xl"></div>
        </div>
        
        <div className="container mx-auto px-4 relative z-10 text-center">
          <h2 className="text-4xl font-bold mb-6">
            Ready to Experience the Future of Document Authentication?
          </h2>
          <p className="text-xl mb-8 text-white/90 max-w-2xl mx-auto">
            Join thousands of businesses and individuals who trust Sajilo Notary for their document authentication needs.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button 
              onClick={() => navigate('/auth/sign-up')}
              className="bg-white text-blue-600 px-8 py-4 rounded-lg text-base font-medium hover:bg-gray-100 transition-colors shadow-lg hover:shadow-xl"
            >
              Get Started Today
            </button>
            <button 
              onClick={() => navigate('/all-services')}
              className="border-2 border-white text-white px-8 py-4 rounded-lg text-base font-medium hover:bg-white hover:text-blue-600 transition-colors"
            >
              View Our Services
            </button>
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

export default AboutUs; 