import { Container } from '../../../components/ui/Container';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '../../../components/ui/Card';
import { Input } from '../../../components/ui/Input';
import { Button } from '../../../components/ui/Button';
import { NavLink } from 'react-router-dom';
import { ROUTES } from '../../../constants/routes';
import { motion } from 'framer-motion';
import { KeyRound } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { useState } from 'react';
import { auth } from '../../../config/firebase';
import { sendPasswordResetEmail } from 'firebase/auth';

export function ForgotPassword() {
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm();

  const onSubmit = async (data: any) => {
    try {
      setErrorMsg(null);
      setSuccessMsg(null);
      await sendPasswordResetEmail(auth, data.email);
      setSuccessMsg('If an account exists for this email, a password reset link has been sent.');
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to request password reset. Please try again.');
    }
  };

  return (
    <Container className="py-12 flex justify-center items-center min-h-[calc(100vh-8rem)]">
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md">
        <Card className="shadow-premium border-gray-100">
          <CardHeader className="text-center pb-6">
            <div className="mx-auto w-12 h-12 bg-brand-50 rounded-full flex items-center justify-center mb-4">
              <KeyRound className="h-6 w-6 text-brand-600" />
            </div>
            <CardTitle className="text-2xl font-bold tracking-tight">Forgot password</CardTitle>
            <CardDescription>Enter your email and we'll send you a reset link</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {errorMsg && (
              <div className="p-3 bg-red-50 border border-red-200 text-red-600 text-sm rounded-md">
                {errorMsg}
              </div>
            )}
            {successMsg && (
              <div className="p-3 bg-green-50 border border-green-200 text-green-700 text-sm rounded-md">
                {successMsg}
              </div>
            )}
            {!successMsg && (
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div className="space-y-2">
                  <label htmlFor="email" className="text-sm font-medium text-gray-700">Email address</label>
                  <Input id="email" type="email" placeholder="name@university.edu" {...register('email', { required: true })} />
                  {errors.email && <span className="text-xs text-red-500">Email is required</span>}
                </div>
                <Button type="submit" className="w-full mt-2 shadow-sm" disabled={isSubmitting}>
                  {isSubmitting ? 'Sending...' : 'Send Reset Link'}
                </Button>
              </form>
            )}
          </CardContent>
          <CardFooter className="flex justify-center border-t border-gray-50 pt-6">
            <NavLink to={ROUTES.LOGIN} className="text-sm font-semibold text-brand-600 hover:text-brand-700 flex items-center">
              <svg className="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Back to log in
            </NavLink>
          </CardFooter>
        </Card>
      </motion.div>
    </Container>
  );
}