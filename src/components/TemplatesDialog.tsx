import React from 'react';
import { Dialog, DialogActionsBar } from '@progress/kendo-react-dialogs';
import { Button } from '@progress/kendo-react-buttons';
import { DashboardNode } from '../types';

const templates: { name: string; nodes: DashboardNode[] }[] = [
  {
    name: 'Analytics Starter',
    nodes: [
      { id: 't1', type: 'KPI', x: 2, y: 2, width: 22, height: 18, props: { label: 'Revenue', value: '123k', color: '#10b981' } },
      { id: 't2', type: 'KPI', x: 26, y: 2, width: 22, height: 18, props: { label: 'Users', value: '8.2k', color: '#3b82f6' } },
      { id: 't3', type: 'Chart', x: 2, y: 24, width: 46, height: 40, props: { series: [{ type: 'column', data: [1,2,3,4,3,5] }] } },
      { id: 't4', type: 'Grid', x: 50, y: 2, width: 48, height: 62, props: { columns: [], data: [] } },
    ]
  },
  {
    name: 'Executive Summary',
    nodes: [
      { id: 'e1', type: 'Text', x: 4, y: 3, width: 60, height: 14, props: { text: 'Quarterly Overview', color: '#fff' } },
      { id: 'e2', type: 'Card', x: 4, y: 20, width: 30, height: 24, props: { title: 'Highlights', body: 'Key wins and notes' } },
      { id: 'e3', type: 'Image', x: 36, y: 20, width: 30, height: 24, props: { src: 'https://picsum.photos/600/300' } },
    ]
  }
];

export function TemplatesDialog({ open, onClose, onLoadTemplate }: { open: boolean; onClose: () => void; onLoadTemplate: (tpl: DashboardNode[]) => void }) {
  const [selected, setSelected] = React.useState<number | null>(null);

  if (!open) return null;
  return (
    <Dialog title="Templates" onClose={onClose} minWidth={520}>
      <div className="grid grid-cols-2 gap-3 p-2">
        {templates.map((t, idx) => (
          <button
            key={t.name}
            className={`glass p-3 text-left rounded ${selected === idx ? 'ring-2 ring-blue-500' : ''}`}
            onClick={() => setSelected(idx)}
          >
            <div className="text-sm font-semibold mb-1">{t.name}</div>
            <div className="text-xs opacity-70">{t.nodes.length} components</div>
          </button>
        ))}
      </div>
      <DialogActionsBar>
        <Button look="flat" onClick={onClose}>Cancel</Button>
        <Button themeColor="primary" disabled={selected === null} onClick={() => {
          if (selected === null) return;
          onLoadTemplate(templates[selected].nodes.map(n => ({ ...n, id: n.id + '_' + Date.now().toString(36) })));
          onClose();
        }}>Load</Button>
      </DialogActionsBar>
    </Dialog>
  );
}
