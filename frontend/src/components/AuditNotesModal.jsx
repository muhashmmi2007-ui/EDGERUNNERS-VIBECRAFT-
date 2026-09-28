import React from 'react';
import { X, BookOpen, CheckCircle2 } from 'lucide-react';

export default function AuditNotesModal({ onClose }) {
  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div
        className="card animate-slide-down"
        style={{
          width: '100%',
          maxWidth: 720,
          maxHeight: '90vh',
          overflowY: 'auto',
          padding: '28px',
          background: 'var(--bg-elevated)',
          border: '1px solid rgba(6, 182, 212, 0.35)',
          boxShadow: 'var(--shadow-elevated)'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{
              background: 'var(--cyan-bg)',
              border: '1px solid rgba(6, 182, 212, 0.3)',
              padding: '10px',
              borderRadius: 'var(--radius-md)',
              color: 'var(--cyan-light)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <BookOpen size={24} />
            </div>
            <div>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>
                Dataset Audit & Forensic Mapping
              </h2>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                Organizer-provided timetable dataset: 10 PDFs, 13 sections, 3 extraction batches.
              </p>
            </div>
          </div>

          <button onClick={onClose} className="btn btn-secondary" style={{ padding: '6px', borderRadius: '50%' }}>
            <X size={18} />
          </button>
        </div>

        {/* Forensic Summary Table */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{
            background: 'var(--bg-inset)',
            padding: '16px',
            borderRadius: 'var(--radius-md)',
            border: '1px solid var(--border-subtle)'
          }}>
            <h3 style={{ fontSize: '0.9rem', fontWeight: 800, color: 'var(--cyan-light)', marginBottom: '8px' }}>
              Preserved Timetable Sections
            </h3>
            <ul style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', paddingLeft: '18px', lineHeight: 1.6 }}>
              <li><strong style={{ color: 'var(--text-primary)' }}>2026–2027 Standard Sections (1–9):</strong> III ECE-DS, IV ECE-B, III ECE-A, IV ECE-A, III ECE-B, III BME, II ECE-DS B, II ECE-DS A, II BME. All 9 sections adhere strictly to 9 periods/day with standard breaks.</li>
              <li><strong style={{ color: 'var(--text-primary)' }}>2024–2025 First-Year Sections (10–13):</strong> I ECE-A, I ECE-B & EEE, I ECE-DS, I Biotech-B / Biomed. Fully preserved as supplied in the organizer dataset without fabricating modern replacements.</li>
            </ul>
          </div>

          <div style={{
            background: 'var(--bg-inset)',
            padding: '16px',
            borderRadius: 'var(--radius-md)',
            border: '1px solid var(--border-subtle)'
          }}>
            <h3 style={{ fontSize: '0.9rem', fontWeight: 800, color: 'var(--amber-light)', marginBottom: '8px' }}>
              Documented Interpretations & Policies
            </h3>
            <ul style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', paddingLeft: '18px', lineHeight: 1.6 }}>
              <li><strong style={{ color: 'var(--text-primary)' }}>Multi-Period Labs:</strong> A 2-period lab block (e.g. LAB-108/107 across periods 8–9) is treated as 1 attendance unit per standard college attendance regulations.</li>
              <li><strong style={{ color: 'var(--text-primary)' }}>B-Proj:</strong> Project component of Microcontroller is mapped to Slot B (21ECC301P) and counts as 1 unit.</li>
              <li><strong style={{ color: 'var(--text-primary)' }}>CDC Slots:</strong> Analytical & Logical Thinking (G-625) and Verbal Reasoning (H-TB-106) are mapped to their respective slots G & H.</li>
              <li><strong style={{ color: 'var(--text-primary)' }}>Fixed Term Denominator:</strong> Formula uses <code>(H + R)</code> because all scheduled classes are presumed to take place. We avoid the volatile <code>ceil((T*(H+R)-A)/(1-T))</code> error.</li>
            </ul>
          </div>

          <div style={{
            background: 'var(--emerald-bg)',
            border: '1px solid rgba(16, 185, 129, 0.25)',
            borderRadius: 'var(--radius-md)',
            padding: '14px 16px',
            fontSize: '0.8rem',
            color: 'var(--emerald-light)',
            display: 'flex',
            alignItems: 'center',
            gap: '10px'
          }}>
            <CheckCircle2 size={18} style={{ flexShrink: 0 }} />
            <span>All timetable data structures are strictly isolated in <code>src/data/sectionsData.js</code> and can be independently inspected and audited against the original PDF sheets.</span>
          </div>
        </div>
      </div>
    </div>
  );
}
