import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged
} from 'firebase/auth';
import { auth } from '../config/firebase';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Function to validate if a user is authorized
  const isAuthorizedUser = (user) => {
    if (!user) return false;
    
    // Allow demo user
    if (user.email === 'demo@university.edu' && user.id === 'demo-user-123') {
      return true;
    }
    
    // Allow Firebase users (they have proper uid from Firebase)
    if (user.id && user.id !== 'demo-user-123' && user.email) {
      return true;
    }
    
    return false;
  };

  useEffect(() => {
    // Only check for the specific demo user
    const demoUser = localStorage.getItem('demo-user');
    if (demoUser) {
      const userData = JSON.parse(demoUser);
      // Only allow the specific demo account
      if (userData.email === 'demo@university.edu') {
        setUser(userData);
        setLoading(false);
        return;
      } else {
        // Clear any other demo users
        localStorage.removeItem('demo-user');
      }
    }

    // Set up Firebase auth listener
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      if (firebaseUser) {
        console.log('Firebase user detected:', firebaseUser.email);
        
        // Create user object with additional properties
        const userData = {
          id: firebaseUser.uid,
          email: firebaseUser.email,
          name: firebaseUser.displayName || firebaseUser.email.split('@')[0],
          role: 'student', // Default role
          avatar: `https://ui-avatars.com/api/?name=${firebaseUser.email.split('@')[0]}&background=3b82f6&color=fff`
        };
        
        // Validate the user before setting
        if (isAuthorizedUser(userData)) {
          setUser(userData);
          console.log('Authorized Firebase user set:', userData.email);
        } else {
          console.log('Unauthorized Firebase user rejected:', userData.email);
          setUser(null);
        }
      } else {
        console.log('No Firebase user detected');
        setUser(null);
      }
      setLoading(false);
    }, (error) => {
      console.log('Firebase auth error:', error);
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const login = async (email, password) => {
    try {
      // First, try Firebase authentication
      const result = await signInWithEmailAndPassword(auth, email, password);
      console.log('Firebase login successful for:', result.user.email);
      return result.user;
    } catch (error) {
      console.log('Firebase login failed:', error.code, error.message);
      
      // ONLY allow demo account as fallback and ONLY for specific Firebase errors
      const isDemoAccount = email === 'demo@university.edu' && password === 'demo123';
      const isFirebaseUnavailable = [
        'auth/network-request-failed',
        'auth/invalid-api-key',
        'auth/auth-domain-config-required',
        'auth/operation-not-allowed'
      ].includes(error.code);
      
      if (isDemoAccount && isFirebaseUnavailable) {
        console.log('Using demo fallback due to Firebase unavailability');
        
        const mockUser = {
          uid: 'demo-user-123',
          email: email,
          displayName: 'Demo User'
        };
        
        const userData = {
          id: mockUser.uid,
          email: mockUser.email,
          name: mockUser.displayName,
          role: 'student',
          avatar: `https://ui-avatars.com/api/?name=Demo+User&background=3b82f6&color=fff`
        };
        
        setUser(userData);
        localStorage.setItem('demo-user', JSON.stringify(userData));
        return mockUser;
      }
      
      // For ALL other cases (including wrong passwords, user not found, etc.), reject
      console.log('Authentication rejected for:', email);
      throw error;
    }
  };

  const signup = async (email, password) => {
    try {
      console.log('Attempting Firebase signup for:', email);
      const result = await createUserWithEmailAndPassword(auth, email, password);
      console.log('Firebase signup successful for:', result.user.email);
      return result.user;
    } catch (error) {
      console.log('Firebase signup failed:', error.code, error.message);
      
      // NO fallback for signup - must use real Firebase
      // This ensures only legitimate accounts are created
      throw error;
    }
  };

  // Enhanced logout with security checks
  const logout = async () => {
    try {
      console.log('Logging out user:', user?.email);
      
      // Clear demo user
      localStorage.removeItem('demo-user');
      
      // Sign out from Firebase
      await signOut(auth);
      setUser(null);
      console.log('Logout successful');
    } catch (error) {
      console.error('Logout error:', error);
      // Even if Firebase logout fails, clear local state
      localStorage.removeItem('demo-user');
      setUser(null);
    }
  };

  // Function to create demo user if needed
  const createDemoUser = async () => {
    try {
      const demoEmail = 'demo@university.edu';
      const demoPassword = 'demo123';
      
      // Try to sign in first
      try {
        await signInWithEmailAndPassword(auth, demoEmail, demoPassword);
      } catch (error) {
        if (error.code === 'auth/user-not-found') {
          // Create demo user if it doesn't exist
          await createUserWithEmailAndPassword(auth, demoEmail, demoPassword);
          console.log('Demo user created successfully');
        }
      }
    } catch (error) {
      console.log('Demo user creation failed - this is normal if Firebase is not configured yet');
    }
  };

  // Clear any unauthorized demo users on app start
  useEffect(() => {
    const demoUser = localStorage.getItem('demo-user');
    if (demoUser) {
      const userData = JSON.parse(demoUser);
      if (userData.email !== 'demo@university.edu') {
        localStorage.removeItem('demo-user');
        console.log('Cleared unauthorized demo user');
      }
    }
  }, []);

  // Create demo user on app start
  useEffect(() => {
    createDemoUser();
  }, []);

  const value = {
    user,
    login,
    signup,
    logout,
    loading
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
