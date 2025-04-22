import React, { useState } from 'react';

interface WidgetFilterProps {
  categories: string[];
  onFilterChange: (selectedCategories: string[]) => void;
}

const WidgetFilter: React.FC<WidgetFilterProps> = ({ categories, onFilterChange }) => {
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [isOpen, setIsOpen] = useState(false);

  const toggleCategory = (category: string) => {
    const newSelectedCategories = selectedCategories.includes(category)
      ? selectedCategories.filter(c => c !== category)
      : [...selectedCategories, category];
    
    setSelectedCategories(newSelectedCategories);
    onFilterChange(newSelectedCategories);
  };

  const clearFilters = () => {
    setSelectedCategories([]);
    onFilterChange([]);
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="btn-outline flex items-center"
      >
        <svg className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
        </svg>
        Filter Widgets
        {selectedCategories.length > 0 && (
          <span className="ml-2 bg-primary-500 text-white rounded-full h-5 w-5 flex items-center justify-center text-xs">
            {selectedCategories.length}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute mt-2 right-0 w-64 bg-white dark:bg-gray-800 rounded-lg shadow-lg z-10 overflow-hidden">
          <div className="p-3 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
            <h3 className="font-medium text-gray-800 dark:text-white">Filter by Category</h3>
            <button 
              onClick={clearFilters}
              className="text-xs text-primary-600 dark:text-primary-400 hover:text-primary-800 dark:hover:text-primary-300"
            >
              Clear all
            </button>
          </div>
          <div className="p-3">
            {categories.map(category => (
              <div key={category} className="flex items-center py-1">
                <input
                  id={`category-${category}`}
                  type="checkbox"
                  className="form-checkbox h-4 w-4 text-primary-600 border-gray-300 rounded"
                  checked={selectedCategories.includes(category)}
                  onChange={() => toggleCategory(category)}
                />
                <label
                  htmlFor={`category-${category}`}
                  className="ml-2 text-sm text-gray-700 dark:text-gray-300"
                >
                  {category}
                </label>
              </div>
            ))}
          </div>
          <div className="p-3 bg-gray-50 dark:bg-gray-700 flex justify-end">
            <button
              onClick={() => setIsOpen(false)}
              className="text-sm text-primary-600 dark:text-primary-400 font-medium"
            >
              Done
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default WidgetFilter;