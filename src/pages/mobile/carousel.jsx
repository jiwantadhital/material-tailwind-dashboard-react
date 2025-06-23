import React, { useState, useEffect } from "react";
import { authService } from "../../services/apiService";
import {
  Card,
  CardHeader,
  CardBody,
  Typography,
  Input,
  Button,
  Textarea,
  Alert,
  IconButton
} from "@material-tailwind/react";
import { XMarkIcon, PencilIcon } from "@heroicons/react/24/outline";

const Carousel = () => {
  const [carouselItems, setCarouselItems] = useState([]);
  const [selectedItem, setSelectedItem] = useState(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [alertMessage, setAlertMessage] = useState("");
  const [showAlert, setShowAlert] = useState(false);
  const [alertType, setAlertType] = useState("success");
  const [formData, setFormData] = useState({
    title: "",
    html_content: "",
    image: null
  });
  const [imagePreview, setImagePreview] = useState(null);

  useEffect(() => {
    fetchCarouselItems();
  }, []);

  const fetchCarouselItems = async () => {
    try {
      const response = await authService.getCarouselImages();
      setCarouselItems(response.data || []);
    } catch (error) {
      console.error('Error fetching carousel items:', error);
      showAlertMessage('Failed to fetch carousel items', 'error');
    }
  };

  const showAlertMessage = (message, type = 'success') => {
    setAlertMessage(message);
    setAlertType(type);
    setShowAlert(true);
    setTimeout(() => setShowAlert(false), 4000);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData(prev => ({
        ...prev,
        image: file
      }));
      
      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.title || !formData.html_content || !formData.image) {
      showAlertMessage('Please fill in all fields and select an image', 'error');
      return;
    }

    setIsSubmitting(true);
    try {
      await authService.uploadCarouselImage(
        formData.image, 
        formData.title, 
        formData.html_content
      );
      
      showAlertMessage('Carousel item saved successfully!', 'success');
      resetForm();
      fetchCarouselItems();
    } catch (error) {
      console.error('Error saving carousel item:', error);
      showAlertMessage('Failed to save carousel item', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setFormData({
      title: "",
      html_content: "",
      image: null
    });
    setImagePreview(null);
    setSelectedItem(null);
    setIsFormOpen(false);
  };

  const handleEdit = (item) => {
    setSelectedItem(item);
    setFormData({
      title: item.title || "",
      html_content: item.html_content || "",
      image: null
    });
    setImagePreview(item.image_url);
    setIsFormOpen(true);
  };

  const renderHtmlContent = (htmlContent) => {
    return (
      <div 
        className="text-sm text-gray-600 max-h-20 overflow-y-auto border p-2 rounded bg-gray-50"
        dangerouslySetInnerHTML={{ __html: htmlContent }}
      />
    );
  };

  return (
    <div className="mt-12 mb-8 flex flex-col gap-12">
      {showAlert && (
        <Alert
          color={alertType === 'success' ? 'green' : 'red'}
          className="fixed top-4 right-4 z-50 w-96"
        >
          {alertMessage}
        </Alert>
      )}

      <Card>
        <CardHeader variant="gradient" color="gray" className="mb-8 p-6">
          <Typography variant="h6" color="white">
            Carousel Management
          </Typography>
        </CardHeader>
        <CardBody className="px-0 pt-0 pb-2">
          <div className="px-6 mb-6">
            <Button 
              onClick={() => setIsFormOpen(!isFormOpen)} 
              color={isFormOpen ? "red" : "blue"} 
              variant="gradient"
              className="flex items-center justify-center gap-2"
            >
              {isFormOpen ? (
                <>
                  <XMarkIcon className="h-5 w-5" />
                  Cancel
                </>
              ) : (
                <>
                  <PencilIcon className="h-5 w-5" />
                  Add New Carousel Item
                </>
              )}
            </Button>
          </div>

          {isFormOpen && (
            <div className="px-6 mb-8">
              <Card className="border">
                <CardBody>
                  <Typography variant="h6" color="blue-gray" className="mb-4">
                    {selectedItem ? 'Edit Carousel Item' : 'Add New Carousel Item'}
                  </Typography>
                  
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                      <Typography variant="small" color="blue-gray" className="mb-2 font-medium">
                        Title
                      </Typography>
                      <Input
                        name="title"
                        value={formData.title}
                        onChange={handleInputChange}
                        placeholder="Enter carousel item title"
                        required
                        className="!border-t-blue-gray-200 focus:!border-t-gray-900"
                        labelProps={{
                          className: "before:content-none after:content-none",
                        }}
                      />
                    </div>

                    <div>
                      <Typography variant="small" color="blue-gray" className="mb-2 font-medium">
                        HTML Content
                      </Typography>
                      <Textarea
                        name="html_content"
                        value={formData.html_content}
                        onChange={handleInputChange}
                        placeholder="Enter HTML content for this carousel item"
                        required
                        rows={8}
                        className="!border-t-blue-gray-200 focus:!border-t-gray-900"
                        labelProps={{
                          className: "before:content-none after:content-none",
                        }}
                      />
                      <Typography variant="small" color="gray" className="mt-1">
                        You can use HTML tags for formatting (e.g., &lt;h2&gt;, &lt;p&gt;, &lt;a&gt;, etc.)
                      </Typography>
                    </div>

                    <div>
                      <Typography variant="small" color="blue-gray" className="mb-2 font-medium">
                        Image
                      </Typography>
                      <Input
                        type="file"
                        accept="image/*"
                        onChange={handleImageChange}
                        required={!selectedItem}
                        className="!border-t-blue-gray-200 focus:!border-t-gray-900"
                        labelProps={{
                          className: "before:content-none after:content-none",
                        }}
                      />
                      {imagePreview && (
                        <div className="mt-4">
                          <img
                            src={imagePreview}
                            alt="Preview"
                            className="w-full max-w-md h-48 object-cover rounded-lg border"
                          />
                        </div>
                      )}
                    </div>

                    <div className="flex gap-4">
                      <Button 
                        type="submit" 
                        color="blue" 
                        variant="gradient"
                        disabled={isSubmitting}
                        className="flex-1"
                      >
                        {isSubmitting ? 'Saving...' : (selectedItem ? 'Update Item' : 'Add Item')}
                      </Button>
                      <Button 
                        type="button" 
                        color="gray" 
                        variant="outlined"
                        onClick={resetForm}
                        className="flex-1"
                      >
                        Reset
                      </Button>
                    </div>
                  </form>
                </CardBody>
              </Card>
            </div>
          )}

          {/* Existing Carousel Items */}
          <div className="px-6">
            <Typography variant="h6" color="blue-gray" className="mb-4">
              Existing Carousel Items ({carouselItems.length})
            </Typography>
            
            {carouselItems.length === 0 ? (
              <div className="text-center py-8">
                <Typography color="gray">
                  No carousel items found. Add your first item using the form above.
                </Typography>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {carouselItems.map((item, index) => (
                  <Card key={item.id || index} className="border">
                    <CardBody className="p-4">
                      <div className="mb-3">
                        <img
                          src={item.image_url}
                          alt={item.title}
                          className="w-full h-32 object-cover rounded-lg"
                        />
                      </div>
                      
                      <Typography variant="h6" color="blue-gray" className="mb-2">
                        {item.title}
                      </Typography>
                      
                      {item.html_content && (
                        <div className="mb-3">
                          <Typography variant="small" color="blue-gray" className="mb-1 font-medium">
                            HTML Content:
                          </Typography>
                          {renderHtmlContent(item.html_content)}
                        </div>
                      )}
                      
                      <div className="flex justify-end">
                        <IconButton
                          size="sm"
                          color="blue"
                          variant="text"
                          onClick={() => handleEdit(item)}
                        >
                          <PencilIcon className="h-4 w-4" />
                        </IconButton>
                      </div>
                    </CardBody>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </CardBody>
      </Card>
    </div>
  );
};

export default Carousel;
