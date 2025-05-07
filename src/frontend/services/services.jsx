import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield, FileText, Clock, Search, ArrowRight, ChevronRight } from 'lucide-react';

const ServicesPage = () => {
  const navigate = useNavigate();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userName, setUserName] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredServices, setFilteredServices] = useState([]);
  
  // All services data
  const allServices = [
    { 
      icon: <Shield className="w-5 h-5 text-blue-600" />, 
      title: "Notary Services", 
      description: "Professional document authentication with legally binding digital signatures and stamps.",
      category: "Legal",
      slug: "notary"
    },
    { 
      icon: <FileText className="w-5 h-5 text-purple-600" />, 
      title: "Translation Services", 
      description: "Accurate document translation by certified professionals in multiple languages.",
      category: "Language",
      slug: "translation"
    },
    { 
      icon: <Clock className="w-5 h-5 text-blue-600" />, 
      title: "SOP Writing", 
      description: "Expert assistance in creating comprehensive Standard Operating Procedures for businesses and applications.",
      category: "Business",
      slug: "sop-writing"
    },
    // Additional services can be added here
    { 
      icon: <FileText className="w-5 h-5 text-green-600" />, 
      title: "Legal Document Review", 
      description: "Expert review of legal documents by certified professionals to ensure compliance and accuracy.",
      category: "Legal",
      slug: "legal-review"
    },
    { 
      icon: <Shield className="w-5 h-5 text-orange-600" />, 
      title: "Digital Signatures", 
      description: "Secure and legally binding digital signature solutions for all your document needs.",
      category: "Security",
      slug: "digital-signatures"
    },
    { 
      icon: <Clock className="w-5 h-5 text-red-600" />, 
      title: "Express Document Processing", 
      description: "Expedited processing of urgent documents with priority handling and verification.",
      category: "Business",
      slug: "express-processing"
    }
  ];

  // Get unique categories for filtering
  const categories = [...new Set(allServices.map(service => service.category))];

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
    
    setFilteredServices(allServices);
  }, []);
  
  const handleSearch = (e) => {
    const term = e.target.value;
    setSearchTerm(term);
    
    if (term.trim() === '') {
      setFilteredServices(allServices);
    } else {
      const filtered = allServices.filter(service => 
        service.title.toLowerCase().includes(term.toLowerCase()) || 
        service.description.toLowerCase().includes(term.toLowerCase()) ||
        service.category.toLowerCase().includes(term.toLowerCase())
      );
      setFilteredServices(filtered);
    }
  };
  
  const filterByCategory = (category) => {
    if (category === 'All') {
      setFilteredServices(allServices);
    } else {
      const filtered = allServices.filter(service => service.category === category);
      setFilteredServices(filtered);
    }
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
        
        <div className="hidden md:flex items-center space-x-8">
          <a 
            onClick={() => navigate('/services')} 
            className="text-blue-600 hover:text-blue-700 transition-colors text-sm font-medium cursor-pointer"
          >All Services</a>
          <a href="/#pricing" className="text-gray-600 hover:text-blue-600 transition-colors text-sm">Pricing</a>
          {isLoggedIn && (
            <a 
              onClick={() => navigate('/profile#documents')} 
              className="text-gray-600 hover:text-blue-600 transition-colors text-sm cursor-pointer"
            >
              Your Documents
            </a>
          )}
          
          {isLoggedIn ? (
            <div className="flex items-center space-x-2">
              <a 
                onClick={() => navigate('/profile')} 
                className="text-blue-600 text-sm font-medium hover:text-blue-700 transition-colors cursor-pointer"
              >
                {userName}
              </a>
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
      <section className="container mx-auto px-4 py-6">
        <div className="flex flex-wrap justify-center gap-2 mb-6">
          <button
            onClick={() => filterByCategory('All')}
            className="px-4 py-2 rounded-full bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 transition-colors"
          >
            All
          </button>
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => filterByCategory(category)}
              className="px-4 py-2 rounded-full bg-gray-100 text-gray-600 text-sm font-medium hover:bg-gray-200 transition-colors"
            >
              {category}
            </button>
          ))}
        </div>
      </section>
      
      {/* Services Grid */}
      <section className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredServices.map((service, index) => (
            <div 
              key={index} 
              className="bg-white p-6 rounded-xl border border-gray-200 hover:border-blue-500/20 transition-all duration-300 hover:shadow-lg cursor-pointer"
              onClick={() => navigate(`/services/${service.slug}`)}
            >
              <div className="flex items-center mb-4">
                <div className="p-2 bg-blue-50 rounded-lg mr-3">
                  {service.icon}
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-800">{service.title}</h3>
                  <span className="text-xs px-2 py-1 bg-gray-100 rounded-full text-gray-600">{service.category}</span>
                </div>
              </div>
              <p className="text-gray-600 text-sm mb-4">
                {service.description}
              </p>
              <a 
                onClick={(e) => {
                  e.stopPropagation();
                  navigate(`/services/${service.slug}`);
                }} 
                className="text-blue-600 hover:text-blue-700 transition-colors text-sm font-medium flex items-center cursor-pointer"
              >
                Learn more <ArrowRight className="ml-1 w-3 h-3" />
              </a>
            </div>
          ))}
        </div>
        
        {filteredServices.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500">No services found matching your search criteria.</p>
          </div>
        )}
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-4 py-12 my-8">
        <div className="bg-white rounded-xl p-8 border border-gray-200 shadow-sm text-center">
          <h2 className="text-2xl font-bold mb-4 text-gray-900">Ready to get started?</h2>
          <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
            Our team of experts is ready to assist you with all your document needs. Contact us today or sign up to get started.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <button 
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-lg text-sm font-medium transition-colors"
              onClick={() => navigate('/auth/sign-up')}
            >
              Create Account
            </button>
            <button 
              className="bg-white hover:bg-gray-50 text-blue-600 border border-blue-600 px-6 py-2.5 rounded-lg text-sm font-medium transition-colors"
              onClick={() => navigate('/')}
            >
              Learn More
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 py-8">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-2">
              <svg className="w-6 h-6 text-blue-600" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2L2 19h20L12 2zm0 3l7 14H5l7-14z"/>
              </svg>
              <span className="text-lg font-bold text-gray-900">Sajilo Notary</span>
            </div>
            <p className="text-gray-500 text-xs">&copy; {new Date().getFullYear()} Sajilo Notary. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default ServicesPage; 