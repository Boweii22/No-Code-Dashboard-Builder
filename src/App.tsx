import React, { useMemo, useState } from 'react';
import { Splitter, SplitterPaneProps } from '@progress/kendo-react-layout';
import { Button, Toolbar, ToolbarItem, ToolbarSeparator, ToolbarSpacer } from '@progress/kendo-react-buttons';
import { Notification, NotificationGroup } from '@progress/kendo-react-notification';
import { Dialog, DialogActionsBar } from '@progress/kendo-react-dialogs';
import { ProgressBar } from '@progress/kendo-react-progressbars';
import { uploadIcon, saveIcon, gearIcon, eyeIcon, brushIcon, downloadIcon } from '@progress/kendo-svg-icons';
import { Menu, MenuItemModel } from '@progress/kendo-react-layout';

import { Palette } from './components/Palette';
import { Canvas } from './components/Canvas';
import { PropertyPanel } from './components/PropertyPanel';
import { TemplatesDialog } from './components/TemplatesDialog';
import { DataImport } from './components/DataImport';
import { useAiRecommendations } from './ai/ai';
import { generateReactCode } from './codegen/generate';
import { DashboardNode } from './types';


const initialPanes: SplitterPaneProps[] = [
  { size: '18%', min: '240px', collapsible: true, resizable: true },
  { },
  { size: '24%', min: '280px', collapsible: true, resizable: true }
];

