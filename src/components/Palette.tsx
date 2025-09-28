import React from 'react';
import { TreeView, TreeViewExpandChangeEvent } from '@progress/kendo-react-treeview';

const data = [
  {
    text: 'Visualization',
    expanded: true,
    items: [
      { text: 'Chart', type: 'Chart' },
      { text: 'KPI', type: 'KPI' },
    ],
  },
  {
    text: 'Content',
    expanded: true,
    items: [
      { text: 'Card', type: 'Card' },
      { text: 'Text', type: 'Text' },
      { text: 'Image', type: 'Image' },
    ],
  },
  {
    text: 'Data',
    expanded: true,
    items: [
      { text: 'Grid', type: 'Grid' },
    ],
  },
];

export function Palette() {
  const [items, setItems] = React.useState(data);

  const onExpandChange = (e: TreeViewExpandChangeEvent) => {
    const newItems = items.map(group =>
      group.text === e.item.text ? { ...group, expanded: !group.expanded } : group
    );
    setItems(newItems);
  };

  return (
    <div>
      <p className="text-xs opacity-70 mb-2">Drag a component into the canvas</p>
      <TreeView
        data={items}
        expandIcons={true}
        onExpandChange={onExpandChange}
        item={TreeItem}
      />
    </div>
  );
}

function TreeItem(props: any) {
  const { item } = props;
  const isLeaf = !item.items;
  const content = (
    <div
      className={
        'flex items-center justify-between px-2 py-1 rounded ' +
        (isLeaf ? 'cursor-grab hover:bg-white/10' : 'cursor-default')
      }
      role="button"
      aria-grabbed={false}
      draggable={isLeaf}
      onDragStart={(e) => {
        if (!isLeaf) return;
        const t = String(item.type);
        try { e.dataTransfer.setData('text/x-dashboard-type', t); } catch {}
        try { e.dataTransfer.setData('text/plain', t); } catch {}
        try { e.dataTransfer.setData('text', t); } catch {}
        try { (e.dataTransfer as any).effectAllowed = 'copy'; } catch {}
      }}
    >
      <span>{item.text}</span>
    </div>
  );
  return content;
}
