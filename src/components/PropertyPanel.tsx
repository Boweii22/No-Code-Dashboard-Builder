import React from 'react';
import { TabStrip, TabStripTab } from '@progress/kendo-react-layout';
import { Form, Field } from '@progress/kendo-react-form';
import { ColorPicker } from '@progress/kendo-react-inputs';
import { Input } from '@progress/kendo-react-inputs';
import { DropDownList } from '@progress/kendo-react-dropdowns';
import { MultiSelect } from '@progress/kendo-react-dropdowns';
import { DashboardNode } from '../types';

interface Props {
  node: DashboardNode | null;
  onChange: (node: DashboardNode | null) => void;
}

export function PropertyPanel({ node, onChange }: Props) {
  const [selected, setSelected] = React.useState(0);

  if (!node) {
    return <div className="text-sm opacity-70">Select a component to edit its properties.</div>;
  }

  const update = (patch: Partial<DashboardNode['props']>) => {
    onChange({ ...node, props: { ...node.props, ...patch } });
  };

  return (
    <TabStrip selected={selected} onSelect={(e) => setSelected(e.selected)}>
      <TabStripTab title="General">
        <div className="p-3 space-y-3">
          {/* Presets */}
          {node.type === 'Text' && (
            <div className="flex flex-wrap gap-2">
              <button className="px-2 py-1 glass text-xs" onClick={() => update({ text: 'Section Title', color: '#111827', fontSize: 28, fontWeight: 700, align: 'left' })}>Title</button>
              <button className="px-2 py-1 glass text-xs" onClick={() => update({ text: 'Subtitle', color: '#374151', fontSize: 20, fontWeight: 600, align: 'left' })}>Subtitle</button>
              <button className="px-2 py-1 glass text-xs" onClick={() => update({ text: 'Body text goes here.', color: '#374151', fontSize: 16, fontWeight: 400, align: 'left' })}>Body</button>
            </div>
          )}
          {node.type === 'Card' && (
            <div className="flex flex-wrap gap-2">
              <button className="px-2 py-1 glass text-xs" onClick={() => update({ title: 'Stat', body: 'Description', bgColor: 'rgba(255,255,255,0.06)', textColor: '#e5e7eb', radius: 12, padding: 16, shadow: true })}>Stat</button>
              <button className="px-2 py-1 glass text-xs" onClick={() => update({ title: 'Highlight', body: 'Important info', bgColor: '#1f2937', textColor: '#f9fafb', radius: 14, padding: 18, shadow: true })}>Highlight</button>
              <button className="px-2 py-1 glass text-xs" onClick={() => update({ title: 'Soft', body: 'Subtle look', bgColor: 'rgba(255,255,255,0.35)', textColor: '#111827', radius: 16, padding: 16, shadow: false })}>Soft</button>
            </div>
          )}
          {node.type === 'Image' && (
            <div className="flex flex-wrap gap-2">
              <button className="px-2 py-1 glass text-xs" onClick={() => update({ fit: 'cover', radius: 12, shadow: false })}>Rounded</button>
              <button className="px-2 py-1 glass text-xs" onClick={() => update({ fit: 'contain', radius: 0, shadow: true })}>Polaroid</button>
              <button className="px-2 py-1 glass text-xs" onClick={() => update({ fit: 'cover', radius: 16, shadow: true })}>Shadowed</button>
            </div>
          )}
          {node.type === 'Text' && (
            <>
              <label className="text-xs opacity-70">Text</label>
              <Input value={node.props.text} onChange={(e) => update({ text: e.value })} />
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs opacity-70">Color</label>
                  <ColorPicker value={node.props.color ?? '#111827'} onChange={(e) => update({ color: e.value })} />
                </div>
                <div>
                  <label className="text-xs opacity-70">Font Size (px)</label>
                  <Input type="number" value={node.props.fontSize ?? 18} onChange={(e) => update({ fontSize: Number(e.value) })} />
                </div>
                <div>
                  <label className="text-xs opacity-70">Font Weight</label>
                  <DropDownList
                    data={[{text:'Regular',value:400},{text:'Medium',value:500},{text:'Semibold',value:600},{text:'Bold',value:700}]}
                    textField="text"
                    dataItemKey="value"
                    value={{text:String(node.props.fontWeight ?? 600),value:node.props.fontWeight ?? 600}}
                    onChange={(e)=>update({fontWeight:(e.value as any).value})}
                  />
                </div>
                <div>
                  <label className="text-xs opacity-70">Align</label>
                  <DropDownList
                    data={[{text:'Left',value:'left'},{text:'Center',value:'center'},{text:'Right',value:'right'}]}
                    textField="text"
                    dataItemKey="value"
                    value={{text:String((node.props.align ?? 'left')).replace(/^./,c=>c.toUpperCase()),value:node.props.align ?? 'left'}}
                    onChange={(e)=>update({align:(e.value as any).value})}
                  />
                </div>
              </div>
            </>
          )}
          {node.type === 'Card' && (
            <>
              <label className="text-xs opacity-70">Title</label>
              <Input value={node.props.title} onChange={(e) => update({ title: e.value })} />
              <label className="text-xs opacity-70">Body</label>
              <Input value={node.props.body} onChange={(e) => update({ body: e.value })} />
              <div className="grid grid-cols-2 gap-3 mt-2">
                <div>
                  <label className="text-xs opacity-70">Background</label>
                  <ColorPicker value={node.props.bgColor ?? 'rgba(255,255,255,0.06)'} onChange={(e)=>update({bgColor:e.value})} />
                </div>
                <div>
                  <label className="text-xs opacity-70">Text Color</label>
                  <ColorPicker value={node.props.textColor ?? '#e5e7eb'} onChange={(e)=>update({textColor:e.value})} />
                </div>
                <div>
                  <label className="text-xs opacity-70">Radius (px)</label>
                  <Input type="number" value={node.props.radius ?? 12} onChange={(e)=>update({radius:Number(e.value)})} />
                </div>
                <div>
                  <label className="text-xs opacity-70">Padding (px)</label>
                  <Input type="number" value={node.props.padding ?? 12} onChange={(e)=>update({padding:Number(e.value)})} />
                </div>
                <div className="col-span-2 flex items-center gap-2">
                  <input id="cardShadow" type="checkbox" checked={!!node.props.shadow} onChange={(e)=>update({shadow:e.target.checked})} />
                  <label htmlFor="cardShadow" className="text-xs opacity-80">Shadow</label>
                </div>
              </div>
            </>
          )}
          {node.type === 'KPI' && (
            <>
              <label className="text-xs opacity-70">Label</label>
              <Input value={node.props.label} onChange={(e) => update({ label: e.value })} />
              <label className="text-xs opacity-70">Value</label>
              <Input value={node.props.value} onChange={(e) => update({ value: e.value })} />
              <label className="text-xs opacity-70">Color</label>
              <ColorPicker value={node.props.color} onChange={(e) => update({ color: e.value })} />
            </>
          )}
          {node.type === 'Chart' && (
            <>
              <label className="text-xs opacity-70">Type</label>
              <DropDownList
                data={[{ text: 'Column', value: 'column' }, { text: 'Line', value: 'line' }, { text: 'Area', value: 'area' }]}
                textField="text"
                dataItemKey="value"
                value={{ text: String(node.props.series?.[0]?.type ?? node.props.type ?? 'column').replace(/^./, (c: string) => c.toUpperCase()), value: node.props.series?.[0]?.type ?? node.props.type ?? 'column' }}
                onChange={(e) => {
                  const t = (e.value as any).value;
                  const series = [{ ...(node.props.series?.[0] || {}), type: t, data: node.props.data || node.props.series?.[0]?.data || [1,2,3,4] }];
                  update({ type: t, series });
                }}
              />
              <label className="text-xs opacity-70">Color</label>
              <ColorPicker value={node.props.color || '#60a5fa'} onChange={(e) => update({ color: e.value })} />
              <label className="text-xs opacity-70">Data (comma-separated numbers)</label>
              <Input
                value={(Array.isArray(node.props.data) ? node.props.data : (node.props.series?.[0]?.data || [1,2,3,4])).join(', ')}
                onChange={(e) => {
                  const nums = String(e.value)
                    .split(',')
                    .map(s => parseFloat(s.trim()))
                    .filter(n => !isNaN(n));
                  const series = [{ ...(node.props.series?.[0] || {}), type: node.props.series?.[0]?.type || node.props.type || 'column', data: nums }];
                  update({ data: nums, series });
                }}
              />
            </>
          )}
          {node.type === 'Image' && (
            <>
              <label className="text-xs opacity-70">Source URL</label>
              <Input value={node.props.src} onChange={(e) => update({ src: e.value })} />
              <label className="text-xs opacity-70">Alt text</label>
              <Input value={node.props.alt ?? ''} onChange={(e)=>update({alt:e.value})} />
              <div className="grid grid-cols-2 gap-3 mt-2">
                <div>
                  <label className="text-xs opacity-70">Fit</label>
                  <DropDownList
                    data={[{text:'Cover',value:'cover'},{text:'Contain',value:'contain'},{text:'Fill',value:'fill'}]}
                    textField="text"
                    dataItemKey="value"
                    value={{text:String(node.props.fit ?? 'cover').replace(/^./,c=>c.toUpperCase()),value:node.props.fit ?? 'cover'}}
                    onChange={(e)=>update({fit:(e.value as any).value})}
                  />
                </div>
                <div>
                  <label className="text-xs opacity-70">Radius (px)</label>
                  <Input type="number" value={node.props.radius ?? 12} onChange={(e)=>update({radius:Number(e.value)})} />
                </div>
                <div className="col-span-2 flex items-center gap-2">
                  <input id="imgShadow" type="checkbox" checked={!!node.props.shadow} onChange={(e)=>update({shadow:e.target.checked})} />
                  <label htmlFor="imgShadow" className="text-xs opacity-80">Shadow</label>
                </div>
              </div>
            </>
          )}
        </div>
      </TabStripTab>
      <TabStripTab title="Layout">
        <div className="p-3 grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs opacity-70">X (%)</label>
            <Input type="number" value={node.x} onChange={(e) => onChange({ ...node, x: Number(e.value) })} />
          </div>
          <div>
            <label className="text-xs opacity-70">Y (%)</label>
            <Input type="number" value={node.y} onChange={(e) => onChange({ ...node, y: Number(e.value) })} />
          </div>
          <div>
            <label className="text-xs opacity-70">Width (%)</label>
            <Input type="number" value={node.width} onChange={(e) => onChange({ ...node, width: Number(e.value) })} />
          </div>
          <div>
            <label className="text-xs opacity-70">Height (%)</label>
            <Input type="number" value={node.height} onChange={(e) => onChange({ ...node, height: Number(e.value) })} />
          </div>
        </div>
      </TabStripTab>
      <TabStripTab title="Data">
        <div className="p-3 space-y-3">
          {node.type === 'Chart' && (
            <div>
              <div className="text-xs font-semibold opacity-80 mb-2">Bind from uploaded dataset</div>
              <DatasetChartBinder node={node} onUpdate={(n) => onChange(n)} />
            </div>
          )}
          {node.type === 'Grid' && (
            <div>
              <div className="text-xs font-semibold opacity-80 mb-2">Bind from uploaded dataset</div>
              <DatasetGridBinder node={node} onUpdate={(n) => onChange(n)} />
            </div>
          )}
        </div>
      </TabStripTab>
      <TabStripTab title="Accessibility">
        <div className="p-3 text-sm">
          <ul className="list-disc list-inside space-y-1 text-xs opacity-80">
            <li>Ensure sufficient color contrast.</li>
            <li>Provide descriptive alt text for images.</li>
            <li>Use keyboard navigation to test focus order.</li>
            <li>Label interactive controls with aria-label where necessary.</li>
          </ul>
        </div>
      </TabStripTab>
    </TabStrip>
  );
}

