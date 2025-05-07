import React from 'react';
import { CheckCircle, ArrowRight } from 'lucide-react';

const ServiceConfirmation = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-100 text-gray-800">
      {/* Navigation */}
      <nav className="container mx-auto px-6 py-5 flex justify-between items-center backdrop-blur-md bg-white/80 sticky top-0 z-50 border-b border-gray-200 shadow-sm">
        <div className="flex items-center space-x-3">
          <div className="relative group cursor-pointer" onClick={() => window.location.href = '/'}>
            <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full blur opacity-70 group-hover:opacity-100 transition duration-300 animate-pulse"></div>
            <svg className="relative w-8 h-8 text-blue-600" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2L2 19h20L12 2zm0 3l7 14H5l7-14z"/>
            </svg>
          </div>
          <span className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-purple-600" onClick={() => window.location.href = '/'}>Sajilo Notary</span>
        </div>
      </nav>

      {/* Confirmation Content */}
      <div className="container mx-auto px-6 py-16">
        <div className="max-w-2xl mx-auto text-center">
          <div className="mb-8 flex justify-center">
            <div className="relative">
              <div className="absolute -inset-1 bg-gradient-to-r from-green-500 to-teal-500 rounded-full blur opacity-30 animate-pulse"></div>
              <CheckCircle className="relative w-24 h-24 text-green-500" />
            </div>
          </div>
          
          <h1 className="text-4xl font-bold mb-6 text-gray-900">Request Submitted Successfully!</h1>
          
          <p className="text-xl text-gray-600 mb-8">
            Thank you for submitting your request. We have received your information and will begin processing it shortly.
          </p>
          
          <div className="bg-white rounded-xl border border-gray-200 p-6 mb-8 shadow-lg">
            <h2 className="text-xl font-semibold mb-4 text-gray-800">What's Next?</h2>
            <ol className="space-y-4 text-left">
              <li className="flex items-start">
                <div className="bg-blue-100 text-blue-600 rounded-full w-6 h-6 flex items-center justify-center font-medium mr-3 mt-0.5 flex-shrink-0">1</div>
                <p className="text-gray-600">Our team will review your submitted documents and information.</p>
              </li>
              <li className="flex items-start">
                <div className="bg-blue-100 text-blue-600 rounded-full w-6 h-6 flex items-center justify-center font-medium mr-3 mt-0.5 flex-shrink-0">2</div>
                <p className="text-gray-600">You'll receive an email confirmation with your request details and reference number.</p>
              </li>
              <li className="flex items-start">
                <div className="bg-blue-100 text-blue-600 rounded-full w-6 h-6 flex items-center justify-center font-medium mr-3 mt-0.5 flex-shrink-0">3</div>
                <p className="text-gray-600">We'll contact you if any additional information is needed to process your request.</p>
              </li>
              <li className="flex items-start">
                <div className="bg-blue-100 text-blue-600 rounded-full w-6 h-6 flex items-center justify-center font-medium mr-3 mt-0.5 flex-shrink-0">4</div>
                <p className="text-gray-600">You can track the status of your request in your account dashboard.</p>
              </li>
            </ol>
          </div>
          
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <button 
              onClick={() => window.location.href = '/dashboard'}
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-medium px-8 py-3 rounded-lg shadow-lg shadow-blue-600/20 hover:shadow-blue-600/40 transition-all flex items-center justify-center"
            >
              Go to Dashboard
              <ArrowRight className="ml-2 w-4 h-4" />
            </button>
            
            <button 
              onClick={() => window.location.href = '/'}
              className="bg-white text-gray-700 border border-gray-300 hover:bg-gray-50 font-medium px-8 py-3 rounded-lg transition-colors"
            >
              Return to Home
            </button>
          </div>
        </div>
      </div>
      
      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 py-8 mt-12">
        <div className="container mx-auto px-6">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center space-x-3 mb-4 md:mb-0">
              <div className="relative">
                <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full blur opacity-70"></div>
                <svg className="relative w-8 h-8 text-blue-600" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2L2 19h20L12 2zm0 3l7 14H5l7-14z"/>
                </svg>
              </div>
              <span className="text-xl font-bold text-gray-900">Sajilo Notary</span>
            </div>
            <p className="text-gray-500 text-sm">&copy; {new Date().getFullYear()} Sajilo Notary. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default ServiceConfirmation; 