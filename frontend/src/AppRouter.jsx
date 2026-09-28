import React, { useState, useEffect } from 'react';
import App from './App.jsx';
import FreeClassLocator from './components/FreeClassLocator.jsx';

/**
 * AppRouter handles navigation between:
 * - Attendance Predictor (The baseline attendance analysis app)
 * - Free Class Locator (Phase 1: Smart Search Floor Manager)
 *
 * Supports hash-based routing (#/free-classes or #/attendance)
 * and state-based navigation props.
 */
export default function AppRouter() {
  const [currentView, setCurrentView] = useState(() => {
    const hash = window.location.hash.toLowerCase();
    if (hash.includes('locator') || hash.includes('free-class') || hash.includes('free-room')) {
      return 'locator';
    }
    return 'attendance';
  });

  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.toLowerCase();
      if (hash.includes('locator') || hash.includes('free-class') || hash.includes('free-room')) {
        setCurrentView('locator');
      } else {
        setCurrentView('attendance');
      }
    };

    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  const navigateToLocator = () => {
    window.location.hash = '#/free-classes';
    setCurrentView('locator');
  };

  const navigateToAttendance = () => {
    window.location.hash = '#/attendance';
    setCurrentView('attendance');
  };

  if (currentView === 'locator') {
    return <FreeClassLocator onBack={navigateToAttendance} />;
  }

  return <App onNavigateToLocator={navigateToLocator} />;
}
