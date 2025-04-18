import express from 'express';
import {
  fetchData,
  createDataSource,
  getUserDataSources,
  getDataSource,
  updateDataSource,
  deleteDataSource,
  getSampleData,
} from '../controllers/dataController';
import { protect, restrictTo } from '../middleware/auth';

const router = express.Router();

// Data source routes
router.get('/sources', protect, getUserDataSources);
router.post('/sources', protect, createDataSource);
router.get('/sources/:id', protect, getDataSource);
router.put('/sources/:id', protect, updateDataSource);
router.delete('/sources/:id', protect, deleteDataSource);

// Fetch data from a source
router.get('/fetch/:sourceId', protect, fetchData);

// Sample data routes (no authentication required for demo purposes)
router.get('/sample/:source', getSampleData);

export default router;