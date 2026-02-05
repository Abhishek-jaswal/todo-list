import { createContext, useContext, useEffect, useState } from 'react';
import { pb } from '../lib/pocketbase';

const AuthContext = createContext<any>(null);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState(pb.authStore.model);

  useEffect(() => {
    pb.authStore.onChange(() => {
      setUser(pb.authStore.model);
    });
  }, []);

  const loginWithGoogle = async () => {
    await pb.collection('users').authWithOAuth2({ provider: 'google' });
  };

  const loginWithGithub = async () => {
    await pb.collection('users').authWithOAuth2({ provider: 'github' });
  };

  const logout = () => pb.authStore.clear();

  return (
    <AuthContext.Provider value={{ user, loginWithGoogle, loginWithGithub, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
