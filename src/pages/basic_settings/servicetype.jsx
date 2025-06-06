import React, { useState, useEffect } from 'react';
import { authService } from '@/services/apiService';

const ServiceType = () => {
  const [serviceTypes, setServiceTypes] = useState([]);
  const [services, setServices] = useState([]);
  const [selectedServiceTypes, setSelectedServiceTypes] = useState([]);
  const [formData, setFormData] = useState({
    name: '',
    service_id: '',
    actual_price: '',
    user_price: '',
    isActive: true
  });
  const [editingId, setEditingId] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchServices();
    fetchServiceTypes();
  }, []);

  const fetchServices = async () => {
    try {
      const response = await authService.getServices();
      setServices(response.data);
    } catch (error) {
      console.error('Error fetching services:', error);
      setError('Failed to load services. Please try again.');
    }
  };

  const fetchServiceTypes = async () => {
    setIsLoading(true);
    try {
      const response = await authService.getServiceTypes();
      setServiceTypes(response.data);
    } catch (error) {
      console.error('Error fetching service types:', error);
      setError('Failed to load service types. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Helper function to filter service types by selected service
  const fetchServiceTypesByService = async (serviceId) => {
    try {
      // Filter from the existing serviceTypes instead of making a separate API call
      // since there's no specific endpoint for this in the apiService
      const filteredTypes = serviceTypes.filter(type => type.service_id.toString() === serviceId.toString());
      setSelectedServiceTypes(filteredTypes || []);
    } catch (error) {
      console.error('Error filtering service types for service:', error);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });

    // If service_id changes, fetch service types for this service
    if (name === 'service_id' && value) {
      fetchServiceTypesByService(value);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      service_id: '',
      actual_price: '',
      user_price: '',
      isActive: true
    });
    setEditingId(null);
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.name || !formData.service_id || !formData.actual_price || !formData.user_price) {
      setError('Please fill all required fields');
      return;
    }

    setIsLoading(true);
    try {
      const data = {
        name: formData.name,
        service_id: formData.service_id,
        actual_price: formData.actual_price,
        user_price: formData.user_price,
        status: formData.isActive
      };

      if (editingId) {
        await authService.updateServiceType(editingId, data);
      } else {
        await authService.createServiceType(data);
      }
      
      fetchServiceTypes(); // Refresh the list
      resetForm();
    } catch (error) {
      console.error('Error saving service type:', error);
      setError('Failed to save service type. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = (serviceType) => {
    setFormData({
      name: serviceType.name,
      service_id: serviceType.service_id.toString(),
      actual_price: serviceType.actual_price || '',
      user_price: serviceType.user_price || '',
      status: serviceType.status
    });
    setEditingId(serviceType.id);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this service type?')) {
      return;
    }
    
    try {
      // There's no deleteServiceType function in apiService,
      // We could use a generic delete request or update as inactive
      // For now, we'll just update the UI as if it was deleted
      setServiceTypes(serviceTypes.filter(type => type.id !== id));
      setError('Delete functionality not available in API');
    } catch (error) {
      console.error('Error deleting service type:', error);
      setError('Failed to delete service type. Please try again.');
    }
  };

  const handleToggleActive = async (id, isActive) => {
    try {
      // Since there's no specific activate/deactivate endpoint, we'll use updateServiceType
      const serviceType = serviceTypes.find(type => type.id === id);
      if (!serviceType) return;
      
      const data = {
        name: serviceType.name,
        service_id: serviceType.service_id,
        actual_price: serviceType.actual_price,
        user_price: serviceType.user_price,
        status: !isActive
      };
      
      await authService.updateServiceType(id, data);
      fetchServiceTypes(); // Refresh the list
    } catch (error) {
      console.error('Error toggling service type status:', error);
      setError('Failed to update service type status. Please try again.');
    }
  };

  return (
    <div className="p-4">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Manage Service Types</h1>
        <p className="text-gray-600">Add or edit service types with pricing based on services</p>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      {/* Add/Edit Form */}
      <div className="bg-white p-4 rounded shadow mb-6">
        <h2 className="text-xl font-semibold mb-4">
          {editingId ? 'Edit Service Type' : 'Add New Service Type'}
        </h2>
        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-gray-700 mb-1">Service *</label>
              <select
                name="service_id"
                value={formData.service_id}
                onChange={handleInputChange}
                className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              >
                <option value="">Select a service</option>
                {services.map(service => (
                  <option key={service.id} value={service.id}>
                    {service.name}
                  </option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-gray-700 mb-1">Service Type Name *</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            
            <div>
              <label className="block text-gray-700 mb-1">Actual Price (Rs.) *</label>
              <input
                type="number"
                name="actual_price"
                value={formData.actual_price}
                onChange={handleInputChange}
                className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            
            <div>
              <label className="block text-gray-700 mb-1">User Price (Rs.) *</label>
              <input
                type="number"
                name="user_price"
                value={formData.user_price}
                onChange={handleInputChange}
                className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            
            <div className="flex items-center mt-4">
              <input
                type="checkbox"
                name="isActive"
                id="isActive"
                checked={formData.isActive}
                onChange={handleInputChange}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label htmlFor="isActive" className="ml-2 block text-gray-700">
                Active
              </label>
            </div>
          </div>
          
          {/* Display existing service types for selected service */}
          {formData.service_id && selectedServiceTypes.length > 0 && (
            <div className="mt-4 p-3 bg-gray-50 rounded">
              <h3 className="text-sm font-medium text-gray-700 mb-2">
                Existing types for selected service:
              </h3>
              <div className="flex flex-wrap gap-2">
                {selectedServiceTypes.map(type => (
                  <div key={type.id} className="bg-white px-3 py-1 rounded border text-sm">
                    {type.name} - Actual: Rs. {type.actual_price} | User: Rs. {type.user_price}
                  </div>
                ))}
              </div>
            </div>
          )}
          
          <div className="flex gap-2 mt-6">
            <button
              type="submit"
              disabled={isLoading}
              className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded"
            >
              {isLoading ? 'Saving...' : (editingId ? 'Update' : 'Add')}
            </button>
            
            <button
              type="button"
              onClick={resetForm}
              className="bg-gray-300 hover:bg-gray-400 text-gray-800 px-4 py-2 rounded"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>

      {/* Service Types List */}
      <div className="bg-white p-4 rounded shadow">
        <h2 className="text-xl font-semibold mb-4">Service Types</h2>
        
        {isLoading && !serviceTypes.length ? (
          <div className="text-center py-4">Loading...</div>
        ) : serviceTypes.length === 0 ? (
          <div className="text-center py-4 text-gray-500">No service types found</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white">
              <thead>
                <tr className="bg-gray-100 text-gray-600 uppercase text-sm leading-normal">
                  <th className="py-3 px-6 text-left">Service</th>
                  <th className="py-3 px-6 text-left">Type Name</th>
                  <th className="py-3 px-6 text-left">Prices</th>
                  <th className="py-3 px-6 text-left">Status</th>
                  <th className="py-3 px-6 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="text-gray-600 text-sm">
                {serviceTypes.map(serviceType => {
                  const service = services.find(s => s.id === serviceType.service_id);
                  return (
                    <tr key={serviceType.id} className="border-b border-gray-200 hover:bg-gray-50">
                      <td className="py-3 px-6 text-left">
                        {service?.name || 'Unknown Service'}
                      </td>
                      <td className="py-3 px-6 text-left">{serviceType.name}</td>
                      <td className="py-3 px-6 text-left">
                        <div>
                          <div>Actual: Rs. {serviceType.actual_price}</div>
                          <div>User: Rs. {serviceType.user_price}</div>
                        </div>
                      </td>
                      <td className="py-3 px-6 text-left">
                        <span className={`py-1 px-3 rounded-full text-xs ${serviceType.status ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                          {serviceType.status ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="py-3 px-6 text-center">
                        <div className="flex item-center justify-center gap-2">
                          <button
                            onClick={() => handleEdit(serviceType)}
                            className="bg-blue-500 hover:bg-blue-600 text-white px-2 py-1 rounded text-xs"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDelete(serviceType.id)}
                            className="bg-red-500 hover:bg-red-600 text-white px-2 py-1 rounded text-xs"
                          >
                            Delete
                          </button>
                          <button
                            onClick={() => handleToggleActive(serviceType.id, serviceType.status)}
                            className={`px-2 py-1 rounded text-xs ${serviceType.status ? 'bg-orange-500 hover:bg-orange-600' : 'bg-green-500 hover:bg-green-600'} text-white`}
                          >
                            {serviceType.status ? 'Deactivate' : 'Activate'}
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default ServiceType;
