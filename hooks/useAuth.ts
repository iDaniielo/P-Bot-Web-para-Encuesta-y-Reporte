import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabaseBrowser } from '@/lib/supabase-browser';

export function useAuth() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    checkAuth();
    
    // Escuchar cambios de autenticación
    const { data: { subscription } } = supabaseBrowser.auth.onAuthStateChange(
      (_event, session) => {
        setUser(session?.user ?? null);
        setLoading(false);
      }
    );

    return () => {
      subscription?.unsubscribe();
    };
  }, []);

  const checkAuth = async () => {
    try {
      const { data: { session } } = await supabaseBrowser.auth.getSession();
      setUser(session?.user ?? null);
    } catch (error) {
      console.error('Error checking auth:', error);
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      await supabaseBrowser.auth.signOut();
      setUser(null);
      router.push('/login');
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  return {
    user,
    loading,
    isAuthenticated: !!user,
    logout,
  };
}
