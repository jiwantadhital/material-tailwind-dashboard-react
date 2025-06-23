import React, { useState, useEffect } from 'react';
import { authService } from '@/services/apiService';
import { Card, CardBody, Typography, Input, Textarea, Button, Switch } from "@material-tailwind/react";

const HeroSection = () => {
  const [heroData, setHeroData] = useState({
    title: '',
    subtitle: '',
    description: '',
    primary_button_text: '',
    email_placeholder: '',
    is_active: true
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    fetchHeroData();
  }, []);

  const fetchHeroData = async () => {
    setIsLoading(true);
    try {
      const response = await authService.getHeroSection();
      if (response.success && response.data) {
        setHeroData(response.data);
      }
    } catch (error) {
      console.error('Error fetching hero data:', error);
      // Set default values if API call fails
      setHeroData({
        title: 'Notarize Documents Securely & Seamlessly',
        subtitle: 'SECURE & STREAMLINED NOTARY SERVICES',
        description: 'Sajilo Notary brings the power of digital transformation to notarial services, making document authentication faster, secure, and convenient for everyone.',
        primary_button_text: 'Get Started',
        email_placeholder: 'Your email',
        is_active: true
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const response = await authService.updateHeroSection(heroData);
      if (response.success) {
        console.log('Hero section updated successfully');
        setIsEditing(false);
      }
    } catch (error) {
      console.error('Error updating hero section:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setHeroData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSwitchChange = (checked) => {
    setHeroData(prev => ({
      ...prev,
      is_active: checked
    }));
  };

  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-6">
        <Typography variant="h3" color="blue-gray">
          Hero Section Management
        </Typography>
        <Button
          onClick={() => setIsEditing(!isEditing)}
          color={isEditing ? "red" : "blue"}
          variant="gradient"
        >
          {isEditing ? "Cancel" : "Edit"}
        </Button>
      </div>

      <Card>
        <CardBody>
          {isEditing ? (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <Typography variant="h6" color="blue-gray" className="mb-2">
                  Subtitle
                </Typography>
                <Input
                  name="subtitle"
                  value={heroData.subtitle}
                  onChange={handleInputChange}
                  placeholder="Enter subtitle"
                  size="lg"
                />
              </div>

              <div>
                <Typography variant="h6" color="blue-gray" className="mb-2">
                  Main Title
                </Typography>
                <Textarea
                  name="title"
                  value={heroData.title}
                  onChange={handleInputChange}
                  placeholder="Enter main title"
                  size="lg"
                  rows={3}
                />
              </div>

              <div>
                <Typography variant="h6" color="blue-gray" className="mb-2">
                  Description
                </Typography>
                <Textarea
                  name="description"
                  value={heroData.description}
                  onChange={handleInputChange}
                  placeholder="Enter description"
                  size="lg"
                  rows={4}
                />
              </div>

              <div>
                <Typography variant="h6" color="blue-gray" className="mb-2">
                  Primary Button Text
                </Typography>
                <Input
                  name="primary_button_text"
                  value={heroData.primary_button_text}
                  onChange={handleInputChange}
                  placeholder="Enter button text"
                  size="lg"
                />
              </div>

              <div>
                <Typography variant="h6" color="blue-gray" className="mb-2">
                  Email Placeholder
                </Typography>
                <Input
                  name="email_placeholder"
                  value={heroData.email_placeholder}
                  onChange={handleInputChange}
                  placeholder="Enter email placeholder"
                  size="lg"
                />
              </div>

              <div className="flex items-center gap-4">
                <Typography variant="h6" color="blue-gray">
                  Active Status
                </Typography>
                <Switch
                  checked={heroData.is_active}
                  onChange={handleSwitchChange}
                  color="blue"
                />
              </div>

              <div className="flex gap-4">
                <Button
                  type="submit"
                  color="green"
                  disabled={isLoading}
                  className="flex-1"
                >
                  {isLoading ? "Saving..." : "Save Changes"}
                </Button>
                <Button
                  type="button"
                  color="red"
                  variant="outlined"
                  onClick={() => setIsEditing(false)}
                  className="flex-1"
                >
                  Cancel
                </Button>
              </div>
            </form>
          ) : (
            <div className="space-y-6">
              <div>
                <Typography variant="h6" color="blue-gray" className="mb-2">
                  Current Hero Section Content
                </Typography>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Typography variant="h6" color="blue-gray" className="mb-2">
                    Subtitle
                  </Typography>
                  <Typography className="text-gray-700 bg-gray-50 p-3 rounded">
                    {heroData.subtitle || "No subtitle set"}
                  </Typography>
                </div>

                <div>
                  <Typography variant="h6" color="blue-gray" className="mb-2">
                    Button Text
                  </Typography>
                  <Typography className="text-gray-700 bg-gray-50 p-3 rounded">
                    {heroData.primary_button_text || "No button text set"}
                  </Typography>
                </div>

                <div className="md:col-span-2">
                  <Typography variant="h6" color="blue-gray" className="mb-2">
                    Main Title
                  </Typography>
                  <Typography className="text-gray-700 bg-gray-50 p-3 rounded">
                    {heroData.title || "No title set"}
                  </Typography>
                </div>

                <div className="md:col-span-2">
                  <Typography variant="h6" color="blue-gray" className="mb-2">
                    Description
                  </Typography>
                  <Typography className="text-gray-700 bg-gray-50 p-3 rounded">
                    {heroData.description || "No description set"}
                  </Typography>
                </div>

                <div>
                  <Typography variant="h6" color="blue-gray" className="mb-2">
                    Email Placeholder
                  </Typography>
                  <Typography className="text-gray-700 bg-gray-50 p-3 rounded">
                    {heroData.email_placeholder || "No placeholder set"}
                  </Typography>
                </div>

                <div>
                  <Typography variant="h6" color="blue-gray" className="mb-2">
                    Status
                  </Typography>
                  <Typography className={`p-3 rounded ${heroData.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                    {heroData.isActive ? 'Active' : 'Inactive'}
                  </Typography>
                </div>
              </div>
            </div>
          )}
        </CardBody>
      </Card>
    </div>
  );
};

export default HeroSection; 