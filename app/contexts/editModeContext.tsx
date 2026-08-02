"use client";
import React, { createContext, ReactNode, useContext, useEffect, useState } from 'react';

interface EditModeContextType {
  isAdmin: boolean;
  checkingSession: boolean;
  editMode: boolean;
  setEditMode: (value: boolean) => void;
  logout: () => Promise<void>;
  refreshSession: () => Promise<void>;
}

const EditModeContext = createContext<EditModeContextType | undefined>(undefined);

export const EditModeProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [isAdmin, setIsAdmin] = useState(false);
  const [checkingSession, setCheckingSession] = useState(true);
  const [editMode, setEditMode] = useState(false);

  const refreshSession = async () => {
    try {
      const res = await fetch('/api/auth/session');
      const data = await res.json();
      setIsAdmin(Boolean(data?.isAdmin));
    } catch {
      setIsAdmin(false);
    } finally {
      setCheckingSession(false);
    }
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    refreshSession();
  }, []);

  const logout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    setIsAdmin(false);
    setEditMode(false);
  };

  return (
    <EditModeContext.Provider value={{ isAdmin, checkingSession, editMode, setEditMode, logout, refreshSession }}>
      {children}
    </EditModeContext.Provider>
  );
};

export const useEditMode = () => {
  const context = useContext(EditModeContext);
  if (context === undefined) {
    throw new Error('useEditMode must be used within an EditModeProvider');
  }
  return context;
};