function DatasetChartBinder({ node, onUpdate }: { node: DashboardNode; onUpdate: (n: DashboardNode) => void }) {
  // Read latest dataset
  const datasetRef = React.useRef<{ headers: string[]; data: any[] } | null>(null);
  const [headers, setHeaders] = React.useState<string[]>([]);
  const [category, setCategory] = React.useState<string | null>(null);
  const [seriesFields, setSeriesFields] = React.useState<string[]>([]);

  React.useEffect(() => {
    try {
      const raw = localStorage.getItem('dashboard_dataset');
      if (raw) {
        const parsed = JSON.parse(raw);
        datasetRef.current = parsed;
        setHeaders(parsed.headers || []);
        // Try to infer defaults
        const firstRow = (parsed.data && parsed.data[0]) || {};
        const numeric = (parsed.headers || []).filter((h: string) => !isNaN(parseFloat(firstRow[h])));
        setSeriesFields(numeric.slice(0, 2));
        const firstNonNumeric = (parsed.headers || []).find((h: string) => isNaN(parseFloat(firstRow[h])));
        setCategory(firstNonNumeric || null);
      }
    } catch {}
  }, []);

  const apply = () => {
    const ds = datasetRef.current;
    if (!ds) return;
    const series = seriesFields.map((field) => ({ type: node.props.series?.[0]?.type || node.props.type || 'column', data: ds.data.map((r: any) => Number(r[field])), field }));
    const colors = series.map((_, i) => ['#60a5fa', '#34d399', '#f472b6', '#f59e0b', '#a78bfa', '#22d3ee'][i % 6]);
    const data = series.length === 1 ? series[0].data : series.map((s) => s.data);
    const next: DashboardNode = { ...node, props: { ...node.props, data, series, colors, categoryField: category || undefined } };
    onUpdate(next);
  };

  if (!headers.length) {
    return <div className="text-xs opacity-70">Upload a CSV in the left panel, then select your Chart here.</div>;
  }

  return (
    <div className="space-y-2">
      <label className="text-xs opacity-70">Category field (optional)</label>
      <DropDownList
        data={[{ text: '(none)', value: null }, ...headers.map(h => ({ text: h, value: h }))]}
        textField="text"
        dataItemKey="value"
        value={category ? { text: category, value: category } : { text: '(none)', value: null }}
        onChange={(e) => setCategory((e.value as any)?.value || null)}
      />
      <label className="text-xs opacity-70">Series fields (numeric)</label>
      <MultiSelect
        data={headers}
        value={seriesFields}
        onChange={(e) => setSeriesFields(e.value as string[])}
        placeholder="Select one or more numeric columns"
      />
      <div className="pt-1">
        <button className="px-3 py-1 rounded glass" onClick={apply}>Apply Binding</button>
      </div>
    </div>
  );
}

