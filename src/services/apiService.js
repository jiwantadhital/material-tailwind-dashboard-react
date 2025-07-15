import axios from 'axios';
import { pusherService } from './pusher_init';

const API_BASE_URL = 'https://sajilonotary.xyz';
// const API_BASE_URL = 'http://localhost:8000/';

const apiService = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor to add Authorization header if a token is available
apiService.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

// Interceptor to handle errors globally
apiService.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API Error:', error.response || error.message);
    return Promise.reject(error.response?.data || error.message);
  }
);

export const authService = {

    //get saved user data
    getSavedUserData: () => {
      const user = JSON.parse(localStorage.getItem('user'));
      const kycRecord = JSON.parse(localStorage.getItem('kyc_record'));
      return { user, kycRecord };
    },


    signIn: async (phone, password,ftoken) => {
      try {
        // Login request
        const response = await apiService.post('/api/login', { phone, password ,ftoken});
        const { token, ...userData } = response.data.data;
        
        // Check if phone is verified before proceeding with full login
        if (token && userData.phone_verified === 1) {
          localStorage.setItem('token', token);
          
          // Make the init-after-login API call
          const initResponse = await apiService.get('/api/init-after-login', {
            headers: { Authorization: `Bearer ${token}` }
          });

          // Use services from initResponse - they are already filtered based on user role
          const { user, kyc_record, services } = initResponse.data.data;
          localStorage.setItem('user', JSON.stringify(user));
          localStorage.setItem('kyc_record', JSON.stringify(kyc_record));
          localStorage.setItem('services', JSON.stringify({ data: services }));
          // Return combined data
          return {
            ...userData,
            user,
            kyc_record
          };
        }
        
        // If phone not verified, return data with token but don't store token yet
        // This allows us to use the token for verification but keeps user in auth flow
        return {
          ...userData,
          token // Include token in response but don't store it
        };
      } catch (error) {
        console.error('Sign-in error:', error);
        throw error;
      }
    },
  
    // Complete login process after phone verification
    completeLoginAfterVerification: async (token) => {
      try {
        localStorage.setItem('token', token);
        
        // Make the init-after-login API call
        const initResponse = await apiService.get('/api/init-after-login', {
          headers: { Authorization: `Bearer ${token}` }
        });

        // Use services from initResponse - they are already filtered based on user role
        const { user, kyc_record, services } = initResponse.data.data;
        localStorage.setItem('user', JSON.stringify(user));
        localStorage.setItem('kyc_record', JSON.stringify(kyc_record));
        localStorage.setItem('services', JSON.stringify({ data: services }));
        
        return {
          user,
          kyc_record,
          services: { data: services }
        };
      } catch (error) {
        console.error('Complete login error:', error);
        throw error;
      }
    },

    signOut: () => {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      localStorage.removeItem('kyc_record');
      localStorage.removeItem('services');
    },
  
    getCurrentUser: () => {
      const token = localStorage.getItem('token');
      if (!token) return null;
  
      // Optionally decode the token for user info
      return token;
    },

    getCurrentUserId: () => {
      const user = JSON.parse(localStorage.getItem('user'));
      if (!user) return null;

      return user.id;
    },

    //create admin
    createAdmin: async (data) => {
      console.log("this is data",data.services);
      const token = localStorage.getItem('token');
      const formData = new FormData();
      formData.append('photo', data.photo);
      formData.append('name', data.name);
      formData.append('email', data.email);
      formData.append('phone', data.phone);
      formData.append('dob', data.dob);
      formData.append('address', data.address);
      formData.append('gender', data.gender);
      formData.append('password', data.password);
      formData.append('password_confirmation', data.password);
      data.services.forEach(serviceId => {
        formData.append('service_id[]', serviceId);
      });
      
      const response = await apiService.post('/api/create-admin', formData, {
        headers: { Authorization: `Bearer ${token}` ,'Content-Type': 'multipart/form-data'},
      });
      return response.data;
    },
    
    getAllUsers: async (filter) => {
      const token = localStorage.getItem('token');
      console.log("this is token",token);
      if (!token) {
        throw new Error('Authentication required to fetch users');
      }

      try {
        const response = await apiService.get(`/api/get-users/${filter}`,{
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        return response.data;
      } catch (error) {
        console.error('Get users error:', error);
        throw error;
      }
    },

    //get single user with kyc record
    getSingleUser: async (userId) => {
      const token = localStorage.getItem('token');
      const response = await apiService.get(`/api/get-user-with-kyc-record/${userId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return response.data;
    },

    //active /deactive user
    activeDeactiveUser: async (userId, status) => {
      const token = localStorage.getItem('token');
      const response = await apiService.post(`/api/update-user-status/${userId}`, { status }, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return response.data;
    },


    //approve/reject kyc
    approveKyc: async (userId, status, reason) => {
        try {
          const token = localStorage.getItem('token');
          if (!token) {
            throw new Error("Authorization token not found.");
          }
      
          // Validate that status is a string
          if (typeof status !== "string") {
            throw new Error("Invalid status type. Status must be a string.");
          }
      
          const response = await apiService.post(
            `/api/update-kyc-status/${userId}`,
            {
              kyc_status: status, // Ensure this matches the allowed values
              rejection_reason: reason, // Optional, only needed for "rejected" status
            },
            {
              headers: { Authorization: `Bearer ${token}` },
            }
          );
      
          return response.data;
        } catch (error) {
          if (error.response?.status === 422) {
            console.error("Validation error:", error.response.data.error);
          } else {
            console.error("Error approving KYC:", error.message);
          }
          throw error;
        }
      },



      //dashboard
      //carousel

      //upload carousel image
      uploadCarouselImage: async (image, title, htmlContent) => {
        const token = localStorage.getItem('token');
        const formData = new FormData();
        formData.append('image', image);
        formData.append('title', title);
        formData.append('html_content', htmlContent || '');

        const response = await apiService.post('/api/upload-carousel', formData, {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'multipart/form-data',
          },
        });
        return response.data;
      },

      //get carousel images
      getCarouselImages: async () => {
        const token = localStorage.getItem('token');
        const response = await apiService.get('/api/get-carousel', {
          headers: { Authorization: `Bearer ${token}` },
        });
        return response.data;
      },


      //get documents
      getDocuments: async (page = 1, status = "pending", code, progress_status) => {
        try {
            const token = localStorage.getItem('token');
            const response = await apiService.get(`/api/get-documents-list?page=${page}&status=${status}&code=${code}&progress_status=${progress_status}`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            return response.data;
        } catch (error) {
            console.error("Error fetching documents:", error);
            throw error; // Rethrow the error for further handling
        }
    },

      //get documents by id
      getDocumentById: async (documentId) => {
        const token = localStorage.getItem('token');
        const response = await apiService.get(`/api/get-document-by-id/${documentId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        return response.data;
      },

      //get documents by user id
      getUserDocuments: async (userId, page = 1) => {
        const token = localStorage.getItem('token');
        const response = await apiService.get(`/api/get-documents-by-user-id/${userId}?page=${page}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        return response.data;
      },

      //update document
      updateDocument: async (documentId, data) => {
        const token = localStorage.getItem('token');
        const response = await apiService.post(`/api/update-document/${documentId}`, data, {
          headers: { 
            Authorization: `Bearer ${token}`,
            'Content-Type': 'multipart/form-data',
          },
        });
        return response.data;
      },

      //remove document
      removeDocument: async (data) => {
        const token = localStorage.getItem('token');
        const response = await apiService.post(`/api/reject-document-with-reason`, data, {
          headers: { Authorization: `Bearer ${token}` },
        });
        return response.data;
      },

      //reject document
      rejectDocument: async (data) => {
        const token = localStorage.getItem('token');
        const response = await apiService.post(`/api/reject-by-admin`, data, {
          headers: { Authorization: `Bearer ${token}` },
        });
      },

      //payment
      paymentForDocument: async (documentId, data) => {
        const token = localStorage.getItem('token');
        const response = await apiService.post(`/api/payment-for-document/${documentId}`, data, {
          headers: { 
            Authorization: `Bearer ${token}`,
            'Content-Type': 'multipart/form-data',
          },
        });
        return response.data;
      },


      //upload recheck
      uploadRecheckAndFinalFile: async (documentId, data) => {
        const token = localStorage.getItem('token');
        const response = await apiService.post(`/api/upload-recheck-file/${documentId}`, data, {
          headers: { 
            Authorization: `Bearer ${token}`,
            'Content-Type': 'multipart/form-data',
          },
        });
        return response.data;
      },


      //mark as read
      markAsRead: async (documentId) => {
        const token = localStorage.getItem('token');
         await apiService.get(`/api/mark-document-as-new/${documentId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
      },


      //mark as read for admin
      markAsReadForAdmin: async (documentId) => {
        const token = localStorage.getItem('token');
         await apiService.get(`/api/has-new-message/${documentId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
      },

      

      //chat section
      sendMessage: async (formData) => {
        const token = localStorage.getItem('token');
        const response = await apiService.post('/api/send-message', formData, {
          headers: { 
            Authorization: `Bearer ${token}`,
            'Content-Type': 'multipart/form-data',
          },
        });
        return response.data;
      },

      //get messages
      getMessages: async (documentId) => {
        const token = localStorage.getItem('token');
        const response = await apiService.get(`/api/get-messages/${documentId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        return response.data;
      },




      //basic settings
      createCountry: async (data) => {
        const token = localStorage.getItem('token');
        const response = await apiService.post('/api/create-country', data, {
          headers: { Authorization: `Bearer ${token}` },
        });
        return response.data;
      },

      getCountries: async () => {
        const token = localStorage.getItem('token');
        const response = await apiService.get('/api/get-countries', {
          headers: { Authorization: `Bearer ${token}` },
        });
        return response.data;
      },

      updateCountry: async (countryId, data) => {
        const token = localStorage.getItem('token');
        const response = await apiService.post(`/api/update-country/${countryId}`, data, {
          headers: { Authorization: `Bearer ${token}` },
        });
        return response.data;
      },

      deleteCountry: async (countryId) => {
        const token = localStorage.getItem('token');
        const response = await apiService.delete(`/api/delete-country/${countryId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        return response.data;
      },

      //services
      createService: async (data) => {
        console.log("this is data",data);
        const token = localStorage.getItem('token');
        const response = await apiService.post('/api/create-service', data, {
          headers: { Authorization: `Bearer ${token}` ,'Content-Type': 'multipart/form-data'},
        });
        return response.data;
      },

      getServices: async () => {
        const token = localStorage.getItem('token');
        const response = await apiService.get('/api/get-services', {
          headers: { Authorization: `Bearer ${token}` },
        });
        return response.data;
      },

      getServiceTypes: async () => {
        const token = localStorage.getItem('token');
        const response = await apiService.get('/api/get-service-types', {
          headers: { Authorization: `Bearer ${token}` },
        });
        return response.data;
      },

      getAllServices: async () => {
        const token = localStorage.getItem('token');
        const response = await apiService.get('/api/get-all-services', {
          headers: { Authorization: `Bearer ${token}` },
        });
        return response.data;
      },

      updateService: async (serviceId, data) => {
        const token = localStorage.getItem('token');
        const response = await apiService.post(`/api/update-service/${serviceId}`, data, {
          headers: { Authorization: `Bearer ${token}` },
        });
        return response.data;
      },

      deleteService: async (serviceId) => {
        const token = localStorage.getItem('token');
        const response = await apiService.delete(`/api/delete-service/${serviceId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        return response.data;
      },

      //activate/deactivate service
      activateService: async (serviceId,isActive) => {
        const token = localStorage.getItem('token');
        const response = await apiService.post(`/api/activate-service/${serviceId}/${isActive}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        return response.data;
      },


      //dashboard for admin
      getDashboardData: async () => {
        const token = localStorage.getItem('token');
        const response = await apiService.get('/api/get-dashboard-data-for-admin', {
          headers: { Authorization: `Bearer ${token}` },
        });
        return response.data;
      },


      //get report
      getReport: async () => {
        const token = localStorage.getItem('token');
        const response = await apiService.get('/api/get-reports', {
          headers: { Authorization: `Bearer ${token}` },
        });
      },
      //get report by id
      getReportById: async (reportId) => {
        const token = localStorage.getItem('token');
        const response = await apiService.get(`/api/get-report-by-id/${reportId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
      },


      //front end
      getFrontEndData: async () => {
        const response = await apiService.get('/api/get-dashboard-data-for-web/');
        // Save countries to localStorage if present in response
        if (response.data?.data?.countries) {
          localStorage.setItem('countries', JSON.stringify(response.data.data.countries));
        }
        return response.data;
      },

      getservicebyId: async (serviceId) => {
        const response = await apiService.get(`/api/get-service-by-id/${serviceId}`);
        return response.data;
      },

      // Get all services for public access (All Services page)
      getAllServicesPublic: async () => {
        try {
          // Try the new public endpoint first
          const response = await apiService.get('/api/get-all-services-public');
          return response.data;
        } catch (error) {
          // Fallback to the regular endpoint (now public too)
          const response = await apiService.get('/api/get-all-services');
          return response.data;
        }
      },


      //send documents
      sendDocuments: async (data) => {
        const token = localStorage.getItem('token');
        const formData = new FormData();
        
        // Add basic document fields
        formData.append('title', data.title);
        formData.append('description', data.description);
        formData.append('country_id', data.countryId);
        formData.append('service_id', data.serviceId);
        
        // Add file(s)
        if (data.files) {
          // Handle single file
          if (!Array.isArray(data.files)) {
            formData.append('file', data.files);
          } 
          // Handle multiple files if needed
          else {
            data.files.forEach(file => {
              formData.append('file', file);
            });
          }
        }
        
        const response = await apiService.post('/api/upload-document', formData, {
          headers: { 
            Authorization: `Bearer ${token}`,
            'Content-Type': 'multipart/form-data'
          },
        });
        
        return response.data;
      },


      //init after login for frontend
      initAfterLogin: async () => {
        const response = await apiService.get('/api/init-after-login');
        return response.data;
      },

      //upload kyc
      uploadKyc: async (data) => {
        const token = localStorage.getItem('token');
        const response = await apiService.post('/api/upload-kyc', data, {
          headers: { Authorization: `Bearer ${token}` ,'Content-Type': 'multipart/form-data'},
        });
        return response.data;
      },

      //accept reject by user for document
      acceptRejectByUser: async (data) => {
        const token = localStorage.getItem('token');
        const response = await apiService.post(`/api/change-is-accepted-by-user/${data.document_id}`, data, {
          headers: { Authorization: `Bearer ${token}` },
        });
        return response.data;
      },

      //report problem with final document
      reportProblem: async (data) => {
        const token = localStorage.getItem('token');
        const response = await apiService.post(`/api/report-document-problem`, data, {
          headers: { Authorization: `Bearer ${token}` },
        });
        return response.data;
      },

      //create service type
      createServiceType: async (data) => {
        const token = localStorage.getItem('token');
        const response = await apiService.post('/api/create-doc-type', data, {
          headers: { Authorization: `Bearer ${token}` },
        });
        return response.data;
      },
      

      //get service types
      getServiceTypes: async () => {
        const token = localStorage.getItem('token');
        const response = await apiService.get('/api/get-doc-types', {
          headers: { Authorization: `Bearer ${token}` },
        });
        return response.data;
      },

      //update service type
      updateServiceType: async (serviceTypeId, data) => {
        const token = localStorage.getItem('token');
        const response = await apiService.post(`/api/update-doc-type/${serviceTypeId}`, data, {
          headers: { Authorization: `Bearer ${token}` },
        });
        return response.data;
      },

      // Payment Gateway Integration APIs
      getPaymentInstrumentDetails: async (data) => {
        const response = await apiService.post('/api/getPaymentInstrumentDetails', data);
        return response.data;
      },

      getServiceCharge: async (data) => {
        const response = await apiService.post('/api/getServiceCharge', data);
        return response.data;
      },

      getProcessId: async (data) => {
        const response = await apiService.post('/api/getProcessId', data);
        return response.data;
      },

      checkTransactionStatus: async (data) => {
        const response = await apiService.post('/api/checkTransactionStatus', data);
        return response.data;
      },

      testPaymentConfig: async (data) => {
        const response = await apiService.post('/api/testPaymentConfig', data);
        return response.data;
      },

      // Process payment for document (update payment status)
      processDocumentPayment: async (documentId, paymentData) => {
        const token = localStorage.getItem('token');
        const response = await apiService.post(`/api/process-document-payment/${documentId}`, paymentData, {
          headers: { Authorization: `Bearer ${token}` },
        });
        return response.data;
      },

      // Homepage Management APIs
      
      // Hero Section
      getHeroSection: async () => {
        const token = localStorage.getItem('token');
        const headers = token ? { Authorization: `Bearer ${token}` } : {};
        const response = await apiService.get('/api/homepage/hero-sections', { headers });
        return response.data;
      },

      updateHeroSection: async (data) => {
        const token = localStorage.getItem('token');
        const response = await apiService.post('/api/homepage/hero-section', data, {
          headers: { Authorization: `Bearer ${token}` },
        });
        return response.data;
      },

      // Features Section
      getFeaturesSection: async () => {
        const token = localStorage.getItem('token');
        const headers = token ? { Authorization: `Bearer ${token}` } : {};
        const response = await apiService.get('/api/homepage/features-sections', { headers });
        return response.data;
      },

      updateFeaturesSection: async (data) => {
        const token = localStorage.getItem('token');
        const response = await apiService.post('/api/homepage/features-section', data, {
          headers: { Authorization: `Bearer ${token}` },
        });
        return response.data;
      },

      createFeature: async (data) => {
        const token = localStorage.getItem('token');
        const response = await apiService.post('/api/homepage/features', data, {
          headers: { Authorization: `Bearer ${token}` },
        });
        return response.data;
      },

      updateFeature: async (featureId, data) => {
        const token = localStorage.getItem('token');
        const response = await apiService.put(`/api/homepage/features/${featureId}`, data, {
          headers: { Authorization: `Bearer ${token}` },
        });
        return response.data;
      },

      deleteFeature: async (featureId) => {
        const token = localStorage.getItem('token');
        const response = await apiService.delete(`/api/homepage/features/${featureId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        return response.data;
      },

      // Testimonials Section
      getTestimonialsSection: async () => {
        const token = localStorage.getItem('token');
        const headers = token ? { Authorization: `Bearer ${token}` } : {};
        const response = await apiService.get('/api/homepage/testimonials-sections', { headers });
        return response.data;
      },

      updateTestimonialsSection: async (data) => {
        const token = localStorage.getItem('token');
        const response = await apiService.post('/api/homepage/testimonials-section', data, {
          headers: { Authorization: `Bearer ${token}` },
        });
        return response.data;
      },

      createTestimonial: async (data) => {
        const token = localStorage.getItem('token');
        const response = await apiService.post('/api/homepage/testimonials', data, {
          headers: { Authorization: `Bearer ${token}` },
        });
        return response.data;
      },

      updateTestimonial: async (testimonialId, data) => {
        const token = localStorage.getItem('token');
        const response = await apiService.put(`/api/homepage/testimonials/${testimonialId}`, data, {
          headers: { Authorization: `Bearer ${token}` },
        });
        return response.data;
      },

      deleteTestimonial: async (testimonialId) => {
        const token = localStorage.getItem('token');
        const response = await apiService.delete(`/api/homepage/testimonials/${testimonialId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        return response.data;
      },

      // Call to Action Section
      getCallToActionSection: async () => {
        const token = localStorage.getItem('token');
        const headers = token ? { Authorization: `Bearer ${token}` } : {};
        const response = await apiService.get('/api/homepage/call-to-action-sections', { headers });
        return response.data;
      },

      updateCallToActionSection: async (data) => {
        const token = localStorage.getItem('token');
        const response = await apiService.post('/api/homepage/call-to-action-section', data, {
          headers: { Authorization: `Bearer ${token}` },
        });
        return response.data;
      },

      // OTP Related APIs
      sendOtpEmail: async (email) => {
        const token = localStorage.getItem('token');
        const response = await apiService.post('/api/send-otp-email', { email }, {
          headers: { Authorization: `Bearer ${token}` },
        });
        return response.data;
      },

      verifyOtp: async (email, otp) => {
        const token = localStorage.getItem('token');
        const response = await apiService.post('/api/verify-otp', { email, otp }, {
          headers: { Authorization: `Bearer ${token}` },
        });
        return response.data;
      },

      // Registration API
      register: async (userData) => {
        const response = await apiService.post('/api/register', userData);
        // Don't automatically store token - user should login after registration
        return response.data;
      },

      // Phone OTP Verification APIs
      verifyPhoneNumber: async (phone, otp) => {
        const response = await apiService.post('/api/verify-phone-number', { phone, otp });
        return response.data;
      },

      resendPhoneOtp: async (phone) => {
        const response = await apiService.post('/api/resend-phone-otp', { phone });
        return response.data;
      },

      // Update Password API
      updatePassword: async (passwordData) => {
        const token = localStorage.getItem('token');
        const response = await apiService.post('/api/update-password', passwordData, {
          headers: { Authorization: `Bearer ${token}` },
        });
        return response.data;
      },

      // Forgot Password APIs
      requestOTP: async (phone) => {
        const response = await apiService.post('/api/request-otp', { phone });
        return response.data;
      },

      resetPasswordWithOTP: async (resetData) => {
        const response = await apiService.post('/api/reset-password-with-otp', resetData);
        return response.data;
      },

      // Lawyer Revenue Data API
      getLawyerRevenueData: async () => {
        const token = localStorage.getItem('token');
        const response = await apiService.get('/api/get-lawyer-revenue-data', {
          headers: { Authorization: `Bearer ${token}` },
        });
        return response.data;
      },

      // Mobile Info Menu
      getAllMobileInfoMenuForAdmin: async () => {
        const token = localStorage.getItem('token');
        const response = await apiService.get('/api/admin/mobile-info-menu', {
          headers: { Authorization: `Bearer ${token}` },
        });
        return response.data;
      },

      createMobileInfoMenu: async (data) => {
        const token = localStorage.getItem('token');
        const response = await apiService.post('/api/admin/mobile-info-menu', data, {
          headers: { Authorization: `Bearer ${token}` },
        });
        return response.data;
      },

      updateMobileInfoMenu: async (id, data) => {
        const token = localStorage.getItem('token');
        const response = await apiService.put(`/api/admin/mobile-info-menu/${id}`, data, {
          headers: { Authorization: `Bearer ${token}` },
        });
        return response.data;
      },

      deleteMobileInfoMenu: async (id) => {
        const token = localStorage.getItem('token');
        const response = await apiService.delete(`/api/admin/mobile-info-menu/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        return response.data;
      },

      updateMobileInfoMenuStatus: async (id, data) => {
        const token = localStorage.getItem('token');
        const response = await apiService.put(`/api/admin/mobile-info-menu/${id}/status`, data, {
          headers: { Authorization: `Bearer ${token}` },
        });
        return response.data;
      },

      // Mobile Info Menu Methods
      getMobileInfoMenu: async () => {
        const token = localStorage.getItem('token');
        const response = await apiService.get('/mobile-info-menu', {
          headers: { Authorization: `Bearer ${token}` },
        });
        return response.data;
      },

      updateMobileInfoMenu: async (data) => {
        const token = localStorage.getItem('token');
        const response = await apiService.put('/mobile-info-menu', data, {
          headers: { Authorization: `Bearer ${token}` },
        });
        return response.data;
      },

    };

export default apiService;