'use client';

import { useEffect, useRef, useMemo } from 'react';

interface RedEnvelopeSettings {
  fallSpeed: number;
  rotationSpeed: number;
  windStrength: number;
  sparkleFrequency: number;
  quantity?: number;
}

interface RedEnvelopeEffectProps {
  intensity?: 'low' | 'medium' | 'high';
  redEnvelopeSettings?: RedEnvelopeSettings;
}

interface MouseState {
  x: number;
  y: number;
  lastX: number;
  lastY: number;
  velocityX: number;
  velocityY: number;
  isActive: boolean;
  pointerType: 'mouse' | 'touch' | 'pen' | 'unknown';
  lastMoveAt: number;
}

interface RedEnvelope {
  x: number;
  y: number;
  rotation: number;
  rotationSpeed: number;
  speed: number;
  wind: number;
  size: number;
  flip: number;
  flipSpeed: number;
  velocityY: number;
  velocityX: number;
  hue: number;
  swayPhase: number;
  swaySpeed: number;
}

interface Sparkle {
  x: number;
  y: number;
  size: number;
  opacity: number;
  life: number;
  decay: number;
}

// Mobile tuning constants
const MOBILE_WIND_INFLUENCE = 0.65;
const MOBILE_WIND_RADIUS = 120;
const MOBILE_MIN_MOVEMENT = 3;
const MOBILE_MAX_POINTER_VELOCITY = 18;
const MOBILE_FRICTION = 0.92;
const MOBILE_SWIPE_BOOST = 1.33;
const MOBILE_SWIPE_SPEED_THRESHOLD = 10;

// ----------------- File-level helper functions -----------------

const clamp = (value: number, min: number, max: number) =>
  Math.max(min, Math.min(max, value));

const normalizePointerType = (
  pointerType: string
): MouseState['pointerType'] => {
  if (pointerType === 'mouse' || pointerType === 'touch' || pointerType === 'pen') {
    return pointerType;
  }
  return 'unknown';
};

const createEnvelope = (
  canvasWidth: number,
  settings: RedEnvelopeSettings,
  yStart: number = -100
): RedEnvelope => ({
  x: Math.random() * canvasWidth,
  y: yStart,
  rotation: Math.random() * 360,
  rotationSpeed: (Math.random() - 0.5) * 2 * settings.rotationSpeed,
  speed: Math.random() * 1.5 + 0.5,
  wind: (Math.random() * 0.3 - 0.15) * settings.windStrength,
  size: Math.random() * 15 + 20,
  flip: Math.random() * 2 - 1,
  flipSpeed: (Math.random() - 0.5) * 0.05,
  velocityY: (Math.random() * 0.8 + 0.2) * settings.fallSpeed,
  velocityX: 0,
  hue: Math.random() * 20,
  swayPhase: Math.random() * Math.PI * 2,
  swaySpeed: Math.random() * 1 + 0.5,
});

