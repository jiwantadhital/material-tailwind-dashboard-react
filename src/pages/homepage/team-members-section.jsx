import React, { useState, useEffect } from 'react';
import { authService } from '@/services/apiService';
import { Card, CardBody, Typography, Input, Textarea, Button, Switch, IconButton } from "@material-tailwind/react";
import { Plus, Edit, Trash2, Save, X } from 'lucide-react';

const TeamMembersSection = () => {
  const [teamMembers, setTeamMembers] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    role: '',
    bio: '',
    image_url: '',
    linkedin_url: '',
    email: '',
    sort_order: 0,
    is_active: true
  });
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  const [imageInputType, setImageInputType] = useState('url'); // 'url' or 'upload'

  useEffect(() => {
    fetchTeamMembers();
  }, []);

  const fetchTeamMembers = async () => {
    setIsLoading(true);
    try {
      const response = await authService.getTeamMembers();
      if (response.success) {
        setTeamMembers(response.data);
      }
    } catch (error) {
      console.error('Error fetching team members:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      let finalFormData = { ...formData };
      
      // Handle image upload if file is selected
      if (imageFile) {
        const formDataToSend = new FormData();
        formDataToSend.append('image', imageFile);
        
        // Upload image first
        const uploadResponse = await authService.uploadImage(formDataToSend);
        if (uploadResponse.success) {
          finalFormData.image_url = uploadResponse.data.url;
        } else {
          throw new Error('Failed to upload image');
        }
      }
      
      // Validate that either image URL or file is provided
      if (!finalFormData.image_url && !imageFile) {
        alert('Please provide either an image URL or upload an image file.');
        setIsLoading(false);
        return;
      }
      
      if (editingId) {
        await authService.updateTeamMember(editingId, finalFormData);
      } else {
        await authService.createTeamMember(finalFormData);
      }
      fetchTeamMembers();
      resetForm();
    } catch (error) {
      console.error('Error saving team member:', error);
      alert(error.message || 'Error saving team member');
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = (teamMember) => {
    setFormData({
      name: teamMember.name,
      role: teamMember.role,
      bio: teamMember.bio,
      image_url: teamMember.image_url || '',
      linkedin_url: teamMember.linkedin_url || '',
      email: teamMember.email || '',
      sort_order: teamMember.sort_order,
      is_active: teamMember.is_active
    });
    setImagePreview(teamMember.image_url || '');
    setImageFile(null);
    setImageInputType(teamMember.image_url ? 'url' : 'upload');
    setEditingId(teamMember.id);
    setIsAdding(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this team member?')) {
      try {
        await authService.deleteTeamMember(id);
        fetchTeamMembers();
      } catch (error) {
        console.error('Error deleting team member:', error);
      }
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      role: '',
      bio: '',
      image_url: '',
      linkedin_url: '',
      email: '',
      sort_order: 0,
      is_active: true
    });
    setImageFile(null);
    setImagePreview('');
    setImageInputType('url');
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

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
      setFormData(prev => ({ ...prev, image_url: '' })); // Clear URL when file is selected
    }
  };

  const handleImageUrlChange = (e) => {
    const { value } = e.target;
    setFormData(prev => ({ ...prev, image_url: value }));
    setImagePreview(value);
    setImageFile(null); // Clear file when URL is entered
  };

  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-6">
        <Typography variant="h3" color="blue-gray">
          Team Members Management
        </Typography>
        <Button
          onClick={() => setIsAdding(true)}
          color="blue"
          variant="gradient"
          className="flex items-center gap-2"
        >
          <Plus size={16} />
          Add Team Member
        </Button>
      </div>

      {/* Add/Edit Form */}
      {isAdding && (
        <Card className="mb-6">
          <CardBody>
            <div className="flex justify-between items-center mb-4">
              <Typography variant="h5" color="blue-gray">
                {editingId ? 'Edit Team Member' : 'Add New Team Member'}
              </Typography>
              <IconButton variant="text" onClick={resetForm}>
                <X size={20} />
              </IconButton>
            </div>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Typography variant="h6" color="blue-gray" className="mb-2">
                    Name
                  </Typography>
                  <Input
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    placeholder="Enter full name"
                    size="lg"
                    required
                  />
                </div>
                
                <div>
                  <Typography variant="h6" color="blue-gray" className="mb-2">
                    Role/Position
                  </Typography>
                  <Input
                    name="role"
                    value={formData.role}
                    onChange={handleInputChange}
                    placeholder="Enter role/position"
                    size="lg"
                    required
                  />
                </div>
              </div>

              <div>
                <Typography variant="h6" color="blue-gray" className="mb-2">
                  Bio/Description
                </Typography>
                <Textarea
                  name="bio"
                  value={formData.bio}
                  onChange={handleInputChange}
                  placeholder="Enter bio/description"
                  size="lg"
                  rows={3}
                  required
                />
              </div>

              <div>
                <Typography variant="h6" color="blue-gray" className="mb-2">
                  Profile Image
                </Typography>
                
                {/* Image Input Type Toggle */}
                <div className="flex gap-4 mb-4">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="imageInputType"
                      value="url"
                      checked={imageInputType === 'url'}
                      onChange={(e) => setImageInputType(e.target.value)}
                      className="text-blue-600"
                    />
                    <span className="text-sm">Image URL</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="imageInputType"
                      value="upload"
                      checked={imageInputType === 'upload'}
                      onChange={(e) => setImageInputType(e.target.value)}
                      className="text-blue-600"
                    />
                    <span className="text-sm">Upload Image</span>
                  </label>
                </div>

                {/* Image URL Input */}
                {imageInputType === 'url' && (
                  <Input
                    name="image_url"
                    value={formData.image_url}
                    onChange={handleImageUrlChange}
                    placeholder="Enter image URL"
                    size="lg"
                  />
                )}

                {/* File Upload Input */}
                {imageInputType === 'upload' && (
                  <div>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                      className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                    />
                    <p className="text-xs text-gray-500 mt-1">Supported formats: JPG, PNG, GIF (Max 5MB)</p>
                  </div>
                )}

                {/* Image Preview */}
                {imagePreview && (
                  <div className="mt-4">
                    <div className="flex items-center justify-between mb-2">
                      <Typography variant="small" color="blue-gray">
                        Preview:
                      </Typography>
                      <button
                        type="button"
                        onClick={() => {
                          setImagePreview('');
                          setImageFile(null);
                          setFormData(prev => ({ ...prev, image_url: '' }));
                        }}
                        className="text-red-500 hover:text-red-700 text-sm"
                      >
                        Clear
                      </button>
                    </div>
                    <div className="w-32 h-32 border border-gray-300 rounded-lg overflow-hidden">
                      <img
                        src={imagePreview}
                        alt="Preview"
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.target.src = '/img/team-1.jpeg';
                        }}
                      />
                    </div>
                  </div>
                )}
              </div>

              <div>
                <Typography variant="h6" color="blue-gray" className="mb-2">
                  Email
                </Typography>
                <Input
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="Enter email address"
                  size="lg"
                />
              </div>

              <div>
                <Typography variant="h6" color="blue-gray" className="mb-2">
                  LinkedIn URL
                </Typography>
                <Input
                  name="linkedin_url"
                  value={formData.linkedin_url}
                  onChange={handleInputChange}
                  placeholder="Enter LinkedIn profile URL"
                  size="lg"
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

      {/* Team Members List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {isLoading ? (
          // Loading placeholders
          [1, 2, 3, 4, 5, 6].map((index) => (
            <Card key={index} className="animate-pulse">
              <div className="w-full h-48 bg-gray-200"></div>
              <CardBody>
                <div className="h-6 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2 mb-3"></div>
                <div className="h-4 bg-gray-200 rounded w-full mb-1"></div>
                <div className="h-4 bg-gray-200 rounded w-5/6"></div>
              </CardBody>
            </Card>
          ))
        ) : teamMembers.length > 0 ? (
          teamMembers.map((member) => (
            <Card key={member.id} className="hover:shadow-lg transition-shadow overflow-hidden">
              <div className="relative">
                <img 
                  src={member.image_url || '/img/team-1.jpeg'} 
                  alt={member.name}
                  className="w-full h-48 object-cover"
                />
                <div className="absolute top-2 right-2 flex gap-1">
                  <IconButton
                    variant="text"
                    size="sm"
                    className="bg-white/80 hover:bg-white"
                    onClick={() => handleEdit(member)}
                  >
                    <Edit size={16} />
                  </IconButton>
                  <IconButton
                    variant="text"
                    size="sm"
                    color="red"
                    className="bg-white/80 hover:bg-white"
                    onClick={() => handleDelete(member.id)}
                  >
                    <Trash2 size={16} />
                  </IconButton>
                </div>
              </div>
              <CardBody>
                <Typography variant="h6" color="blue-gray" className="mb-1">
                  {member.name}
                </Typography>
                <Typography variant="small" color="blue" className="font-medium mb-3">
                  {member.role}
                </Typography>
                <Typography variant="paragraph" color="gray" className="mb-3 text-sm">
                  {member.bio}
                </Typography>
                
                <div className="flex justify-between items-center text-sm text-gray-500">
                  <span>Order: {member.sort_order}</span>
                  <span className={`px-2 py-1 rounded-full text-xs ${
                    member.is_active 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {member.is_active ? 'Active' : 'Inactive'}
                  </span>
                </div>
              </CardBody>
            </Card>
          ))
        ) : (
          <div className="col-span-full text-center py-8">
            <Typography variant="h6" color="gray">
              No team members found. Add your first team member to get started.
            </Typography>
          </div>
        )}
      </div>
    </div>
  );
};

export default TeamMembersSection; 