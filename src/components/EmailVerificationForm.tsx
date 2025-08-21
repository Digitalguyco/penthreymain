'use client';
import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { apiClient } from '@/lib/api';

export default function EmailVerificationForm() {
  const [isVerifying, setIsVerifying] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState('');
  const [token, setToken] = useState<string | null>(null);
  
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    // Extract token from URL query parameters
    const tokenFromUrl = searchParams.get('token');
    setToken(tokenFromUrl);
    
    if (tokenFromUrl) {
      // Automatically start verification when token is present
      handleVerification(tokenFromUrl);
    } else {
      setError('No verification token provided in the URL.');
    }
  }, [searchParams]);

  const handleVerification = async (verificationToken: string) => {
    if (isVerifying) return;
    
    setIsVerifying(true);
    setError('');
    
    try {
      const response = await apiClient.verifyEmail(verificationToken);
      
      if (response.data) {
        setIsSuccess(true);
        console.log('Email verification successful:', response.data);
        // Redirect to login after success
        setTimeout(() => {
          router.push('/login?message=email-verified');
        }, 3000);
      } else if (response.error) {
        setError(response.error);
      }
    } catch (err) {
      console.error('Email verification failed:', err);
      setError('Failed to verify email. The verification link may be expired or invalid.');
    } finally {
      setIsVerifying(false);
    }
  };

  const handleRetry = () => {
    if (token) {
      handleVerification(token);
    }
  };

  if (isSuccess) {
    return (
      <div className="min-h-screen bg-white flex overflow-hidden">
        <div className="self-stretch p-12 flex flex-col w-full gap-12 overflow-hidden">
          <div className="w-full max-w-[500px] p-6 flex self-center flex-col justify-center items-center gap-8 overflow-hidden">
            {/* Success Icon */}
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center">
              <svg className="w-10 h-10 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            
            {/* Success Message */}
            <div className="text-center">
              <h1 className="text-3xl font-semibold text-zinc-800 mb-4">Email Verified Successfully!</h1>
              <p className="text-zinc-600 mb-6 text-lg">
                Your email address has been verified successfully. You can now access all features of your Penthrey account.
              </p>
              <p className="text-sm text-zinc-500">Redirecting to login page in a moment...</p>
            </div>

            {/* Manual Login Button */}
            <Link 
              href="/login"
              className="px-6 py-3 bg-teal-400 rounded-lg shadow-[0px_2px_4px_0px_rgba(0,0,0,0.10)] inline-flex justify-center items-center gap-2 overflow-hidden hover:bg-teal-500 transition-colors duration-200"
            >
              <div className="text-zinc-800 text-sm font-medium font-['Manrope']">
                Continue to Login
              </div>
            </Link>
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

        {/* Main Content Container */}
        <div className="w-full max-w-[500px] p-6 flex self-center flex-col justify-center items-center gap-8 overflow-hidden">
          {/* Header Section */}
          <div className="self-stretch flex flex-col justify-start items-center gap-6 overflow-hidden">
            {/* Logo */}
            <div className="inline-flex justify-center items-center gap-2.5 overflow-hidden">
              <Image
                src="/logoBlack.svg"
                alt="Penthrey Logo"
                width={120}
                height={40}
                className="h-10 w-auto"
              />
            </div>
            <div className="self-stretch flex flex-col justify-start items-center gap-2">
              <div className="w-full max-w-[452px] text-center justify-start text-zinc-800 text-3xl font-semibold font-['Manrope'] leading-10">
                Verify Your Email
              </div>
              <div className="w-full max-w-[452px] text-center justify-start text-zinc-500 text-base font-normal font-['Manrope'] leading-normal">
                {isVerifying ? 'Verifying your email address...' : 'We are processing your email verification.'}
              </div>
            </div>
          </div>

          {/* Verification Status */}
          {isVerifying && (
            <div className="self-stretch p-4 bg-blue-50 rounded-lg outline outline-1 outline-offset-[-1px] outline-blue-300 inline-flex justify-start items-center gap-3">
              <div className="w-5 h-5 animate-spin rounded-full border-2 border-blue-600 border-t-transparent" />
              <div className="flex-1 text-blue-700 text-sm font-medium font-['Manrope'] leading-tight">
                Verifying your email address, please wait...
              </div>
            </div>
          )}

          {/* Error Alert */}
          {error && !isVerifying && (
            <div className="self-stretch p-4 bg-red-50 rounded-lg outline outline-1 outline-offset-[-1px] outline-red-300 inline-flex justify-start items-start gap-3">
              <div className="w-5 h-5 relative overflow-hidden">
                <svg className="w-full h-full text-red-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.25} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <div className="flex-1 inline-flex flex-col justify-start items-start gap-3">
                <div className="self-stretch flex flex-col justify-start items-start gap-1">
                  <div className="self-stretch justify-start text-red-700 text-sm font-medium font-['Manrope'] leading-tight">
                    Email Verification Failed
                  </div>
                  <div className="self-stretch justify-start text-red-700 text-sm font-normal font-['Manrope'] leading-tight">
                    {error}
                  </div>
                </div>
                {token && (
                  <button
                    onClick={handleRetry}
                    className="px-3 py-1.5 bg-red-100 rounded-md text-red-700 text-xs font-medium hover:bg-red-200 transition-colors duration-200"
                  >
                    Try Again
                  </button>
                )}
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

          {/* Help Section */}
          {!isVerifying && (
            <div className="self-stretch inline-flex flex-col justify-center items-center gap-4">
              <div className="text-center text-neutral-600 text-sm font-medium font-['Manrope'] leading-tight">
                Need help with verification?
              </div>
              <div className="flex flex-col gap-2 items-center">
                <Link href="/login" className="text-center justify-start text-teal-500 text-sm font-semibold font-['Manrope'] leading-tight hover:text-teal-600 transition-colors duration-200">
                  Back to Login
                </Link>
                <Link href="/signup" className="text-center justify-start text-teal-500 text-sm font-semibold font-['Manrope'] leading-tight hover:text-teal-600 transition-colors duration-200">
                  Create New Account
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
