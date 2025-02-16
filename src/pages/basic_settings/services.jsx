import React, { useState, useEffect } from 'react';
import { authService } from '@/services/apiService';

const Services = () => {
  const [services, setServices] = useState([]);
  const [formData, setFormData] = useState({ name: '', priceRange: '', image: null ,code:'' ,isActive:true});
  const [editingId, setEditingId] = useState(null);

  useEffect(() => {
    fetchServices();
  }, []);

  const fetchServices = async () => {
    try {
      const response = await authService.getServices();
      setServices(response.data);
    } catch (error) {
      console.error('Error fetching services:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // New validation checks
    if (!formData.priceRange) {
      console.error('Price range is required.');
      return; // Prevent submission if price range is missing
    }
    
    if (!formData.image) {
      console.error('Image is required.');
      return; // Prevent submission if image is missing
    }

    try {
      const formDataToSend = new FormData();
      formDataToSend.append('name', formData.name);
      formDataToSend.append('price_range', formData.priceRange); // Ensure the field name matches server expectations
      formDataToSend.append('image', formData.image); // Append the image file
      formDataToSend.append('code', formData.code); // Append the image file
      formDataToSend.append('is_active', formData.isActive); // Append the image file

      if (editingId !== null) {
        // Update existing service
        await authService.updateService(editingId, formDataToSend);
      } else {
        // Add new service
        await authService.createService(formDataToSend);
        setFormData({ name: '', priceRange: '', image: null ,code:'',isActive:true });
      }
      fetchServices(); // Refresh the list
      setFormData({ name: '', priceRange: '', image: null ,code:'',isActive:true });
      setEditingId(null);
    } catch (error) {
      console.error('Error saving service:', error);
      if (error.response) {
        console.error('Server response:', error.response.data); // Log server response for debugging
      }
    }
  };

  const handleEdit = (service) => {
    setFormData({ name: service.name, priceRange: service.price_range, image: service.image ,code:service.code ,isActive:service.is_active });
    setEditingId(service.id);
  };

  const handleDelete = async (id) => {
    try {
      await authService.deleteService(id);
      fetchServices(); // Refresh the list
    } catch (error) {
      console.error('Error deleting service:', error);
    }
  };

  const handleToggleActive = async (id, isActive) => {
    try {
      if (isActive === true) {
        await authService.activateService(id,false); // Call to deactivate service
      } else {
        await authService.activateService(id,true); // Call to activate service
      }
      fetchServices(); // Refresh the list
    } catch (error) {
      console.error('Error toggling service status:', error);
    }
  };

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Manage Services</h1>
      
      {/* Add/Edit Form */}
      <form onSubmit={handleSubmit} className="mb-6">
        <div className="flex gap-4">
          <input
            type="text"
            placeholder="Service Name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className="border p-2 rounded"
            required
          />
           <input
            type="text"
            placeholder="Code"
            value={formData.code}
            onChange={(e) => setFormData({ ...formData, code: e.target.value })}
            className="border p-2 rounded"
            required
          />
          <input
            type="text"
            placeholder="Price Range"
            value={formData.priceRange}
            onChange={(e) => setFormData({ ...formData, priceRange: e.target.value })}
            className="border p-2 rounded"
            required
          />
          <input
            type="checkbox"
            checked={formData.isActive}
            onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
            className="border p-2 rounded"
          />
          <input
            type="file"
            accept="image/*"
            onChange={(e) => setFormData({ ...formData, image: e.target.files[0] })}
            className="border p-2 rounded"
            required
          />
         
          <button 
            type="submit" 
            className="bg-blue-500 text-white px-4 py-2 rounded"
          >
            {editingId !== null ? 'Update' : 'Add'} Service
          </button>
        </div>
      </form>

      {/* Countries List */}
      <div className="grid gap-4">
        {services.map(service => (
          <div 
            key={service.id} 
            className="flex justify-between items-center border p-3 rounded"
          >
            <div>
              <span className="font-bold">{service.name}</span>
              <span className="ml-2 text-gray-600">Rs {service.price_range}</span>
              <span className="ml-2 text-gray-600">Code: {service.code}</span>
              {service.image && (
                <img src={`http://localhost:8000/${service.image}`} alt={service.name} className="w-8 h-8 ml-2" />
              )}
              <span className={`ml-2 ${service.is_active === true ? 'text-green-600' : 'text-red-600'}`}>
                {service.is_active === true ? 'Active' : 'Inactive'}
              </span>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => handleEdit(service)}
                className="bg-yellow-500 text-white px-3 py-1 rounded"
              >
                Edit
              </button>
              <button
                onClick={() => handleDelete(service.id)}
                className="bg-red-500 text-white px-3 py-1 rounded"
              >
                Delete
              </button>
              <button
                onClick={() => handleToggleActive(service.id, service.is_active)}
                className={`px-3 py-1 rounded ${service.is_active ? 'bg-red-500' : 'bg-green-500'} text-white`}
              >
                {service.is_active ? 'Deactivate' : 'Activate'}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Services;