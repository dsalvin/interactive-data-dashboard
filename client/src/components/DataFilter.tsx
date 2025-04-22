import React, { useState, useEffect } from 'react';

interface FilterOption {
  label: string;
  value: string | number;
}

interface FilterField {
  field: string;
  label: string;
  type: 'select' | 'range' | 'date-range' | 'search';
  options?: FilterOption[];
  min?: number;
  max?: number;
}

interface RangeFilter {
  [key: string]: [number | undefined, number | undefined];
}

interface Filters {
  [key: string]: any;
}

interface DataFilterProps {
  fields: FilterField[];
  onFilterChange: (filters: Filters) => void;
  className?: string;
}

const DataFilter: React.FC<DataFilterProps> = ({ fields, onFilterChange, className }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [filters, setFilters] = useState<Filters>({});
  const [activeFilterCount, setActiveFilterCount] = useState(0);

  // Count active filters
  useEffect(() => {
    const count = Object.values(filters).filter(value => {
      if (value === null || value === undefined) return false;
      if (typeof value === 'string' && value.trim() === '') return false;
      if (Array.isArray(value) && value.length === 0) return false;
      return true;
    }).length;
    
    setActiveFilterCount(count);
  }, [filters]);

  const handleFilterChange = (field: string, value: any) => {
    const newFilters = { ...filters, [field]: value };
    
    // Remove empty values
    if (value === '' || value === null || value === undefined || 
        (Array.isArray(value) && value.length === 0)) {
      delete newFilters[field];
    }
    
    setFilters(newFilters);
  };

  const handleSelectChange = (field: string, e: React.ChangeEvent<HTMLSelectElement>) => {
    handleFilterChange(field, e.target.value);
  };

  const handleRangeChange = (field: string, value: [number | undefined, number | undefined]) => {
    handleFilterChange(field, value);
  };

  const handleSearchChange = (field: string, e: React.ChangeEvent<HTMLInputElement>) => {
    handleFilterChange(field, e.target.value);
  };

  const applyFilters = () => {
    onFilterChange(filters);
    setIsOpen(false);
  };

  const clearAllFilters = () => {
    setFilters({});
    onFilterChange({});
  };

  // Render field based on type
  const renderFilterField = (field: FilterField) => {
    switch (field.type) {
      case 'select':
        return (
          <select
            className="block w-full pl-3 pr-10 py-2 text-sm border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-primary-500 focus:border-primary-500"
            value={filters[field.field] || ''}
            onChange={(e) => handleSelectChange(field.field, e)}
          >
            <option value="">All {field.label}</option>
            {field.options?.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        );
      
      case 'range':
        return (
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <input
                type="number"
                className="block w-full px-3 py-2 text-sm border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                placeholder="Min"
                min={field.min}
                max={field.max}
                value={filters[field.field]?.[0] ?? ''}
                onChange={(e) => {
                  const min = e.target.value === '' ? undefined : Number(e.target.value);
                  const currentValues = filters[field.field] || [undefined, undefined];
                  const max = currentValues[1];
                  handleRangeChange(field.field, [min, max]);
                }}
              />
              <span className="text-gray-500 dark:text-gray-400">to</span>
              <input
                type="number"
                className="block w-full px-3 py-2 text-sm border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                placeholder="Max"
                min={field.min}
                max={field.max}
                value={filters[field.field]?.[1] ?? ''}
                onChange={(e) => {
                  const max = e.target.value === '' ? undefined : Number(e.target.value);
                  const currentValues = filters[field.field] || [undefined, undefined];
                  const min = currentValues[0];
                  handleRangeChange(field.field, [min, max]);
                }}
              />
            </div>
          </div>
        );
      
      case 'search':
        return (
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg className="h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <input
              type="text"
              className="block w-full pl-10 pr-3 py-2 text-sm border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-primary-500 focus:border-primary-500"
              placeholder={`Search ${field.label.toLowerCase()}`}
              value={filters[field.field] || ''}
              onChange={(e) => handleSearchChange(field.field, e)}
            />
          </div>
        );
      
      default:
        return null;
    }
  };

  return (
    <div className={`relative ${className}`}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="btn-outline flex items-center"
      >
        <svg className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
        </svg>
        Filter Data
        {activeFilterCount > 0 && (
          <span className="ml-2 bg-primary-500 text-white rounded-full h-5 w-5 flex items-center justify-center text-xs">
            {activeFilterCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute mt-2 right-0 w-80 bg-white dark:bg-gray-800 rounded-lg shadow-lg z-10 overflow-hidden">
          <div className="p-3 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
            <h3 className="font-medium text-gray-800 dark:text-white">Filter Data</h3>
            <button 
              onClick={clearAllFilters}
              className="text-xs text-primary-600 dark:text-primary-400 hover:text-primary-800 dark:hover:text-primary-300"
            >
              Clear all
            </button>
          </div>
          
          <div className="p-3 space-y-4">
            {fields.map((field) => (
              <div key={field.field} className="space-y-1">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  {field.label}
                </label>
                {renderFilterField(field)}
              </div>
            ))}
          </div>
          
          <div className="p-3 bg-gray-50 dark:bg-gray-700 flex justify-end">
            <button
              onClick={applyFilters}
              className="px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white text-sm font-medium rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
            >
              Apply Filters
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default DataFilter;