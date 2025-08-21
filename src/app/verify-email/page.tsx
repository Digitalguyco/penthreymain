import type { Metadata } from 'next';
import { Suspense } from 'react';
import EmailVerificationForm from '@/components/EmailVerificationForm';

export const metadata: Metadata = {
  title: 'Verify Email - Penthrey | Confirm Your Account',
  description:
    'Verify your email address to complete your Penthrey account registration and access all features.',
  keywords: 'email verification, confirm account, verify email, Penthrey',
};

function EmailVerificationFallback() {
  return (
    <div className="min-h-screen bg-white flex items-center justify-center">
      <div className="w-5 h-5 animate-spin rounded-full border-2 border-teal-600 border-t-transparent" />
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={<EmailVerificationFallback />}>
      <EmailVerificationForm />
    </Suspense>
  );
}
