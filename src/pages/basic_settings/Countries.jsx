import React, { useState, useEffect } from 'react';
import { authService } from '@/services/apiService';

const Countries = () => {
  const [countries, setCountries] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [formData, setFormData] = useState({ name: '', code: '' });
  const [editingId, setEditingId] = useState(null);

  useEffect(() => {
    fetchCountries();
  }, []);

  const fetchCountries = async () => {
    try {
      setIsLoading(true);
      const response = await authService.getCountries();
      setCountries(response.data);
    } catch (error) {
      console.error('Error fetching countries:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingId !== null) {
        // Update existing country
        await authService.updateCountry(editingId, formData);
      } else {
        // Add new country
        await authService.createCountry(formData);
      }
      fetchCountries(); // Refresh the list
      setFormData({ name: '', code: '' });
      setEditingId(null);
    } catch (error) {
      console.error('Error saving country:', error);
    }
  };

  const handleEdit = (country) => {
    setFormData({ name: country.name, code: country.code });
    setEditingId(country.id);
  };

  const handleDelete = async (id) => {
    try {
      await authService.deleteCountry(id);
      fetchCountries(); // Refresh the list
    } catch (error) {
      console.error('Error deleting country:', error);
    }
  };

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Manage Countries</h1>
      
      {/* Add/Edit Form */}
      <form onSubmit={handleSubmit} className="mb-6">
        <div className="flex gap-4">
          <input
            type="text"
            placeholder="Country Name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className="border p-2 rounded"
            required
          />
          <input
            type="text"
            placeholder="Country Code"
            value={formData.code}
            onChange={(e) => setFormData({ ...formData, code: e.target.value })}
            className="border p-2 rounded"
            required
          />
          <button 
            type="submit" 
            className="bg-blue-500 text-white px-4 py-2 rounded"
          >
            {editingId !== null ? 'Update' : 'Add'} Country
          </button>
        </div>
      </form>

      {/* Countries List */}
      <div className="grid gap-4">
        {isLoading ? (
          <div className="text-center py-4">Loading countries...</div>
        ) : (
          countries.map(country => (
            <div 
              key={country.id} 
              className="flex justify-between items-center border p-3 rounded"
            >
              <div>
                <span className="font-bold">{country.name}</span>
                <span className="ml-2 text-gray-600">({country.code})</span>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => handleEdit(country)}
                  className="bg-yellow-500 text-white px-3 py-1 rounded"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(country.id)}
                  className="bg-red-500 text-white px-3 py-1 rounded"
                >
                  Delete
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Countries;
