"use client";
import { BarChart3, FolderKanban, LogOut, Pencil, PencilOff, X } from 'lucide-react';
import React, { useState } from 'react';
import { useEditMode } from '../../contexts/editModeContext';
import { ContentStudioPanel } from './ContentStudioPanel';
import { StatsPanel } from './StatsPanel';

export const EditModeToolbar: React.FC = () => {
  const { isAdmin, checkingSession, editMode, setEditMode, logout } = useEditMode();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [studioOpen, setStudioOpen] = useState(false);
  const [statsOpen, setStatsOpen] = useState(false);

  if (checkingSession || !isAdmin) return null;

  return (
    <>
      {/* Desktop: one dedicated floating button per action. Kept in sync with Layout.tsx's own
          xl breakpoint for its nav FAB — both live at fixed bottom-6 right-6, so if these split
          from the site nav's mobile/desktop switch, the two stacks overlap. */}
      <div className="hidden xl:flex flex-col gap-4 fixed bottom-6 right-6 z-[998]">
        <button
          type="button"
          onClick={() => setEditMode(!editMode)}
          className={`rounded-full h-12 w-12 flex items-center justify-center shadow-lg text-white transition-colors ${
            editMode ? 'bg-gradient-to-r from-[#00bfe6] to-[#0096c7]' : 'bg-gray-700 hover:bg-gray-600'
          }`}
          title={editMode ? 'Salir del modo edición' : 'Activar modo edición'}
        >
          {editMode ? <Pencil size={20} /> : <PencilOff size={20} />}
        </button>
        <button
          type="button"
          onClick={() => setStudioOpen(true)}
          className="rounded-full h-12 w-12 flex items-center justify-center shadow-lg text-white bg-gray-700 hover:bg-gray-600 transition-colors"
          title="Gestionar proyectos y certificados"
        >
          <FolderKanban size={20} />
        </button>
        <button
          type="button"
          onClick={() => setStatsOpen(true)}
          className="rounded-full h-12 w-12 flex items-center justify-center shadow-lg text-white bg-gray-700 hover:bg-gray-600 transition-colors"
          title="Estadísticas de visitas"
        >
          <BarChart3 size={20} />
        </button>
        <button
          type="button"
          onClick={logout}
          className="rounded-full h-12 w-12 flex items-center justify-center shadow-lg text-white bg-red-600 hover:bg-red-500 transition-colors"
          title="Cerrar sesión"
        >
          <LogOut size={20} />
        </button>
      </div>

      {/* Mobile/tablet: a single button that expands into the same actions. Sits above the site
          nav's own FAB (fixed bottom-6 right-6, h-14) since both are visible below lg. */}
      <div className="xl:hidden">
        <button
          type="button"
          onClick={() => setMobileMenuOpen((v) => !v)}
          className={`fixed bottom-24 right-6 z-[998] rounded-full h-12 w-12 flex items-center justify-center shadow-lg text-white transition-colors ${
            editMode ? 'bg-gradient-to-r from-[#00bfe6] to-[#0096c7]' : 'bg-gray-700'
          }`}
          title="Modo edición"
        >
          {mobileMenuOpen ? <X size={20} /> : editMode ? <Pencil size={20} /> : <PencilOff size={20} />}
        </button>

        {mobileMenuOpen && (
          <div className="fixed bottom-40 right-6 z-[999] bg-white rounded-xl shadow-xl border p-2 w-56">
            <button
              onClick={() => { setEditMode(!editMode); setMobileMenuOpen(false); }}
              className="w-full text-left px-3 py-2 rounded hover:bg-gray-50 flex items-center gap-2 text-sm"
            >
              {editMode ? <PencilOff size={16} /> : <Pencil size={16} />}
              {editMode ? 'Salir del modo edición' : 'Activar modo edición'}
            </button>
            <button
              onClick={() => { setStudioOpen(true); setMobileMenuOpen(false); }}
              className="w-full text-left px-3 py-2 rounded hover:bg-gray-50 flex items-center gap-2 text-sm"
            >
              <FolderKanban size={16} />
              Gestionar proyectos y certificados
            </button>
            <button
              onClick={() => { setStatsOpen(true); setMobileMenuOpen(false); }}
              className="w-full text-left px-3 py-2 rounded hover:bg-gray-50 flex items-center gap-2 text-sm"
            >
              <BarChart3 size={16} />
              Estadísticas de visitas
            </button>
            <button
              onClick={() => { logout(); setMobileMenuOpen(false); }}
              className="w-full text-left px-3 py-2 rounded hover:bg-gray-50 flex items-center gap-2 text-sm text-red-600"
            >
              <LogOut size={16} />
              Cerrar sesión
            </button>
          </div>
        )}
      </div>

      <ContentStudioPanel open={studioOpen} onOpenChange={setStudioOpen} />
      <StatsPanel open={statsOpen} onOpenChange={setStatsOpen} />
    </>
  );
};
