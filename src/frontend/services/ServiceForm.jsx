import React, { useState, useEffect } from 'react';
import { ArrowLeft, Upload, X, FileText, Image as ImageIcon, Check } from 'lucide-react';
import { useParams, useLocation } from 'react-router-dom';
import { authService } from '../../services/apiService';
import html2pdf from 'html2pdf.js';

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
  const [isConverting, setIsConverting] = useState(false);
  const [uploadType, setUploadType] = useState(null); // 'pdf' or 'images'

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

  const convertImagesToPdf = async (imageFiles) => {
    setIsConverting(true);
    try {
      const container = document.createElement('div');
      container.style.width = '800px';
      
      const imageLoadPromises = imageFiles.map(file => {
        return new Promise((resolve) => {
          const img = document.createElement('img');
          img.style.width = '100%';
          img.style.marginBottom = '10px';
          
          const reader = new FileReader();
          reader.onload = (e) => {
            img.src = e.target.result;
            img.onload = () => resolve(img);
          };
          reader.readAsDataURL(file);
        });
      });

      const images = await Promise.all(imageLoadPromises);
      images.forEach(img => container.appendChild(img));

      const pdfOptions = {
        margin: 10,
        filename: 'converted_images.pdf',
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2 },
        jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
      };

      const pdfBlob = await html2pdf().set(pdfOptions).from(container).outputPdf('blob');
      const pdfFile = new File([pdfBlob], 'converted_images.pdf', { type: 'application/pdf' });
      return pdfFile;
    } catch (error) {
      console.error('Error converting images to PDF:', error);
      throw error;
    } finally {
      setIsConverting(false);
    }
  };

  const handlePdfUpload = (e) => {
    const selectedFiles = Array.from(e.target.files);
    setFileError('');

    // Validate PDF files
    const invalidFiles = selectedFiles.filter(file => file.type !== 'application/pdf');
    if (invalidFiles.length > 0) {
      setFileError('Please select only PDF files');
      return;
    }

    setFiles(selectedFiles);
    setUploadType('pdf');
  };

  const handleImageUpload = async (e) => {
    const selectedFiles = Array.from(e.target.files);
    setFileError('');

    // Validate image files
    const invalidFiles = selectedFiles.filter(file => !file.type.startsWith('image/'));
    if (invalidFiles.length > 0) {
      setFileError('Please select only image files');
      return;
    }

    try {
      const convertedPdf = await convertImagesToPdf(selectedFiles);
      setFiles([convertedPdf]);
      setUploadType('images');
    } catch (error) {
      console.error('Error processing images:', error);
      setFileError('Error converting images to PDF. Please try again.');
    }
  };

  const removeFiles = () => {
    setFiles([]);
    setUploadType(null);
    setFileError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (files.length === 0) {
      setFileError('Please upload at least one document');
      return;
    }

    setIsSubmitting(true);

    try {
      // Prepare data for submission
      const requestData = {
        title: formData.title,
        description: formData.description,
        countryId: formData.country,
        serviceId: serviceId,
        files: files.length === 1 ? files[0] : files
      };

      // Submit the form using the API service
      await authService.sendDocuments(requestData);
      
      // Show success dialog
      setShowSuccessDialog(true);
      
      // Redirect to documents page after delay
      setTimeout(() => {
        window.location.href = 'documents';
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
            <img src="/img/nlogo.png" alt="Sajilo Notary Logo" className="relative w-8 h-8 object-contain" />
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
                  maxLength={230}
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                />
                <div className={`text-sm mt-1 text-right ${formData.title.length >= 230 ? 'text-red-500' : 'text-gray-500'}`}>{formData.title.length}/230</div>
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
              
              {/* File Upload Section */}
              <div className="mb-6">
                <label className="block text-gray-700 font-medium mb-4">Upload Documents</label>
                
                {!files.length && !isConverting && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* PDF Upload Option */}
                    <div className="relative">
                      <input
                        type="file"
                        id="pdfUpload"
                        onChange={handlePdfUpload}
                        accept=".pdf,application/pdf"
                        className="hidden"
                        disabled={!!uploadType && uploadType !== 'pdf'}
                      />
                      <label
                        htmlFor="pdfUpload"
                        className={`block border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
                          !uploadType || uploadType === 'pdf'
                            ? 'border-blue-300 hover:border-blue-500 cursor-pointer'
                            : 'border-gray-200 bg-gray-50 cursor-not-allowed'
                        }`}
                      >
                        <FileText className="w-10 h-10 mx-auto mb-2 text-blue-500" />
                        <p className="text-gray-700 font-medium">Upload PDF</p>
                        <p className="text-sm text-gray-500 mt-1">Select a PDF file</p>
                      </label>
                    </div>

                    {/* Image Upload Option */}
                    <div className="relative">
                      <input
                        type="file"
                        id="imageUpload"
                        onChange={handleImageUpload}
                        accept="image/*"
                        multiple
                        className="hidden"
                        disabled={!!uploadType && uploadType !== 'images'}
                      />
                      <label
                        htmlFor="imageUpload"
                        className={`block border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
                          !uploadType || uploadType === 'images'
                            ? 'border-purple-300 hover:border-purple-500 cursor-pointer'
                            : 'border-gray-200 bg-gray-50 cursor-not-allowed'
                        }`}
                      >
                        <ImageIcon className="w-10 h-10 mx-auto mb-2 text-purple-500" />
                        <p className="text-gray-700 font-medium">Create PDF from Images</p>
                        <p className="text-sm text-gray-500 mt-1">Select multiple images</p>
                      </label>
                    </div>
                  </div>
                )}

                {/* Error Message */}
                {fileError && (
                  <p className="mt-2 text-red-500 text-sm">{fileError}</p>
                )}

                {/* Converting Status */}
                {isConverting && (
                  <div className="mt-4 text-center">
                    <div className="inline-flex items-center px-4 py-2 bg-blue-50 text-blue-600 rounded-lg">
                      <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mr-2"></div>
                      Converting images to PDF...
                    </div>
                  </div>
                )}

                {/* File Preview */}
                {files.length > 0 && (
                  <div className="mt-4">
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-gray-700 font-medium">
                        {uploadType === 'images' ? 'Converted PDF' : 'Uploaded PDF'}:
                      </p>
                      <button
                        type="button"
                        onClick={removeFiles}
                        className="text-sm text-red-500 hover:text-red-700 transition-colors"
                      >
                        Remove {uploadType === 'images' ? 'converted PDF' : 'PDF'}
                      </button>
                    </div>
                    <div className="space-y-2">
                      {files.map((file, index) => (
                        <div key={index} className="flex items-center bg-gray-50 p-3 rounded-lg">
                          <FileText className="w-5 h-5 text-red-500 mr-2" />
                          <span className="text-gray-700 truncate flex-1">{file.name}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
              
              {/* Submit Button */}
              <button
                type="submit"
                disabled={isSubmitting || files.length === 0}
                className={`w-full font-medium px-6 py-4 rounded-lg shadow-lg transition-all flex items-center justify-center ${
                  isSubmitting || files.length === 0
                    ? 'bg-gray-300 cursor-not-allowed'
                    : 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-blue-600/20 hover:shadow-blue-600/40'
                }`}
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
                <img src="/img/nlogo.png" alt="Sajilo Notary Logo" className="relative w-8 h-8 object-contain" />
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