import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import * as SecureStore from 'expo-secure-store';

type User = {
  id: string;
  email: string;
};

type AuthContextType = {
  user: User | null;
  signIn: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  isLoading: boolean;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Check if user is already logged in on app launch
  useEffect(() => {
    const bootstrapAsync = async () => {
      try {
        const userToken = await SecureStore.getItemAsync('userToken');
        if (userToken) {
          setUser(JSON.parse(userToken));
        }
      } catch (e) {
        console.error('Failed to restore token', e);
      } finally {
        setIsLoading(false);
      }
    };

    bootstrapAsync();
  }, []);

  const signIn = async (email: string, password: string) => {
    // Fake login for now
    // Later you'll connect to FastAPI + Supabase

    if (email === 'test@test.com' && password === '123456') {
      const userData = {
        id: '1',
        email,
      };
      setUser(userData);
      await SecureStore.setItemAsync('userToken', JSON.stringify(userData));
    } else {
      throw new Error('Invalid credentials');
    }
  };

  const logout = async () => {
    setUser(null);
    await SecureStore.deleteItemAsync('userToken');
  };

  return (
    <AuthContext.Provider value={{ user, signIn, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuth must be used inside AuthProvider');
  }

  return context;
}