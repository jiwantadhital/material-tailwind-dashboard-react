import React, { useState, useEffect } from 'react';
import { authService } from '@/services/apiService';
import { Card, CardBody, Typography, Input, Textarea, Button, Switch, IconButton } from "@material-tailwind/react";
import { PlusIcon, TrashIcon, PencilIcon, StarIcon } from "@heroicons/react/24/solid";

const TestimonialsSection = () => {
  const [sectionData, setSectionData] = useState({
    title: '',
    description: '',
    is_active: true
  });
  const [testimonials, setTestimonials] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingTestimonial, setEditingTestimonial] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [testimonialForm, setTestimonialForm] = useState({
    name: '',
    role: '',
    company: '',
    testimonial_text: '',
    rating: 5,
    is_active: true
  });

  useEffect(() => {
    fetchTestimonialsData();
  }, []);

  const fetchTestimonialsData = async () => {
    setIsLoading(true);
    try {
      const response = await authService.getTestimonialsSection();
      if (response.success && response.data) {
        setSectionData(response.data.section || {
          title: 'Trusted by industry leaders',
          description: 'See what our clients say about how Sajilo Notary has transformed their document workflows.',
          is_active: true
        });
        setTestimonials(response.data.testimonials || []);
      }
    } catch (error) {
      console.error('Error fetching testimonials data:', error);
      // Set default values if API call fails
      setSectionData({
        title: 'Trusted by industry leaders',
        description: 'See what our clients say about how Sajilo Notary has transformed their document workflows.',
        is_active: true
      });
      setTestimonials([
        {
          id: 1,
          name: 'Andrew Mitchell',
          role: 'Legal Director',
          company: 'Microsoft',
          testimonial_text: 'Sajilo Notary completely transformed our document processing workflow. What used to take days now takes minutes.',
          rating: 5,
          is_active: true
        },
        {
          id: 2,
          name: 'Sarah Johnson',
          role: 'Head of Real Estate Operations',
          company: 'Airbnb',
          testimonial_text: 'Sajilo Notary\'s platform has significantly reduced our document processing time and improved our client experience.',
          rating: 5,
          is_active: true
        },
        {
          id: 3,
          name: 'Michael Chen',
          role: 'VP of Legal Affairs',
          company: 'Goldman Sachs',
          testimonial_text: 'Security and compliance are non-negotiable in our industry. Sajilo Notary delivers on both fronts.',
          rating: 5,
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
      const response = await authService.updateTestimonialsSection(sectionData);
      if (response.success) {
        console.log('Testimonials section updated successfully');
        setIsEditing(false);
      }
    } catch (error) {
      console.error('Error updating testimonials section:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleTestimonialSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      if (editingTestimonial) {
        const response = await authService.updateTestimonial(editingTestimonial.id, testimonialForm);
        if (response.success) {
          setTestimonials(prev => prev.map(t => t.id === editingTestimonial.id ? { ...t, ...testimonialForm } : t));
          setEditingTestimonial(null);
        }
      } else {
        const response = await authService.createTestimonial(testimonialForm);
        if (response.success) {
          setTestimonials(prev => [...prev, { ...testimonialForm, id: response.data.id }]);
        }
      }
      setTestimonialForm({ name: '', role: '', company: '', testimonial_text: '', rating: 5, is_active: true });
    } catch (error) {
      console.error('Error saving testimonial:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteTestimonial = async (testimonialId) => {
    try {
      const response = await authService.deleteTestimonial(testimonialId);
      if (response.success) {
        setTestimonials(prev => prev.filter(t => t.id !== testimonialId));
      }
    } catch (error) {
      console.error('Error deleting testimonial:', error);
    }
  };

  const handleEditTestimonial = (testimonial) => {
    setEditingTestimonial(testimonial);
    setTestimonialForm({
      name: testimonial.name,
      role: testimonial.role,
      company: testimonial.company,
      testimonial_text: testimonial.testimonial_text,
      rating: testimonial.rating,
      is_active: testimonial.is_active
    });
  };

  const handleInputChange = (e, setter) => {
    const { name, value } = e.target;
    setter(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const renderStars = (rating) => {
    return Array.from({ length: 5 }, (_, index) => (
      <StarIcon
        key={index}
        className={`w-4 h-4 ${index < rating ? 'text-yellow-400' : 'text-gray-300'}`}
      />
    ));
  };

  const resetForm = () => {
    setEditingTestimonial(null);
    setTestimonialForm({
      name: '',
      role: '',
      company: '',
      testimonial_text: '',
      rating: 5,
      is_active: true
    });
    setShowForm(false);
  };

  return (
    <div className="p-4 space-y-6">
      <div className="flex justify-between items-center mb-6">
        <Typography variant="h3" color="blue-gray">
          Testimonials Section Management
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

      {/* Testimonials Management */}
      <Card>
        <CardBody>
          <div className="flex justify-between items-center mb-4">
            <Typography variant="h5" color="blue-gray">
              Testimonials
            </Typography>
            <Button
              onClick={() => {
                resetForm();
                setShowForm(true);
              }}
              color="green"
              variant="gradient"
              size="sm"
              className="flex items-center gap-2"
            >
              <PlusIcon className="w-4 h-4" />
              Add Testimonial
            </Button>
          </div>

          {/* Add/Edit Testimonial Form */}
          {(editingTestimonial || showForm) && (
            <form onSubmit={handleTestimonialSubmit} className="mb-6 p-4 border rounded-lg bg-gray-50">
              <Typography variant="h6" color="blue-gray" className="mb-4">
                {editingTestimonial ? "Edit Testimonial" : "Add New Testimonial"}
              </Typography>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Typography variant="small" color="blue-gray" className="mb-2">
                    Customer Name
                  </Typography>
                  <Input
                    name="name"
                    value={testimonialForm.name}
                    onChange={(e) => handleInputChange(e, setTestimonialForm)}
                    placeholder="Enter customer name"
                    size="lg"
                  />
                </div>

                <div>
                  <Typography variant="small" color="blue-gray" className="mb-2">
                    Job Role
                  </Typography>
                  <Input
                    name="role"
                    value={testimonialForm.role}
                    onChange={(e) => handleInputChange(e, setTestimonialForm)}
                    placeholder="Enter job role"
                    size="lg"
                  />
                </div>

                <div>
                  <Typography variant="small" color="blue-gray" className="mb-2">
                    Company
                  </Typography>
                  <Input
                    name="company"
                    value={testimonialForm.company}
                    onChange={(e) => handleInputChange(e, setTestimonialForm)}
                    placeholder="Enter company name"
                    size="lg"
                  />
                </div>

                <div>
                  <Typography variant="small" color="blue-gray" className="mb-2">
                    Rating (1-5 stars)
                  </Typography>
                  <select
                    name="rating"
                    value={testimonialForm.rating}
                    onChange={(e) => setTestimonialForm(prev => ({ ...prev, rating: parseInt(e.target.value) }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value={5}>5 Stars</option>
                    <option value={4}>4 Stars</option>
                    <option value={3}>3 Stars</option>
                    <option value={2}>2 Stars</option>
                    <option value={1}>1 Star</option>
                  </select>
                </div>

                <div className="md:col-span-2">
                  <Typography variant="small" color="blue-gray" className="mb-2">
                    Testimonial Text
                  </Typography>
                  <Textarea
                    name="testimonial_text"
                    value={testimonialForm.testimonial_text}
                    onChange={(e) => handleInputChange(e, setTestimonialForm)}
                    placeholder="Enter testimonial text"
                    size="lg"
                    rows={4}
                  />
                </div>

                <div className="flex items-center gap-4">
                  <Typography variant="small" color="blue-gray">
                    Active Status
                  </Typography>
                  <Switch
                    checked={testimonialForm.is_active}
                    onChange={(checked) => setTestimonialForm(prev => ({ ...prev, is_active: checked }))}
                    color="blue"
                  />
                </div>
              </div>

              <div className="flex gap-4 mt-4">
                <Button type="submit" color="green" disabled={isLoading}>
                  {isLoading ? "Saving..." : editingTestimonial ? "Update Testimonial" : "Add Testimonial"}
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
          )}

          {/* Testimonials List */}
          <div className="space-y-4">
            {testimonials.map((testimonial) => (
              <div key={testimonial.id} className="border rounded-lg p-4 bg-white">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <Typography variant="h6" color="blue-gray">
                        {testimonial.name}
                      </Typography>
                      <span className={`px-2 py-1 rounded text-xs ${testimonial.is_active ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                        {testimonial.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                    <div className="flex items-center gap-4 mb-2">
                      <Typography className="text-gray-600 text-sm">
                        {testimonial.role}, {testimonial.company}
                      </Typography>
                      <div className="flex items-center gap-1">
                        {renderStars(testimonial.rating)}
                      </div>
                    </div>
                    <Typography className="text-gray-700 italic">
                      "{testimonial.testimonial_text}"
                    </Typography>
                  </div>
                  <div className="flex gap-2 ml-4">
                    <IconButton
                      size="sm"
                      color="blue"
                      onClick={() => handleEditTestimonial(testimonial)}
                    >
                      <PencilIcon className="w-4 h-4" />
                    </IconButton>
                    <IconButton
                      size="sm"
                      color="red"
                      onClick={() => handleDeleteTestimonial(testimonial.id)}
                    >
                      <TrashIcon className="w-4 h-4" />
                    </IconButton>
                  </div>
                </div>
              </div>
            ))}
            
            {testimonials.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                No testimonials added yet. Click "Add Testimonial" to get started.
              </div>
            )}
          </div>
        </CardBody>
      </Card>
    </div>
  );
};

export default TestimonialsSection; 