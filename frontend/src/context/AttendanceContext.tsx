import React, { createContext, useContext, useState, useEffect } from 'react';

interface AttendanceContextType {
  status: 'idle' | 'working' | 'break';
  seconds: number;
  startTimer: () => void;
  pauseTimer: () => void;
  stopTimer: () => void;
}

const AttendanceContext = createContext<AttendanceContextType | undefined>(undefined);

export const AttendanceProvider = ({ children }: { children: React.ReactNode }) => {
  // 1. Initialize from localStorage safely
  const [status, setStatus] = useState<'idle' | 'working' | 'break'>(() => {
    return (localStorage.getItem('attendanceStatus') as 'idle' | 'working' | 'break') || 'idle';
  });

  const [seconds, setSeconds] = useState(() => {
    return Number(localStorage.getItem('attendanceSeconds')) || 0;
  });

  // 2. Sync Status to LocalStorage (Only when status changes)
  useEffect(() => {
    localStorage.setItem('attendanceStatus', status);
  }, [status]);

  // 3. Sync Seconds to LocalStorage (Optimized)
  useEffect(() => {
    // Only save seconds every 5 seconds to reduce disk I/O, 
    // or keep it 1s if you prefer absolute precision after a crash.
    localStorage.setItem('attendanceSeconds', seconds.toString());
  }, [seconds]);

  // 4. Global Timer Logic
  useEffect(() => {
    // FIXED: Use 'number' instead of 'NodeJS.Timeout' for browser compatibility
    let interval: number | undefined;

    if (status === 'working') {
      interval = window.setInterval(() => {
        setSeconds((prev) => prev + 1);
      }, 1000);
    }

    return () => {
      if (interval) window.clearInterval(interval);
    };
  }, [status]);

  const startTimer = () => setStatus('working');
  const pauseTimer = () => setStatus('break');
  
  const stopTimer = () => {
    setStatus('idle');
    setSeconds(0);
    localStorage.removeItem('attendanceSeconds');
    localStorage.removeItem('attendanceStatus');
  };

  return (
    <AttendanceContext.Provider value={{ status, seconds, startTimer, pauseTimer, stopTimer }}>
      {children}
    </AttendanceContext.Provider>
  );
};

export const useAttendance = () => {
  const context = useContext(AttendanceContext);
  if (!context) {
    throw new Error("useAttendance must be used within AttendanceProvider");
  }
  return context;
};