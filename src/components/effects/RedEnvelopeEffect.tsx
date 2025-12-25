'use client';

import { useEffect, useRef } from 'react';

interface RedEnvelopeEffectProps {
  intensity?: 'low' | 'medium' | 'high';
}

interface RedEnvelope {
  x: number;
  y: number;
  rotation: number;
  rotationSpeed: number;
  speed: number;
  wind: number;
  size: number;
}

export default function RedEnvelopeEffect({ intensity = 'medium' }: RedEnvelopeEffectProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const envelopesRef = useRef<RedEnvelope[]>([]);
  const animationFrameRef = useRef<number>();

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

    // Envelope count based on intensity
    const envelopeCount = {
      low: 15,
      medium: 25,
      high: 40,
    }[intensity];

    // Initialize red envelopes
    envelopesRef.current = Array.from({ length: envelopeCount }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height - canvas.height,
      rotation: Math.random() * 360,
      rotationSpeed: (Math.random() - 0.5) * 2,
      speed: Math.random() * 1.5 + 0.5,
      wind: Math.random() * 0.3 - 0.15,
      size: Math.random() * 15 + 20,
    }));

    // Draw red envelope
    const drawEnvelope = (envelope: RedEnvelope) => {
      ctx.save();
      ctx.translate(envelope.x, envelope.y);
      ctx.rotate((envelope.rotation * Math.PI) / 180);

      const width = envelope.size;
      const height = envelope.size * 1.4;

      // Envelope body (red)
      ctx.fillStyle = '#D32F2F';
      ctx.fillRect(-width / 2, -height / 2, width, height);

      // Golden border
      ctx.strokeStyle = '#FFD700';
      ctx.lineWidth = 2;
      ctx.strokeRect(-width / 2, -height / 2, width, height);

      // Golden symbol (福 - Fu character simplified)
      ctx.fillStyle = '#FFD700';
      ctx.font = `${envelope.size * 0.6}px Arial`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('福', 0, 0);

      ctx.restore();
    };

    // Animation loop
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      envelopesRef.current.forEach((envelope) => {
        drawEnvelope(envelope);

        // Update position and rotation
        envelope.y += envelope.speed;
        envelope.x += envelope.wind;
        envelope.rotation += envelope.rotationSpeed;

        // Reset envelope if it goes off screen
        if (envelope.y > canvas.height + 50) {
          envelope.y = -50;
          envelope.x = Math.random() * canvas.width;
          envelope.rotation = Math.random() * 360;
        }

        if (envelope.x > canvas.width + 50) {
          envelope.x = -50;
        } else if (envelope.x < -50) {
          envelope.x = canvas.width + 50;
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
  }, [intensity]);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-[9999]"
    />
  );
}
