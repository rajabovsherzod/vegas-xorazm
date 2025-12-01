import React, { useState, useLayoutEffect, useRef } from 'react';

export const RippleContainer = () => {
  const [ripples, setRipples] = useState<{ x: number; y: number; size: number; id: number }[]>([]);
  const rippleContainerRef = useRef<HTMLSpanElement>(null); // <-- Ref ishlatamiz

  useLayoutEffect(() => {
    const container = rippleContainerRef.current;
    if (!container) return;

    const parent = container.parentElement; // Tugmani topamiz
    if (!parent) return;

    const handleClick = (e: MouseEvent) => {
      const rect = parent.getBoundingClientRect();
      
      // Koordinatalarni aniq hisoblash
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      
      // O'lchamni tugmaga moslash (kattaroq qilib)
      const size = Math.max(parent.clientWidth, parent.clientHeight) * 2;
      
      const newRipple = { x, y, size, id: Date.now() };
      
      setRipples((prev) => [...prev, newRipple]);
    };

    // "mousedown" tezroq seziladi (click o'rniga)
    parent.addEventListener('mousedown', handleClick);

    return () => {
      parent.removeEventListener('mousedown', handleClick);
    };
  }, []);

  const onAnimationEnd = (id: number) => {
    setRipples((prev) => prev.filter((ripple) => ripple.id !== id));
  };

  return (
    <span 
      ref={rippleContainerRef}
      className="absolute inset-0 overflow-hidden rounded-[inherit] pointer-events-none"
    >
      {ripples.map((ripple) => (
        <span
          key={ripple.id}
          onAnimationEnd={() => onAnimationEnd(ripple.id)}
          className="absolute rounded-full animate-shiny-ripple"
          style={{
            top: ripple.y - ripple.size / 2,
            left: ripple.x - ripple.size / 2,
            width: ripple.size,
            height: ripple.size,
            // 🔥 KUCHLI YALTIROQ GRADIENT
            // O'rtasi oppoq (0.9 opacity), chetlari shaffof
            background: 'radial-gradient(circle, rgba(255,255,255, 0.9) 0%, rgba(255,255,255, 0.4) 40%, transparent 70%)',
          }}
        />
      ))}
    </span>
  );
};