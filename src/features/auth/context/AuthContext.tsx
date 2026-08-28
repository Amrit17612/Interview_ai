import { createContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import { authService } from '../../../services/auth.service';
import type { AuthUser, AuthResponse } from '../../../services/auth.service';
import { auth } from '../../../config/firebase';
import { onAuthStateChanged, signOut, createUserWithEmailAndPassword, signInWithEmailAndPassword, sendEmailVerification } from 'firebase/auth';

interface AuthContextType {
  user: AuthUser | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  error: string | null;
  login: (credentials: any) => Promise<AuthResponse>;
  logout: () => Promise<void>;
  register: (data: any) => Promise<AuthResponse>;
  refreshUser: () => Promise<void>;
  resendVerificationEmail: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const isAuthenticated = user !== null;

  const refreshUser = async () => {
    try {
      if (auth.currentUser) {
        await auth.currentUser.reload();
      }
      const response = await authService.getCurrentUser();
      if (response.success && response.user) {
        if (!response.user.emailVerified) {
          setUser(null);
        } else {
          setUser(response.user);
        }
      } else {
        setUser(null);
      }
    } catch {
      setUser(null);
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setIsLoading(true);
      if (firebaseUser) {
        // Fetch MongoDB user data using the valid Bearer token now attached via interceptor
        await refreshUser();
      } else {
        setUser(null);
      }
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const login = async (credentials: any) => {
    try {
      setError(null);
      // Firebase Login
      await signInWithEmailAndPassword(auth, credentials.email, credentials.password);
      // Force token refresh and get token
      const token = await auth.currentUser?.getIdToken(true);
      
      // We still call backend /login to sync verification state or handle any legacy logic
      // But the main auth is Firebase
      const response = await authService.login(token as string);
      if (response.success && response.user) {
        if (!response.user.emailVerified) {
          throw new Error('Please verify your email address before logging in');
        }
        setUser(response.user);
      }
      return response;
    } catch (err: any) {
      setError(err.message || 'Login failed');
      throw err;
    }
  };

  const register = async (data: any) => {
    try {
      setError(null);
      // 1. Create in Firebase
      const userCredential = await createUserWithEmailAndPassword(auth, data.email, data.password);
      
      // 2. Send Verification Email
      try {
        await sendEmailVerification(userCredential.user);
      } catch (emailErr: any) {
        console.error('Failed to send verification email:', emailErr.code, emailErr.message);
        throw new Error(`Account created, but verification email failed: ${emailErr.message}`);
      }
      
      // 3. Force token refresh and get token
      const token = await userCredential.user.getIdToken(true);

      // 4. Sync to Mongo DB via backend /register
      const response = await authService.register({
        firstName: data.firstName,
        lastName: data.lastName
      }, token);

      if (response.success && response.user) {
         await refreshUser();
      }
      return response;
    } catch (err: any) {
      // Clean up firebase user if backend sync fails? Not strictly necessary, but good practice.
      // For now, just throw
      setError(err.message || 'Registration failed');
      throw err;
    }
  };

  const resendVerificationEmail = async () => {
    try {
      setError(null);
      if (auth.currentUser) {
        await sendEmailVerification(auth.currentUser);
      } else {
        throw new Error('No authenticated user found to send verification email.');
      }
    } catch (err: any) {
      console.error('Failed to resend verification email:', err.code, err.message);
      setError(err.message || 'Failed to resend verification email');
      throw err;
    }
  };

  const logout = async () => {
    try {
      await authService.logout();
    } catch (err) {
      console.warn('Backend logout failed', err);
    } finally {
      await signOut(auth);
      setUser(null);
    }
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, isAuthenticated, error, login, logout, register, refreshUser, resendVerificationEmail }}>
      {isLoading ? (
        <div className="flex h-screen w-full items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-200 border-t-gray-900"></div>
        </div>
      ) : (
        children
      )}
    </AuthContext.Provider>
  );
};

export default AuthContext;
