// ------------------------------------------------------------
// src/NavExplorer.tsx
// ------------------------------------------------------------
import LandingPage from './pages/LandingPage';
import Login from './pages/Login';
import Register from './pages/Register';
import Learn from './pages/Learn';
import Roadmap from './pages/Roadmap';
import News from './pages/News';
import Story from './pages/Story';
import { useState, useRef, useEffect } from 'react';

const SpaceBackground = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationIdRef = useRef<number | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener('resize', resize);

    // Stars
    const stars: { x: number; y: number; size: number; opacity: number; speed: number }[] = [];
    for (let i = 0; i < 20; i++) {
      stars.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        size: Math.random() * 1.8 + 0.5,
        opacity: Math.random() * 0.7 + 0.3,
        speed: 0.02 + Math.random() * 0.04,
      });
    }

const draw = () => {
  ctx.fillStyle = '#000000';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  const horizonY = canvas.height * 0.35;
  const vanishX = canvas.width / 2;

  // === ONE SINGLE isometric ring – enhanced to "lay down" better ===
  const progress = 2.3 / 6; // Closest depth level
  const y = horizonY + (canvas.height - horizonY) * progress;
  const radius = (canvas.width * 1.2) * progress;

  // Save context for transformations
  ctx.save();

  // Apply isometric tilt: move to center, scale vertically for "laying down" feel
  ctx.translate(vanishX, y);
  ctx.scale(1, 0.5); // Squish Y-axis to make it tilt back (adjust 0.75 for more/less tilt)
  ctx.translate(-vanishX, -y);

  // Draw the ring
  ctx.lineWidth = 2;
  ctx.strokeStyle = 'rgba(120, 200, 255, 0.4)';
  ctx.beginPath();
  ctx.arc(vanishX, y, radius, 0, Math.PI * 2);
  ctx.stroke();

  // Inner glow
  ctx.lineWidth = 8;
  ctx.strokeStyle = 'rgba(140, 220, 255, 0.15)';
  ctx.beginPath();
  ctx.arc(vanishX, y, radius * 0.95, 0, Math.PI * 2);
  ctx.stroke();

  // Restore context after tilt
  ctx.restore();

  // === Soft shadow underneath (to ground it on the plane) ===
  // === Very subtle shadow underneath (greatly reduced) ===
  // === Very subtle shadow underneath (even smaller and less visible) ===
  const shadowGradient = ctx.createRadialGradient(vanishX, y + radius * 1.0, 0, vanishX, y + radius * 1.0, radius * 1.1);
  shadowGradient.addColorStop(0, 'rgba(0, 0, 0, 0.02)');   // Barely visible
  shadowGradient.addColorStop(0.5, 'rgba(0, 0, 0, 0.005)');
  shadowGradient.addColorStop(1, 'transparent');

  ctx.fillStyle = shadowGradient;
  ctx.beginPath();
  ctx.ellipse(vanishX, y + radius * 0.25, radius * 1.0, radius * 0.4, 0, 0, Math.PI * 2); // Smaller ellipse
  ctx.fill();

  // === Outer soft aura (toned down further) ===
  const auraGradient = ctx.createRadialGradient(vanishX, y, radius * 0.9, vanishX, y, radius * 1.3);
  auraGradient.addColorStop(0, 'rgba(100, 180, 255, 0.05)');  // Even fainter
  auraGradient.addColorStop(0.5, 'rgba(120, 200, 255, 0.01)');
  auraGradient.addColorStop(1, 'transparent');

  ctx.fillStyle = auraGradient;
  ctx.beginPath();
  ctx.arc(vanishX, y, radius * 2.0, 0, Math.PI * 2);
  ctx.fill();

  // === Stars (on top) ===
  stars.forEach(star => {
    star.y += star.speed;
    if (star.y > canvas.height) {
      star.y = 0;
      star.x = Math.random() * canvas.width;
    }

    ctx.fillStyle = `rgba(255, 255, 255, ${star.opacity})`;
    ctx.beginPath();
    ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
    ctx.fill();
  });
};

    const animate = () => {
      draw();
      animationIdRef.current = requestAnimationFrame(animate);
    };

    animate();

    window.addEventListener('resize', resize);

    return () => {
      window.removeEventListener('resize', resize);
      if (animationIdRef.current) cancelAnimationFrame(animationIdRef.current);
    };
  }, []);

  return <canvas ref={canvasRef} className="fixed inset-0 -z-10 pointer-events-none" />;
};

