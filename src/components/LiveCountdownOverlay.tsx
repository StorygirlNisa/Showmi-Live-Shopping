import React, { useState, useEffect, useRef } from 'react';
import { CheckCircle2 } from 'lucide-react';

interface LiveCountdownOverlayProps {
  onComplete: () => void;
  onCancel?: () => void;
  sessionTitle?: string;
  sellerName?: string;
}

export const LiveCountdownOverlay: React.FC<LiveCountdownOverlayProps> = ({
  onComplete,
  onCancel,
  sessionTitle,
  sellerName
}) => {
  // Current count state: 3, 2, 1, or 'LIVE'
  const [displayCount, setDisplayCount] = useState<number | 'LIVE'>(3);
  // Progress of current second: 0.0 to 1.0 (for circular progress ring)
  const [progress, setProgress] = useState<number>(0);

  const hasCompletedRef = useRef(false);
  const startTimeRef = useRef<number | null>(null);
  const rafIdRef = useRef<number | null>(null);

  // Constants: 1 second per number (3, 2, 1) + 600ms energetic "LIVE" finish
  const STEP_DURATION = 1000;
  const LIVE_DURATION = 600;
  const TOTAL_DURATION = STEP_DURATION * 3 + LIVE_DURATION;

  useEffect(() => {
    startTimeRef.current = performance.now();

    const handleFinish = () => {
      if (hasCompletedRef.current) return;
      hasCompletedRef.current = true;
      onComplete();
    };

    const updateFrame = (now: number) => {
      if (!startTimeRef.current) {
        startTimeRef.current = now;
      }
      const elapsed = now - startTimeRef.current;

      if (elapsed < STEP_DURATION) {
        // Step 3
        setDisplayCount(3);
        setProgress(Math.min(1, elapsed / STEP_DURATION));
      } else if (elapsed < STEP_DURATION * 2) {
        // Step 2
        setDisplayCount(2);
        setProgress(Math.min(1, (elapsed - STEP_DURATION) / STEP_DURATION));
      } else if (elapsed < STEP_DURATION * 3) {
        // Step 1
        setDisplayCount(1);
        setProgress(Math.min(1, (elapsed - STEP_DURATION * 2) / STEP_DURATION));
      } else if (elapsed < TOTAL_DURATION) {
        // 'LIVE' flash
        setDisplayCount('LIVE');
        setProgress(1);
      } else {
        // Complete
        setDisplayCount('LIVE');
        setProgress(1);
        handleFinish();
        return;
      }

      rafIdRef.current = requestAnimationFrame(updateFrame);
    };

    rafIdRef.current = requestAnimationFrame(updateFrame);

    // Hard safety fallback timeout: guarantees countdown never gets stuck if tab loses focus or RAF pauses
    const safetyTimer = setTimeout(() => {
      handleFinish();
    }, TOTAL_DURATION + 600);

    return () => {
      if (rafIdRef.current !== null) {
        cancelAnimationFrame(rafIdRef.current);
      }
      clearTimeout(safetyTimer);
    };
  }, [onComplete]);

  // Handle Escape key to cancel
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && onCancel) {
        onCancel();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onCancel]);

  // Circular ring calculations
  // Radius r = 90, viewBox = 220 x 220, cx = 110, cy = 110
  const radius = 90;
  const circumference = 2 * Math.PI * radius; // ~565.487
  const strokeDashoffset = circumference * (1 - progress);

  return (
    <div
      className="fixed inset-0 z-[100] flex flex-col items-center justify-center p-4 bg-[#0D1018]/95 backdrop-blur-2xl animate-fade-in select-none"
      role="alertdialog"
      aria-live="assertive"
      aria-label="Live broadcast countdown starting"
    >
      {/* Ambient background glows */}
      <div className="absolute -top-32 -left-32 w-80 h-80 bg-[#19BFFF]/15 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute -bottom-32 -right-32 w-80 h-80 bg-[#7A3CFF]/15 rounded-full blur-[100px] pointer-events-none" />

      {/* Main Container */}
      <div className="relative z-10 flex flex-col items-center justify-center max-w-sm w-full text-center space-y-6">
        
        {/* Top Status Pill */}
        <div className="flex flex-col items-center gap-2">
          <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#171A21] border border-[#242936] text-xs font-semibold shadow-xl">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#19BFFF] opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[#19BFFF]"></span>
            </span>
            <span className="font-heading font-bold text-white tracking-wide uppercase text-[11px]">
              {displayCount === 'LIVE' ? 'You are On Air' : 'Going Live'}
            </span>
          </div>

          {sessionTitle && (
            <div className="text-center px-4 max-w-xs">
              <h2 className="text-sm sm:text-base font-bold text-white font-heading truncate">
                {sessionTitle}
              </h2>
              {sellerName && (
                <p className="text-xs text-slate-400 font-medium mt-0.5">
                  Host Studio · {sellerName}
                </p>
              )}
            </div>
          )}
        </div>

        {/* Circular Progress Ring with Centered Animated Number */}
        <div className="relative w-56 h-56 sm:w-64 sm:h-64 flex items-center justify-center">
          {/* Subtle Ambient Pulse behind ring */}
          <div className="absolute inset-4 rounded-full bg-gradient-to-tr from-[#19BFFF]/10 to-[#7A3CFF]/10 blur-xl pointer-events-none" />

          {/* SVG Progress Ring */}
          <svg className="w-full h-full transform -rotate-90" viewBox="0 0 220 220">
            <defs>
              <linearGradient id="countdownRingGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#19BFFF" />
                <stop offset="100%" stopColor="#7A3CFF" />
              </linearGradient>
            </defs>

            {/* Background Track Ring */}
            <circle
              cx="110"
              cy="110"
              r={radius}
              stroke="#171A21"
              strokeWidth="12"
              fill="none"
            />
            {/* Subtle Border Line */}
            <circle
              cx="110"
              cy="110"
              r={radius}
              stroke="#242936"
              strokeWidth="2"
              fill="none"
            />

            {/* Foreground Animated Progress Ring */}
            <circle
              cx="110"
              cy="110"
              r={radius}
              stroke="url(#countdownRingGradient)"
              strokeWidth="10"
              strokeLinecap="round"
              fill="none"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              style={{
                filter: displayCount === 'LIVE'
                  ? 'drop-shadow(0 0 12px rgba(25, 191, 255, 0.9)) drop-shadow(0 0 20px rgba(122, 60, 255, 0.7))'
                  : 'drop-shadow(0 0 8px rgba(25, 191, 255, 0.5))'
              }}
            />
          </svg>

          {/* Centered Inner Hub and Number */}
          <div className="absolute inset-5 sm:inset-6 rounded-full bg-[#0D1018] border border-[#242936] flex flex-col items-center justify-center shadow-2xl overflow-hidden">
            {/* Subtle inner radial glow */}
            <div className="absolute inset-0 rounded-full bg-[radial-gradient(circle_at_center,_rgba(25,191,255,0.12)_0%,_transparent_70%)] pointer-events-none" />

            {/* Animated Content for 3, 2, 1, LIVE */}
            <div
              key={displayCount}
              className="relative z-10 flex flex-col items-center justify-center animate-countdown-pop select-none px-2"
            >
              {displayCount === 'LIVE' ? (
                <div className="flex flex-col items-center gap-1.5">
                  <span className="text-4xl sm:text-5xl font-black font-heading text-transparent bg-clip-text bg-gradient-to-r from-[#19BFFF] via-white to-[#7A3CFF] tracking-wider drop-shadow-[0_0_24px_rgba(25,191,255,0.7)] animate-pulse">
                    LIVE!
                  </span>
                  <span className="text-[10px] sm:text-xs font-bold text-white bg-red-600/90 border border-red-500/50 px-3 py-0.5 rounded-full uppercase tracking-wider flex items-center gap-1.5 shadow-lg shadow-red-600/30">
                    <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping" />
                    On Air
                  </span>
                </div>
              ) : (
                <>
                  <span className="text-7xl sm:text-8xl font-black font-heading text-white tracking-tighter drop-shadow-[0_4px_24px_rgba(25,191,255,0.45)] leading-none">
                    {displayCount}
                  </span>
                  <span className="text-[10px] sm:text-xs font-mono font-bold tracking-widest text-[#19BFFF] uppercase mt-2">
                    Seconds
                  </span>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Readiness Checklist */}
        <div className="flex items-center justify-center gap-3 text-[11px] font-medium text-slate-300 bg-[#171A21] border border-[#242936] px-4 py-2 rounded-xl shadow-lg">
          <div className="flex items-center gap-1.5 text-emerald-400">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Camera & Mic</span>
          </div>
          <div className="w-1 h-1 rounded-full bg-slate-600" />
          <div className="flex items-center gap-1.5 text-emerald-400">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>AI Sales Coach</span>
          </div>
        </div>

        {/* Cancel Button */}
        {onCancel && (
          <div className="pt-2">
            <button
              onClick={onCancel}
              className="text-xs text-slate-400 hover:text-white transition-colors py-1.5 px-4 rounded-xl hover:bg-[#171A21] border border-transparent hover:border-[#242936] cursor-pointer"
            >
              Cancel Broadcast
            </button>
          </div>
        )}

      </div>
    </div>
  );
};
