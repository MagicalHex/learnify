import { useState } from 'react';
import axios from 'axios';

const Register = ({ onExit }: { onExit: () => void }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [acceptPrivacy, setAcceptPrivacy] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // For terms and privacy
  const [showTerms, setShowTerms] = useState(false);
const [showPrivacy, setShowPrivacy] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Guest mode
    if (!email.trim()) {
      localStorage.setItem('userId', 'pseudo-user-123');
      alert('Continuing as Guest (shared test data – no account created)');
      onExit();
      return;
    }

    // Validate consents
    if (!acceptTerms || !acceptPrivacy) {
      setError('You must accept the Terms and Privacy Policy to create an account.');
      return;
    }

    setLoading(true);

    try {
      const response = await axios.post('http://localhost:5000/api/register', {
        email: email.trim().toLowerCase(),
        password: password.trim(),
      });

      const { userId } = response.data;
      localStorage.setItem('userId', userId);
      alert(`Welcome! Your account has been created.`);
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
      <div className="absolute inset-0" onClick={onExit}></div>

      <div className="relative bg-gradient-to-br from-green-600 to-emerald-700 p-10 rounded-3xl shadow-2xl max-w-md w-full mx-4 overflow-y-auto max-h-screen">
        <button
          onClick={onExit}
          className="absolute top-4 right-6 text-white/80 hover:text-white text-3xl font-light"
        >
          ×
        </button>

        <h2 className="text-4xl font-bold text-white mb-8 text-center">Join the Hive 🐝</h2>

        {error && (
          <p className="text-red-200 text-center mb-4 bg-red-900/30 px-4 py-2 rounded-lg">
            {error}
          </p>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <input
            type="email"
            placeholder="Email"
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
            minLength={6}
          />

          {/* Consent Checkboxes */}
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

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-white text-green-700 font-bold py-4 rounded-xl hover:bg-gray-100 transition text-lg disabled:opacity-70"
          >
            {loading ? 'Creating Account...' : 'Create Account'}
          </button>
        </form>

        <p className="text-sm text-white/70 text-center mt-6">
          Leave email blank → continue as guest (no data stored, shared test roadmap)
        </p>

        <p className="text-xs text-white/50 text-center mt-4">
          Compliant with GDPR, CCPA, and other privacy laws.<br />
          Your password is encrypted and never stored in plain text.
        </p>
      </div>
      {showTerms && <TermsModal onClose={() => setShowTerms(false)} />}
{showPrivacy && <PrivacyModal onClose={() => setShowPrivacy(false)} />}
    </div>
  );
};

// Inside Register.tsx – add these two nested components at the bottom

const TermsModal = ({ onClose }: { onClose: () => void }) => (
  <div className="fixed inset-0 bg-black/90 flex items-center justify-center z-50 p-4">
    <div className="bg-gray-900 rounded-2xl p-8 max-w-3xl w-full max-h-screen overflow-y-auto relative">
      <button
        onClick={onClose}
        className="absolute top-4 right-6 text-white/80 hover:text-white text-3xl"
      >
        ×
      </button>
      <h1 className="text-4xl font-bold text-white mb-8">Terms of Service</h1>
      <div className="text-white/90 space-y-4 leading-relaxed">
        <p>Last updated: December 31, 2025</p>
        <p>By creating an account, you agree to use NavExplorer for personal educational purposes.</p>
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
      <button
        onClick={onClose}
        className="absolute top-4 right-6 text-white/80 hover:text-white text-3xl"
      >
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

export default Register;