import { createContext, useState, useEffect, useRef } from 'react';
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
  googleAuth: () => Promise<AuthResponse>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const isAuthInProgress = useRef(false);

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
      console.log(`[AUTH STATE] callback fired`);
      console.log(`[AUTH STATE] Firebase user exists: ${!!firebaseUser}`);
      console.log(`[AUTH STATE] isAuthInProgress value: ${isAuthInProgress.current}`);
      
      if (!mounted) return;
      if (isAuthInProgress.current) {
        console.log("[AUTH CONTEXT] onAuthStateChanged ignored because manual auth is in progress");
        return;
      }
      
      console.log(`[AUTH STATE] loading before: ${isLoading}`);
      setIsLoading(true);
      
      if (firebaseUser) {
        console.log(`[AUTH STATE] /auth/me started`);
        await refreshUser();
        console.log(`[AUTH STATE] /auth/me finished`);
      } else {
        setUser(null);
      }
      
      if (mounted) {
        console.log(`[AUTH STATE] final context user: ${!!user}`);
        console.log(`[AUTH STATE] final loading: false`);
        setIsLoading(false);
      }
    });

    return () => {
      mounted = false;
      unsubscribe();
    };
  }, []);

  const login = async (credentials: any) => {
    isAuthInProgress.current = true;
    const requestId = crypto.randomUUID();
    console.log(`[AUTH FLOW] email login started, requestId: ${requestId}`);
    try {
      setError(null);
      
      const userCredential = await signInWithEmailAndPassword(auth, credentials.email, credentials.password);
      const firebaseUser = userCredential.user;
      
      console.log(`[AUTH FLOW] Firebase credential received`);
      
      await firebaseUser.reload();
      const firebaseToken = await firebaseUser.getIdToken(true);
      
      console.log(`[AUTH FLOW] token received`);
      
      if (typeof firebaseToken !== "string" || firebaseToken.length === 0) {
        throw new Error("Firebase token generation failed");
      }
      
      console.log(`[AUTH FLOW] backend login started`);
      const response = await authService.login(firebaseToken, requestId);
      console.log(`[AUTH FLOW] backend login response received`);
      
      if (response.success && response.user) {
        if (!response.user.emailVerified) {
          throw new Error('Please verify your email address before logging in');
        }
        console.log(`[AUTH FLOW] profile loaded`);
        setUser(response.user);
        console.log(`[AUTH FLOW] context state updated`);
      }
      console.log(`[AUTH FLOW] navigating`);
      return response;
    } catch (err: any) {
      console.error(`[AUTH FLOW] Error:`, err);
      setError(err.message || 'Login failed');
      throw err;
    } finally {
      isAuthInProgress.current = false;
    }
  };

  const register = async (data: any) => {
    isAuthInProgress.current = true;
    const requestId = crypto.randomUUID();
    console.log(`[AUTH FLOW] registration started, requestId: ${requestId}`);
    try {
      setError(null);
      
      const userCredential = await createUserWithEmailAndPassword(auth, data.email, data.password);
      const firebaseUser = userCredential.user;
      
      console.log(`[AUTH FLOW] Firebase user created`);
      
      try {
        await sendEmailVerification(firebaseUser);
        console.log(`[AUTH FLOW] verification sent`);
      } catch (emailErr: any) {
        console.error('Failed to send verification email:', emailErr.code, emailErr.message);
        throw new Error(`Account created, but verification email failed: ${emailErr.message}`);
      }
      
      const firebaseToken = await firebaseUser.getIdToken(true);
      console.log(`[AUTH FLOW] token received`);
      
      if (typeof firebaseToken !== "string" || firebaseToken.length === 0) {
        throw new Error("Firebase token generation failed");
      }
      
      const payload = {
        firstName: data.firstName,
        lastName: data.lastName
      };
      
      console.log(`[AUTH FLOW] backend registration started`);
      const response = await authService.register(payload, firebaseToken, requestId);
      console.log(`[AUTH FLOW] backend registration response received`);

      if (response.success && response.user) {
         console.log(`[AUTH FLOW] fetching profile...`);
         await refreshUser();
         console.log(`[AUTH FLOW] context state updated`);
      }
      console.log(`[AUTH FLOW] redirecting`);
      return response;
    } catch (err: any) {
      console.error(`[AUTH FLOW] Error:`, err);
      setError(err.message || 'Registration failed');
      throw err;
    } finally {
      isAuthInProgress.current = false;
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
    isAuthInProgress.current = true;
    console.log("[AUTH FLOW] Google button clicked");

    try {
      setError(null);
      setIsLoading(true);

      const provider = new GoogleAuthProvider();
      console.log("[AUTH FLOW] popup opened");

      const result = await signInWithPopup(auth, provider);
      const firebaseUser = result.user;

      console.log("[AUTH FLOW] popup credential received");
      console.log("[AUTH FLOW] Firebase user received");

      const firebaseToken = await firebaseUser.getIdToken(true);
      if (!firebaseToken) {
        throw new Error("Firebase token was not generated");
      }
      console.log("[AUTH FLOW] Firebase token received");

      console.log("[AUTH FLOW] backend Google sync started");
      const response = await authService.googleAuth(firebaseToken);
      console.log("[AUTH FLOW] backend Google sync succeeded");
      
      if (response.success && response.user) {
         console.log("[AUTH FLOW] profile loaded");
         await refreshUser();
         console.log("[AUTH FLOW] context state updated");
      }
      console.log("[AUTH FLOW] navigating to dashboard");
      return response;
    } catch (error: any) {
      console.error("[AUTH FLOW] Error:", error);
      setError(`[${error?.code || 'auth/error'}] ${error?.message || "Google authentication failed"}`);
      throw error;
    } finally {
      setIsLoading(false);
      isAuthInProgress.current = false;
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
