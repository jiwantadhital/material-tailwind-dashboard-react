import axios from 'axios';
import { pusherService } from './pusher_init';

const API_BASE_URL = 'http://localhost:8000/';

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


    signIn: async (phone, password) => {
      try {
        // Login request
        const response = await apiService.post('/api/login', { phone, password });
        const { token, ...userData } = response.data.data;
        
        if (token) {
          localStorage.setItem('token', token);
          
          // Make the init-after-login API call
          const initResponse = await apiService.get('/api/init-after-login', {
            headers: { Authorization: `Bearer ${token}` }
          });
          
          // Save user and kyc data to localStorage
          const { user, kyc_record } = initResponse.data.data;
          localStorage.setItem('user', JSON.stringify(user));
          localStorage.setItem('kyc_record', JSON.stringify(kyc_record));
          
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
    
    getAllUsers: async () => {
      const token = localStorage.getItem('token');
      console.log("this is token",token);
      if (!token) {
        throw new Error('Authentication required to fetch users');
      }

      try {
        const response = await apiService.get('/api/get-users',{
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
      getDocuments: async (page = 1, status = "pending") => {
        const token = localStorage.getItem('token');
        const response = await apiService.get(`/api/get-documents-list?page=${page}&status=${status}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        return response.data;
      },

      //get documents by id
      getDocumentById: async (documentId) => {
        const token = localStorage.getItem('token');
        const response = await apiService.get(`/api/get-document-by-id/${documentId}`, {
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
    };
export default apiService; 