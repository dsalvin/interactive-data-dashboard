import React from 'react';

interface WidgetProps {
  id: string;
  title: string;
  children: React.ReactNode;
}

const Widget: React.FC<WidgetProps> = ({ id, title, children }) => {
  return (
    <div id={id} className="bg-white dark:bg-gray-800 rounded-xl shadow-card overflow-hidden h-full transition-shadow duration-300 hover:shadow-card-hover">
      <div className="p-5">
        <div className="flex items-center justify-between pb-4 border-b border-gray-100 dark:border-gray-700 mb-4">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">{title}</h2>
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

interface DashboardGridProps {
  widgets: {
    id: string;
    title: string;
    content: React.ReactNode;
  }[];
}

const DashboardGrid: React.FC<DashboardGridProps> = ({ widgets }) => {
  return (
    <div className="grid gap-5 grid-cols-1 md:grid-cols-2 xl:grid-cols-3 auto-rows-fr">
      {widgets.map((widget) => (
        <Widget key={widget.id} id={widget.id} title={widget.title}>
          {widget.content}
        </Widget>
      ))}
    </div>
  );
};

export default DashboardGrid;