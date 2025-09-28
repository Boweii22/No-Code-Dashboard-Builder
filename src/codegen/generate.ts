import { DashboardNode } from '../types';

export function generateReactCode(nodes: DashboardNode[]) {
  const header = `import React from 'react';\nimport { Grid, GridColumn } from '@progress/kendo-react-grid';\nimport { Chart, ChartSeries, ChartSeriesItem, ChartCategoryAxis, ChartCategoryAxisItem } from '@progress/kendo-react-charts';\n\n// NOTE: This file assumes your project has @progress/kendo-react-grid and @progress/kendo-react-charts installed.\n// npm i @progress/kendo-react-grid @progress/kendo-react-charts @progress/kendo-licensing\n`;

  const body = `export default function Dashboard() {\n  return (\n    <div style={{ position: 'relative', width: '100%', height: '100%', background: '#0b0f17' }}>\n${nodes.map(n => renderNodeBlock(n)).join('\n')}\n    </div>\n  );\n}\n`;

  return header + '\n' + body;
}

function renderNodeBlock(n: DashboardNode): string {
  const container = (inner: string) => `      <div key={"${n.id}"} style={{ position: 'absolute', left: "${n.x}%", top: "${n.y}%", width: "${n.width}%", height: "${n.height}%", borderRadius: 12, background: 'rgba(255,255,255,0.06)', backdropFilter: 'blur(8px)', overflow: 'hidden' }}>\n${inner}\n      </div>`;
  switch (n.type) {
    case 'Text': {
      const color = n.props?.color || '#e5e7eb';
      const text = escapeHtml(n.props?.text ?? 'Heading');
      const inner = `        <div style={{ padding: 8, color: '${color}' }}><div style={{ fontWeight: 600, fontSize: 18 }}>${text}</div></div>`;
      return container(inner);
    }
    case 'Card': {
      const title = escapeHtml(n.props?.title ?? 'Card Title');
      const body = escapeHtml(n.props?.body ?? 'Card content');
      const inner = `        <div style={{ padding: 12 }}><div style={{ opacity: .75, fontSize: 12, marginBottom: 8 }}>${title}</div><div style={{ opacity: .7, fontSize: 12 }}>${body}</div></div>`;
      return container(inner);
    }
    case 'Image': {
      const src = n.props?.src || '';
      const inner = `        <img src="${src}" alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: 12 }} />`;
      return container(inner);
    }
    case 'KPI': {
      const label = escapeHtml(n.props?.label ?? 'KPI');
      const value = escapeHtml(n.props?.value ?? '0');
      const color = n.props?.color || '#10b981';
      const inner = `        <div style={{ padding: 12 }}><div style={{ fontSize: 12, opacity: .6 }}>${label}</div><div style={{ fontSize: 24, fontWeight: 700, color: '${color}' }}>${value}</div></div>`;
      return container(inner);
    }
    case 'Grid': {
      const columns: string[] = Array.isArray(n.props?.columns) ? n.props.columns : [];
      const data: any[] = Array.isArray(n.props?.data) ? n.props.data : [];
      const colsJsx = columns.map(c => `\n            <GridColumn field={"${c}"} title={"${escapeHtml(c)}"} />`).join('');
      const inner = `        <div style={{ width: '100%', height: '100%' }}>\n          <Grid data={${JSON.stringify(data)}} style={{ height: '100%' }}>\n            ${colsJsx}\n          </Grid>\n        </div>`;
      return container(inner);
    }
    case 'Chart': {
      // Expect props.series: [{ type: 'column'|'line'|'area', data: number[], field?: string }]
      const series = Array.isArray(n.props?.series) ? n.props.series : (Array.isArray(n.props?.data) ? [{ type: n.props?.type || 'column', data: n.props.data }] : []);
      const maxLen = Math.max(0, ...series.map((s: any) => (Array.isArray(s?.data) ? s.data.length : 0)));
      const categories = Array.from({ length: maxLen }, (_, i) => i + 1);
      const items = series.map((s: any) => `\n              <ChartSeriesItem type={"${s?.type || 'column'}" data={${JSON.stringify(s?.data || [])}} />`).join('');
      const inner = `        <div style={{ width: '100%', height: '100%', padding: 8, boxSizing: 'border-box' }}>\n          <Chart style={{ height: '100%' }}>\n            <ChartCategoryAxis>\n              <ChartCategoryAxisItem categories={${JSON.stringify(categories)}} />\n            </ChartCategoryAxis>\n            <ChartSeries>\n              ${items}\n            </ChartSeries>\n          </Chart>\n        </div>`;
      return container(inner);
    }
    default: {
      const inner = `        <div />`;
      return container(inner);
    }
  }
}

function escapeHtml(s: string) {
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}
