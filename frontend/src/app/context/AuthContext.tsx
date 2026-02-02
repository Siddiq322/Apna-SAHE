import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User as FirebaseUser } from 'firebase/auth';
import { User, UserRole } from '@/app/types';
import { AuthService, UserData } from '../../services/authService';

interface AuthContextType {
  user: User | null;
  userData: UserData | null;
  isAuthenticated: boolean;
  loading: boolean;
  login: (email: string, password: string, expectedRole?: 'student' | 'admin') => Promise<void>;
  signUp: (userData: {
    email: string;
    password: string;
    name: string;
    branch: string;
    semester: string;
  }) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
  isAdmin: boolean;
  isStudent: boolean;
  error: string | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Map Firebase user data to your existing User type
  const mapFirebaseUserToUser = (firebaseUser: FirebaseUser, userData: UserData): User => {
    // STRICT ADMIN VALIDATION: Only siddiqshaik613@gmail.com can be admin
    const isAuthorizedAdmin = userData.email === 'siddiqshaik613@gmail.com';
    
    if (userData.role === 'admin' && !isAuthorizedAdmin) {
      throw new Error('Unauthorized admin access detected');
    }
    
    // Force role to student if not authorized admin
    const actualRole = isAuthorizedAdmin && userData.role === 'admin' ? 'admin' : 'student';

    if (actualRole === 'student') {
      return {
        id: userData.uid,
        name: userData.name,
        email: userData.email,
        role: 'student',
        branch: userData.branch,
        semester: userData.semester,
        rollNumber: userData.email.split('@')[0].toUpperCase(), // Extract from email
        points: userData.points,
        notesUploaded: userData.notesUploaded,
      };
    } else {
      return {
        id: userData.uid,
        name: userData.name,
        email: userData.email,
        role: 'admin',
      };
    }
  };

  useEffect(() => {
    const unsubscribe = AuthService.onAuthStateChange(async (firebaseUser) => {
      try {
        if (firebaseUser) {
          // User is signed in
          console.log('🔍 Firebase user signed in:', firebaseUser.uid);
          const fetchedUserData = await AuthService.getCurrentUserData(firebaseUser.uid);
          console.log('🔍 User data fetched:', fetchedUserData);
          
          // Additional security check for admin role
          if (fetchedUserData.role === 'admin' && fetchedUserData.email !== 'siddiqshaik613@gmail.com') {
            throw new Error('Unauthorized admin access detected');
          }
          
          const mappedUser = mapFirebaseUserToUser(firebaseUser, fetchedUserData);
          setUser(mappedUser);
          setUserData(fetchedUserData);
        } else {
          // User is signed out
          console.log('🔍 User signed out');
          setUser(null);
          setUserData(null);
        }
        setError(null);
      } catch (error: any) {
        console.error('Auth state change error:', error);
        // Handle "User data not found" error specially
        if (firebaseUser && error.message.includes('User data not found')) {
          console.log('⏳ User document not found, attempting to recover...');
          // Retry after a short delay
          setTimeout(async () => {
            try {
              const fetchedUserData = await AuthService.getCurrentUserData(firebaseUser.uid);
              const mappedUser = mapFirebaseUserToUser(firebaseUser, fetchedUserData);
              setUser(mappedUser);
              setUserData(fetchedUserData);
              setError(null);
              console.log('✅ User data recovered successfully');
            } catch (retryError: any) {
              console.log('⏳ Second retry after 4 more seconds...');
              setTimeout(async () => {
                try {
                  const fetchedUserData = await AuthService.getCurrentUserData(firebaseUser.uid);
                  const mappedUser = mapFirebaseUserToUser(firebaseUser, fetchedUserData);
                  setUser(mappedUser);
                  setUserData(fetchedUserData);
                  setError(null);
                  console.log('✅ User data recovered on second retry');
                } catch (finalError: any) {
                  console.error('Final recovery failed:', finalError);
                  setError('Account setup incomplete. Please refresh the page.');
                  setUser(null);
                  setUserData(null);
                }
              }, 4000);
            }
          }, 3000); // Increased delay for better reliability
        } else {
          setError(error.message);
          setUser(null);
          setUserData(null);
        }
      } finally {
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  const login = async (email: string, password: string, expectedRole?: 'student' | 'admin') => {
    try {
      setLoading(true);
      setError(null);
      const result = await AuthService.signIn(email, password);
      
      // If expectedRole is provided, validate it matches the user's actual role
      if (expectedRole && result.userData.role !== expectedRole) {
        // Sign out the user since they signed in on wrong tab
        await AuthService.signOutUser();
        
        if (expectedRole === 'admin') {
          throw new Error('Invalid admin credentials. Only authorized admin can access admin portal.');
        } else {
          throw new Error('Invalid student credentials. Please use student portal for student accounts.');
        }
      }
      
      // User state will be updated by the auth state listener
    } catch (error: any) {
      setError(error.message);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const signUp = async (userData: {
    email: string;
    password: string;
    name: string;
    branch: string;
    semester: string;
  }) => {
    try {
      setLoading(true);
      setError(null);
      const result = await AuthService.signUpStudent(userData);
      // User state will be updated by the auth state listener
    } catch (error: any) {
      setError(error.message);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      setLoading(true);
      setError(null);
      await AuthService.signOutUser();
      // Clear all state
      setUser(null);
      setUserData(null);
      // User state will be updated by the auth state listener
    } catch (error: any) {
      setError(error.message);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const signInWithGoogle = async (): Promise<void> => {
    try {
      setLoading(true);
      setError(null);
      const result = await AuthService.signInWithGoogle();
      // User state will be updated by the auth state listener
    } catch (error: any) {
      setError(error.message);
      throw error; // Re-throw the error so LandingPage can catch it
    } finally {
      setLoading(false);
    }
  };

  const isAdmin = user?.role === 'admin';
  const isStudent = user?.role === 'student';

  return (
    <AuthContext.Provider value={{ 
      user, 
      userData,
      isAuthenticated: !!user, 
      loading,
      login, 
      signUp,
      signInWithGoogle,
      logout,
      isAdmin,
      isStudent,
      error
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
