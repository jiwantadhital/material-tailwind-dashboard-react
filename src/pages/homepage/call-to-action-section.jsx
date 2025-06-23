import React, { useState, useEffect } from 'react';
import { authService } from '@/services/apiService';
import { Card, CardBody, Typography, Input, Textarea, Button, Switch } from "@material-tailwind/react";

const CallToActionSection = () => {
  const [ctaData, setCtaData] = useState({
    title: '',
    description: '',
    button_text: '',
    email_placeholder: '',
    bottom_text: '',
    satisfaction_rate: '',
    speed_improvement: '',
    cost_saving: '',
    compliance_rate: '',
    is_active: true
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    fetchCtaData();
  }, []);

  const fetchCtaData = async () => {
    setIsLoading(true);
    try {
      const response = await authService.getCallToActionSection();
      if (response.success && response.data) {
        setCtaData(response.data);
      }
    } catch (error) {
      console.error('Error fetching CTA data:', error);
      // Set default values if API call fails
      setCtaData({
        title: 'Ready to streamline your document workflows?',
        description: 'Join thousands of businesses and professionals who are saving time and resources with Sajilo Notary\'s secure platform.',
        button_text: 'Get Started',
        email_placeholder: 'Your email',
        bottom_text: 'Join 2,500+ businesses already using Sajilo Notary',
        satisfaction_rate: '98%',
        speed_improvement: '4x',
        cost_saving: '40%',
        compliance_rate: '100%',
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
      const response = await authService.updateCallToActionSection(ctaData);
      if (response.success) {
        console.log('Call to Action section updated successfully');
        setIsEditing(false);
      }
    } catch (error) {
      console.error('Error updating CTA section:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setCtaData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSwitchChange = (checked) => {
    setCtaData(prev => ({
      ...prev,
      is_active: checked
    }));
  };

  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-6">
        <Typography variant="h3" color="blue-gray">
          Call to Action Section Management
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
                <Textarea
                  name="title"
                  value={ctaData.title}
                  onChange={handleInputChange}
                  placeholder="Enter main title"
                  size="lg"
                  rows={2}
                />
              </div>

              <div>
                <Typography variant="h6" color="blue-gray" className="mb-2">
                  Description
                </Typography>
                <Textarea
                  name="description"
                  value={ctaData.description}
                  onChange={handleInputChange}
                  placeholder="Enter description"
                  size="lg"
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Typography variant="h6" color="blue-gray" className="mb-2">
                    Primary Button Text
                  </Typography>
                  <Input
                    name="button_text"
                    value={ctaData.button_text}
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
                    value={ctaData.email_placeholder}
                    onChange={handleInputChange}
                    placeholder="Enter email placeholder"
                    size="lg"
                  />
                </div>
              </div>

              <div>
                <Typography variant="h6" color="blue-gray" className="mb-2">
                  Bottom Text
                </Typography>
                <Input
                  name="bottom_text"
                  value={ctaData.bottom_text}
                  onChange={handleInputChange}
                  placeholder="Enter bottom text"
                  size="lg"
                />
              </div>

              <div>
                <Typography variant="h5" color="blue-gray" className="mb-4">
                  Statistics Cards
                </Typography>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div>
                    <Typography variant="small" color="blue-gray" className="mb-2">
                      Satisfaction Rate
                    </Typography>
                    <Input
                      name="satisfaction_rate"
                      value={ctaData.satisfaction_rate}
                      onChange={handleInputChange}
                      placeholder="e.g., 98%"
                      size="lg"
                    />
                  </div>

                  <div>
                    <Typography variant="small" color="blue-gray" className="mb-2">
                      Speed Improvement
                    </Typography>
                    <Input
                      name="speed_improvement"
                      value={ctaData.speed_improvement}
                      onChange={handleInputChange}
                      placeholder="e.g., 4x"
                      size="lg"
                    />
                  </div>

                  <div>
                    <Typography variant="small" color="blue-gray" className="mb-2">
                      Cost Saving
                    </Typography>
                    <Input
                      name="cost_saving"
                      value={ctaData.cost_saving}
                      onChange={handleInputChange}
                      placeholder="e.g., 40%"
                      size="lg"
                    />
                  </div>

                  <div>
                    <Typography variant="small" color="blue-gray" className="mb-2">
                      Compliance Rate
                    </Typography>
                    <Input
                      name="compliance_rate"
                      value={ctaData.compliance_rate}
                      onChange={handleInputChange}
                      placeholder="e.g., 100%"
                      size="lg"
                    />
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <Typography variant="h6" color="blue-gray">
                  Active Status
                </Typography>
                <Switch
                  checked={ctaData.is_active}
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
                  Current Call to Action Content
                </Typography>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="md:col-span-2">
                  <Typography variant="h6" color="blue-gray" className="mb-2">
                    Main Title
                  </Typography>
                  <Typography className="text-gray-700 bg-gray-50 p-3 rounded">
                    {ctaData.title || "No title set"}
                  </Typography>
                </div>

                <div className="md:col-span-2">
                  <Typography variant="h6" color="blue-gray" className="mb-2">
                    Description
                  </Typography>
                  <Typography className="text-gray-700 bg-gray-50 p-3 rounded">
                    {ctaData.description || "No description set"}
                  </Typography>
                </div>

                <div>
                  <Typography variant="h6" color="blue-gray" className="mb-2">
                    Button Text
                  </Typography>
                  <Typography className="text-gray-700 bg-gray-50 p-3 rounded">
                    {ctaData.button_text || "No button text set"}
                  </Typography>
                </div>

                <div>
                  <Typography variant="h6" color="blue-gray" className="mb-2">
                    Email Placeholder
                  </Typography>
                  <Typography className="text-gray-700 bg-gray-50 p-3 rounded">
                    {ctaData.email_placeholder || "No placeholder set"}
                  </Typography>
                </div>

                <div className="md:col-span-2">
                  <Typography variant="h6" color="blue-gray" className="mb-2">
                    Bottom Text
                  </Typography>
                  <Typography className="text-gray-700 bg-gray-50 p-3 rounded">
                    {ctaData.bottom_text || "No bottom text set"}
                  </Typography>
                </div>
              </div>

              <div>
                <Typography variant="h6" color="blue-gray" className="mb-4">
                  Statistics Cards
                </Typography>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <Card className="bg-blue-50">
                    <CardBody className="p-4 text-center">
                      <Typography variant="h4" color="blue-gray" className="mb-1">
                        {ctaData.satisfaction_rate || "N/A"}
                      </Typography>
                      <Typography variant="small" color="gray">
                        Satisfaction
                      </Typography>
                    </CardBody>
                  </Card>

                  <Card className="bg-green-50">
                    <CardBody className="p-4 text-center">
                      <Typography variant="h4" color="blue-gray" className="mb-1">
                        {ctaData.speed_improvement || "N/A"}
                      </Typography>
                      <Typography variant="small" color="gray">
                        Faster
                      </Typography>
                    </CardBody>
                  </Card>

                  <Card className="bg-orange-50">
                    <CardBody className="p-4 text-center">
                      <Typography variant="h4" color="blue-gray" className="mb-1">
                        {ctaData.cost_saving || "N/A"}
                      </Typography>
                      <Typography variant="small" color="gray">
                        Cost Saved
                      </Typography>
                    </CardBody>
                  </Card>

                  <Card className="bg-purple-50">
                    <CardBody className="p-4 text-center">
                      <Typography variant="h4" color="blue-gray" className="mb-1">
                        {ctaData.compliance_rate || "N/A"}
                      </Typography>
                      <Typography variant="small" color="gray">
                        Compliant
                      </Typography>
                    </CardBody>
                  </Card>
                </div>
              </div>

              <div>
                <Typography variant="h6" color="blue-gray" className="mb-2">
                  Status
                </Typography>
                <Typography className={`p-3 rounded ${ctaData.is_active ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                  {ctaData.is_active ? 'Active' : 'Inactive'}
                </Typography>
              </div>
            </div>
          )}
        </CardBody>
      </Card>
    </div>
  );
};

export default CallToActionSection; 