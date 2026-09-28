import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Clock, AlertCircle, Sparkles, CheckCircle2, AlertTriangle } from 'lucide-react';
import { timeToMinutes } from '../services/timetableIngestion';

/**
 * RoomCountdownTimer
 *
 * Displays a high-precision, live-ticking countdown until the next class starts
 * (or until the room's available window closes).
 *
 * Derived mathematically from:
 *   CURRENT TIME vs NEXT SCHEDULED CLASS START TIME
 *
 * When timer hits 00:00:00, automatically triggers onExpire() so room status
 * is re-queried and updated deterministically from the availability engine.
 */
export default function RoomCountdownTimer({
  room,
  freeUntilTime,
  nextClass,
  day = 'Monday',
  onExpire = () => {},
}) {
  const [secondsRemaining, setSecondsRemaining] = useState(0);
  const [isExpired, setIsExpired] = useState(false);
  const timerRef = useRef(null);

  // Extract from room if not provided explicitly
  const effectiveFreeUntilTime = freeUntilTime || room?.freeUntil || room?.availableUntil || room?.nextClass?.startTime || '16:50';
  const effectiveNextClass = nextClass || room?.nextClass || null;

  // Target minutes from midnight
  const targetMinutes = useMemo(() => {
    if (!effectiveFreeUntilTime) return 16 * 60 + 50; // 16:50 EOD default
    return timeToMinutes(effectiveFreeUntilTime);
  }, [effectiveFreeUntilTime]);

  // Total window duration for circular/linear progress estimation (default 90 mins if unknown)
  const initialDurationSeconds = useMemo(() => {
    return Math.max(1800, (room?.availableMinutes || room?.freeMinutes || 60) * 60);
  }, [room?.availableMinutes, room?.freeMinutes]);

  // Calculate remaining seconds
  const calculateRemainingSeconds = () => {
    const now = new Date();
    const currentTotalSeconds = now.getHours() * 3600 + now.getMinutes() * 60 + now.getSeconds();
    const targetTotalSeconds = targetMinutes * 60;
    const diff = targetTotalSeconds - currentTotalSeconds;
    return diff;
  };

  useEffect(() => {
    // Initial calculation
    const initialSecs = calculateRemainingSeconds();
    if (initialSecs <= 0) {
      setSecondsRemaining(0);
      setIsExpired(true);
      return;
    }

    setSecondsRemaining(initialSecs);
    setIsExpired(false);

    // Live tick every second
    timerRef.current = setInterval(() => {
      const remaining = calculateRemainingSeconds();
      if (remaining <= 0) {
        clearInterval(timerRef.current);
        setSecondsRemaining(0);
        setIsExpired(true);
        if (onExpire) {
          onExpire(room?.roomId);
        }
      } else {
        setSecondsRemaining(remaining);
      }
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [targetMinutes, room?.roomId, onExpire]);

  // Format into hours, minutes, seconds
  const hours = Math.floor(secondsRemaining / 3600);
  const minutes = Math.floor((secondsRemaining % 3600) / 60);
  const seconds = secondsRemaining % 60;

  const pad = (n) => String(n).padStart(2, '0');

  // Percentage for smooth progress indicator
  const progressPct = Math.min(100, Math.max(0, (secondsRemaining / initialDurationSeconds) * 100));

  // Urgency styling: normal > 30m (emerald), warning <= 30m (amber), urgent <= 10m (rose)
  const urgencyColor = secondsRemaining > 1800
    ? 'var(--emerald)'
    : secondsRemaining > 600
    ? 'var(--amber)'
    : 'var(--rose)';

  const urgencyBg = secondsRemaining > 1800
    ? 'rgba(16, 185, 129, 0.1)'
    : secondsRemaining > 600
    ? 'rgba(245, 158, 11, 0.1)'
    : 'rgba(239, 68, 68, 0.12)';

  return (
    <div style={{
      background: 'var(--bg-inset)',
      border: `1px solid ${isExpired ? 'rgba(239, 68, 68, 0.3)' : 'rgba(6, 182, 212, 0.25)'}`,
      borderRadius: 'var(--radius-lg)',
      padding: '20px',
      position: 'relative',
      overflow: 'hidden',
    }}>
      {/* Top Banner */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <Clock size={16} color={isExpired ? 'var(--rose-light)' : 'var(--cyan-light)'} />
          <span style={{
            fontSize: 'var(--text-xs)',
            fontWeight: 800,
            letterSpacing: '0.06em',
            textTransform: 'uppercase',
            color: isExpired ? 'var(--rose-light)' : 'var(--cyan-light)',
          }}>
            {isExpired ? 'Window Expired' : 'Live Free Time Remaining'}
          </span>
        </div>

        <span className={isExpired ? 'badge badge-rose' : 'badge badge-emerald'} style={{ fontSize: '0.65rem' }}>
          {isExpired ? 'Class In Progress' : 'Ticking Live'}
        </span>
      </div>

      {/* Main Countdown Digits Display */}
      {!isExpired ? (
        <div>
          <div style={{
            display: 'flex',
            alignItems: 'baseline',
            justifyContent: 'center',
            gap: 8,
            padding: '16px 0',
            fontFamily: 'var(--font-mono)',
          }}>
            {/* Hours Box */}
            <div style={{ textAlign: 'center' }}>
              <div style={{
                fontSize: '2.5rem',
                fontWeight: 900,
                color: urgencyColor,
                lineHeight: 1,
                textShadow: `0 0 20px ${urgencyColor}`,
              }}>
                {pad(hours)}
              </div>
              <div style={{ fontSize: '0.65rem', color: 'var(--text-faint)', textTransform: 'uppercase', fontWeight: 700, marginTop: 4 }}>
                Hours
              </div>
            </div>

            <span style={{ fontSize: '2rem', fontWeight: 900, color: 'var(--text-faint)', lineHeight: 1 }}>:</span>

            {/* Minutes Box */}
            <div style={{ textAlign: 'center' }}>
              <div style={{
                fontSize: '2.5rem',
                fontWeight: 900,
                color: urgencyColor,
                lineHeight: 1,
                textShadow: `0 0 20px ${urgencyColor}`,
              }}>
                {pad(minutes)}
              </div>
              <div style={{ fontSize: '0.65rem', color: 'var(--text-faint)', textTransform: 'uppercase', fontWeight: 700, marginTop: 4 }}>
                Mins
              </div>
            </div>

            <span style={{ fontSize: '2rem', fontWeight: 900, color: 'var(--text-faint)', lineHeight: 1 }}>:</span>

            {/* Seconds Box */}
            <div style={{ textAlign: 'center' }}>
              <div style={{
                fontSize: '2.5rem',
                fontWeight: 900,
                color: urgencyColor,
                lineHeight: 1,
                textShadow: `0 0 20px ${urgencyColor}`,
              }}>
                {pad(seconds)}
              </div>
              <div style={{ fontSize: '0.65rem', color: 'var(--text-faint)', textTransform: 'uppercase', fontWeight: 700, marginTop: 4 }}>
                Secs
              </div>
            </div>
          </div>

          {/* Visual Progress Bar */}
          <div style={{
            width: '100%',
            height: 6,
            background: 'rgba(255, 255, 255, 0.06)',
            borderRadius: 'var(--radius-full)',
            overflow: 'hidden',
            marginBottom: 16,
          }}>
            <div style={{
              height: '100%',
              width: `${progressPct}%`,
              background: `linear-gradient(90deg, var(--cyan-light), ${urgencyColor})`,
              borderRadius: 'var(--radius-full)',
              transition: 'width 1s linear',
            }} />
          </div>
        </div>
      ) : (
        /* Expired State Notice */
        <div style={{
          textAlign: 'center',
          padding: '20px 10px',
          background: urgencyBg,
          borderRadius: 'var(--radius-md)',
          marginBottom: 16,
        }}>
          <AlertTriangle size={28} color="var(--rose-light)" style={{ margin: '0 auto 8px' }} />
          <div style={{ fontWeight: 800, color: 'var(--rose-light)', fontSize: 'var(--text-base)' }}>
            Available Interval Has Ended
          </div>
          <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-secondary)', marginTop: 4 }}>
            Class schedule updated. Recalculating availability for this room...
          </div>
        </div>
      )}

      {/* Next Class Information */}
      <div style={{
        padding: '12px 14px',
        borderRadius: 'var(--radius-md)',
        background: 'var(--bg-surface)',
        border: '1px solid var(--border-subtle)',
      }}>
        {nextClass ? (
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
              <span style={{ fontSize: 'var(--text-xs)', color: 'var(--text-faint)', fontWeight: 700, textTransform: 'uppercase' }}>
                Next Scheduled Class
              </span>
              <span className="badge badge-purple" style={{ fontSize: '0.65rem' }}>
                Starts at {nextClass.startTime}
              </span>
            </div>
            <div style={{ fontWeight: 700, fontSize: 'var(--text-sm)', color: 'var(--text-primary)' }}>
              {nextClass.subjectName}
            </div>
            <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-secondary)', marginTop: 2 }}>
              {nextClass.classSection}{nextClass.faculty ? ` • ${nextClass.faculty}` : ''}
            </div>
          </div>
        ) : (
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'var(--emerald-light)', fontSize: 'var(--text-xs)' }}>
            <CheckCircle2 size={15} style={{ flexShrink: 0 }} />
            <span>Free for the rest of today — no upcoming classes found in timetable.</span>
          </div>
        )}
      </div>
    </div>
  );
}
