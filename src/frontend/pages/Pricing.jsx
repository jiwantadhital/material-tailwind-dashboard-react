import React, { useState, useEffect } from 'react';
import { Check, X, ArrowRight, Shield, Clock, FileText, User, LogOut, Settings, ChevronDown, Menu } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { authService } from '../../services/apiService';

const PricingPage = () => {
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [userName, setUserName] = useState('');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState('professional');
  const [billingCycle, setBillingCycle] = useState('monthly');

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

  const pricingPlans = [
    {
      id: 'basic',
      name: 'Basic',
      description: 'Perfect for individuals with occasional notarization needs',
      monthlyPrice: 29,
      yearlyPrice: 290,
      features: [
        'Up to 5 documents per month',
        'Basic notarization services',
        'Email support',
        'Standard processing (2-3 business days)',
        'Digital certificates',
        'Mobile app access'
      ],
      limitations: [
        'Limited document types',
        'No priority support',
        'No bulk processing'
      ],
      popular: false,
      buttonText: 'Get Started',
      buttonVariant: 'outline'
    },
    {
      id: 'professional',
      name: 'Professional',
      description: 'Ideal for small businesses and professionals',
      monthlyPrice: 79,
      yearlyPrice: 790,
      features: [
        'Up to 50 documents per month',
        'All notarization services',
        'Priority email & phone support',
        'Fast processing (1-2 business days)',
        'Advanced digital certificates',
        'API access',
        'Document templates',
        'Bulk processing',
        'Custom branding'
      ],
      limitations: [
        'Limited integrations'
      ],
      popular: true,
      buttonText: 'Start Free Trial',
      buttonVariant: 'primary'
    },
    {
      id: 'enterprise',
      name: 'Enterprise',
      description: 'For large organizations with high-volume needs',
      monthlyPrice: 199,
      yearlyPrice: 1990,
      features: [
        'Unlimited documents',
        'All premium features',
        'Dedicated account manager',
        'Same-day processing',
        'Premium digital certificates',
        'Full API access',
        'Custom integrations',
        'White-label solution',
        'Advanced analytics',
        'SSO integration',
        'Compliance reporting',
        '24/7 priority support'
      ],
      limitations: [],
      popular: false,
      buttonText: 'Contact Sales',
      buttonVariant: 'outline'
    }
  ];

  const additionalServices = [
    {
      name: 'Document Translation',
      description: 'Professional translation services for your documents',
      price: 'Starting at $25/page',
      features: [
        'Certified translators',
        'Legal document translation',
        'Multiple languages supported',
        'Notarized translations'
      ]
    },
    {
      name: 'Express Processing',
      description: 'Get your documents processed within 24 hours',
      price: '+$20 per document',
      features: [
        'Same-day processing',
        'Priority queue',
        'Guaranteed delivery',
        'Real-time updates'
      ]
    },
    {
      name: 'Legal Consultation',
      description: 'Expert legal advice for your document needs',
      price: '$150/hour',
      features: [
        'Licensed attorneys',
        'Document review',
        'Compliance guidance',
        'Legal opinions'
      ]
    }
  ];

  const faqs = [
    {
      question: 'How does the pricing work?',
      answer: 'Our pricing is based on monthly or annual subscriptions. You can choose the plan that best fits your needs and upgrade or downgrade at any time.'
    },
    {
      question: 'Is there a free trial?',
      answer: 'Yes! We offer a 14-day free trial for the Professional plan. No credit card required to start.'
    },
    {
      question: 'What payment methods do you accept?',
      answer: 'We accept all major credit cards, PayPal, and bank transfers for annual subscriptions.'
    },
    {
      question: 'Can I cancel my subscription anytime?',
      answer: 'Yes, you can cancel your subscription at any time. There are no cancellation fees or long-term contracts.'
    },
    {
      question: 'Do you offer refunds?',
      answer: 'We offer a 30-day money-back guarantee for all paid plans. If you\'re not satisfied, we\'ll refund your payment.'
    },
    {
      question: 'What happens to my documents after cancellation?',
      answer: 'Your documents remain accessible for 90 days after cancellation. You can download them during this period.'
    }
  ];

  const getCurrentPrice = (plan) => {
    return billingCycle === 'monthly' ? plan.monthlyPrice : plan.yearlyPrice;
  };

  const getSavings = (plan) => {
    const monthlyCost = plan.monthlyPrice * 12;
    const yearlyCost = plan.yearlyPrice;
    return monthlyCost - yearlyCost;
  };

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
            onClick={() => navigate('/')} 
            className="text-gray-600 hover:text-blue-600 transition-colors text-sm cursor-pointer"
          >Home</a>
          <a 
            onClick={() => navigate('/all-services')} 
            className="text-gray-600 hover:text-blue-600 transition-colors text-sm cursor-pointer"
          >All Services</a>
          <a href="#pricing" className="text-blue-600 text-sm font-medium">Pricing</a>
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
                  navigate('/');
                  setIsMenuOpen(false);
                }} 
                className="text-gray-600 hover:text-blue-600 transition-colors py-2 text-sm cursor-pointer"
              >Home</a>
              <a 
                onClick={() => {
                  navigate('/all-services');
                  setIsMenuOpen(false);
                }} 
                className="text-gray-600 hover:text-blue-600 transition-colors py-2 text-sm cursor-pointer"
              >All Services</a>
              <a href="#pricing" className="text-blue-600 py-2 text-sm font-medium" onClick={() => setIsMenuOpen(false)}>Pricing</a>
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
      <section className="container mx-auto px-4 py-16 text-center">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight">
            Simple, transparent <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-purple-600">pricing</span>
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            Choose the perfect plan for your notarization needs. No hidden fees, no surprises.
          </p>
          
          {/* Billing Toggle */}
          <div className="flex items-center justify-center space-x-4 mb-12">
            <span className={`text-sm font-medium ${billingCycle === 'monthly' ? 'text-blue-600' : 'text-gray-600'}`}>
              Monthly
            </span>
            <button
              onClick={() => setBillingCycle(billingCycle === 'monthly' ? 'yearly' : 'monthly')}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                billingCycle === 'yearly' ? 'bg-blue-600' : 'bg-gray-200'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  billingCycle === 'yearly' ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
            <span className={`text-sm font-medium ${billingCycle === 'yearly' ? 'text-blue-600' : 'text-gray-600'}`}>
              Yearly
            </span>
            {billingCycle === 'yearly' && (
              <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full font-medium">
                Save up to 20%
              </span>
            )}
          </div>
        </div>
      </section>

      {/* Pricing Plans */}
      <section id="pricing" className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {pricingPlans.map((plan) => (
            <div
              key={plan.id}
              className={`bg-white rounded-2xl border-2 p-8 relative ${
                plan.popular
                  ? 'border-blue-500 shadow-xl scale-105'
                  : 'border-gray-200 hover:border-blue-300'
              } transition-all duration-300`}
            >
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <span className="bg-blue-500 text-white px-4 py-2 rounded-full text-sm font-medium">
                    Most Popular
                  </span>
                </div>
              )}
              
              <div className="text-center mb-6">
                <h3 className="text-2xl font-bold text-gray-900 mb-2">{plan.name}</h3>
                <p className="text-gray-600 text-sm mb-4">{plan.description}</p>
                <div className="mb-4">
                  <span className="text-4xl font-bold text-gray-900">${getCurrentPrice(plan)}</span>
                  <span className="text-gray-600 text-sm">/{billingCycle === 'monthly' ? 'month' : 'year'}</span>
                </div>
                {billingCycle === 'yearly' && (
                  <p className="text-green-600 text-sm font-medium">
                    Save ${getSavings(plan)} annually
                  </p>
                )}
              </div>

              <div className="mb-8">
                <h4 className="font-semibold text-gray-900 mb-3">What's included:</h4>
                <ul className="space-y-2">
                  {plan.features.map((feature, index) => (
                    <li key={index} className="flex items-start">
                      <Check className="w-5 h-5 text-green-600 mr-2 flex-shrink-0 mt-0.5" />
                      <span className="text-gray-700 text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>
                
                {plan.limitations.length > 0 && (
                  <div className="mt-4">
                    <h4 className="font-semibold text-gray-900 mb-2">Limitations:</h4>
                    <ul className="space-y-1">
                      {plan.limitations.map((limitation, index) => (
                        <li key={index} className="flex items-start">
                          <X className="w-4 h-4 text-red-500 mr-2 flex-shrink-0 mt-0.5" />
                          <span className="text-gray-600 text-sm">{limitation}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              <button
                onClick={() => setSelectedPlan(plan.id)}
                className={`w-full py-3 px-6 rounded-lg font-medium transition-all ${
                  plan.buttonVariant === 'primary'
                    ? 'bg-blue-600 text-white hover:bg-blue-700'
                    : 'border-2 border-blue-600 text-blue-600 hover:bg-blue-50'
                }`}
              >
                {plan.buttonText}
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* Additional Services */}
      <section className="container mx-auto px-4 py-16">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <h2 className="text-3xl font-bold mb-4 text-gray-900">Additional Services</h2>
          <p className="text-gray-600">
            Enhance your notarization experience with our premium add-on services
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {additionalServices.map((service, index) => (
            <div key={index} className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-md transition-all">
              <h3 className="text-xl font-bold mb-2 text-gray-900">{service.name}</h3>
              <p className="text-gray-600 text-sm mb-4">{service.description}</p>
              <div className="mb-4">
                <span className="text-2xl font-bold text-blue-600">{service.price}</span>
              </div>
              <ul className="space-y-2 mb-6">
                {service.features.map((feature, featureIndex) => (
                  <li key={featureIndex} className="flex items-start">
                    <Check className="w-4 h-4 text-green-600 mr-2 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-700 text-sm">{feature}</span>
                  </li>
                ))}
              </ul>
              <button className="w-full py-2 px-4 border border-blue-600 text-blue-600 rounded-lg hover:bg-blue-50 transition-colors text-sm font-medium">
                Learn More
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* FAQ Section */}
      <section className="container mx-auto px-4 py-16 bg-gray-50 rounded-xl my-8">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <h2 className="text-3xl font-bold mb-4 text-gray-900">Frequently Asked Questions</h2>
          <p className="text-gray-600">
            Got questions? We've got answers. Here are some common questions about our pricing.
          </p>
        </div>

        <div className="max-w-4xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {faqs.map((faq, index) => (
              <div key={index} className="bg-white rounded-lg p-6 border border-gray-200">
                <h3 className="font-semibold text-gray-900 mb-2">{faq.question}</h3>
                <p className="text-gray-600 text-sm">{faq.answer}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="container mx-auto px-4 py-16">
        <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-8 text-center">
          <h2 className="text-3xl font-bold mb-4 text-gray-900">
            Ready to get started?
          </h2>
          <p className="text-gray-600 mb-8 max-w-2xl mx-auto">
            Join thousands of professionals who trust Sajilo Notary with their document needs. 
            Start your free trial today and experience the difference.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button 
              onClick={() => navigate('/auth/sign-up')}
              className="bg-blue-600 text-white px-8 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors"
            >
              Start Free Trial
            </button>
            <button 
              onClick={() => navigate('/all-services')}
              className="border border-blue-600 text-blue-600 px-8 py-3 rounded-lg font-medium hover:bg-blue-50 transition-colors"
            >
              View All Services
            </button>
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

export default PricingPage; 