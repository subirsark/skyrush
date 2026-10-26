import React, { useEffect, useRef, useState } from 'react';
import { GameRound } from '../types/index.ts';
import { soundManager } from '../services/audio.ts';

interface FlightCanvasProps {
  round: GameRound | null;
  serverTimeOffset: number;
}

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  alpha: number;
  color: string;
}

export const FlightCanvas: React.FC<FlightCanvasProps> = ({ round, serverTimeOffset }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const particlesRef = useRef<Particle[]>([]);
  const explosionParticlesRef = useRef<Particle[]>([]);
  const lastStatusRef = useRef<string>('');
  const lastSecRef = useRef<number>(-1);
  const [displayMultiplier, setDisplayMultiplier] = useState<number>(1.00);
  const [countdownRemaining, setCountdownRemaining] = useState<number>(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let destroyed = false;

    // Handle high DPI
    const resizeCanvas = () => {
      const rect = canvas.getBoundingClientRect();
      const dpr = window.devicePixelRatio || 1;
      canvas.width = Math.floor(rect.width * dpr);
      canvas.height = Math.floor(rect.height * dpr);
      ctx.scale(dpr, dpr);
    };

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    const render = () => {
      if (destroyed || !canvas) return;
      const rect = canvas.getBoundingClientRect();
      const width = rect.width;
      const height = rect.height;

      // Clear frame
      ctx.fillStyle = '#060913';
      ctx.fillRect(0, 0, width, height);

      // Draw subtle background grid
      ctx.lineWidth = 1;
      ctx.strokeStyle = 'rgba(30, 41, 59, 0.4)';

      // Grid lines
      const gridCols = 8;
      const gridRows = 6;
      for (let i = 1; i < gridCols; i++) {
        const x = (width / gridCols) * i;
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
        ctx.stroke();
      }
      for (let j = 1; j < gridRows; j++) {
        const y = (height / gridRows) * j;
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
      }

      const now = Date.now() + serverTimeOffset;

      if (!round) {
        animationFrameRef.current = requestAnimationFrame(render);
        return;
      }

      // Detect status changes for audio effects
      if (lastStatusRef.current !== round.status) {
        if (round.status === 'IN_FLIGHT') {
          soundManager.startEngine(1.0);
          explosionParticlesRef.current = [];
        } else if (round.status === 'CRASHED') {
          soundManager.playCrashSound();
          // Spawn explosion particles
          const jetX = width * 0.78;
          const jetY = height * 0.28;
          for (let i = 0; i < 45; i++) {
            const angle = Math.random() * Math.PI * 2;
            const speed = 2 + Math.random() * 6;
            explosionParticlesRef.current.push({
              x: jetX,
              y: jetY,
              vx: Math.cos(angle) * speed,
              vy: Math.sin(angle) * speed,
              size: 2 + Math.random() * 4,
              alpha: 1.0,
              color: Math.random() > 0.4 ? '#f43f5e' : '#f59e0b',
            });
          }
        } else if (round.status === 'COUNTDOWN') {
          soundManager.stopEngine();
          explosionParticlesRef.current = [];
        }
        lastStatusRef.current = round.status;
      }

      // ----------------------------------------------
      // 1. COUNTDOWN STATE
      // ----------------------------------------------
      if (round.status === 'COUNTDOWN') {
        const remainingMs = Math.max(0, round.countdownEndsAt - now);
        const remainingSec = (remainingMs / 1000);
        setCountdownRemaining(remainingSec);
        setDisplayMultiplier(1.00);

        // Sound pip for each integer second
        const secInt = Math.ceil(remainingSec);
        if (secInt !== lastSecRef.current && secInt > 0 && secInt <= 5) {
          lastSecRef.current = secInt;
          soundManager.playCountdownPip(secInt === 1);
        }

        // Draw Countdown Radar Dial
        const centerX = width / 2;
        const centerY = height / 2;
        const radius = Math.min(width, height) * 0.22;

        const totalCountdownMs = 5000;
        const progress = Math.min(1, Math.max(0, remainingMs / totalCountdownMs));

        // Dial Outer Glow
        ctx.beginPath();
        ctx.arc(centerX, centerY, radius + 4, 0, Math.PI * 2);
        ctx.strokeStyle = 'rgba(6, 182, 212, 0.15)';
        ctx.lineWidth = 4;
        ctx.stroke();

        // Dial Progress Arc
        ctx.beginPath();
        ctx.arc(centerX, centerY, radius, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * progress);
        ctx.strokeStyle = '#06b6d4';
        ctx.lineWidth = 6;
        ctx.lineCap = 'round';
        ctx.stroke();

        // Pulsing radar sweep
        const sweepAngle = (now / 400) % (Math.PI * 2);
        ctx.beginPath();
        ctx.moveTo(centerX, centerY);
        ctx.arc(centerX, centerY, radius - 4, sweepAngle, sweepAngle + 0.3);
        ctx.fillStyle = 'rgba(6, 182, 212, 0.08)';
        ctx.fill();

        // Jet resting on runway waiting for takeoff
        const runwayJetX = width * 0.12;
        const runwayJetY = height * 0.78;
        drawJet(ctx, runwayJetX, runwayJetY, 0, false);
      }

      // ----------------------------------------------
      // 2. IN_FLIGHT & CRASHED STATES
      // ----------------------------------------------
      if (round.status === 'IN_FLIGHT' || round.status === 'CRASHED') {
        const isCrashed = round.status === 'CRASHED';

        let mult = 1.00;
        let elapsedSec = 0;

        if (round.status === 'IN_FLIGHT') {
          elapsedSec = Math.max(0, (now - round.startTime) / 1000);
          // Calculate client multiplier based on speed
          const rawMult = Math.exp(0.065 * elapsedSec);
          mult = Math.max(1.00, Math.floor(rawMult * 100) / 100);
          // Cap at crash point if already reached on client
          if (mult >= round.crashMultiplier) {
            mult = round.crashMultiplier;
          }
          soundManager.updateEnginePitch(mult);
        } else {
          mult = round.crashMultiplier;
          elapsedSec = round.crashedAtTime
            ? (round.crashedAtTime - round.startTime) / 1000
            : 5;
        }

        setDisplayMultiplier(mult);

        // Curve trajectory coordinates
        // Origin bottom-left with margin
        const originX = width * 0.08;
        const originY = height * 0.85;

        // Dynamic flight target endpoint
        // Curves up towards top-right
        const maxTimeForScale = Math.max(12, elapsedSec + 4);
        const maxMultForScale = Math.max(4.0, mult * 1.35);

        const progressX = Math.min(0.85, (elapsedSec / maxTimeForScale) * 0.9);
        const progressY = Math.min(0.75, ((mult - 1.0) / (maxMultForScale - 1.0)) * 0.8);

        const currentJetX = originX + (width - originX - 60) * (0.15 + progressX * 0.85);
        const currentJetY = originY - (originY - 80) * (0.1 + progressY * 0.9);

        // Calculate tangent flight angle
        const flightAngle = Math.atan2(
          currentJetY - (originY - (originY - currentJetY) * 0.7),
          currentJetX - (originX + (currentJetX - originX) * 0.7)
        );

        // Draw trajectory glow under-curve
        const gradient = ctx.createLinearGradient(originX, currentJetY, originX, originY);
        gradient.addColorStop(0, 'rgba(6, 182, 212, 0.25)');
        gradient.addColorStop(0.6, 'rgba(147, 51, 234, 0.08)');
        gradient.addColorStop(1, 'rgba(6, 9, 19, 0)');

        ctx.beginPath();
        ctx.moveTo(originX, originY);

        // Quadratic bezier flight curve
        const controlX = originX + (currentJetX - originX) * 0.45;
        const controlY = originY;

        ctx.quadraticCurveTo(controlX, controlY, currentJetX, currentJetY);
        ctx.lineTo(currentJetX, originY);
        ctx.closePath();
        ctx.fillStyle = gradient;
        ctx.fill();

        // Draw vibrant curve stroke
        ctx.beginPath();
        ctx.moveTo(originX, originY);
        ctx.quadraticCurveTo(controlX, controlY, currentJetX, currentJetY);
        ctx.strokeStyle = isCrashed ? '#f43f5e' : '#06b6d4';
        ctx.lineWidth = 4;
        ctx.shadowColor = isCrashed ? '#f43f5e' : '#06b6d4';
        ctx.shadowBlur = 12;
        ctx.stroke();
        ctx.shadowBlur = 0;

        // Plasma Thrust Particles during flight
        if (!isCrashed) {
          const rearX = currentJetX - Math.cos(flightAngle) * 24;
          const rearY = currentJetY - Math.sin(flightAngle) * 24;

          for (let p = 0; p < 3; p++) {
            particlesRef.current.push({
              x: rearX + (Math.random() - 0.5) * 4,
              y: rearY + (Math.random() - 0.5) * 4,
              vx: -Math.cos(flightAngle) * (3 + Math.random() * 4) + (Math.random() - 0.5) * 2,
              vy: -Math.sin(flightAngle) * (3 + Math.random() * 4) + (Math.random() - 0.5) * 2,
              size: 2 + Math.random() * 3,
              alpha: 0.9,
              color: Math.random() > 0.3 ? '#06b6d4' : '#c084fc',
            });
          }
        }

        // Draw and update active thrust particles
        for (let i = particlesRef.current.length - 1; i >= 0; i--) {
          const pt = particlesRef.current[i];
          pt.x += pt.vx;
          pt.y += pt.vy;
          pt.alpha -= 0.04;
          pt.size *= 0.96;

          if (pt.alpha <= 0 || pt.size <= 0.5) {
            particlesRef.current.splice(i, 1);
            continue;
          }

          ctx.beginPath();
          ctx.arc(pt.x, pt.y, pt.size, 0, Math.PI * 2);
          ctx.fillStyle = pt.color;
          ctx.globalAlpha = Math.max(0, pt.alpha);
          ctx.fill();
          ctx.globalAlpha = 1.0;
        }

        // Render Jet if not exploded
        if (!isCrashed) {
          drawJet(ctx, currentJetX, currentJetY, flightAngle, true);
        } else {
          // Render Explosion sparks
          for (let i = explosionParticlesRef.current.length - 1; i >= 0; i--) {
            const ep = explosionParticlesRef.current[i];
            ep.x += ep.vx;
            ep.y += ep.vy;
            ep.alpha -= 0.025;
            ep.size *= 0.98;

            if (ep.alpha <= 0) {
              explosionParticlesRef.current.splice(i, 1);
              continue;
            }

            ctx.beginPath();
            ctx.arc(ep.x, ep.y, ep.size, 0, Math.PI * 2);
            ctx.fillStyle = ep.color;
            ctx.globalAlpha = Math.max(0, ep.alpha);
            ctx.shadowColor = ep.color;
            ctx.shadowBlur = 8;
            ctx.fill();
            ctx.shadowBlur = 0;
            ctx.globalAlpha = 1.0;
          }
        }
      }

      animationFrameRef.current = requestAnimationFrame(render);
    };

    animationFrameRef.current = requestAnimationFrame(render);

    return () => {
      destroyed = true;
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
      window.removeEventListener('resize', resizeCanvas);
      soundManager.stopEngine();
    };
  }, [round, serverTimeOffset]);

  // Vector Jet renderer (original aerodynamic supersonic jet)
  function drawJet(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    angle: number,
    inFlight: boolean
  ) {
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(angle);

    const scale = 0.9;
    ctx.scale(scale, scale);

    // Glowing Afterburner flame
    if (inFlight) {
      const flameLength = 22 + Math.random() * 8;
      const flameGrad = ctx.createLinearGradient(-18, 0, -18 - flameLength, 0);
      flameGrad.addColorStop(0, '#ffffff');
      flameGrad.addColorStop(0.3, '#06b6d4');
      flameGrad.addColorStop(0.8, '#a855f7');
      flameGrad.addColorStop(1, 'rgba(236, 72, 153, 0)');

      ctx.beginPath();
      ctx.moveTo(-18, -4);
      ctx.lineTo(-18 - flameLength, 0);
      ctx.lineTo(-18, 4);
      ctx.closePath();
      ctx.fillStyle = flameGrad;
      ctx.fill();
    }

    // Fuselage shadow / glow
    ctx.shadowColor = '#06b6d4';
    ctx.shadowBlur = 10;

    // Supersonic Delta-Wing Body
    ctx.beginPath();
    ctx.moveTo(28, 0); // Nose cone
    ctx.lineTo(8, -5);
    ctx.lineTo(-12, -26); // Left wingtip
    ctx.lineTo(-6, -6);
    ctx.lineTo(-18, -6);
    ctx.lineTo(-24, -14); // Left stabilizer
    ctx.lineTo(-22, -2);
    ctx.lineTo(-22, 2);
    ctx.lineTo(-24, 14); // Right stabilizer
    ctx.lineTo(-18, 6);
    ctx.lineTo(-6, 6);
    ctx.lineTo(-12, 26); // Right wingtip
    ctx.lineTo(8, 5);
    ctx.closePath();

    const jetGrad = ctx.createLinearGradient(-24, 0, 28, 0);
    jetGrad.addColorStop(0, '#0f172a');
    jetGrad.addColorStop(0.5, '#1e293b');
    jetGrad.addColorStop(1, '#e2e8f0');

    ctx.fillStyle = jetGrad;
    ctx.fill();

    ctx.strokeStyle = '#06b6d4';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    ctx.shadowBlur = 0;

    // Cockpit Canopy (Neon Cyan Glass)
    ctx.beginPath();
    ctx.ellipse(6, 0, 9, 3.5, 0, 0, Math.PI * 2);
    ctx.fillStyle = '#06b6d4';
    ctx.shadowColor = '#06b6d4';
    ctx.shadowBlur = 8;
    ctx.fill();
    ctx.shadowBlur = 0;

    // Trim accents
    ctx.strokeStyle = '#f43f5e';
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    ctx.moveTo(-4, -14);
    ctx.lineTo(2, -8);
    ctx.moveTo(-4, 14);
    ctx.lineTo(2, 8);
    ctx.stroke();

    ctx.restore();
  }

  return (
    <div className="relative w-full h-[360px] sm:h-[440px] lg:h-[480px] rounded-xl overflow-hidden bg-[#060913] border border-slate-800/80 shadow-2xl flex items-center justify-center select-none">
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full block" />

      {/* Center Dynamic HUD Overlay */}
      {round?.status === 'COUNTDOWN' && (
        <div className="relative z-10 flex flex-col items-center justify-center text-center px-4 pointer-events-none">
          <span className="text-xs uppercase tracking-widest text-cyan-400 font-semibold mb-1">
            Preparing For Takeoff
          </span>
          <div className="text-4xl sm:text-6xl font-black font-display text-white tracking-tight drop-shadow-[0_0_20px_rgba(6,182,212,0.6)]">
            {countdownRemaining.toFixed(1)}s
          </div>
          <span className="text-xs text-slate-400 mt-2">
            Place your bets before departure
          </span>
        </div>
      )}

      {round?.status === 'IN_FLIGHT' && (
        <div className="relative z-10 flex flex-col items-center justify-center pointer-events-none">
          <div
            className="text-6xl sm:text-7xl lg:text-8xl font-black font-display tracking-tight text-white tabular-nums drop-shadow-[0_0_30px_rgba(6,182,212,0.8)] animate-pulse"
            style={{
              textShadow:
                displayMultiplier > 10
                  ? '0 0 40px rgba(245, 158, 11, 0.9), 0 0 80px rgba(245, 158, 11, 0.5)'
                  : displayMultiplier > 2
                  ? '0 0 35px rgba(168, 85, 247, 0.8), 0 0 70px rgba(6, 182, 212, 0.4)'
                  : '0 0 30px rgba(6, 182, 212, 0.7)',
            }}
          >
            {displayMultiplier.toFixed(2)}x
          </div>
          <div className="mt-2 text-xs font-mono tracking-widest text-cyan-300 uppercase">
            Supersonic Altitude Clamber
          </div>
        </div>
      )}

      {round?.status === 'CRASHED' && (
        <div className="relative z-10 flex flex-col items-center justify-center text-center px-4 pointer-events-none animate-in zoom-in-95 duration-200">
          <div className="px-3.5 py-1 rounded bg-rose-500/20 border border-rose-500/40 text-rose-400 text-xs font-bold uppercase tracking-widest mb-2">
            FLEW AWAY
          </div>
          <div className="text-5xl sm:text-7xl font-black font-display text-rose-500 tracking-tight drop-shadow-[0_0_35px_rgba(244,63,94,0.9)]">
            {round.crashMultiplier.toFixed(2)}x
          </div>
          <span className="text-xs text-slate-400 mt-2 font-mono">
            Next flight preparing shortly...
          </span>
        </div>
      )}

      {/* Corner Telemetry Markers */}
      <div className="absolute top-3 left-4 z-10 text-[11px] font-mono text-slate-400 flex items-center gap-2 pointer-events-none">
        <span className="text-cyan-400 font-bold">RND #{round?.roundNumber || '---'}</span>
        <span>·</span>
        <span className="text-slate-400">STATUS: {round?.status || 'IDLE'}</span>
      </div>

      <div className="absolute bottom-3 right-4 z-10 text-[11px] font-mono text-slate-400 pointer-events-none hidden sm:block">
        SIMULATED FLIGHT ENGINE · SHA-256 SEED VERIFIED
      </div>
    </div>
  );
};
