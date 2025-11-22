/**
 * Stock API Service
 * Handles stock operations
 */

import { getAuthHeaders } from './auth';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:8000/api/v1';

/**
 * Get product stock snapshot
 * @returns {Promise<Object>} API response with stock data
 */
export const getStock = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/products_stock`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeaders(),
      },
    });

    const data = await response.json();

    if (response.status === 401) {
      return {
        success: false,
        statusCode: 401,
        message: data.detail || data.message || 'Unauthorized access. Please login again.',
        errors: [],
        data: [],
      };
    }

    if (!response.ok) {
      return {
        success: false,
        statusCode: response.status,
        message: data.detail || data.message || `HTTP error! status: ${response.status}`,
        errors: data.errors || [],
        data: [],
      };
    }

    return { 
      success: true, 
      data: data.data || []
    };
  } catch (error) {
    console.error('Error fetching stock:', error);
    return {
      success: false,
      statusCode: 0,
      message: error.message || 'Network error. Please check your connection.',
      errors: [],
      data: [],
    };
  }
};

/**
 * Get stock summary across warehouses
 * @returns {Promise<Object>} API response with stock summary
 */
export const getStockSummary = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/reports/stock-summary`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeaders(),
      },
    });

    const data = await response.json();

    if (response.status === 401) {
      return {
        success: false,
        statusCode: 401,
        message: data.detail || data.message || 'Unauthorized access. Please login again.',
        errors: [],
        data: [],
      };
    }

    if (!response.ok) {
      return {
        success: false,
        statusCode: response.status,
        message: data.detail || data.message || `HTTP error! status: ${response.status}`,
        errors: data.errors || [],
        data: [],
      };
    }

    return { 
      success: true, 
      data: data.data || []
    };
  } catch (error) {
    console.error('Error fetching stock summary:', error);
    return {
      success: false,
      statusCode: 0,
      message: error.message || 'Network error. Please check your connection.',
      errors: [],
      data: [],
    };
  }
};

/**
 * Get low stock report
 * @param {Object} params - Query parameters (page, limit, warehouse_id)
 * @returns {Promise<Object>} API response with low stock items
 */
export const getLowStock = async (params = {}) => {
  try {
    const queryParams = new URLSearchParams();
    if (params.page) queryParams.append('page', params.page);
    if (params.limit) queryParams.append('limit', params.limit);
    if (params.warehouse_id) queryParams.append('warehouse_id', params.warehouse_id);
    
    const url = `${API_BASE_URL}/reports/low-stock${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeaders(),
      },
    });

    const data = await response.json();

    if (response.status === 401) {
      return {
        success: false,
        statusCode: 401,
        message: data.detail || data.message || 'Unauthorized access. Please login again.',
        errors: [],
        data: [],
      };
    }

    if (!response.ok) {
      return {
        success: false,
        statusCode: response.status,
        message: data.detail || data.message || `HTTP error! status: ${response.status}`,
        errors: data.errors || [],
        data: [],
      };
    }

    return { 
      success: true, 
      data: data.data || [],
      meta: data.meta || { total: 0, page: 1, limit: 25 }
    };
  } catch (error) {
    console.error('Error fetching low stock:', error);
    return {
      success: false,
      statusCode: 0,
      message: error.message || 'Network error. Please check your connection.',
      errors: [],
      data: [],
      meta: { total: 0, page: 1, limit: 25 },
    };
  }
};
