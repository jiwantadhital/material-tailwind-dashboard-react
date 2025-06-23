import React, { useState, useEffect } from 'react';
import { authService } from '@/services/apiService';
import { Card, CardBody, Typography, Input, Textarea, Button, Switch, IconButton } from "@material-tailwind/react";
import { PlusIcon, TrashIcon, PencilIcon } from "@heroicons/react/24/solid";

const FeaturesSection = () => {
  const [sectionData, setSectionData] = useState({
    title: '',
    description: '',
    is_active: true
  });
  const [features, setFeatures] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingFeature, setEditingFeature] = useState(null);
  const [featureForm, setFeatureForm] = useState({
    title: '',
    description: '',
    icon_type: '',
    is_active: true
  });

  useEffect(() => {
    fetchFeaturesData();
  }, []);

  const fetchFeaturesData = async () => {
    setIsLoading(true);
    try {
      const response = await authService.getFeaturesSection();
      if (response.success && response.data) {
        setSectionData(response.data.section || {
          title: 'Why Choose Sajilo Notary?',
          description: 'Our platform offers a seamless notarization experience with powerful features designed for businesses and individuals alike.',
          is_active: true
        });
        setFeatures(response.data.features || []);
      }
    } catch (error) {
      console.error('Error fetching features data:', error);
      // Set default values if API call fails
      setSectionData({
        title: 'Why Choose Sajilo Notary?',
        description: 'Our platform offers a seamless notarization experience with powerful features designed for businesses and individuals alike.',
        is_active: true
      });
      setFeatures([
        {
          id: 1,
          title: 'Time-Saving Process',
          description: 'Complete notarizations in minutes, not days. Our streamlined digital process eliminates the need for in-person meetings.',
          icon_type: 'clock',
          is_active: true
        },
        {
          id: 2,
          title: 'Enhanced Security',
          description: 'Advanced encryption and authentication protocols ensure your documents remain secure and tamper-proof throughout the process.',
          icon_type: 'shield',
          is_active: true
        },
        {
          id: 3,
          title: 'Legal Compliance',
          description: 'Our platform is fully compliant with all relevant regulations and laws governing digital notarization services.',
          icon_type: 'document',
          is_active: true
        }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSectionSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const response = await authService.updateFeaturesSection(sectionData);
      if (response.success) {
        console.log('Features section updated successfully');
        setIsEditing(false);
      }
    } catch (error) {
      console.error('Error updating features section:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFeatureSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      if (editingFeature) {
        const response = await authService.updateFeature(editingFeature.id, featureForm);
        if (response.success) {
          setFeatures(prev => prev.map(f => f.id === editingFeature.id ? { ...f, ...featureForm } : f));
          setEditingFeature(null);
        }
      } else {
        const response = await authService.createFeature(featureForm);
        if (response.success) {
          setFeatures(prev => [...prev, { ...featureForm, id: response.data.id }]);
        }
      }
      setFeatureForm({ title: '', description: '', icon_type: '', is_active: true });
    } catch (error) {
      console.error('Error saving feature:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteFeature = async (featureId) => {
    try {
      const response = await authService.deleteFeature(featureId);
      if (response.success) {
        setFeatures(prev => prev.filter(f => f.id !== featureId));
      }
    } catch (error) {
      console.error('Error deleting feature:', error);
    }
  };

  const handleEditFeature = (feature) => {
    setEditingFeature(feature);
    setFeatureForm({
      title: feature.title,
      description: feature.description,
      icon_type: feature.icon_type,
      is_active: feature.is_active
    });
  };

  const handleInputChange = (e, setter) => {
    const { name, value } = e.target;
    setter(prev => ({
      ...prev,
      [name]: value
    }));
  };

  return (
    <div className="p-4 space-y-6">
      <div className="flex justify-between items-center mb-6">
        <Typography variant="h3" color="blue-gray">
          Features Section Management
        </Typography>
      </div>

      {/* Section Header Management */}
      <Card>
        <CardBody>
          <div className="flex justify-between items-center mb-4">
            <Typography variant="h5" color="blue-gray">
              Section Header
            </Typography>
            <Button
              onClick={() => setIsEditing(!isEditing)}
              color={isEditing ? "red" : "blue"}
              variant="gradient"
              size="sm"
            >
              {isEditing ? "Cancel" : "Edit"}
            </Button>
          </div>

          {isEditing ? (
            <form onSubmit={handleSectionSubmit} className="space-y-4">
              <div>
                <Typography variant="h6" color="blue-gray" className="mb-2">
                  Section Title
                </Typography>
                <Input
                  name="title"
                  value={sectionData.title}
                  onChange={(e) => handleInputChange(e, setSectionData)}
                  placeholder="Enter section title"
                  size="lg"
                />
              </div>

              <div>
                <Typography variant="h6" color="blue-gray" className="mb-2">
                  Section Description
                </Typography>
                <Textarea
                  name="description"
                  value={sectionData.description}
                  onChange={(e) => handleInputChange(e, setSectionData)}
                  placeholder="Enter section description"
                  size="lg"
                  rows={3}
                />
              </div>

              <div className="flex items-center gap-4">
                <Typography variant="h6" color="blue-gray">
                  Active Status
                </Typography>
                <Switch
                  checked={sectionData.is_active}
                  onChange={(checked) => setSectionData(prev => ({ ...prev, is_active: checked }))}
                  color="blue"
                />
              </div>

              <Button type="submit" color="green" disabled={isLoading}>
                {isLoading ? "Saving..." : "Save Section"}
              </Button>
            </form>
          ) : (
            <div className="space-y-4">
              <div>
                <Typography variant="h6" color="blue-gray" className="mb-2">
                  Title
                </Typography>
                <Typography className="text-gray-700 bg-gray-50 p-3 rounded">
                  {sectionData.title || "No title set"}
                </Typography>
              </div>
              <div>
                <Typography variant="h6" color="blue-gray" className="mb-2">
                  Description
                </Typography>
                <Typography className="text-gray-700 bg-gray-50 p-3 rounded">
                  {sectionData.description || "No description set"}
                </Typography>
              </div>
            </div>
          )}
        </CardBody>
      </Card>

      {/* Features Management */}
      <Card>
        <CardBody>
          <div className="flex justify-between items-center mb-4">
            <Typography variant="h5" color="blue-gray">
              Features
            </Typography>
            <Button
              onClick={() => {
                setEditingFeature(null);
                setFeatureForm({ title: '', description: '', icon_type: '', is_active: true });
              }}
              color="green"
              variant="gradient"
              size="sm"
              className="flex items-center gap-2"
            >
              <PlusIcon className="w-4 h-4" />
              Add Feature
            </Button>
          </div>

          {/* Add/Edit Feature Form */}
          {(editingFeature || featureForm.title || featureForm.description) && (
            <form onSubmit={handleFeatureSubmit} className="mb-6 p-4 border rounded-lg bg-gray-50">
              <Typography variant="h6" color="blue-gray" className="mb-4">
                {editingFeature ? "Edit Feature" : "Add New Feature"}
              </Typography>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Typography variant="small" color="blue-gray" className="mb-2">
                    Feature Title
                  </Typography>
                  <Input
                    name="title"
                    value={featureForm.title}
                    onChange={(e) => handleInputChange(e, setFeatureForm)}
                    placeholder="Enter feature title"
                    size="lg"
                  />
                </div>

                <div>
                  <Typography variant="small" color="blue-gray" className="mb-2">
                    Icon Type
                  </Typography>
                  <select
                    name="icon_type"
                    value={featureForm.icon_type}
                    onChange={(e) => setFeatureForm(prev => ({ ...prev, icon_type: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select an icon</option>
                    <option value="clock">Clock (Time-Saving)</option>
                    <option value="shield">Shield (Security)</option>
                    <option value="document">Document (Legal)</option>
                    <option value="star">Star (Quality)</option>
                    <option value="users">Users (Team)</option>
                    <option value="check">Check (Verified)</option>
                  </select>
                </div>

                <div className="md:col-span-2">
                  <Typography variant="small" color="blue-gray" className="mb-2">
                    Feature Description
                  </Typography>
                  <Textarea
                    name="description"
                    value={featureForm.description}
                    onChange={(e) => handleInputChange(e, setFeatureForm)}
                    placeholder="Enter feature description"
                    size="lg"
                    rows={3}
                  />
                </div>

                <div className="flex items-center gap-4">
                  <Typography variant="small" color="blue-gray">
                    Active Status
                  </Typography>
                  <Switch
                    checked={featureForm.is_active}
                    onChange={(checked) => setFeatureForm(prev => ({ ...prev, is_active: checked }))}
                    color="blue"
                  />
                </div>
              </div>

              <div className="flex gap-4 mt-4">
                <Button type="submit" color="green" disabled={isLoading}>
                  {isLoading ? "Saving..." : editingFeature ? "Update Feature" : "Add Feature"}
                </Button>
                <Button
                  type="button"
                  color="red"
                  variant="outlined"
                  onClick={() => {
                    setEditingFeature(null);
                    setFeatureForm({ title: '', description: '', icon_type: '', is_active: true });
                  }}
                >
                  Cancel
                </Button>
              </div>
            </form>
          )}

          {/* Features List */}
          <div className="space-y-4">
            {features.map((feature) => (
              <div key={feature.id} className="border rounded-lg p-4 bg-white">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <Typography variant="h6" color="blue-gray">
                        {feature.title}
                      </Typography>
                      <span className={`px-2 py-1 rounded text-xs ${feature.is_active ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                        {feature.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                    <Typography className="text-gray-600 text-sm mb-2">
                      Icon: {feature.icon_type || 'No icon'}
                    </Typography>
                    <Typography className="text-gray-700">
                      {feature.description}
                    </Typography>
                  </div>
                  <div className="flex gap-2 ml-4">
                    <IconButton
                      size="sm"
                      color="blue"
                      onClick={() => handleEditFeature(feature)}
                    >
                      <PencilIcon className="w-4 h-4" />
                    </IconButton>
                    <IconButton
                      size="sm"
                      color="red"
                      onClick={() => handleDeleteFeature(feature.id)}
                    >
                      <TrashIcon className="w-4 h-4" />
                    </IconButton>
                  </div>
                </div>
              </div>
            ))}
            
            {features.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                No features added yet. Click "Add Feature" to get started.
              </div>
            )}
          </div>
        </CardBody>
      </Card>
    </div>
  );
};

export default FeaturesSection; 