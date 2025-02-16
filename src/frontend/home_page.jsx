import React, { useEffect } from 'react';
import { ChevronRight } from 'lucide-react';

const LandingPage = () => {
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      window.location.href = '/dashboard/home';
    }
  }, []);

  return (
    <div className="min-h-screen bg-[#0B1121] text-white">
      {/* Navigation */}
      <nav className="container mx-auto px-4 py-6 flex justify-between items-center">
        <div className="flex items-center space-x-2">
          <svg className="w-6 h-6 text-blue-500" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2L2 19h20L12 2zm0 3l7 14H5l7-14z"/>
          </svg>
          <span className="text-2xl font-bold">Sajilo Notary</span>
        </div>
        <div className="flex items-center space-x-8">
          <a href="#" className="text-gray-400 hover:text-white transition-colors">Solution</a>
          <a href="#" className="text-gray-400 hover:text-white transition-colors">Customers</a>
          <a href="#" className="text-gray-400 hover:text-white transition-colors">Pricing</a>
          <a href="#" className="text-gray-400 hover:text-white transition-colors">Blog</a>
          <a href="#" className="text-gray-400 hover:text-white transition-colors">Company</a>
          <button className="bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600 transition-colors" onClick={() => {
            window.location.href = '/auth/sign-in';
          }}>
            Sign in
          </button>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-20">
        <div className="flex justify-between items-center">
          <div className="max-w-2xl">
            <h1 className="text-6xl font-bold mb-6">
              Design, Build, <span className="text-blue-500">Scale</span>
            </h1>
            <p className="text-gray-400 text-xl mb-12 leading-relaxed">
              Computers used to be magical. But much of that magic has been lost over time, replaced by subpar tools and practices that slow teams down and hold great work back.
            </p>
            <div className="flex space-x-4 mb-12">
              <input
                type="email"
                placeholder="Your mail address"
                className="bg-[#1A2337] px-6 py-3 rounded-lg w-80 border border-gray-700 focus:outline-none focus:border-blue-500"
              />
              <button className="bg-blue-500 px-8 py-3 rounded-lg hover:bg-blue-600 transition-colors">
                Get Started
              </button>
            </div>
            <div>
              <p className="text-sm text-gray-400 mb-4">From the most talented team</p>
              <div className="flex -space-x-2">
                {[1,2,3,4,5].map((i) => (
                  <img key={i} src="/img/prof.jpg" alt={`Team member ${i}`} className="w-8 h-8 rounded-full border-2 border-[#0B1121]" />
                ))}
              </div>
            </div>
          </div>
          <div className="relative">
            <img src="/api/placeholder/500/400" alt="Team collaboration illustration" className="w-96" />
          </div>
        </div>
      </section>

      {/* Trusted By Section */}
      <section className="container mx-auto px-4 py-16 border-t border-gray-800">
        <p className="text-center text-gray-500 mb-12 uppercase tracking-wider text-sm">
          Trusted by your favored top techs companies
        </p>
        <div className="flex justify-between items-center ">
          {['Airbnb', 'COTY', 'GE', 'Lilly', 'Microsoft'].map((company) => (
            <div key={company} className="bg-white rounded-xl p-6 shadow-lg hover:bg-gray-50 transition-colors">
              <img 
                src="/img/comp.png" 
                alt={company} 
                className="h-8 opacity-50 text-white" 
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