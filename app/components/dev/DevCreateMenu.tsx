"use client";
import React, { useMemo, useState } from 'react';

export const DevCreateMenu: React.FC = () => {
  const isDev = useMemo(() => process.env.NODE_ENV === 'development', []);
  const [open, setOpen] = useState(false);
  if (!isDev) return null;

  const openProjects = () => {
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new Event('open-dev-projects'));
    }
    setOpen(false);
  };
  const openCertificates = () => {
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new Event('open-dev-certificates'));
    }
    setOpen(false);
  };

  return (
    <div className="hidden md:block">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="fixed bottom-6 right-6 z-[998] rounded-full h-12 w-12 flex items-center justify-center shadow-lg bg-gradient-to-r from-[#00bfe6] to-[#0096c7] text-white"
        title="Crear (Dev)"
      >
        +
      </button>

      {open && (
        <div className="fixed bottom-24 right-6 z-[999] bg-white rounded-xl shadow-xl border p-2 w-52">
          <div className="text-xs text-gray-500 px-2 pb-1">Crear nuevo</div>
          <button onClick={openProjects} className="w-full text-left px-3 py-2 rounded hover:bg-gray-50">Proyecto</button>
          <button onClick={openCertificates} className="w-full text-left px-3 py-2 rounded hover:bg-gray-50">Certificado</button>
        </div>
      )}
    </div>
  );
};
