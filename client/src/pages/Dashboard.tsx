import React, { useEffect, useState, useMemo } from 'react';
import Navbar from '../components/Navbar';
import DashboardGrid from '../components/DashboardGrid';
import Chart from '../components/Chart';
import Map, { MapMarker } from '../components/Map';
import DataGrid from '../components/DataGrid';
import WidgetFilter from '../components/WidgetFilter';
import DataFilter from '../components/DataFilter';
import DateRangePicker from '../components/DateRangePicker';
import { useTheme } from '../contexts/ThemeContext';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import socketService from '../services/socket';
import { dataAPI } from '../services/api';
import { useApiOnMount } from '../hooks/useApi';

interface DataSets {
  covid: any[];
  weather: any[];
  stocks: any[];
  countries: any[];
}

interface WidgetType {
  id: string;
  title: string;
  category: string;
  content: React.ReactNode;
}

const Dashboard: React.FC = () => {
  const { theme, toggleTheme } = useTheme();
  const { user } = useAuth();
  const { showToast } = useToast();
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [dashboardWidgets, setDashboardWidgets] = useState<WidgetType[]>([]);
  const [dateRange, setDateRange] = useState<{start: Date | null, end: Date | null}>({
    start: null,
    end: null
  });
  const [dataSets, setDataSets] = useState<DataSets>({
    covid: [],
    weather: [],
    stocks: [],
    countries: []
  });
  
  // Map markers
  const mapMarkers: MapMarker[] = [
    { id: '1', lat: 40.7128, lng: -74.0060, popup: 'New York City' },
    { id: '2', lat: 34.0522, lng: -118.2437, popup: 'Los Angeles' },
    { id: '3', lat: 51.5074, lng: -0.1278, popup: 'London' },
    { id: '4', lat: 35.6762, lng: 139.6503, popup: 'Tokyo' },
    { id: '5', lat: 48.8566, lng: 2.3522, popup: 'Paris' },
  ];

  // Fetch COVID data
  const covidResult = useApiOnMount(
    dataAPI.getSampleData,
    'covid',
    []
  );
  
  // Fetch weather data
  const weatherResult = useApiOnMount(
    dataAPI.getSampleData,
    'weather',
    []
  );
  
  // Fetch stock data
  const stockResult = useApiOnMount(
    dataAPI.getSampleData,
    'stocks',
    []
  );
  
  // Fetch country data
  const countryResult = useApiOnMount(
    dataAPI.getSampleData,
    'countries',
    []
  );

  // Update dataSets when data is loaded
  useEffect(() => {
    const newDataSets = { ...dataSets };
    
    if (covidResult.data?.data) {
      newDataSets.covid = covidResult.data.data;
    }
    
    if (weatherResult.data?.data) {
      newDataSets.weather = weatherResult.data.data;
    }
    
    if (stockResult.data?.data) {
      newDataSets.stocks = stockResult.data.data;
    }
    
    if (countryResult.data?.data) {
      newDataSets.countries = countryResult.data.data;
    }
    
    setDataSets(newDataSets);
  }, [covidResult.data, weatherResult.data, stockResult.data, countryResult.data]);

  // Setup socket connection
  useEffect(() => {
    // Connect to socket when component mounts
    socketService.connect();
    
    // Join demo dashboard
    socketService.joinDashboard('demo');
    
    return () => {
      // Leave dashboard and disconnect when component unmounts
      socketService.leaveDashboard('demo');
      socketService.disconnect();
    };
  }, []);

  // Define dashboard widgets for Overview tab
  const defineWidgets = (): WidgetType[] => {
    const baseWidgets: WidgetType[] = [
      {
        id: 'covid-chart',
        title: 'COVID-19 Statistics',
        category: 'Health',
        content: (
          <div className="h-full">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Global cases trend</h3>
              <div className="flex items-center space-x-2">
                <DateRangePicker
                  startDate={dateRange.start}
                  endDate={dateRange.end}
                  onDatesChange={(start, end) => {
                    setDateRange({ start, end });
                    showToast('Date range updated', { type: 'success' });
                    // In a real app, this would filter the Covid data by date
                  }}
                />
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary-100 text-primary-800 dark:bg-primary-800/30 dark:text-primary-400">
                  <svg className="-ml-0.5 mr-1.5 h-2 w-2 text-primary-500" fill="currentColor" viewBox="0 0 8 8">
                    <circle cx="4" cy="4" r="3" />
                  </svg>
                  Real-time
                </span>
              </div>
            </div>
            <Chart
              type="line"
              data={dataSets.covid}
              xKey="date"
              yKeys={[
                { key: 'cases', color: '#0088FE', name: 'Cases' },
                { key: 'deaths', color: '#FF8042', name: 'Deaths' },
                { key: 'recovered', color: '#00C49F', name: 'Recovered' }
              ]}
              height={250}
            />
          </div>
        )
      },
      {
        id: 'weather-chart',
        title: 'Weather Data',
        category: 'Climate',
        content: (
          <div className="h-full">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Weekly forecast</h3>
              <div className="flex space-x-2">
                <button className="p-1 rounded-md text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white">
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                  </svg>
                </button>
                <button className="p-1 rounded-md text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white">
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
                  </svg>
                </button>
              </div>
            </div>
            <Chart
              type="bar"
              data={dataSets.weather}
              xKey="day"
              yKeys={[
                { key: 'temperature', color: '#FFA500', name: 'Temperature (°C)' },
                { key: 'humidity', color: '#00C49F', name: 'Humidity (%)' },
                { key: 'precipitation', color: '#0088FE', name: 'Precipitation (mm)' }
              ]}
              height={250}
            />
          </div>
        )
      },
      {
        id: 'stock-chart',
        title: 'Stock Market Trends',
        category: 'Finance',
        content: (
          <div className="h-full">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">2023 Tech performance</h3>
              <div className="flex items-center space-x-2">
                <select className="block pl-3 pr-10 py-1 text-xs border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-primary-500 focus:border-primary-500 rounded-md dark:bg-gray-700 dark:text-white">
                  <option>Last 6 months</option>
                  <option>YTD</option>
                  <option>Last 12 months</option>
                </select>
              </div>
            </div>
            <Chart
              type="area"
              data={dataSets.stocks}
              xKey="month"
              yKeys={[
                { key: 'AAPL', color: '#FF8042', name: 'Apple' },
                { key: 'MSFT', color: '#0088FE', name: 'Microsoft' },
                { key: 'GOOGL', color: '#FFBB28', name: 'Google' }
              ]}
              height={250}
            />
          </div>
        )
      },
      {
        id: 'global-map',
        title: 'Global Operations',
        category: 'Geography',
        content: (
          <div className="h-full">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Key location monitoring</h3>
              <div className="flex items-center space-x-2">
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-success-100 text-success-800 dark:bg-success-800/30 dark:text-success-400">
                  All systems operational
                </span>
              </div>
            </div>
            <Map
              markers={mapMarkers}
              center={[20, 0]}
              zoom={2}
              height="250px"
              onMarkerClick={(marker) => console.log(`Clicked marker: ${marker.popup}`)}
            />
          </div>
        )
      },
      {
        id: 'country-data',
        title: 'Global Economic Data',
        category: 'Economics',
        content: (
          <div className="h-full">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Top economies by GDP</h3>
              <div className="flex items-center space-x-2">
                <DataFilter
                  fields={[
                    {
                      field: 'population',
                      label: 'Population',
                      type: 'range',
                      min: 0,
                      max: 1500
                    },
                    {
                      field: 'gdp',
                      label: 'GDP',
                      type: 'range',
                      min: 0,
                      max: 25
                    },
                    {
                      field: 'country',
                      label: 'Country',
                      type: 'search'
                    }
                  ]}
                  onFilterChange={(filters) => {
                    console.log('Filters applied:', filters);
                    // In a real app, this would filter the data
                  }}
                />
              </div>
            </div>
            <DataGrid
              data={dataSets.countries}
              columns={[
                { key: 'country', header: 'Country', width: '35%' },
                { key: 'population', header: 'Population (M)', width: '25%' },
                { key: 'gdp', header: 'GDP (T$)', width: '20%' },
                { key: 'area', header: 'Area (M km²)', width: '20%' }
              ]}
              rowsPerPage={5}
            />
          </div>
        )
      },
      {
        id: 'population-pie',
        title: 'Population Distribution',
        category: 'Demographics',
        content: (
          <div className="h-full">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Top 5 Countries by Population</h3>
              <div className="flex items-center">
                <button className="p-1 rounded-md text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white">
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                </button>
              </div>
            </div>
            <Chart
              type="pie"
              data={dataSets.countries.slice(0, 5)}
              xKey="country"
              yKeys={[
                { key: 'population', color: '#0088FE', name: 'Population' }
              ]}
              height={250}
            />
          </div>
        )
      }
    ];
    
    // Try to get saved layout from localStorage
    const savedLayout = localStorage.getItem('dashboardLayout');
    
    if (savedLayout) {
      try {
        const orderedIds = JSON.parse(savedLayout) as string[];
        const widgetMap = Object.fromEntries(baseWidgets.map(w => [w.id, w]));
        
        // Reconstruct widgets array based on saved order
        const orderedWidgets = orderedIds
          .map(id => widgetMap[id])
          .filter(widget => widget !== undefined); // Filter out any missing widgets
          
        // Add any new widgets that weren't in the saved layout
        const savedIds = new Set(orderedIds);
        const newWidgets = baseWidgets.filter(w => !savedIds.has(w.id));
        
        return [...orderedWidgets, ...newWidgets];
      } catch (e) {
        console.error('Error loading saved layout:', e);
        return baseWidgets;
      }
    }
    
    return baseWidgets;
  };

  // Get unique widget categories
  const widgetCategories = useMemo(() => {
    const categoriesSet = new Set(defineWidgets().map(widget => widget.category));
    return Array.from(categoriesSet);
  }, []);

  // Filter widgets based on selected categories
  const filteredWidgets = useMemo(() => {
    const widgets = defineWidgets();
    if (selectedCategories.length === 0) {
      return widgets;
    }
    return widgets.filter(widget => selectedCategories.includes(widget.category));
  }, [selectedCategories]);

  // Update widgets when data or filters change
  useEffect(() => {
    setDashboardWidgets(filteredWidgets);
  }, [filteredWidgets, dataSets]);

  // Handle filter changes
  const handleFilterChange = (categories: string[]) => {
    setSelectedCategories(categories);
  };

  // Function to reload widgets in default order
  const resetLayout = () => {
    localStorage.removeItem('dashboardLayout');
    setDashboardWidgets(filteredWidgets);
    showToast('Dashboard layout has been reset', { type: 'info' });
  };

  // Show loading indicator if data is not loaded yet
  const isLoading = covidResult.loading || weatherResult.loading || stockResult.loading || countryResult.loading;
  
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="relative">
          <div className="h-24 w-24 rounded-full border-t-4 border-b-4 border-primary-500 animate-spin"></div>
          <div className="absolute inset-0 flex items-center justify-center">
            <svg className="w-12 h-12 text-primary-600" fill="none" viewBox="0 0 24 24">
              <path d="M12 4L4 8L12 12L20 8L12 4Z" fill="currentColor" />
              <path d="M4 12L12 16L20 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M4 16L12 20L20 16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
        </div>
        <p className="ml-4 text-xl font-medium text-gray-500 dark:text-gray-400">Loading dashboard...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white">
      {/* Navbar */}
      <Navbar darkMode={theme === 'dark'} toggleDarkMode={toggleTheme} />

      {/* Main content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Page header */}
        <div className="mb-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between">
            <div className="flex-1 min-w-0">
              <h1 className="text-2xl font-bold leading-7 text-gray-900 dark:text-white sm:text-3xl sm:truncate font-heading">
                Dashboard
              </h1>
              <div className="mt-1 flex flex-col sm:flex-row sm:flex-wrap sm:mt-0 sm:space-x-6">
                <div className="mt-2 flex items-center text-sm text-gray-500 dark:text-gray-400">
                  <svg className="flex-shrink-0 mr-1.5 h-5 w-5 text-gray-400 dark:text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                </div>
                <div className="mt-2 flex items-center text-sm text-gray-500 dark:text-gray-400">
                  <svg className="flex-shrink-0 mr-1.5 h-5 w-5 text-gray-400 dark:text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.121 17.804A13.937 13.937 0 0112 16c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0zm6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Welcome back, {user?.name || 'User'}
                </div>
              </div>
            </div>
            <div className="mt-5 flex lg:mt-0 lg:ml-4">
              <span className="hidden sm:block">
                <button type="button" className="inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 dark:focus:ring-offset-gray-900">
                  <svg className="-ml-1 mr-2 h-5 w-5 text-gray-500 dark:text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  Last 30 Days
                </button>
              </span>

              <span className="ml-3">
                <button type="button" className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 dark:focus:ring-offset-gray-900">
                  <svg className="-ml-1 mr-2 h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  Add Widget
                </button>
              </span>
            </div>
          </div>
          
          {/* Dashboard tabs */}
          <div className="mt-6 border-b border-gray-200 dark:border-gray-700">
            <nav className="-mb-px flex space-x-6">
              <button
                onClick={() => setActiveTab('overview')}
                className={`${
                  activeTab === 'overview'
                    ? 'border-primary-500 text-primary-600 dark:text-primary-400'
                    : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600'
                } whitespace-nowrap pb-4 px-1 border-b-2 font-medium text-sm`}
              >
                Overview
              </button>
              <button
                onClick={() => setActiveTab('analytics')}
                className={`${
                  activeTab === 'analytics'
                    ? 'border-primary-500 text-primary-600 dark:text-primary-400'
                    : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600'
                } whitespace-nowrap pb-4 px-1 border-b-2 font-medium text-sm`}
              >
                Analytics
              </button>
              <button
                onClick={() => setActiveTab('reports')}
                className={`${
                  activeTab === 'reports'
                    ? 'border-primary-500 text-primary-600 dark:text-primary-400'
                    : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600'
                } whitespace-nowrap pb-4 px-1 border-b-2 font-medium text-sm`}
              >
                Reports
              </button>
            </nav>
          </div>
        </div>
        
        {/* Stats cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {statCards.map((card, index) => (
            <div key={index} className="bg-white dark:bg-gray-800 overflow-hidden shadow-soft rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="rounded-md bg-primary-50 dark:bg-primary-900/20 p-3">
                      {card.icon}
                    </div>
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">
                        {card.title}
                      </dt>
                      <dd>
                        <div className="text-lg font-bold text-gray-900 dark:text-white">
                          {card.value}
                        </div>
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 dark:bg-gray-800/50 px-5 py-3">
                <div className="text-sm">
                  <span className={`font-medium ${card.isPositive ? 'text-success-700 dark:text-success-400' : 'text-danger-700 dark:text-danger-400'}`}>
                    {card.change}
                  </span>
                  <span className="text-gray-500 dark:text-gray-400"> from previous period</span>
                </div>
              </div>
            </div>
          ))}
        </div>
        
        {/* Dashboard widgets */}
        {activeTab === 'overview' && (
          <>
            <div className="flex justify-between mb-4">
              <WidgetFilter 
                categories={widgetCategories}
                onFilterChange={handleFilterChange}
              />
              <div className="flex">
                <button
                  onClick={resetLayout}
                  className="btn-outline mr-3 flex items-center"
                >
                  <svg className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  Reset Layout
                </button>
              </div>
            </div>
            <DashboardGrid widgets={dashboardWidgets} />
          </>
        )}
        
        {activeTab === 'analytics' && (
          <div className="text-center py-20">
            <svg className="mx-auto h-12 w-12 text-gray-400 dark:text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
            <h3 className="mt-2 text-xl font-medium text-gray-900 dark:text-white">No analytics available</h3>
            <p className="mt-1 text-gray-500 dark:text-gray-400">Analytics tab is under development.</p>
          </div>
        )}
        
        {activeTab === 'reports' && (
          <div className="text-center py-20">
            <svg className="mx-auto h-12 w-12 text-gray-400 dark:text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h10a2 2 0 012 2v10a2 2 0 01-2 2z" />
            </svg>
            <h3 className="mt-2 text-xl font-medium text-gray-900 dark:text-white">No reports available</h3>
            <p className="mt-1 text-gray-500 dark:text-gray-400">Reports tab is under development.</p>
          </div>
        )}
      </div>
      
      {/* Footer */}
      <footer className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center">
              <svg className="h-8 w-8 text-primary-600 mr-2" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 4L4 8L12 12L20 8L12 4Z" fill="currentColor" />
                <path d="M4 12L12 16L20 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M4 16L12 20L20 16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              <span className="text-lg font-semibold text-gray-800 dark:text-white">DataViz</span>
            </div>
            <p className="mt-4 md:mt-0 text-sm text-gray-500 dark:text-gray-400">
              © {new Date().getFullYear()} DataViz Dashboard. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

// Define statistic cards
const statCards = [
  {
    title: "Total Users",
    value: "2,453",
    change: "+12.5%",
    isPositive: true,
    icon: (
      <svg className="h-6 w-6 text-primary-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
      </svg>
    )
  },
  {
    title: "Revenue",
    value: "$45,231",
    change: "+8.3%",
    isPositive: true,
    icon: (
      <svg className="h-6 w-6 text-success-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    )
  },
  {
    title: "Active Sessions",
    value: "1,257",
    change: "+21.8%",
    isPositive: true,
    icon: (
      <svg className="h-6 w-6 text-secondary-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
      </svg>
    )
  },
  {
    title: "Support Tickets",
    value: "23",
    change: "-5.3%",
    isPositive: false,
    icon: (
      <svg className="h-6 w-6 text-warning-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
      </svg>
    )
  }
];

export default Dashboard;