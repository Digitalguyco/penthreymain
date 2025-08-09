'use client';
import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { apiClient } from '@/lib/api';
import type { RegisterData, ApiResponse } from '@/lib/api';

export default function SignupForm() {
  const [formData, setFormData] = useState({
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
  const { error, clearError, loading, refreshUser } = useAuth();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    // Clear errors for this field when user starts typing again
    if (backendErrors[name]) {
      setBackendErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting || loading) return;
    
    // Basic validation
    if (formData.password !== formData.password_confirm) {
      return;
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
        organization_name: formData.organization_name, // Always send organization_name
      };
      
      const response = await apiClient.register(registrationData);
      console.log('Registration response:', response);
      
      if (response.data) {
        console.log('Registration successful, response:', response.data);
        
        // Check if we got tokens (user should be auto-logged in after registration)
        if (response.data.tokens && response.data.user) {
          // Store tokens in localStorage (token manager expects them there)
          localStorage.setItem('access_token', response.data.tokens.access);
          localStorage.setItem('refresh_token', response.data.tokens.refresh);
          
          // Trigger auth context refresh to update user state
          setTimeout(async () => {
            try {
              // Refresh user profile to update auth context
              await refreshUser();
              console.log('User logged in after registration:', response.data?.user);
            } catch (authError) {
              console.error('Error refreshing user after registration:', authError);
            }
          }, 100);
          
          // Show success message and redirect to dashboard
          alert('Registration successful! Welcome to Penthry. Please check your email to verify your account.');
          router.push('/dashboard');
        } else {
          // No tokens returned, redirect to login
          alert('Registration successful! Please check your email for verification instructions, then return to login.');
          router.push('/login');
        }
      }
    } catch (error) {
      console.error('Registration error:', error);
      
      // We get the error response from the apiClient directly
      const response = error as ApiResponse;
      console.log('API Response Error (full):', response);
      console.log('Error message:', response.error);
      console.log('Validation errors:', response.errors);
      
      // Helper function to parse Django ErrorDetail objects from stringified errors
      const parseErrorString = (errorString: string): Record<string, string> => {
        try {
          // Try to extract field errors from Django's stringified error format
          const formattedErrors: Record<string, string> = {};
          
          // Look for patterns like: 'field_name': [ErrorDetail(string='Error message', code='error_code')]
          const fieldErrorPattern = /'([^']+)':\s*\[ErrorDetail\(string='([^']+)'(?:.*?)\)/g;
          let match;
          
          while ((match = fieldErrorPattern.exec(errorString)) !== null) {
            const [, fieldName, errorMessage] = match;
            formattedErrors[fieldName] = errorMessage;
          }
          
          // If no field-specific errors found, try a more general approach
          if (Object.keys(formattedErrors).length === 0) {
            // Look for error messages in quotes
            const generalErrorPattern = /'([^']+)':/g;
            const messagePattern = /string='([^']+)'/g;
            
            let fieldMatch;
            const fields: string[] = [];
            while ((fieldMatch = generalErrorPattern.exec(errorString)) !== null) {
              fields.push(fieldMatch[1]);
            }
            
            let messageMatch;
            const messages: string[] = [];
            while ((messageMatch = messagePattern.exec(errorString)) !== null) {
              messages.push(messageMatch[1]);
            }
            
            // Map fields to messages
            fields.forEach((field, index) => {
              if (messages[index]) {
                formattedErrors[field] = messages[index];
              }
            });
          }
          
          return formattedErrors;
        } catch (e) {
          console.error('Error parsing error string:', e);
          return {};
        }
      };
      
      if (response.errors) {
        // Format and display validation errors from backend (structured errors)
        const formattedErrors: Record<string, string> = {};
        
        // Process errors from DRF via our API client
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
        // Try to parse stringified Django validation errors
        const parsedErrors = parseErrorString(response.error);
        
        if (Object.keys(parsedErrors).length > 0) {
          // We successfully parsed field-specific errors
          setBackendErrors(parsedErrors);
        } else {
          // Handle as general error
          setBackendErrors({ general: response.error });
        }
      }
    } finally {
      setIsSubmitting(false);
    }
  };

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
        <div className="w-full max-w-[500px]  p-6 sm:p-6 pb-8 sm:pb-12 flex flex-col justify-start items-start gap-6 sm:gap-8 md:gap-10 overflow-hidden">
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
                Welcome to Penthry
              </div>
              <div className="w-full max-w-[452px] text-center justify-start text-zinc-500 text-sm sm:text-base font-normal font-['Manrope'] leading-normal">
                Streamline your business operations.
              </div>
            </div>
          </div>

          {/* Error Display */}
          {(error || Object.keys(backendErrors).length > 0) && (
            <div className="w-full max-w-[452px] px-3 sm:px-4 py-2 sm:py-3 bg-red-50 border border-red-200 rounded-lg">
              {error && <p className="text-red-600 text-sm font-medium">{error}</p>}
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
            <div className="w-full max-w-[452px] flex flex-col justify-start items-center gap-4 sm:gap-6">
              {/* First Name and Last Name */}
              <div className="self-stretch flex flex-col sm:flex-row gap-4">
                <div className="w-full sm:flex-1 flex flex-col justify-start items-start gap-1.5">
                  <label className="text-zinc-700 text-sm font-medium font-['Manrope']">First Name</label>
                  <div className="self-stretch px-3.5 py-2.5 bg-white rounded-lg shadow-[0px_1px_2px_0px_rgba(16,24,40,0.05)] border border-gray-300 inline-flex justify-start items-center gap-2 overflow-hidden focus-within:border-teal-500 focus-within:ring-2 focus-within:ring-teal-100 transition-all duration-200">
                    <input
                      type="text"
                      name="first_name"
                      value={formData.first_name}
                      onChange={handleInputChange}
                      placeholder="John"
                      required
                      className="flex-1 text-zinc-800 text-base font-normal font-['Manrope'] leading-normal bg-transparent border-none outline-none placeholder:text-zinc-500"
                    />
                  </div>
                  {backendErrors.first_name && (
                    <p className="text-red-500 text-xs font-medium mt-1">{backendErrors.first_name}</p>
                  )}
                </div>
                <div className="w-full sm:flex-1 flex flex-col justify-start items-start gap-1.5">
                  <label className="text-zinc-700 text-sm font-medium font-['Manrope']">Last Name</label>
                  <div className="self-stretch px-3.5 py-2.5 bg-white rounded-lg shadow-[0px_1px_2px_0px_rgba(16,24,40,0.05)] border border-gray-300 inline-flex justify-start items-center gap-2 overflow-hidden focus-within:border-teal-500 focus-within:ring-2 focus-within:ring-teal-100 transition-all duration-200">
                    <input
                      type="text"
                      name="last_name"
                      value={formData.last_name}
                      onChange={handleInputChange}
                      placeholder="Doe"
                      required
                      className="flex-1 text-zinc-800 text-base font-normal font-['Manrope'] leading-normal bg-transparent border-none outline-none placeholder:text-zinc-500"
                    />
                  </div>
                  {backendErrors.last_name && (
                    <p className="text-red-500 text-xs font-medium mt-1">{backendErrors.last_name}</p>
                  )}
                </div>
              </div>

              {/* Email Input */}
              <div className="self-stretch flex flex-col justify-start items-start gap-1.5">
                <label className="text-zinc-700 text-sm font-medium font-['Manrope']">Work Email</label>
                <div className="self-stretch px-3.5 py-2.5 bg-white rounded-lg shadow-[0px_1px_2px_0px_rgba(16,24,40,0.05)] border border-gray-300 inline-flex justify-start items-center gap-2 overflow-hidden focus-within:border-teal-500 focus-within:ring-2 focus-within:ring-teal-100 transition-all duration-200">
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder="john@company.com"
                    required
                    className="flex-1 text-zinc-800 text-base font-normal font-['Manrope'] leading-normal bg-transparent border-none outline-none placeholder:text-zinc-500"
                  />
                </div>
                {backendErrors.email && (
                  <p className="text-red-500 text-xs font-medium mt-1">{backendErrors.email}</p>
                )}
              </div>

              {/* Username Input */}
              <div className="self-stretch flex flex-col justify-start items-start gap-1.5">
                <label className="text-zinc-700 text-sm font-medium font-['Manrope']">Username</label>
                <div className="self-stretch px-3.5 py-2.5 bg-white rounded-lg shadow-[0px_1px_2px_0px_rgba(16,24,40,0.05)] border border-gray-300 inline-flex justify-start items-center gap-2 overflow-hidden focus-within:border-teal-500 focus-within:ring-2 focus-within:ring-teal-100 transition-all duration-200">
                  <input
                    type="text"
                    name="username"
                    value={formData.username}
                    onChange={handleInputChange}
                    placeholder="johndoe"
                    required
                    className="flex-1 text-zinc-800 text-base font-normal font-['Manrope'] leading-normal bg-transparent border-none outline-none placeholder:text-zinc-500"
                  />
                </div>
                {backendErrors.username && (
                  <p className="text-red-500 text-xs font-medium mt-1">{backendErrors.username}</p>
                )}
              </div>

              {/* Organization Name */}
              <div className="self-stretch flex flex-col justify-start items-start gap-1.5">
                <label className="text-zinc-700 text-sm font-medium font-['Manrope']">Organization Name</label>
                <div className="self-stretch px-3.5 py-2.5 bg-white rounded-lg shadow-[0px_1px_2px_0px_rgba(16,24,40,0.05)] border border-gray-300 inline-flex justify-start items-center gap-2 overflow-hidden focus-within:border-teal-500 focus-within:ring-2 focus-within:ring-teal-100 transition-all duration-200">
                  <input
                    type="text"
                    name="organization_name"
                    value={formData.organization_name}
                    onChange={handleInputChange}
                    placeholder="Your Company Inc."
                    required
                    className="flex-1 text-zinc-800 text-base font-normal font-['Manrope'] leading-normal bg-transparent border-none outline-none placeholder:text-zinc-500"
                  />
                </div>
                {backendErrors.organization_name && (
                  <p className="text-red-500 text-xs font-medium mt-1">{backendErrors.organization_name}</p>
                )}
                {backendErrors.organization && (
                  <p className="text-red-500 text-xs font-medium mt-1">{backendErrors.organization}</p>
                )}
                {!formData.organization_name && (
                  <p className="text-amber-500 text-xs font-medium">Required to create your organization</p>
                )}
              </div>

              {/* Phone Number */}
              <div className="self-stretch flex flex-col justify-start items-start gap-1.5">
                <label className="text-zinc-700 text-sm font-medium font-['Manrope']">Phone Number (Optional)</label>
                <div className="self-stretch px-3.5 py-2.5 bg-white rounded-lg shadow-[0px_1px_2px_0px_rgba(16,24,40,0.05)] border border-gray-300 inline-flex justify-start items-center gap-2 overflow-hidden focus-within:border-teal-500 focus-within:ring-2 focus-within:ring-teal-100 transition-all duration-200">
                  <input
                    type="tel"
                    name="phone_number"
                    value={formData.phone_number}
                    onChange={handleInputChange}
                    placeholder="+1 (555) 123-4567"
                    className="flex-1 text-zinc-800 text-base font-normal font-['Manrope'] leading-normal bg-transparent border-none outline-none placeholder:text-zinc-500"
                  />
                </div>
                {backendErrors.phone_number && (
                  <p className="text-red-500 text-xs font-medium mt-1">{backendErrors.phone_number}</p>
                )}
              </div>

              {/* Password */}
              <div className="self-stretch flex flex-col justify-start items-start gap-1.5">
                <label className="text-zinc-700 text-sm font-medium font-['Manrope']">Password</label>
                <div className="self-stretch px-3.5 py-2.5 bg-white rounded-lg shadow-[0px_1px_2px_0px_rgba(16,24,40,0.05)] border border-gray-300 inline-flex justify-start items-center gap-2 overflow-hidden focus-within:border-teal-500 focus-within:ring-2 focus-within:ring-teal-100 transition-all duration-200">
                  <input
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    placeholder="Create a strong password"
                    required
                    className="flex-1 text-zinc-800 text-base font-normal font-['Manrope'] leading-normal bg-transparent border-none outline-none placeholder:text-zinc-500"
                  />
                </div>
                {backendErrors.password && (
                  <p className="text-red-500 text-xs font-medium mt-1">{backendErrors.password}</p>
                )}
              </div>

              {/* Confirm Password */}
              <div className="self-stretch flex flex-col justify-start items-start gap-1.5">
                <label className="text-zinc-700 text-sm font-medium font-['Manrope']">Confirm Password</label>
                <div className="self-stretch px-3.5 py-2.5 bg-white rounded-lg shadow-[0px_1px_2px_0px_rgba(16,24,40,0.05)] border border-gray-300 inline-flex justify-start items-center gap-2 overflow-hidden focus-within:border-teal-500 focus-within:ring-2 focus-within:ring-teal-100 transition-all duration-200">
                  <input
                    type="password"
                    name="password_confirm"
                    value={formData.password_confirm}
                    onChange={handleInputChange}
                    placeholder="Confirm your password"
                    required
                    className="flex-1 text-zinc-800 text-base font-normal font-['Manrope'] leading-normal bg-transparent border-none outline-none placeholder:text-zinc-500"
                  />
                </div>
                {formData.password !== formData.password_confirm && formData.password_confirm && (
                  <p className="text-red-500 text-xs font-medium">Passwords do not match</p>
                )}
                {backendErrors.password_confirm && (
                  <p className="text-red-500 text-xs font-medium mt-1">{backendErrors.password_confirm}</p>
                )}
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isSubmitting || loading || !formData.email || !formData.password || !formData.username || !formData.first_name || !formData.last_name || !formData.organization_name || formData.password !== formData.password_confirm}
                className={`self-stretch px-6 py-3 rounded-lg shadow-[0px_2px_4px_0px_rgba(0,0,0,0.10)] inline-flex justify-center items-center gap-2 overflow-hidden transition-colors duration-200 ${
                  isSubmitting || loading || !formData.email || !formData.password || !formData.username || !formData.first_name || !formData.last_name || !formData.organization_name || formData.password !== formData.password_confirm
                    ? 'bg-gray-300 cursor-not-allowed'
                    : 'bg-teal-400 hover:bg-teal-500'
                }`}
              >
                {(isSubmitting || loading) ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-zinc-800"></div>
                    <div className="justify-start text-zinc-800 text-sm font-medium font-['Manrope']">Creating Account...</div>
                  </>
                ) : (
                  <div className="justify-start text-zinc-800 text-sm font-medium font-['Manrope']">Create Account</div>
                )}
              </button>
            </div>

            {/* Login Link */}
            <div className="self-stretch inline-flex justify-center items-center gap-2">
              <div className="text-center justify-start text-neutral-600 text-sm font-medium font-['Manrope'] leading-tight">Already have an account?</div>
              <Link href="/login" className="text-center justify-start text-teal-500 text-sm font-semibold font-['Manrope'] leading-tight hover:text-teal-600 transition-colors duration-200">
                Login
              </Link>
            </div>
          </form>

          {/* Security Notice */}
          <div className="self-stretch py-2 bg-zinc-100 rounded-lg inline-flex justify-center items-center gap-2.5">
            <div className="w-full max-w-[452px] text-center justify-start text-zinc-600 text-xs font-medium font-['Manrope'] leading-none">
              We&apos;ll never spam you. Your data stays safe.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 