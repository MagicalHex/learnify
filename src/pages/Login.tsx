// src/pages/Login.tsx
import { useState } from 'react';

const Login = ({ onExit }: { onExit: () => void }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    let userId: string;
    if (username.trim() && password.trim()) {
      userId = `user-${username}-${Date.now()}`;
    } else {
      userId = 'pseudo-user-123';
      alert('No credentials → Using guest mode (pseudo-user-123)');
    }

    localStorage.setItem('userId', userId);
    alert(`Logged in as: ${userId === 'pseudo-user-123' ? 'Guest' : username}`);
    onExit(); // Close and go back
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-md flex items-center justify-center z-50">
      {/* Optional: Click outside to close */}
      <div className="absolute inset-0" onClick={onExit}></div>

      <div className="relative bg-gradient-to-br from-green-600 to-emerald-700 p-10 rounded-3xl shadow-2xl max-w-md w-full mx-4">
        <button
          onClick={onExit}
          className="absolute top-4 right-6 text-white/80 hover:text-white text-3xl font-light"
        >
          ×
        </button>

        <h2 className="text-4xl font-bold text-white mb-8 text-center">Welcome Back 🐝</h2>

        <form onSubmit={handleSubmit} className="space-y-6">
          <input
            type="text"
            placeholder="Username (optional)"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="w-full px-5 py-4 rounded-xl bg-white/20 placeholder-white/60 text-white border border-white/30 focus:outline-none focus:border-white text-lg"
          />
          <input
            type="password"
            placeholder="Password (optional)"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-5 py-4 rounded-xl bg-white/20 placeholder-white/60 text-white border border-white/30 focus:outline-none focus:border-white text-lg"
          />

          <button
            type="submit"
            className="w-full bg-white text-green-700 font-bold py-4 rounded-xl hover:bg-gray-100 transition text-lg"
          >
            Continue
          </button>
        </form>

        <p className="text-sm text-white/70 text-center mt-6">
          Leave blank → test mode (shared guest data)
        </p>
      </div>
    </div>
  );
};

export default Login;