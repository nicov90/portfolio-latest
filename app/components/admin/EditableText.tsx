"use client";
import React, { useState } from 'react';
import { useEditMode } from '../../contexts/editModeContext';
import { useUpdateSiteContent } from '../../hooks/useSiteContent';

interface EditableTextProps {
  /** Full i18n dot-path matching the `t()` key, e.g. "about.title". Ignored if `onSave` is provided. */
  path?: string;
  locale: string;
  /** Custom save target (e.g. a DB-backed entity field) instead of the generic site_content store. */
  onSave?: (value: string) => void;
  children: React.ReactNode;
  as?: 'span' | 'p' | 'div';
  multiline?: boolean;
  className?: string;
}

export const EditableText: React.FC<EditableTextProps> = ({
  path,
  locale,
  onSave,
  children,
  as = 'span',
  multiline = false,
  className,
}) => {
  const { isAdmin, editMode } = useEditMode();
  const { mutate: updateContent } = useUpdateSiteContent();
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState('');

  const Tag = as;

  if (!isAdmin || !editMode) {
    return <Tag className={className}>{children}</Tag>;
  }

  const startEditing = () => {
    setDraft(typeof children === 'string' ? children : String(children ?? ''));
    setEditing(true);
  };

  const save = () => {
    setEditing(false);
    if (!draft.trim()) return;
    if (onSave) {
      onSave(draft);
      return;
    }
    if (path) {
      const [section, ...rest] = path.split('.');
      updateContent({ section, key: rest.join('.'), locale, value: draft });
    }
  };

  if (editing) {
    const sharedClassName = `bg-white text-gray-900 border-2 border-dashed border-[#00bfe6] rounded px-2 py-1 outline-none ${className || ''}`;
    return multiline ? (
      <textarea
        autoFocus
        className={`block w-full ${sharedClassName}`}
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onBlur={save}
        onKeyDown={(e) => {
          if (e.key === 'Escape') setEditing(false);
        }}
        rows={4}
      />
    ) : (
      <input
        autoFocus
        className={`inline-block ${sharedClassName}`}
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onBlur={save}
        onKeyDown={(e) => {
          if (e.key === 'Enter') save();
          if (e.key === 'Escape') setEditing(false);
        }}
      />
    );
  }

  return (
    <Tag
      className={`${className || ''} cursor-text outline-dashed outline-2 outline-transparent hover:outline-[#00bfe6] hover:bg-[#00bfe6]/10 rounded transition-colors`}
      onClick={startEditing}
      title="Clic para editar"
    >
      {children}
    </Tag>
  );
};
