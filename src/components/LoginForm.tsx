'use client';
import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';

export default function LoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const router = useRouter();
  const { login, error, clearError, isAuthenticated } = useAuth();

  useEffect(() => {

    if (isAuthenticated) {
      router.push('/dashboard');
    }
   
  }, [isAuthenticated, router])
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting ) return;
    
    setIsSubmitting(true);
    clearError();
    
    try {
      const success = await login(email, password);
      console.log(success)
      if (success) {
        // Redirect to dashboard after successful login
        router.push('/dashboard');
      }
    } catch (error) {
      console.error('Login error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-white flex justify-start items-center overflow-hidden">
      {/* Left Image Section - Only visible on large screens */}
      <div className="hidden lg:flex flex-1 h-screen relative">
        <div className="absolute inset-0 bg-indigo-300/25" />
        <Image
          src="/images/login.jpg"
          alt="Login background"
          fill
          className="object-cover"
        />
        <div className="absolute inset-0 bg-indigo-300/25" />
      </div>

      {/* Right Form Section */}
      <div className="w-full lg:flex-1 self-stretch px-10 py-12 inline-flex flex-col justify-start items-center gap-12 overflow-hidden">
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
          <Link href="/signup" className="text-center justify-start text-teal-500 text-sm font-semibold font-['Manrope'] leading-tight hover:text-teal-600 transition-colors duration-200">
            Get Started
          </Link>
        </div>

        {/* Main Form Container */}
        <div className="w-full max-w-[500px] p-6 flex flex-col justify-start items-start gap-14 overflow-hidden">
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
                Login to Penthry
              </div>
              <div className="w-full max-w-[452px] text-center justify-start text-zinc-500 text-base font-normal font-['Manrope'] leading-normal">
                Welcome back. Let&apos;s get you into your workspace.
              </div>
            </div>
          </div>

          {/* Error Display */}
          {error && (
            <div className="w-full max-w-[452px] p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-600 text-sm font-medium">{error}</p>
            </div>
          )}

          {/* Form Section */}
          <form onSubmit={handleSubmit} className="self-stretch  flex flex-col justify-start items-center gap-8">
            <div className="w-full max-w-[452px] flex-1 flex-col justify-start items-center gap-4">
              {/* Input Fields */}
              <div className="flex flex-col justify-start items-start gap-6">
                {/* Email Input */}
                <div className="w-full max-w-[452px] flex flex-col justify-start items-start gap-1.5">
                  <div className="self-stretch flex flex-col justify-start items-start gap-1.5">
                    <div className="self-stretch px-3.5 py-2.5 bg-white rounded-lg shadow-[0px_1px_2px_0px_rgba(16,24,40,0.05)] outline outline-offset-[-1px] outline-gray-400 inline-flex justify-start items-center gap-2 overflow-hidden focus-within:outline-teal-500 focus-within:outline-2 transition-all duration-200">
                      <div className="flex-1 flex justify-start items-center gap-2">
                        <input
                          type="email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder="Enter your work email"
                          required
                          className="flex-1 text-zinc-800 text-base font-normal font-['Manrope'] leading-normal bg-transparent border-none outline-none placeholder:text-zinc-500"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Password Input */}
                <div className="w-full max-w-[452px] flex flex-col justify-start items-start gap-1.5">
                  <div className="self-stretch  flex flex-col justify-start items-start gap-1.5">
                    <div className="self-stretch px-3.5 py-2.5 rounded-lg shadow-[0px_1px_2px_0px_rgba(16,24,40,0.05)] outline outline-offset-[-1px] outline-gray-400 inline-flex justify-start items-center gap-2 overflow-hidden focus-within:outline-teal-500 focus-within:outline-2 transition-all duration-200">
                      <div className="flex-1 flex justify-start items-center gap-2">
                        <input
                          type={showPassword ? "text" : "password"}
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          placeholder="Enter your password"
                          required
                          className="flex-1 text-zinc-800 text-base font-normal font-['Manrope'] w-full leading-normal bg-transparent border-none outline-none placeholder:text-zinc-500"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="w-5 h-5 relative overflow-hidden text-zinc-500 hover:text-zinc-700 transition-colors duration-200"
                        >
                          {showPassword ? (
                            <svg className="w-full h-full" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                            </svg>
                          ) : (
                            <svg className="w-full h-full" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" />
                            </svg>
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Submit Button and Forgot Password */}
              <div className="self-stretch flex flex-col justify-start items-start mt-8 gap-4">
                <button
                  type="submit"
                  disabled={isSubmitting || !email || !password}
                  className={`w-full max-w-[452px] h-11 px-6 py-3 rounded-lg shadow-[0px_2px_4px_0px_rgba(0,0,0,0.10)] inline-flex justify-center items-center gap-2 overflow-hidden transition-colors duration-200 ${
                    isSubmitting || !email || !password
                      ? 'bg-gray-300 cursor-not-allowed'
                      : 'bg-teal-400 hover:bg-teal-500'
                  }`}
                >
                  {(isSubmitting) ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-zinc-800"></div>
                      <div className="justify-start text-zinc-800 text-sm font-medium font-['Manrope']">Signing in...</div>
                    </>
                  ) : (
                    <div className="justify-start text-zinc-800 text-sm font-medium font-['Manrope']">Let&apos;s Go</div>
                  )}
                </button>
                <div className="self-stretch inline-flex justify-center items-center gap-2.5">
                  <Link href="/forgot-password" className="justify-start text-teal-500 text-sm font-medium font-['Manrope'] hover:text-teal-600 transition-colors duration-200">
                    Forgot your password?
                  </Link>
                </div>
              </div>
            </div>

            {/* Sign Up Link */}
            <div className="self-stretch inline-flex justify-center items-center gap-2">
              <div className="text-center justify-start text-neutral-600 text-sm font-medium font-['Manrope'] leading-tight">Don&apos;t have an account?</div>
              <Link href="/signup" className="text-center justify-start text-teal-500 text-sm font-semibold font-['Manrope'] leading-tight hover:text-teal-600 transition-colors duration-200">
                Sign up instead
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