const NavExplorer = () => {
  const [current, setCurrent] = useState<string | null>(null);
  const [isLoginOpen, setIsLoginOpen] = useState(false);
const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  const components: Record<string, React.FC<{ onExit: () => void }>> = {
    Landing: LandingPage,
    Login,
    Register,
    Story,
    News,
    Learn,
    Roadmap
  };

  const handleClick = (page: string) => {
    if (components[page]) {
      setCurrent(page);
    } else {
      console.log(`${page} page coming soon!`);
    }
  };

  if (current) {
    const Comp = components[current];
    return <Comp onExit={() => setCurrent(null)} />;
  }

  return (
    <>
      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-20px); }
        }
        .animate-float {
          animation: float 12s ease-in-out infinite;
        }
        .iso-container {
          perspective: 1200px;
        }
        .iso-button {
          transform: rotateX(18deg);
          transition: all 0.3s ease;
        }
        .iso-button:hover {
          transform: rotateX(18deg) translateY(-10px) scale(1.12);
          box-shadow: 0 30px 40px rgba(0, 0, 0, 0.5);
        }
      `}</style>

      <SpaceBackground />

      <div className="relative w-full h-screen flex items-center justify-center iso-container">
        <div className="grid grid-cols-5 grid-rows-5 gap-2 max-w-5xl">

          {/* Row 1 */}
          <div />
          <div />
<button
  onClick={() => handleClick('Landing')}
  className="
    opacity-95
    bg-gradient-to-b
    from-gray-950
    via-blue-800
    to-gray-950
    hover:via-blue-700
    iso-button
    rounded-full
    w-16 h-16
    flex items-center justify-center
    shadow-2xl
    border border-blue-950
    animate-float
    translate-y-8"
  style={{
    boxShadow:
      '0 10px 4px rgba(0, 0, 0, 0.6), 0 0 4px rgba(43, 0, 135, 0.3)',
  }}> 
  <span className="font-bold text-white text-sm drop-shadow-md">Home</span>
</button>

          <div />
          <div />

          {/* Row 2 */}
          <div />
<button
  onClick={() => handleClick('Nothing')}
  className="
    opacity-95
    bg-gradient-to-b from-gray-950 via-purple-800 to-gray-950
    hover:via-purple-700
    iso-button rounded-full w-16 h-16
    flex items-center justify-center
    shadow-2xl border border-purple-950
    animate-float
  "
  style={{
    boxShadow:
      '0 10px 4px rgba(0, 0, 0, 0.6), 0 0 4px rgba(43, 0, 135, 0.3)',
  }}> 

            <span className="font-bold text-white text-sm drop-shadow-md"></span>
          </button>
          <div />
<button
  onClick={() => handleClick('Login')}
  className="
    opacity-95
    bg-gradient-to-b from-gray-950 via-indigo-800 to-gray-950
    hover:via-indigo-700
    iso-button rounded-full w-16 h-16
    flex items-center justify-center
    shadow-2xl border border-indigo-950
    animate-float
  "
>

            <span className="font-bold text-white text-sm drop-shadow-md">Login</span>
          </button>
          <div />

          {/* Row 3 */}
<button
  onClick={() => handleClick('Story')}
  className="
    opacity-95
    bg-gradient-to-b from-gray-950 via-teal-800 to-gray-950
    hover:via-teal-700
    iso-button rounded-full w-16 h-16
    flex items-center justify-center
    shadow-2xl border border-teal-950
    animate-float translate-x-8
  "
  style={{
    boxShadow:
      '0 10px 4px rgba(0, 0, 0, 0.6), 0 0 4px rgba(21, 0, 66, 0.3)',
  }}> 

            <span className="font-bold text-white text-2xl drop-shadow-md">🐝</span>
          </button>
          <div />
          <div /> {/* Center empty */}
          <div />
<button
  onClick={() => handleClick('Register')}
  className="
    opacity-95
    bg-gradient-to-b from-gray-950 via-cyan-800 to-gray-950
    hover:via-cyan-700
    iso-button rounded-full w-16 h-16
    flex items-center justify-center
    shadow-2xl border border-cyan-950
    animate-float -translate-x-6
  "
  style={{
    boxShadow:
      '0 10px 4px rgba(0, 0, 0, 0.6), 0 0 4px rgba(43, 0, 135, 0.3)',
  }}> 

            <span className="font-bold text-white text-sm drop-shadow-md">Register</span>
          </button>

          {/* Row 4 */}
          <div />
<button
  onClick={() => handleClick('Roadmap')}
  className="
    opacity-95
    bg-gradient-to-b from-gray-950 via-green-800 to-gray-950
    hover:via-green-700
    iso-button rounded-full w-16 h-16
    flex items-center justify-center
    shadow-2xl border border-green-950
    animate-float translate-y-1 -translate-x-1
  "
  style={{
    boxShadow:
      '0 10px 4px rgba(0, 0, 0, 0.6), 0 0 4px rgba(43, 0, 135, 0.3)',
  }}> 

            <span className="font-bold text-white text-sm drop-shadow-md">Roadmap</span>
          </button>
          <div />
<button
  onClick={() => handleClick('Learn')}
  className="
    opacity-95
    bg-gradient-to-b from-gray-950 via-emerald-800 to-gray-950
    hover:via-emerald-700
    iso-button rounded-full w-16 h-16
    flex items-center justify-center
    shadow-2xl border border-emerald-950
    animate-float translate-y-1 translate-x-2
    shadow-[0_0_8px_rgba(134,239,172,0.6)]
  "
  style={{
    boxShadow:
      '0 10px 4px rgba(0, 0, 0, 0.6), 0 0 4px rgba(43, 0, 135, 0.3)',
  }}> 

            <span className="font-bold text-white text-sm drop-shadow-md">Learn</span>
          </button>
          <div />

          {/* Row 5 */}
          <div />
          <div />
<button
  onClick={() => handleClick('Insights')}
  className="
    opacity-95
    bg-gradient-to-b from-gray-950 via-orange-800 to-gray-950
    hover:via-orange-700
    iso-button rounded-full w-16 h-16
    flex items-center justify-center
    shadow-2xl border border-gray-900
    animate-float -translate-y-8
  "
  style={{
    boxShadow:
      '0 10px 4px rgba(0, 0, 0, 0.6), 0 0 4px rgba(43, 0, 135, 0.3)',
  }}> 

            <span className="font-bold text-white text-sm drop-shadow-md">Insights</span>
          </button>
          <div />
          <div />
        </div>
      </div>
    </>
  );
};

export default NavExplorer;