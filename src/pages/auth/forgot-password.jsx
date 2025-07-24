import {
  Card,
  Input,
  Button,
  Typography,
} from "@material-tailwind/react";
import { Link, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { authService } from "../../services/apiService";
import { Eye, EyeOff, ArrowLeft, Phone, Lock, Shield } from "lucide-react";

export function ForgotPassword() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1); // Step 1: Request OTP, Step 2: Reset Password
  const [formData, setFormData] = useState({
    phone: '',
    otp: '',
    password: '',
    password_confirmation: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [otpTimer, setOtpTimer] = useState(0);
  const [canResendOtp, setCanResendOtp] = useState(true);

  // Timer effect for OTP resend
  useEffect(() => {
    let interval;
    if (otpTimer > 0) {
      interval = setInterval(() => {
        setOtpTimer(prev => prev - 1);
      }, 1000);
    } else {
      setCanResendOtp(true);
    }
    return () => clearInterval(interval);
  }, [otpTimer]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    // Special handling for OTP - only allow numbers and limit to 6 digits
    if (name === 'otp') {
      const numericValue = value.replace(/\D/g, '').slice(0, 6);
      setFormData({ ...formData, [name]: numericValue });
    } else if (name === 'phone') {
      // Only allow numbers for phone and limit to 10 digits
      const numericValue = value.replace(/\D/g, '').slice(0, 10);
      setFormData({ ...formData, [name]: numericValue });
    } else {
      setFormData({ ...formData, [name]: value });
    }
    
    // Clear error when user starts typing
    if (error) setError('');
  };

  const handleRequestOTP = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    // Validate phone number
    if (!formData.phone || formData.phone.length !== 10) {
      setError('Please enter a valid 10-digit phone number');
      setLoading(false);
      return;
    }

    try {
      const response = await authService.requestOTP(formData.phone);
      
      if (response.success) {
        setStep(2);
        setOtpTimer(60); // 1 minute timer
        setCanResendOtp(false);
      } else {
        throw new Error(response.message || 'Failed to send OTP');
      }
    } catch (err) {
      setError(err.message || 'Failed to send OTP. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleResendOTP = async () => {
    if (!canResendOtp) return;
    
    setError('');
    setLoading(true);

    try {
      const response = await authService.requestOTP(formData.phone);
      
      if (response.success) {
        setOtpTimer(60); // Reset timer
        setCanResendOtp(false);
        // Clear any existing error
        setError('');
      } else {
        throw new Error(response.message || 'Failed to resend OTP');
      }
    } catch (err) {
      setError(err.message || 'Failed to resend OTP. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    // Validate inputs
    if (!formData.otp || formData.otp.length !== 6) {
      setError('Please enter a valid 6-digit OTP');
      setLoading(false);
      return;
    }

    if (!formData.password || formData.password.length < 6) {
      setError('Password must be at least 6 characters long');
      setLoading(false);
      return;
    }

    if (formData.password !== formData.password_confirmation) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }

    try {
      const resetData = {
        phone: formData.phone,
        otp: formData.otp,
        password: formData.password,
        password_confirmation: formData.password_confirmation
      };

      const response = await authService.resetPasswordWithOTP(resetData);
      
      if (response.success) {
        // Navigate to sign-in with success message
        navigate('/auth/sign-in', {
          state: {
            message: 'Password reset successfully! Please sign in with your new password.',
            type: 'success'
          }
        });
      } else {
        throw new Error(response.message || 'Failed to reset password');
      }
    } catch (err) {
      console.error('Password reset error:', err);
      
      // Handle validation errors specifically
      if (err.error && typeof err.error === 'object') {
        const validationErrors = err.error;
        const errorMessages = [];
        
        Object.keys(validationErrors).forEach(field => {
          if (Array.isArray(validationErrors[field])) {
            validationErrors[field].forEach(message => {
              errorMessages.push(`${field.charAt(0).toUpperCase() + field.slice(1)}: ${message}`);
            });
          }
        });
        
        setError(errorMessages.join('\n') || 'Validation failed');
      } else {
        setError(err.message || 'Failed to reset password. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleBackToStep1 = () => {
    setStep(1);
    setFormData({
      ...formData,
      otp: '',
      password: '',
      password_confirmation: ''
    });
    setError('');
  };

  return (
    <div className="min-h-screen bg-blue-gray-50/50 flex justify-center items-center px-4">
      <Card className="w-full max-w-[500px] p-6 shadow-xl">
        <div className="flex justify-center mb-6">
          <img src="/img/logo-ct-dark.png" alt="Logo" className="h-12" />
        </div>
        
        <div className="text-center mb-8">
          <Typography variant="h3" color="blue-gray" className="font-bold">
            {step === 1 ? 'Forgot Password' : 'Reset Password'}
          </Typography>
          <Typography variant="paragraph" color="blue-gray" className="text-blue-gray-500 mt-1">
            {step === 1 
              ? 'Enter your phone number to receive an OTP' 
              : 'Enter the OTP and your new password'
            }
          </Typography>
        </div>
        
        {error && (
          <div className="bg-red-50 text-red-500 p-3 rounded-lg mb-4 text-center">
            <Typography variant="small">{error}</Typography>
          </div>
        )}

        {step === 1 ? (
          // Step 1: Request OTP
          <form onSubmit={handleRequestOTP} className="mb-2">
            <div className="mb-6">
              <Typography variant="small" color="blue-gray" className="mb-2 font-semibold">
                Phone Number
              </Typography>
              <div className="relative">
                <Input
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  size="lg"
                  placeholder="98......."
                  className="!border-blue-gray-200 focus:!border-blue-500 pl-10"
                  labelProps={{
                    className: "before:content-none after:content-none",
                  }}
                  type="tel"
                  maxLength={10}
                  inputMode="numeric"
                />
                <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-blue-gray-400" />
              </div>
              <Typography variant="small" color="blue-gray" className="mt-1 text-blue-gray-500">
                We'll send a 6-digit verification code to this number
              </Typography>
            </div>
            
            <Button 
              type="submit" 
              fullWidth 
              disabled={loading || !formData.phone || formData.phone.length !== 10}
              className="bg-blue-500 hover:bg-blue-600 shadow-md mb-4"
              size="lg"
            >
              {loading ? (
                <div className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Sending OTP...
                </div>
              ) : (
                <>
                  <Shield className="w-4 h-4 mr-2" />
                  Send OTP
                </>
              )}
            </Button>
          </form>
        ) : (
          // Step 2: Reset Password
          <form onSubmit={handleResetPassword} className="mb-2">
            <div className="mb-6 space-y-6">
              {/* OTP Input */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <Typography variant="small" color="blue-gray" className="font-semibold">
                    Verification Code
                  </Typography>
                  {otpTimer > 0 ? (
                    <Typography variant="small" color="blue-gray" className="text-blue-gray-500">
                      Resend in {otpTimer}s
                    </Typography>
                  ) : (
                    <button
                      type="button"
                      onClick={handleResendOTP}
                      disabled={loading}
                      className="text-blue-500 hover:text-blue-700 text-sm font-medium transition-colors"
                    >
                      Resend OTP
                    </button>
                  )}
                </div>
                <Input
                  name="otp"
                  value={formData.otp}
                  onChange={handleChange}
                  size="lg"
                  placeholder="000000"
                  className="!border-blue-gray-200 focus:!border-blue-500 text-center tracking-widest"
                  labelProps={{
                    className: "before:content-none after:content-none",
                  }}
                  maxLength={6}
                  inputMode="numeric"
                />
                <Typography variant="small" color="blue-gray" className="mt-1 text-blue-gray-500">
                  Enter the 6-digit code sent to {formData.phone}
                </Typography>
              </div>

              {/* New Password */}
              <div>
                <Typography variant="small" color="blue-gray" className="mb-2 font-semibold">
                  New Password
                </Typography>
                <div className="relative">
                  <Input
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    value={formData.password}
                    onChange={handleChange}
                    size="lg"
                    placeholder="********"
                    className="!border-blue-gray-200 focus:!border-blue-500 pl-10 pr-10"
                    labelProps={{
                      className: "before:content-none after:content-none",
                    }}
                  />
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-blue-gray-400" />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-blue-gray-400 hover:text-blue-gray-600"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                <Typography variant="small" color="blue-gray" className="mt-1 text-blue-gray-500">
                  Password must be at least 6 characters long
                </Typography>
              </div>

              {/* Confirm Password */}
              <div>
                <Typography variant="small" color="blue-gray" className="mb-2 font-semibold">
                  Confirm New Password
                </Typography>
                <div className="relative">
                  <Input
                    name="password_confirmation"
                    type={showConfirmPassword ? 'text' : 'password'}
                    value={formData.password_confirmation}
                    onChange={handleChange}
                    size="lg"
                    placeholder="********"
                    className="!border-blue-gray-200 focus:!border-blue-500 pl-10 pr-10"
                    labelProps={{
                      className: "before:content-none after:content-none",
                    }}
                  />
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-blue-gray-400" />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-blue-gray-400 hover:text-blue-gray-600"
                  >
                    {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            </div>
            
            <div className="flex space-x-3 mb-4">
              <Button
                type="button"
                onClick={handleBackToStep1}
                variant="outlined"
                className="border-blue-gray-200 text-blue-gray-700 hover:bg-blue-gray-50"
                size="lg"
                fullWidth
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back
              </Button>
              
              <Button 
                type="submit" 
                fullWidth 
                disabled={loading || !formData.otp || formData.otp.length !== 6 || !formData.password || !formData.password_confirmation}
                className="bg-blue-500 hover:bg-blue-600 shadow-md"
                size="lg"
              >
                {loading ? (
                  <div className="flex items-center justify-center">
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Resetting Password...
                  </div>
                ) : (
                  <>
                    <Lock className="w-4 h-4 mr-2" />
                    Reset Password
                  </>
                )}
              </Button>
            </div>
          </form>
        )}

        <div className="text-center">
          <Typography variant="small" color="blue-gray" className="font-medium">
            Remember your password?{" "}
            <Link to="/auth/sign-in" className="text-blue-500 hover:text-blue-700 transition-colors">
              Sign In
            </Link>
          </Typography>
        </div>
      </Card>
    </div>
  );
}

export default ForgotPassword; 