const drawEnvelope = (
  ctx: CanvasRenderingContext2D,
  envelope: RedEnvelope,
  settings: RedEnvelopeSettings,
  sparklesRef: React.MutableRefObject<Sparkle[]>,
  goldGradient: CanvasGradient | string
) => {
  ctx.save();
  ctx.translate(envelope.x, envelope.y);
  ctx.rotate((envelope.rotation * Math.PI) / 180);

  const width = envelope.size * Math.abs(envelope.flip);
  const height = envelope.size * 1.4;
  const isFront = envelope.flip > 0;
  const cornerRadius = 4;

  ctx.shadowColor = 'rgba(0, 0, 0, 0.3)';
  ctx.shadowBlur = 8;
  ctx.shadowOffsetX = 3;
  ctx.shadowOffsetY = 3;

  ctx.beginPath();
  if (ctx.roundRect) {
    ctx.roundRect(-width / 2, -height / 2, width, height, cornerRadius);
  } else {
    ctx.rect(-width / 2, -height / 2, width, height);
  }
  ctx.clip();

  const gradient = ctx.createLinearGradient(-width / 2, -height / 2, width / 2, height / 2);
  const redHue = 0 + envelope.hue;
  gradient.addColorStop(0, `hsl(${redHue}, 85%, 55%)`);
  gradient.addColorStop(0.5, `hsl(${redHue}, 95%, 45%)`);
  gradient.addColorStop(1, `hsl(${redHue}, 85%, 35%)`);

  ctx.fillStyle = gradient;
  ctx.fillRect(-width / 2, -height / 2, width, height);

  ctx.shadowColor = 'transparent';
  ctx.shadowBlur = 0;
  ctx.shadowOffsetX = 0;
  ctx.shadowOffsetY = 0;

  ctx.strokeStyle = goldGradient;
  ctx.lineWidth = 2.5;

  ctx.beginPath();
  if (ctx.roundRect) {
    ctx.roundRect(-width / 2, -height / 2, width, height, cornerRadius);
  } else {
    ctx.rect(-width / 2, -height / 2, width, height);
  }
  ctx.stroke();

  ctx.strokeStyle = 'rgba(255, 165, 0, 0.7)';
  ctx.lineWidth = 1;
  ctx.strokeRect(-width / 2 + 3, -height / 2 + 3, width - 6, height - 6);

  ctx.fillStyle = 'rgba(255, 215, 0, 0.3)';
  const cornerSize = envelope.size * 0.15;
  ctx.fillRect(-width / 2, -height / 2, cornerSize, cornerSize);
  ctx.fillRect(width / 2 - cornerSize, -height / 2, cornerSize, cornerSize);
  ctx.fillRect(-width / 2, height / 2 - cornerSize, cornerSize, cornerSize);
  ctx.fillRect(width / 2 - cornerSize, height / 2 - cornerSize, cornerSize, cornerSize);

  if (isFront && width > envelope.size * 0.3) {
    ctx.save();
    ctx.scale(Math.abs(envelope.flip), 1);

    ctx.shadowColor = '#FFD700';
    ctx.shadowBlur = 10;

    ctx.fillStyle = goldGradient;
    ctx.font = `bold ${envelope.size * 0.6}px "SimSun", serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('福', 0, 0);

    ctx.shadowBlur = 2;
    ctx.shadowColor = '#8B4513';
    ctx.fillText('福', 0, 0);

    ctx.restore();
  }

  ctx.restore();

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

const drawSparkle = (ctx: CanvasRenderingContext2D, sparkle: Sparkle) => {
  ctx.save();
  ctx.fillStyle = `rgba(255, 215, 0, ${sparkle.opacity * sparkle.life})`;
  ctx.shadowColor = '#FFD700';
  ctx.shadowBlur = 5;

  ctx.beginPath();
  ctx.arc(sparkle.x, sparkle.y, sparkle.size, 0, Math.PI * 2);
  ctx.fill();

  ctx.restore();
};

// ----------------- Main RedEnvelopeEffect Component -----------------

export default function RedEnvelopeEffect({
  intensity = 'medium',
  redEnvelopeSettings,
}: RedEnvelopeEffectProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const envelopesRef = useRef<RedEnvelope[]>([]);
  const sparklesRef = useRef<Sparkle[]>([]);
  const animationFrameRef = useRef<number | undefined>(undefined);

  const mouseRef = useRef<MouseState>({
    x: 0,
    y: 0,
    lastX: 0,
    lastY: 0,
    velocityX: 0,
    velocityY: 0,
    isActive: false,
    pointerType: 'unknown',
    lastMoveAt: 0,
  });

  const settings = useMemo(() => redEnvelopeSettings || {
    fallSpeed: 0.3,
    rotationSpeed: 1.0,
    windStrength: 0.3,
    sparkleFrequency: 0.02,
    quantity: 25,
  }, [redEnvelopeSettings]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    let targetCount = settings.quantity;
    if (!targetCount) {
      targetCount = {
        low: 15,
        medium: 25,
        high: 40,
      }[intensity];
    }
    const maxEnvelopeCount = window.innerWidth < 768 ? 12 : 20;
    targetCount = Math.min(targetCount, maxEnvelopeCount);

    const setPointerOrigin = (
      x: number,
      y: number,
      pointerType: MouseState['pointerType']
    ) => {
      const mouse = mouseRef.current;
      mouse.x = x;
      mouse.y = y;
      mouse.lastX = x;
      mouse.lastY = y;
      mouse.velocityX = 0;
      mouse.velocityY = 0;
      mouse.pointerType = pointerType;
      mouse.isActive = true;
      mouse.lastMoveAt = performance.now();
    };

    const handlePointerDown = (e: PointerEvent) => {
      setPointerOrigin(
        e.clientX,
        e.clientY,
        normalizePointerType(e.pointerType)
      );
    };

    const handlePointerMove = (e: PointerEvent) => {
      const pointerType = normalizePointerType(e.pointerType);
      const mouse = mouseRef.current;

      if (!mouse.isActive) {
        setPointerOrigin(e.clientX, e.clientY, pointerType);
        return;
      }

      const now = performance.now();
      const dt = Math.max(now - mouse.lastMoveAt, 8);
      const dx = e.clientX - mouse.x;
      const dy = e.clientY - mouse.y;
      const distance = Math.hypot(dx, dy);
      const minMovement = pointerType === 'touch' ? MOBILE_MIN_MOVEMENT : 1;

      mouse.lastX = mouse.x;
      mouse.lastY = mouse.y;
      mouse.x = e.clientX;
      mouse.y = e.clientY;
      mouse.pointerType = pointerType;
      mouse.lastMoveAt = now;

      if (distance < minMovement) {
        mouse.velocityX *= 0.5;
        mouse.velocityY *= 0.5;
        return;
      }

      const frameScale = 16 / dt;
      const maxPointerVelocity =
        pointerType === 'touch' ? MOBILE_MAX_POINTER_VELOCITY : 35;
      mouse.velocityX = clamp(dx * frameScale, -maxPointerVelocity, maxPointerVelocity);
      mouse.velocityY = clamp(dy * frameScale, -maxPointerVelocity, maxPointerVelocity);
    };

    const handlePointerInactive = () => {
      const mouse = mouseRef.current;
      mouse.isActive = false;
      mouse.velocityX = 0;
      mouse.velocityY = 0;
      mouse.lastMoveAt = 0;
    };

    window.addEventListener('pointerdown', handlePointerDown, { passive: true });
    window.addEventListener('pointermove', handlePointerMove, { passive: true });
    window.addEventListener('pointerup', handlePointerInactive);
    window.addEventListener('pointercancel', handlePointerInactive);
    window.addEventListener('blur', handlePointerInactive);

    if (envelopesRef.current.length === 0) {
      envelopesRef.current = Array.from({ length: targetCount }, () =>
        createEnvelope(canvas.width, settings, Math.random() * canvas.height - canvas.height)
      );
    } else {
      if (envelopesRef.current.length < targetCount) {
        const needed = targetCount - envelopesRef.current.length;
        for (let i = 0; i < needed; i++) {
          envelopesRef.current.push(createEnvelope(canvas.width, settings, Math.random() * -500));
        }
      } else if (envelopesRef.current.length > targetCount) {
        envelopesRef.current = envelopesRef.current.slice(0, targetCount);
      }

      envelopesRef.current.forEach(env => {
        const dir = Math.sign(env.rotationSpeed) || 1;
        env.rotationSpeed = dir * (Math.random() * 0.5 + 0.5) * settings.rotationSpeed;

        const windDir = Math.sign(env.wind) || (Math.random() > 0.5 ? 1 : -1);
        env.wind = windDir * (Math.random() * 0.3) * settings.windStrength;
      });
    }

    sparklesRef.current = [];

    let time = 0;
    let animationFrameId: number | undefined;

    const animate = () => {
      time += 0.05;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      sparklesRef.current.forEach((sparkle, index) => {
        drawSparkle(ctx, sparkle);
        sparkle.life -= sparkle.decay;
        sparkle.y -= 0.5;

        if (sparkle.life <= 0) {
          sparklesRef.current.splice(index, 1);
        }
      });

      const goldGradient = ctx.createLinearGradient(-15, -15, 15, 15);
      goldGradient.addColorStop(0, '#FFD700');
      goldGradient.addColorStop(0.3, '#FFFACD');
      goldGradient.addColorStop(0.6, '#FFD700');
      goldGradient.addColorStop(1, '#B8860B');

      envelopesRef.current.forEach((envelope: RedEnvelope) => {
        drawEnvelope(ctx, envelope, settings, sparklesRef, goldGradient);

        envelope.velocityY += 0.005;
        const maxVelocity = 2.0 * settings.fallSpeed;
        envelope.velocityY = Math.min(envelope.velocityY, maxVelocity);
        envelope.y += envelope.velocityY;

        if (mouseRef.current.isActive) {
          const mouse = mouseRef.current;
          const dx = envelope.x - mouse.x;
          const dy = envelope.y - mouse.y;
          const distance = Math.sqrt(dx * dx + dy * dy);
          const isTouchPointer = mouse.pointerType === 'touch';
          const windTrailRadius = isTouchPointer ? MOBILE_WIND_RADIUS : 150;
          const pointerInfluence = isTouchPointer ? MOBILE_WIND_INFLUENCE : 1;
          const pointerSpeed = Math.hypot(mouse.velocityX, mouse.velocityY);
          const swipeBoost =
            isTouchPointer && pointerSpeed >= MOBILE_SWIPE_SPEED_THRESHOLD
              ? MOBILE_SWIPE_BOOST
              : 1;

          if (distance < windTrailRadius && distance > 0) {
            const strength = (windTrailRadius - distance) / windTrailRadius;
            envelope.velocityX +=
              mouse.velocityX * strength * 0.12 * pointerInfluence * swipeBoost;
            envelope.velocityY +=
              mouse.velocityY * strength * 0.035 * pointerInfluence * swipeBoost;
          }
        }

        const maxHorizontalVelocity = 1.5 + settings.windStrength * 3;
        const horizontalLimit =
          mouseRef.current.pointerType === 'touch'
            ? Math.max(1.1, maxHorizontalVelocity * 0.8)
            : maxHorizontalVelocity;
        envelope.velocityX = clamp(
          envelope.velocityX,
          -horizontalLimit,
          horizontalLimit
        );
        envelope.x += envelope.velocityX;
        envelope.velocityX *=
          mouseRef.current.pointerType === 'touch' ? MOBILE_FRICTION : 0.95;

        const sway = Math.sin(time * envelope.swaySpeed + envelope.swayPhase);
        envelope.x += envelope.wind + sway * 0.5;

        envelope.rotation += envelope.rotationSpeed;

        envelope.flip += envelope.flipSpeed;
        if (envelope.flip > 1) {
          envelope.flip = 1;
          envelope.flipSpeed = -Math.abs(envelope.flipSpeed);
        } else if (envelope.flip < -1) {
          envelope.flip = -1;
          envelope.flipSpeed = Math.abs(envelope.flipSpeed);
        }

        envelope.velocityY = clamp(envelope.velocityY, -0.6, maxVelocity);

        if (envelope.y > canvas.height + 20) {
          envelope.y = -50;
          envelope.x = Math.random() * canvas.width;
          envelope.rotation = Math.random() * 360;
          envelope.velocityY = (Math.random() * 0.8 + 0.2) * settings.fallSpeed;
          envelope.velocityX = 0;
          envelope.flip = Math.random() * 2 - 1;
          envelope.hue = Math.random() * 20;
          envelope.swayPhase = Math.random() * Math.PI * 2;
        }

        if (envelope.x > canvas.width + 50) {
          envelope.x = -50;
        } else if (envelope.x < -50) {
          envelope.x = canvas.width + 50;
        }
      });

      animationFrameId = requestAnimationFrame(animate);
      animationFrameRef.current = animationFrameId;
    };

    animate();

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      window.removeEventListener('pointerdown', handlePointerDown);
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerup', handlePointerInactive);
      window.removeEventListener('pointercancel', handlePointerInactive);
      window.removeEventListener('blur', handlePointerInactive);
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
      }
    };
  }, [intensity, settings]);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-[9999]"
      style={{ pointerEvents: 'none' }}
    />
  );
}
