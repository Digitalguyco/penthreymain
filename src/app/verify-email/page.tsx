import type { Metadata } from 'next';
import EmailVerificationForm from '@/components/EmailVerificationForm';

export const metadata: Metadata = {
  title: 'Verify Email - Penthrey | Confirm Your Account',
  description:
    'Verify your email address to complete your Penthrey account registration and access all features.',
  keywords: 'email verification, confirm account, verify email, Penthrey',
};

export default function VerifyEmailPage() {
  return <EmailVerificationForm />;
}
