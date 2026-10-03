import { Suspense } from 'react';
import { LoginForm } from '@/components/auth/LoginForm';

export const metadata = {
  title: 'Sign In | Open Generative AI',
  description: 'Sign in to your Open Generative AI account',
};

function LoginContent() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#050505] px-4">
      <Suspense fallback={<div className="text-white">Loading...</div>}>
        <LoginForm />
      </Suspense>
    </div>
  );
}

export default function LoginPage() {
  return <LoginContent />;
}
