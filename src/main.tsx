import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { RouterProvider } from 'react-router-dom';
import { router } from './routes';
import { AuthProvider } from './features/auth/context/AuthContext';
import './index.css';

// Type definition for the window object extension
declare global {
  interface Window {
    __APP_BUILD_ID__: string;
  }
}

window.__APP_BUILD_ID__ = "AUTH-PROD-FIX-16c2d6d";
console.log("[APP VERSION] " + window.__APP_BUILD_ID__);

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AuthProvider>
      <RouterProvider router={router} />
    </AuthProvider>
  </StrictMode>,
);
