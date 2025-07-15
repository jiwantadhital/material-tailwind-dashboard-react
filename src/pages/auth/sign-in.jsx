import {
  Card,
  Input,
  Checkbox,
  Button,
  Typography,
} from "@material-tailwind/react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";
import { authService } from "../../services/apiService";
import { toast } from "react-toastify";
import { Shield, ArrowLeft } from 'lucide-react';


export function SignIn() {
  const navigate = useNavigate();
  const location = useLocation();
  const [currentStep, setCurrentStep] = useState('signin'); // 'signin' or 'verify-phone'
  const [formData, setFormData] = useState({
    phone: '',
    password: '',
  });
  const [verificationData, setVerificationData] = useState({
    otp: '',
    phone: '',
    token: '',
    role: '',
    resendLoading: false
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  // Check for success message from registration
  useEffect(() => {
    if (location.state?.message && location.state?.type === 'success') {
      setSuccessMessage(location.state.message);
      // Clear the message from location state to prevent it from showing again on refresh
      window.history.replaceState({}, document.title);
      
      // Auto-hide success message after 10 seconds
      const timer = setTimeout(() => {
        setSuccessMessage('');
      }, 10000);
      
      return () => clearTimeout(timer);
    }
  }, [location.state]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  // OTP verification handlers
  const handleOtpSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    if (!verificationData.otp || verificationData.otp.length !== 6) {
      setError('Please enter a valid 6-digit OTP');
      return;
    }
    
    setLoading(true);
    
    try {
      const response = await authService.verifyPhoneNumber(verificationData.phone, verificationData.otp);
      
      if (response.success) {
        // Phone verified successfully, now complete the login process
        try {
          await authService.completeLoginAfterVerification(verificationData.token);
          
          // Redirect based on role
          if (verificationData.role !== "user") {
            navigate('/dashboard/home', { replace: true });
          } else {
            navigate('/home', { replace: true });
          }
        } catch (loginError) {
          console.error('Failed to complete login:', loginError);
          setError('Verification successful but failed to complete login. Please try signing in again.');
        }
      } else {
        setError(response.message || 'OTP verification failed');
      }
    } catch (err) {
      if (err.response && err.response.data) {
        setError(err.response.data.message || 'OTP verification failed');
      } else {
        setError(err.message || 'OTP verification failed');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleResendOtp = async () => {
    setVerificationData(prev => ({ ...prev, resendLoading: true }));
    setError('');
    
    try {
      const response = await authService.resendPhoneOtp(verificationData.phone);
      
      if (response.success) {
        setError('');
        setSuccessMessage('OTP resent successfully!');
        setTimeout(() => {
          setSuccessMessage('');
        }, 3000);
      } else {
        setError(response.message || 'Failed to resend OTP');
      }
    } catch (err) {
      if (err.response && err.response.data) {
        setError(err.response.data.message || 'Failed to resend OTP');
      } else {
        setError(err.message || 'Failed to resend OTP');
      }
    } finally {
      setVerificationData(prev => ({ ...prev, resendLoading: false }));
    }
  };

  const handleOtpChange = (e) => {
    const value = e.target.value.replace(/\D/g, ''); // Only allow digits
    if (value.length <= 6) {
      setVerificationData(prev => ({ ...prev, otp: value }));
    }
  };

  const handleBackToSignIn = () => {
    setCurrentStep('signin');
    setVerificationData({
      otp: '',
      phone: '',
      token: '',
      role: '',
      resendLoading: false
    });
    setError('');
    setSuccessMessage('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    const fcmToken = localStorage.getItem('fcm_token');
    if (fcmToken) {
      console.log("FCM Token:", fcmToken);
    } else {
      console.error("Failed to request notification permission");
    }
    
    try {
      const response = await authService.signIn(formData.phone, formData.password, fcmToken??'web');
      
      // Check if phone is verified
      if (response.phone_verified === 0) {
        // Phone not verified, switch to verification step
        setVerificationData({
          otp: '',
          phone: formData.phone,
          token: response.token,
          role: response.role,
          resendLoading: false
        });
        setCurrentStep('verify-phone');
        setError('');
        
        // Automatically send OTP
        try {
          await authService.resendPhoneOtp(formData.phone);
        } catch (err) {
          console.error('Failed to send initial OTP:', err);
        }
        return;
      }
      
      // Phone is verified, proceed with normal login flow
      // The signIn method has already stored all necessary datachange
      if(response.role !== "user"){
        navigate('/dashboard/home', { replace: true });
      }
      else{
        navigate('/home', { replace: true });
      }
    } catch (err) {
      setError(err.message || 'Failed to sign in');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-blue-gray-50/50 flex justify-center items-center px-4">
      <Card className="w-full max-w-[500px] p-6 shadow-xl">
        <div className="flex justify-center mb-6">
          <img src="/img/nlogo.png" alt="Logo" className="h-16" />
        </div>
        
        {currentStep === 'signin' ? (
          <div className="text-center mb-8">
            <Typography variant="h3" color="blue-gray" className="font-bold">
              Welcome Back
            </Typography>
            <Typography variant="paragraph" color="blue-gray" className="text-blue-gray-500 mt-1">
              Sign in to your Sajilonotary account
            </Typography>
          </div>
        ) : (
          <div className="text-center mb-8">
            <div className="flex items-center justify-center mb-4">
              <div className="p-3 bg-blue-500 rounded-full">
                <Shield className="w-6 h-6 text-white" />
              </div>
            </div>
            <Typography variant="h3" color="blue-gray" className="font-bold">
              Verify Your Phone
            </Typography>
            <Typography variant="paragraph" color="blue-gray" className="text-blue-gray-500 mt-1">
              Please verify your phone number to complete login
            </Typography>
            <Typography variant="small" color="blue-gray" className="text-blue-gray-600 mt-2">
              Code sent to: {verificationData.phone}
            </Typography>
          </div>
        )}
        
        {currentStep === 'signin' ? (
          <form onSubmit={handleSubmit} className="mb-2">
          {successMessage && (
            <div className="bg-green-50 text-green-600 p-3 rounded-lg mb-4 text-center border border-green-200 relative">
              <div className="flex items-center justify-center">
                <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <Typography variant="small" className="font-medium">{successMessage}</Typography>
              </div>
              <button
                onClick={() => setSuccessMessage('')}
                className="absolute top-2 right-2 text-green-500 hover:text-green-700 transition-colors"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          )}
          
          {error && (
            <div className="bg-red-50 text-red-500 p-3 rounded-lg mb-4 text-center">
              <Typography variant="small">{error}</Typography>
            </div>
          )}
          
          <div className="mb-6 space-y-6">
            <div>
              <Typography variant="small" color="blue-gray" className="mb-2 font-semibold">
                Phone Number
              </Typography>
              <Input
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                size="lg"
                placeholder="98......."
                className="!border-blue-gray-200 focus:!border-blue-500"
                labelProps={{
                  className: "before:content-none after:content-none",
                }}
                type="tel"
                pattern="[0-9]{10}"
                maxLength={10}
                inputMode="numeric"
                icon={<i className="fas fa-phone text-blue-gray-300" />}
              />
            </div>
            
            <div>
              <div className="flex items-center justify-between mb-2">
                <Typography variant="small" color="blue-gray" className="font-semibold">
                  Password
                </Typography>
                <Typography variant="small" className="font-medium text-blue-500 hover:text-blue-700 transition-colors">
                  <Link to="/auth/forgot-password">
                    Forgot Password?
                  </Link>
                </Typography>
              </div>
              <Input
                name="password"
                type="password"
                value={formData.password}
                onChange={handleChange}
                size="lg"
                placeholder="********"
                className="!border-blue-gray-200 focus:!border-blue-500"
                labelProps={{
                  className: "before:content-none after:content-none",
                }}
                icon={<i className="fas fa-lock text-blue-gray-300" />}
              />
            </div>
          </div>
          
          <div className="flex items-center mb-6">
            <Checkbox
              color="blue"
              className="rounded-sm"
              containerProps={{ className: "mr-2" }}
            />
            <Typography variant="small" color="blue-gray">
              Remember me
            </Typography>
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
                Signing in...
              </div>
            ) : "Sign In"}
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
              <span>Sign in with Google</span>
            </Button>
          </div>
          
          <Typography variant="small" className="text-center text-blue-gray-500 font-medium mt-6">
            Don't have an account?
            <Link to="/auth/sign-up" className="text-blue-500 ml-1 font-semibold hover:text-blue-700 transition-colors">
              Sign up
            </Link>
          </Typography>
          
          <Typography variant="small" className="text-center text-blue-gray-500 font-medium mt-2">
            <Link to="/home" replace className="text-blue-500 hover:text-blue-700 transition-colors">
              Skip to Homepage
            </Link>
          </Typography>
        </form>
        ) : (
          <form onSubmit={handleOtpSubmit} className="space-y-6">
            {successMessage && (
              <div className="bg-green-50 text-green-600 p-3 rounded-lg text-center border border-green-200">
                <Typography variant="small" className="font-medium">{successMessage}</Typography>
              </div>
            )}
            
            {error && (
              <div className="bg-red-50 text-red-500 p-3 rounded-lg text-center">
                <Typography variant="small">{error}</Typography>
              </div>
            )}
            
            <div>
              <Typography variant="small" color="blue-gray" className="mb-2 font-semibold text-center">
                Enter Verification Code
              </Typography>
              <div className="relative">
                <Input
                  value={verificationData.otp}
                  onChange={handleOtpChange}
                  size="lg"
                  placeholder="000000"
                  className="!border-blue-gray-200 focus:!border-blue-500 text-center text-2xl tracking-widest"
                  labelProps={{
                    className: "before:content-none after:content-none",
                  }}
                  type="tel"
                  maxLength={6}
                  inputMode="numeric"
                />
              </div>
              <Typography variant="small" color="blue-gray" className="mt-2 text-center">
                Enter the 6-digit code sent to your phone
              </Typography>
            </div>
            
            <Button 
              type="submit" 
              fullWidth 
              disabled={loading || verificationData.otp.length !== 6}
              className="bg-blue-500 hover:bg-blue-600 shadow-md"
              size="lg"
            >
              {loading ? (
                <div className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Verifying...
                </div>
              ) : "Verify Phone Number"}
            </Button>
            
            <div className="text-center space-y-3">
              <Typography variant="small" color="blue-gray">
                Didn't receive the code?
              </Typography>
              <Button 
                variant="text" 
                color="blue" 
                size="sm"
                disabled={verificationData.resendLoading}
                onClick={handleResendOtp}
                className="font-semibold"
              >
                {verificationData.resendLoading ? 'Sending...' : 'Resend Code'}
              </Button>
            </div>
            
            <Button 
              variant="text" 
              color="blue-gray" 
              size="sm"
              onClick={handleBackToSignIn}
              className="w-full flex items-center justify-center gap-2 mt-4"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Sign In
            </Button>
          </form>
        )}
      </Card>
    </div>
  );
}

export default SignIn;
