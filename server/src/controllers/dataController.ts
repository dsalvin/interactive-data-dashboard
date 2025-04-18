import { Request, Response } from 'express';
import axios from 'axios';
import DataSource, { IDataSource } from '../models/DataSource';

// Fetch and transform data from a data source
export const fetchData = async (req: Request, res: Response) => {
  try {
    const { sourceId } = req.params;
    const dataSource = await DataSource.findById(sourceId);

    if (!dataSource) {
      return res.status(404).json({
        success: false,
        message: 'Data source not found',
      });
    }

    // Check if user has access to the data source
    if (
      !dataSource.isPublic &&
      dataSource.owner.toString() !== (req as any).user?.id
    ) {
      return res.status(403).json({
        success: false,
        message: 'Access denied',
      });
    }

    // If it's static data, return it directly
    if (dataSource.type === 'static' && dataSource.config.staticData) {
      return res.status(200).json({
        success: true,
        data: dataSource.config.staticData,
      });
    }

    // If it's an API data source, fetch the data
    if (dataSource.type === 'api' && dataSource.config.url) {
      const { url, method, headers, queryParams } = dataSource.config;
      
      const response = await axios({
        method: method || 'GET',
        url,
        headers: headers || {},
        params: queryParams || {},
      });

      let data = response.data;

      // Apply transformation function if provided
      if (dataSource.config.transformFunction) {
        try {
          // Using Function constructor to create a function from string
          // Note: This has security implications in production
          const transformFn = new Function('data', dataSource.config.transformFunction);
          data = transformFn(data);
        } catch (error: any) {
          console.error('Transform function error:', error);
          return res.status(400).json({
            success: false,
            message: 'Error in transform function',
            error: error.message,
          });
        }
      }

      return res.status(200).json({
        success: true,
        data,
      });
    }

    // Handle other data source types (database, websocket) here

    res.status(400).json({
      success: false,
      message: 'Unsupported data source type or missing configuration',
    });
  } catch (error: any) {
    console.error('Error fetching data:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'An error occurred while fetching data',
    });
  }
};

// Create a new data source
export const createDataSource = async (req: Request, res: Response) => {
  try {
    const { name, type, description, config, isPublic } = req.body;
    const userId = (req as any).user.id;

    const dataSource = new DataSource({
      name,
      type,
      description,
      config,
      owner: userId,
      isPublic: isPublic || false,
    });

    await dataSource.save();

    res.status(201).json({
      success: true,
      dataSource,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || 'An error occurred while creating data source',
    });
  }
};

// Get all data sources for a user
export const getUserDataSources = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;

    // Get user's data sources and public data sources
    const dataSources = await DataSource.find({
      $or: [{ owner: userId }, { isPublic: true }],
    });

    res.status(200).json({
      success: true,
      dataSources,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || 'An error occurred while fetching data sources',
    });
  }
};

// Get a single data source
export const getDataSource = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userId = (req as any).user.id;

    const dataSource = await DataSource.findOne({
      _id: id,
      $or: [{ owner: userId }, { isPublic: true }],
    });

    if (!dataSource) {
      return res.status(404).json({
        success: false,
        message: 'Data source not found',
      });
    }

    res.status(200).json({
      success: true,
      dataSource,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || 'An error occurred while fetching data source',
    });
  }
};

// Update a data source
export const updateDataSource = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userId = (req as any).user.id;
    const { name, description, config, isPublic } = req.body;

    // Find the data source and check ownership
    const dataSource = await DataSource.findOne({
      _id: id,
      owner: userId,
    });

    if (!dataSource) {
      return res.status(404).json({
        success: false,
        message: 'Data source not found or you do not have permission to edit',
      });
    }

    // Update fields
    if (name) dataSource.name = name;
    if (description) dataSource.description = description;
    if (config) dataSource.config = { ...dataSource.config, ...config };
    if (typeof isPublic === 'boolean') dataSource.isPublic = isPublic;

    await dataSource.save();

    res.status(200).json({
      success: true,
      dataSource,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || 'An error occurred while updating data source',
    });
  }
};

// Delete a data source
export const deleteDataSource = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userId = (req as any).user.id;

    // Find and delete the data source if user is the owner
    const result = await DataSource.findOneAndDelete({
      _id: id,
      owner: userId,
    });

    if (!result) {
      return res.status(404).json({
        success: false,
        message: 'Data source not found or you do not have permission to delete',
      });
    }

    res.status(200).json({
      success: true,
      message: 'Data source deleted successfully',
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || 'An error occurred while deleting data source',
    });
  }
};

// Get sample data for predefined sources
export const getSampleData = async (req: Request, res: Response) => {
  try {
    const { source } = req.params;
    
    // Sample data for different sources
    const sampleData: Record<string, any> = {
      covid: [
        { date: '2023-01', cases: 1200, deaths: 30, recovered: 900 },
        { date: '2023-02', cases: 1100, deaths: 25, recovered: 950 },
        { date: '2023-03', cases: 900, deaths: 20, recovered: 850 },
        { date: '2023-04', cases: 800, deaths: 15, recovered: 750 },
        { date: '2023-05', cases: 600, deaths: 10, recovered: 550 },
        { date: '2023-06', cases: 400, deaths: 8, recovered: 380 },
      ],
      weather: [
        { day: 'Mon', temperature: 28, humidity: 65, precipitation: 10 },
        { day: 'Tue', temperature: 27, humidity: 68, precipitation: 20 },
        { day: 'Wed', temperature: 30, humidity: 60, precipitation: 5 },
        { day: 'Thu', temperature: 32, humidity: 55, precipitation: 0 },
        { day: 'Fri', temperature: 29, humidity: 70, precipitation: 25 },
        { day: 'Sat', temperature: 26, humidity: 75, precipitation: 30 },
        { day: 'Sun', temperature: 25, humidity: 65, precipitation: 15 },
      ],
      stocks: [
        { month: 'Jan', AAPL: 187, MSFT: 376, GOOGL: 148 },
        { month: 'Feb', AAPL: 190, MSFT: 390, GOOGL: 155 },
        { month: 'Mar', AAPL: 195, MSFT: 385, GOOGL: 160 },
        { month: 'Apr', AAPL: 188, MSFT: 395, GOOGL: 152 },
        { month: 'May', AAPL: 200, MSFT: 405, GOOGL: 165 },
        { month: 'Jun', AAPL: 210, MSFT: 410, GOOGL: 170 },
      ],
      countries: [
        { country: 'USA', population: 331, gdp: 21.4, area: 9.8 },
        { country: 'China', population: 1411, gdp: 14.7, area: 9.6 },
        { country: 'India', population: 1380, gdp: 2.9, area: 3.3 },
        { country: 'Brazil', population: 212, gdp: 1.8, area: 8.5 },
        { country: 'Russia', population: 144, gdp: 1.7, area: 17.1 },
        { country: 'Japan', population: 126, gdp: 5.1, area: 0.4 },
        { country: 'Germany', population: 83, gdp: 3.8, area: 0.4 },
        { country: 'UK', population: 67, gdp: 2.7, area: 0.2 },
        { country: 'France', population: 65, gdp: 2.6, area: 0.6 },
        { country: 'Italy', population: 60, gdp: 1.9, area: 0.3 },
      ],
    };

    if (!sampleData[source]) {
      return res.status(404).json({
        success: false,
        message: 'Sample data source not found',
      });
    }

    res.status(200).json({
      success: true,
      data: sampleData[source],
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || 'An error occurred while fetching sample data',
    });
  }
};