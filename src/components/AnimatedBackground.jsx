import React, { useMemo } from 'react';
import { MapPin, MessageCircle, Search, Store, BarChart3, Users } from 'lucide-react';

export default function AnimatedBackground({ children }) {
  const iconsData = useMemo(() => [
    { Icon: MapPin, size: 36, top: '12%', left: '15%', opacity: 0.08, anim: 'animate-float-1' },
    { Icon: MessageCircle, size: 40, top: '18%', left: '80%', opacity: 0.10, anim: 'animate-float-2' },
    { Icon: Search, size: 28, top: '45%', left: '8%', opacity: 0.07, anim: 'animate-float-3' },
    { Icon: Store, size: 44, top: '52%', left: '88%', opacity: 0.09, anim: 'animate-float-4' },
    { Icon: BarChart3, size: 32, top: '80%', left: '12%', opacity: 0.06, anim: 'animate-float-5' },
    { Icon: Users, size: 48, top: '78%', left: '82%', opacity: 0.11, anim: 'animate-float-6' },
    { Icon: MapPin, size: 42, top: '25%', left: '58%', opacity: 0.08, anim: 'animate-float-3' },
    { Icon: MessageCircle, size: 30, top: '72%', left: '30%', opacity: 0.09, anim: 'animate-float-5' },
    { Icon: Search, size: 36, top: '28%', left: '32%', opacity: 0.07, anim: 'animate-float-1' },
    { Icon: Store, size: 32, top: '65%', left: '68%', opacity: 0.10, anim: 'animate-float-2' },
    { Icon: BarChart3, size: 40, top: '10%', left: '48%', opacity: 0.08, anim: 'animate-float-6' },
    { Icon: Users, size: 34, top: '85%', left: '46%', opacity: 0.07, anim: 'animate-float-4' },
  ], []);

  return (
    <div className="relative min-h-screen w-screen overflow-x-hidden bg-[#090d16] flex items-center justify-center p-4">
      {/* Layer 1 - Subtle Grid */}
      <div className="absolute inset-0 bg-grid-pattern pointer-events-none z-0" />
      
      {/* Central Radial Glow behind the login card */}
      <div className="absolute inset-0 radial-glow pointer-events-none z-0" />

      {/* Layer 2 - Floating Icons */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
        {iconsData.map((item, idx) => {
          const { Icon, size, top, left, opacity, anim } = item;
          return (
            <div
              key={idx}
              className={`absolute text-indigo-500 ${anim}`}
              style={{
                top,
                left,
                opacity,
                width: size,
                height: size,
              }}
            >
              <Icon size={size} strokeWidth={1.5} />
            </div>
          );
        })}
      </div>

      {/* Login Card / Content */}
      <div className="relative z-10 w-full flex justify-center items-center">
        {children}
      </div>
    </div>
  );
}
