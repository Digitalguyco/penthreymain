'use client';
import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';

interface PasswordRequirement {
  id: string;
  text: string;
  met: boolean;
}

export default function CreatePasswordForm() {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [requirements, setRequirements] = useState<PasswordRequirement[]>([
    { id: 'length', text: 'Use at least 8 characters – Longer passwords are harder to crack.', met: false },
    { id: 'case', text: 'Include a mix of uppercase & lowercase letters – It adds complexity.', met: false },
    { id: 'number', text: 'Add at least one number for extra strength.', met: false },
    { id: 'special', text: 'Use a special character – Like @, #, $, or ! for extra strength.', met: false },
  ]);

  useEffect(() => {
    const newRequirements = requirements.map(req => {
      switch (req.id) {
        case 'length':
          return { ...req, met: password.length >= 8 };
        case 'case':
          return { ...req, met: /[a-z]/.test(password) && /[A-Z]/.test(password) };
        case 'number':
          return { ...req, met: /\d/.test(password) };
        case 'special':
          return { ...req, met: /[!@#$%^&*(),.?":{}|<>]/.test(password) };
        default:
          return req;
      }
    });
    setRequirements(newRequirements);
  }, [password, requirements]);

  const allRequirementsMet = requirements.every(req => req.met);
  const passwordsMatch = password === confirmPassword && confirmPassword.length > 0;
  const canSubmit = allRequirementsMet && passwordsMatch;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (canSubmit) {
      console.log('Password created successfully:', { password, confirmPassword });
      // Handle password creation logic here
    }
  };

  const RequirementItem = ({ requirement }: { requirement: PasswordRequirement }) => (
    <div className="self-stretch inline-flex justify-start items-center gap-2">
      <div className={`p-1 rounded-[999px] flex justify-center items-center gap-2.5 overflow-hidden ${
        requirement.met ? 'bg-green-100' : 'bg-zinc-100'
      }`}>
        <div className="w-3.5 h-3.5 relative overflow-hidden">
          {requirement.met ? (
            <svg className="w-full h-full text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          ) : (
            <svg className="w-full h-full text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" />
            </svg>
          )}
        </div>
      </div>
      <div className={`text-xs font-medium font-['Manrope'] leading-none ${
        requirement.met ? 'text-green-600' : 'text-zinc-500'
      }`}>
        {requirement.text}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-white flex justify-center items-center overflow-hidden">
      {/* Main Container */}
      <div className="self-stretch px-10 py-12 inline-flex flex-col justify-start items-center gap-12 overflow-hidden">
        {/* Header Navigation */}
        <div className="self-stretch py-1 inline-flex justify-between items-start overflow-hidden">
          <Link href="/forgot-password" className="rounded-lg flex justify-center items-center gap-1 overflow-hidden hover:gap-2 transition-all duration-200">
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
                Secure Your Account
              </div>
              <div className="w-full max-w-[452px] text-center justify-start text-zinc-500 text-base font-normal font-['Manrope'] leading-normal">
                Create a strong password to protect your data.
              </div>
            </div>
          </div>

          {/* Form Section */}
          <form onSubmit={handleSubmit} className="self-stretch flex flex-col justify-start items-center gap-8">
            <div className="w-full max-w-[452px] flex flex-col justify-start items-center gap-6">
              {/* New Password Input */}
              <div className="self-stretch flex flex-col justify-start items-start gap-1.5">
                <div className="self-stretch flex flex-col justify-start items-start gap-1.5">
                  <div className="self-stretch px-3.5 py-2.5 bg-white rounded-lg shadow-[0px_1px_2px_0px_rgba(16,24,40,0.05)] outline outline-1 outline-offset-[-1px] outline-gray-400 inline-flex justify-start items-center gap-2 overflow-hidden focus-within:outline-teal-500 focus-within:outline-2 transition-all duration-200">
                    <div className="flex-1 flex justify-start items-center gap-2">
                      <input
                        type={showPassword ? "text" : "password"}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="New Password"
                        required
                        className="flex-1 text-zinc-800 text-base font-normal font-['Manrope'] leading-normal bg-transparent border-none outline-none placeholder:text-zinc-500"
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

              {/* Password Requirements */}
              <div className="self-stretch flex flex-col justify-start items-start gap-3">
                {requirements.map((requirement) => (
                  <RequirementItem key={requirement.id} requirement={requirement} />
                ))}
              </div>

              {/* Confirm Password Input */}
              <div className="self-stretch flex flex-col justify-start items-start gap-1.5">
                <div className="self-stretch flex flex-col justify-start items-start gap-1.5">
                  <div className={`self-stretch px-3.5 py-2.5 bg-white rounded-lg shadow-[0px_1px_2px_0px_rgba(16,24,40,0.05)] outline outline-1 outline-offset-[-1px] inline-flex justify-start items-center gap-2 overflow-hidden transition-all duration-200 ${
                    confirmPassword.length > 0 && !passwordsMatch
                      ? 'outline-red-400 focus-within:outline-red-500 focus-within:outline-2'
                      : 'outline-gray-400 focus-within:outline-teal-500 focus-within:outline-2'
                  }`}>
                    <div className="flex-1 flex justify-start items-center gap-2">
                      <input
                        type={showConfirmPassword ? "text" : "password"}
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="Confirm Password"
                        required
                        className="flex-1 text-zinc-800 text-base font-normal font-['Manrope'] leading-normal bg-transparent border-none outline-none placeholder:text-zinc-500"
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="w-5 h-5 relative overflow-hidden text-zinc-500 hover:text-zinc-700 transition-colors duration-200"
                      >
                        {showConfirmPassword ? (
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
                  {confirmPassword.length > 0 && !passwordsMatch && (
                    <div className="text-red-500 text-xs font-medium font-['Manrope'] leading-none">
                      Passwords do not match
                    </div>
                  )}
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={!canSubmit}
                className={`self-stretch px-6 py-3 rounded-lg shadow-[0px_2px_4px_0px_rgba(0,0,0,0.10)] inline-flex justify-center items-center gap-2 overflow-hidden transition-colors duration-200 ${
                  canSubmit
                    ? 'bg-teal-400 hover:bg-teal-500 text-zinc-800'
                    : 'bg-teal-50 text-gray-400 cursor-not-allowed'
                }`}
              >
                <div className="justify-start text-sm font-medium font-['Manrope']">
                  Set Password
                </div>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
} 