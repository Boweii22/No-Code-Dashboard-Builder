export type DashboardComponentType = 'Card' | 'Text' | 'Grid' | 'Chart' | 'Image' | 'KPI';

export interface DashboardNode {
  id: string;
  type: DashboardComponentType;
  x: number; // percentage 0-100
  y: number; // percentage 0-100
  width: number; // percentage 0-100
  height: number; // percentage 0-100
  props: Record<string, any>;
}
