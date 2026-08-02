"use client";
import { DndContext, type DragEndEvent, closestCenter, PointerSensor, TouchSensor, useSensor, useSensors } from '@dnd-kit/core';
import { arrayMove, SortableContext, useSortable, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical, Pencil, Plus } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { useCertificates, useUpdateCertificate } from '../../hooks/useCertificates';
import { useProjects, useUpdateProject } from '../../hooks/useProjects';
import { Button } from '../ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/dialog';
import { CertificateForm, type CertificateRecord } from './ContentStudio/CertificateForm';
import { ProjectForm, type ProjectRecord } from './ContentStudio/ProjectForm';

interface ContentStudioPanelProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

type ActiveForm =
  | { type: 'project'; item: ProjectRecord | null }
  | { type: 'certificate'; item: CertificateRecord | null }
  | null;

function bySortOrder<T extends { sortOrder?: number | null }>(items: T[]): T[] {
  return [...items].sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0));
}

interface SortableRowProps {
  id: number;
  children: (dragHandleProps: { listeners: any; attributes: any }) => React.ReactNode;
}

const SortableRow: React.FC<SortableRowProps> = ({ id, children }) => {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id });
  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.6 : 1,
    zIndex: isDragging ? 10 : undefined,
  };
  return (
    <div ref={setNodeRef} style={style}>
      {children({ listeners, attributes })}
    </div>
  );
};

