import React, { useState, useCallback } from 'react';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import DraggableWidget from './DraggableWidget';
import update from 'immutability-helper';
import { useToast } from '../contexts/ToastContext';

interface Widget {
  id: string;
  title: string;
  content: React.ReactNode;
}

interface DashboardGridProps {
  widgets: Widget[];
}

const DashboardGrid: React.FC<DashboardGridProps> = ({ widgets: initialWidgets }) => {
  const [widgets, setWidgets] = useState<Widget[]>(initialWidgets);

  const moveWidget = useCallback(
    (dragIndex: number, hoverIndex: number) => {
      const draggedWidget = widgets[dragIndex];
      setWidgets(
        update(widgets, {
          $splice: [
            [dragIndex, 1],
            [hoverIndex, 0, draggedWidget],
          ],
        }),
      );
    },
    [widgets],
  );

  const { showToast } = useToast();

  const saveLayout = () => {
    // In a real app, this would save to a backend
    localStorage.setItem('dashboardLayout', JSON.stringify(widgets.map(w => w.id)));
    
    // Show toast notification
    showToast('Dashboard layout saved successfully!', { type: 'success' });
  };

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="mb-4 flex justify-end">
        <button 
          onClick={saveLayout}
          className="btn-primary flex items-center"
        >
          <svg className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
          </svg>
          Save Layout
        </button>
      </div>
      <div className="grid gap-5 grid-cols-1 md:grid-cols-2 xl:grid-cols-3 auto-rows-fr">
        {widgets.map((widget, index) => (
          <DraggableWidget
            key={widget.id}
            id={widget.id}
            title={widget.title}
            index={index}
            moveWidget={moveWidget}
          >
            {widget.content}
          </DraggableWidget>
        ))}
      </div>
    </DndProvider>
  );
};

export default DashboardGrid;