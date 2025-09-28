import { DashboardNode } from '../types';

export function useAiRecommendations() {
  const recommendComponents = (nodes: DashboardNode[]): DashboardNode[] => {
    // Simple heuristic stub: if no KPI present, suggest one; if no Text headline, suggest one.
    const ids = new Set(nodes.map(n => n.type));
    const recs: DashboardNode[] = [];
    if (!ids.has('KPI')) {
      recs.push({ id: 'ai_kpi_' + Date.now(), type: 'KPI', x: 4, y: 6, width: 22, height: 16, props: { label: 'AI KPI', value: '42k', color: '#a78bfa' } });
    }
    if (!ids.has('Text')) {
      recs.push({ id: 'ai_text_' + Date.now(), type: 'Text', x: 4, y: 2, width: 40, height: 12, props: { text: 'AI Suggested Title', color: '#ffffff' } });
    }
    return recs;
  };

  const optimizeLayout = (nodes: DashboardNode[]): DashboardNode[] => {
    // Basic grid snap + non-overlapping vertical stacking heuristic.
    let y = 2;
    const margin = 2;
    return nodes.map(n => {
      const w = Math.round(n.width / 2) * 2;
      const h = Math.round(n.height / 2) * 2;
      const next = { ...n, x: Math.min(98 - w, Math.round(n.x / 2) * 2), y, width: w, height: h };
      y += h + margin;
      return next;
    });
  };

  // Nuclia RAG stub for contextual doc assistance
  const askDocs = async (question: string): Promise<string> => {
    // Placeholder: wire up Nuclia SDK/api here using env keys.
    return Promise.resolve(`Doc hint: ${question} -> See KendoReact docs for relevant component usage.`);
  };

  return { recommendComponents, optimizeLayout, askDocs };
}
