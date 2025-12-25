// ------------------------------------------------------------
// src/pages/Register.tsx
// ------------------------------------------------------------
const Register = ({ onExit }: { onExit: () => void }) => (
<div className="w-full h-screen bg-purple-700 text-white p-6">
<button className="text-xl mb-6" onClick={onExit}>← Exit</button>
<h1 className="text-5xl">Register</h1>
</div>
)
export default Register