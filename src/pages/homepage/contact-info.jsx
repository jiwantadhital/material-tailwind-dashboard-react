import React, { useState, useEffect } from 'react';
import { authService } from '@/services/apiService';
import { Card, CardBody, Typography, Input, Textarea, Button, Switch } from "@material-tailwind/react";

const ContactInfo = () => {
  const [contactData, setContactData] = useState({
    phone_primary: '',
    phone_secondary: '',
    email_primary: '',
    email_secondary: '',
    address_line_1: '',
    address_line_2: '',
    city: '',
    state: '',
    zip_code: '',
    country: 'United States',
    office_hours: '',
    is_active: true
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    fetchContactData();
  }, []);

  const fetchContactData = async () => {
    setIsLoading(true);
    try {
      const response = await authService.getContactInfo();
      if (response.success && response.data) {
        setContactData(response.data);
      }
    } catch (error) {
      console.error('Error fetching contact data:', error);
      // Set default values if API call fails
      setContactData({
        phone_primary: '+1 (555) 123-4567',
        phone_secondary: '+1 (555) 987-6543',
        email_primary: 'info@sajilonotary.com',
        email_secondary: 'support@sajilonotary.com',
        address_line_1: '123 Business Street',
        address_line_2: 'Suite 100',
        city: 'City',
        state: 'State',
        zip_code: '12345',
        country: 'United States',
        office_hours: 'By appointment only',
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
      const response = await authService.updateContactInfo(contactData);
      if (response.success) {
        console.log('Contact info updated successfully');
        setIsEditing(false);
      }
    } catch (error) {
      console.error('Error updating contact info:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setContactData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSwitchChange = (checked) => {
    setContactData(prev => ({
      ...prev,
      is_active: checked
    }));
  };

  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-6">
        <Typography variant="h3" color="blue-gray">
          Contact Information Management
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
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Typography variant="h6" color="blue-gray" className="mb-2">
                    Primary Phone
                  </Typography>
                  <Input
                    name="phone_primary"
                    value={contactData.phone_primary}
                    onChange={handleInputChange}
                    placeholder="+1 (555) 123-4567"
                    size="lg"
                  />
                </div>

                <div>
                  <Typography variant="h6" color="blue-gray" className="mb-2">
                    Secondary Phone
                  </Typography>
                  <Input
                    name="phone_secondary"
                    value={contactData.phone_secondary}
                    onChange={handleInputChange}
                    placeholder="+1 (555) 987-6543"
                    size="lg"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Typography variant="h6" color="blue-gray" className="mb-2">
                    Primary Email
                  </Typography>
                  <Input
                    name="email_primary"
                    type="email"
                    value={contactData.email_primary}
                    onChange={handleInputChange}
                    placeholder="info@sajilonotary.com"
                    size="lg"
                  />
                </div>

                <div>
                  <Typography variant="h6" color="blue-gray" className="mb-2">
                    Secondary Email
                  </Typography>
                  <Input
                    name="email_secondary"
                    type="email"
                    value={contactData.email_secondary}
                    onChange={handleInputChange}
                    placeholder="support@sajilonotary.com"
                    size="lg"
                  />
                </div>
              </div>

              <div>
                <Typography variant="h6" color="blue-gray" className="mb-2">
                  Address Line 1
                </Typography>
                <Input
                  name="address_line_1"
                  value={contactData.address_line_1}
                  onChange={handleInputChange}
                  placeholder="123 Business Street"
                  size="lg"
                />
              </div>

              <div>
                <Typography variant="h6" color="blue-gray" className="mb-2">
                  Address Line 2
                </Typography>
                <Input
                  name="address_line_2"
                  value={contactData.address_line_2}
                  onChange={handleInputChange}
                  placeholder="Suite 100"
                  size="lg"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Typography variant="h6" color="blue-gray" className="mb-2">
                    City
                  </Typography>
                  <Input
                    name="city"
                    value={contactData.city}
                    onChange={handleInputChange}
                    placeholder="City"
                    size="lg"
                  />
                </div>

                <div>
                  <Typography variant="h6" color="blue-gray" className="mb-2">
                    State
                  </Typography>
                  <Input
                    name="state"
                    value={contactData.state}
                    onChange={handleInputChange}
                    placeholder="State"
                    size="lg"
                  />
                </div>

                <div>
                  <Typography variant="h6" color="blue-gray" className="mb-2">
                    ZIP Code
                  </Typography>
                  <Input
                    name="zip_code"
                    value={contactData.zip_code}
                    onChange={handleInputChange}
                    placeholder="12345"
                    size="lg"
                  />
                </div>
              </div>

              <div>
                <Typography variant="h6" color="blue-gray" className="mb-2">
                  Country
                </Typography>
                <Input
                  name="country"
                  value={contactData.country}
                  onChange={handleInputChange}
                  placeholder="United States"
                  size="lg"
                />
              </div>

              <div>
                <Typography variant="h6" color="blue-gray" className="mb-2">
                  Office Hours
                </Typography>
                <Input
                  name="office_hours"
                  value={contactData.office_hours}
                  onChange={handleInputChange}
                  placeholder="By appointment only"
                  size="lg"
                />
              </div>

              <div className="flex items-center gap-2">
                <Switch
                  checked={contactData.is_active}
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
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Typography variant="h6" color="blue-gray" className="mb-2">
                    Primary Phone
                  </Typography>
                  <Typography variant="paragraph" color="gray">
                    {contactData.phone_primary}
                  </Typography>
                </div>

                <div>
                  <Typography variant="h6" color="blue-gray" className="mb-2">
                    Secondary Phone
                  </Typography>
                  <Typography variant="paragraph" color="gray">
                    {contactData.phone_secondary}
                  </Typography>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Typography variant="h6" color="blue-gray" className="mb-2">
                    Primary Email
                  </Typography>
                  <Typography variant="paragraph" color="gray">
                    {contactData.email_primary}
                  </Typography>
                </div>

                <div>
                  <Typography variant="h6" color="blue-gray" className="mb-2">
                    Secondary Email
                  </Typography>
                  <Typography variant="paragraph" color="gray">
                    {contactData.email_secondary}
                  </Typography>
                </div>
              </div>

              <div>
                <Typography variant="h6" color="blue-gray" className="mb-2">
                  Address
                </Typography>
                <Typography variant="paragraph" color="gray">
                  {contactData.address_line_1}
                  {contactData.address_line_2 && <br />}
                  {contactData.address_line_2}
                  <br />
                  {contactData.city}, {contactData.state} {contactData.zip_code}
                  <br />
                  {contactData.country}
                </Typography>
              </div>

              <div>
                <Typography variant="h6" color="blue-gray" className="mb-2">
                  Office Hours
                </Typography>
                <Typography variant="paragraph" color="gray">
                  {contactData.office_hours}
                </Typography>
              </div>

              <div className="flex items-center gap-2">
                <Switch
                  checked={contactData.is_active}
                  disabled
                />
                <Typography variant="h6" color="blue-gray">
                  Active: {contactData.is_active ? "Yes" : "No"}
                </Typography>
              </div>
            </div>
          )}
        </CardBody>
      </Card>
    </div>
  );
};

export default ContactInfo; 