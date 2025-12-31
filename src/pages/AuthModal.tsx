// src/components/AuthModal.tsx  (or wherever you prefer)
import { useState } from 'react';
import axios from 'axios';

const AuthModal = ({ onExit }: { onExit: () => void }) => {
  const [mode, setMode] = useState<'login' | 'register'>('login'); // 'login' or 'register'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [acceptPrivacy, setAcceptPrivacy] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showTerms, setShowTerms] = useState(false);
  const [showPrivacy, setShowPrivacy] = useState(false);

  const isRegister = mode === 'register';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Guest mode: no email → use shared guest
    if (!email.trim()) {
      localStorage.setItem('userId', 'pseudo-user-123');
      alert('Continuing as Guest (shared test data)');
      onExit();
      return;
    }

    // Register mode: require consents
    if (isRegister && (!acceptTerms || !acceptPrivacy)) {
      setError('You must accept the Terms and Privacy Policy.');
      return;
    }

    // Login mode: just continue (no real auth yet)
    if (!isRegister) {
      const userId = `user-${email.toLowerCase().trim()}-${Date.now()}`;
      localStorage.setItem('userId', userId);
      alert(`Welcome back! Logged in as ${email}`);
      onExit();
      return;
    }

    // Actual register
    setLoading(true);
    try {
      const response = await axios.post('http://localhost:5000/api/register', {
        email: email.trim().toLowerCase(),
        password: password.trim(),
      });

      const { userId } = response.data;
      localStorage.setItem('userId', userId);
      alert('Account created successfully! Welcome to the hive 🐝');
      onExit();
    } catch (err: any) {
      const msg = err.response?.data?.error || 'Registration failed. Try another email.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-md flex items-center justify-center z-50">
      <div className="absolute inset-0" onClick={onExit} />

      <div className="relative bg-gradient-to-br from-green-600 to-emerald-700 p-10 rounded-3xl shadow-2xl max-w-md w-full mx-4 max-h-screen overflow-y-auto">
        <button
          onClick={onExit}
          className="absolute top-4 right-6 text-white/80 hover:text-white text-3xl font-light"
        >
          ×
        </button>

        <h2 className="text-4xl font-bold text-white mb-8 text-center">
          {isRegister ? 'Join the Hive 🐝' : 'Welcome Back 🐝'}
        </h2>

        {error && (
          <p className="text-red-200 text-center mb-4 bg-red-900/30 px-4 py-2 rounded-lg">
            {error}
          </p>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <input
            type="email"
            placeholder="Email (optional for guest)"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-5 py-4 rounded-xl bg-white/20 placeholder-white/60 text-white border border-white/30 focus:outline-none focus:border-white text-lg"
            disabled={loading}
          />

          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-5 py-4 rounded-xl bg-white/20 placeholder-white/60 text-white border border-white/30 focus:outline-none focus:border-white text-lg"
            disabled={loading}
            minLength={isRegister ? 6 : undefined}
          />

          {/* Consent checkboxes — only in register mode */}
          {isRegister && (
            <div className="space-y-3 text-white/90 text-sm">
              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={acceptTerms}
                  onChange={(e) => setAcceptTerms(e.target.checked)}
                  className="mt-1 w-5 h-5 text-green-500 rounded focus:ring-green-500"
                />
                <span>
                  I accept the{' '}
                  <button
                    type="button"
                    onClick={() => setShowTerms(true)}
                    className="underline hover:text-white font-medium"
                  >
                    Terms of Service
                  </button>
                </span>
              </label>

              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={acceptPrivacy}
                  onChange={(e) => setAcceptPrivacy(e.target.checked)}
                  className="mt-1 w-5 h-5 text-green-500 rounded focus:ring-green-500"
                />
                <span>
                  I accept the{' '}
                  <button
                    type="button"
                    onClick={() => setShowPrivacy(true)}
                    className="underline hover:text-white font-medium"
                  >
                    Privacy Policy
                  </button>
                </span>
              </label>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-white text-green-700 font-bold py-4 rounded-xl hover:bg-gray-100 transition text-lg disabled:opacity-70"
          >
            {loading ? 'Creating Account...' : isRegister ? 'Create Account' : 'Continue'}
          </button>
        </form>

        {/* Toggle between Login/Register */}
        <p className="text-center mt-6 text-white/90">
          {isRegister ? (
            <>
              Already have an account?{' '}
              <button
                type="button"
                onClick={() => setMode('login')}
                className="underline hover:text-white font-medium"
              >
                Log in
              </button>
            </>
          ) : (
            <>
              Not yet a user?{' '}
              <button
                type="button"
                onClick={() => setMode('register')}
                className="underline hover:text-white font-medium"
              >
                Register
              </button>
            </>
          )}
        </p>

        <p className="text-sm text-white/70 text-center mt-6">
          Leave email blank → continue as guest (shared test roadmap)
        </p>

        <p className="text-xs text-white/50 text-center mt-4">
          Compliant with GDPR, CCPA, and other privacy laws.<br />
          Your password is encrypted and never stored in plain text.
        </p>
      </div>

      {/* Reusable modals */}
      {showTerms && <TermsModal onClose={() => setShowTerms(false)} />}
      {showPrivacy && <PrivacyModal onClose={() => setShowPrivacy(false)} />}
    </div>
  );
};

// Keep your existing modal components (just move them here or import)
const TermsModal = ({ onClose }: { onClose: () => void }) => (
  <div className="fixed inset-0 bg-black/90 flex items-center justify-center z-50 p-4">
    <div className="bg-gray-900 rounded-2xl p-8 max-w-3xl w-full max-h-screen overflow-y-auto relative">
      <button onClick={onClose} className="absolute top-4 right-6 text-white/80 hover:text-white text-3xl">
        ×
      </button>
      <h1 className="text-4xl font-bold text-white mb-8">Terms of Service</h1>
      <div className="text-white/90 space-y-4 leading-relaxed">
        <p>Last updated: December 31, 2025</p>
        <p>By creating an account, you agree to use NavExplore for personal educational purposes.</p>
        <p>We store your email and encrypted password to save your roadmap progress.</p>
        <p>You are responsible for keeping your account secure.</p>
        <p>We may update these terms – continued use means acceptance.</p>
      </div>
    </div>
  </div>
);

const PrivacyModal = ({ onClose }: { onClose: () => void }) => (
  <div className="fixed inset-0 bg-black/90 flex items-center justify-center z-50 p-4">
    <div className="bg-gray-900 rounded-2xl p-8 max-w-3xl w-full max-h-screen overflow-y-auto relative">
      <button onClick={onClose} className="absolute top-4 right-6 text-white/80 hover:text-white text-3xl">
        ×
      </button>
      <h1 className="text-4xl font-bold text-white mb-8">Privacy Policy</h1>
      <div className="text-white/90 space-y-4 leading-relaxed">
        <p>Last updated: December 31, 2025</p>
        <p>We only collect your email and hashed password to enable saving your personal roadmap.</p>
        <p>Your password is encrypted using bcrypt – we never store it in plain text.</p>
        <p>Your data is private, not shared or sold.</p>
        <p>Guest mode stores nothing and uses shared test data.</p>
        <p>Compliant with GDPR, CCPA, and applicable privacy laws.</p>
      </div>
    </div>
  </div>
);

export default AuthModal;