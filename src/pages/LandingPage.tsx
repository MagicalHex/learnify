// ------------------------------------------------------------
// src/pages/LandingPage.tsx
// ------------------------------------------------------------
const LandingPage = ({ onExit }: { onExit: () => void }) => (
<div className="w-full h-screen bg-blue-700 text-white p-6">
<button className="text-xl mb-6" onClick={onExit}>← Exit</button>
<h1 className="text-5xl">Landing Page</h1>
</div>
)
export default LandingPage