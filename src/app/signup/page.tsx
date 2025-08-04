import { Metadata } from 'next';
import { Suspense } from 'react';
import MultiStepSignupForm from '@/components/MultiStepSignupForm';

export const metadata: Metadata = {
  title: 'Sign Up - Penthry | Get Started Today',
  description: 'Join Penthry and streamline your business operations. Create your account to access powerful tools for team collaboration and productivity.',
  keywords: 'sign up, create account, register, join Penthry, business operations, team collaboration',
};

export default function Signup() {
  return (
    <Suspense fallback={<div className="flex justify-center items-center min-h-screen">Loading...</div>}>
      <MultiStepSignupForm />
    </Suspense>
  );
} 