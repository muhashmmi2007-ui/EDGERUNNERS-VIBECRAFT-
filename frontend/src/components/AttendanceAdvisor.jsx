import React, { useState, useRef, useEffect } from 'react';
import { Bot, Send, Sparkles, User, RefreshCw, HelpCircle, Activity, ChevronRight } from 'lucide-react';
import { queryAttendanceAdvisor } from '../services/attendanceAdvisorEngine';

export default function AttendanceAdvisor({ appState }) {
  const [messages, setMessages] = useState([
    {
      id: 'welcome',
      sender: 'assistant',
      text: `Hello! I am your **Attendance Intelligence Advisor**. I am linked directly to your active section timetable schedule, entered attendance records, and mathematical planning engine.

Ask me anything about safe skip buffers, timetable impacts, leave scenarios, or recovery formulas. You can click any quick query below or type your question.`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);

  const [inputQuery, setInputQuery] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const streamEndRef = useRef(null);

  const samplePrompts = [
    'Can I skip Friday?',
    'How many classes can I miss?',
    'Can I still reach 90%?',
    'Which subject is risky?',
    'If I take 3 days medical leave, will I fall below 75%?',
    'What if I attend all remaining classes?',
  ];

  const handleSend = (text) => {
    const query = text || inputQuery;
    if (!query.trim()) return;

    const userMsg = {
      id: `user_${Date.now()}`,
      sender: 'user',
      text: query,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputQuery('');
    setIsProcessing(true);

    setTimeout(() => {
      const response = queryAttendanceAdvisor(query, appState);
      const assistantMsg = {
        id: `assistant_${Date.now()}`,
        sender: 'assistant',
        text: response.answer,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, assistantMsg]);
      setIsProcessing(false);
    }, 180);
  };

  useEffect(() => {
    if (streamEndRef.current) {
      streamEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isProcessing]);

  // Helper to format text with bold, bullets, etc.
  const renderFormattedText = (text) => {
    const paragraphs = text.split('\n');
    return paragraphs.map((para, pIdx) => {
      if (!para.trim()) return <div key={pIdx} style={{ height: 6 }} />;

      // Bullet points
      if (para.startsWith('- ') || para.startsWith('* ')) {
        const content = para.slice(2);
        return (
          <div key={pIdx} style={{ display: 'flex', gap: 6, margin: '2px 0 2px 8px' }}>
            <span style={{ color: 'var(--cyan-light)' }}>•</span>
            <div>{renderInline(content)}</div>
          </div>
        );
      }

      return (
        <p key={pIdx} style={{ margin: '2px 0' }}>
          {renderInline(para)}
        </p>
      );
    });
  };

  const renderInline = (str) => {
    const parts = str.split(/(\*\*.*?\*\*)/g);
    return parts.map((part, i) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return (
          <strong key={i} style={{ color: 'var(--text-primary)', fontWeight: 700 }}>
            {part.slice(2, -2)}
          </strong>
        );
      }
      return part;
    });
  };

  return (
    <div className="card" style={{ padding: '24px', marginBottom: '32px' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px', flexWrap: 'wrap', gap: '12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{
            background: 'var(--purple-bg)',
            border: '1px solid rgba(139, 92, 246, 0.25)',
            padding: '10px',
            borderRadius: 'var(--radius-md)',
            color: 'var(--purple-light)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <Bot size={22} />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>
                Attendance Advisor AI
              </h2>
              <span className="badge badge-purple" style={{ fontSize: '0.65rem', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <Activity size={10} /> ENGINE LINKED
              </span>
            </div>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
              Context-aware reasoning assistant built directly on your section timetable and attendance records.
            </p>
          </div>
        </div>

        <button
          onClick={() => setMessages([messages[0]])}
          className="btn btn-secondary"
          style={{ padding: '6px 12px', fontSize: '0.75rem', borderRadius: 'var(--radius-full)' }}
          title="Reset conversation"
        >
          <RefreshCw size={13} />
          <span>Clear History</span>
        </button>
      </div>

      {/* Suggested Prompt Chips */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '16px' }}>
        {samplePrompts.map((prompt) => (
          <button
            key={prompt}
            onClick={() => handleSend(prompt)}
            className="btn btn-secondary"
            style={{
              fontSize: '0.75rem',
              padding: '6px 14px',
              borderRadius: 'var(--radius-full)',
              background: 'var(--bg-inset)',
              borderColor: 'var(--border-subtle)',
              color: 'var(--text-secondary)',
              textAlign: 'left',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              transition: 'all var(--duration-fast) ease'
            }}
          >
            <Sparkles size={12} color="var(--purple-light)" />
            <span>{prompt}</span>
          </button>
        ))}
      </div>

      {/* Message Stream */}
      <div style={{
        background: 'var(--bg-inset)',
        border: '1px solid var(--border-subtle)',
        borderRadius: 'var(--radius-lg)',
        padding: '18px',
        maxHeight: '380px',
        overflowY: 'auto',
        display: 'flex',
        flexDirection: 'column',
        gap: '14px',
        marginBottom: '16px'
      }}>
        {messages.map((msg) => {
          const isUser = msg.sender === 'user';
          return (
            <div
              key={msg.id}
              style={{
                display: 'flex',
                gap: '10px',
                alignSelf: isUser ? 'flex-end' : 'flex-start',
                maxWidth: '85%'
              }}
            >
              {!isUser && (
                <div style={{
                  width: 32,
                  height: 32,
                  borderRadius: 'var(--radius-sm)',
                  background: 'var(--purple-bg)',
                  border: '1px solid rgba(139, 92, 246, 0.3)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'var(--purple-light)',
                  flexShrink: 0
                }}>
                  <Bot size={18} />
                </div>
              )}

              <div style={{
                background: isUser ? 'var(--emerald-bg)' : 'var(--bg-surface)',
                border: isUser ? '1px solid rgba(16, 185, 129, 0.3)' : '1px solid var(--border-default)',
                color: 'var(--text-primary)',
                borderRadius: isUser ? '14px 14px 2px 14px' : '14px 14px 14px 2px',
                padding: '12px 16px',
                fontSize: '0.85rem',
                lineHeight: 1.5,
                boxShadow: 'var(--shadow-sm)'
              }}>
                <div>{renderFormattedText(msg.text)}</div>
                <div style={{
                  fontSize: '0.65rem',
                  color: 'var(--text-muted)',
                  marginTop: '6px',
                  textAlign: isUser ? 'right' : 'left'
                }}>
                  {msg.timestamp}
                </div>
              </div>

              {isUser && (
                <div style={{
                  width: 32,
                  height: 32,
                  borderRadius: 'var(--radius-sm)',
                  background: 'var(--cyan-bg)',
                  border: '1px solid rgba(6, 182, 212, 0.3)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'var(--cyan-light)',
                  flexShrink: 0
                }}>
                  <User size={18} />
                </div>
              )}
            </div>
          );
        })}

        {isProcessing && (
          <div style={{ display: 'flex', gap: '10px', alignItems: 'center', color: 'var(--text-secondary)', fontSize: '0.8rem', padding: '4px 8px' }}>
            <Bot size={18} color="var(--purple-light)" />
            <span>Evaluating timetable capacity and attendance formulas...</span>
          </div>
        )}
        <div ref={streamEndRef} />
      </div>

      {/* Input Bar */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSend();
        }}
        style={{ display: 'flex', gap: '10px' }}
      >
        <input
          type="text"
          value={inputQuery}
          onChange={(e) => setInputQuery(e.target.value)}
          placeholder="Ask a question about your attendance, skip margins, or leave dates..."
          className="input-field"
          style={{ flex: 1, padding: '12px 16px', fontSize: '0.85rem' }}
        />
        <button
          type="submit"
          className="btn btn-primary"
          style={{ padding: '12px 20px', borderRadius: 'var(--radius-md)' }}
          disabled={!inputQuery.trim() || isProcessing}
        >
          <Send size={15} />
          <span>Ask</span>
        </button>
      </form>
    </div>
  );
}
