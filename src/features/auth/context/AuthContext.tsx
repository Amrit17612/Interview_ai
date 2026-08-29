import { createContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import { authService } from '../../../services/auth.service';
import type { AuthUser, AuthResponse } from '../../../services/auth.service';
import { auth } from '../../../config/firebase';
import { onAuthStateChanged, signOut, createUserWithEmailAndPassword, signInWithEmailAndPassword, sendEmailVerification, GoogleAuthProvider, signInWithPopup } from 'firebase/auth';

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
  googleAuth: () => Promise<void>;
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
    let mounted = true;
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (!mounted) return;
      setIsLoading(true);
      if (firebaseUser) {
        await refreshUser();
      } else {
        setUser(null);
      }
      if (mounted) {
        setIsLoading(false);
      }
    });

    return () => {
      mounted = false;
      unsubscribe();
    };
  }, []);

  const login = async (credentials: any) => {
    const requestId = crypto.randomUUID();
    console.log(`[LOGIN] requestId: ${requestId}`);
    try {
      setError(null);
      
      const userCredential = await signInWithEmailAndPassword(auth, credentials.email, credentials.password);
      const firebaseUser = userCredential.user;
      
      console.log(`[LOGIN] Firebase UID exists: ${Boolean(firebaseUser?.uid)}`);
      
      await firebaseUser.reload();
      const firebaseToken = await firebaseUser.getIdToken(true);
      
      console.log(`[LOGIN] token exists: ${Boolean(firebaseToken)}`);
      
      if (typeof firebaseToken !== "string" || firebaseToken.length === 0) {
        throw new Error("Firebase token generation failed");
      }
      
      console.log(`[LOGIN] token length: ${firebaseToken.length}`);
      
      const response = await authService.login(firebaseToken, requestId);
      
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
    const requestId = crypto.randomUUID();
    console.log(`[REGISTER] requestId: ${requestId}`);
    try {
      setError(null);
      
      const userCredential = await createUserWithEmailAndPassword(auth, data.email, data.password);
      const firebaseUser = userCredential.user;
      
      console.log(`[REGISTER] Firebase UID exists: ${Boolean(firebaseUser?.uid)}`);
      
      try {
        await sendEmailVerification(firebaseUser);
      } catch (emailErr: any) {
        console.error('Failed to send verification email:', emailErr.code, emailErr.message);
        throw new Error(`Account created, but verification email failed: ${emailErr.message}`);
      }
      
      const firebaseToken = await firebaseUser.getIdToken(true);
      
      console.log(`[REGISTER] token exists: ${Boolean(firebaseToken)}`);
      
      if (typeof firebaseToken !== "string" || firebaseToken.length === 0) {
        throw new Error("Firebase token generation failed");
      }
      
      console.log(`[REGISTER] token length: ${firebaseToken.length}`);
      
      const payload = {
        firstName: data.firstName,
        lastName: data.lastName
      };
      
      const response = await authService.register(payload, firebaseToken, requestId);

      if (response.success && response.user) {
         await refreshUser();
      }
      return response;
    } catch (err: any) {
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

  const googleAuth = async () => {
    console.log("[GOOGLE AUTH] Button handler started");

    try {
      setError(null);
      setIsLoading(true);

      console.log("[GOOGLE AUTH] Diagnosing environment:");
      console.log("[GOOGLE AUTH] window.origin:", window.location.origin);
      console.log("[GOOGLE AUTH] Firebase AuthDomain:", auth.config.authDomain || "NOT_SET (Check VITE_FIREBASE_AUTH_DOMAIN)");

      const provider = new GoogleAuthProvider();
      console.log("[GOOGLE AUTH] Opening Google popup...");

      const result = await signInWithPopup(auth, provider);
      const firebaseUser = result.user;

      console.log("[GOOGLE AUTH] Firebase user received", {
        uidPresent: !!firebaseUser?.uid,
        emailPresent: !!firebaseUser?.email
      });

      const firebaseToken = await firebaseUser.getIdToken(true);

      if (!firebaseToken) {
        throw new Error("Firebase token was not generated");
      }

      console.log("[GOOGLE AUTH] Firebase token generated successfully");

      const response = await authService.googleAuth(firebaseToken);
      
      if (response.success && response.user) {
         await refreshUser();
      }
    } catch (error: any) {
      console.error("[GOOGLE AUTH] Authentication failed:", error?.code, error?.message, error);
      setError(`[${error?.code || 'auth/error'}] ${error?.message || "Google authentication failed"}`);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, isAuthenticated, error, login, logout, register, refreshUser, resendVerificationEmail, googleAuth }}>
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
