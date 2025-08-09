import { Metadata } from 'next';
import LoginForm from '@/components/LoginForm';

export const metadata: Metadata = {
  title: 'Login - Penthry | Access Your Workspace',
  description: 'Login to your Penthry account and access your business operations workspace. Secure authentication for team collaboration.',
  keywords: 'login, sign in, authentication, workspace access, Penthry',
};


export default function Login() {

  return <LoginForm />;
} 