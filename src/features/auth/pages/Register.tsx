import { Container } from '../../../components/ui/Container';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '../../../components/ui/Card';
import { Input } from '../../../components/ui/Input';
import { Button } from '../../../components/ui/Button';
import { NavLink } from 'react-router-dom';
import { ROUTES } from '../../../constants/routes';
import { motion } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { useAuth } from '../hooks/useAuth';
import { useState } from 'react';
import { auth } from '../../../config/firebase';
import { sendEmailVerification } from 'firebase/auth';

export function Register() {
  const { register: registerAuth } = useAuth();
  const [authError, setAuthError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm();

  const onSubmit = async (data: any) => {
    try {
      setAuthError(null);
      await registerAuth(data);
      
      if (auth.currentUser) {
        await sendEmailVerification(auth.currentUser);
      }
      
      setSuccessMsg("Account created successfully. Please check your inbox and verify your email address to get started.");
    } catch (err: any) {
      setAuthError(err.message || 'Registration failed');
    }
  };

  return (
    <Container className="py-12 flex justify-center items-center min-h-[calc(100vh-8rem)]">
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md">
        <Card className="shadow-premium border-gray-100">
          <CardHeader className="text-center pb-6">
            <CardTitle className="text-2xl font-bold tracking-tight">Create an account</CardTitle>
            <CardDescription>Start preparing for your next interview</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {authError && (
              <div className="p-3 bg-red-50 border border-red-200 text-red-600 text-sm rounded-md">
                {authError}
              </div>
            )}
            {successMsg && (
              <div className="p-3 bg-green-50 border border-green-200 text-green-700 text-sm rounded-md">
                {successMsg}
              </div>
            )}
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label htmlFor="firstName" className="text-sm font-medium text-gray-700">First name</label>
                  <Input id="firstName" placeholder="John" {...register('firstName', { required: true })} />
                  {errors.firstName && <span className="text-xs text-red-500">First name is required</span>}
                </div>
                <div className="space-y-2">
                  <label htmlFor="lastName" className="text-sm font-medium text-gray-700">Last name</label>
                  <Input id="lastName" placeholder="Doe" {...register('lastName', { required: true })} />
                  {errors.lastName && <span className="text-xs text-red-500">Last name is required</span>}
                </div>
              </div>
              <div className="space-y-2">
                <label htmlFor="email" className="text-sm font-medium text-gray-700">Email address</label>
                <Input id="email" type="email" placeholder="name@university.edu" {...register('email', { required: true })} />
                {errors.email && <span className="text-xs text-red-500">Email is required</span>}
              </div>
              <div className="space-y-2">
                <label htmlFor="password" className="text-sm font-medium text-gray-700">Password</label>
                <Input id="password" type="password" placeholder="••••••••" {...register('password', { required: true, minLength: 8 })} />
                {errors.password && <span className="text-xs text-red-500">Password must be at least 8 characters</span>}
                <p className="text-xs text-gray-500">Must be at least 8 characters long.</p>
              </div>
              <Button type="submit" className="w-full mt-6 shadow-sm" disabled={isSubmitting}>
                {isSubmitting ? 'Creating Account...' : 'Create Account'}
              </Button>
            </form>
            
            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-gray-200" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-white px-2 text-gray-500 font-medium">Or continue with</span>
              </div>
            </div>
            
            <Button variant="outline" className="w-full font-medium text-gray-700">
              <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
              </svg>
              Google
            </Button>
          </CardContent>
          <CardFooter className="flex flex-col space-y-4 border-t border-gray-50 pt-6">
            <p className="text-sm text-center text-gray-600">
              Already have an account?{' '}
              <NavLink to={ROUTES.LOGIN} className="font-semibold text-brand-600 hover:text-brand-700">
                Sign in
              </NavLink>
            </p>
            <p className="text-xs text-center text-gray-500">
              By clicking Create Account, you agree to our{' '}
              <NavLink to={ROUTES.TERMS} className="underline hover:text-gray-800">Terms of Service</NavLink> and{' '}
              <NavLink to={ROUTES.PRIVACY_POLICY} className="underline hover:text-gray-800">Privacy Policy</NavLink>.
            </p>
          </CardFooter>
        </Card>
      </motion.div>
    </Container>
  );
}