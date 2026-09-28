import React, { useState } from 'react';
import { MessageCircle, Users, Copy, Check, Share2, Sparkles } from 'lucide-react';

/**
 * SquadShareButton ("CALL THE SQUAD")
 *
 * Generates an instant, dynamically encoded WhatsApp click-to-chat invite:
 * "📍 Heading to IST 509 (Floor 5). Free until 2:30 PM. Come fast!"
 *
 * Pulls actual room, floor, freeUntil, and nextClass directly from the
 * deterministic timetable engine.
 */
export default function SquadShareButton({
  room,
  floorName,
  freeUntil,
  freeMinutes,
  nextClass,
  day = 'Today',
}) {
  const [copied, setCopied] = useState(false);

  // Extract from room object if not provided as explicit props
  const effectiveFloor = floorName || (room?.floor !== undefined && room?.floor !== null && room?.floor !== -1 ? `Floor ${room.floor}` : 'Campus Wing');
  const effectiveFreeUntil = freeUntil || room?.freeUntil || room?.availableUntil || '16:50';
  const effectiveFreeMinutes = freeMinutes !== undefined ? freeMinutes : (room?.freeMinutes || room?.availableMinutes || 60);
  const effectiveNextClass = nextClass || room?.nextClass || null;

  // Compute duration description
  const hours = Math.floor(effectiveFreeMinutes / 60);
  const mins = effectiveFreeMinutes % 60;
  const durationStr = hours > 0
    ? `${hours}h ${mins > 0 ? `${mins}m` : ''}`.trim()
    : `${mins}m`;

  const roomName = room?.roomName || room?.roomId || 'Free Classroom';

  // Construct dynamic invite message
  const nextClassText = effectiveNextClass
    ? `\n📚 Next Class: ${effectiveNextClass.subjectName} (${effectiveNextClass.classSection}) at ${effectiveNextClass.startTime}`
    : '\n✨ Free for the rest of the schedule!';

  const messageText =
`📍 Heading to ${roomName} (${effectiveFloor})!
🟢 Status: FREE until ${effectiveFreeUntil} (~${durationStr} free)
${nextClassText}
⚡ Grabbing seats now, come fast!`;

  // WhatsApp click-to-chat URL
  const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(messageText)}`;

  const handleCopy = async () => {
    try {
      if (navigator?.clipboard?.writeText) {
        await navigator.clipboard.writeText(messageText);
        setCopied(true);
        setTimeout(() => setCopied(false), 2500);
      }
    } catch (e) {
      console.error('Failed to copy squad message:', e);
    }
  };

  const handleShare = () => {
    window.open(whatsappUrl, '_blank', 'noopener,noreferrer');
  };

  return (
    <div style={{ marginTop: 14 }}>
      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
        {/* Main WhatsApp "CALL THE SQUAD" Button */}
        <button
          onClick={handleShare}
          style={{
            flex: 2,
            minWidth: 180,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 10,
            padding: '12px 20px',
            borderRadius: 'var(--radius-md)',
            background: 'linear-gradient(135deg, #25D366 0%, #128C7E 100%)',
            color: '#FFFFFF',
            border: 'none',
            fontWeight: 800,
            fontSize: 'var(--text-sm)',
            letterSpacing: '0.03em',
            cursor: 'pointer',
            boxShadow: '0 4px 16px rgba(37, 211, 102, 0.35)',
            transition: 'all var(--duration-fast) var(--ease-out)',
          }}
          title="Open WhatsApp with pre-filled room invite"
          id="call-the-squad-btn"
        >
          <MessageCircle size={18} />
          <span>CALL THE SQUAD</span>
        </button>

        {/* Copy Invite Message Button */}
        <button
          onClick={handleCopy}
          className="btn btn-secondary"
          style={{
            flex: 1,
            minWidth: 120,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 8,
            padding: '12px 16px',
            fontSize: 'var(--text-xs)',
            fontWeight: 700,
            borderColor: copied ? 'var(--emerald)' : 'var(--border-subtle)',
            color: copied ? 'var(--emerald-light)' : 'var(--text-secondary)',
          }}
          title="Copy message to clipboard"
          id="copy-squad-invite-btn"
        >
          {copied ? <Check size={15} color="var(--emerald)" /> : <Copy size={15} />}
          <span>{copied ? 'Copied!' : 'Copy Invite'}</span>
        </button>
      </div>

      {/* Message Preview Box */}
      <div style={{
        marginTop: 10,
        padding: '10px 12px',
        borderRadius: 'var(--radius-sm)',
        background: 'rgba(37, 211, 102, 0.05)',
        border: '1px dashed rgba(37, 211, 102, 0.25)',
        fontSize: 'var(--text-xs)',
        color: 'var(--text-secondary)',
        lineHeight: 1.5,
      }}>
        <div style={{ fontSize: '0.65rem', fontWeight: 800, color: 'var(--emerald-light)', textTransform: 'uppercase', marginBottom: 2 }}>
          WhatsApp Message Preview:
        </div>
        <div style={{ whiteSpace: 'pre-line', color: 'var(--text-muted)' }}>
          {messageText}
        </div>
      </div>
    </div>
  );
}
