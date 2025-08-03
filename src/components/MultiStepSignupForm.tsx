'use client';
import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { apiClient } from '@/lib/api';
import type { RegisterData, ApiResponse } from '@/lib/api';

interface FormData {
  // User info (step 1)
  email: string;
  username: string;
  first_name: string;
  last_name: string;
  phone_number: string;
  password: string;
  password_confirm: string;
  // Organization info (step 2)
  organization_name: string;
}

export default function MultiStepSignupForm() {
  const searchParams = useSearchParams();
  const inviteToken = searchParams?.get('token'); // Changed from 'invite' to 'token'
  const isInviteRegistration = !!inviteToken;
  
  console.log('Signup Form - Invite token:', inviteToken);
  console.log('Signup Form - Is invite registration:', isInviteRegistration);
  
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<FormData>({
    email: '',
    username: '',
    first_name: '',
    last_name: '',
    phone_number: '',
    password: '',
    password_confirm: '',
    organization_name: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [backendErrors, setBackendErrors] = useState<Record<string, string>>({});
  
  const router = useRouter();
  const { clearError, loading, refreshUser } = useAuth();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    // Clear errors for this field when user starts typing again
    if (backendErrors[name]) {
      setBackendErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateStep1 = () => {
    const errors: Record<string, string> = {};
    
    if (!formData.email) errors.email = 'Email is required';
    if (!formData.username) errors.username = 'Username is required';
    if (!formData.first_name) errors.first_name = 'First name is required';
    if (!formData.last_name) errors.last_name = 'Last name is required';
    if (!formData.password) errors.password = 'Password is required';
    if (!formData.password_confirm) errors.password_confirm = 'Password confirmation is required';
    if (formData.password !== formData.password_confirm) {
      errors.password_confirm = 'Passwords do not match';
    }
    
    setBackendErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const validateStep2 = () => {
    const errors: Record<string, string> = {};
    
    if (!formData.organization_name) errors.organization_name = 'Organization name is required';
    
    setBackendErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleNext = () => {
    if (currentStep === 1 && validateStep1()) {
      setCurrentStep(2);
      setBackendErrors({});
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
      setBackendErrors({});
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting || loading) return;
    
    // Validate current step
    if (isInviteRegistration) {
      if (!validateStep1()) return;
    } else {
      if (currentStep === 1) {
        handleNext();
        return;
      }
      if (currentStep === 2 && !validateStep2()) return;
    }
    
    setIsSubmitting(true);
    clearError();
    setBackendErrors({});
    
    try {
      // Create registration data that matches RegisterData interface
      const registrationData: RegisterData = {
        email: formData.email,
        username: formData.username,
        first_name: formData.first_name,
        last_name: formData.last_name,
        phone_number: formData.phone_number || undefined,
        password: formData.password,
        password_confirm: formData.password_confirm,
        organization_name: isInviteRegistration ? undefined : formData.organization_name,
        organization_invite_token: inviteToken || undefined,
      };
      
      const response = await apiClient.register(registrationData);
      console.log('Registration response:', response);
      
      if (response.data) {
        console.log('Registration successful, response:', response.data);
        
        // Check if we got tokens (invite-based registration should auto-login)
        if (response.data.tokens && response.data.user) {
          console.log('Storing tokens:', {
            access: response.data.tokens.access.substring(0, 20) + '...',
            refresh: response.data.tokens.refresh.substring(0, 20) + '...'
          });
          
          // Use tokenManager for consistent token storage
          const tokenManager = (await import('@/lib/api')).tokenManager;
          tokenManager.setTokens({
            access: response.data.tokens.access,
            refresh: response.data.tokens.refresh
          });
          
          // Verify tokens were stored
          const storedAccess = tokenManager.getAccessToken();
          const storedRefresh = tokenManager.getRefreshToken();
          console.log('Tokens stored successfully via tokenManager:', {
            access: storedAccess ? storedAccess.substring(0, 20) + '...' : 'NOT FOUND',
            refresh: storedRefresh ? storedRefresh.substring(0, 20) + '...' : 'NOT FOUND'
          });
          
          // Also verify localStorage directly for comparison
          const directAccess = localStorage.getItem('access_token');
          console.log('Direct localStorage check:', {
            access: directAccess ? directAccess.substring(0, 20) + '...' : 'NOT FOUND'
          });
          
          // Trigger auth context refresh to update user state
          setTimeout(async () => {
            try {
              await refreshUser();
              console.log('User logged in after registration:', response.data?.user);
              
              // Check if tokens are still available after refresh
              const tokenAfterRefresh = localStorage.getItem('access_token');
              console.log('Token after refresh:', tokenAfterRefresh ? tokenAfterRefresh.substring(0, 20) + '...' : 'NOT FOUND');
            } catch (authError) {
              console.error('Error refreshing user after registration:', authError);
            }
          }, 100);
          
          // Show success message and redirect to dashboard
          alert('Registration successful! Welcome to the team.');
          router.push('/dashboard');
        } else {
          // No tokens returned (organization owner), redirect to login with verification message
          alert('Registration successful! Please check your email for verification instructions, then return to login.');
          router.push('/login?verification_sent=true');
        }
      }
    } catch (error) {
      console.error('Registration error:', error);
      
      const response = error as ApiResponse;
      console.log('API Response Error (full):', response);
      console.log('Error message:', response.error);
      console.log('Validation errors:', response.errors);
      
      if (response.errors) {
        // Format and display validation errors from backend
        const formattedErrors: Record<string, string> = {};
        
        Object.entries(response.errors).forEach(([key, value]) => {
          if (Array.isArray(value)) {
            formattedErrors[key] = value.join(', ');
          } else if (typeof value === 'string') {
            formattedErrors[key] = value;
          } else if (value !== null) {
            formattedErrors[key] = String(value);
          }
        });
        
        setBackendErrors(formattedErrors);
      } else if (response.error) {
        alert(`Registration failed: ${response.error}`);
      } else {
        alert('Registration failed. Please try again.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderStep1 = () => (
    <>
      <div className="w-full max-w-[452px] flex flex-col justify-start items-center gap-4 sm:gap-6">
        {!isInviteRegistration && (
          <div className="self-stretch flex flex-col justify-start items-center gap-4">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-teal-500 text-white rounded-full flex items-center justify-center text-sm font-medium font-['Manrope']">1</div>
              <div className="w-16 h-0.5 bg-gray-200"></div>
              <div className="w-8 h-8 bg-gray-200 text-gray-500 rounded-full flex items-center justify-center text-sm font-medium font-['Manrope']">2</div>
            </div>
            <div className="flex space-x-12">
              <span className="text-xs text-teal-500 font-medium font-['Manrope']">Personal Info</span>
              <span className="text-xs text-gray-500 font-['Manrope']">Organization</span>
            </div>
          </div>
        )}
        
        {/* First Name and Last Name */}
        <div className="w-full flex flex-col sm:flex-row justify-start items-start gap-4">
          <div className="w-full sm:flex-1 flex flex-col justify-start items-start gap-1.5">
            <label htmlFor="first_name" className="text-zinc-800 text-sm font-medium font-['Manrope'] leading-tight">
              First Name
            </label>
            <input
              id="first_name"
              name="first_name"
              type="text"
              required
              className={`self-stretch px-3 py-2.5 bg-white rounded-lg border border-zinc-300 text-zinc-800 text-sm font-normal font-['Manrope'] leading-tight placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 ${
                backendErrors.first_name ? 'border-red-500' : ''
              }`}
              placeholder="Enter your first name"
              value={formData.first_name}
              onChange={handleInputChange}
            />
            {backendErrors.first_name && (
              <p className="text-red-600 text-xs font-medium font-['Manrope']">{backendErrors.first_name}</p>
            )}
          </div>
          
          <div className="w-full sm:flex-1 flex flex-col justify-start items-start gap-1.5">
            <label htmlFor="last_name" className="text-zinc-800 text-sm font-medium font-['Manrope'] leading-tight">
              Last Name
            </label>
            <input
              id="last_name"
              name="last_name"
              type="text"
              required
              className={`self-stretch px-3 py-2.5 bg-white rounded-lg border border-zinc-300 text-zinc-800 text-sm font-normal font-['Manrope'] leading-tight placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 ${
                backendErrors.last_name ? 'border-red-500' : ''
              }`}
              placeholder="Enter your last name"
              value={formData.last_name}
              onChange={handleInputChange}
            />
            {backendErrors.last_name && (
              <p className="text-red-600 text-xs font-medium font-['Manrope']">{backendErrors.last_name}</p>
            )}
          </div>
        </div>
        
        {/* Email Address */}
        <div className="w-full flex flex-col justify-start items-start gap-1.5">
          <label htmlFor="email" className="text-zinc-800 text-sm font-medium font-['Manrope'] leading-tight">
            Email Address
          </label>
          <input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            required
            className={`self-stretch px-3 py-2.5 bg-white rounded-lg border border-zinc-300 text-zinc-800 text-sm font-normal font-['Manrope'] leading-tight placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 ${
              backendErrors.email ? 'border-red-500' : ''
            }`}
            placeholder="Enter your email"
            value={formData.email}
            onChange={handleInputChange}
          />
          {backendErrors.email && (
            <p className="text-red-600 text-xs font-medium font-['Manrope']">{backendErrors.email}</p>
          )}
        </div>
        
        {/* Username */}
        <div className="w-full flex flex-col justify-start items-start gap-1.5">
          <label htmlFor="username" className="text-zinc-800 text-sm font-medium font-['Manrope'] leading-tight">
            Username
          </label>
          <input
            id="username"
            name="username"
            type="text"
            autoComplete="username"
            required
            className={`self-stretch px-3 py-2.5 bg-white rounded-lg border border-zinc-300 text-zinc-800 text-sm font-normal font-['Manrope'] leading-tight placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 ${
              backendErrors.username ? 'border-red-500' : ''
            }`}
            placeholder="Choose a username"
            value={formData.username}
            onChange={handleInputChange}
          />
          {backendErrors.username && (
            <p className="text-red-600 text-xs font-medium font-['Manrope']">{backendErrors.username}</p>
          )}
        </div>
        
        {/* Phone Number */}
        <div className="w-full flex flex-col justify-start items-start gap-1.5">
          <label htmlFor="phone_number" className="text-zinc-800 text-sm font-medium font-['Manrope'] leading-tight">
            Phone Number (Optional)
          </label>
          <input
            id="phone_number"
            name="phone_number"
            type="tel"
            className={`self-stretch px-3 py-2.5 bg-white rounded-lg border border-zinc-300 text-zinc-800 text-sm font-normal font-['Manrope'] leading-tight placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 ${
              backendErrors.phone_number ? 'border-red-500' : ''
            }`}
            placeholder="Enter your phone number"
            value={formData.phone_number}
            onChange={handleInputChange}
          />
          {backendErrors.phone_number && (
            <p className="text-red-600 text-xs font-medium font-['Manrope']">{backendErrors.phone_number}</p>
          )}
        </div>
        
        {/* Password and Confirm Password */}
        <div className="w-full flex flex-col sm:flex-row justify-start items-start gap-4">
          <div className="w-full sm:flex-1 flex flex-col justify-start items-start gap-1.5">
            <label htmlFor="password" className="text-zinc-800 text-sm font-medium font-['Manrope'] leading-tight">
              Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              autoComplete="new-password"
              required
              className={`self-stretch px-3 py-2.5 bg-white rounded-lg border border-zinc-300 text-zinc-800 text-sm font-normal font-['Manrope'] leading-tight placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 ${
                backendErrors.password ? 'border-red-500' : ''
              }`}
              placeholder="Create a password"
              value={formData.password}
              onChange={handleInputChange}
            />
            {backendErrors.password && (
              <p className="text-red-600 text-xs font-medium font-['Manrope']">{backendErrors.password}</p>
            )}
          </div>
          
          <div className="w-full sm:flex-1 flex flex-col justify-start items-start gap-1.5">
            <label htmlFor="password_confirm" className="text-zinc-800 text-sm font-medium font-['Manrope'] leading-tight">
              Confirm Password
            </label>
            <input
              id="password_confirm"
              name="password_confirm"
              type="password"
              autoComplete="new-password"
              required
              className={`self-stretch px-3 py-2.5 bg-white rounded-lg border border-zinc-300 text-zinc-800 text-sm font-normal font-['Manrope'] leading-tight placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 ${
                backendErrors.password_confirm ? 'border-red-500' : ''
              }`}
              placeholder="Confirm your password"
              value={formData.password_confirm}
              onChange={handleInputChange}
            />
            {backendErrors.password_confirm && (
              <p className="text-red-600 text-xs font-medium font-['Manrope']">{backendErrors.password_confirm}</p>
            )}
          </div>
        </div>
      </div>
    </>
  );

  const renderStep2 = () => (
    <>
      <div className="w-full max-w-[452px] flex flex-col justify-start items-center gap-4 sm:gap-6">
        {/* Step Indicator */}
        <div className="self-stretch flex flex-col justify-start items-center gap-4">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-green-600 text-white rounded-full flex items-center justify-center text-sm font-medium font-['Manrope']">✓</div>
            <div className="w-16 h-0.5 bg-teal-500"></div>
            <div className="w-8 h-8 bg-teal-500 text-white rounded-full flex items-center justify-center text-sm font-medium font-['Manrope']">2</div>
          </div>
          <div className="flex space-x-12">
            <span className="text-xs text-green-600 font-medium font-['Manrope']">Personal Info</span>
            <span className="text-xs text-teal-500 font-medium font-['Manrope']">Organization</span>
          </div>
        </div>
        
        {/* Organization Name */}
        <div className="w-full flex flex-col justify-start items-start gap-1.5">
          <label htmlFor="organization_name" className="text-zinc-800 text-sm font-medium font-['Manrope'] leading-tight">
            Organization Name
          </label>
          <input
            id="organization_name"
            name="organization_name"
            type="text"
            required
            className={`self-stretch px-3 py-2.5 bg-white rounded-lg border border-zinc-300 text-zinc-800 text-sm font-normal font-['Manrope'] leading-tight placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 ${
              backendErrors.organization_name ? 'border-red-500' : ''
            }`}
            placeholder="Enter your organization name"
            value={formData.organization_name}
            onChange={handleInputChange}
          />
          {backendErrors.organization_name && (
            <p className="text-red-600 text-xs font-medium font-['Manrope']">{backendErrors.organization_name}</p>
          )}
        </div>
        
        {/* Email Verification Notice */}
        <div className="w-full p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-blue-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium font-['Manrope'] text-blue-800">
                Email Verification Required
              </h3>
              <p className="mt-2 text-sm font-['Manrope'] text-blue-700">
                After registration, you&apos;ll need to verify your email address before you can log in. 
                We&apos;ll send you a verification link to get started.
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );

  return (
    <div className="min-h-screen bg-white flex flex-col md:flex-row justify-start items-center overflow-hidden">
      {/* Left Image Section - Only visible on large screens */}
      <div className="hidden lg:flex flex-1 h-screen relative">
        <div className="absolute inset-0 bg-indigo-300/25" />
        <Image
          src="/images/signup.jpg"
          alt="Signup background"
          fill
          className="object-cover"
        />
        <div className="absolute inset-0 bg-indigo-300/25" />
      </div>

      {/* Right Form Section */}
      <div className="w-full lg:flex-1 self-stretch px-4 sm:px-6 md:px-10 py-8 sm:py-10 md:py-12 inline-flex flex-col justify-start items-center gap-8 md:gap-12 overflow-y-auto min-h-screen lg:min-h-0 lg:max-h-screen">
        {/* Header Navigation */}
        <div className="self-stretch px-2.5 py-1 inline-flex justify-between items-start overflow-hidden">
          <Link href="/" className="rounded-lg flex justify-center items-center gap-1 overflow-hidden hover:gap-2 transition-all duration-200">
            <div className="w-5 h-5 relative overflow-hidden">
              <svg className="w-full h-full text-zinc-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 19l-7-7 7-7" />
              </svg>
            </div>
            <div className="justify-start text-neutral-600 text-sm font-medium font-['Manrope']">Back</div>
          </Link>
          <Link href="/login" className="text-center justify-start text-teal-500 text-sm font-semibold font-['Manrope'] leading-tight hover:text-teal-600 transition-colors duration-200">
            Login
          </Link>
        </div>

        {/* Main Form Container */}
        <div className="w-full max-w-[500px] p-6 sm:p-6 pb-8 sm:pb-12 flex flex-col justify-start items-start gap-6 sm:gap-8 md:gap-10 overflow-hidden">
          {/* Header Section */}
          <div className="self-stretch flex flex-col justify-start items-center gap-6 overflow-hidden">
            {/* Logo */}
            <div className="inline-flex justify-center items-center gap-2.5 overflow-hidden">
              <Image
                src="/logoBlack.svg"
                alt="Penthry Logo"
                width={120}
                height={40}
                className="h-10 w-auto"
              />
            </div>
            <div className="self-stretch flex flex-col justify-start items-center gap-2">
              <div className="w-full max-w-[452px] text-center justify-start text-zinc-800 text-2xl sm:text-3xl font-semibold font-['Manrope'] leading-8 sm:leading-10">
                {isInviteRegistration ? 'Join Your Team' : 'Welcome to Penthry'}
              </div>
              <div className="w-full max-w-[452px] text-center justify-start text-zinc-500 text-sm sm:text-base font-normal font-['Manrope'] leading-normal">
                {isInviteRegistration 
                  ? 'Complete your profile to join your organization'
                  : 'Streamline your business operations.'
                }
              </div>
            </div>
          </div>

          {/* Error Display */}
          {Object.keys(backendErrors).length > 0 && (
            <div className="w-full max-w-[452px] px-3 sm:px-4 py-2 sm:py-3 bg-red-50 border border-red-200 rounded-lg">
              {Object.entries(backendErrors)
                .filter(([field]) => !['email', 'username', 'first_name', 'last_name', 'phone_number', 'password', 'password_confirm', 'organization_name', 'organization'].includes(field))
                .map(([field, message]) => (
                  <p key={field} className="text-red-600 text-sm font-medium">
                    <strong>{field.replace(/_/g, ' ').charAt(0).toUpperCase() + field.replace(/_/g, ' ').slice(1)}:</strong> {message}
                  </p>
              ))}
            </div>
          )}

          {/* Form Section */}
          <form onSubmit={handleSubmit} className="self-stretch flex flex-col justify-start items-center gap-6 sm:gap-8">
            {isInviteRegistration || currentStep === 1 ? renderStep1() : renderStep2()}

            <div className={`w-full max-w-[452px] flex ${!isInviteRegistration && currentStep === 2 ? 'justify-between' : 'justify-center'} items-center gap-4`}>
              {!isInviteRegistration && currentStep === 2 && (
                <button
                  type="button"
                  onClick={handlePrevious}
                  className="px-6 py-3 bg-white border border-zinc-300 rounded-lg text-zinc-700 text-sm font-medium font-['Manrope'] hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200"
                >
                  Previous
                </button>
              )}
              
              <button
                type="submit"
                disabled={isSubmitting || loading}
                className="px-6 py-3 bg-teal-500 hover:bg-teal-600 disabled:bg-teal-300 rounded-lg text-white text-sm font-semibold font-['Manrope'] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 transition-colors duration-200 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {isSubmitting || loading ? (
                  <>
                    <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    {isInviteRegistration ? 'Joining...' : (currentStep === 1 ? 'Processing...' : 'Creating Account...')}
                  </>
                ) : (
                  isInviteRegistration ? 'Join Team' : (currentStep === 1 ? 'Next' : 'Create Account')
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
