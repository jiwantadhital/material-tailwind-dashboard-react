import React, { useEffect, useState } from 'react';
import { ChevronRight, Menu, X, Check, ArrowRight } from 'lucide-react';

const LandingPage = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [activeTab, setActiveTab] = useState(0);
  const [email, setEmail] = useState('');

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      window.location.href = '/dashboard/home';
    }
    
    // Add scroll reveal animations
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('animate-fadeIn');
        }
      });
    }, { threshold: 0.1 });
    
    document.querySelectorAll('.reveal').forEach(el => observer.observe(el));
    
    return () => observer.disconnect();
  }, []);

  return (
    <div className="min-h-screen bg-[#0B1121] text-white">
      {/* Navigation */}
      <nav className="container mx-auto px-4 py-6 flex justify-between items-center backdrop-blur-md bg-[#0B1121]/80 sticky top-0 z-50">
        <div className="flex items-center space-x-2">
          <div className="relative group">
            <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full blur opacity-70 group-hover:opacity-100 transition duration-300"></div>
            <svg className="relative w-7 h-7 text-white" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2L2 19h20L12 2zm0 3l7 14H5l7-14z"/>
            </svg>
          </div>
          <span className="text-2xl font-bold">Sajilo Notary</span>
        </div>
        
        {/* Desktop Menu */}
        <div className="hidden md:flex items-center space-x-8">
          <a href="#solutions" className="text-gray-400 hover:text-white transition-colors hover:scale-105 transform duration-200">Solutions</a>
          <a href="#customers" className="text-gray-400 hover:text-white transition-colors hover:scale-105 transform duration-200">Customers</a>
          <a href="#pricing" className="text-gray-400 hover:text-white transition-colors hover:scale-105 transform duration-200">Pricing</a>
          <a href="#features" className="text-gray-400 hover:text-white transition-colors hover:scale-105 transform duration-200">Features</a>
          <a href="#about" className="text-gray-400 hover:text-white transition-colors hover:scale-105 transform duration-200">About Us</a>
          <button 
            className="relative group overflow-hidden bg-transparent rounded-lg px-6 py-2 text-white"
            onClick={() => window.location.href = '/auth/sign-in'}
          >
            <span className="absolute inset-0 w-full h-full transition duration-300 ease-out transform translate-x-0 -translate-y-0 bg-gradient-to-r from-blue-500 to-purple-600 group-hover:translate-x-0 group-hover:translate-y-0"></span>
            <span className="absolute inset-0 w-full h-full border-2 border-white rounded-lg"></span>
            <span className="relative font-medium">Sign in</span>
          </button>
        </div>
        
        {/* Mobile Menu Button */}
        <button className="md:hidden text-white" onClick={() => setIsMenuOpen(!isMenuOpen)}>
          {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
        
        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="absolute top-20 left-0 right-0 bg-[#0B1121] shadow-2xl p-6 md:hidden z-50 animate-fadeDown">
            <div className="flex flex-col space-y-4">
              <a href="#solutions" className="text-gray-400 hover:text-white transition-colors py-2" onClick={() => setIsMenuOpen(false)}>Solutions</a>
              <a href="#customers" className="text-gray-400 hover:text-white transition-colors py-2" onClick={() => setIsMenuOpen(false)}>Customers</a>
              <a href="#pricing" className="text-gray-400 hover:text-white transition-colors py-2" onClick={() => setIsMenuOpen(false)}>Pricing</a>
              <a href="#features" className="text-gray-400 hover:text-white transition-colors py-2" onClick={() => setIsMenuOpen(false)}>Features</a>
              <a href="#about" className="text-gray-400 hover:text-white transition-colors py-2" onClick={() => setIsMenuOpen(false)}>About Us</a>
              <button 
                className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-6 py-3 rounded-lg mt-4"
                onClick={() => window.location.href = '/auth/sign-in'}
              >
                Sign in
              </button>
            </div>
          </div>
        )}
      </nav>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-20">
        <div className="flex flex-col md:flex-row justify-between items-center reveal">
          <div className="max-w-2xl mb-12 md:mb-0">
            <div className="text-sm font-semibold text-blue-500 mb-4 flex items-center">
              <div className="w-6 h-0.5 bg-blue-500 mr-3"></div>
              STREAMLINED NOTARY SERVICES
            </div>
            <h1 className="text-5xl md:text-6xl font-bold mb-6">
              Notarize Documents <br/><span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-500 to-purple-600">Seamlessly</span>
            </h1>
            <p className="text-gray-400 text-xl mb-12 leading-relaxed">
              Sajilo Notary brings the power of digital transformation to notarial services, making document authentication faster, secure, and convenient for everyone.
            </p>
            <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4 mb-12">
              <input
                type="email"
                placeholder="Your email address"
                className="bg-[#1A2337] px-6 py-3 rounded-lg w-full sm:w-80 border border-gray-700 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all duration-300"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              <button className="relative overflow-hidden group bg-gradient-to-r from-blue-500 to-purple-600 px-8 py-3 rounded-lg hover:shadow-lg hover:shadow-blue-500/20 transition-all duration-300 transform hover:scale-105">
                <span className="absolute right-0 w-8 h-32 -mt-12 transition-all duration-1000 transform translate-x-12 bg-white opacity-10 rotate-12 group-hover:-translate-x-40 ease"></span>
                <span className="relative flex items-center justify-center text-white font-medium">
                  Get Started <ArrowRight className="ml-2 w-5 h-5" />
                </span>
              </button>
            </div>
            <div>
              <p className="text-sm text-gray-400 mb-3">Trusted by industry professionals</p>
              <div className="flex -space-x-2">
                {[1,2,3,4,5].map((i) => (
                  <div key={i} className="relative h-10 w-10 rounded-full overflow-hidden border-2 border-[#0B1121] hover:scale-110 transform transition-transform duration-200 hover:z-10">
                    <img src="/img/prof.jpg" alt={`Team member ${i}`} className="h-full w-full object-cover" />
                  </div>
                ))}
                <div className="flex items-center justify-center w-10 h-10 rounded-full bg-blue-500/20 text-blue-500 font-medium text-xs border-2 border-[#0B1121]">
                  +850
                </div>
              </div>
            </div>
          </div>
          <div className="relative">
            <div className="absolute -inset-1 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl blur opacity-20"></div>
            <div className="relative bg-[#1A2337] p-1 rounded-2xl overflow-hidden">
              <img src="/api/placeholder/500/400" alt="Notary service illustration" className="w-full md:w-96 rounded-xl transform hover:scale-105 transition-transform duration-500" />
            </div>
            <div className="absolute -top-4 -right-4 bg-blue-500 text-white px-4 py-2 rounded-full text-sm font-semibold animate-pulse">
              New
            </div>
          </div>
        </div>
      </section>

      {/* Trusted By Section */}
      <section id="customers" className="container mx-auto px-4 py-16 border-t border-gray-800/50 reveal">
        <p className="text-center text-gray-500 mb-12 uppercase tracking-wider text-sm">
          Trusted by leading organizations
        </p>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-6 items-center">
          {['Airbnb', 'COTY', 'GE', 'Lilly', 'Microsoft'].map((company, index) => (
            <div key={company} className="bg-gradient-to-r from-white/5 to-white/10 backdrop-blur-sm rounded-xl p-6 shadow-lg hover:shadow-blue-500/10 transition-all duration-300 transform hover:scale-105">
              <img 
                src="/img/comp.png" 
                alt={company} 
                className="h-8 opacity-60 grayscale hover:grayscale-0 transition-all duration-300 mx-auto" 
              />
            </div>
          ))}
        </div>
      </section>

      {/* For Teams Section */}
      <section className="container mx-auto px-4 py-20">
        <h2 className="text-4xl font-bold text-center mb-4">
          For growing teams and organizations
        </h2>
        <p className="text-center text-gray-400 mb-12 max-w-2xl mx-auto">
          A growing team doesn't need to mean growing pains. Privacy, and the right tool for every step of your journey - like Software friction - company size
        </p>
        
        <div className="flex justify-center space-x-4 mb-12">
          <button className="px-6 py-2 rounded-lg bg-[#1A2337] text-gray-400 hover:text-white transition-colors">First Tab</button>
          <button className="px-6 py-2 rounded-lg bg-[#1A2337] text-gray-400 hover:text-white transition-colors">Second Tab</button>
          <button className="px-6 py-2 rounded-lg bg-[#1A2337] text-gray-400 hover:text-white transition-colors">Third Tab</button>
        </div>

        <div className="grid grid-cols-2 gap-12 items-center">
          <div>
            <h3 className="text-3xl font-bold mb-8">
              Make work flow across teams while connecting back to company goals
            </h3>
            <div className="space-y-8">
              <div className="flex items-start space-x-4">
                <div className="p-3 bg-[#1A2337] rounded-lg">
                  <svg className="w-6 h-6 text-gray-400" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
                <div>
                  <h4 className="font-bold mb-2">Together as one</h4>
                  <p className="text-gray-400">Accusantium nemo perspiciatis delectus atque autem</p>
                </div>
              </div>
              <div className="flex items-start space-x-4">
                <div className="p-3 bg-[#1A2337] rounded-lg">
                  <svg className="w-6 h-6 text-gray-400" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <div>
                  <h4 className="font-bold mb-2">New ideas</h4>
                  <p className="text-gray-400">Accusantium nemo perspiciatis delectus atque autem</p>
                </div>
              </div>
            </div>
          </div>
          <div className="bg-[#1A2337] p-8 rounded-2xl shadow-lg">
            <div className="flex items-center justify-between mb-4">
              <img src="/api/placeholder/24/24" alt="Tailus logo" className="h-6" />
              <div className="flex space-x-2">
                <div className="w-3 h-3 rounded-full bg-gray-600"></div>
                <div className="w-3 h-3 rounded-full bg-gray-600"></div>
                <div className="w-3 h-3 rounded-full bg-gray-600"></div>
              </div>
            </div>
            <h3 className="text-2xl font-bold mb-4">Build Customized modern Web UI</h3>
            <p className="text-gray-400 mb-8">
              Easy to customize UI components, blocks and templates built on top of modern frontend tools to make your ideas stand out
            </p>
            <div className="flex space-x-8">
              <span className="text-3xl">⚙️</span>
              <span className="text-3xl">↔️</span>
              <span className="text-3xl">▽</span>
            </div>
          </div>
        </div>
      </section>

      {/* Developer Section */}
      <section className="container mx-auto px-4 py-20">
        <div className="grid grid-cols-2 gap-12 items-center">
          <div className="flex space-x-4">
            <div className="bg-white p-6 rounded-2xl shadow-lg w-64">
              <div className="mb-4">
                <div className="w-16 h-16 bg-blue-500 rounded-full mb-4"></div>
                <h4 className="text-black font-bold text-xl">$23,988</h4>
              </div>
            </div>
            <div className="bg-white p-6 rounded-2xl shadow-lg w-64">
              <div className="flex items-center justify-between mb-6">
                <img src="/api/placeholder/24/24" alt="Tailus logo" className="h-6" />
                <div className="flex space-x-2">
                  <div className="w-2 h-2 rounded-full bg-gray-300"></div>
                  <div className="w-2 h-2 rounded-full bg-gray-300"></div>
                  <div className="w-2 h-2 rounded-full bg-gray-300"></div>
                </div>
              </div>
              <h4 className="text-black font-bold mb-4">Welcome back to Tailus</h4>
              <p className="text-gray-600">Please provide your phone number or email?</p>
            </div>
          </div>
          <div>
            <h2 className="text-4xl font-bold mb-6">
              Development is carried out by passionate developers
            </h2>
            <p className="text-gray-400 mb-8">
              Lorem ipsum dolor sit amet consectetur adipisicing elit. Eum omnis voluptatem accusantium nemo perspiciatis delectus atque autem!
            </p>
            <button className="bg-blue-500 px-8 py-3 rounded-lg hover:bg-blue-600 transition-colors">
              Get started
            </button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="container mx-auto px-4 py-20">
        <h2 className="text-4xl font-bold text-center mb-4">
          A technology-first approach
        </h2>
        <p className="text-center text-gray-400 mb-12 max-w-2xl mx-auto">
          A growing team doesn't need to mean growing pains. Privacy, and the right tool for every step of your journey - like Software friction - company size
        </p>

        <div className="grid grid-cols-3 gap-6">
          {[
            { icon: "🌱", title: "First feature" },
            { icon: "🚀", title: "Second feature" },
            { icon: "👥", title: "Third feature" }
          ].map((feature, index) => (
            <div key={index} className="bg-[#1A2337] p-8 rounded-2xl flex flex-col items-center text-center">
              <span className="text-4xl mb-6">{feature.icon}</span>
              <h3 className="text-xl font-bold mb-4">{feature.title}</h3>
              <p className="text-gray-400 mb-8">
                Lorem ipsum dolor sit amet consectetur adipisicing elit. Sapere rerum et neque a quo hic illum ab ut error repellendus.
              </p>
              <button className="mt-auto p-2 hover:bg-gray-700/50 rounded-full transition-colors">
                <ChevronRight className="w-6 h-6" />
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="container mx-auto px-4 py-20">
        <h2 className="text-4xl font-bold text-center mb-4">
          Trusted by leaders
        </h2>
        <p className="text-center text-gray-400 mb-12 max-w-2xl mx-auto">
          A growing team doesn't need to mean growing pains. Privacy, and the right tool for every step of your journey - like Software friction - company size
        </p>

        <div className="grid grid-cols-2 gap-6">
          <div className="bg-[#1A2337] p-8 rounded-2xl">
            <img src="/api/placeholder/120/40" alt="Microsoft" className="mb-8 h-8" />
            <p className="text-gray-400 mb-8">
              "Lorem ipsum dolor sit amet consectetur adipisicing elit. Quaerat repellat perspiciatis excepturi est. Non ipsum atque aliquid consectetur repellat provident."
            </p>
            <p className="text-gray-400 mb-8">
              "Esse, sint sit aut ducimus ea ipsam velit saepe earum dolorem, dignissimos minima voluptate quo accusamus corporis quaerat beatae aliquid."
            </p>
            <div className="flex items-center">
              <img src="/api/placeholder/40/40" alt="Profile" className="rounded-full mr-4" />
              <div>
                <h4 className="font-bold">Andy Doe</h4>
                <p className="text-gray-400">Product Designer</p>
              </div>
            </div>
          </div>

          <div className="grid grid-rows-2 gap-6">
            {[
              {
                logo: "airbnb",
                name: "Janet Doe",
                role: "UX Designer"
              },
              {
                logo: "ge",
                name: "John Doe",
                role: "Product Designer"
              }
            ].map((testimonial, index) => (
                <div key={index} className="bg-[#1A2337] p-8 rounded-2xl">
                <img src={`/api/placeholder/120/40`} alt={testimonial.logo} className="mb-6 h-6" />
                <p className="text-gray-400 mb-6">
                  "Sit amet consectetur adipisicing elit. Quaerat repellat perspiciatis excepturi est. Provident omnis ut, sapiente veritatis cum deleniti repudiandae ad doloribus."
                </p>
                <div className="flex items-center">
                  <img src="/api/placeholder/40/40" alt="Profile" className="rounded-full mr-4" />
                  <div>
                    <h4 className="font-bold">{testimonial.name}</h4>
                    <p className="text-gray-400">{testimonial.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer CTA Section */}
      <section className="container mx-auto px-4 py-20 border-t border-gray-800">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-4xl font-bold mb-4">
              One step to improve<br />your workflow
            </h2>
            <p className="text-gray-400 max-w-xl">
              Praesentium, atque essentionrem dolorem, iste libero eaque animi illum magnam veli suste quidem omnis quasi.
            </p>
          </div>
          <div className="flex space-x-4">
            <div className="bg-white p-6 rounded-2xl shadow-lg w-64">
              <div className="mb-4">
                <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full mb-4"></div>
                <h4 className="text-black font-bold text-xl">$23,988</h4>
              </div>
            </div>
            <div className="bg-white p-6 rounded-2xl shadow-lg w-64">
              <div className="flex items-center justify-between mb-6">
                <img src="/api/placeholder/24/24" alt="Tailus logo" className="h-6" />
                <div className="flex space-x-2">
                  <div className="w-2 h-2 rounded-full bg-gray-300"></div>
                  <div className="w-2 h-2 rounded-full bg-gray-300"></div>
                  <div className="w-2 h-2 rounded-full bg-gray-300"></div>
                </div>
              </div>
              <h4 className="text-black font-bold mb-4">Welcome back to Tailus</h4>
              <p className="text-gray-600">Please provide your phone number or email?</p>
            </div>
          </div>
        </div>
        <div className="flex space-x-4 max-w-xl mt-12">
          <input
            type="email"
            placeholder="Your mail address"
            className="bg-[#1A2337] px-6 py-3 rounded-lg flex-1 border border-gray-700 focus:outline-none focus:border-blue-500"
          />
          <button className="bg-blue-500 px-8 py-3 rounded-lg hover:bg-blue-600 transition-colors">
            Get Started
          </button>
        </div>
      </section>
    </div>
  );
};

export default LandingPage;