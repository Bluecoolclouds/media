import { RegisterForm } from '@/components/auth/RegisterForm';

export const metadata = {
  title: 'Sign Up | Open Generative AI',
  description: 'Create your Open Generative AI account',
};

export default function RegisterPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <RegisterForm />
    </div>
  );
}
