import React, { createContext, useContext, useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext"; // 👈 import this

interface AttendanceContextType {
  status: "idle" | "working" | "break";
  seconds: number;
  startTimer: () => void;
  pauseTimer: () => void;
  stopTimer: () => void;
}

const AttendanceContext = createContext<AttendanceContextType | undefined>(
  undefined,
);

export const AttendanceProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const { user } = useAuth();

  const statusKey = user
    ? `attendanceStatus_${user.userId ?? user.email}`
    : null;
  const secondsKey = user
    ? `attendanceSeconds_${user.userId ?? user.email}`
    : null;

  const [status, setStatus] = useState<"idle" | "working" | "break">("idle");
  const [seconds, setSeconds] = useState(0);

  useEffect(() => {
    if (!statusKey || !secondsKey) {
      // No user logged in — reset everything
      setStatus("idle");
      setSeconds(0);
      return;
    }
    const savedStatus = localStorage.getItem(statusKey) as
      | "idle"
      | "working"
      | "break";
    const savedSeconds = Number(localStorage.getItem(secondsKey)) || 0;
    setStatus(savedStatus || "idle");
    setSeconds(savedSeconds);
  }, [user?.userId ?? user?.email]);

  // Sync to localStorage (only when user is logged in)
  useEffect(() => {
    if (statusKey) localStorage.setItem(statusKey, status);
  }, [status, statusKey]);

  useEffect(() => {
    if (secondsKey) localStorage.setItem(secondsKey, seconds.toString());
  }, [seconds, secondsKey]);

  // Timer logic (unchanged)
  useEffect(() => {
    let interval: number | undefined;
    if (status === "working") {
      interval = window.setInterval(() => {
        setSeconds((prev) => prev + 1);
      }, 1000);
    }
    return () => {
      if (interval) window.clearInterval(interval);
    };
  }, [status]);

  const startTimer = () => setStatus("working");
  const pauseTimer = () => setStatus("break");

  const stopTimer = () => {
    setStatus("idle");
    setSeconds(0);

    if (statusKey) localStorage.removeItem(statusKey);
    if (secondsKey) localStorage.removeItem(secondsKey);
  };

  return (
    <AttendanceContext.Provider
      value={{ status, seconds, startTimer, pauseTimer, stopTimer }}
    >
      {children}
    </AttendanceContext.Provider>
  );
};

export const useAttendance = () => {
  const context = useContext(AttendanceContext);
  if (!context)
    throw new Error("useAttendance must be used within AttendanceProvider");
  return context;
};
