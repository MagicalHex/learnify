// ------------------------------------------------------------
// src/pages/News.tsx
// ------------------------------------------------------------
const News = ({ onExit }: { onExit: () => void }) => (
<div className="w-full h-screen bg-red-700 text-white p-6">
<button className="text-xl mb-6" onClick={onExit}>← Exit</button>
<h1 className="text-5xl">News</h1>
</div>
)
export default News