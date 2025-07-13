import { useEffect } from 'react';
import { supabase } from './supabase';

export default function TestSupabase() {
  useEffect(() => {
    const run = async () => {
      const { data, error } = await supabase.auth.getSession();
      console.log('TEST SESSION:', { data, error });
    };
    run();
  }, []);

  return <h1>Test Supabase</h1>;
}
