import React, { useState, useEffect } from 'react';
import { authService } from '@/services/apiService';
import { Card, CardBody, Typography, Input, Textarea, Button, Switch, IconButton } from "@material-tailwind/react";
import { Plus, Edit, Trash2, Save, X } from 'lucide-react';

const CoreValuesSection = () => {
  const [coreValues, setCoreValues] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    icon_name: '',
    sort_order: 0,
    is_active: true
  });

  const availableIcons = [
    'Shield', 'Zap', 'Heart', 'Target', 'Star', 'Users', 'Globe', 'Award', 'Clock', 'FileText'
  ];

  useEffect(() => {
    fetchCoreValues();
  }, []);

  const fetchCoreValues = async () => {
    setIsLoading(true);
    try {
      const response = await authService.getCoreValues();
      if (response.success) {
        setCoreValues(response.data);
      }
    } catch (error) {
      console.error('Error fetching core values:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      if (editingId) {
        await authService.updateCoreValue(editingId, formData);
      } else {
        await authService.createCoreValue(formData);
      }
      fetchCoreValues();
      resetForm();
    } catch (error) {
      console.error('Error saving core value:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = (coreValue) => {
    setFormData({
      title: coreValue.title,
      description: coreValue.description,
      icon_name: coreValue.icon_name,
      sort_order: coreValue.sort_order,
      is_active: coreValue.is_active
    });
    setEditingId(coreValue.id);
    setIsAdding(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this core value?')) {
      try {
        await authService.deleteCoreValue(id);
        fetchCoreValues();
      } catch (error) {
        console.error('Error deleting core value:', error);
      }
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      icon_name: '',
      sort_order: 0,
      is_active: true
    });
    setEditingId(null);
    setIsAdding(false);
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-6">
        <Typography variant="h3" color="blue-gray">
          Core Values Management
        </Typography>
        <Button
          onClick={() => setIsAdding(true)}
          color="blue"
          variant="gradient"
          className="flex items-center gap-2"
        >
          <Plus size={16} />
          Add Core Value
        </Button>
      </div>

      {/* Add/Edit Form */}
      {isAdding && (
        <Card className="mb-6">
          <CardBody>
            <div className="flex justify-between items-center mb-4">
              <Typography variant="h5" color="blue-gray">
                {editingId ? 'Edit Core Value' : 'Add New Core Value'}
              </Typography>
              <IconButton variant="text" onClick={resetForm}>
                <X size={20} />
              </IconButton>
            </div>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Typography variant="h6" color="blue-gray" className="mb-2">
                    Title
                  </Typography>
                  <Input
                    name="title"
                    value={formData.title}
                    onChange={handleInputChange}
                    placeholder="Enter title"
                    size="lg"
                    required
                  />
                </div>
                
                <div>
                  <Typography variant="h6" color="blue-gray" className="mb-2">
                    Icon Name
                  </Typography>
                  <select
                    name="icon_name"
                    value={formData.icon_name}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                  >
                    <option value="">Select an icon</option>
                    {availableIcons.map(icon => (
                      <option key={icon} value={icon}>{icon}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <Typography variant="h6" color="blue-gray" className="mb-2">
                  Description
                </Typography>
                <Textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  placeholder="Enter description"
                  size="lg"
                  rows={3}
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Typography variant="h6" color="blue-gray" className="mb-2">
                    Sort Order
                  </Typography>
                  <Input
                    name="sort_order"
                    type="number"
                    value={formData.sort_order}
                    onChange={handleInputChange}
                    placeholder="Enter sort order"
                    size="lg"
                  />
                </div>
                
                <div className="flex items-center gap-2">
                  <Switch
                    name="is_active"
                    checked={formData.is_active}
                    onChange={(e) => handleInputChange({ target: { name: 'is_active', type: 'checkbox', checked: e.target.checked } })}
                  />
                  <Typography variant="h6" color="blue-gray">
                    Active
                  </Typography>
                </div>
              </div>

              <div className="flex gap-2">
                <Button
                  type="submit"
                  color="green"
                  variant="gradient"
                  disabled={isLoading}
                  className="flex items-center gap-2"
                >
                  <Save size={16} />
                  {isLoading ? "Saving..." : (editingId ? "Update" : "Save")}
                </Button>
                <Button
                  type="button"
                  color="red"
                  variant="outlined"
                  onClick={resetForm}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </CardBody>
        </Card>
      )}

      {/* Core Values List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {isLoading ? (
          // Loading placeholders
          [1, 2, 3, 4, 5, 6].map((index) => (
            <Card key={index} className="animate-pulse">
              <CardBody>
                <div className="h-6 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2 mb-3"></div>
                <div className="h-4 bg-gray-200 rounded w-full mb-1"></div>
                <div className="h-4 bg-gray-200 rounded w-5/6"></div>
              </CardBody>
            </Card>
          ))
        ) : coreValues.length > 0 ? (
          coreValues.map((coreValue) => (
            <Card key={coreValue.id} className="hover:shadow-lg transition-shadow">
              <CardBody>
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                      <span className="text-blue-600 font-semibold text-sm">
                        {coreValue.icon_name ? coreValue.icon_name.charAt(0) : '?'}
                      </span>
                    </div>
                    <Typography variant="h6" color="blue-gray">
                      {coreValue.title}
                    </Typography>
                  </div>
                  <div className="flex gap-1">
                    <IconButton
                      variant="text"
                      size="sm"
                      onClick={() => handleEdit(coreValue)}
                    >
                      <Edit size={16} />
                    </IconButton>
                    <IconButton
                      variant="text"
                      size="sm"
                      color="red"
                      onClick={() => handleDelete(coreValue.id)}
                    >
                      <Trash2 size={16} />
                    </IconButton>
                  </div>
                </div>
                
                <Typography variant="paragraph" color="gray" className="mb-3">
                  {coreValue.description}
                </Typography>
                
                <div className="flex justify-between items-center text-sm text-gray-500">
                  <span>Order: {coreValue.sort_order}</span>
                  <span className={`px-2 py-1 rounded-full text-xs ${
                    coreValue.is_active 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {coreValue.is_active ? 'Active' : 'Inactive'}
                  </span>
                </div>
              </CardBody>
            </Card>
          ))
        ) : (
          <div className="col-span-full text-center py-8">
            <Typography variant="h6" color="gray">
              No core values found. Add your first core value to get started.
            </Typography>
          </div>
        )}
      </div>
    </div>
  );
};

export default CoreValuesSection; 