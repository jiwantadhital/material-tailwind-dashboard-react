import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Card,
  CardContent,
  TextField,
  Button,
  FormControlLabel,
  Checkbox,
  Typography,
  Grid,
  Box,
  InputAdornment,
  FormHelperText,
  Paper,
  Divider,
  Container,
  Fade,
  Chip,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { toast } from 'react-toastify';
import { authService } from '../../services/apiService';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import { Textarea } from "@material-tailwind/react";

// Styled components for enhanced visual appeal
const StyledCard = styled(Card)(({ theme }) => ({
  borderRadius: 16,
  boxShadow: '0 8px 24px rgba(0, 0, 0, 0.08)',
  overflow: 'visible',
  position: 'relative',
}));

const StyledInput = styled(TextField)(({ theme }) => ({
  '& .MuiOutlinedInput-root': {
    borderRadius: 10,
    transition: 'all 0.3s ease',
    '&:hover': {
      boxShadow: '0 0 0 2px rgba(25, 118, 210, 0.1)',
    },
    '&.Mui-focused': {
      boxShadow: '0 0 0 2px rgba(25, 118, 210, 0.2)',
    },
  },
  '& .MuiInputLabel-root': {
    fontWeight: 500,
  },
}));

const ActionButton = styled(Button)(({ theme }) => ({
  borderRadius: 10,
  padding: '12px 24px',
  fontWeight: 600,
  boxShadow: 'none',
  textTransform: 'none',
  transition: 'all 0.3s ease',
  '&:hover': {
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
    transform: 'translateY(-2px)',
  },
}));

const UploadButton = styled(Button)(({ theme }) => ({
  display: 'inline-flex',
  alignItems: 'center',
  gap: 8,
  cursor: 'pointer',
  padding: '12px 20px',
  borderRadius: 10,
  backgroundColor: theme.palette.primary.main,
  color: 'white',
  fontWeight: 500,
  boxShadow: '0 4px 14px rgba(25, 118, 210, 0.25)',
  transition: 'all 0.3s ease',
  '&:hover': {
    backgroundColor: theme.palette.primary.dark,
    boxShadow: '0 6px 16px rgba(25, 118, 210, 0.35)',
    transform: 'translateY(-2px)',
  },
}));

const SectionTitle = styled(Typography)(({ theme }) => ({
  fontWeight: 600,
  fontSize: '1.1rem',
  marginBottom: 16,
  color: theme.palette.text.primary,
  position: 'relative',
  '&:after': {
    content: '""',
    position: 'absolute',
    left: 0,
    bottom: -8,
    width: 40,
    height: 3,
    backgroundColor: theme.palette.primary.main,
    borderRadius: 2,
  },
}));

const ImagePreviewContainer = styled(Paper)(({ theme }) => ({
  padding: 16,
  borderRadius: 12,
  display: 'inline-flex',
  flexDirection: 'column',
  alignItems: 'center',
  gap: 8,
  border: `1px dashed ${theme.palette.divider}`,
  backgroundColor: theme.palette.background.default,
  transition: 'all 0.3s ease',
  maxWidth: 320,
}));

const StyledQuillEditor = styled('div')(({ theme, error }) => ({
  '& .ql-container': {
    borderRadius: '0 0 10px 10px',
    border: `1px solid ${error ? theme.palette.error.main : theme.palette.divider}`,
    borderTop: 'none',
    minHeight: '200px',
    fontSize: '14px',
  },
  '& .ql-toolbar': {
    borderRadius: '10px 10px 0 0',
    border: `1px solid ${error ? theme.palette.error.main : theme.palette.divider}`,
    borderBottom: 'none',
  },
  '& .ql-editor': {
    minHeight: '200px',
    padding: '12px 16px',
  },
  '& .ql-editor.ql-blank::before': {
    color: theme.palette.text.secondary,
    fontStyle: 'italic',
  },
}));

