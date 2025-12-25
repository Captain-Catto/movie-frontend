'use client';

import { useEffect, useRef } from 'react';

interface AdvancedEffectSettings {
  fallSpeed: number;
  rotationSpeed: number;
  windStrength: number;
  sparkleFrequency: number;
}

interface RedEnvelopeEffectProps {
  intensity?: 'low' | 'medium' | 'high';
  advancedSettings?: AdvancedEffectSettings;
}

interface RedEnvelope {
  x: number;
  y: number;
  rotation: number;
  rotationSpeed: number;
  speed: number;
  wind: number;
  size: number;
  flip: number; // For 3D flip effect (-1 to 1)
  flipSpeed: number;
  velocityY: number; // For bounce effect
  hue: number; // Color variation (0-20 for red shades)
}

interface Sparkle {
  x: number;
  y: number;
  size: number;
  opacity: number;
  life: number; // 0 to 1
  decay: number;
}

export default function RedEnvelopeEffect({
  intensity = 'medium',
  advancedSettings,
}: RedEnvelopeEffectProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const envelopesRef = useRef<RedEnvelope[]>([]);
  const sparklesRef = useRef<Sparkle[]>([]);
  const animationFrameRef = useRef<number | undefined>(undefined);

  // Default advanced settings if not provided
  const settings = advancedSettings || {
    fallSpeed: 0.8,
    rotationSpeed: 1.0,
    windStrength: 0.3,
    sparkleFrequency: 0.02,
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

    // Envelope count based on intensity
    const envelopeCount = {
      low: 15,
      medium: 25,
      high: 40,
    }[intensity];

    // Initialize red envelopes with enhanced properties using advanced settings
    envelopesRef.current = Array.from({ length: envelopeCount }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height - canvas.height,
      rotation: Math.random() * 360,
      rotationSpeed: (Math.random() - 0.5) * 2 * settings.rotationSpeed,
      speed: Math.random() * 1.5 + 0.5,
      wind: (Math.random() * 0.3 - 0.15) * settings.windStrength,
      size: Math.random() * 15 + 20,
      flip: Math.random() * 2 - 1, // -1 to 1
      flipSpeed: (Math.random() - 0.5) * 0.05,
      velocityY: (Math.random() * 1.5 + 0.5) * settings.fallSpeed,
      hue: Math.random() * 20, // 0-20 for red color variations
    }));

    // Initialize sparkles
    sparklesRef.current = [];

    // Draw enhanced red envelope with 3D effects
    const drawEnvelope = (envelope: RedEnvelope) => {
      ctx.save();
      ctx.translate(envelope.x, envelope.y);
      ctx.rotate((envelope.rotation * Math.PI) / 180);

      const width = envelope.size * Math.abs(envelope.flip); // 3D width based on flip
      const height = envelope.size * 1.4;
      const isFront = envelope.flip > 0;

      // Drop shadow for depth
      ctx.shadowColor = 'rgba(0, 0, 0, 0.3)';
      ctx.shadowBlur = 8;
      ctx.shadowOffsetX = 3;
      ctx.shadowOffsetY = 3;

      // Main envelope body with gradient (3D effect)
      const gradient = ctx.createLinearGradient(-width / 2, -height / 2, width / 2, height / 2);
      const redHue = 0 + envelope.hue; // 0-20 range for color variety
      gradient.addColorStop(0, `hsl(${redHue}, 75%, 55%)`); // Lighter red
      gradient.addColorStop(0.5, `hsl(${redHue}, 85%, 45%)`); // Main red
      gradient.addColorStop(1, `hsl(${redHue}, 75%, 35%)`); // Darker red for depth

      ctx.fillStyle = gradient;
      ctx.fillRect(-width / 2, -height / 2, width, height);

      // Reset shadow for other elements
      ctx.shadowColor = 'transparent';
      ctx.shadowBlur = 0;
      ctx.shadowOffsetX = 0;
      ctx.shadowOffsetY = 0;

      // Double golden border for richness
      ctx.strokeStyle = '#FFD700';
      ctx.lineWidth = 2.5;
      ctx.strokeRect(-width / 2, -height / 2, width, height);

      ctx.strokeStyle = '#FFA500';
      ctx.lineWidth = 1;
      ctx.strokeRect(-width / 2 + 3, -height / 2 + 3, width - 6, height - 6);

      // Inner decorative pattern (subtle corner ornaments)
      ctx.fillStyle = 'rgba(255, 215, 0, 0.3)';
      const cornerSize = envelope.size * 0.15;
      // Top-left corner
      ctx.fillRect(-width / 2, -height / 2, cornerSize, cornerSize);
      // Top-right corner
      ctx.fillRect(width / 2 - cornerSize, -height / 2, cornerSize, cornerSize);
      // Bottom-left corner
      ctx.fillRect(-width / 2, height / 2 - cornerSize, cornerSize, cornerSize);
      // Bottom-right corner
      ctx.fillRect(width / 2 - cornerSize, height / 2 - cornerSize, cornerSize, cornerSize);

      if (isFront && width > envelope.size * 0.3) {
        // Golden "福" character with glow effect
        ctx.shadowColor = '#FFD700';
        ctx.shadowBlur = 10;

        ctx.fillStyle = '#FFD700';
        ctx.font = `bold ${envelope.size * 0.6}px "SimSun", serif`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('福', 0, 0);

        // Add subtle text shadow for depth
        ctx.shadowBlur = 5;
        ctx.shadowColor = '#8B4513';
        ctx.shadowOffsetX = 1;
        ctx.shadowOffsetY = 1;
        ctx.fillStyle = '#FFEC8B';
        ctx.fillText('福', 0, 0);
      }

      ctx.restore();

      // Generate sparkles occasionally (based on advanced settings)
      if (Math.random() < settings.sparkleFrequency && sparklesRef.current.length < 100) {
        sparklesRef.current.push({
          x: envelope.x + (Math.random() - 0.5) * width,
          y: envelope.y + (Math.random() - 0.5) * height,
          size: Math.random() * 2 + 1,
          opacity: 1,
          life: 1,
          decay: 0.02 + Math.random() * 0.03,
        });
      }
    };

    // Draw sparkle particles
    const drawSparkle = (sparkle: Sparkle) => {
      ctx.save();
      ctx.fillStyle = `rgba(255, 215, 0, ${sparkle.opacity * sparkle.life})`;
      ctx.shadowColor = '#FFD700';
      ctx.shadowBlur = 5;

      // Star shape
      ctx.beginPath();
      ctx.arc(sparkle.x, sparkle.y, sparkle.size, 0, Math.PI * 2);
      ctx.fill();

      ctx.restore();
    };

    // Animation loop with enhanced physics
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Draw and update sparkles first (background layer)
      sparklesRef.current.forEach((sparkle, index) => {
        drawSparkle(sparkle);

        // Update sparkle life
        sparkle.life -= sparkle.decay;
        sparkle.y -= 0.5; // Float upward slowly

        // Remove dead sparkles
        if (sparkle.life <= 0) {
          sparklesRef.current.splice(index, 1);
        }
      });

      // Draw and update envelopes
      envelopesRef.current.forEach((envelope) => {
        drawEnvelope(envelope);

        // Update position with smooth physics
        envelope.velocityY += 0.02; // Gentle gravity effect
        envelope.y += envelope.velocityY;
        envelope.x += envelope.wind;

        // Update rotation with smoother animation
        envelope.rotation += envelope.rotationSpeed;

        // Update 3D flip effect for realistic tumbling
        envelope.flip += envelope.flipSpeed;
        if (envelope.flip > 1) {
          envelope.flip = 1;
          envelope.flipSpeed = -Math.abs(envelope.flipSpeed);
        } else if (envelope.flip < -1) {
          envelope.flip = -1;
          envelope.flipSpeed = Math.abs(envelope.flipSpeed);
        }

        // Bounce effect when hitting bottom (subtle)
        if (envelope.y > canvas.height + 20) {
          // Reset to top with new random properties
          envelope.y = -50;
          envelope.x = Math.random() * canvas.width;
          envelope.rotation = Math.random() * 360;
          envelope.velocityY = Math.random() * 1.5 + 0.5;
          envelope.flip = Math.random() * 2 - 1;
          envelope.flipSpeed = (Math.random() - 0.5) * 0.05;
          envelope.hue = Math.random() * 20;
        }

        // Wrap horizontally with smooth transition
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
  }, [intensity, settings.fallSpeed, settings.rotationSpeed, settings.windStrength, settings.sparkleFrequency]);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-[9999]"
    />
  );
}