export const ContentStudioPanel: React.FC<ContentStudioPanelProps> = ({ open, onOpenChange }) => {
  const [tab, setTab] = useState<'projects' | 'certificates'>('projects');
  const [activeForm, setActiveForm] = useState<ActiveForm>(null);
  const { data: projects } = useProjects();
  const { data: certificates } = useCertificates(undefined, { allLocales: true });
  const { mutate: updateProject } = useUpdateProject();
  const { mutate: updateCertificate } = useUpdateCertificate();

  const [projectOrder, setProjectOrder] = useState<ProjectRecord[]>([]);
  const [certificateOrder, setCertificateOrder] = useState<CertificateRecord[]>([]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (Array.isArray(projects)) setProjectOrder(bySortOrder(projects));
  }, [projects]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (Array.isArray(certificates)) setCertificateOrder(bySortOrder(certificates));
  }, [certificates]);

  // Touch needs a short hold before a drag starts, so a tap can still scroll or hit "Editar".
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 200, tolerance: 8 } })
  );

  const handleProjectDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    setProjectOrder((items) => {
      const oldIndex = items.findIndex((i) => i.id === active.id);
      const newIndex = items.findIndex((i) => i.id === over.id);
      const reordered = arrayMove(items, oldIndex, newIndex);
      reordered.forEach((item, idx) => {
        if ((item.sortOrder ?? 0) !== idx) {
          updateProject({ id: item.id, project: { sortOrder: idx } });
        }
      });
      return reordered;
    });
  };

  const handleCertificateDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    setCertificateOrder((items) => {
      const oldIndex = items.findIndex((i) => i.id === active.id);
      const newIndex = items.findIndex((i) => i.id === over.id);
      const reordered = arrayMove(items, oldIndex, newIndex);
      reordered.forEach((item, idx) => {
        if ((item.sortOrder ?? 0) !== idx) {
          updateCertificate({ id: item.id, certificate: { sortOrder: idx } });
        }
      });
      return reordered;
    });
  };

  return (
    <>
      <Dialog open={open && !activeForm} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-2xl max-h-[85vh] flex flex-col">
          <DialogHeader>
            <DialogTitle>Gestionar contenido</DialogTitle>
          </DialogHeader>

          <div className="flex gap-2 border-b">
            <button
              className={`px-3 py-2 text-sm font-medium border-b-2 -mb-px ${tab === 'projects' ? 'border-[#00bfe6] text-[#0096c7]' : 'border-transparent text-muted-foreground'}`}
              onClick={() => setTab('projects')}
            >
              Proyectos
            </button>
            <button
              className={`px-3 py-2 text-sm font-medium border-b-2 -mb-px ${tab === 'certificates' ? 'border-[#00bfe6] text-[#0096c7]' : 'border-transparent text-muted-foreground'}`}
              onClick={() => setTab('certificates')}
            >
              Certificados
            </button>
          </div>

          <div className="flex-1 overflow-y-auto py-3 space-y-2">
            {tab === 'projects' ? (
              <>
                <Button size="sm" onClick={() => setActiveForm({ type: 'project', item: null })} className="mb-2">
                  <Plus size={16} /> Nuevo proyecto
                </Button>
                {projectOrder.length === 0 && <p className="text-sm text-muted-foreground">Todavía no hay proyectos.</p>}
                {projectOrder.length > 1 && (
                  <p className="text-xs text-muted-foreground mb-1">Arrastrá desde el ícono para reordenar.</p>
                )}
                <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleProjectDragEnd}>
                  <SortableContext items={projectOrder.map((p) => p.id)} strategy={verticalListSortingStrategy}>
                    <div className="space-y-2">
                      {projectOrder.map((p) => (
                        <SortableRow key={p.id} id={p.id}>
                          {({ listeners, attributes }) => (
                            <div className="flex items-center gap-2 border rounded-lg p-3 bg-white">
                              <button
                                type="button"
                                {...attributes}
                                {...listeners}
                                className="cursor-grab active:cursor-grabbing touch-none text-muted-foreground p-1 shrink-0"
                                title="Arrastrar para reordenar"
                              >
                                <GripVertical size={18} />
                              </button>
                              <div className="flex items-center gap-3 min-w-0 flex-1">
                                {p.images?.[0] ? (
                                  // eslint-disable-next-line @next/next/no-img-element
                                  <img src={p.images[0]} alt={p.title} className="w-12 h-12 rounded object-cover shrink-0" />
                                ) : (
                                  <div className="w-12 h-12 rounded bg-gray-100 shrink-0" />
                                )}
                                <span className="truncate font-medium">{p.title}</span>
                              </div>
                              <Button size="sm" variant="outline" onClick={() => setActiveForm({ type: 'project', item: p })}>
                                <Pencil size={14} /> Editar
                              </Button>
                            </div>
                          )}
                        </SortableRow>
                      ))}
                    </div>
                  </SortableContext>
                </DndContext>
              </>
            ) : (
              <>
                <Button size="sm" onClick={() => setActiveForm({ type: 'certificate', item: null })} className="mb-2">
                  <Plus size={16} /> Nuevo certificado
                </Button>
                {certificateOrder.length === 0 && <p className="text-sm text-muted-foreground">Todavía no hay certificados.</p>}
                {certificateOrder.length > 1 && (
                  <p className="text-xs text-muted-foreground mb-1">Arrastrá desde el ícono para reordenar.</p>
                )}
                <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleCertificateDragEnd}>
                  <SortableContext items={certificateOrder.map((c) => c.id)} strategy={verticalListSortingStrategy}>
                    <div className="space-y-2">
                      {certificateOrder.map((c) => (
                        <SortableRow key={c.id} id={c.id}>
                          {({ listeners, attributes }) => (
                            <div className="flex items-center gap-2 border rounded-lg p-3 bg-white">
                              <button
                                type="button"
                                {...attributes}
                                {...listeners}
                                className="cursor-grab active:cursor-grabbing touch-none text-muted-foreground p-1 shrink-0"
                                title="Arrastrar para reordenar"
                              >
                                <GripVertical size={18} />
                              </button>
                              <div className="flex items-center gap-3 min-w-0 flex-1">
                                {c.imageUrl ? (
                                  // eslint-disable-next-line @next/next/no-img-element
                                  <img src={c.imageUrl} alt={c.title} className="w-12 h-12 rounded object-cover shrink-0" />
                                ) : (
                                  <div className="w-12 h-12 rounded bg-gray-100 shrink-0" />
                                )}
                                <span className="truncate font-medium">{c.title}</span>
                              </div>
                              <Button size="sm" variant="outline" onClick={() => setActiveForm({ type: 'certificate', item: c })}>
                                <Pencil size={14} /> Editar
                              </Button>
                            </div>
                          )}
                        </SortableRow>
                      ))}
                    </div>
                  </SortableContext>
                </DndContext>
              </>
            )}
          </div>
        </DialogContent>
      </Dialog>

      <ProjectForm
        open={open && activeForm?.type === 'project'}
        onClose={() => setActiveForm(null)}
        project={activeForm?.type === 'project' ? activeForm.item : null}
      />
      <CertificateForm
        open={open && activeForm?.type === 'certificate'}
        onClose={() => setActiveForm(null)}
        certificate={activeForm?.type === 'certificate' ? activeForm.item : null}
      />
    </>
  );
};
