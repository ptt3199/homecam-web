'use client';

import { useAuth, useUser, SignInButton, SignOutButton } from '@clerk/nextjs';
import { ReactNode, useState, useEffect } from 'react';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { AdminLogin } from './AdminLogin';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { cameraApi } from '@/lib/api';

interface ProtectedRouteProps {
  children: ReactNode;
  fallback?: ReactNode;
}

export function ProtectedRoute({ children, fallback }: ProtectedRouteProps) {
  const [clerkError, setClerkError] = useState<string | null>(null);
  const [showAdminLogin, setShowAdminLogin] = useState(false);
  const [adminToken, setAdminToken] = useLocalStorage<string | null>('admin_token', null);
  const [isValidatingToken, setIsValidatingToken] = useState(!!adminToken);
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState(false);
  
  // Always call hooks unconditionally
  const auth = useAuth();
  const userInfo = useUser();
  
  // Validate admin token if present
  useEffect(() => {
    const validateAdminToken = async () => {
      if (!adminToken) {
        setIsValidatingToken(false);
        return;
      }

      try {
        // Set token getter for API client
        cameraApi.setTokenGetter(async () => adminToken);
        
        // Test the token by calling auth info
        const authInfo = await cameraApi.getAuthInfo();
        setIsAdminAuthenticated(authInfo.authenticated);
      } catch (error) {
        console.warn('Admin token validation failed:', error);
        setAdminToken(null); // Clear invalid token
        setIsAdminAuthenticated(false);
      } finally {
        setIsValidatingToken(false);
      }
    };

    validateAdminToken();
  }, [adminToken, setAdminToken]);

  // Safely extract values with error handling
  let isLoaded = false;
  let isSignedIn = false;
  let user = null;
  
  try {
    isLoaded = auth.isLoaded ?? false;
    isSignedIn = auth.isSignedIn ?? false;
    user = userInfo.user;
  } catch (error) {
    // Handle case when Clerk is not properly initialized
    console.warn('Clerk authentication not available:', error);
    if (!clerkError) {
      setClerkError('Authentication service unavailable');
    }
  }

  // Admin login success handler
  const handleAdminLogin = (token: string) => {
    setAdminToken(token);
    setShowAdminLogin(false);
    setIsAdminAuthenticated(true);
    
    // Set token for API client
    cameraApi.setTokenGetter(async () => token);
  };

  // Admin logout handler
  const handleAdminLogout = () => {
    setAdminToken(null);
    setIsAdminAuthenticated(false);
    setShowAdminLogin(false);
  };

  // Show error if Clerk is not working
  if (clerkError) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-center text-white max-w-md mx-auto p-8">
          <div className="text-6xl mb-6">⚠️</div>
          <h1 className="text-3xl font-bold mb-4">Authentication Unavailable</h1>
          <p className="text-slate-300 mb-6">
            The authentication service is currently unavailable. Please try again later.
          </p>
          <div className="bg-red-900/20 border border-red-500/30 rounded-lg p-4">
            <p className="text-red-300 text-sm">{clerkError}</p>
          </div>
        </div>
      </div>
    );
  }

  // Show admin login if requested
  if (showAdminLogin) {
    return (
      <AdminLogin
        onLoginSuccess={handleAdminLogin}
        onCancel={() => setShowAdminLogin(false)}
      />
    );
  }

  // Show loading while validating admin token
  if (isValidatingToken) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-center text-white">
          <LoadingSpinner size="lg" />
          <p className="text-lg mt-4">Validating credentials...</p>
        </div>
      </div>
    );
  }

  // If admin is authenticated, show content
  if (isAdminAuthenticated) {
    return (
      <>
        {/* Admin header */}
        <div className="bg-orange-800 border-b border-orange-700 px-4 py-2">
          <div className="flex items-center justify-between max-w-7xl mx-auto">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-orange-600 rounded-full flex items-center justify-center">
                <span className="text-white text-sm font-medium">👤</span>
              </div>
              <div>
                <p className="text-white text-sm font-medium">Administrator</p>
                <p className="text-orange-300 text-xs">System Admin Access</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-xs text-orange-300">
                🔧 Admin Mode • PTT Home Camera
              </div>
              <button 
                onClick={handleAdminLogout}
                className="text-orange-300 hover:text-white text-sm transition-colors duration-200"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
        {children}
      </>
    );
  }

  // Show loading spinner while Clerk is initializing
  if (!isLoaded) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-center text-white">
          <LoadingSpinner size="lg" />
          <p className="text-lg mt-4">Loading authentication...</p>
        </div>
      </div>
    );
  }

  // Show sign-in prompt if not authenticated
  if (!isSignedIn) {
    return fallback || (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-center text-white max-w-md mx-auto p-8">
          <div className="text-6xl mb-6">🏠</div>
          <h1 className="text-3xl font-bold mb-4">PTT Home Camera</h1>
          <p className="text-slate-300 mb-6">
            This is a private camera system accessible only to authorized users.
          </p>
          <div className="bg-slate-800 border border-slate-700 rounded-lg p-6 mb-6">
            <p className="text-slate-400 text-sm mb-4">
              <span className="text-amber-400">⚠️ Access Restricted</span><br/>
              Only pre-authorized accounts can access this system. 
              Contact the administrator if you need access.
            </p>
          </div>
          <div className="space-y-3">
            <SignInButton mode="modal">
              <button className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-8 rounded-lg transition-colors duration-200">
                Sign In with Clerk
              </button>
            </SignInButton>
            
            <button 
              onClick={() => setShowAdminLogin(true)}
              className="w-full bg-orange-600 hover:bg-orange-700 text-white font-medium py-2 px-6 rounded-lg transition-colors duration-200"
            >
              Administrator Login
            </button>
          </div>
          <p className="text-xs text-slate-500 mt-4">
            New user registration is disabled for security reasons.
          </p>
        </div>
      </div>
    );
  }

  // Render protected content with user info
  return (
    <>
      {/* User info header */}
      <div className="bg-slate-800 border-b border-slate-700 px-4 py-2">
        <div className="flex items-center justify-between max-w-7xl mx-auto">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
              <span className="text-white text-sm font-medium">
                {user?.firstName?.[0] || user?.emailAddresses[0]?.emailAddress[0]?.toUpperCase() || '?'}
              </span>
            </div>
            <div>
              <p className="text-white text-sm font-medium">
                {user?.firstName || user?.emailAddresses[0]?.emailAddress || 'Anonymous'}
              </p>
              <p className="text-slate-400 text-xs">Authorized User</p>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <div className="text-xs text-slate-500">
              🏠 PTT Home Camera
            </div>
            <SignOutButton>
              <button className="text-slate-400 hover:text-white text-sm transition-colors duration-200">
                Sign Out
              </button>
            </SignOutButton>
          </div>
        </div>
      </div>
      
      {/* Protected content */}
      {children}
    </>
  );
}