export default function App() {
  const [panes, setPanes] = useState<SplitterPaneProps[]>(initialPanes);
  const [dark, setDark] = useState(true);
  const [nodes, setNodes] = useState<DashboardNode[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [notif, setNotif] = useState<string | null>(null);
  const [showTemplates, setShowTemplates] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [snap, setSnap] = useState<boolean>(true);
  const [zoom, setZoom] = useState<number>(1);
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const [showDelete, setShowDelete] = useState(false);

  const selectedNode = useMemo(() => nodes.find(n => n.id === selectedId) || null, [nodes, selectedId]);

  const { recommendComponents, optimizeLayout } = useAiRecommendations();

  const onExportCode = async () => {
    try {
      setExporting(true);
      setNotif('Export started');
      await new Promise(r => setTimeout(r, 600));
      const code = generateReactCode(nodes);
      const blob = new Blob([code], { type: 'text/plain;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'Dashboard.tsx';
      a.click();
      URL.revokeObjectURL(url);
      setNotif('Export complete');
    } catch (e) {
      setNotif('Export failed');
    } finally {
      setExporting(false);
    }
  };

  const onOptimize = () => {
    const next = optimizeLayout(nodes);
    setNodes(next);
    setNotif('Layout optimized by AI');
  };

  const onRecommend = () => {
    const recs = recommendComponents(nodes);
    if (recs.length > 0) {
      setNodes([...nodes, ...recs]);
      setNotif(`Added ${recs.length} AI-recommended component(s)`);
    } else {
      setNotif('No recommendations at this time');
    }
  };

  const onDeleteSelected = () => {
    if (!selectedId) return;
    setShowDelete(true);
  };

  const onDuplicateSelected = () => {
    if (!selectedId) return;
    const idx = nodes.findIndex(n => n.id === selectedId);
    if (idx < 0) return;
    const n = nodes[idx];
    const dup = { ...n, id: n.id + '_copy', x: Math.min(95, n.x + 2), y: Math.min(95, n.y + 2) };
    setNodes([...nodes, dup]);
    setSelectedId(dup.id);
    setNotif('Component duplicated');
  };

  React.useEffect(() => {
    const cls = document.documentElement.classList;
    if (dark) cls.add('dark'); else cls.remove('dark');
  }, [dark]);

  // Load persisted state
  React.useEffect(() => {
    try {
      const savedNodes = localStorage.getItem('dashboard_nodes');
      const savedPanes = localStorage.getItem('dashboard_panes');
      const savedTheme = localStorage.getItem('dashboard_theme');
      const savedSnap = localStorage.getItem('dashboard_snap');
      const savedZoom = localStorage.getItem('dashboard_zoom');
      if (savedNodes) setNodes(JSON.parse(savedNodes));
      if (savedPanes) setPanes(JSON.parse(savedPanes));
      if (savedTheme) setDark(savedTheme === 'dark');
      if (savedSnap) setSnap(savedSnap === 'true');
      if (savedZoom) setZoom(Number(savedZoom) || 1);
    } catch {}
  }, []);

  // Persist state
  React.useEffect(() => { try { localStorage.setItem('dashboard_nodes', JSON.stringify(nodes)); } catch {} }, [nodes]);
  React.useEffect(() => { try { localStorage.setItem('dashboard_panes', JSON.stringify(panes)); } catch {} }, [panes]);
  React.useEffect(() => { try { localStorage.setItem('dashboard_theme', dark ? 'dark' : 'light'); } catch {} }, [dark]);
  React.useEffect(() => { try { localStorage.setItem('dashboard_snap', String(snap)); } catch {} }, [snap]);
  React.useEffect(() => { try { localStorage.setItem('dashboard_zoom', String(zoom)); } catch {} }, [zoom]);

  // Auto-bind uploaded dataset to selected Grid/Chart
  React.useEffect(() => {
    const handler = (e: any) => {
      const payload = e.detail as { headers: string[]; data: any[] };
      if (!payload || !selectedId) return;
      setNodes(prev => prev.map(n => {
        if (n.id !== selectedId) return n;
        if (n.type === 'Grid') {
          return { ...n, props: { ...n.props, columns: payload.headers, data: payload.data } };
        }
        if (n.type === 'Chart') {
          // Build series for all numeric columns
          const firstRow = payload.data[0] || {};
          const numericFields = payload.headers.filter(h => !isNaN(parseFloat(firstRow[h])));
          const series = numericFields.map(h => ({ type: n.props.series?.[0]?.type || n.props.type || 'column', data: payload.data.map(r => Number(r[h])), field: h }));
          const colors = series.map((_, i) => ['#60a5fa', '#34d399', '#f472b6', '#f59e0b', '#a78bfa', '#22d3ee'][i % 6]);
          const data = series.length === 1 ? series[0].data : series.map(s => s.data);
          return { ...n, props: { ...n.props, data, series, colors } };
        }
        return n;
      }));
      setNotif('Dataset bound to selected component');
    };
    return () => window.removeEventListener('dashboard:dataset' as any, handler);
  }, [selectedId]);

  return (
    <div className="h-full p-3">
      <Toolbar className={`glass card-hover mb-3 ${dark ? 'text-white' : ''}`}>
        <ToolbarItem>
          <Button className={dark ? 'text-white' : ''} svgIcon={uploadIcon} fillMode="flat" title="Import Data" onClick={() => setNotif('Use the Upload panel on the left to import data')} />
        </ToolbarItem>
        <ToolbarItem>
          <Button className={dark ? 'text-white' : ''} svgIcon={saveIcon} fillMode="flat" title="Templates" onClick={() => setShowTemplates(true)} />
        </ToolbarItem>
        <ToolbarSeparator />
        <ToolbarItem>
          <Button className={dark ? 'text-white' : ''} svgIcon={gearIcon} fillMode="flat" title="Optimize Layout (AI)" onClick={onOptimize} />
        </ToolbarItem>
        <ToolbarItem>
          <Button className={dark ? 'text-white' : ''} svgIcon={eyeIcon} fillMode="flat" title="Recommend Components (AI)" onClick={onRecommend} />
        </ToolbarItem>
        <ToolbarSeparator />
        <ToolbarItem>
          <Button className={dark ? 'text-white' : ''} svgIcon={downloadIcon} fillMode="flat" title="Export Code" onClick={onExportCode} />
        </ToolbarItem>
        <ToolbarItem>
          <Button className={dark ? 'text-white' : ''} fillMode="flat" title="Save Dashboard" onClick={() => {
            const state = { nodes, panes, theme: dark ? 'dark' : 'light', snap, zoom };
            const blob = new Blob([JSON.stringify(state, null, 2)], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url; a.download = 'dashboard.json'; a.click(); URL.revokeObjectURL(url);
          }}>Save</Button>
        </ToolbarItem>
        <ToolbarItem>
          <Button className={dark ? 'text-white' : ''} fillMode="flat" title="Load Dashboard" onClick={() => fileInputRef.current?.click()}>Load</Button>
        </ToolbarItem>
        <ToolbarItem>
          <Button className={dark ? 'text-white' : ''} fillMode="flat" title="Duplicate Selected" onClick={onDuplicateSelected} disabled={!selectedId}>Duplicate</Button>
        </ToolbarItem>
        <ToolbarItem>
          <Button className={dark ? 'text-white' : ''} fillMode="flat" title="Delete Selected" onClick={onDeleteSelected} disabled={!selectedId}>Delete</Button>
        </ToolbarItem>
        <ToolbarSeparator />
        <ToolbarItem>
          <Button className={dark ? 'text-white' : ''} fillMode="flat" title="Toggle Snap to Grid" onClick={() => setSnap(s => !s)}>
            {snap ? 'Snap: On' : 'Snap: Off'}
          </Button>
        </ToolbarItem>
        <ToolbarSpacer />
        <ToolbarItem>
          <Button className={dark ? 'text-white' : ''} fillMode="flat" title="Zoom Out" onClick={() => setZoom(z => Math.max(0.5, Math.round((z - 0.1) * 10) / 10))}>-</Button>
        </ToolbarItem>
        <ToolbarItem>
          <span className="text-xs opacity-80">Author: <a href="https://github.com/Boweii22" target="_blank" rel="noopener noreferrer">Bowei Tombri</a></span>
        </ToolbarItem>
        <ToolbarSeparator />
        <ToolbarItem>
          <Button className={dark ? 'text-white' : ''} fillMode="flat" title="Theme" onClick={() => setDark(d => !d)}>{dark ? 'Dark' : 'Light'}</Button>
        </ToolbarItem>
        <ToolbarSpacer />
        <ToolbarItem>
          <Button
            className={dark ? 'text-white' : ''}
            fillMode="flat"
            title="Author"
            onClick={() => setNotif('Author: Bowei Tombri — https://github.com/Boweii22')}
          >Author</Button>
        </ToolbarItem>
      </Toolbar>

      <div className="glass h-[calc(100%-84px)]">
        <Splitter
          panes={panes}
          onChange={(e) => setPanes(e.newState)}
          style={{ height: '100%' }}
        >
          <div className="p-3 h-full overflow-auto">
            <h3 className="text-sm font-semibold opacity-80 mb-2">Palette</h3>
            <Palette />
            <div className="mt-4">
              <h4 className="text-xs font-semibold opacity-80 mb-1">Actions</h4>
              <Menu
                items={[{
                  text: 'Edit Selected',
                  items: [
                    { text: 'Bring to Front', data: { action: 'bring-front' } },
                    { text: 'Duplicate', data: { action: 'duplicate' } },
                    { text: 'Delete', data: { action: 'delete' } }
                  ]
                }]}
                onSelect={(e) => {
                  const action = (e.item as any).data?.action as string | undefined;
                  if (!selectedId || !action) return;
                  if (action === 'bring-front') {
                    const idx = nodes.findIndex(n => n.id === selectedId);
                    if (idx >= 0) {
                      const copy = [...nodes];
                      const [item] = copy.splice(idx, 1);
                      copy.push(item);
                      setNodes(copy);
                    }
                  } else if (action === 'duplicate') {
                    const n = nodes.find(n => n.id === selectedId);
                    if (n) {
                      const dup = { ...n, id: n.id + '_copy', x: Math.min(95, n.x + 2), y: Math.min(95, n.y + 2) };
                      setNodes([...nodes, dup]);
                      setSelectedId(dup.id);
                    }
                  } else if (action === 'delete') {
                    setShowDelete(true);
                  }
                }}
              />
            </div>
            <div className="mt-6">
              <h3 className="text-sm font-semibold opacity-80 mb-2">Data Import</h3>
              <DataImport />
            </div>
          </div>
          <div className="p-3 h-full overflow-hidden">
            <Canvas
              nodes={nodes}
              onChange={setNodes}
              selectedId={selectedId}
              onSelect={setSelectedId}
              snap={snap}
              zoom={zoom}
            />
          </div>
          <div className="p-3 h-full overflow-auto">
            <h3 className="text-sm font-semibold opacity-80 mb-2">Properties</h3>
            <PropertyPanel
              node={selectedNode}
              onChange={(updated) => {
                if (!updated) return;
                setNodes(prev => prev.map(n => n.id === updated.id ? updated : n));
              }}
            />
          </div>
        </Splitter>
      </div>

      <TemplatesDialog open={showTemplates} onClose={() => setShowTemplates(false)} onLoadTemplate={(tpl) => setNodes(tpl)} />

      {showDelete && (
        <Dialog title="Delete Component" onClose={() => setShowDelete(false)} minWidth={360}>
          <div className="p-2 text-sm">
            Are you sure you want to delete the selected component? This action cannot be undone.
          </div>
          <DialogActionsBar>
            <Button fillMode="flat" onClick={() => setShowDelete(false)}>Cancel</Button>
            <Button themeColor="error" onClick={() => {
              if (!selectedId) { setShowDelete(false); return; }
              setNodes(nodes.filter(n => n.id !== selectedId));
              setSelectedId(null);
              setShowDelete(false);
              setNotif('Component deleted');
            }}>Delete</Button>
          </DialogActionsBar>
        </Dialog>
      )}

      <NotificationGroup style={{ position: 'fixed', top: 16, right: 16 }}>
        {notif && (
          <Notification type={{ style: 'info', icon: true }} closable onClose={() => setNotif(null)}>
            <span>{notif}</span>
          </Notification>
        )}
      </NotificationGroup>

      {exporting && (
        <div className="fixed left-0 right-0 bottom-4 flex justify-center">
          <div className="glass px-4 py-3">
            <div className="text-sm mb-2">Exporting...</div>
            <ProgressBar value={70} animation={true} />
          </div>
        </div>
      )}
    </div>
  );
}
