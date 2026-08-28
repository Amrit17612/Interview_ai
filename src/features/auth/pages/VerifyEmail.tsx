import { Container } from '../../../components/ui/Container';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import { NavLink, useSearchParams, useNavigate } from 'react-router-dom';
import { ROUTES } from '../../../constants/routes';
import { motion } from 'framer-motion';
import { MailCheck, CheckCircle, XCircle } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { Input } from '../../../components/ui/Input';
import { auth } from '../../../config/firebase';
import { applyActionCode, sendEmailVerification } from 'firebase/auth';

export function VerifyEmail() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('oobCode') || searchParams.get('token');
  const mode = searchParams.get('mode');
  const navigate = useNavigate();
  const { user, refreshUser } = useAuth();
  
  const [status, setStatus] = useState<'idle' | 'verifying' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState<string | null>(null);
  const [resendEmail, setResendEmail] = useState(user?.email || '');
  const [resendStatus, setResendStatus] = useState<'idle' | 'sending' | 'success' | 'error'>('idle');

  useEffect(() => {
    // Make sure we are verifying email if mode is present, or just trust the token if no mode (legacy/custom)
    if (token && (!mode || mode === 'verifyEmail')) {
      const verifyToken = async () => {
        setStatus('verifying');
        try {
          // Attempt Firebase verification
          await applyActionCode(auth, token);
          setStatus('success');
          setMessage('Email verified successfully!');
          
          // Force reload the current user so emailVerified is true
          if (auth.currentUser) {
            await auth.currentUser.reload();
          }
          await refreshUser(); // sync backend session
          setTimeout(() => {
            navigate(ROUTES.DASHBOARD);
          }, 3000);
        } catch (err: any) {
          setStatus('error');
          setMessage(err.message || 'Verification failed or token expired.');
        }
      };
      verifyToken();
    }
  }, [token, mode, navigate, refreshUser]);

  const handleResend = async () => {
    if (!resendEmail) return;
    setResendStatus('sending');
    try {
      if (auth.currentUser && auth.currentUser.email === resendEmail) {
        await sendEmailVerification(auth.currentUser);
      } else {
        // Technically we can't easily resend an email verification to an arbitrary email in Firebase Client SDK 
        // if they are not logged in. If they are not logged in, we throw error or ask them to login.
        throw new Error('Please login to resend verification.');
      }
      setResendStatus('success');
    } catch (err: any) {
      setResendStatus('error');
    }
  };

  if (token && (status === 'verifying' || status === 'success' || status === 'error')) {
    return (
      <Container className="py-12 flex justify-center items-center min-h-[calc(100vh-8rem)]">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md">
          <Card className="shadow-premium border-gray-100">
            <CardHeader className="text-center pb-2">
              <div className={`mx-auto w-12 h-12 rounded-full flex items-center justify-center mb-4 ${status === 'success' ? 'bg-green-50' : status === 'error' ? 'bg-red-50' : 'bg-brand-50'}`}>
                {status === 'success' ? <CheckCircle className="h-6 w-6 text-green-600" /> : status === 'error' ? <XCircle className="h-6 w-6 text-red-600" /> : <MailCheck className="h-6 w-6 text-brand-600" />}
              </div>
              <CardTitle className="text-2xl font-bold tracking-tight">
                {status === 'success' ? 'Email Verified' : status === 'error' ? 'Verification Failed' : 'Verifying Email...'}
              </CardTitle>
              <CardDescription className="pt-2 text-base">
                {message || 'Please wait while we verify your email address.'}
              </CardDescription>
            </CardHeader>
            {status === 'success' && (
              <CardContent className="text-center pt-4">
                <p className="text-sm text-gray-600">Redirecting you...</p>
              </CardContent>
            )}
            {status === 'error' && (
              <CardFooter className="flex justify-center border-t border-gray-50 pt-6">
                <NavLink to={ROUTES.LOGIN} className="text-sm font-semibold text-brand-600 hover:text-brand-700 flex items-center">
                  Back to log in
                </NavLink>
              </CardFooter>
            )}
          </Card>
        </motion.div>
      </Container>
    );
  }

  return (
    <Container className="py-12 flex justify-center items-center min-h-[calc(100vh-8rem)]">
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md">
        <Card className="shadow-premium border-gray-100">
          <CardHeader className="text-center pb-2">
            <div className="mx-auto w-12 h-12 bg-brand-50 rounded-full flex items-center justify-center mb-4">
              <MailCheck className="h-6 w-6 text-brand-600" />
            </div>
            <CardTitle className="text-2xl font-bold tracking-tight">Check your email</CardTitle>
            <CardDescription className="pt-2 text-base">
              We sent a verification link to your email.
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center pt-4 space-y-4">
            <Button className="w-full shadow-sm mb-2" onClick={() => window.open('https://mail.google.com', '_blank')}>Open Email App</Button>
            
            <div className="text-left space-y-2">
              <label htmlFor="resend-email" className="text-sm font-medium text-gray-700">Need another link?</label>
              <div className="flex gap-2">
                <Input id="resend-email" type="email" placeholder="Enter your email" value={resendEmail} onChange={e => setResendEmail(e.target.value)} />
                <Button variant="outline" onClick={handleResend} disabled={resendStatus === 'sending' || !resendEmail}>
                  {resendStatus === 'sending' ? 'Sending' : 'Resend'}
                </Button>
              </div>
              {resendStatus === 'success' && <p className="text-xs text-green-600">Verification link sent!</p>}
              {resendStatus === 'error' && <p className="text-xs text-red-600">Failed to resend. Try again.</p>}
            </div>
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