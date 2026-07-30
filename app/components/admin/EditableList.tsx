"use client";
import { X } from 'lucide-react';
import React, { useState } from 'react';
import { useEditMode } from '../../contexts/editModeContext';
import { useUpdateSiteContent } from '../../hooks/useSiteContent';

interface EditableListProps {
  /** Full i18n dot-path matching the `t()` key, e.g. "experience.items.0.achievements". Ignored if `onSave` is provided. */
  path?: string;
  locale: string;
  items: string[];
  /** Custom save target (e.g. a DB-backed entity field) instead of the generic site_content store. */
  onSave?: (items: string[]) => void;
  /** Render prop so the normal (non-edit) render keeps the original animated/styled markup untouched */
  children: (items: string[]) => React.ReactNode;
}

export const EditableList: React.FC<EditableListProps> = ({ path, locale, items, onSave, children }) => {
  const { isAdmin, editMode } = useEditMode();
  const { mutate: updateContent } = useUpdateSiteContent();
  const [draftItems, setDraftItems] = useState<string[] | null>(null);
  const [newItem, setNewItem] = useState('');

  if (!isAdmin || !editMode) {
    return <>{children(items)}</>;
  }

  const current = draftItems ?? items;

  const persist = (next: string[]) => {
    setDraftItems(next);
    if (onSave) {
      onSave(next);
      return;
    }
    if (path) {
      const [section, ...rest] = path.split('.');
      updateContent({ section, key: rest.join('.'), locale, value: JSON.stringify(next) });
    }
  };

  return (
    <div className="space-y-2 border-2 border-dashed border-[#00bfe6] rounded-lg p-3 bg-[#00bfe6]/5">
      {current.map((item, i) => (
        <div key={i} className="flex items-center gap-2">
          <input
            className="flex-1 border rounded px-2 py-1 text-sm bg-white text-gray-900"
            value={item}
            onChange={(e) => {
              const next = [...current];
              next[i] = e.target.value;
              setDraftItems(next);
            }}
            onBlur={() => persist(current)}
          />
          <button
            type="button"
            className="text-red-600 hover:text-red-700"
            onClick={() => persist(current.filter((_, idx) => idx !== i))}
            title="Quitar"
          >
            <X size={16} />
          </button>
        </div>
      ))}
      <div className="flex items-center gap-2">
        <input
          className="flex-1 border rounded px-2 py-1 text-sm bg-white text-gray-900"
          placeholder="Agregar…"
          value={newItem}
          onChange={(e) => setNewItem(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && newItem.trim()) {
              persist([...current, newItem.trim()]);
              setNewItem('');
            }
          }}
        />
        <button
          type="button"
          className="text-[#0096c7] text-sm font-medium whitespace-nowrap"
          onClick={() => {
            if (newItem.trim()) {
              persist([...current, newItem.trim()]);
              setNewItem('');
            }
          }}
        >
          + Agregar
        </button>
      </div>
    </div>
  );
};
