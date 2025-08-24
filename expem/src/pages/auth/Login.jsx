import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/UseAuth'; // Fixed: lowercase 'useAuth'

const Login = () => {
  const [form, setForm] = useState({
    identifier: '', // Can be username or email
    password: ''
  });

  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [message, setMessage] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Use authentication context and React Router navigation
  const { login, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  // Backend API URL - Fixed: removed escapes
  const API_BASE_URL = 'http://localhost:8000/api';

  // Check if user is already logged in
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/transact', { replace: true });
      return;
    }

    const token = localStorage.getItem('authToken');
    if (token) {
      verifyToken(token);
    }
  }, [isAuthenticated, navigate]);

  const verifyToken = async (token) => {
    try {
      const response = await fetch(`${API_BASE_URL}/v1/users`, { // Fixed: template literal
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        login(token);
        navigate('/transact', { replace: true });
      } else {
        localStorage.removeItem('authToken');
        localStorage.removeItem('userInfo');
      }
    } catch (error) {
      localStorage.removeItem('authToken');
      localStorage.removeItem('userInfo');
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({
      ...form,
      [name]: value,
    });

    // Clear errors when user starts typing
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: ''
      });
    }

    // Clear general message
    if (message) {
      setMessage('');
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!form.identifier.trim()) {
      newErrors.identifier = 'Username or email is required';
    } else if (form.identifier.trim().length < 3) {
      newErrors.identifier = 'Username or email must be at least 3 characters';
    }

    if (!form.password) {
      newErrors.password = 'Password is required';
    } else if (form.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const isEmail = (str) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(str); // Fixed: removed escapes
  };

  // Helper function to extract token from different response formats
  const extractToken = (responseData) => {
    const possibleTokenPaths = [

      responseData.data?.accessToken,
     
      responseData.accessToken,
      
    ];

    return possibleTokenPaths.find(token => token && typeof token === 'string');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');

    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      console.log('Attempting login with URL:', `${API_BASE_URL}/v1/users/login`);
      
      // Prepare login data
      const loginData = {
        password: form.password
      };

      if (isEmail(form.identifier)) {
        loginData.email = form.identifier;
      } else {
        loginData.username = form.identifier;
      }

      console.log('Login data:', { ...loginData, password: '[HIDDEN]' });

      // Make API call
      const response = await fetch(`${API_BASE_URL}/v1/users/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(loginData),
      });

      // Check if response is JSON
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        const textResponse = await response.text();
        console.error('Non-JSON response:', textResponse);
        throw new Error(`Server returned ${response.status}: ${response.statusText}. Expected JSON but got HTML.`);
      }

      const data = await response.json();

      // Debug: Log the complete response structure
      console.log('=== COMPLETE API RESPONSE ===');
      console.log('Response status:', response.status);
      console.log('Response data:', JSON.stringify(data, null, 2));
      console.log('===============================');

      // Handle successful response
      if (response.ok && data.success) {
        console.log('Login request successful');
        
        // Extract token using helper function
        const token = extractToken(data);
        console.log('Extracted token:', token ? 'present' : 'missing');

        if (token) {
          // Store authentication data
          localStorage.setItem('authToken', token);
          login(token);
          
          // Store user info if available
          const user = data.data?.user || data.user;
          if (user) {
            localStorage.setItem('userInfo', JSON.stringify(user));
          }

          // Clear form
          setForm({
            identifier: '',
            password: ''
          });

          console.log('Authentication successful, navigating to /transact');
          setMessage('Login successful! Redirecting...');
          
          // Single navigation call
          navigate('/transact', { replace: true });

        } else {
          console.error('No token found in successful response');
          setMessage('Login successful but no authentication token received. Please contact support.');
        }

      } else {
        // Handle login failure
        console.log('Login failed with status:', response.status);
        const errorMessage = data.message || 'Login failed';
        
        if (response.status === 401) {
          setMessage('Invalid credentials. Please check your username/email and password.');
        } else if (response.status === 400) {
          if (data.errors && Array.isArray(data.errors)) {
            setMessage(data.errors.join(', '));
          } else {
            setMessage(errorMessage);
          }
        } else if (response.status === 429) {
          setMessage('Too many login attempts. Please try again later.');
        } else if (response.status === 500) {
          setMessage('Server error. Please try again later.');
        } else {
          setMessage(errorMessage);
        }
        
        console.error('Login failed:', {
          status: response.status,
          message: data.message,
          errors: data.errors,
          success: data.success
        });
      }

    } catch (error) {
      console.error('Login error:', error);
      setMessage('Network error. Please check your connection and try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = () => {
    navigate('/forgot-password');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="bg-white shadow-2xl rounded-2xl p-8 w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Welcome Back</h1>
          <p className="text-gray-600">Please sign in to your account</p>
        </div>

        {/* Message Display */}
        {message && (
          <div className={`mb-6 p-4 rounded-lg text-center ${
            message.includes('successful') 
              ? 'bg-green-50 text-green-700 border border-green-200' 
              : 'bg-red-50 text-red-700 border border-red-200'
          }`}>
            {message}
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Username/Email Field */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Username or Email
            </label>
            <input
              type="text"
              name="identifier"
              placeholder="Enter your username or email"
              value={form.identifier}
              onChange={handleChange}
              className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200 ${
                errors.identifier ? 'border-red-300 bg-red-50' : 'border-gray-300'
              }`}
            />
            {errors.identifier && (
              <p className="mt-1 text-sm text-red-600 flex items-center">
                <span className="mr-1">⚠️</span>
                {errors.identifier}
              </p>
            )}
          </div>

          {/* Password Field */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                name="password"
                placeholder="Enter your password"
                value={form.password}
                onChange={handleChange}
                className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200 pr-12 ${
                  errors.password ? 'border-red-300 bg-red-50' : 'border-gray-300'
                }`}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
              >
                {showPassword ? (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" />
                  </svg>
                ) : (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                )}
              </button>
            </div>
            {errors.password && (
              <p className="mt-1 text-sm text-red-600 flex items-center">
                <span className="mr-1">⚠️</span>
                {errors.password}
              </p>
            )}
          </div>

          {/* Forgot Password Link */}
          <div className="text-right">
            <button
              type="button"
              onClick={handleForgotPassword}
              className="text-sm text-blue-600 hover:text-blue-700 hover:underline"
            >
              Forgot your password?
            </button>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className={`w-full py-3 px-4 rounded-lg font-semibold text-white transition duration-200 ${
              loading
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transform hover:scale-105'
            }`}
          >
            {loading ? (
              <span className="flex items-center justify-center">
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Signing in...
              </span>
            ) : (
              'Sign In'
            )}
          </button>
        </form>

        {/* Footer */}
        <div className="mt-8 text-center">
          <p className="text-gray-600 text-sm">
            Don't have an account?{' '}
            <button
              onClick={() => navigate('/register')}
              className="text-blue-600 hover:text-blue-700 font-medium hover:underline"
            >
              Sign up here
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
