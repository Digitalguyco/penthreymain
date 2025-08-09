'use client';
import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { apiClient } from '@/lib/api';

interface PasswordResetConfirmFormProps {
  token: string;
}

export default function PasswordResetConfirmForm({ token }: PasswordResetConfirmFormProps) {
  const [formData, setFormData] = useState({
    password: '',
    confirmPassword: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);
  const [passwordErrors, setPasswordErrors] = useState<string[]>([]);
  
  const router = useRouter();

  const validatePassword = (password: string) => {
    const errors = [];
    if (password.length < 8) {
      errors.push('At least 8 characters long');
    }
    if (!/[A-Z]/.test(password)) {
      errors.push('At least one uppercase letter');
    }
    if (!/[a-z]/.test(password)) {
      errors.push('At least one lowercase letter');
    }
    if (!/[0-9]/.test(password)) {
      errors.push('At least one number');
    }
    if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
      errors.push('At least one special character');
    }
    return errors;
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Clear errors when user starts typing
    if (error) setError('');
    
    // Real-time password validation
    if (name === 'password') {
      setPasswordErrors(validatePassword(value));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (isSubmitting) return;

    // Validation
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    const validationErrors = validatePassword(formData.password);
    if (validationErrors.length > 0) {
      setError('Please fix the password requirements below');
      return;
    }
    
    setIsSubmitting(true);
    setError('');
    
    try {
      const response = await apiClient.confirmPasswordReset(token, formData.password, formData.confirmPassword);
      
      if (response.data) {
        setIsSuccess(true);
        console.log('Password reset successful:', response.data);
        // Redirect to login after success
        setTimeout(() => {
          router.push('/login?message=password-reset-success');
        }, 2000);
      } else if (response.error) {
        setError(response.error);
      }
    } catch (err) {
      console.error('Password reset failed:', err);
      setError('Failed to reset password. The reset link may be expired or invalid.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="min-h-screen bg-white flex overflow-hidden">
        <div className="self-stretch p-12 flex flex-col w-full gap-12 overflow-hidden">
          <div className="w-full max-w-[500px] p-6 flex self-center flex-col justify-center items-center gap-8 overflow-hidden">
            {/* Success Icon */}
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
              <svg className="w-8 h-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            
            {/* Success Message */}
            <div className="text-center">
              <h1 className="text-2xl font-semibold text-zinc-800 mb-2">Password Reset Successful!</h1>
              <p className="text-zinc-600 mb-6">Your password has been updated successfully. You can now log in with your new password.</p>
              <p className="text-sm text-zinc-500">Redirecting to login page...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white flex overflow-hidden">
      {/* Main Container */}
      <div className="self-stretch p-12 flex flex-col w-full gap-12 overflow-hidden">
        {/* Header Navigation */}
        <div className="self-stretch py-1 flex justify-between overflow-hidden">
          <Link href="/login" className="rounded-lg flex justify-center items-center gap-1 overflow-hidden hover:gap-2 transition-all duration-200">
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
        <div className="w-full max-w-[500px] p-6 flex self-center flex-col justify-start items-start gap-14 overflow-hidden">
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
              <div className="w-full max-w-[452px] text-center justify-start text-zinc-800 text-3xl font-semibold font-['Manrope'] leading-10">
                Create New Password
              </div>
              <div className="w-full max-w-[452px] text-center justify-start text-zinc-500 text-base font-normal font-['Manrope'] leading-normal">
                Enter your new password to complete the reset process.
              </div>
            </div>
          </div>

          {/* Error Alert */}
          {error && (
            <div className="self-stretch p-4 bg-red-50 rounded-lg outline outline-1 outline-offset-[-1px] outline-red-300 inline-flex justify-start items-start gap-3">
              <div className="w-5 h-5 relative overflow-hidden">
                <svg className="w-full h-full text-red-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.25} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <div className="flex-1 inline-flex flex-col justify-start items-start gap-3">
                <div className="self-stretch flex flex-col justify-start items-start gap-1">
                  <div className="self-stretch justify-start text-red-700 text-sm font-medium font-['Manrope'] leading-tight">
                    Password Reset Failed
                  </div>
                  <div className="self-stretch justify-start text-red-700 text-sm font-normal font-['Manrope'] leading-tight">
                    {error}
                  </div>
                </div>
              </div>
              <button
                onClick={() => setError('')}
                className="w-5 h-5 relative p-2 rounded-lg flex justify-center items-center gap-2 overflow-hidden hover:bg-red-100 transition-colors duration-200"
              >
                <div className="w-5 h-5 relative overflow-hidden">
                  <svg className="w-full h-full text-red-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.67} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </div>
              </button>
            </div>
          )}

          {/* Form Section */}
          <form onSubmit={handleSubmit} className="self-stretch flex flex-col justify-start items-center gap-8">
            <div className="w-full max-w-[452px] flex flex-col justify-start items-center gap-6">
              {/* New Password Input */}
              <div className="self-stretch flex flex-col justify-start items-start gap-1.5">
                <label className="text-zinc-800 text-sm font-medium font-['Manrope'] leading-tight">
                  New Password
                </label>
                <div className="self-stretch flex flex-col justify-start items-start gap-1.5">
                  <div className="self-stretch px-3.5 py-2.5 bg-white rounded-lg shadow-[0px_1px_2px_0px_rgba(16,24,40,0.05)] outline outline-1 outline-offset-[-1px] outline-gray-400 inline-flex justify-start items-center gap-2 overflow-hidden focus-within:outline-teal-500 focus-within:outline-2 transition-all duration-200">
                    <div className="flex-1 flex justify-start items-center gap-2">
                      <input
                        type="password"
                        name="password"
                        value={formData.password}
                        onChange={handleInputChange}
                        placeholder="Enter your new password"
                        required
                        className="flex-1 text-zinc-800 text-base font-normal font-['Manrope'] leading-normal bg-transparent border-none outline-none placeholder:text-zinc-500"
                      />
                    </div>
                  </div>
                </div>
                
                {/* Password Requirements */}
                {formData.password && (
                  <div className="self-stretch text-xs text-zinc-600 leading-tight">
                    <div className="mb-1 font-medium">Password must contain:</div>
                    <div className="space-y-1">
                      {[
                        'At least 8 characters long',
                        'At least one uppercase letter',
                        'At least one lowercase letter', 
                        'At least one number',
                        'At least one special character'
                      ].map((requirement, index) => {
                        const isMet = !passwordErrors.includes(requirement);
                        return (
                          <div key={index} className={`flex items-center gap-1 ${isMet ? 'text-green-600' : 'text-zinc-500'}`}>
                            {isMet ? (
                              <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                              </svg>
                            ) : (
                              <div className="w-3 h-3 rounded-full border border-current" />
                            )}
                            {requirement}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>

              {/* Confirm Password Input */}
              <div className="self-stretch flex flex-col justify-start items-start gap-1.5">
                <label className="text-zinc-800 text-sm font-medium font-['Manrope'] leading-tight">
                  Confirm Password
                </label>
                <div className="self-stretch flex flex-col justify-start items-start gap-1.5">
                  <div className="self-stretch px-3.5 py-2.5 bg-white rounded-lg shadow-[0px_1px_2px_0px_rgba(16,24,40,0.05)] outline outline-1 outline-offset-[-1px] outline-gray-400 inline-flex justify-start items-center gap-2 overflow-hidden focus-within:outline-teal-500 focus-within:outline-2 transition-all duration-200">
                    <div className="flex-1 flex justify-start items-center gap-2">
                      <input
                        type="password"
                        name="confirmPassword"
                        value={formData.confirmPassword}
                        onChange={handleInputChange}
                        placeholder="Confirm your new password"
                        required
                        className="flex-1 text-zinc-800 text-base font-normal font-['Manrope'] leading-normal bg-transparent border-none outline-none placeholder:text-zinc-500"
                      />
                    </div>
                  </div>
                </div>
                {formData.confirmPassword && formData.password !== formData.confirmPassword && (
                  <div className="text-red-500 text-xs">Passwords do not match</div>
                )}
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isSubmitting || passwordErrors.length > 0 || !formData.password || !formData.confirmPassword}
                className="self-stretch px-6 py-3 bg-teal-400 rounded-lg shadow-[0px_2px_4px_0px_rgba(0,0,0,0.10)] inline-flex justify-center items-center gap-2 overflow-hidden hover:bg-teal-500 disabled:bg-teal-300 disabled:cursor-not-allowed transition-colors duration-200"
              >
                {isSubmitting ? (
                  <>
                    <div className="w-4 h-4 animate-spin rounded-full border-2 border-zinc-800 border-t-transparent" />
                    <div className="justify-start text-zinc-800 text-sm font-medium font-['Manrope']">
                      Resetting...
                    </div>
                  </>
                ) : (
                  <div className="justify-start text-zinc-800 text-sm font-medium font-['Manrope']">
                    Reset Password
                  </div>
                )}
              </button>
            </div>

            {/* Additional Help */}
            <div className="self-stretch inline-flex justify-center items-center gap-2">
              <div className="text-center justify-start text-neutral-600 text-sm font-medium font-['Manrope'] leading-tight">
                Remember your password?
              </div>
              <Link href="/login" className="text-center justify-start text-teal-500 text-sm font-semibold font-['Manrope'] leading-tight hover:text-teal-600 transition-colors duration-200">
                Back to login
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
