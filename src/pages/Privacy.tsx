const Privacy = ({ onExit }: { onExit: () => void }) => {
  return (
    <div className="fixed inset-0 bg-black/90 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-900 rounded-2xl p-8 max-w-3xl w-full max-h-screen overflow-y-auto relative">
        <button
          onClick={onExit}
          className="absolute top-4 right-6 text-white/80 hover:text-white text-3xl"
        >
          ×
        </button>

        <h1 className="text-4xl font-bold text-white mb-8">Privacy Policy</h1>
        <div className="text-white/90 space-y-4 leading-relaxed">
          <p>Last updated: December 31, 2025</p>
          <p>
            We collect only your email and encrypted password to save your personal roadmap.
            Your password is hashed using bcrypt and never stored in plain text.
          </p>
          <p>
            Your roadmap data is private and associated only with your account.
            We do not share or sell your data.
          </p>
          <p>
            Guest mode uses shared test data and stores nothing personal.
          </p>
          <p>
            Compliant with GDPR, CCPA, and applicable privacy laws.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Privacy;