function DatasetGridBinder({ node, onUpdate }: { node: DashboardNode; onUpdate: (n: DashboardNode) => void }) {
  const [headers, setHeaders] = React.useState<string[]>([]);
  const [selected, setSelected] = React.useState<string[]>([]);
  const [rows, setRows] = React.useState<any[]>([]);

  React.useEffect(() => {
    try {
      const raw = localStorage.getItem('dashboard_dataset');
      if (!raw) return;
      const parsed = JSON.parse(raw);
      const h = parsed.headers || [];
      setHeaders(h);
      setSelected(h);
      setRows(parsed.data || []);
    } catch {}
  }, []);

  const apply = () => {
    const next: DashboardNode = { ...node, props: { ...node.props, columns: selected, data: rows } };
    onUpdate(next);
  };

  if (!headers.length) {
    return <div className="text-xs opacity-70">Upload a CSV in the left panel, then return here to pick Grid columns.</div>;
  }

  return (
    <div className="space-y-2">
      <label className="text-xs opacity-70">Columns</label>
      <MultiSelect data={headers} value={selected} onChange={(e) => setSelected(e.value as string[])} />
      <div className="text-xs opacity-70">Rows: {rows.length}</div>
      <div className="pt-1">
        <button className="px-3 py-1 rounded glass" onClick={apply}>Apply Binding</button>
      </div>
    </div>
  );
}
