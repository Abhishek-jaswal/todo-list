import { useState } from 'react';
import { supabase } from './supabase';

export default function AuthPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLogin, setIsLogin] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  setError(null);
  setLoading(true);

  try {
    let result;

    if (isLogin) {
      // Login flow
      result = await supabase.auth.signInWithPassword({
        email,
        password,
      });
    } else {
      // Signup flow
      result = await supabase.auth.signUp({
        email,
        password,
      });
    }

    const { data, error } = result;

    if (error) {
      setError(error.message);
    } else if (!isLogin && data.user && !data.session) {
      setError("Please check your email to confirm your account.");
    }

    console.log('Auth result:', data);
  } catch (err: any) {
    setError("Unexpected error: " + err.message);
  }

  setLoading(false);
};


  return (
    <form onSubmit={handleSubmit} className="p-6 bg-white shadow rounded max-w-md mx-auto mt-20">
      <h2 className="text-2xl font-bold text-center mb-4">{isLogin ? 'Login' : 'Sign Up'}</h2>

      <input
        type="email"
        placeholder="Email"
        value={email}
        onChange={e => setEmail(e.target.value)}
        className="w-full p-2 border rounded mb-3"
        required
      />

      <input
        type="password"
        placeholder="Password"
        value={password}
        onChange={e => setPassword(e.target.value)}
        className="w-full p-2 border rounded mb-3"
        required
      />

      {error && <p className="text-red-500 mb-2">{error}</p>}

      <button
        type="submit"
        className="bg-blue-500 text-white w-full py-2 rounded hover:bg-blue-600"
        disabled={loading}
      >
        {loading ? 'Processing...' : isLogin ? 'Login' : 'Sign Up'}
      </button>

      <p className="text-center mt-4">
        {isLogin ? 'No account?' : 'Have an account?'}{' '}
        <button
          type="button"
          className="text-blue-600 underline"
          onClick={() => {
            setIsLogin(!isLogin);
            setError(null);
          }}
        >
          {isLogin ? 'Sign up' : 'Log in'}
        </button>
      </p>
    </form>
  );
}
