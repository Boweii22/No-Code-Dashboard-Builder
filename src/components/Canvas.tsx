import React from 'react';
import { DashboardNode, DashboardComponentType } from '../types';
import { SimpleChart } from './SimpleChart';
import { Grid, GridColumn } from '@progress/kendo-react-grid';
import { Menu } from '@progress/kendo-react-layout';

interface CanvasProps {
  nodes: DashboardNode[];
  onChange: (nodes: DashboardNode[]) => void;
  selectedId: string | null;
  onSelect: (id: string | null) => void;
  snap?: boolean;
  zoom?: number; // 1 = 100%
}

export function Canvas({ nodes, onChange, selectedId, onSelect, snap = true, zoom = 1 }: CanvasProps) {
  const ref = React.useRef<HTMLDivElement>(null);
  const [menuPos, setMenuPos] = React.useState<{ x: number; y: number } | null>(null);
  const [menuTargetId, setMenuTargetId] = React.useState<string | null>(null);

  const addNodeAt = (type: DashboardComponentType, xPct: number, yPct: number) => {
    const s = snap ? 2 : 0; // 2% grid
    const sx = s ? Math.round(xPct / s) * s : xPct;
    const sy = s ? Math.round(yPct / s) * s : yPct;
    const id = `n_${Date.now().toString(36)}_${Math.floor(Math.random() * 9999)}`;
    const node: DashboardNode = {
      id,
      type,
      x: Math.max(0, Math.min(90, sx)),
      y: Math.max(0, Math.min(90, sy)),
      width: 20,
      height: 20,
      props: defaultPropsFor(type)
    };
    onChange([...nodes, node]);
    onSelect(id);
  };

  const onDrop = (e: React.DragEvent) => {
  e.preventDefault();
  e.stopPropagation();
  const dt = e.dataTransfer;
  const t1 = dt.getData('text/x-dashboard-type');
  const t2 = dt.getData('text/plain');
  const t3 = (dt as any).getData?.('text');
  const type = (t1 || t2 || t3) as DashboardComponentType;
  if (!type) return;
  const rect = ref.current!.getBoundingClientRect();
  const xPct = ((e.clientX - rect.left) / rect.width) * 100;
  const yPct = ((e.clientY - rect.top) / rect.height) * 100;
  addNodeAt(type, xPct, yPct);
};

  const onDragOver = (e: React.DragEvent) => {
  e.preventDefault();
  e.stopPropagation();
  try { (e.dataTransfer as any).dropEffect = 'copy'; } catch {}
};

  // Allow click-to-add from Palette via custom event
  React.useEffect(() => {
    const handler = (e: any) => {
      const type = e.detail?.type as DashboardComponentType | undefined;
      if (!type) return;
      // add at 10%,10% or near center if ref available
      if (ref.current) {
        const rect = ref.current.getBoundingClientRect();
        const xPct = (rect.width * 0.3) / rect.width * 100; // ~30%
        const yPct = (rect.height * 0.2) / rect.height * 100; // ~20%
        addNodeAt(type, xPct, yPct);
      } else {
        addNodeAt(type, 10, 10);
      }
    };
    window.addEventListener('dashboard:add' as any, handler);
    return () => window.removeEventListener('dashboard:add' as any, handler);
  }, [nodes]);

  const startDragNode = (id: string, startX: number, startY: number) => {
    const rect = ref.current!.getBoundingClientRect();
    const node = nodes.find(n => n.id === id)!;
    const init = { x: node.x, y: node.y };
    const onMove = (me: MouseEvent) => {
      const dxPct = ((me.clientX - startX) / rect.width) * 100;
      const dyPct = ((me.clientY - startY) / rect.height) * 100;
      let nx = init.x + dxPct;
      let ny = init.y + dyPct;
      if (snap) {
        nx = Math.round(nx / 2) * 2;
        ny = Math.round(ny / 2) * 2;
      }
      const next = nodes.map(n => n.id === id ? { ...n, x: Math.max(0, Math.min(100 - n.width, nx)), y: Math.max(0, Math.min(100 - n.height, ny)) } : n);
      onChange(next);
    };
    const onUp = () => {
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onUp);
    };
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
  };

  const startResizeNode = (id: string, startX: number, startY: number) => {
    const rect = ref.current!.getBoundingClientRect();
    const node = nodes.find(n => n.id === id)!;
    const init = { w: node.width, h: node.height };
    const onMove = (me: MouseEvent) => {
      const dwPct = ((me.clientX - startX) / rect.width) * 100;
      const dhPct = ((me.clientY - startY) / rect.height) * 100;
      let nw = init.w + dwPct;
      let nh = init.h + dhPct;
      if (snap) {
        nw = Math.round(nw / 2) * 2;
        nh = Math.round(nh / 2) * 2;
      }
      const next = nodes.map(n => n.id === id ? { ...n, width: Math.min(100 - n.x, Math.max(8, nw)), height: Math.min(100 - n.y, Math.max(8, nh)) } : n);
      onChange(next);
    };
    const onUp = () => {
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onUp);
    };
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
  };

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (!selectedId) return;
    const idx = nodes.findIndex(n => n.id === selectedId);
    if (idx < 0) return;
    const step = e.shiftKey ? 4 : 1;
    const grid = snap ? 2 : 1;
    const move = (dx: number, dy: number) => {
      const n = nodes[idx];
      const nx = Math.max(0, Math.min(100 - n.width, n.x + dx * (snap ? grid : step)));
      const ny = Math.max(0, Math.min(100 - n.height, n.y + dy * (snap ? grid : step)));
      const next = [...nodes];
      next[idx] = { ...n, x: nx, y: ny };
      onChange(next);
    };
    // Shortcuts
    if (e.ctrlKey && (e.key === ']' || e.key === '}')) {
      e.preventDefault();
      const copy = [...nodes];
      const [item] = copy.splice(idx, 1);
      copy.push(item);
      onChange(copy);
      return;
    }
    if (e.ctrlKey && (e.key.toLowerCase() === 'd')) {
      e.preventDefault();
      const n = nodes[idx];
      const dup = { ...n, id: n.id + '_copy', x: Math.min(95, n.x + 2), y: Math.min(95, n.y + 2) };
      onChange([...nodes, dup]);
      onSelect(dup.id);
      return;
    }
    if (e.key === 'ArrowLeft') { e.preventDefault(); move(-1, 0); }
    else if (e.key === 'ArrowRight') { e.preventDefault(); move(1, 0); }
    else if (e.key === 'ArrowUp') { e.preventDefault(); move(0, -1); }
    else if (e.key === 'ArrowDown') { e.preventDefault(); move(0, 1); }
    else if (e.key === 'Delete' || e.key === 'Backspace') {
      e.preventDefault();
      onChange(nodes.filter(n => n.id !== selectedId));
      onSelect(null);
    }
  };

  return (
    <div className="relative w-full h-full rounded-lg overflow-auto" onKeyDown={onKeyDown} tabIndex={0} aria-label="Canvas workspace">
      <div
        ref={ref}
        className="relative rounded-lg"
        style={{ width: '100%', height: '100%' }}
        onDrop={onDrop}
        onDragOver={onDragOver}
      >
        <GridBg zoom={zoom} onDrop={onDrop} onDragOver={onDragOver} />

        {nodes.map(n => (
        <div
          key={n.id}
          className={`absolute rounded-lg border ${selectedId === n.id ? 'border-blue-500' : 'border-transparent'} card-hover`}
          style={{
            left: `${n.x}%`,
            top: `${n.y}%`,
            width: `${n.width}%`,
            height: `${n.height}%`,
            background: 'var(--glass-bg)',
            backdropFilter: 'blur(6px)',
            boxShadow: 'inset 0 0 0 1px rgba(0,0,0,0.1)'
          }}
          onMouseDown={(e) => {
            if ((e.target as HTMLElement).closest('[data-resize]')) return;
            onSelect(n.id);
            startDragNode(n.id, e.clientX, e.clientY);
          }}
          onDoubleClick={() => onSelect(n.id)}
          onContextMenu={(e) => {
            e.preventDefault();
            setMenuTargetId(n.id);
            setMenuPos({ x: e.clientX, y: e.clientY });
          }}
          aria-label={`${n.type} component`}
          tabIndex={0}
        >
          <ComponentPreview node={n} />
          <div
            data-resize
            className="absolute right-0 bottom-0 w-4 h-4 bg-blue-500/70 rounded-br cursor-se-resize"
            onMouseDown={(e) => {
              e.stopPropagation();
              startResizeNode(n.id, e.clientX, e.clientY);
            }}
            aria-label="Resize handle"
          />
        </div>
        ))}

        {menuPos && (
          <div style={{ position: 'fixed', left: menuPos.x, top: menuPos.y, zIndex: 20 }}>
            <Menu
              items={[{
                text: 'Edit',
                items: [
                  { text: 'Bring to Front', data: { action: 'front' } },
                  { text: 'Duplicate', data: { action: 'dup' } },
                  { text: 'Delete', data: { action: 'del' } }
                ]
              }]}
              onSelect={(ev: any) => {
                const action = ev.item?.data?.action as string | undefined;
                if (!action || !menuTargetId) { setMenuPos(null); return; }
                if (action === 'front') {
                  const idx = nodes.findIndex(n => n.id === menuTargetId);
                  if (idx >= 0) {
                    const copy = [...nodes];
                    const [item] = copy.splice(idx, 1);
                    copy.push(item);
                    onChange(copy);
                  }
                } else if (action === 'dup') {
                  const n = nodes.find(x => x.id === menuTargetId);
                  if (n) {
                    const dup = { ...n, id: n.id + '_copy', x: Math.min(95, n.x + 2), y: Math.min(95, n.y + 2) };
                    onChange([...nodes, dup]);
                  }
                } else if (action === 'del') {
                  onChange(nodes.filter(n => n.id !== menuTargetId));
                  if (selectedId === menuTargetId) onSelect(null);
                }
                setMenuPos(null);
              }}
            />
          </div>
        )}
      </div>
    </div>
  );
}

