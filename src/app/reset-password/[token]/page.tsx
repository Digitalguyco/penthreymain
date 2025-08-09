import type { Metadata } from 'next';
import PasswordResetConfirmForm from '@/components/PasswordResetConfirmForm';

export const metadata: Metadata = {
  title: 'Reset Password - Penthry | Create New Password',
  description:
    'Create a new secure password for your Penthry account using your password reset token.',
  keywords: 'reset password, new password, password confirmation, Penthry',
};

export default async function ResetPasswordPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;
  return <PasswordResetConfirmForm token={token} />;
}