import React, { useState, useEffect } from 'react';
import { ArrowLeft, Upload, X, FileText, Image as ImageIcon, Check } from 'lucide-react';
import { useParams, useLocation } from 'react-router-dom';
import { authService } from '../../services/apiService';

const SuccessDialog = ({ isOpen, onClose }) => {
  if (!isOpen) return null;
  
  return (
    <div className="fixed inset-0 flex items-center justify-center z-50">
      <div className="absolute inset-0 bg-black bg-opacity-50 backdrop-blur-sm"></div>
      <div className="bg-white rounded-xl shadow-2xl border border-gray-200 p-8 max-w-md w-full mx-4 relative z-10 animate-fade-in-up">
        <div className="flex flex-col items-center text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
            <Check className="w-8 h-8 text-green-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Success!</h2>
          <p className="text-gray-600 mb-6">Your document has been submitted successfully.</p>
          <div className="w-full h-2 bg-gray-100 rounded-full mb-6">
            <div className="h-full bg-green-500 rounded-full animate-progress"></div>
          </div>
          <p className="text-sm text-gray-500">Redirecting to your documents...</p>
        </div>
      </div>
    </div>
  );
};

const ServiceForm = () => {
  const location = useLocation();
  const [serviceId, setServiceId] = useState('');
  const [formData, setFormData] = useState({
    country: '',
    title: '',
    description: ''
  });
  const [files, setFiles] = useState([]);
  const [fileError, setFileError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [countries, setCountries] = useState([]);
  const [showSuccessDialog, setShowSuccessDialog] = useState(false);

  useEffect(() => {
    // Get service ID from URL query parameter
    const urlParams = new URLSearchParams(location.search);
    const id = urlParams.get('id') || '';
    setServiceId(id);

    // Check if user is authenticated
    const token = localStorage.getItem('token');
    if (!token) {
      // Redirect to login if not authenticated
      window.location.href = '/auth/sign-in';
    }

    // Load countries from localStorage
    const savedCountries = localStorage.getItem('countries');
    if (savedCountries) {
      try {
        const parsedCountries = JSON.parse(savedCountries);
        setCountries(parsedCountries);
      } catch (error) {
        console.error('Error parsing countries from localStorage:', error);
        // Fallback to default countries if parsing fails
        setCountries([
        ]);
      }
    } else {
      // Fallback to default countries if none found in localStorage
      setCountries([
      ]);
    }
  }, [location]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleFileChange = (e) => {
    const selectedFiles = Array.from(e.target.files);
    setFileError('');
    
    // Validate file types
    const invalidFiles = selectedFiles.filter(file => {
      const isPDF = file.type === 'application/pdf';
      const isImage = file.type.startsWith('image/');
      return !(isPDF || isImage);
    });

    if (invalidFiles.length > 0) {
      setFileError('Only PDF files and images are allowed');
      return;
    }

    setFiles(prev => [...prev, ...selectedFiles]);
  };

  const removeFile = (index) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  };

  const convertImagesToSinglePDF = async (imageFiles) => {
    // This is a placeholder for actual PDF conversion logic
    // In a real implementation, you would use a PDF library
    console.log('Converting images to PDF:', imageFiles);
    
    // Return a mock PDF file object
    return new File(['mock pdf content'], 'combined_images.pdf', { type: 'application/pdf' });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (files.length === 0) {
      setFileError('Please upload at least one document');
      return;
    }

    setIsSubmitting(true);

    try {
      let finalFiles = [...files];
      
      // If there are multiple image files, convert them to a single PDF
      const imageFiles = files.filter(file => file.type.startsWith('image/'));
      if (imageFiles.length > 1) {
        const combinedPDF = await convertImagesToSinglePDF(imageFiles);
        
        // Replace the image files with the combined PDF
        const nonImageFiles = files.filter(file => !file.type.startsWith('image/'));
        finalFiles = [...nonImageFiles, combinedPDF];
      }

      // Prepare data for submission
      const requestData = {
        title: formData.title,
        description: formData.description,
        countryId: formData.country,
        serviceId: serviceId,
        files: finalFiles.length === 1 ? finalFiles[0] : finalFiles
      };

      // Submit the form using the API service
      await authService.sendDocuments(requestData);
      
      // Show success dialog
      setShowSuccessDialog(true);
      
      // Redirect to documents page after delay
      setTimeout(() => {
        window.location.href = '/documents';
      }, 3000);
    } catch (error) {
      console.error('Error submitting form:', error);
      alert('An error occurred while submitting the form. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-100 text-gray-800">
      {/* Success Dialog */}
      <SuccessDialog 
        isOpen={showSuccessDialog} 
        onClose={() => setShowSuccessDialog(false)} 
      />

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
        
        <button 
          className="text-blue-600 font-medium"
          onClick={() => window.history.back()}
        >
          <ArrowLeft className="inline-block w-4 h-4 mr-1" />
          Back
        </button>
      </nav>

      {/* Form Section */}
      <div className="container mx-auto px-6 py-12">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-3xl font-bold mb-8 text-center text-gray-900">Service Request Form</h1>
          
          <div className="bg-white rounded-xl shadow-xl border border-gray-200 p-8">
            <form onSubmit={handleSubmit}>
              {/* Country Selection */}
              <div className="mb-6">
                <label htmlFor="country" className="block text-gray-700 font-medium mb-2">Country</label>
                <select
                  id="country"
                  name="country"
                  value={formData.country}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                >
                  <option value="">Select a country</option>
                  {countries.map(country => (
                    <option key={country.code} value={country.id}>{country.name}</option>
                  ))}
                </select>
              </div>
              
              {/* Title */}
              <div className="mb-6">
                <label htmlFor="title" className="block text-gray-700 font-medium mb-2">Title</label>
                <input
                  type="text"
                  id="title"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  required
                  placeholder="Enter a title for your request"
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                />
              </div>
              
              {/* Description */}
              <div className="mb-6">
                <label htmlFor="description" className="block text-gray-700 font-medium mb-2">Description</label>
                <textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  required
                  placeholder="Please provide details about your request"
                  rows="4"
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                ></textarea>
              </div>
              
              {/* File Upload */}
              <div className="mb-6">
                <label className="block text-gray-700 font-medium mb-2">Upload Documents</label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-500 transition-colors">
                  <input
                    type="file"
                    id="fileUpload"
                    onChange={handleFileChange}
                    multiple
                    accept=".pdf,image/*"
                    className="hidden"
                  />
                  <label htmlFor="fileUpload" className="cursor-pointer">
                    <Upload className="w-10 h-10 text-gray-400 mx-auto mb-2" />
                    <p className="text-gray-700 mb-1">Drag and drop your files here or click to browse</p>
                    <p className="text-sm text-gray-500">Accepts PDF files or images (JPG, PNG, etc.)</p>
                  </label>
                </div>
                {fileError && (
                  <p className="mt-2 text-red-500 text-sm">{fileError}</p>
                )}
                
                {/* File Preview */}
                {files.length > 0 && (
                  <div className="mt-4">
                    <p className="text-gray-700 font-medium mb-2">Uploaded Files:</p>
                    <div className="space-y-2">
                      {files.map((file, index) => (
                        <div key={index} className="flex items-center justify-between bg-gray-50 p-3 rounded-lg">
                          <div className="flex items-center">
                            {file.type === 'application/pdf' ? (
                              <FileText className="w-5 h-5 text-red-500 mr-2" />
                            ) : (
                              <ImageIcon className="w-5 h-5 text-blue-500 mr-2" />
                            )}
                            <span className="text-gray-700 truncate max-w-xs">{file.name}</span>
                          </div>
                          <button 
                            type="button"
                            onClick={() => removeFile(index)}
                            className="text-gray-500 hover:text-red-600 transition-colors"
                          >
                            <X className="w-5 h-5" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
              
              {/* Submit Button */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-medium px-6 py-4 rounded-lg shadow-lg shadow-blue-600/20 hover:shadow-blue-600/40 transition-all flex items-center justify-center"
              >
                {isSubmitting ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                    Submitting...
                  </>
                ) : (
                  <>
                    <Check className="w-5 h-5 mr-2" />
                    Submit
                  </>
                )}
              </button>
            </form>
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

// Add at the end of the file
// CSS for animations
const style = document.createElement('style');
style.textContent = `
  @keyframes fade-in-up {
    0% {
      opacity: 0;
      transform: translateY(20px);
    }
    100% {
      opacity: 1;
      transform: translateY(0);
    }
  }
  
  @keyframes progress {
    0% { width: 0%; }
    100% { width: 100%; }
  }
  
  .animate-fade-in-up {
    animation: fade-in-up 0.4s ease-out;
  }
  
  .animate-progress {
    animation: progress 2.5s ease-in-out forwards;
  }
`;
document.head.appendChild(style);

export default ServiceForm; 