// Simple check icon component
const CheckIcon = () => (
  <svg width="64" height="64" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" fill="#4CAF50" />
    <path d="M7.75 12.75L10.25 15.25L16.25 9.25" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

// Simple upload icon component
const UploadIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M12 15V3M12 3L7 8M12 3L17 8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M4 17V19C4 20.1046 4.89543 21 6 21H18C19.1046 21 20 20.1046 20 19V17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

// Simple delete icon component
const DeleteIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M6 6L18 18M18 6L6 18" stroke="#f44336" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

// Quill editor configuration
const quillModules = {
  toolbar: [
    [{ 'header': [1, 2, 3, false] }],
    ['bold', 'italic', 'underline', 'strike'],
    [{ 'list': 'ordered'}, { 'list': 'bullet' }],
    [{ 'color': [] }, { 'background': [] }],
    [{ 'align': [] }],
    ['link', 'blockquote'],
    ['clean']
  ],
  clipboard: {
    matchVisual: false,
  },
};

const quillFormats = [
  'header',
  'bold', 'italic', 'underline', 'strike',
  'list', 'bullet',
  'color', 'background',
  'align',
  'link', 'blockquote'
];

const EditService = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditMode = Boolean(id);
  
  const [service, setService] = useState({
    title: '',
    code: '',
    priceRange: '',
    shortDescription: '',
    description: '',
    image: null,
    imagePreview: null,
    isActive: true,
    isTopRated: false,
    percentageOfPrice: '0',
  });
  
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);
  
  useEffect(() => {
    if (isEditMode) {
      setLoading(true);
      // Use actual API call to get service by ID
      authService.getservicebyId(id)
        .then(response => {
          const data = response.data;
          
          // When loading service data
          const cleanDescription = data.description || '';
          
          // Map backend field names to frontend field names
          setService({
            title: data.name || '',
            code: data.code || '',
            priceRange: data.price_range || '',
            shortDescription: data.short_description || '',
            description: cleanDescription,
            imagePreview: data.image_url || null,
            image: null,
            isActive: data.is_active === 1 || data.is_active === true,
            isTopRated: data.is_featured === 1 || data.is_featured === true,
            percentageOfPrice: data.percentage_of_price || '0',
          });
          setLoading(false);
        })
        .catch(error => {
          console.error('Error loading service details:', error);
          toast.error('Failed to load service details');
          setLoading(false);
        });
    }
  }, [id, isEditMode]);
  
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setService(prev => ({ ...prev, [name]: value }));
  };
  
  const handleCheckboxChange = (e) => {
    const { name, checked } = e.target;
    setService(prev => ({ ...prev, [name]: checked }));
  };
  
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setService(prev => ({ 
        ...prev, 
        image: file,
        imagePreview: URL.createObjectURL(file)
      }));
    }
  };
  
  const handleRemoveImage = () => {
    setService(prev => ({
      ...prev,
      image: null,
      imagePreview: null
    }));
  };
  
  const validateForm = () => {
    const newErrors = {};
    
    if (!service.title.trim()) newErrors.title = 'Title is required';
    if (!service.code.trim()) newErrors.code = 'Code is required';
    if (!service.priceRange.trim()) newErrors.priceRange = 'Price range is required';
    if (!service.shortDescription.trim()) newErrors.shortDescription = 'Short description is required';
    if (!service.description.trim()) newErrors.description = 'Description is required';
    if (!isEditMode && !service.image) newErrors.image = 'Image is required';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setLoading(true);
    
    try {
      // Create FormData to handle file upload
      const formData = new FormData();
      
      // When saving service data
      formData.append('description', service.description);
      
      // Map frontend field names to backend field names
      formData.append('name', service.title);
      formData.append('code', service.code);
      formData.append('price_range', service.priceRange);
      formData.append('short_description', service.shortDescription);
      formData.append('is_active', service.isActive ? 1 : 0);
      formData.append('is_featured', service.isTopRated ? 1 : 0);
      formData.append('percentage_of_price', service.percentageOfPrice);
      
      // Only append image if it exists and is a file object (not a URL)
      if (service.image instanceof File) {
        formData.append('image', service.image);
      }
      
      if (isEditMode) {
        // Use apiService to update the service
        await authService.updateService(id, formData);
        toast.success('Service updated successfully');
      } else {
        // Use apiService to create the service
        await authService.createService(formData);
        toast.success('Service created successfully');
      }
      
      setSaved(true);
      setTimeout(() => {
        navigate('/basicSettings/services'); // Redirect to services list
      }, 1500);
    } catch (error) {
      console.error('Error:', error);
      toast.error(isEditMode ? 'Failed to update service' : 'Failed to create service');
    } finally {
      setLoading(false);
    }
  };
  
  if (loading && isEditMode) {
    return (
      <Container maxWidth="md" sx={{ py: 5 }}>
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
          <Typography variant="h6" color="text.secondary">Loading service details...</Typography>
        </Box>
      </Container>
    );
  }
  
  return (
    <Container maxWidth="md" sx={{ py: 5 }}>
      <StyledCard elevation={0}>
        {saved && (
          <Fade in={saved}>
            <Box sx={{ 
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: 'rgba(255, 255, 255, 0.9)',
              zIndex: 2,
              borderRadius: 4,
            }}>
              <CheckIcon />
              <Typography variant="h5" color="success.main" gutterBottom>
                Service {isEditMode ? 'Updated' : 'Created'} Successfully!
              </Typography>
              <Typography color="text.secondary">
                Redirecting to services page...
              </Typography>
            </Box>
          </Fade>
        )}
        
        <Box sx={{ 
          bgcolor: 'primary.main', 
          color: 'white', 
          py: 3, 
          px: 4, 
          borderTopLeftRadius: 16, 
          borderTopRightRadius: 16,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <Typography variant="h5" component="h1" fontWeight="bold">
            {isEditMode ? 'Edit Service' : 'Add New Service'}
          </Typography>
          <Chip 
            label={isEditMode ? "Editing" : "New"} 
            color="info" 
            variant="filled"
            sx={{ 
              fontWeight: 600, 
              color: 'white', 
              bgcolor: 'rgba(255, 255, 255, 0.15)',
              '& .MuiChip-label': { px: 1.5 } 
            }} 
          />
        </Box>
        
        <CardContent sx={{ p: 4 }}>
          <Box component="form" onSubmit={handleSubmit} noValidate sx={{ mt: 1 }}>
            <Box sx={{ mb: 4, mt: 1 }}>
              <SectionTitle>Basic Information</SectionTitle>
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <StyledInput
                    fullWidth
                    label="Service Title"
                    name="title"
                    value={service.title}
                    onChange={handleInputChange}
                    error={!!errors.title}
                    helperText={errors.title}
                    required
                    variant="outlined"
                    placeholder="e.g. Website Design"
                    InputProps={{
                      sx: { fontWeight: 500 }
                    }}
                  />
                </Grid>
                
                <Grid item xs={12} md={6}>
                  <StyledInput
                    fullWidth
                    label="Service Code"
                    name="code"
                    value={service.code}
                    onChange={handleInputChange}
                    error={!!errors.code}
                    helperText={errors.code}
                    required
                    variant="outlined"
                    placeholder="e.g. WEB-DSG"
                  />
                </Grid>
              </Grid>
            </Box>
            
            <Divider sx={{ my: 4 }} />
            
            <Box sx={{ mb: 4 }}>
              <SectionTitle>Pricing Details</SectionTitle>
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <StyledInput
                    fullWidth
                    label="Price Range"
                    name="priceRange"
                    value={service.priceRange}
                    onChange={handleInputChange}
                    placeholder="e.g. $50 - $100"
                    error={!!errors.priceRange}
                    helperText={errors.priceRange || "Format: $XX - $XX"}
                    required
                    variant="outlined"
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <span style={{ color: '#888' }}>Range:</span>
                        </InputAdornment>
                      ),
                    }}
                  />
                </Grid>
                
                <Grid item xs={12} md={6}>
                  <StyledInput
                    fullWidth
                    label="Percentage of Price"
                    name="percentageOfPrice"
                    value={service.percentageOfPrice}
                    onChange={handleInputChange}
                    placeholder="e.g. 10"
                    variant="outlined"
                    type="number"
                    InputProps={{
                      endAdornment: (
                        <InputAdornment position="end">
                          <span style={{ color: '#888' }}>%</span>
                        </InputAdornment>
                      ),
                    }}
                  />
                </Grid>
              </Grid>
            </Box>
            
            <Divider sx={{ my: 4 }} />
            
            <Box sx={{ mb: 4 }}>
              <SectionTitle>Service Details</SectionTitle>
              <Grid container spacing={3}>
                <Grid item xs={12}>
                  <StyledInput
                    fullWidth
                    label="Short Description"
                    name="shortDescription"
                    value={service.shortDescription}
                    onChange={handleInputChange}
                    multiline
                    rows={3}
                    error={!!errors.shortDescription}
                    helperText={errors.shortDescription || "Brief description of the service (max 255 characters)"}
                    required
                    variant="outlined"
                    placeholder="Brief overview of what this service offers..."
                    inputProps={{ maxLength: 255 }}
                  />
                </Grid>
                
                <Grid item xs={12}>
                  <Box sx={{ mb: 1 }}>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 1, fontWeight: 500 }}>
                      Full Description (Raw HTML)
                    </Typography>
                    <Textarea
                      name="description"
                      value={service.description}
                      onChange={handleInputChange}
                      placeholder="Enter HTML content for this service"
                      required
                      rows={8}
                      className="!border-t-blue-gray-200 focus:!border-t-gray-900"
                      labelProps={{
                        className: "before:content-none after:content-none",
                      }}
                    />
                    {errors.description && (
                      <FormHelperText error sx={{ mt: 1, fontSize: '0.9rem' }}>
                        {errors.description}
                      </FormHelperText>
                    )}
                    <FormHelperText sx={{ mt: 1, fontSize: '0.9rem', color: 'text.secondary' }}>
                      You can use HTML tags for formatting (e.g., <code>&lt;h2&gt;</code>, <code>&lt;p&gt;</code>, <code>&lt;a&gt;</code>, etc.)
                    </FormHelperText>
                  </Box>
                </Grid>
              </Grid>
            </Box>
            
            <Divider sx={{ my: 4 }} />
            
            <Box sx={{ mb: 4 }}>
              <SectionTitle>Service Image</SectionTitle>
              <Box sx={{ mt: 2, display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
                <input
                  accept="image/*"
                  id="service-image"
                  type="file"
                  onChange={handleImageChange}
                  style={{ display: 'none' }}
                />
                
                {!service.imagePreview ? (
                  <>
                    <UploadButton 
                      component="label" 
                      htmlFor="service-image"
                      startIcon={<UploadIcon />}
                    >
                      Upload Service Image
                    </UploadButton>
                    {errors.image && (
                      <FormHelperText error sx={{ mt: 1, fontSize: '0.9rem' }}>
                        {errors.image}
                      </FormHelperText>
                    )}
                  </>
                ) : (
                  <Box sx={{ mt: 2 }}>
                    <ImagePreviewContainer>
                      <Box sx={{ position: 'relative', width: '100%' }}>
                        <img 
                          src={service.imagePreview} 
                          alt="Service preview" 
                          style={{ 
                            width: '100%', 
                            height: 'auto',
                            borderRadius: 8,
                            objectFit: 'cover'
                          }} 
                        />
                        <Button 
                          size="small"
                          onClick={handleRemoveImage}
                          sx={{ 
                            position: 'absolute', 
                            top: 8, 
                            right: 8, 
                            minWidth: 'auto',
                            p: 1,
                            bgcolor: 'rgba(255,255,255,0.9)',
                            '&:hover': { bgcolor: 'rgba(255,255,255,1)' }
                          }}
                        >
                          <DeleteIcon />
                        </Button>
                      </Box>
                      <Button 
                        size="small" 
                        variant="outlined"
                        component="label" 
                        htmlFor="service-image"
                        sx={{ mt: 1, borderRadius: 2, textTransform: 'none' }}
                      >
                        Change Image
                      </Button>
                    </ImagePreviewContainer>
                  </Box>
                )}
              </Box>
            </Box>
            
            <Divider sx={{ my: 4 }} />
            
            <Box sx={{ mb: 4 }}>
              <SectionTitle>Service Options</SectionTitle>
              <Box sx={{ 
                display: 'flex', 
                gap: 3, 
                flexWrap: 'wrap',
                p: 2,
                borderRadius: 2,
                bgcolor: 'background.default'
              }}>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={service.isActive}
                      onChange={handleCheckboxChange}
                      name="isActive"
                      color="primary"
                      sx={{ '& .MuiSvgIcon-root': { fontSize: 28 } }}
                    />
                  }
                  label={
                    <Box>
                      <Typography fontWeight={500}>Active Service</Typography>
                      <Typography variant="caption" color="text.secondary">
                        Service will be visible to customers
                      </Typography>
                    </Box>
                  }
                  sx={{ mr: 4 }}
                />
                
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={service.isTopRated}
                      onChange={handleCheckboxChange}
                      name="isTopRated"
                      color="secondary"
                      sx={{ '& .MuiSvgIcon-root': { fontSize: 28 } }}
                    />
                  }
                  label={
                    <Box>
                      <Typography fontWeight={500}>Top Rated Service</Typography>
                      <Typography variant="caption" color="text.secondary">
                        Will be featured in top services section
                      </Typography>
                    </Box>
                  }
                />
              </Box>
            </Box>
            
            <Box mt={4} display="flex" justifyContent="space-between" alignItems="center">
              <ActionButton 
                variant="outlined" 
                onClick={() => navigate('/services')}
                color="inherit"
              >
                Cancel
              </ActionButton>
              <ActionButton 
                type="submit" 
                variant="contained" 
                color="primary"
                disabled={loading}
              >
                {loading ? 'Saving...' : (isEditMode ? 'Update Service' : 'Create Service')}
              </ActionButton>
            </Box>
          </Box>
        </CardContent>
      </StyledCard>
    </Container>
  );
};

export default EditService;

