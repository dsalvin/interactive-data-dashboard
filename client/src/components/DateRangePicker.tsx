import React, { useState } from 'react';

interface DateRangePickerProps {
  startDate: Date | null;
  endDate: Date | null;
  onDatesChange: (startDate: Date | null, endDate: Date | null) => void;
  className?: string;
}

const DateRangePicker: React.FC<DateRangePickerProps> = ({
  startDate,
  endDate,
  onDatesChange,
  className
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [localStartDate, setLocalStartDate] = useState<string>(
    startDate ? formatDateForInput(startDate) : ''
  );
  const [localEndDate, setLocalEndDate] = useState<string>(
    endDate ? formatDateForInput(endDate) : ''
  );

  // Format date for input field (YYYY-MM-DD)
  function formatDateForInput(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  // Format date for display
  function formatDateForDisplay(dateString: string): string {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  }

  // Handle start date change
  const handleStartDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setLocalStartDate(e.target.value);
  };

  // Handle end date change
  const handleEndDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setLocalEndDate(e.target.value);
  };

  // Apply date range
  const applyDateRange = () => {
    const start = localStartDate ? new Date(localStartDate) : null;
    const end = localEndDate ? new Date(localEndDate) : null;
    onDatesChange(start, end);
    setIsOpen(false);
  };

  // Clear date range
  const clearDateRange = () => {
    setLocalStartDate('');
    setLocalEndDate('');
    onDatesChange(null, null);
    setIsOpen(false);
  };

  // Get display text
  const getDisplayText = () => {
    if (startDate && endDate) {
      return `${formatDateForDisplay(formatDateForInput(startDate))} - ${formatDateForDisplay(formatDateForInput(endDate))}`;
    } else if (startDate) {
      return `From ${formatDateForDisplay(formatDateForInput(startDate))}`;
    } else if (endDate) {
      return `Until ${formatDateForDisplay(formatDateForInput(endDate))}`;
    } else {
      return 'Select date range';
    }
  };

  // Predefined date ranges
  const predefinedRanges = [
    { label: 'Last 7 days', start: -7, end: 0 },
    { label: 'Last 30 days', start: -30, end: 0 },
    { label: 'This month', start: 'month-start', end: 0 },
    { label: 'Last month', start: 'prev-month-start', end: 'prev-month-end' },
    { label: 'This year', start: 'year-start', end: 0 },
  ];

  // Apply predefined range
  const applyPredefinedRange = (start: number | string, end: number | string) => {
    const now = new Date();
    let startDate: Date;
    let endDate: Date = new Date();

    if (typeof start === 'number') {
      startDate = new Date();
      startDate.setDate(startDate.getDate() + start);
    } else if (start === 'month-start') {
      startDate = new Date(now.getFullYear(), now.getMonth(), 1);
    } else if (start === 'prev-month-start') {
      startDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    } else if (start === 'year-start') {
      startDate = new Date(now.getFullYear(), 0, 1);
    } else {
      startDate = new Date();
    }

    if (typeof end === 'number') {
      endDate = new Date();
      endDate.setDate(endDate.getDate() + end);
    } else if (end === 'prev-month-end') {
      endDate = new Date(now.getFullYear(), now.getMonth(), 0);
    }

    setLocalStartDate(formatDateForInput(startDate));
    setLocalEndDate(formatDateForInput(endDate));
  };

  return (
    <div className={`relative ${className}`}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="btn-outline flex items-center"
      >
        <svg className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
        {getDisplayText()}
      </button>

      {isOpen && (
        <div className="absolute mt-2 right-0 w-80 bg-white dark:bg-gray-800 rounded-lg shadow-lg z-10 overflow-hidden">
          <div className="p-3 border-b border-gray-200 dark:border-gray-700">
            <h3 className="font-medium text-gray-800 dark:text-white">Select Date Range</h3>
          </div>
          
          <div className="p-3 space-y-4">
            <div>
              <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Custom Range</h4>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm text-gray-600 dark:text-gray-400 mb-1">Start Date</label>
                  <input
                    type="date"
                    className="block w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                    value={localStartDate}
                    onChange={handleStartDateChange}
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-600 dark:text-gray-400 mb-1">End Date</label>
                  <input
                    type="date"
                    className="block w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                    value={localEndDate}
                    onChange={handleEndDateChange}
                    min={localStartDate}
                  />
                </div>
              </div>
            </div>

            <div>
              <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Predefined Ranges</h4>
              <div className="space-y-2">
                {predefinedRanges.map((range, index) => (
                  <button
                    key={index}
                    onClick={() => applyPredefinedRange(range.start, range.end)}
                    className="block w-full text-left px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md"
                  >
                    {range.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
          
          <div className="p-3 bg-gray-50 dark:bg-gray-700 flex justify-between">
            <button
              onClick={clearDateRange}
              className="px-4 py-2 text-gray-700 dark:text-gray-300 text-sm font-medium hover:text-gray-900 dark:hover:text-white focus:outline-none"
            >
              Clear
            </button>
            <button
              onClick={applyDateRange}
              className="px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white text-sm font-medium rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
            >
              Apply
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default DateRangePicker;