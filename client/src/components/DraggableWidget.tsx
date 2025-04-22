import React, { useRef } from 'react';
import { useDrag, useDrop, DropTargetMonitor } from 'react-dnd';
import { XYCoord } from 'dnd-core';

const ItemTypes = {
  WIDGET: 'widget',
};

interface DragItem {
  index: number;
  id: string;
  type: string;
}

interface DraggableWidgetProps {
  id: string;
  title: string;
  index: number;
  moveWidget: (dragIndex: number, hoverIndex: number) => void;
  children: React.ReactNode;
}

const DraggableWidget: React.FC<DraggableWidgetProps> = ({ id, title, index, moveWidget, children }) => {
  const ref = useRef<HTMLDivElement>(null);

  const [{ handlerId }, drop] = useDrop<DragItem, void, { handlerId: string | symbol | null }>({
    accept: ItemTypes.WIDGET,
    collect(monitor) {
      return {
        handlerId: monitor.getHandlerId(),
      };
    },
    hover(item: DragItem, monitor: DropTargetMonitor) {
      if (!ref.current) {
        return;
      }
      const dragIndex = item.index;
      const hoverIndex = index;

      // Don't replace items with themselves
      if (dragIndex === hoverIndex) {
        return;
      }

      // Determine rectangle on screen
      const hoverBoundingRect = ref.current?.getBoundingClientRect();

      // Get vertical middle
      const hoverMiddleY = (hoverBoundingRect.bottom - hoverBoundingRect.top) / 2;

      // Get horizontal middle
      const hoverMiddleX = (hoverBoundingRect.right - hoverBoundingRect.left) / 2;

      // Determine mouse position
      const clientOffset = monitor.getClientOffset();

      // Get pixels to the top
      const hoverClientY = (clientOffset as XYCoord).y - hoverBoundingRect.top;

      // Get pixels to the left
      const hoverClientX = (clientOffset as XYCoord).x - hoverBoundingRect.left;

      // Only perform the move when the mouse has crossed half of the items height/width
      // When dragging downward, only move when the cursor is below 50%
      // When dragging upward, only move when the cursor is above 50%
      // Same logic for left/right movement

      const isHorizontalMovement = Math.abs(hoverClientX - hoverMiddleX) > Math.abs(hoverClientY - hoverMiddleY);

      if (isHorizontalMovement) {
        // Horizontal movement logic
        if (
          (dragIndex < hoverIndex && hoverClientX < hoverMiddleX) ||
          (dragIndex > hoverIndex && hoverClientX > hoverMiddleX)
        ) {
          return;
        }
      } else {
        // Vertical movement logic
        if (
          (dragIndex < hoverIndex && hoverClientY < hoverMiddleY) ||
          (dragIndex > hoverIndex && hoverClientY > hoverMiddleY)
        ) {
          return;
        }
      }

      // Time to actually perform the action
      moveWidget(dragIndex, hoverIndex);

      // Note: we're mutating the monitor item here!
      // Generally it's better to avoid mutations,
      // but it's good here for the sake of performance
      // to avoid expensive index searches.
      item.index = hoverIndex;
    },
  });

  const [{ isDragging }, drag] = useDrag({
    type: ItemTypes.WIDGET,
    item: (): DragItem => {
      return { id, index, type: ItemTypes.WIDGET };
    },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  });

  const opacity = isDragging ? 0.5 : 1;
  drag(drop(ref));

  return (
    <div 
      ref={ref} 
      data-handler-id={handlerId}
      className={`bg-white dark:bg-gray-800 rounded-xl shadow-card overflow-hidden h-full transition-all duration-300 hover:shadow-card-hover`}
      style={{ opacity }}
    >
      <div className="p-5">
        <div className="flex items-center justify-between pb-4 border-b border-gray-100 dark:border-gray-700 mb-4">
          <div className="flex items-center">
            {/* Drag handle */}
            <div className="mr-2 cursor-move p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700">
              <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8h16M4 16h16" />
              </svg>
            </div>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">{title}</h2>
          </div>
          <div className="flex items-center space-x-2">
            <button className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 focus:outline-none">
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5v-4m0 4h-4m4 0l-5-5" />
              </svg>
              <span className="sr-only">Fullscreen</span>
            </button>
            <button className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 focus:outline-none">
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
              </svg>
              <span className="sr-only">More options</span>
            </button>
          </div>
        </div>
        <div>{children}</div>
      </div>
    </div>
  );
};

export default DraggableWidget;