function defaultPropsFor(type: DashboardComponentType) {
  switch (type) {
    case 'Text': return { text: 'Heading', align: 'left', color: '#111827' };
    case 'Card': return { title: 'Card Title', body: 'Card content', color: '#111827' };
    case 'Grid': return { columns: [], data: [] };
    case 'Image': return { src: 'https://picsum.photos/400/200', fit: 'cover' };
    case 'KPI': return { label: 'Revenue', value: '123k', color: '#10b981' };
    case 'Chart': return { series: [{ type: 'column', data: [1,2,3,4] }], categoryField: 'cat' };
    default: return {};
  }
}

function ComponentPreview({ node }: { node: DashboardNode }) {
  const { type, props } = node;
  if (type === 'Text') {
    return (
      <div
        className="p-2 w-full h-full flex items-center"
        style={{ justifyContent: props.align === 'center' ? 'center' : props.align === 'right' ? 'flex-end' : 'flex-start' }}
      >
        <div
          style={{
            color: props.color ?? '#111827',
            fontSize: props.fontSize ?? 18,
            fontWeight: props.fontWeight ?? 600,
            textAlign: props.align ?? 'left',
            width: '100%'
          }}
        >
          {props.text}
        </div>
      </div>
    );
  }
  if (type === 'Card') {
    return (
      <div
        className="w-full h-full"
        style={{
          background: props.bgColor ?? 'var(--glass-bg)',
          color: props.textColor ?? 'inherit',
          borderRadius: props.radius ?? 12,
          padding: props.padding ?? 12,
          boxShadow: props.shadow ? '0 10px 25px rgba(0,0,0,0.35)' : 'none'
        }}
      >
        <div className="mb-2" style={{ opacity: 0.85, fontSize: 13, fontWeight: 600 }}>{props.title}</div>
        <div style={{ opacity: 0.75, fontSize: 12 }}>{props.body}</div>
      </div>
    );
  }
  if (type === 'Image') {
    return (
      <img
        src={props.src}
        alt={props.alt || ''}
        className="w-full h-full"
        style={{
          objectFit: props.fit ?? 'cover',
          borderRadius: props.radius ?? 12,
          boxShadow: props.shadow ? '0 10px 25px rgba(0,0,0,0.35)' : 'none'
        }}
      />
    );
  }
  if (type === 'KPI') {
    const [val, setVal] = React.useState<number>(0);
    const target = Number(String(props.value).replace(/[^0-9.-]/g, '')) || 0;
    React.useEffect(() => {
      let raf = 0;
      const start = performance.now();
      const dur = 600;
      const tick = (t: number) => {
        const p = Math.min(1, (t - start) / dur);
        setVal(Math.round(target * (0.2 + 0.8 * p)));
        if (p < 1) raf = requestAnimationFrame(tick);
      };
      raf = requestAnimationFrame(tick);
      return () => cancelAnimationFrame(raf);
    }, [target]);
    return (
      <div className="p-3 w-full h-full flex flex-col items-start justify-center">
        <div className="text-xs opacity-60">{props.label}</div>
        <div className="text-2xl font-bold" style={{ color: props.color }}>{isNaN(target) ? props.value : val.toLocaleString()}</div>
      </div>
    );
  }
  if (type === 'Grid') {
    const cols: string[] = Array.isArray(props.columns) ? props.columns : Object.keys((props.data?.[0] || {}));
    const rows: any[] = Array.isArray(props.data) ? props.data : [];
    const empty = cols.length === 0 || rows.length === 0;
    return (
      <div className="w-full h-full overflow-hidden">
        {empty ? (
          <div className="p-3 text-xs opacity-70">
            {cols.length === 0 ? 'No columns selected. Open Properties → Data and choose columns, or upload a dataset.' : null}
            {cols.length > 0 && rows.length === 0 ? 'No rows to display. Upload a dataset or bind rows from the Data tab.' : null}
          </div>
        ) : (
          <Grid data={rows} style={{ height: '100%' }}>
            {cols.map((c) => (
              <GridColumn key={c} field={c} title={c} />
            ))}
          </Grid>
        )}
      </div>
    );
  }
  if (type === 'Chart') {
    const data = Array.isArray(props.data) ? props.data : (props.series?.[0]?.data ?? [1,2,3,4]);
    const chartType = props.series?.[0]?.type ?? props.type ?? 'column';
    const colors = Array.isArray(props.colors) ? props.colors : [props.color || '#60a5fa'];
    return <SimpleChart data={data} type={chartType} colors={colors} />;
  }
  return null;
}

function GridBg({ zoom, onDrop, onDragOver }: { zoom: number; onDrop?: (e: React.DragEvent) => void; onDragOver?: (e: React.DragEvent) => void }) {
  return (
    <div
      aria-hidden
      className="absolute inset-0 rounded-lg"
      style={{
        backgroundImage: `linear-gradient(var(--grid-line-color) 1px, transparent 1px), linear-gradient(90deg, var(--grid-line-color) 1px, transparent 1px)`,
        backgroundSize: `${20 / zoom}px ${20 / zoom}px`,
        backgroundPosition: '0 0, 0 0'
      }}
      onDrop={onDrop}
      onDragOver={onDragOver}
    />
  );
}