// Minimal version without UI chrome
export function RequireAuth({ children }: { children: ReactNode }) {
  const [clerkError, setClerkError] = useState<string | null>(null);
  
  // Always call hooks unconditionally
  const auth = useAuth();
  
  let isLoaded = false;
  let isSignedIn = false;
  
  try {
    isLoaded = auth.isLoaded ?? false;
    isSignedIn = auth.isSignedIn ?? false;
  } catch (error) {
    console.warn('Clerk authentication not available:', error);
    if (!clerkError) {
      setClerkError('Authentication service unavailable');
    }
  }

  if (clerkError) {
    return (
      <div className="text-center p-8">
        <p className="text-red-400 mb-4">Authentication service unavailable</p>
        <p className="text-xs text-slate-500">{clerkError}</p>
      </div>
    );
  }

  if (!isLoaded) {
    return (
      <div className="flex items-center justify-center p-8">
        <LoadingSpinner size="sm" />
      </div>
    );
  }

  if (!isSignedIn) {
    return (
      <div className="text-center p-8">
        <p className="text-slate-400 mb-4">Authorization required</p>
        <SignInButton mode="modal">
          <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded">
            Sign In
          </button>
        </SignInButton>
        <p className="text-xs text-slate-500 mt-2">Private access only</p>
      </div>
    );
  }

  return <>{children}</>;
} 