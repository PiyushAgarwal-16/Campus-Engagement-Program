import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  updateProfile
} from 'firebase/auth';
import { 
  doc, 
  setDoc, 
  getDoc, 
  updateDoc 
} from 'firebase/firestore';
import { auth, db } from '../config/firebase';

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
    
    // Allow demo users
    if ((user.email === 'demo@university.edu' && user.id === 'demo-user-123') ||
        (user.email === 'organizer@university.edu' && user.id === 'demo-organizer-123')) {
      return true;
    }
    
    // Allow Firebase users (they have proper uid from Firebase)
    if (user.id && !user.id.startsWith('demo-') && user.email) {
      return true;
    }
    
    return false;
  };

  useEffect(() => {
    // Only check for the specific demo user
    const demoUser = localStorage.getItem('demo-user');
    if (demoUser) {
      const userData = JSON.parse(demoUser);
      // Only allow the specific demo accounts
      if (userData.email === 'demo@university.edu' || userData.email === 'organizer@university.edu') {
        setUser(userData);
        setLoading(false);
        return;
      } else {
        // Clear any other demo users
        localStorage.removeItem('demo-user');
      }
    }

    // Set up Firebase auth listener
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        console.log('Firebase user detected:', firebaseUser.email);
        
        try {
          // Small delay to ensure Firestore write is complete for new signups
          await new Promise(resolve => setTimeout(resolve, 100));
          
          // Fetch user profile from Firestore
          const userDocRef = doc(db, 'users', firebaseUser.uid);
          const userDoc = await getDoc(userDocRef);
          
          let userData;
          if (userDoc.exists()) {
            // User profile exists in Firestore
            const profileData = userDoc.data();
            userData = {
              id: firebaseUser.uid,
              email: firebaseUser.email,
              name: profileData.name || firebaseUser.displayName || firebaseUser.email.split('@')[0],
              role: profileData.role || 'student',
              studentId: profileData.studentId || '',
              organizationName: profileData.organizationName || '',
              avatar: profileData.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(profileData.name || firebaseUser.email.split('@')[0])}&background=3b82f6&color=fff`
            };
            console.log('User profile loaded from Firestore:', userData.email, 'Role:', userData.role);
          } else {
            // Fallback for users without Firestore profile (shouldn't happen for new users)
            userData = {
              id: firebaseUser.uid,
              email: firebaseUser.email,
              name: firebaseUser.displayName || firebaseUser.email.split('@')[0],
              role: 'student', // Default role
              avatar: `https://ui-avatars.com/api/?name=${firebaseUser.email.split('@')[0]}&background=3b82f6&color=fff`
            };
            console.log('Using fallback user data for:', userData.email);
          }
          
          // Validate the user before setting
          if (isAuthorizedUser(userData)) {
            setUser(userData);
            console.log('Authorized Firebase user set:', userData.email, 'Role:', userData.role);
          } else {
            console.log('Unauthorized Firebase user rejected:', userData.email);
            setUser(null);
          }
        } catch (error) {
          console.error('Error fetching user profile:', error);
          // Fallback user data
          const userData = {
            id: firebaseUser.uid,
            email: firebaseUser.email,
            name: firebaseUser.displayName || firebaseUser.email.split('@')[0],
            role: 'student',
            avatar: `https://ui-avatars.com/api/?name=${firebaseUser.email.split('@')[0]}&background=3b82f6&color=fff`
          };
          
          if (isAuthorizedUser(userData)) {
            setUser(userData);
          } else {
            setUser(null);
          }
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
      
      // ONLY allow demo accounts as fallback and ONLY for specific Firebase errors
      const isDemoStudent = email === 'demo@university.edu' && password === 'demo123';
      const isDemoOrganizer = email === 'organizer@university.edu' && password === 'demo123';
      const isDemoAccount = isDemoStudent || isDemoOrganizer;
      const isFirebaseUnavailable = [
        'auth/network-request-failed',
        'auth/invalid-api-key',
        'auth/auth-domain-config-required',
        'auth/operation-not-allowed'
      ].includes(error.code);
      
      if (isDemoAccount && isFirebaseUnavailable) {
        console.log('Using demo fallback due to Firebase unavailability');
        
        const mockUser = {
          uid: isDemoStudent ? 'demo-user-123' : 'demo-organizer-123',
          email: email,
          displayName: isDemoStudent ? 'Demo Student' : 'Demo Organizer'
        };
        
        const userData = {
          id: mockUser.uid,
          email: mockUser.email,
          name: mockUser.displayName,
          role: isDemoStudent ? 'student' : 'organizer',
          ...(isDemoStudent 
            ? { studentId: 'ST123456' }
            : { organizationName: 'Computer Science Department' }
          ),
          avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(mockUser.displayName)}&background=3b82f6&color=fff`
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

  const signup = async (email, password, additionalData = {}) => {
    try {
      console.log('Attempting Firebase signup for:', email, 'as role:', additionalData.role);
      const result = await createUserWithEmailAndPassword(auth, email, password);
      console.log('Firebase signup successful for:', result.user.email);
      
      // Update the user's display name in Firebase Auth
      if (additionalData.name) {
        await updateProfile(result.user, {
          displayName: additionalData.name
        });
      }
      
      // Create user profile in Firestore
      const userProfile = {
        id: result.user.uid,
        email: result.user.email,
        name: additionalData.name || result.user.email.split('@')[0],
        role: additionalData.role || 'student',
        ...(additionalData.role === 'student' 
          ? { studentId: additionalData.studentId || '' }
          : { organizationName: additionalData.organizationName || '' }
        ),
        avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(additionalData.name || result.user.email.split('@')[0])}&background=3b82f6&color=fff`,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        preferences: {
          notifications: true,
          eventCategories: []
        }
      };
      
      // Save to Firestore
      const userDocRef = doc(db, 'users', result.user.uid);
      await setDoc(userDocRef, userProfile);
      
      // Immediately set the user in state with correct role to avoid timing issues
      setUser(userProfile);
      
      console.log('User profile created in Firestore:', userProfile);
      return result.user;
    } catch (error) {
      console.log('Firebase signup failed:', error.code, error.message);
      
      // NO fallback for signup - must use real Firebase
      // This ensures only legitimate accounts are created
      throw error;
    }
  };

  // Function to refresh user data from Firestore
  const refreshUserData = async () => {
    if (auth.currentUser) {
      try {
        const userDocRef = doc(db, 'users', auth.currentUser.uid);
        const userDoc = await getDoc(userDocRef);
        
        if (userDoc.exists()) {
          const profileData = userDoc.data();
          const userData = {
            id: auth.currentUser.uid,
            email: auth.currentUser.email,
            name: profileData.name || auth.currentUser.displayName || auth.currentUser.email.split('@')[0],
            role: profileData.role || 'student',
            studentId: profileData.studentId || '',
            organizationName: profileData.organizationName || '',
            avatar: profileData.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(profileData.name || auth.currentUser.email.split('@')[0])}&background=3b82f6&color=fff`
          };
          
          setUser(userData);
          console.log('User data refreshed:', userData.email, 'Role:', userData.role);
          return userData;
        }
      } catch (error) {
        console.error('Error refreshing user data:', error);
      }
    }
    return null;
  };

  // Function to update user profile
  const updateUserProfile = async (updates) => {
    if (!user) throw new Error('No user signed in');
    
    try {
      console.log('Updating user profile:', updates);
      
      // Update in Firestore
      const userDocRef = doc(db, 'users', user.id);
      const updateData = {
        ...updates,
        updatedAt: new Date().toISOString()
      };
      
      await updateDoc(userDocRef, updateData);
      
      // Update Firebase Auth display name if name is being updated
      if (updates.name && auth.currentUser) {
        await updateProfile(auth.currentUser, {
          displayName: updates.name
        });
      }
      
      // Update local user state
      const updatedUser = {
        ...user,
        ...updates,
        avatar: updates.name ? 
          `https://ui-avatars.com/api/?name=${encodeURIComponent(updates.name)}&background=3b82f6&color=fff` :
          user.avatar
      };
      
      setUser(updatedUser);
      console.log('Profile updated successfully:', updatedUser);
      
      return updatedUser;
    } catch (error) {
      console.error('Error updating profile:', error);
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
    updateUserProfile,
    refreshUserData,
    loading
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
