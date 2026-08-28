import { Container } from '../../../components/ui/Container';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../../../components/ui/Card';
import { Input } from '../../../components/ui/Input';
import { Button } from '../../../components/ui/Button';
import { motion } from 'framer-motion';
import { Lock } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { useState } from 'react';
import { useSearchParams, NavLink, useNavigate } from 'react-router-dom';
import { ROUTES } from '../../../constants/routes';
import { auth } from '../../../config/firebase';
import { confirmPasswordReset } from 'firebase/auth';

export function ResetPassword() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('oobCode') || searchParams.get('token');
  const navigate = useNavigate();

  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const { register, handleSubmit, formState: { errors, isSubmitting }, watch } = useForm();
  
  const password = watch('password');

  const onSubmit = async (data: any) => {
    if (!token) {
      setErrorMsg('Invalid or missing reset token.');
      return;
    }
    try {
      setErrorMsg(null);
      setSuccessMsg(null);
      await confirmPasswordReset(auth, token, data.password);
      setSuccessMsg('Password reset successfully.');
      setTimeout(() => {
        navigate(ROUTES.LOGIN);
      }, 3000);
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to reset password.');
    }
  };

  return (
    <Container className="py-12 flex justify-center items-center min-h-[calc(100vh-8rem)]">
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md">
        <Card className="shadow-premium border-gray-100">
          <CardHeader className="text-center pb-6">
            <div className="mx-auto w-12 h-12 bg-brand-50 rounded-full flex items-center justify-center mb-4">
              <Lock className="h-6 w-6 text-brand-600" />
            </div>
            <CardTitle className="text-2xl font-bold tracking-tight">Set new password</CardTitle>
            <CardDescription>Your new password must be different from previously used passwords</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {errorMsg && (
              <div className="p-3 bg-red-50 border border-red-200 text-red-600 text-sm rounded-md">
                {errorMsg}
              </div>
            )}
            {successMsg && (
              <div className="p-3 bg-green-50 border border-green-200 text-green-700 text-sm rounded-md flex flex-col gap-2">
                <span>{successMsg}</span>
                <NavLink to={ROUTES.LOGIN} className="text-brand-700 font-medium hover:underline">
                  Go to login
                </NavLink>
              </div>
            )}
            {!successMsg && (
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div className="space-y-2">
                  <label htmlFor="password" className="text-sm font-medium text-gray-700">New Password</label>
                  <Input id="password" type="password" placeholder="••••••••" {...register('password', { required: true, minLength: 8 })} />
                  {errors.password && <span className="text-xs text-red-500">Password must be at least 8 characters</span>}
                  <p className="text-xs text-gray-500">Must be at least 8 characters long.</p>
                </div>
                <div className="space-y-2 pt-2">
                  <label htmlFor="confirm-password" className="text-sm font-medium text-gray-700">Confirm Password</label>
                  <Input id="confirm-password" type="password" placeholder="••••••••" {...register('confirmPassword', { 
                    required: true,
                    validate: value => value === password || 'Passwords do not match'
                  })} />
                  {errors.confirmPassword && <span className="text-xs text-red-500">{errors.confirmPassword.message as string}</span>}
                </div>
                <Button type="submit" className="w-full mt-6 shadow-sm" disabled={isSubmitting || !token}>
                  {isSubmitting ? 'Resetting...' : 'Reset Password'}
                </Button>
                {!token && (
                  <p className="text-xs text-red-500 text-center mt-2">Missing reset token in URL.</p>
                )}
              </form>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </Container>
  );
}