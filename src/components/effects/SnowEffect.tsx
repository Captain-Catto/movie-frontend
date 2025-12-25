'use client';

import { useEffect, useRef } from 'react';

interface SnowSettings {
  speed: number;
  density: number;
  size: number;
  windStrength: number;
}

interface SnowEffectProps {
  intensity?: 'low' | 'medium' | 'high';
  snowSettings?: SnowSettings;
}

interface Snowflake {
  x: number;
  y: number;
  radius: number;
  speed: number;
  wind: number;
  opacity: number;
}

export default function SnowEffect({
  intensity = 'medium',
  snowSettings
}: SnowEffectProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const snowflakesRef = useRef<Snowflake[]>([]);
  const animationFrameRef = useRef<number | undefined>(undefined);

  // Default settings if not provided
  const settings = snowSettings || {
    speed: 1.0,
    density: 1.0,
    size: 1.0,
    windStrength: 0.2,
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size
    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    // Snowflake count based on intensity and density setting
    const baseSnowflakeCount = {
      low: 50,
      medium: 100,
      high: 150,
    }[intensity];
    const snowflakeCount = Math.round(baseSnowflakeCount * settings.density);

    // Initialize snowflakes with settings applied
    snowflakesRef.current = Array.from({ length: snowflakeCount }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      radius: (Math.random() * 3 + 1) * settings.size,
      speed: (Math.random() * 1 + 0.5) * settings.speed,
      wind: (Math.random() * 0.5 - 0.25) * settings.windStrength,
      opacity: Math.random() * 0.5 + 0.3,
    }));

    // Animation loop
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      snowflakesRef.current.forEach((flake) => {
        ctx.beginPath();
        ctx.arc(flake.x, flake.y, flake.radius, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255, 255, 255, ${flake.opacity})`;
        ctx.fill();

        // Update position
        flake.y += flake.speed;
        flake.x += flake.wind;

        // Reset snowflake if it goes off screen
        if (flake.y > canvas.height) {
          flake.y = -10;
          flake.x = Math.random() * canvas.width;
        }

        if (flake.x > canvas.width) {
          flake.x = 0;
        } else if (flake.x < 0) {
          flake.x = canvas.width;
        }
      });

      animationFrameRef.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [intensity, settings.speed, settings.density, settings.size, settings.windStrength]);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-[9999]"
      style={{ mixBlendMode: 'screen' }}
    />
  );
}
