import { useAuth } from './context/AuthContext';

export default function AuthPage() {
  const { loginWithGoogle, loginWithGithub } = useAuth();

  return (
    <div className="auth-root">
      <div className="auth-bg">
        <div className="orb orb-1" />
        <div className="orb orb-2" />
        <div className="orb orb-3" />
        <div className="grid-overlay" />
      </div>

      <div className="auth-card">
        <div className="auth-icon">
          <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2" />
            <rect x="9" y="3" width="6" height="4" rx="1" />
            <path d="M9 12h6M9 16h4" />
          </svg>
        </div>

        <h1 className="auth-title">TaskFlow</h1>
        <p className="auth-sub">Your intelligent task manager</p>

        <div className="auth-divider">
          <span>Sign in to continue</span>
        </div>

        <div className="auth-buttons">
          <button className="auth-btn google-btn" onClick={loginWithGoogle}>
            <svg width="20" height="20" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
            </svg>
            Continue with Google
          </button>

          <button className="auth-btn github-btn" onClick={loginWithGithub}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
            </svg>
            Continue with GitHub
          </button>
        </div>

        <p className="auth-footer">No account needed · Secure OAuth login</p>
      </div>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Sans:wght@300;400;500&display=swap');

        * { box-sizing: border-box; margin: 0; padding: 0; }

        .auth-root {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          background: #08090f;
          font-family: 'DM Sans', sans-serif;
          position: relative;
          overflow: hidden;
        }

        .auth-bg { position: absolute; inset: 0; pointer-events: none; }

        .orb {
          position: absolute;
          border-radius: 50%;
          filter: blur(80px);
          opacity: 0.35;
          animation: float 8s ease-in-out infinite;
        }
        .orb-1 { width: 400px; height: 400px; background: #6c3bfa; top: -100px; left: -100px; animation-delay: 0s; }
        .orb-2 { width: 300px; height: 300px; background: #2563eb; bottom: -80px; right: -80px; animation-delay: 3s; }
        .orb-3 { width: 200px; height: 200px; background: #a855f7; top: 50%; left: 60%; animation-delay: 6s; }

        @keyframes float {
          0%, 100% { transform: translateY(0px) scale(1); }
          50% { transform: translateY(-20px) scale(1.05); }
        }

        .grid-overlay {
          position: absolute; inset: 0;
          background-image: linear-gradient(rgba(255,255,255,.03) 1px, transparent 1px),
                            linear-gradient(90deg, rgba(255,255,255,.03) 1px, transparent 1px);
          background-size: 40px 40px;
        }

        .auth-card {
          position: relative;
          background: rgba(255,255,255,0.04);
          backdrop-filter: blur(24px);
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 24px;
          padding: 48px 40px;
          width: 100%;
          max-width: 420px;
          margin: 20px;
          text-align: center;
          animation: slideUp .6s cubic-bezier(.16,1,.3,1);
        }

        @keyframes slideUp {
          from { opacity: 0; transform: translateY(30px); }
          to { opacity: 1; transform: translateY(0); }
        }

        .auth-icon {
          width: 64px; height: 64px;
          background: linear-gradient(135deg, #6c3bfa, #2563eb);
          border-radius: 16px;
          display: flex; align-items: center; justify-content: center;
          color: white;
          margin: 0 auto 20px;
          box-shadow: 0 0 40px rgba(108,59,250,0.4);
        }

        .auth-title {
          font-family: 'Syne', sans-serif;
          font-size: 2rem; font-weight: 800;
          color: white;
          letter-spacing: -0.03em;
          margin-bottom: 8px;
        }

        .auth-sub {
          color: rgba(255,255,255,0.4);
          font-size: 0.95rem;
          margin-bottom: 32px;
        }

        .auth-divider {
          display: flex; align-items: center; gap: 12px;
          margin-bottom: 24px;
        }
        .auth-divider::before, .auth-divider::after {
          content: ''; flex: 1; height: 1px;
          background: rgba(255,255,255,0.08);
        }
        .auth-divider span {
          color: rgba(255,255,255,0.3);
          font-size: 0.8rem;
          white-space: nowrap;
        }

        .auth-buttons { display: flex; flex-direction: column; gap: 12px; margin-bottom: 24px; }

        .auth-btn {
          display: flex; align-items: center; justify-content: center;
          gap: 12px;
          padding: 14px 20px;
          border-radius: 14px;
          border: 1px solid rgba(255,255,255,0.1);
          font-family: 'DM Sans', sans-serif;
          font-size: 0.95rem; font-weight: 500;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .google-btn {
          background: rgba(255,255,255,0.06);
          color: white;
        }
        .google-btn:hover {
          background: rgba(255,255,255,0.12);
          border-color: rgba(255,255,255,0.2);
          transform: translateY(-1px);
        }

        .github-btn {
          background: linear-gradient(135deg, #6c3bfa, #2563eb);
          color: white;
          border-color: transparent;
          box-shadow: 0 4px 20px rgba(108,59,250,0.3);
        }
        .github-btn:hover {
          opacity: 0.9;
          transform: translateY(-1px);
          box-shadow: 0 8px 30px rgba(108,59,250,0.5);
        }

        .auth-footer {
          color: rgba(255,255,255,0.2);
          font-size: 0.78rem;
        }
      `}</style>
    </div>
  );
}
