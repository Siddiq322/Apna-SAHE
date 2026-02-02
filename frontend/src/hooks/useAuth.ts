import { useState, useEffect } from 'react';
import { User } from 'firebase/auth';
import { AuthService, UserData } from '../services/authService';

interface AuthState {
  user: User | null;
  userData: UserData | null;
  loading: boolean;
  error: string | null;
}

export const useAuth = () => {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    userData: null,
    loading: true,
    error: null
  });

  useEffect(() => {
    const unsubscribe = AuthService.onAuthStateChange(async (firebaseUser) => {
      try {
        if (firebaseUser) {
          // User is signed in
          const userData = await AuthService.getCurrentUserData(firebaseUser.uid);
          setAuthState({
            user: firebaseUser,
            userData: userData,
            loading: false,
            error: null
          });
        } else {
          // User is signed out
          setAuthState({
            user: null,
            userData: null,
            loading: false,
            error: null
          });
        }
      } catch (error: any) {
        setAuthState({
          user: null,
          userData: null,
          loading: false,
          error: error.message
        });
      }
    });

    return () => unsubscribe();
  }, []);

  const signIn = async (email: string, password: string) => {
    try {
      setAuthState(prev => ({ ...prev, loading: true, error: null }));
      const result = await AuthService.signIn(email, password);
      // Auth state will be updated by the listener
      return result;
    } catch (error: any) {
      setAuthState(prev => ({ 
        ...prev, 
        loading: false, 
        error: error.message 
      }));
      throw error;
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
      setAuthState(prev => ({ ...prev, loading: true, error: null }));
      const result = await AuthService.signUpStudent(userData);
      // Auth state will be updated by the listener
      return result;
    } catch (error: any) {
      setAuthState(prev => ({ 
        ...prev, 
        loading: false, 
        error: error.message 
      }));
      throw error;
    }
  };

  const signOut = async () => {
    try {
      setAuthState(prev => ({ ...prev, loading: true, error: null }));
      await AuthService.signOutUser();
      // Auth state will be updated by the listener
    } catch (error: any) {
      setAuthState(prev => ({ 
        ...prev, 
        loading: false, 
        error: error.message 
      }));
      throw error;
    }
  };

  const isAdmin = authState.userData && AuthService.isAdmin(authState.userData);
  const isStudent = authState.userData && AuthService.isStudent(authState.userData);

  return {
    ...authState,
    signIn,
    signUp,
    signOut,
    isAdmin,
    isStudent
  };
};