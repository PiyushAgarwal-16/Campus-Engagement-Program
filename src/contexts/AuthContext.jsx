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

  useEffect(() => {
    // Check for demo user first
    const demoUser = localStorage.getItem('demo-user');
    if (demoUser) {
      setUser(JSON.parse(demoUser));
      setLoading(false);
      return;
    }

    // Set up Firebase auth listener
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      if (firebaseUser) {
        // Create user object with additional properties
        const userData = {
          id: firebaseUser.uid,
          email: firebaseUser.email,
          name: firebaseUser.displayName || firebaseUser.email.split('@')[0],
          role: 'student', // Default role
          avatar: `https://ui-avatars.com/api/?name=${firebaseUser.email.split('@')[0]}&background=3b82f6&color=fff`
        };
        setUser(userData);
      } else {
        setUser(null);
      }
      setLoading(false);
    }, (error) => {
      // If Firebase auth fails, check for demo user
      console.log('Firebase auth error, using demo mode:', error);
      const demoUser = localStorage.getItem('demo-user');
      if (demoUser) {
        setUser(JSON.parse(demoUser));
      }
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const login = async (email, password) => {
    try {
      const result = await signInWithEmailAndPassword(auth, email, password);
      return result.user;
    } catch (error) {
      // Fallback for development/demo when Firebase is not configured
      if (error.code === 'auth/network-request-failed' || 
          error.code === 'auth/invalid-api-key' ||
          error.message.includes('Firebase')) {
        
        // Create mock user for demo purposes
        const mockUser = {
          uid: Date.now().toString(),
          email: email,
          displayName: email.split('@')[0]
        };
        
        // Simulate Firebase user object
        const userData = {
          id: mockUser.uid,
          email: mockUser.email,
          name: mockUser.displayName,
          role: 'student',
          avatar: `https://ui-avatars.com/api/?name=${mockUser.displayName}&background=3b82f6&color=fff`
        };
        
        setUser(userData);
        localStorage.setItem('demo-user', JSON.stringify(userData));
        return mockUser;
      }
      throw error;
    }
  };

  const signup = async (email, password) => {
    try {
      const result = await createUserWithEmailAndPassword(auth, email, password);
      return result.user;
    } catch (error) {
      // Fallback for development/demo when Firebase is not configured
      if (error.code === 'auth/network-request-failed' || 
          error.code === 'auth/invalid-api-key' ||
          error.message.includes('Firebase')) {
        
        // Create mock user for demo purposes
        const mockUser = {
          uid: Date.now().toString(),
          email: email,
          displayName: email.split('@')[0]
        };
        
        // Simulate Firebase user object
        const userData = {
          id: mockUser.uid,
          email: mockUser.email,
          name: mockUser.displayName,
          role: 'student',
          avatar: `https://ui-avatars.com/api/?name=${mockUser.displayName}&background=3b82f6&color=fff`
        };
        
        setUser(userData);
        localStorage.setItem('demo-user', JSON.stringify(userData));
        return mockUser;
      }
      throw error;
    }
  };

  const logout = async () => {
    try {
      // Clear demo user
      localStorage.removeItem('demo-user');
      
      // Sign out from Firebase
      await signOut(auth);
      setUser(null);
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
