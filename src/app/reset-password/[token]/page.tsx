import { Metadata } from 'next';
import PasswordResetConfirmForm from '@/components/PasswordResetConfirmForm';

export const metadata: Metadata = {
  title: 'Reset Password - Penthry | Create New Password',
  description: 'Create a new secure password for your Penthry account using your password reset token.',
  keywords: 'reset password, new password, password confirmation, Penthry',
};

interface PageProps {
  params: {
    token: string;
  };
}

export default function ResetPasswordPage({ params }: PageProps) {
  return <PasswordResetConfirmForm token={params.token} />;
}
