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
        
        if (token) {
          localStorage.setItem('token', token);
          
          // Make the init-after-login API call
          const initResponse = await apiService.get('/api/init-after-login', {
            headers: { Authorization: `Bearer ${token}` }
          });

          const servicesResponse = await apiService.get('/api/get-all-services', {
            headers: { Authorization: `Bearer ${token}` }
          });

          
          
          // Save user and kyc data to localStorage
          const { user, kyc_record } = initResponse.data.data;
          localStorage.setItem('user', JSON.stringify(user));
          localStorage.setItem('kyc_record', JSON.stringify(kyc_record));
          localStorage.setItem('services', JSON.stringify(servicesResponse.data));
          // Return combined data
          return {
            ...userData,
            user,
            kyc_record
          };
        }
  
        return userData;
      } catch (error) {
        console.error('Sign-in error:', error);
        throw error;
      }
    },
  
    signOut: () => {
      localStorage.removeItem('token');
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
      uploadCarouselImage: async (image, title) => {
        const token = localStorage.getItem('token');
        const formData = new FormData();
        formData.append('image', image);
        formData.append('title', title);

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
        const response = await apiService.get('/api/get-dashboard-data-for-web');
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

      
    };
export default apiService; 