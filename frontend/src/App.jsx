import React, { useState, useEffect, useMemo } from 'react';
import { ShieldCheck, Sliders, Layers, BarChart3, CalendarRange, Bot, TrendingUp, CalendarDays } from 'lucide-react';
import Header from './components/Header';
import HeroDashboard from './components/HeroDashboard';
import RiskOverview from './components/RiskOverview';
import WhatIfSimulator from './components/WhatIfSimulator';
import SubjectDashboard from './components/SubjectDashboard';
import AdvancedCharts from './components/AdvancedCharts';
import LeaveSimulator from './components/LeaveSimulator';
import AttendanceAdvisor from './components/AttendanceAdvisor';
import TrajectoryChart from './components/TrajectoryChart';
import UpcomingTimeline from './components/UpcomingTimeline';
import TimetableGrid from './components/TimetableGrid';
import ExplainModal from './components/ExplainModal';
import DemoPresetModal from './components/DemoPresetModal';
import AuditNotesModal from './components/AuditNotesModal';

import { SECTIONS_DATA, getSectionById, SEMESTER_END_DATE } from './data/sectionsData';
import { generateOccurrences, getRemainingClassesBySubject } from './services/calendarEngine';
import { evaluateSubjectAttendance, evaluateOverallAttendance } from './services/attendanceMath';

const STORAGE_KEY_SECTION = 'attendx_selected_section_v2';
const STORAGE_KEY_DATE = 'attendx_planning_date_v2';
const STORAGE_PREFIX_ATTENDANCE = 'attendx_attendance_record_';

