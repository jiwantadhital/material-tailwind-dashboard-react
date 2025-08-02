import React, { useState, useEffect } from 'react';
import { authService } from '@/services/apiService';
import { Card, CardBody, Typography, Input, Textarea, Button, Switch } from "@material-tailwind/react";

const AboutUsSection = () => {
  const [aboutUsData, setAboutUsData] = useState({
    title: '',
    description: '',
    mission_title: '',
    mission_description: '',
    vision_title: '',
    vision_description: '',
    is_active: true
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    fetchAboutUsData();
  }, []);

  const fetchAboutUsData = async () => {
    setIsLoading(true);
    try {
      const response = await authService.getAboutUsSection();
      if (response.success && response.data) {
        setAboutUsData(response.data);
      }
    } catch (error) {
      console.error('Error fetching about us data:', error);
      // Set default values if API call fails
      setAboutUsData({
        title: 'Our Mission & Vision',
        description: 'We\'re on a mission to make document authentication faster, more secure, and more accessible than ever before.',
        mission_title: 'Our Mission',
        mission_description: 'To provide secure, efficient, and accessible document authentication services.',
        vision_title: 'Our Vision',
        vision_description: 'To become the global standard for digital document authentication.',
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
      const response = await authService.updateAboutUsSection(aboutUsData);
      if (response.success) {
        console.log('About Us section updated successfully');
        setIsEditing(false);
      }
    } catch (error) {
      console.error('Error updating about us section:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setAboutUsData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSwitchChange = (checked) => {
    setAboutUsData(prev => ({
      ...prev,
      is_active: checked
    }));
  };

  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-6">
        <Typography variant="h3" color="blue-gray">
          About Us Section Management
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
                  Main Title
                </Typography>
                <Input
                  name="title"
                  value={aboutUsData.title}
                  onChange={handleInputChange}
                  placeholder="Enter main title"
                  size="lg"
                />
              </div>

              <div>
                <Typography variant="h6" color="blue-gray" className="mb-2">
                  Description
                </Typography>
                <Textarea
                  name="description"
                  value={aboutUsData.description}
                  onChange={handleInputChange}
                  placeholder="Enter description"
                  size="lg"
                  rows={4}
                />
              </div>

              <div>
                <Typography variant="h6" color="blue-gray" className="mb-2">
                  Mission Title
                </Typography>
                <Input
                  name="mission_title"
                  value={aboutUsData.mission_title}
                  onChange={handleInputChange}
                  placeholder="Enter mission title"
                  size="lg"
                />
              </div>

              <div>
                <Typography variant="h6" color="blue-gray" className="mb-2">
                  Mission Description
                </Typography>
                <Textarea
                  name="mission_description"
                  value={aboutUsData.mission_description}
                  onChange={handleInputChange}
                  placeholder="Enter mission description"
                  size="lg"
                  rows={3}
                />
              </div>

              <div>
                <Typography variant="h6" color="blue-gray" className="mb-2">
                  Vision Title
                </Typography>
                <Input
                  name="vision_title"
                  value={aboutUsData.vision_title}
                  onChange={handleInputChange}
                  placeholder="Enter vision title"
                  size="lg"
                />
              </div>

              <div>
                <Typography variant="h6" color="blue-gray" className="mb-2">
                  Vision Description
                </Typography>
                <Textarea
                  name="vision_description"
                  value={aboutUsData.vision_description}
                  onChange={handleInputChange}
                  placeholder="Enter vision description"
                  size="lg"
                  rows={3}
                />
              </div>

              <div className="flex items-center gap-2">
                <Switch
                  checked={aboutUsData.is_active}
                  onChange={(e) => handleSwitchChange(e.target.checked)}
                />
                <Typography variant="h6" color="blue-gray">
                  Active
                </Typography>
              </div>

              <div className="flex gap-2">
                <Button
                  type="submit"
                  color="green"
                  variant="gradient"
                  disabled={isLoading}
                >
                  {isLoading ? "Saving..." : "Save Changes"}
                </Button>
              </div>
            </form>
          ) : (
            <div className="space-y-6">
              <div>
                <Typography variant="h6" color="blue-gray" className="mb-2">
                  Main Title
                </Typography>
                <Typography variant="paragraph" color="gray">
                  {aboutUsData.title}
                </Typography>
              </div>

              <div>
                <Typography variant="h6" color="blue-gray" className="mb-2">
                  Description
                </Typography>
                <Typography variant="paragraph" color="gray">
                  {aboutUsData.description}
                </Typography>
              </div>

              <div>
                <Typography variant="h6" color="blue-gray" className="mb-2">
                  Mission Title
                </Typography>
                <Typography variant="paragraph" color="gray">
                  {aboutUsData.mission_title}
                </Typography>
              </div>

              <div>
                <Typography variant="h6" color="blue-gray" className="mb-2">
                  Mission Description
                </Typography>
                <Typography variant="paragraph" color="gray">
                  {aboutUsData.mission_description}
                </Typography>
              </div>

              <div>
                <Typography variant="h6" color="blue-gray" className="mb-2">
                  Vision Title
                </Typography>
                <Typography variant="paragraph" color="gray">
                  {aboutUsData.vision_title}
                </Typography>
              </div>

              <div>
                <Typography variant="h6" color="blue-gray" className="mb-2">
                  Vision Description
                </Typography>
                <Typography variant="paragraph" color="gray">
                  {aboutUsData.vision_description}
                </Typography>
              </div>

              <div className="flex items-center gap-2">
                <Switch
                  checked={aboutUsData.is_active}
                  disabled
                />
                <Typography variant="h6" color="blue-gray">
                  Active: {aboutUsData.is_active ? "Yes" : "No"}
                </Typography>
              </div>
            </div>
          )}
        </CardBody>
      </Card>
    </div>
  );
};

export default AboutUsSection; 