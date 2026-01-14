'use client';

import { useEffect, useRef } from 'react';

interface RedEnvelopeSettings {
  fallSpeed: number;
  rotationSpeed: number;
  windStrength: number;
  sparkleFrequency: number;
}

interface RedEnvelopeEffectProps {
  intensity?: 'low' | 'medium' | 'high';
  redEnvelopeSettings?: RedEnvelopeSettings;
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
  redEnvelopeSettings,
}: RedEnvelopeEffectProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const envelopesRef = useRef<RedEnvelope[]>([]);
  const sparklesRef = useRef<Sparkle[]>([]);
  const animationFrameRef = useRef<number | undefined>(undefined);

  // Default settings if not provided
  const settings = redEnvelopeSettings || {
    fallSpeed: 0.3,
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
      velocityY: (Math.random() * 0.8 + 0.2) * settings.fallSpeed, // Slower initial velocity
      hue: Math.random() * 20, // 0-20 for red color variations
      swayPhase: Math.random() * Math.PI * 2, // Random starting phase for sway
      swaySpeed: Math.random() * 1 + 0.5, // Different sway speeds
    }));

    // Initialize sparkles
    sparklesRef.current = [];

    // Draw enhanced red envelope with 3D effects
    const drawEnvelope = (envelope: RedEnvelope & { swayPhase?: number; swaySpeed?: number }) => {
      ctx.save();
      ctx.translate(envelope.x, envelope.y);
      ctx.rotate((envelope.rotation * Math.PI) / 180);

      const width = envelope.size * Math.abs(envelope.flip); // 3D width based on flip
      const height = envelope.size * 1.4;
      const isFront = envelope.flip > 0;
      const cornerRadius = 4; // Rounded corners

      // Drop shadow for depth
      ctx.shadowColor = 'rgba(0, 0, 0, 0.3)';
      ctx.shadowBlur = 8;
      ctx.shadowOffsetX = 3;
      ctx.shadowOffsetY = 3;

      // Draw rounded rectangle path
      ctx.beginPath();
      // Simple fallback for rounded rect if not supported (though widely supported)
      if (ctx.roundRect) {
        ctx.roundRect(-width / 2, -height / 2, width, height, cornerRadius);
      } else {
        ctx.rect(-width / 2, -height / 2, width, height);
      }
      ctx.clip(); // Clip everything to the rounded shape

      // Main envelope body with gradient (3D effect)
      const gradient = ctx.createLinearGradient(-width / 2, -height / 2, width / 2, height / 2);
      const redHue = 0 + envelope.hue; // 0-20 range for color variety
      gradient.addColorStop(0, `hsl(${redHue}, 85%, 55%)`); // Lighter red
      gradient.addColorStop(0.5, `hsl(${redHue}, 95%, 45%)`); // Richer red center
      gradient.addColorStop(1, `hsl(${redHue}, 85%, 35%)`); // Darker red for depth

      ctx.fillStyle = gradient;
      ctx.fillRect(-width / 2, -height / 2, width, height);

      // Reset shadow for other elements
      ctx.shadowColor = 'transparent';
      ctx.shadowBlur = 0;
      ctx.shadowOffsetX = 0;
      ctx.shadowOffsetY = 0;

      // Double golden border for richness
      const goldGradient = ctx.createLinearGradient(-width/2, -height/2, width/2, height/2);
      goldGradient.addColorStop(0, '#FFD700');
      goldGradient.addColorStop(0.3, '#FFFACD'); // Shiny spot
      goldGradient.addColorStop(0.6, '#FFD700');
      goldGradient.addColorStop(1, '#B8860B'); // Bronze/Dark Gold

      ctx.strokeStyle = goldGradient;
      ctx.lineWidth = 2.5;
      
      // Draw border using the same rounded path
      ctx.beginPath();
      if (ctx.roundRect) {
        ctx.roundRect(-width / 2, -height / 2, width, height, cornerRadius);
      } else {
        ctx.rect(-width / 2, -height / 2, width, height);
      }
      ctx.stroke();

      ctx.strokeStyle = 'rgba(255, 165, 0, 0.7)'; // Orange-ish inner border
      ctx.lineWidth = 1;
      ctx.strokeRect(-width / 2 + 3, -height / 2 + 3, width - 6, height - 6);

      // Inner decorative pattern (subtle corner ornaments)
      ctx.fillStyle = 'rgba(255, 215, 0, 0.3)';
      const cornerSize = envelope.size * 0.15;
      ctx.fillRect(-width / 2, -height / 2, cornerSize, cornerSize);
      ctx.fillRect(width / 2 - cornerSize, -height / 2, cornerSize, cornerSize);
      ctx.fillRect(-width / 2, height / 2 - cornerSize, cornerSize, cornerSize);
      ctx.fillRect(width / 2 - cornerSize, height / 2 - cornerSize, cornerSize, cornerSize);

      if (isFront && width > envelope.size * 0.3) {
        // Content transformation for 3D effect
        ctx.save();
        // Scale the context horizontally based on the flip factor
        // This makes the text look like it's attached to the surface as it rotates
        ctx.scale(Math.abs(envelope.flip), 1);

        // Golden "福" character with glow effect
        ctx.shadowColor = '#FFD700';
        ctx.shadowBlur = 10;

        ctx.fillStyle = goldGradient; // Use gold gradient for text too
        ctx.font = `bold ${envelope.size * 0.6}px "SimSun", serif`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('福', 0, 0);

        // Add subtle text shadow for depth
        ctx.shadowBlur = 2;
        ctx.shadowColor = '#8B4513';
        ctx.fillText('福', 0, 0);
        
        ctx.restore();
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

    // Draw sparkle particles (unchanged)
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
    let time = 0;
    const animate = () => {
      time += 0.05;
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
      envelopesRef.current.forEach((envelope: RedEnvelope & { swayPhase?: number; swaySpeed?: number }) => {
        drawEnvelope(envelope);

        // Update position with smooth physics
        envelope.velocityY += 0.005; // Gentle gravity
        
        // Terminal velocity
        const maxVelocity = 2.0 * settings.fallSpeed;
        envelope.velocityY = Math.min(envelope.velocityY, maxVelocity);

        envelope.y += envelope.velocityY;
        
        // Swaying motion (Sine wave)
        const sway = Math.sin(time * (envelope.swaySpeed || 1) + (envelope.swayPhase || 0));
        envelope.x += envelope.wind + sway * 0.5; // Combine constant wind with swaying

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

        // Reset if out of bounds
        if (envelope.y > canvas.height + 20) {
          envelope.y = -50;
          envelope.x = Math.random() * canvas.width;
          envelope.rotation = Math.random() * 360;
          envelope.velocityY = (Math.random() * 0.8 + 0.2) * settings.fallSpeed;
          envelope.flip = Math.random() * 2 - 1;
          envelope.hue = Math.random() * 20;
          // Reset sway properties
          envelope.swayPhase = Math.random() * Math.PI * 2;
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