export default function App() {
  // 1. Selected Section State
  const [selectedSection, setSelectedSection] = useState(() => {
    const saved = localStorage.getItem(STORAGE_KEY_SECTION);
    return saved ? getSectionById(saved) : SECTIONS_DATA[0];
  });

  // 2. Planning Date State (Defaults to 2026-10-01 mid-semester for optimal demo experience)
  const [planningDate, setPlanningDate] = useState(() => {
    return localStorage.getItem(STORAGE_KEY_DATE) || '2026-10-01';
  });

  // 3. Timetable Grid View Toggle
  const [showTimetable, setShowTimetable] = useState(false);

  // 4. Modals State
  const [showDemoModal, setShowDemoModal] = useState(false);
  const [showAuditModal, setShowAuditModal] = useState(false);
  const [explainSubjectCode, setExplainSubjectCode] = useState(null);

  // 5. Selected Subject for Simulator / Trajectory Focus
  const [activeSubjectCode, setActiveSubjectCode] = useState(() => {
    return selectedSection.subjects[0]?.code || '';
  });

  // Save selected section to localStorage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_SECTION, selectedSection.id);
  }, [selectedSection]);

  // Save planning date to localStorage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_DATE, planningDate);
  }, [planningDate]);

  // 6. Attendance Records State (Attended / Held per subject)
  const [attendanceRecords, setAttendanceRecords] = useState(() => {
    const saved = localStorage.getItem(`${STORAGE_PREFIX_ATTENDANCE}${selectedSection.id}`);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Failed to parse saved attendance:', e);
      }
    }
    // Default initial records: realistic ~80% attendance
    const initial = {};
    selectedSection.subjects.forEach((sub, idx) => {
      const held = 24;
      const attended = idx % 3 === 0 ? 17 : 20; // Some variation
      initial[sub.code] = { attended, held };
    });
    return initial;
  });

  // When selectedSection changes, reload that section's attendance from localStorage
  const handleSelectSection = (newSection) => {
    setSelectedSection(newSection);
    setActiveSubjectCode(newSection.subjects[0]?.code || '');
    const saved = localStorage.getItem(`${STORAGE_PREFIX_ATTENDANCE}${newSection.id}`);
    if (saved) {
      try {
        setAttendanceRecords(JSON.parse(saved));
        return;
      } catch (e) {
        console.error(e);
      }
    }
    const initial = {};
    newSection.subjects.forEach((sub, idx) => {
      const held = 24;
      const attended = idx % 3 === 0 ? 17 : 20;
      initial[sub.code] = { attended, held };
    });
    setAttendanceRecords(initial);
  };

  // Save attendanceRecords to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem(
      `${STORAGE_PREFIX_ATTENDANCE}${selectedSection.id}`,
      JSON.stringify(attendanceRecords)
    );
  }, [attendanceRecords, selectedSection]);

  // 7. Interactive Planned Skips in Timeline (Occurrence IDs)
  const [plannedSkipsSet, setPlannedSkipsSet] = useState(new Set());

  // 8. Generate Occurrences and Remaining Classes Map
  const occurrences = useMemo(() => {
    return generateOccurrences(selectedSection, planningDate);
  }, [selectedSection, planningDate]);

  const remainingMap = useMemo(() => {
    return getRemainingClassesBySubject(selectedSection, planningDate);
  }, [selectedSection, planningDate]);

  // 9. Evaluate Every Subject
  const evaluations = useMemo(() => {
    const map = {};
    selectedSection.subjects.forEach((sub) => {
      const rec = attendanceRecords[sub.code] || { attended: 0, held: 0 };
      const rem = remainingMap[sub.code] || 0;
      map[sub.code] = evaluateSubjectAttendance(rec.attended, rec.held, rem);
    });
    return map;
  }, [selectedSection, attendanceRecords, remainingMap]);

  // 10. Overall Evaluation
  const overallEval = useMemo(() => {
    const list = Object.values(evaluations);
    return evaluateOverallAttendance(list);
  }, [evaluations]);

  // Handle Attendance Field Changes
  const handleAttendanceChange = (subjectCode, attended, held) => {
    setAttendanceRecords((prev) => ({
      ...prev,
      [subjectCode]: { attended, held },
    }));
  };

  // Toggle skip on specific date occurrence in timeline
  const handleToggleSkipDate = (occId) => {
    setPlannedSkipsSet((prev) => {
      const next = new Set(prev);
      if (next.has(occId)) {
        next.delete(occId);
      } else {
        next.add(occId);
      }
      return next;
    });
  };

  // Load a Judge Demo Preset
  const handleLoadDemoPreset = (preset) => {
    const section = getSectionById(preset.sectionId);
    setSelectedSection(section);
    setPlanningDate(preset.planningDate);

    const generated = preset.generateAttendance(section.subjects, {});
    setAttendanceRecords(generated);
    setActiveSubjectCode(section.subjects[0]?.code || '');
    setPlannedSkipsSet(new Set());
  };

  // Reset to default
  const handleResetData = () => {
    if (window.confirm('Reset all entered attendance for this section to defaults?')) {
      localStorage.removeItem(`${STORAGE_PREFIX_ATTENDANCE}${selectedSection.id}`);
      const initial = {};
      selectedSection.subjects.forEach((sub) => {
        initial[sub.code] = { attended: 20, held: 24 };
      });
      setAttendanceRecords(initial);
      setPlannedSkipsSet(new Set());
    }
  };

  const explainSubject = selectedSection.subjects.find((s) => s.code === explainSubjectCode);
  const explainRecord = explainSubject ? (attendanceRecords[explainSubject.code] || { attended: 0, held: 0 }) : { attended: 0, held: 0 };
  const explainRemaining = explainSubject ? (remainingMap[explainSubject.code] || 0) : 0;

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* Top Sticky Header */}
      <Header
        selectedSection={selectedSection}
        onSelectSection={handleSelectSection}
        planningDate={planningDate}
        onPlanningDateChange={setPlanningDate}
        onOpenDemo={() => setShowDemoModal(true)}
        onOpenAudit={() => setShowAuditModal(true)}
        onToggleTimetable={() => setShowTimetable((prev) => !prev)}
        showTimetable={showTimetable}
        onResetData={handleResetData}
      />

      {/* Main App Container */}
      <main style={{ maxWidth: 1400, width: '100%', margin: '0 auto', padding: '24px 20px', flex: 1 }}>
        {/* Weekly Timetable Drawer */}
        {showTimetable && (
          <TimetableGrid
            section={selectedSection}
            onClose={() => setShowTimetable(false)}
          />
        )}

        {/* Hero Dashboard */}
        <HeroDashboard
          overallEval={overallEval}
          subjectEvals={Object.values(evaluations)}
          planningDate={planningDate}
          semesterEndDate={SEMESTER_END_DATE}
          onExplainOverall={() => setExplainSubjectCode(selectedSection.subjects[0]?.code)}
        />

        {/* Quick Section Navigation Bar */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          overflowX: 'auto',
          padding: '4px 0 20px',
          marginBottom: '14px',
          scrollbarWidth: 'none'
        }}>
          <span style={{ fontSize: '0.7rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', whiteSpace: 'nowrap', marginRight: '4px' }}>
            NAVIGATE:
          </span>
          <a href="#risk-triage" className="btn btn-secondary" style={{ padding: '6px 14px', fontSize: '0.75rem', borderRadius: 'var(--radius-full)', whiteSpace: 'nowrap', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <ShieldCheck size={14} color="var(--emerald-light)" />
            <span>Risk Triage</span>
          </a>
          <a href="#what-if" className="btn btn-secondary" style={{ padding: '6px 14px', fontSize: '0.75rem', borderRadius: 'var(--radius-full)', whiteSpace: 'nowrap', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Sliders size={14} color="var(--cyan-light)" />
            <span>What-If Simulator</span>
          </a>
          <a href="#subject-matrix" className="btn btn-secondary" style={{ padding: '6px 14px', fontSize: '0.75rem', borderRadius: 'var(--radius-full)', whiteSpace: 'nowrap', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Layers size={14} color="var(--purple-light)" />
            <span>Subject Matrix</span>
          </a>
          <a href="#advanced-analytics" className="btn btn-secondary" style={{ padding: '6px 14px', fontSize: '0.75rem', borderRadius: 'var(--radius-full)', whiteSpace: 'nowrap', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <BarChart3 size={14} color="var(--cyan-light)" />
            <span>Analytics & Targets</span>
          </a>
          <a href="#leave-simulator" className="btn btn-secondary" style={{ padding: '6px 14px', fontSize: '0.75rem', borderRadius: 'var(--radius-full)', whiteSpace: 'nowrap', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <CalendarRange size={14} color="var(--amber-light)" />
            <span>Leave & OD Simulator</span>
          </a>
          <a href="#attendance-advisor" className="btn btn-secondary" style={{ padding: '6px 14px', fontSize: '0.75rem', borderRadius: 'var(--radius-full)', whiteSpace: 'nowrap', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Bot size={14} color="var(--purple-light)" />
            <span>AI Advisor</span>
          </a>
          <a href="#trajectory-chart" className="btn btn-secondary" style={{ padding: '6px 14px', fontSize: '0.75rem', borderRadius: 'var(--radius-full)', whiteSpace: 'nowrap', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <TrendingUp size={14} color="var(--emerald-light)" />
            <span>Trajectory</span>
          </a>
          <a href="#schedule-timeline" className="btn btn-secondary" style={{ padding: '6px 14px', fontSize: '0.75rem', borderRadius: 'var(--radius-full)', whiteSpace: 'nowrap', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <CalendarDays size={14} color="var(--cyan-light)" />
            <span>Class Timeline</span>
          </a>
        </div>

        {/* 1. Risk Intelligence & Subject Triage */}
        <div id="risk-triage">
          <RiskOverview
            subjects={selectedSection.subjects}
            evaluations={evaluations}
            attendanceRecords={attendanceRecords}
            remainingMap={remainingMap}
            onSelectSubject={(code) => {
              setActiveSubjectCode(code);
              const el = document.getElementById('what-if');
              if (el) el.scrollIntoView({ behavior: 'smooth' });
            }}
          />
        </div>

        {/* 2. What-If Simulator */}
        <div id="what-if">
          <WhatIfSimulator
            subjects={selectedSection.subjects}
            selectedSubjectCode={activeSubjectCode}
            onSubjectChange={setActiveSubjectCode}
            attendanceRecords={attendanceRecords}
            remainingMap={remainingMap}
            evaluations={evaluations}
          />
        </div>

        {/* 3. Subject Intelligence Dashboard */}
        <div id="subject-matrix">
          <SubjectDashboard
            subjects={selectedSection.subjects}
            attendanceRecords={attendanceRecords}
            remainingMap={remainingMap}
            evaluations={evaluations}
            onAttendanceChange={handleAttendanceChange}
            onExplainSubject={(code) => setExplainSubjectCode(code)}
            onSelectForSimulation={(code) => {
              setActiveSubjectCode(code);
              const el = document.getElementById('what-if');
              if (el) el.scrollIntoView({ behavior: 'smooth' });
            }}
          />
        </div>

        {/* 4. Advanced Visual Analytics Suite */}
        <div id="advanced-analytics">
          <AdvancedCharts
            subjects={selectedSection.subjects}
            attendanceRecords={attendanceRecords}
            remainingMap={remainingMap}
            evaluations={evaluations}
            overallEval={overallEval}
          />
        </div>

        {/* 5. Calendar-Aware Leave & OD Impact Simulator */}
        <div id="leave-simulator">
          <LeaveSimulator
            section={selectedSection}
            planningDate={planningDate}
            attendanceRecords={attendanceRecords}
            remainingMap={remainingMap}
          />
        </div>

        {/* 6. AI Attendance Advisor */}
        <div id="attendance-advisor">
          <AttendanceAdvisor
            appState={{
              selectedSection,
              planningDate,
              attendanceRecords,
              remainingMap,
              evaluations,
              overallEval,
              occurrences,
            }}
          />
        </div>

        {/* 7. Visual Attendance Trajectory */}
        <div id="trajectory-chart">
          <TrajectoryChart
            section={selectedSection}
            occurrences={occurrences}
            attendanceRecords={attendanceRecords}
            planningDate={planningDate}
            selectedSubjectCode={activeSubjectCode}
          />
        </div>

        {/* 8. Upcoming Scheduled Class Timeline */}
        <div id="schedule-timeline">
          <UpcomingTimeline
            occurrences={occurrences}
            section={selectedSection}
            plannedSkipsSet={plannedSkipsSet}
            onToggleSkipDate={handleToggleSkipDate}
          />
        </div>
      </main>

      {/* Footer */}
      <footer style={{
        borderTop: '1px solid var(--border-subtle)',
        background: 'rgba(6, 9, 19, 0.95)',
        padding: '20px 24px',
        textAlign: 'center',
        fontSize: '0.8rem',
        color: 'var(--text-muted)'
      }}>
        <div style={{ maxWidth: 1400, margin: '0 auto', display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: 12 }}>
          <div>
            <strong>THE ATTENDANCE PREDICTOR</strong> • Hackathon Finalist Edition
          </div>
          <div>
            Semester Dates: <strong>Aug 29, 2026 – Nov 29, 2026</strong> • 75% Mandatory Detention Threshold
          </div>
          <div>
            <button
              onClick={() => setShowAuditModal(true)}
              style={{ background: 'transparent', border: 'none', color: '#38bdf8', cursor: 'pointer', textDecoration: 'underline' }}
            >
              Auditable Timetable Dataset & Policies
            </button>
          </div>
        </div>
      </footer>

      {/* Modals */}
      {showDemoModal && (
        <DemoPresetModal
          onSelectPreset={handleLoadDemoPreset}
          onClose={() => setShowDemoModal(false)}
        />
      )}

      {showAuditModal && (
        <AuditNotesModal
          onClose={() => setShowAuditModal(false)}
        />
      )}

      {explainSubjectCode && explainSubject && (
        <ExplainModal
          subject={explainSubject}
          record={explainRecord}
          remaining={explainRemaining}
          onClose={() => setExplainSubjectCode(null)}
        />
      )}
    </div>
  );
}
