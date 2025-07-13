import { useAuth } from './context/AuthContext';
import AuthPage from './AuthPage';
import TodoApp from './components/TodoApp';

export default function App() {
  const { user, loading } = useAuth();

  if (loading) return <p className="text-center mt-20">Loading...</p>;

  return user ? <TodoApp /> : <AuthPage />;
}
