import { useAuth } from './context/AuthContext';

export default function AuthPage() {
  const { loginWithGoogle, loginWithGithub } = useAuth();

  return (
    <div className="flex flex-col gap-4 b">
      <button onClick={loginWithGoogle}>Login with Google</button>
      <button onClick={loginWithGithub}>Login with GitHub</button>
    </div>
  );
}
