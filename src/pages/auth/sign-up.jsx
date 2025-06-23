import {
  Card,
  Input,
  Checkbox,
  Button,
  Typography,
} from "@material-tailwind/react";
import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import { authService } from "../../services/apiService";
import { Eye, EyeOff, User, Phone, Lock, CheckCircle } from 'lucide-react';

export function SignUp() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    password: '',
    password_confirmation: '',
    role: 'user'
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [validationErrors, setValidationErrors] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
    
    // Clear validation error for this field when user starts typing
    if (validationErrors[name]) {
      setValidationErrors({
        ...validationErrors,
        [name]: ''
      });
    }
  };

  const validateForm = () => {
    const errors = {};
    
    if (!formData.name.trim()) {
      errors.name = 'Full name is required';
    } else if (formData.name.trim().length < 2) {
      errors.name = 'Name must be at least 2 characters';
    }
    
    if (!formData.phone.trim()) {
      errors.phone = 'Phone number is required';
    } else if (!/^[0-9]{10}$/.test(formData.phone)) {
      errors.phone = 'Phone number must be exactly 10 digits';
    }
    
    if (!formData.password) {
      errors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      errors.password = 'Password must be at least 6 characters';
    }
    
    if (!formData.password_confirmation) {
      errors.password_confirmation = 'Please confirm your password';
    } else if (formData.password !== formData.password_confirmation) {
      errors.password_confirmation = 'Passwords do not match';
    }
    
    if (!acceptedTerms) {
      errors.terms = 'You must accept the Terms and Conditions';
    }
    
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    if (!validateForm()) {
      return;
    }
    
    setLoading(true);
    
    try {
      const response = await authService.register(formData);
      
      if (response.success) {
        // Clear the token since we want user to login again
        localStorage.removeItem('token');
        
        // Registration successful, redirect to login with success message
        navigate('/auth/sign-in', { 
          replace: true,
          state: { 
            message: 'Registration successful! Please sign in with your credentials.',
            type: 'success'
          }
        });
      } else {
        setError(response.message || 'Registration failed');
      }
    } catch (err) {
      if (err.response && err.response.data) {
        const responseData = err.response.data;
        if (responseData.errors) {
          // Handle validation errors from backend
          setValidationErrors(responseData.errors);
        } else {
          setError(responseData.message || 'Registration failed');
        }
      } else {
        setError(err.message || 'Registration failed');
      }
    } finally {
      setLoading(false);
    }
  };

  const getPasswordStrength = (password) => {
    if (!password) return { strength: 0, text: '', color: 'gray' };
    
    let strength = 0;
    if (password.length >= 6) strength++;
    if (password.length >= 8) strength++;
    if (/[A-Z]/.test(password)) strength++;
    if (/[a-z]/.test(password)) strength++;
    if (/[0-9]/.test(password)) strength++;
    if (/[^A-Za-z0-9]/.test(password)) strength++;
    
    if (strength <= 2) return { strength: 1, text: 'Weak', color: 'red' };
    if (strength <= 4) return { strength: 2, text: 'Medium', color: 'yellow' };
    return { strength: 3, text: 'Strong', color: 'green' };
  };

  const passwordStrength = getPasswordStrength(formData.password);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white flex justify-center items-center px-4">
      <Card className="w-full max-w-[500px] p-8 shadow-xl">
        <div className="flex justify-center mb-6">
          <img src="/img/logo-ct-dark.png" alt="Logo" className="h-12" />
        </div>
        
        <div className="text-center mb-8">
          <Typography variant="h3" color="blue-gray" className="font-bold">
            Create Account
          </Typography>
          <Typography variant="paragraph" color="blue-gray" className="text-blue-gray-500 mt-1">
            Join us to access professional notarization services
          </Typography>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="bg-red-50 text-red-500 p-3 rounded-lg text-center">
              <Typography variant="small">{error}</Typography>
            </div>
          )}
          
          {/* Full Name Field */}
          <div>
            <Typography variant="small" color="blue-gray" className="mb-2 font-semibold">
              Full Name
            </Typography>
            <div className="relative">
              <Input
                name="name"
                value={formData.name}
                onChange={handleChange}
                size="lg"
                placeholder="Enter your full name"
                className={`!border-blue-gray-200 focus:!border-blue-500 ${
                  validationErrors.name ? '!border-red-500' : ''
                }`}
                labelProps={{
                  className: "before:content-none after:content-none",
                }}
                icon={<User className="w-4 h-4 text-blue-gray-400" />}
              />
            </div>
            {validationErrors.name && (
              <Typography variant="small" color="red" className="mt-1">
                {validationErrors.name}
              </Typography>
            )}
          </div>

          {/* Phone Number Field */}
          <div>
            <Typography variant="small" color="blue-gray" className="mb-2 font-semibold">
              Phone Number
            </Typography>
            <div className="relative">
              <Input
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                size="lg"
                placeholder="98XXXXXXXX"
                className={`!border-blue-gray-200 focus:!border-blue-500 ${
                  validationErrors.phone ? '!border-red-500' : ''
                }`}
                labelProps={{
                  className: "before:content-none after:content-none",
                }}
                type="tel"
                pattern="[0-9]{10}"
                maxLength={10}
                inputMode="numeric"
                icon={<Phone className="w-4 h-4 text-blue-gray-400" />}
              />
            </div>
            {validationErrors.phone && (
              <Typography variant="small" color="red" className="mt-1">
                {validationErrors.phone}
              </Typography>
            )}
          </div>

          {/* Password Field */}
          <div>
            <Typography variant="small" color="blue-gray" className="mb-2 font-semibold">
              Password
            </Typography>
            <div className="relative">
              <Input
                name="password"
                type={showPassword ? "text" : "password"}
                value={formData.password}
                onChange={handleChange}
                size="lg"
                placeholder="Create a strong password"
                className={`!border-blue-gray-200 focus:!border-blue-500 ${
                  validationErrors.password ? '!border-red-500' : ''
                }`}
                labelProps={{
                  className: "before:content-none after:content-none",
                }}
                icon={
                  <div className="flex items-center space-x-2">
                    <Lock className="w-4 h-4 text-blue-gray-400" />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="text-blue-gray-400 hover:text-blue-gray-600"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                }
              />
            </div>
            
            {/* Password Strength Indicator */}
            {formData.password && (
              <div className="mt-2">
                <div className="flex items-center space-x-2">
                  <div className="flex-1 bg-gray-200 rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full transition-all duration-300 ${
                        passwordStrength.color === 'red' ? 'bg-red-500' :
                        passwordStrength.color === 'yellow' ? 'bg-yellow-500' : 'bg-green-500'
                      }`}
                      style={{ width: `${(passwordStrength.strength / 3) * 100}%` }}
                    ></div>
                  </div>
                  <Typography 
                    variant="small" 
                    className={`font-medium ${
                      passwordStrength.color === 'red' ? 'text-red-500' :
                      passwordStrength.color === 'yellow' ? 'text-yellow-600' : 'text-green-500'
                    }`}
                  >
                    {passwordStrength.text}
                  </Typography>
                </div>
              </div>
            )}
            
            {validationErrors.password && (
              <Typography variant="small" color="red" className="mt-1">
                {validationErrors.password}
              </Typography>
            )}
          </div>

          {/* Confirm Password Field */}
          <div>
            <Typography variant="small" color="blue-gray" className="mb-2 font-semibold">
              Confirm Password
            </Typography>
            <div className="relative">
              <Input
                name="password_confirmation"
                type={showConfirmPassword ? "text" : "password"}
                value={formData.password_confirmation}
                onChange={handleChange}
                size="lg"
                placeholder="Confirm your password"
                className={`!border-blue-gray-200 focus:!border-blue-500 ${
                  validationErrors.password_confirmation ? '!border-red-500' : ''
                }`}
                labelProps={{
                  className: "before:content-none after:content-none",
                }}
                icon={
                  <div className="flex items-center space-x-2">
                    <Lock className="w-4 h-4 text-blue-gray-400" />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="text-blue-gray-400 hover:text-blue-gray-600"
                    >
                      {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                }
              />
            </div>
            
            {/* Password Match Indicator */}
            {formData.password_confirmation && (
              <div className="mt-2 flex items-center space-x-2">
                {formData.password === formData.password_confirmation ? (
                  <>
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <Typography variant="small" color="green">
                      Passwords match
                    </Typography>
                  </>
                ) : (
                  <Typography variant="small" color="red">
                    Passwords do not match
                  </Typography>
                )}
              </div>
            )}
            
            {validationErrors.password_confirmation && (
              <Typography variant="small" color="red" className="mt-1">
                {validationErrors.password_confirmation}
              </Typography>
            )}
          </div>

          {/* Terms and Conditions */}
          <div>
            <div className="flex items-start space-x-2">
              <Checkbox
                color="blue"
                className="rounded-sm"
                checked={acceptedTerms}
                onChange={(e) => setAcceptedTerms(e.target.checked)}
                containerProps={{ className: "mt-1" }}
              />
              <Typography variant="small" color="blue-gray" className="leading-relaxed">
                I agree to the{" "}
                <Link to="/terms" className="font-medium text-blue-500 hover:text-blue-700 underline">
                  Terms and Conditions
                </Link>{" "}
                and{" "}
                <Link to="/privacy" className="font-medium text-blue-500 hover:text-blue-700 underline">
                  Privacy Policy
                </Link>
              </Typography>
            </div>
            {validationErrors.terms && (
              <Typography variant="small" color="red" className="mt-1">
                {validationErrors.terms}
              </Typography>
            )}
          </div>
          
          <Button 
            type="submit" 
            fullWidth 
            disabled={loading}
            className="bg-blue-500 hover:bg-blue-600 shadow-md"
            size="lg"
          >
            {loading ? (
              <div className="flex items-center justify-center">
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Creating Account...
              </div>
            ) : "Create Account"}
          </Button>

          <div className="relative flex items-center justify-center gap-2 my-6">
            <div className="h-px w-full bg-blue-gray-200"></div>
            <Typography variant="small" color="blue-gray" className="font-medium px-2">
              OR
            </Typography>
            <div className="h-px w-full bg-blue-gray-200"></div>
          </div>
          
          <div className="space-y-3">
            <Button 
              size="lg" 
              variant="outlined" 
              color="blue-gray" 
              className="flex items-center gap-2 justify-center shadow-sm"
              fullWidth
              type="button"
            >
              <svg width="17" height="16" viewBox="0 0 17 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                <g clipPath="url(#clip0_1156_824)">
                  <path d="M16.3442 8.18429C16.3442 7.64047 16.3001 7.09371 16.206 6.55872H8.66016V9.63937H12.9813C12.802 10.6329 12.2258 11.5119 11.3822 12.0704V14.0693H13.9602C15.4741 12.6759 16.3442 10.6182 16.3442 8.18429Z" fill="#4285F4" />
                  <path d="M8.65974 16.0006C10.8174 16.0006 12.637 15.2922 13.9627 14.0693L11.3847 12.0704C10.6675 12.5584 9.7415 12.8347 8.66268 12.8347C6.5756 12.8347 4.80598 11.4266 4.17104 9.53357H1.51074V11.5942C2.86882 14.2956 5.63494 16.0006 8.65974 16.0006Z" fill="#34A853" />
                  <path d="M4.16852 9.53356C3.83341 8.53999 3.83341 7.46411 4.16852 6.47054V4.40991H1.51116C0.376489 6.67043 0.376489 9.33367 1.51116 11.5942L4.16852 9.53356Z" fill="#FBBC04" />
                  <path d="M8.65974 3.16644C9.80029 3.1488 10.9026 3.57798 11.7286 4.36578L14.0127 2.08174C12.5664 0.72367 10.6469 -0.0229773 8.65974 0.000539111C5.63494 0.000539111 2.86882 1.70548 1.51074 4.40987L4.1681 6.4705C4.8001 4.57449 6.57266 3.16644 8.65974 3.16644Z" fill="#EA4335" />
                </g>
                <defs>
                  <clipPath id="clip0_1156_824">
                    <rect width="16" height="16" fill="white" transform="translate(0.5)" />
                  </clipPath>
                </defs>
              </svg>
              <span>Continue with Google</span>
            </Button>
          </div>
          
          <Typography variant="small" className="text-center text-blue-gray-500 font-medium mt-6">
            Already have an account?
            <Link to="/auth/sign-in" className="text-blue-500 ml-1 font-semibold hover:text-blue-700 transition-colors">
              Sign in
            </Link>
          </Typography>
          
          <Typography variant="small" className="text-center text-blue-gray-500 font-medium mt-2">
            <Link to="/home" replace className="text-blue-500 hover:text-blue-700 transition-colors">
              Continue as Guest
            </Link>
          </Typography>
        </form>
      </Card>
    </div>
  );
}

export default SignUp;
