import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Mail, Phone, MapPin, Calendar, Edit2, Shield, ChevronRight, LogOut, FileText, Clock, Settings, Key, Eye, EyeOff } from 'lucide-react';
import { authService } from '../../services/apiService';

const UserProfile = () => {
  const navigate = useNavigate();
  const [userData, setUserData] = useState(null);
  const [kycData, setKycData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('profile');
  const [isEditMode, setIsEditMode] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');
  const [editData, setEditData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    dob: '',
    gender: ''
  });
  
  // OTP related states
  const [showOtpModal, setShowOtpModal] = useState(false);
  const [otpCode, setOtpCode] = useState('');
  const [isOtpSending, setIsOtpSending] = useState(false);
  const [isOtpVerifying, setIsOtpVerifying] = useState(false);
  const [otpTimer, setOtpTimer] = useState(0);
  const [canResendOtp, setCanResendOtp] = useState(true);
  const [pendingFormData, setPendingFormData] = useState(null);

  // Change Password states
  const [passwordData, setPasswordData] = useState({
    current_password: '',
    password: '',
    password_confirmation: ''
  });
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false
  });
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [passwordErrors, setPasswordErrors] = useState({});

  useEffect(() => {
    // Check if user is logged in
    const token = localStorage.getItem('token');
    if (!token) {
      // Redirect to login if not logged in
      navigate('/auth/sign-in');
      return;
    }

    // Fetch user data
    fetchUserData();
  }, [navigate]);

  // OTP Timer effect
  useEffect(() => {
    let interval;
    if (otpTimer > 0) {
      interval = setInterval(() => {
        setOtpTimer(prev => prev - 1);
      }, 1000);
    } else {
      setCanResendOtp(true);
    }
    return () => clearInterval(interval);
  }, [otpTimer]);

  const fetchUserData = async () => {
    setIsLoading(true);
    
    try {
      // Get fresh data from API instead of just using localStorage
      const response = await authService.initAfterLogin();
      const { user, kyc_record } = response.data;
      
      if (!user) {
        // If no data found, redirect to login
        navigate('/auth/sign-in');
        return;
      }
      
      // Update localStorage with fresh data
      const initData = {
        user: user,
        kyc_record: kyc_record
      };
      localStorage.setItem('initAfterLogin', JSON.stringify(initData));
      
      // Update component state
      setUserData(user);
      setKycData(kyc_record);
      
      // Set edit data based on available information
      setEditData({
        name: user.name || '',
        email: user.email || '',
        phone: user.phone || '',
        address: kyc_record ? kyc_record.address : '',
        dob: kyc_record ? kyc_record.dob : '',
        gender: kyc_record ? kyc_record.gender : ''
      });
      
      setIsLoading(false);
    } catch (error) {
      console.error('Error fetching user data:', error);
      setIsLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('initAfterLogin');
    navigate('/auth/sign-in');
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setStatusMessage('');
    
    try {
      // Prepare form data for API call
      const formData = new FormData();
      
      // Add basic fields
      if (editData.gender) formData.append('gender', editData.gender);
      if (editData.email) formData.append('email', editData.email);
      if (editData.name) formData.append('name', editData.name);
      if (editData.dob) formData.append('dob', editData.dob);
      if (editData.address) formData.append('address', editData.address);
      if (editData.phone) formData.append('phone', editData.phone);
      
      // Handle file uploads
      if (photoFile) formData.append('photo', photoFile);
      if (documentFile) formData.append('document_photo', documentFile);
      
      // Store form data for later use after OTP verification
      setPendingFormData(formData);
      
      // Send OTP to email first
      setIsOtpSending(true);
      const otpResponse = await authService.sendOtpEmail(editData.email);
      
      if (otpResponse.success) {
        setStatusMessage('OTP sent to your email. Please check and enter the code.');
        setShowOtpModal(true);
        setOtpTimer(300); // 5 minutes timer
        setCanResendOtp(false);
      } else {
        throw new Error(otpResponse.message || 'Failed to send OTP');
      }
      
      setIsOtpSending(false);
      setIsLoading(false);
    } catch (error) {
      console.error('Error sending OTP:', error);
      setStatusMessage('Failed to send OTP. Please try again.');
      setIsOtpSending(false);
      setIsLoading(false);
    }
  };
  
  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditData({
      ...editData,
      [name]: value
    });
  };

  // Handle OTP verification and profile update
  const handleOtpVerification = async () => {
    if (!otpCode || otpCode.length !== 6) {
      setStatusMessage('Please enter a valid 6-digit OTP');
      return;
    }

    setIsOtpVerifying(true);
    setStatusMessage('');

    try {
      // Add OTP to the pending form data
      if (pendingFormData) {
        pendingFormData.append('otp', otpCode);

        // Now submit the profile update with OTP
        const response = await authService.uploadKyc(pendingFormData);
        console.log('Profile update response:', response);

        if (response.success) {
          setStatusMessage('Profile updated successfully!');
          setShowOtpModal(false);
          setIsEditMode(false);
          setOtpCode('');
          setPendingFormData(null);

          // Refetch user data to get the updated information
          await fetchUserData();

          // Clear success message after 3 seconds
          setTimeout(() => {
            setStatusMessage('');
          }, 3000);
        } else {
          throw new Error(response.message || 'Failed to update profile');
        }
      }
    } catch (error) {
      console.error('Error verifying OTP:', error);
      setStatusMessage(error.message || 'Invalid OTP or update failed. Please try again.');
    } finally {
      setIsOtpVerifying(false);
    }
  };

  // Handle OTP resend
  const handleResendOtp = async () => {
    if (!canResendOtp) return;

    setIsOtpSending(true);
    setStatusMessage('');

    try {
      const otpResponse = await authService.sendOtpEmail(editData.email);
      
      if (otpResponse.success) {
        setStatusMessage('New OTP sent to your email.');
        setOtpTimer(300); // Reset 5 minutes timer
        setCanResendOtp(false);
        setOtpCode(''); // Clear previous OTP input
      } else {
        throw new Error(otpResponse.message || 'Failed to resend OTP');
      }
    } catch (error) {
      console.error('Error resending OTP:', error);
      setStatusMessage('Failed to resend OTP. Please try again.');
    } finally {
      setIsOtpSending(false);
    }
  };

  // Handle OTP modal close
  const handleOtpModalClose = () => {
    setShowOtpModal(false);
    setOtpCode('');
    setPendingFormData(null);
    setOtpTimer(0);
    setCanResendOtp(true);
    setStatusMessage('');
  };
  
  // File upload handlers
  const [photoFile, setPhotoFile] = useState(null);
  const [documentFile, setDocumentFile] = useState(null);
  
  const handleFileChange = (e) => {
    const { name, files } = e.target;
    if (files && files[0]) {
      if (name === 'photo') {
        setPhotoFile(files[0]);
      } else if (name === 'document_photo') {
        setDocumentFile(files[0]);
      }
    }
  };

  // Change Password handlers
  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear specific field error when user starts typing
    if (passwordErrors[name]) {
      setPasswordErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const togglePasswordVisibility = (field) => {
    setShowPasswords(prev => ({
      ...prev,
      [field]: !prev[field]
    }));
  };

  const validatePasswords = () => {
    const errors = {};
    
    if (!passwordData.current_password) {
      errors.current_password = 'Current password is required';
    }
    
    if (!passwordData.password) {
      errors.password = 'New password is required';
    } else if (passwordData.password.length < 6) {
      errors.password = 'Password must be at least 6 characters long';
    }
    
    if (!passwordData.password_confirmation) {
      errors.password_confirmation = 'Please confirm your new password';
    } else if (passwordData.password !== passwordData.password_confirmation) {
      errors.password_confirmation = 'Passwords do not match';
    }
    
    return errors;
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setPasswordErrors({});
    
    // Validate form
    const errors = validatePasswords();
    if (Object.keys(errors).length > 0) {
      setPasswordErrors(errors);
      return;
    }
    
    setIsChangingPassword(true);
    setStatusMessage('');
    
    try {
      const response = await authService.updatePassword(passwordData);
      
      if (response.success) {
        setStatusMessage('Password changed successfully!');
        setPasswordData({
          current_password: '',
          password: '',
          password_confirmation: ''
        });
        
        // Clear success message after 3 seconds
        setTimeout(() => {
          setStatusMessage('');
        }, 3000);
      } else {
        throw new Error(response.message || 'Failed to change password');
      }
    } catch (error) {
      console.error('Error changing password:', error);
      
      // Handle specific error cases
      if (error.error && typeof error.error === 'object') {
        setPasswordErrors(error.error);
      } else if (error.message && error.message.includes('Current password is incorrect')) {
        setPasswordErrors({ current_password: 'Current password is incorrect' });
      } else {
        setStatusMessage('Failed to change password. Please try again.');
      }
    } finally {
      setIsChangingPassword(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <nav className="bg-white shadow-sm border-b border-gray-200">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-2" onClick={() => navigate('/')}>
            <svg className="w-7 h-7 text-blue-600" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2L2 19h20L12 2zm0 3l7 14H5l7-14z"/>
            </svg>
            <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-purple-600">Sajilo Notary</span>
          </div>
          
          <div className="flex items-center space-x-4">
            <span className="text-gray-600 text-sm hidden md:inline">Welcome,</span>
            <span className="text-blue-600 text-sm font-medium">{userData.name}</span>
            <button 
              className="text-gray-500 hover:text-red-600 transition-colors"
              onClick={handleLogout}
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>
      </nav>

      {/* Breadcrumb */}
      <div className="bg-white border-b border-gray-200">
        <div className="container mx-auto px-4 py-2">
          <div className="flex items-center space-x-2 text-xs">
            <a onClick={() => navigate('/')} className="text-gray-500 hover:text-blue-600 transition-colors cursor-pointer">Home</a>
            <ChevronRight className="w-3 h-3 text-gray-400" />
            <span className="text-blue-600 font-medium">My Profile</span>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6">
        {statusMessage && (
          <div className={`mb-4 p-3 rounded text-sm ${
            statusMessage.includes('success') 
              ? 'bg-green-100 text-green-700' 
              : 'bg-red-100 text-red-700'
          }`}>
            {statusMessage}
          </div>
        )}
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {/* Sidebar */}
          <div className="md:col-span-1">
            <div className="bg-white rounded-lg shadow-sm p-5 border border-gray-200">
              <div className="flex flex-col items-center">
                <div className="relative mb-4">
                  {kycData && kycData.photo && kycData.photo_url ? (
                    <img 
                      src={kycData.photo_url}
                      alt={userData?.name} 
                      className="w-24 h-24 rounded-full object-cover border-2 border-blue-100"
                      onError={(e) => {
                        console.error('Profile image failed to load:', e.target.src);
                        e.target.onerror = null;
                        e.target.style.display = 'none';
                        e.target.nextElementSibling.style.display = 'flex';
                      }}
                    />
                  ) : null}
                  {(!kycData || !kycData.photo || !kycData.photo_url) && (
                    <div className="w-24 h-24 rounded-full bg-blue-100 flex items-center justify-center border-2 border-blue-100">
                      <User className="w-12 h-12 text-blue-400" />
                    </div>
                  )}
                  <div className="w-24 h-24 rounded-full bg-blue-100 flex items-center justify-center border-2 border-blue-100" style={{display: 'none'}}>
                    <User className="w-12 h-12 text-blue-400" />
                  </div>
                  <div className="absolute bottom-0 right-0 bg-blue-100 p-1 rounded-full cursor-pointer" onClick={() => setIsEditMode(true)}>
                    <Edit2 className="w-4 h-4 text-blue-600" />
                  </div>
                </div>
                <h1 className="text-xl font-bold text-gray-900 mb-1">{userData?.name}</h1>
                <p className="text-gray-500 text-xs mb-4">Member since {new Date(userData?.created_at).toLocaleDateString()}</p>
                
                <div className="w-full flex items-center justify-center space-x-2 mb-4">
                  {kycData ? (
                    <div className={`px-3 py-1 rounded-full text-xs font-medium ${
                      kycData.kyc_status === 'approved' 
                        ? 'bg-green-100 text-green-700' 
                        : kycData.kyc_status === 'pending' 
                          ? 'bg-yellow-100 text-yellow-700'
                          : kycData.kyc_status === 'rejected'
                            ? 'bg-red-100 text-red-700'
                            : 'bg-gray-100 text-gray-700'
                    }`}>
                      {kycData.kyc_status.charAt(0).toUpperCase() + kycData.kyc_status.slice(1)}
                    </div>
                  ) : (
                    <div className="px-3 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-700">
                      KYC Required
                    </div>
                  )}
                </div>
              </div>
              
              <div className="border-t border-gray-100 pt-4 mt-2">
                <ul className="space-y-1">
                  <li>
                    <button 
                      onClick={() => setActiveTab('profile')}
                      className={`w-full text-left px-3 py-2 rounded-lg text-sm flex items-center ${
                        activeTab === 'profile' 
                          ? 'bg-blue-50 text-blue-700 font-medium' 
                          : 'text-gray-600 hover:bg-gray-50'
                      }`}
                    >
                      <User className="w-4 h-4 mr-2" /> Personal Information
                    </button>
                  </li>
                  <li>
                    <button 
                      onClick={() => setActiveTab('documents')}
                      className={`w-full text-left px-3 py-2 rounded-lg text-sm flex items-center ${
                        activeTab === 'documents' 
                          ? 'bg-blue-50 text-blue-700 font-medium' 
                          : 'text-gray-600 hover:bg-gray-50'
                      }`}
                    >
                      <FileText className="w-4 h-4 mr-2" /> My Documents
                    </button>
                  </li>
                  <li>
                    <button 
                      onClick={() => setActiveTab('activity')}
                      className={`w-full text-left px-3 py-2 rounded-lg text-sm flex items-center ${
                        activeTab === 'activity' 
                          ? 'bg-blue-50 text-blue-700 font-medium' 
                          : 'text-gray-600 hover:bg-gray-50'
                      }`}
                    >
                      <Clock className="w-4 h-4 mr-2" /> Recent Activity
                    </button>
                  </li>
                  <li>
                    <button 
                      onClick={() => setActiveTab('settings')}
                      className={`w-full text-left px-3 py-2 rounded-lg text-sm flex items-center ${
                        activeTab === 'settings' 
                          ? 'bg-blue-50 text-blue-700 font-medium' 
                          : 'text-gray-600 hover:bg-gray-50'
                      }`}
                    >
                      <Settings className="w-4 h-4 mr-2" /> Settings
                    </button>
                  </li>
                </ul>
              </div>
            </div>
          </div>
          
          {/* Main Content */}
          <div className="md:col-span-3">
            {activeTab === 'profile' && (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                <div className="flex justify-between items-center p-5 border-b border-gray-200">
                  <h2 className="text-lg font-bold text-gray-900">Personal Information</h2>
                  {!isEditMode && (
                    <button 
                      className="flex items-center text-blue-600 text-sm font-medium hover:text-blue-800 transition-colors"
                      onClick={() => setIsEditMode(true)}
                    >
                      <Edit2 className="w-4 h-4 mr-1" /> Edit
                    </button>
                  )}
                </div>
                
                {!kycData && !isEditMode ? (
                  <div className="p-5">
                    <div className="text-center py-5">
                      <div className="mb-4 p-2 rounded-full bg-yellow-50 inline-block">
                        <Shield className="w-8 h-8 text-yellow-500" />
                      </div>
                      <h3 className="text-lg font-bold text-gray-900 mb-2">KYC Verification Required</h3>
                      <p className="text-sm text-gray-600 mb-4">
                        Please complete your profile by providing required information and documents for verification.
                      </p>
                      <button 
                        onClick={() => setIsEditMode(true)}
                        className="px-4 py-2 bg-blue-600 rounded-md text-sm text-white hover:bg-blue-700 transition-colors"
                      >
                        Complete Profile
                      </button>
                    </div>
                  </div>
                ) : isEditMode ? (
                  <form onSubmit={handleEditSubmit} className="p-5">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                      <div>
                        <label className="block text-gray-700 text-xs font-medium mb-1">Full Name</label>
                        <input 
                          type="text" 
                          name="name" 
                          value={editData.name} 
                          onChange={handleEditChange}
                          className="w-full p-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-gray-700 text-xs font-medium mb-1">Email Address</label>
                        <input 
                          type="email" 
                          name="email" 
                          value={editData.email} 
                          onChange={handleEditChange}
                          className="w-full p-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-gray-700 text-xs font-medium mb-1">Phone Number</label>
                        <input 
                          type="tel" 
                          name="phone" 
                          value={editData.phone} 
                          onChange={handleEditChange}
                          className="w-full p-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                        />
                      </div>
                      <div>
                        <label className="block text-gray-700 text-xs font-medium mb-1">Date of Birth</label>
                        <input 
                          type="date" 
                          name="dob" 
                          value={editData.dob} 
                          onChange={handleEditChange}
                          className="w-full p-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                          required={!kycData}
                        />
                      </div>
                      <div>
                        <label className="block text-gray-700 text-xs font-medium mb-1">Gender</label>
                        <select 
                          name="gender" 
                          value={editData.gender} 
                          onChange={handleEditChange}
                          className="w-full p-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                          required={!kycData}
                        >
                          <option value="">Select gender</option>
                          <option value="male">Male</option>
                          <option value="female">Female</option>
                          <option value="other">Other</option>
                          <option value="prefer_not_to_say">Prefer not to say</option>
                        </select>
                      </div>
                      <div className="md:col-span-2">
                        <label className="block text-gray-700 text-xs font-medium mb-1">Address</label>
                        <textarea 
                          name="address" 
                          value={editData.address} 
                          onChange={handleEditChange}
                          className="w-full p-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                          rows="2"
                          required={!kycData}
                        />
                      </div>
                    </div>
                    
                    {!kycData && (
                      <div className="mt-5 grid grid-cols-1 md:grid-cols-2 gap-5">
                        <div>
                          <label className="block text-gray-700 text-xs font-medium mb-1">Profile Photo</label>
                          <input 
                            type="file" 
                            name="photo"
                            className="w-full p-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                            required
                            accept="image/*"
                            onChange={handleFileChange}
                          />
                          <p className="text-xs text-gray-500 mt-1">Upload a clear photo of yourself</p>
                        </div>
                        <div>
                          <label className="block text-gray-700 text-xs font-medium mb-1">ID Document</label>
                          <input 
                            type="file" 
                            name="document_photo"
                            className="w-full p-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                            required
                            accept="image/*,.pdf"
                            onChange={handleFileChange}
                          />
                          <p className="text-xs text-gray-500 mt-1">Upload your ID card, passport, or driver's license</p>
                        </div>
                      </div>
                    )}
                    
                    <div className="flex justify-end space-x-3 mt-5 pt-4 border-t border-gray-100">
                      <button 
                        type="button"
                        className="px-4 py-2 border border-gray-300 rounded-md text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                        onClick={() => setIsEditMode(false)}
                      >
                        Cancel
                      </button>
                      <button 
                        type="submit"
                        className="px-4 py-2 bg-blue-600 rounded-md text-sm text-white hover:bg-blue-700 transition-colors"
                      >
                        {kycData ? 'Save Changes' : 'Submit KYC'}
                      </button>
                    </div>
                  </form>
                ) : (
                  <div className="p-5 space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                      <div>
                        <h3 className="text-sm font-medium text-gray-500 mb-2">Personal Details</h3>
                        <div className="space-y-3">
                          <div className="flex items-start">
                            <User className="w-4 h-4 text-gray-400 mt-0.5 mr-2" />
                            <div>
                              <p className="text-xs text-gray-500">Full Name</p>
                              <p className="text-sm text-gray-900">{userData.name}</p>
                            </div>
                          </div>
                          {kycData && kycData.dob && (
                            <div className="flex items-start">
                              <Calendar className="w-4 h-4 text-gray-400 mt-0.5 mr-2" />
                              <div>
                                <p className="text-xs text-gray-500">Date of Birth</p>
                                <p className="text-sm text-gray-900">{new Date(kycData.dob).toLocaleDateString()}</p>
                              </div>
                            </div>
                          )}
                          {kycData && kycData.gender && (
                            <div className="flex items-start">
                              <Shield className="w-4 h-4 text-gray-400 mt-0.5 mr-2" />
                              <div>
                                <p className="text-xs text-gray-500">Gender</p>
                                <p className="text-sm text-gray-900">{kycData.gender.charAt(0).toUpperCase() + kycData.gender.slice(1)}</p>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                      
                      <div>
                        <h3 className="text-sm font-medium text-gray-500 mb-2">Contact Information</h3>
                        <div className="space-y-3">
                          <div className="flex items-start">
                            <Mail className="w-4 h-4 text-gray-400 mt-0.5 mr-2" />
                            <div>
                              <p className="text-xs text-gray-500">Email Address</p>
                              <p className="text-sm text-gray-900">{kycData ? kycData.email : userData.email}</p>
                            </div>
                          </div>
                          <div className="flex items-start">
                            <Phone className="w-4 h-4 text-gray-400 mt-0.5 mr-2" />
                            <div>
                              <p className="text-xs text-gray-500">Phone Number</p>
                              <p className="text-sm text-gray-900">{userData.phone}</p>
                            </div>
                          </div>
                          {kycData && kycData.address && (
                            <div className="flex items-start">
                              <MapPin className="w-4 h-4 text-gray-400 mt-0.5 mr-2" />
                              <div>
                                <p className="text-xs text-gray-500">Address</p>
                                <p className="text-sm text-gray-900">{kycData.address}</p>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    {kycData && (
                      <div className="pt-4 mt-2 border-t border-gray-100">
                        <h3 className="text-sm font-medium text-gray-500 mb-2">KYC Status</h3>
                        <div className="flex items-center">
                          <div className={`px-3 py-1 rounded-full text-xs font-medium ${
                            kycData.kyc_status === 'approved' 
                              ? 'bg-green-100 text-green-700' 
                              : kycData.kyc_status === 'pending' 
                                ? 'bg-yellow-100 text-yellow-700'
                                : kycData.kyc_status === 'rejected'
                                  ? 'bg-red-100 text-red-700'
                                  : 'bg-gray-100 text-gray-700'
                          }`}>
                            {kycData.kyc_status.charAt(0).toUpperCase() + kycData.kyc_status.slice(1)}
                          </div>
                          <span className="ml-2 text-xs text-gray-500">
                            Your KYC verification is {kycData.kyc_status}
                          </span>
                        </div>
                        {kycData.kyc_status === 'rejected' && kycData.rejection_reason && (
                          <div className="mt-2 p-2 bg-red-50 rounded text-xs text-red-700">
                            <strong>Reason for rejection:</strong> {kycData.rejection_reason}
                          </div>
                        )}
                      </div>
                    )}
                    
                    
                  </div>
                )}
              </div>
            )}

            {activeTab === 'documents' && (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                <div className="p-5 border-b border-gray-200 flex justify-between items-center">
                  <h2 className="text-lg font-bold text-gray-900">My Documents</h2>
                 
                </div>
                
                <div className="p-5">
                  {kycData ? (
                    <>
                      {kycData.documents ? (
                        <div className="overflow-x-auto">
                          <div className="flex items-center mb-4">
                            <FileText className="w-4 h-4 text-gray-400 mr-2" />
                            <span className="text-sm font-medium">ID Document</span>
                            <span className={`ml-2 px-2 py-1 text-xs rounded-full ${
                              kycData.kyc_status === 'approved' 
                                ? 'bg-green-100 text-green-700' 
                                : kycData.kyc_status === 'pending' 
                                  ? 'bg-yellow-100 text-yellow-700'
                                  : 'bg-red-100 text-red-700'
                            }`}>
                              {kycData.kyc_status.charAt(0).toUpperCase() + kycData.kyc_status.slice(1)}
                            </span>
                          </div>
                          
                          <div className="border border-gray-200 rounded-lg p-3 mb-4 flex items-center justify-between">
                            <div className="flex items-center">
                              {kycData.documents && kycData.documents_url ? (
                                <img 
                                  src={kycData.documents_url} 
                                  alt="Document thumbnail" 
                                  className="w-12 h-12 object-cover rounded mr-3"
                                  onError={(e) => {
                                    console.error('Document image failed to load:', e.target.src);
                                    e.target.onerror = null;
                                    e.target.style.display = 'none';
                                    e.target.nextElementSibling.style.display = 'flex';
                                  }}
                                />
                              ) : null}
                              {(!kycData.documents || !kycData.documents_url) && (
                                <div className="w-12 h-12 bg-blue-100 rounded flex items-center justify-center mr-3">
                                  <FileText className="w-6 h-6 text-blue-400" />
                                </div>
                              )}
                              <div className="w-12 h-12 bg-blue-100 rounded flex items-center justify-center mr-3" style={{display: 'none'}}>
                                <FileText className="w-6 h-6 text-blue-400" />
                              </div>
                              <div>
                                <p className="text-sm font-medium text-gray-900">ID Document</p>
                                <p className="text-xs text-gray-500">
                                  Uploaded on {new Date(kycData.created_at).toLocaleDateString()}
                                </p>
                              </div>
                            </div>
                            <button className="text-blue-600 hover:text-blue-800 text-sm font-medium">
                              View
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="text-center py-8">
                          <FileText className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                          <h3 className="text-lg font-medium text-gray-700 mb-1">No documents yet</h3>
                          <p className="text-sm text-gray-500 mb-4">
                            You haven't uploaded any documents yet
                          </p>
                        </div>
                      )}
                      
                      <div className="mt-5 pt-4 border-t border-gray-100 flex justify-center">
                        <button className="flex items-center text-blue-600 hover:text-blue-800 text-sm font-medium">
                          Upload New Document
                          <ChevronRight className="w-4 h-4 ml-1" />
                        </button>
                      </div>
                    </>
                  ) : (
                    <div className="text-center py-8">
                      <Shield className="w-12 h-12 text-yellow-400 mx-auto mb-3" />
                      <h3 className="text-lg font-medium text-gray-700 mb-1">KYC Required</h3>
                      <p className="text-sm text-gray-500 mb-4">
                        Please complete your KYC verification first to manage documents
                      </p>
                      <button 
                        onClick={() => {
                          setActiveTab('profile');
                          setIsEditMode(true);
                        }}
                        className="px-4 py-2 bg-blue-600 rounded-md text-sm text-white hover:bg-blue-700 transition-colors"
                      >
                        Complete KYC
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}

            {activeTab === 'activity' && (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                <div className="p-5 border-b border-gray-200">
                  <h2 className="text-lg font-bold text-gray-900">Recent Activity</h2>
                </div>
                
                <div className="p-5">
                  {kycData ? (
                    <div className="space-y-4">
                      {/* If we had real activity data, we would map through it here */}
                      {/* For now, showing basic KYC-related activity */}
                      <div className="flex items-start p-3 border border-gray-100 rounded-lg">
                        <div className="p-2 bg-blue-50 rounded-full mr-3">
                          <Clock className="w-4 h-4 text-blue-500" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900">KYC Status Updated</p>
                          <p className="text-xs text-gray-500">
                            Your KYC is now {kycData.kyc_status}
                          </p>
                          <p className="text-xs text-gray-400 mt-1">{new Date(kycData.updated_at).toLocaleDateString()}</p>
                        </div>
                      </div>
                      
                      <div className="flex items-start p-3 border border-gray-100 rounded-lg">
                        <div className="p-2 bg-blue-50 rounded-full mr-3">
                          <Clock className="w-4 h-4 text-blue-500" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900">KYC Documents Submitted</p>
                          <p className="text-xs text-gray-500">
                            You've submitted your identity documents for verification
                          </p>
                          <p className="text-xs text-gray-400 mt-1">{new Date(kycData.created_at).toLocaleDateString()}</p>
                        </div>
                      </div>
                      
                      <div className="flex items-start p-3 border border-gray-100 rounded-lg">
                        <div className="p-2 bg-blue-50 rounded-full mr-3">
                          <Clock className="w-4 h-4 text-blue-500" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900">Account Created</p>
                          <p className="text-xs text-gray-500">
                            Your account was successfully created
                          </p>
                          <p className="text-xs text-gray-400 mt-1">{new Date(userData.created_at).toLocaleDateString()}</p>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <Clock className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                      <h3 className="text-lg font-medium text-gray-700 mb-1">No Activity Yet</h3>
                      <p className="text-sm text-gray-500 mb-4">
                        Complete your KYC to start using all features
                      </p>
                      <button 
                        onClick={() => {
                          setActiveTab('profile');
                          setIsEditMode(true);
                        }}
                        className="px-4 py-2 bg-blue-600 rounded-md text-sm text-white hover:bg-blue-700 transition-colors"
                      >
                        Complete KYC
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}

            {activeTab === 'settings' && (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                <div className="p-5 border-b border-gray-200">
                  <h2 className="text-lg font-bold text-gray-900">Account Settings</h2>
                  <p className="text-sm text-gray-500 mt-1">Manage your account security and preferences</p>
                </div>
                
                <div className="p-5">
                  {/* Change Password Section */}
                  <div className="mb-8">
                    <div className="flex items-center mb-4">
                      <div className="p-2 bg-blue-50 rounded-lg mr-3">
                        <Key className="w-5 h-5 text-blue-600" />
                      </div>
                      <div>
                        <h3 className="text-lg font-medium text-gray-900">Change Password</h3>
                        <p className="text-sm text-gray-500">Update your password to keep your account secure</p>
                      </div>
                    </div>
                    
                    <form onSubmit={handleChangePassword} className="max-w-md">
                      <div className="space-y-4">
                        {/* Current Password */}
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Current Password
                          </label>
                          <div className="relative">
                            <input
                              type={showPasswords.current ? 'text' : 'password'}
                              name="current_password"
                              value={passwordData.current_password}
                              onChange={handlePasswordChange}
                              className={`w-full px-3 py-2 border rounded-md pr-10 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition ${
                                passwordErrors.current_password ? 'border-red-300' : 'border-gray-300'
                              }`}
                              placeholder="Enter your current password"
                            />
                            <button
                              type="button"
                              onClick={() => togglePasswordVisibility('current')}
                              className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                            >
                              {showPasswords.current ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                            </button>
                          </div>
                          {passwordErrors.current_password && (
                            <p className="text-sm text-red-600 mt-1">{passwordErrors.current_password}</p>
                          )}
                        </div>

                        {/* New Password */}
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            New Password
                          </label>
                          <div className="relative">
                            <input
                              type={showPasswords.new ? 'text' : 'password'}
                              name="password"
                              value={passwordData.password}
                              onChange={handlePasswordChange}
                              className={`w-full px-3 py-2 border rounded-md pr-10 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition ${
                                passwordErrors.password ? 'border-red-300' : 'border-gray-300'
                              }`}
                              placeholder="Enter your new password"
                            />
                            <button
                              type="button"
                              onClick={() => togglePasswordVisibility('new')}
                              className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                            >
                              {showPasswords.new ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                            </button>
                          </div>
                          {passwordErrors.password && (
                            <p className="text-sm text-red-600 mt-1">{passwordErrors.password}</p>
                          )}
                          <p className="text-xs text-gray-500 mt-1">Password must be at least 6 characters long</p>
                        </div>

                        {/* Confirm New Password */}
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Confirm New Password
                          </label>
                          <div className="relative">
                            <input
                              type={showPasswords.confirm ? 'text' : 'password'}
                              name="password_confirmation"
                              value={passwordData.password_confirmation}
                              onChange={handlePasswordChange}
                              className={`w-full px-3 py-2 border rounded-md pr-10 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition ${
                                passwordErrors.password_confirmation ? 'border-red-300' : 'border-gray-300'
                              }`}
                              placeholder="Confirm your new password"
                            />
                            <button
                              type="button"
                              onClick={() => togglePasswordVisibility('confirm')}
                              className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                            >
                              {showPasswords.confirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                            </button>
                          </div>
                          {passwordErrors.password_confirmation && (
                            <p className="text-sm text-red-600 mt-1">{passwordErrors.password_confirmation}</p>
                          )}
                        </div>
                      </div>

                      <div className="mt-6">
                        <button
                          type="submit"
                          disabled={isChangingPassword}
                          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {isChangingPassword ? (
                            <>
                              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                              Changing Password...
                            </>
                          ) : (
                            <>
                              <Key className="w-4 h-4 mr-2" />
                              Change Password
                            </>
                          )}
                        </button>
                      </div>
                    </form>
                  </div>

                  {/* Future Settings Sections */}
                  <div className="border-t border-gray-200 pt-6">
                    <div className="text-center py-4">
                      <div className="p-3 bg-gray-50 rounded-lg inline-block">
                        <Settings className="w-6 h-6 text-gray-400" />
                      </div>
                      <h3 className="text-sm font-medium text-gray-700 mt-2">More Settings Coming Soon</h3>
                      <p className="text-xs text-gray-500 mt-1">
                        Additional settings like language preferences will be available soon.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* OTP Verification Modal */}
      {showOtpModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Mail className="w-8 h-8 text-blue-600" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Email Verification</h3>
              <p className="text-sm text-gray-500">
                We've sent a 6-digit verification code to <strong>{editData.email}</strong>
              </p>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Enter Verification Code
              </label>
              <input
                type="text"
                value={otpCode}
                onChange={(e) => {
                  const value = e.target.value.replace(/\D/g, '').slice(0, 6);
                  setOtpCode(value);
                }}
                placeholder="000000"
                className="w-full px-4 py-3 text-center text-lg border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none tracking-widest"
                maxLength="6"
                autoComplete="off"
              />
            </div>

            {otpTimer > 0 && (
              <div className="text-center mb-4">
                <p className="text-sm text-gray-500">
                  Code expires in {Math.floor(otpTimer / 60)}:{(otpTimer % 60).toString().padStart(2, '0')}
                </p>
              </div>
            )}

            <div className="flex space-x-3 mb-4">
              <button
                onClick={handleOtpVerification}
                disabled={isOtpVerifying || otpCode.length !== 6}
                className="flex-1 bg-blue-600 text-white py-3 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isOtpVerifying ? (
                  <div className="flex items-center justify-center">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                    Verifying...
                  </div>
                ) : (
                  'Verify & Update Profile'
                )}
              </button>
            </div>

            <div className="flex justify-between items-center text-sm">
              <button
                onClick={handleResendOtp}
                disabled={!canResendOtp || isOtpSending}
                className="text-blue-600 hover:text-blue-800 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isOtpSending ? 'Sending...' : 'Resend Code'}
              </button>

              <button
                onClick={handleOtpModalClose}
                className="text-gray-500 hover:text-gray-700"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserProfile; 